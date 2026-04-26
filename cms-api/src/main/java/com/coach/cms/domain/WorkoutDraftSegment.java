package com.coach.cms.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "workout_draft_segments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutDraftSegment {

    @Id
    @Column(name = "segment_id", columnDefinition = "uuid")
    private UUID segmentId;

    @Column(name = "workout_draft_id", nullable = false, columnDefinition = "uuid", insertable = false, updatable = false)
    private UUID workoutDraftId;

    @Column(name = "exercise_id", nullable = false, columnDefinition = "uuid")
    private UUID exerciseId;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @Column(name = "duration_sec", nullable = false)
    private int durationSec;

    @Column(name = "rest_after_sec", nullable = false)
    private int restAfterSec;

    @Column(nullable = false)
    private int rounds;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
