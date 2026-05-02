package com.coach.cms.repository;

import com.coach.cms.domain.MusicTrack;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface MusicTrackRepository extends JpaRepository<MusicTrack, UUID> {
    Page<MusicTrack> findAll(Pageable pageable);
    List<MusicTrack> findByUpdatedAtGreaterThanAndActiveTrueOrderByUpdatedAtAsc(Instant since);
    List<MusicTrack> findByUpdatedAtGreaterThanAndActiveFalseOrderByUpdatedAtAsc(Instant since);
}
