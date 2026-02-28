package com.resume.backend.controller;

import com.resume.backend.dto.ErrorResponse;
import com.resume.backend.dto.ResumeResponseDTO;
import com.resume.backend.dto.ResumeSaveRequest;
import com.resume.backend.dto.ResumeUpdateRequest;
import com.resume.backend.service.ResumeStorageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/resumes")
@CrossOrigin(origins = "http://localhost:5173")
public class ResumeStorageController {

    @Autowired
    private ResumeStorageService resumeStorageService;

    // Save a new resume
    @PostMapping
    public ResponseEntity<?> saveResume(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ResumeSaveRequest request) {

        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse(LocalDateTime.now(), 401, "Unauthorized",
                                "You must be logged in", "/api/v1/resumes"));
            }

            ResumeResponseDTO saved = resumeStorageService.saveResume(userDetails.getUsername(), request);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(LocalDateTime.now(), 500, "Save Failed",
                            e.getMessage(), "/api/v1/resumes"));
        }
    }

    // Get all resumes for current user
    @GetMapping
    public ResponseEntity<?> getUserResumes(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            List<ResumeResponseDTO> resumes = resumeStorageService.getUserResumes(userDetails.getUsername());
            return ResponseEntity.ok(resumes);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(LocalDateTime.now(), 500, "Fetch Failed",
                            e.getMessage(), "/api/v1/resumes"));
        }
    }

    // Get recent resumes
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentResumes(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            List<ResumeResponseDTO> resumes = resumeStorageService.getRecentResumes(
                    userDetails.getUsername(), limit);
            return ResponseEntity.ok(resumes);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get favorite resumes
    @GetMapping("/favorites")
    public ResponseEntity<?> getFavoriteResumes(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            List<ResumeResponseDTO> favorites = resumeStorageService.getFavoriteResumes(
                    userDetails.getUsername());
            return ResponseEntity.ok(favorites);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Search resumes
    @GetMapping("/search")
    public ResponseEntity<?> searchResumes(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String q) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            List<ResumeResponseDTO> results = resumeStorageService.searchResumes(
                    userDetails.getUsername(), q);
            return ResponseEntity.ok(results);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get single resume by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getResumeById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            ResumeResponseDTO resume = resumeStorageService.getResumeById(
                    userDetails.getUsername(), id);
            return ResponseEntity.ok(resume);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(LocalDateTime.now(), 404, "Not Found",
                            "Resume not found", "/api/v1/resumes/" + id));
        }
    }

    // Update resume (title, tags, favorite)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateResume(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody ResumeUpdateRequest request) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            ResumeResponseDTO updated = resumeStorageService.updateResume(
                    userDetails.getUsername(), id, request);
            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(LocalDateTime.now(), 500, "Update Failed",
                            e.getMessage(), "/api/v1/resumes/" + id));
        }
    }

    // Toggle favorite status
    @PatchMapping("/{id}/favorite")
    public ResponseEntity<?> toggleFavorite(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            resumeStorageService.toggleFavorite(userDetails.getUsername(), id);
            return ResponseEntity.ok().build();

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete resume
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResume(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            resumeStorageService.deleteResume(userDetails.getUsername(), id);
            return ResponseEntity.ok().build();

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(LocalDateTime.now(), 500, "Delete Failed",
                            e.getMessage(), "/api/v1/resumes/" + id));
        }
    }

    // Get resume statistics
    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            Map<String, Object> stats = resumeStorageService.getUserStats(userDetails.getUsername());
            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}