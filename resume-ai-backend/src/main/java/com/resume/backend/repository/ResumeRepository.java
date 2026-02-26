package com.resume.backend.repository;

import com.resume.backend.entity.Resume;
import com.resume.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUser(User user);
    List<Resume> findByUserOrderByGeneratedAtDesc(User user);
    long countByUser(User user);
}