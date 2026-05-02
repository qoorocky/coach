package com.coach.cms.web.dto;

import com.coach.cms.domain.Difficulty;
import com.coach.cms.domain.WorkoutMode;
import com.coach.cms.domain.WorkoutPublished;

import java.util.List;
import java.util.UUID;

public record AppWorkoutView(
        UUID id,
        String name,
        String description,
        String coverImageUrl,
        Difficulty difficulty,
        WorkoutMode mode,
        int estimatedDurationSec,
        int estimatedCalories,
        List<AppWorkoutSegmentView> segments,
        List<String> tags,
        List<UUID> trackIds,
        String createdBy,
        int version,
        long updatedAt,
        long createdAt
) {
    public static AppWorkoutView from(WorkoutPublished w) {
        List<AppWorkoutSegmentView> segs = w.getSegments().stream()
                .map(AppWorkoutSegmentView::from)
                .toList();
        return new AppWorkoutView(
                w.getId(),
                w.getName(),
                w.getDescription(),
                w.getCoverImageUrl() == null ? "" : w.getCoverImageUrl(),
                w.getDifficulty(),
                w.getMode(),
                w.getEstimatedDurationSec(),
                w.getEstimatedCalories(),
                segs,
                w.getTags(),
                w.getTrackIds(),
                w.getCreatedByType(),
                w.getVersion(),
                w.getUpdatedAt().toEpochMilli(),
                w.getPublishedAt().toEpochMilli()
        );
    }
}
