package com.resume.backend.controller;

import com.resume.backend.dto.ErrorResponse;
import com.resume.backend.dto.JobTargetRequest;
import com.resume.backend.dto.ResumeSuggestionDTO;
import com.resume.backend.service.ResumeSuggestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;

@RestController
@RequestMapping("/api/v1/suggestions")
@CrossOrigin(origins = "http://localhost:5173")
public class ResumeSuggestionController {

    @Autowired
    private ResumeSuggestionService suggestionService;

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeResumeForJob(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody JobTargetRequest request) {

        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse(LocalDateTime.now(), 401, "Unauthorized",
                                "You must be logged in", "/api/v1/suggestions/analyze"));
            }

            ResumeSuggestionDTO suggestions = suggestionService.analyzeResumeForJob(
                    userDetails.getUsername(),
                    request
            );

            return ResponseEntity.ok(suggestions);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(LocalDateTime.now(), 500, "Analysis Failed",
                            e.getMessage(), "/api/v1/suggestions/analyze"));
        }
    }

    @GetMapping("/sample")
    public ResponseEntity<?> getSampleSuggestions(@AuthenticationPrincipal UserDetails userDetails) {
        // For testing without AI
        ResumeSuggestionDTO sample = ResumeSuggestionDTO.builder()
                .jobTitle("Senior Java Developer")
                .matchPercentage(75)
                .overallAssessment("Good foundation, but missing cloud experience")
                .matchingSkills(Arrays.asList("Java", "Spring Boot", "SQL"))
                .missingCriticalSkills(Arrays.asList("Kubernetes", "Docker", "AWS"))
                .experienceGaps(Arrays.asList("No microservices experience", "Limited team leadership"))
                .experienceHighlights(Arrays.asList("Strong backend development", "Performance optimization"))
                .recommendedKeywords(Arrays.asList("REST API", "Microservices", "Cloud", "CI/CD"))
                .formatSuggestions(Arrays.asList("Add quantifiable achievements", "Use stronger action verbs"))
                .build();

        return ResponseEntity.ok(sample);
    }
}