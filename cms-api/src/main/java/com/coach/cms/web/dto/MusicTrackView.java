package com.coach.cms.web.dto;

import com.coach.cms.domain.MusicTrack;

import java.time.Instant;
import java.util.UUID;

public record MusicTrackView(
        UUID id,
        String name,
        String artist,
        Integer bpm,
        int durationSec,
        String fileUrl,
        long fileSizeBytes,
        String mimeType,
        String license,
        String licenseUrl,
        boolean active,
        Long createdBy,
        Instant createdAt,
        Instant updatedAt
) {
    public static MusicTrackView from(MusicTrack t) {
        return new MusicTrackView(
                t.getId(), t.getName(), t.getArtist(), t.getBpm(), t.getDurationSec(),
                t.getFileUrl(), t.getFileSizeBytes(), t.getMimeType(),
                t.getLicense(), t.getLicenseUrl(), t.isActive(),
                t.getCreatedBy(), t.getCreatedAt(), t.getUpdatedAt()
        );
    }
}
