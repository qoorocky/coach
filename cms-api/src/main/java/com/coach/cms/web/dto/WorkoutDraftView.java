package com.coach.cms.web.dto;

import com.coach.cms.domain.ContentStatus;
import com.coach.cms.domain.Difficulty;
import com.coach.cms.domain.WorkoutDraft;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record WorkoutDraftView(
        UUID id,
        String name,
        String description,
        String coverImageUrl,
        Difficulty difficulty,
        int estimatedDurationSec,
        int estimatedCalories,
        List<String> tags,
        String createdByType,
        ContentStatus status,
        int currentVersion,
        Long createdBy,
        Long updatedBy,
        Instant createdAt,
        Instant updatedAt,
        List<WorkoutSegmentView> segments
) {
    public static WorkoutDraftView from(WorkoutDraft d) {
        List<WorkoutSegmentView> segs = d.getSegments().stream()
                .map(WorkoutSegmentView::from)
                .toList();
        return new WorkoutDraftView(
                d.getId(), d.getName(), d.getDescription(), d.getCoverImageUrl(),
                d.getDifficulty(), d.getEstimatedDurationSec(), d.getEstimatedCalories(),
                d.getTags(), d.getCreatedByType(), d.getStatus(), d.getCurrentVersion(),
                d.getCreatedBy(), d.getUpdatedBy(), d.getCreatedAt(), d.getUpdatedAt(),
                segs);
    }
}
