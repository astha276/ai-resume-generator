package com.resume.backend.service;

public interface ResumeService {
    String generateResumeResponse(String userResumeDescription, String userEmail);
    String regenerateSection(String userDescription, String section, String prompt, String context);
}