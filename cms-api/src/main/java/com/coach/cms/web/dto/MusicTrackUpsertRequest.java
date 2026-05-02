package com.coach.cms.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MusicTrackUpsertRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 200) String artist,
        Integer bpm,
        @Min(0) int durationSec,
        @NotBlank @Size(max = 500) String fileUrl,
        @Min(0) long fileSizeBytes,
        @NotBlank @Size(max = 50) String mimeType,
        @NotBlank @Size(max = 50) String license,
        @Size(max = 500) String licenseUrl,
        Boolean active
) {
}
