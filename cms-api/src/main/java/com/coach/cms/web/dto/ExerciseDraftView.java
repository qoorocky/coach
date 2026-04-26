package com.coach.cms.web.dto;

import com.coach.cms.domain.ContentStatus;
import com.coach.cms.domain.Difficulty;
import com.coach.cms.domain.ExerciseDraft;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ExerciseDraftView(
        UUID id,
        String nameZh,
        String nameEn,
        String description,
        Difficulty difficulty,
        String videoUrl,
        Long videoSizeBytes,
        String thumbnailUrl,
        List<String> equipment,
        List<String> primaryMuscles,
        List<String> secondaryMuscles,
        String category,
        ContentStatus status,
        int currentVersion,
        Long createdBy,
        Long updatedBy,
        Instant createdAt,
        Instant updatedAt
) {
    public static ExerciseDraftView from(ExerciseDraft d) {
        return new ExerciseDraftView(
                d.getId(), d.getNameZh(), d.getNameEn(), d.getDescription(),
                d.getDifficulty(), d.getVideoUrl(), d.getVideoSizeBytes(), d.getThumbnailUrl(),
                d.getEquipment(), d.getPrimaryMuscles(), d.getSecondaryMuscles(), d.getCategory(),
                d.getStatus(), d.getCurrentVersion(), d.getCreatedBy(), d.getUpdatedBy(),
                d.getCreatedAt(), d.getUpdatedAt());
    }
}
