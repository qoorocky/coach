package com.coach.cms.service;

import com.coach.cms.domain.MusicTrack;
import com.coach.cms.repository.MusicTrackRepository;
import com.coach.cms.security.CmsUserPrincipal;
import com.coach.cms.web.dto.MusicTrackUpsertRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class MusicTrackService {

    private final MusicTrackRepository tracks;

    public MusicTrackService(MusicTrackRepository tracks) {
        this.tracks = tracks;
    }

    @Transactional(readOnly = true)
    public Page<MusicTrack> list(Pageable pageable) {
        return tracks.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public MusicTrack get(UUID id) {
        return tracks.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "music track not found"));
    }

    @Transactional
    public MusicTrack create(MusicTrackUpsertRequest req, CmsUserPrincipal actor) {
        Instant now = Instant.now();
        MusicTrack t = MusicTrack.builder()
                .id(UUID.randomUUID())
                .name(req.name())
                .artist(req.artist())
                .bpm(req.bpm())
                .durationSec(req.durationSec())
                .fileUrl(req.fileUrl())
                .fileSizeBytes(req.fileSizeBytes())
                .mimeType(req.mimeType())
                .license(req.license())
                .licenseUrl(req.licenseUrl())
                .active(req.active() == null || req.active())
                .createdBy(actor.id())
                .createdAt(now)
                .updatedAt(now)
                .build();
        return tracks.save(t);
    }

    @Transactional
    public MusicTrack update(UUID id, MusicTrackUpsertRequest req) {
        MusicTrack t = get(id);
        t.setName(req.name());
        t.setArtist(req.artist());
        t.setBpm(req.bpm());
        t.setDurationSec(req.durationSec());
        t.setFileUrl(req.fileUrl());
        t.setFileSizeBytes(req.fileSizeBytes());
        t.setMimeType(req.mimeType());
        t.setLicense(req.license());
        t.setLicenseUrl(req.licenseUrl());
        if (req.active() != null) t.setActive(req.active());
        t.setUpdatedAt(Instant.now());
        return tracks.save(t);
    }

    @Transactional
    public void delete(UUID id) {
        MusicTrack t = get(id);
        tracks.delete(t);
    }
}
