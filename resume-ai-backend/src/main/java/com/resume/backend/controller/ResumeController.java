package com.resume.backend.controller;

import com.resume.backend.ResumeRequest;
import com.resume.backend.service.ResumeService;
import com.resume.backend.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
//@CrossOrigin("*", allowCredentials = "true")
@RequestMapping("/api/v1/resume")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> getResumeData(
            @RequestBody ResumeRequest resumeRequest,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            // Check if user is authenticated
            if (userDetails == null) {
                ErrorResponse error = new ErrorResponse(
                        LocalDateTime.now(),
                        HttpStatus.UNAUTHORIZED.value(),
                        "Unauthorized",
                        "You must be logged in to generate a resume",
                        "/api/v1/resume/generate"
                );
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            // Get the logged-in user's email
            String userEmail = userDetails.getUsername();

            // Call service with user email to track who created this resume
            String json = resumeService.generateResumeResponse(resumeRequest.userDescription(), userEmail);

            return new ResponseEntity<>(json, HttpStatus.OK);

        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(
                    LocalDateTime.now(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Resume Generation Failed",
                    e.getMessage(),
                    "/api/v1/resume/generate"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Optional: Add endpoint to get user's resume history
    @GetMapping("/history")
    public ResponseEntity<?> getUserResumeHistory(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String userEmail = userDetails.getUsername();
            // You can implement this method in your service to get all resumes created by this user
            // List<Resume> resumes = resumeService.getUserResumes(userEmail);

            return ResponseEntity.ok().build(); // Return resumes here

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
