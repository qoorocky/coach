package com.coach.cms.web.dto;

import com.coach.cms.domain.Difficulty;
import com.coach.cms.domain.ExercisePublished;

import java.util.List;
import java.util.UUID;

public record AppExerciseView(
        UUID id,
        String name,
        String nameEn,
        String description,
        List<String> targetMuscles,
        List<String> secondaryMuscles,
        String videoUrl,
        Long videoSizeBytes,
        String thumbnailUrl,
        Difficulty difficulty,
        List<String> equipment,
        int version,
        long updatedAt,
        long createdAt
) {
    public static AppExerciseView from(ExercisePublished e) {
        return new AppExerciseView(
                e.getId(),
                e.getNameZh(),
                e.getNameEn(),
                e.getDescription(),
                e.getPrimaryMuscles(),
                e.getSecondaryMuscles(),
                e.getVideoUrl() == null ? "" : e.getVideoUrl(),
                e.getVideoSizeBytes() == null ? 0L : e.getVideoSizeBytes(),
                e.getThumbnailUrl() == null ? "" : e.getThumbnailUrl(),
                e.getDifficulty(),
                e.getEquipment(),
                e.getVersion(),
                e.getUpdatedAt().toEpochMilli(),
                e.getPublishedAt().toEpochMilli()
        );
    }
}
