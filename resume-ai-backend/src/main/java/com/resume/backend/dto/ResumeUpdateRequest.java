package com.resume.backend.dto;

import lombok.Data;
import java.util.Map;

@Data
public class ResumeUpdateRequest {
    private String title;
    private String tags;
    private Boolean isFavorite;
    private Map<String, Object> generatedContent; // For partial updates
    private String sectionToUpdate; // Which section is being updated
    private String sectionContent; // New content for the section
}