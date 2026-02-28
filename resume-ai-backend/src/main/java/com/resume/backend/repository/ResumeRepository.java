package com.resume.backend.repository;

import com.resume.backend.entity.Resume;
import com.resume.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    // Get all resumes for a user (latest first)
    List<Resume> findByUserOrderByCreatedAtDesc(User user);

    // Get paginated resumes
    Page<Resume> findByUser(User user, Pageable pageable);

    // Get favorite resumes
    List<Resume> findByUserAndIsFavoriteTrueOrderByCreatedAtDesc(User user);

    // Search resumes by title or tags
    @Query("SELECT r FROM Resume r WHERE r.user = :user AND (LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.tags) LIKE LOWER(CONCAT('%', :search, '%'))) ORDER BY r.createdAt DESC")
    List<Resume> searchResumes(@Param("user") User user, @Param("search") String search);

    // Get recent resumes (limited)
    List<Resume> findTop5ByUserOrderByCreatedAtDesc(User user);

    // Get resumes by date range
    @Query("SELECT r FROM Resume r WHERE r.user = :user AND DATE(r.createdAt) BETWEEN :startDate AND :endDate ORDER BY r.createdAt DESC")
    List<Resume> findByUserAndDateRange(@Param("user") User user, @Param("startDate") String startDate, @Param("endDate") String endDate);

    // Count total resumes per user
    Long countByUser(User user);

    // Count favorites per user
    Long countByUserAndIsFavoriteTrue(User user);

    // Find single resume by ID and user (for security)
    Optional<Resume> findByIdAndUser(Long id, User user);

    // Delete all resumes for a user
    void deleteByUser(User user);
}