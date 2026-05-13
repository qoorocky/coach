package com.coach.cms.repository;

import com.coach.cms.domain.EntityType;
import com.coach.cms.domain.ReviewAction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewActionRepository extends JpaRepository<ReviewAction, Long> {
    List<ReviewAction> findByEntityTypeAndEntityIdOrderByPerformedAtDesc(
            EntityType entityType, UUID entityId);
}
