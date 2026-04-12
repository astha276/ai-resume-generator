package com.resume.backend.service;

public interface ResumeService {
    // for flexibility and security interfaces are used 
    String generateResumeResponse(String userResumeDescription, String userEmail);
    String regenerateSection(String userDescription, String section, String prompt, String context);
}