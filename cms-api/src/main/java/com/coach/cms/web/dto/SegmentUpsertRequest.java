package com.coach.cms.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SegmentUpsertRequest(
        @NotNull UUID exerciseId,
        @Min(1) int durationSec,
        @Min(0) int restAfterSec,
        @Min(1) int rounds
) {
}
