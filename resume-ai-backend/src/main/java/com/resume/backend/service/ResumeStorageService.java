package com.resume.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resume.backend.dto.ResumeResponseDTO;
import com.resume.backend.dto.ResumeSaveRequest;
import com.resume.backend.dto.ResumeUpdateRequest;
import com.resume.backend.entity.Resume;
import com.resume.backend.entity.User;
import com.resume.backend.repository.ResumeRepository;
import com.resume.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ResumeStorageService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public ResumeResponseDTO saveResume(String userEmail, ResumeSaveRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Resume resume = new Resume();
        resume.setUser(user);
        resume.setTitle(request.getTitle());
        resume.setUserDescription(request.getUserDescription());
        resume.setGeneratedContent(request.getGeneratedContent());
        resume.setTags(request.getTags());
        resume.setFavorite(request.isFavorite());
        resume.setFileFormat(request.getFileFormat() != null ? request.getFileFormat() : "json");
        resume.setAiModel("deepseek-r1:1.5b");

        Resume savedResume = resumeRepository.save(resume);
        return convertToDTO(savedResume);
    }

    @Transactional
    public ResumeResponseDTO saveGeneratedResume(String userEmail, String description, String generatedContent, String title) {
        System.out.println("========== SAVING RESUME ==========");
        System.out.println("User: " + userEmail);
        System.out.println("Title: " + title);

        // Validate JSON before saving
        try {
            // Try to parse the JSON to ensure it's valid
            objectMapper.readTree(generatedContent);
            System.out.println("✓ JSON is valid");
        } catch (Exception e) {
            System.err.println("✗ Invalid JSON detected!");
            System.err.println("Error: " + e.getMessage());
            System.err.println("Content: " + generatedContent);

            // Reject the save with invalid JSON
            throw new RuntimeException("Cannot save invalid JSON: " + e.getMessage());
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create a title if not provided
        if (title == null || title.isEmpty()) {
            title = description != null && description.length() > 50
                    ? description.substring(0, 50) + "..."
                    : (description != null ? description : "Resume - " + LocalDate.now());
        }

        Resume resume = new Resume();
        resume.setUser(user);
        resume.setTitle(title);
        resume.setUserDescription(description);
        resume.setGeneratedContent(generatedContent);
        resume.setFileFormat("json");
        resume.setAiModel("deepseek-r1:1.5b");
        resume.setFavorite(false);

        Resume savedResume = resumeRepository.save(resume);
        System.out.println("✓ Resume saved with ID: " + savedResume.getId());

        return convertToDTO(savedResume);
    }

    public List<ResumeResponseDTO> getUserResumes(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return resumeRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ResumeResponseDTO> getRecentResumes(String userEmail, int limit) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PageRequest pageRequest = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        return resumeRepository.findByUser(user, pageRequest)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ResumeResponseDTO> getFavoriteResumes(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return resumeRepository.findByUserAndIsFavoriteTrueOrderByCreatedAtDesc(user)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ResumeResponseDTO> searchResumes(String userEmail, String searchTerm) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getUserResumes(userEmail);
        }

        return resumeRepository.searchResumes(user, searchTerm.trim())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ResumeResponseDTO getResumeById(String userEmail, Long resumeId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Resume resume = resumeRepository.findByIdAndUser(resumeId, user)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        return convertToDTO(resume);
    }

    @Transactional
    public ResumeResponseDTO updateResume(String userEmail, Long resumeId, ResumeUpdateRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Resume resume = resumeRepository.findByIdAndUser(resumeId, user)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            resume.setTitle(request.getTitle().trim());
        }
        if (request.getTags() != null) {
            resume.setTags(request.getTags().trim());
        }
        if (request.getIsFavorite() != null) {
            resume.setFavorite(request.getIsFavorite());
        }

        Resume updatedResume = resumeRepository.save(resume);
        return convertToDTO(updatedResume);
    }

    @Transactional
    public void deleteResume(String userEmail, Long resumeId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Resume resume = resumeRepository.findByIdAndUser(resumeId, user)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        resumeRepository.delete(resume);
    }

    @Transactional
    public void toggleFavorite(String userEmail, Long resumeId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Resume resume = resumeRepository.findByIdAndUser(resumeId, user)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        resume.setFavorite(!resume.isFavorite());
        resumeRepository.save(resume);
    }

    public Map<String, Object> getUserStats(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalResumes", resumeRepository.countByUser(user));
        stats.put("favoriteResumes", resumeRepository.countByUserAndIsFavoriteTrue(user));

        // Get latest resume
        List<Resume> latest = resumeRepository.findTop5ByUserOrderByCreatedAtDesc(user);
        if (!latest.isEmpty()) {
            stats.put("latestResume", convertToDTO(latest.get(0)));
        }

        return stats;
    }

    private ResumeResponseDTO convertToDTO(Resume resume) {
        ResumeResponseDTO dto = ResumeResponseDTO.builder()
                .id(resume.getId())
                .title(resume.getTitle())
                .userDescription(resume.getUserDescription())
                .tags(resume.getTags())
                .isFavorite(resume.isFavorite())
                .fileFormat(resume.getFileFormat())
                .aiModel(resume.getAiModel())
                .createdAt(resume.getCreatedAt())
                .updatedAt(resume.getUpdatedAt())
                .build();

        // Parse generated content
        try {
            dto.setGeneratedContent(objectMapper.readValue(resume.getGeneratedContent(), Object.class));
        } catch (JsonProcessingException e) {
            // If not JSON, keep as string
            dto.setGeneratedContent(resume.getGeneratedContent());
        }

        return dto;
    }
}