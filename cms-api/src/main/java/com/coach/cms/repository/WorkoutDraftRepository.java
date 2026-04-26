package com.coach.cms.repository;

import com.coach.cms.domain.ContentStatus;
import com.coach.cms.domain.WorkoutDraft;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WorkoutDraftRepository extends JpaRepository<WorkoutDraft, UUID> {
    Page<WorkoutDraft> findByStatus(ContentStatus status, Pageable pageable);
}
