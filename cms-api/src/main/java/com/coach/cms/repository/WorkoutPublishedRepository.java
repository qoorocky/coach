package com.coach.cms.repository;

import com.coach.cms.domain.WorkoutPublished;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkoutPublishedRepository extends JpaRepository<WorkoutPublished, UUID> {
    Optional<WorkoutPublished> findByDraftId(UUID draftId);
    List<WorkoutPublished> findByUpdatedAtGreaterThanAndActiveTrueOrderByUpdatedAtAsc(Instant since);
    List<WorkoutPublished> findByUpdatedAtGreaterThanAndActiveFalseOrderByUpdatedAtAsc(Instant since);
}
