package com.coach.cms.web.dto;

import com.coach.cms.domain.Difficulty;
import com.coach.cms.domain.WorkoutMode;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record WorkoutUpsertRequest(
        @NotBlank @Size(max = 100) String name,
        String description,
        String coverImageUrl,
        @NotNull Difficulty difficulty,
        WorkoutMode mode,
        @Min(0) int estimatedDurationSec,
        @Min(0) int estimatedCalories,
        List<String> tags,
        String createdByType
) {
}
