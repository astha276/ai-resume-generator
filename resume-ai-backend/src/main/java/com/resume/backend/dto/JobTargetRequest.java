package com.resume.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobTargetRequest {
    private String jobTitle;
    private String jobDescription; // Optional - if user pastes job description
    private String industry;
    private String experience;
    private Long resumeId; // Optional - if analyzing specific resume
}