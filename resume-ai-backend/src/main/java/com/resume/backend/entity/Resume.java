package com.resume.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
@Data  // This Lombok annotation generates getters, setters, toString, etc.
@NoArgsConstructor
@AllArgsConstructor
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "resume_title", nullable = false, length = 255)
    private String title;

    @Column(name = "user_description", nullable = false, columnDefinition = "TEXT")
    private String userDescription;

    @Column(name = "generated_content", nullable = false, columnDefinition = "TEXT")
    private String generatedContent;

    @Column(name = "ai_model", length = 100)
    private String aiModel;

    @Column(name = "file_format", length = 50)
    private String fileFormat;

    @Column(name = "is_favorite")
    private boolean isFavorite;

    @Column(name = "tags", length = 500)
    private String tags;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}