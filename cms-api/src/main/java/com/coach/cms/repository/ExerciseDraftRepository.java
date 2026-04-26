package com.coach.cms.repository;

import com.coach.cms.domain.ContentStatus;
import com.coach.cms.domain.ExerciseDraft;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ExerciseDraftRepository extends JpaRepository<ExerciseDraft, UUID> {
    Page<ExerciseDraft> findByStatus(ContentStatus status, Pageable pageable);
}
