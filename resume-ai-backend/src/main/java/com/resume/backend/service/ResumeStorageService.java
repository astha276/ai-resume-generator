// responsible for CRUD operations. create, read, update, delete resumes and managing there json content 
/*Manages resume CRUD
Validates & processes JSON content
Connects Controller <-> Repository */
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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Service // automatically creates object and manages it
/*
1.Spring sees @Service
2.Creates a bean of UserService
3.When it sees @Autowired, it:
    Looks for a matching bean
    Injects it automatically into UserController */
public class ResumeStorageService {

    @Autowired // dependency injection of resumeRepository
    private ResumeRepository resumeRepository; //queries are there in the repository interface. we just call those methods here.

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper; // for JSON parsing. it converts java object to json strings.

    @Autowired
    private S3Service s3Service; // uploads resume JSON to S3 and generates presigned download links

    @Transactional // ensures that the entire method runs in a transaction. if any exception occurs, it rolls back all changes to maintain data integrity.
    public ResumeResponseDTO saveResume(String userEmail, ResumeSaveRequest request) { // used when saving from the UI, where we have a structured request object
        // dto - data transfer object. we use it to transfer data between layers.(contoller <-> server <-> client)
        // Instead of sending your database entity (Resume) directly: You create a separate object (DTO)
        // help decouple the internal entity structure from the API and ensure only required and safe data is sent between client and server
        // this is coming from frontend to save the resume
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // dto gives resume from frontend -> resume entity gets the data from dto -> resume entity is saved to database through repository -> saved resume entity is converted back to dto and sent to frontend. 
        Resume resume = new Resume();
        resume.setUser(user); // gotten these from @data in Resume 
        resume.setTitle(request.getTitle());
        resume.setUserDescription(request.getUserDescription());
        resume.setGeneratedContent(request.getGeneratedContent());
        resume.setTags(request.getTags());
        resume.setFavorite(request.isFavorite());
        resume.setFileFormat(request.getFileFormat() != null ? request.getFileFormat() : "json");
        resume.setAiModel("deepseek-r1:1.5b"); 

        Resume savedResume = resumeRepository.save(resume);// .save from JpaRepository. resumerepository inherits from JpaRepository.
        return convertToDTO(savedResume); // function defined below
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

        // Upload the generated content to S3, then save the S3 key back to this resume row
        try {
            String s3Key = "resumes/" + user.getId() + "/" + savedResume.getId() + ".json";
            s3Service.uploadFile(generatedContent.getBytes(), s3Key);
            savedResume.setS3ObjectKey(s3Key);
            resumeRepository.save(savedResume); // update the row with the S3 key
            System.out.println("✓ Uploaded to S3 with key: " + s3Key);
        } catch (Exception e) {
            // Don't fail the whole resume save if S3 upload fails — the JSON is already
            // safely in MySQL either way. Just log it so we know S3 needs attention.
            System.err.println("✗ S3 upload failed: " + e.getMessage());
        }

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

    // Add this method to update generated content
    @Transactional
    public ResumeResponseDTO updateGeneratedContent(String userEmail, Long resumeId, String updatedContent) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Resume resume = resumeRepository.findByIdAndUser(resumeId, user)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        resume.setGeneratedContent(updatedContent);
        Resume updatedResume = resumeRepository.save(resume);

        System.out.println("✓ Resume content updated for ID: " + resumeId);
        return convertToDTO(updatedResume);
    }

    // Add this method to update a specific section
    @Transactional
    public ResumeResponseDTO updateSection(String userEmail, Long resumeId, String section, String sectionContent) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Resume resume = resumeRepository.findByIdAndUser(resumeId, user)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        try {
            // Parse existing content
            ObjectMapper mapper = new ObjectMapper();
            JsonNode fullContent = mapper.readTree(resume.getGeneratedContent());

            // Create or update the specific section
            ObjectNode contentNode;
            if (fullContent.isObject()) {
                contentNode = (ObjectNode) fullContent;
            } else {
                contentNode = mapper.createObjectNode();
            }

            // Parse the section content
            JsonNode sectionNode = mapper.readTree(sectionContent);
            contentNode.set(section, sectionNode);

            // Save back
            resume.setGeneratedContent(mapper.writeValueAsString(contentNode));
            Resume updatedResume = resumeRepository.save(resume);

            System.out.println("✓ Section '" + section + "' updated for resume ID: " + resumeId);
            return convertToDTO(updatedResume);

        } catch (Exception e) {
            throw new RuntimeException("Failed to update section: " + e.getMessage(), e);
        }
    }

    // Add this method to add/remove skills
    @Transactional
    public ResumeResponseDTO updateSkills(String userEmail, Long resumeId, List<Map<String, String>> skills) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Resume resume = resumeRepository.findByIdAndUser(resumeId, user)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode fullContent = mapper.readTree(resume.getGeneratedContent());
            ObjectNode contentNode = fullContent.isObject() ? (ObjectNode) fullContent : mapper.createObjectNode();

            // Convert skills list to JsonNode
            ArrayNode skillsNode = mapper.createArrayNode();
            for (Map<String, String> skill : skills) {
                ObjectNode skillNode = mapper.createObjectNode();
                skillNode.put("title", skill.getOrDefault("title", ""));
                skillNode.put("level", skill.getOrDefault("level", ""));
                skillsNode.add(skillNode);
            }

            contentNode.set("skills", skillsNode);
            resume.setGeneratedContent(mapper.writeValueAsString(contentNode));

            Resume updatedResume = resumeRepository.save(resume);
            return convertToDTO(updatedResume);

        } catch (Exception e) {
            throw new RuntimeException("Failed to update skills: " + e.getMessage(), e);
        }
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
                .s3ObjectKey(resume.getS3ObjectKey())
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
