package com.coach.cms.web.dto;

import com.coach.cms.domain.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ExerciseUpsertRequest(
        @NotBlank @Size(max = 100) String nameZh,
        @NotBlank @Size(max = 100) String nameEn,
        @NotBlank String description,
        @NotNull Difficulty difficulty,
        String videoUrl,
        Long videoSizeBytes,
        String thumbnailUrl,
        @NotNull List<String> equipment,
        @NotNull List<String> primaryMuscles,
        List<String> secondaryMuscles,
        String category
) {
}
