package com.resume.backend.dto;

import lombok.Data;

@Data
public class ResumeUpdateRequest {
    private String title;
    private String tags;
    private Boolean isFavorite;
}