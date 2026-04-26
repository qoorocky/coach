package com.coach.cms.repository;

import com.coach.cms.domain.ExercisePublished;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExercisePublishedRepository extends JpaRepository<ExercisePublished, UUID> {
    Optional<ExercisePublished> findByDraftId(UUID draftId);
    List<ExercisePublished> findByUpdatedAtGreaterThanAndActiveTrueOrderByUpdatedAtAsc(Instant since);
    List<ExercisePublished> findByUpdatedAtGreaterThanAndActiveFalseOrderByUpdatedAtAsc(Instant since);
}
