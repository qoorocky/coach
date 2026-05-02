package com.coach.cms.web.dto;

import com.coach.cms.domain.MusicTrack;

import java.util.UUID;

public record AppMusicTrackView(
        UUID id,
        String name,
        String artist,
        Integer bpm,
        int durationSec,
        String fileUrl,
        long fileSizeBytes,
        String mimeType,
        long updatedAt,
        long createdAt
) {
    public static AppMusicTrackView from(MusicTrack t) {
        return new AppMusicTrackView(
                t.getId(), t.getName(), t.getArtist(), t.getBpm(), t.getDurationSec(),
                t.getFileUrl(), t.getFileSizeBytes(), t.getMimeType(),
                t.getUpdatedAt().toEpochMilli(),
                t.getCreatedAt().toEpochMilli()
        );
    }
}
