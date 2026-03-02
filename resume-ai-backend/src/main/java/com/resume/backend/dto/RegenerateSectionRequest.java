package com.resume.backend.dto;

import lombok.Data;

@Data
public class RegenerateSectionRequest {
    private String prompt;
    private String section;
    private String context; // Additional context like job title, company, etc.
}