package com.resume.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResumeResponseDTO {
    private Long id;
    private String title;
    private String userDescription;
    private Object generatedContent; // Can be JSON object or string
    private String tags;
    private boolean isFavorite;
    private String fileFormat;
    private String aiModel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Helper method to parse generated content
    @SuppressWarnings("unchecked")
    public Map<String, Object> getGeneratedContentAsMap() {
        if (generatedContent instanceof Map) {
            return (Map<String, Object>) generatedContent;
        }
        return null;
    }
}