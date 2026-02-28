package com.resume.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResumeSaveRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String userDescription;

    @NotBlank(message = "Generated content is required")
    private String generatedContent;

    private String tags;
    private boolean isFavorite = false;
    private String fileFormat = "json";
}