package com.coach.cms.service;

import com.coach.cms.domain.ExercisePublished;
import com.coach.cms.domain.MusicTrack;
import com.coach.cms.domain.WorkoutPublished;
import com.coach.cms.repository.ExercisePublishedRepository;
import com.coach.cms.repository.MusicTrackRepository;
import com.coach.cms.repository.WorkoutPublishedRepository;
import com.coach.cms.web.dto.AppExerciseView;
import com.coach.cms.web.dto.AppMusicTrackView;
import com.coach.cms.web.dto.AppWorkoutView;
import com.coach.cms.web.dto.SyncResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ContentSyncService {

    private final ExercisePublishedRepository exercises;
    private final WorkoutPublishedRepository workouts;
    private final MusicTrackRepository music;

    public ContentSyncService(ExercisePublishedRepository exercises,
                              WorkoutPublishedRepository workouts,
                              MusicTrackRepository music) {
        this.exercises = exercises;
        this.workouts = workouts;
        this.music = music;
    }

    @Transactional(readOnly = true)
    public SyncResponse sync(long sinceEpochMillis) {
        Instant since = Instant.ofEpochMilli(Math.max(0L, sinceEpochMillis));
        Instant serverTime = Instant.now();

        List<ExercisePublished> exUpdated =
                exercises.findByUpdatedAtGreaterThanAndActiveTrueOrderByUpdatedAtAsc(since);
        List<ExercisePublished> exDeleted =
                exercises.findByUpdatedAtGreaterThanAndActiveFalseOrderByUpdatedAtAsc(since);

        List<WorkoutPublished> woUpdated =
                workouts.findByUpdatedAtGreaterThanAndActiveTrueOrderByUpdatedAtAsc(since);
        List<WorkoutPublished> woDeleted =
                workouts.findByUpdatedAtGreaterThanAndActiveFalseOrderByUpdatedAtAsc(since);

        List<MusicTrack> muUpdated =
                music.findByUpdatedAtGreaterThanAndActiveTrueOrderByUpdatedAtAsc(since);
        List<MusicTrack> muDeleted =
                music.findByUpdatedAtGreaterThanAndActiveFalseOrderByUpdatedAtAsc(since);

        return new SyncResponse(
                serverTime.toEpochMilli(),
                new SyncResponse.Bucket<>(
                        exUpdated.stream().map(AppExerciseView::from).toList(),
                        exDeleted.stream().map(e -> e.getId().toString()).toList()
                ),
                new SyncResponse.Bucket<>(
                        woUpdated.stream().map(AppWorkoutView::from).toList(),
                        woDeleted.stream().map(w -> w.getId().toString()).toList()
                ),
                new SyncResponse.Bucket<>(
                        muUpdated.stream().map(AppMusicTrackView::from).toList(),
                        muDeleted.stream().map(m -> m.getId().toString()).toList()
                ),
                false
        );
    }
}
