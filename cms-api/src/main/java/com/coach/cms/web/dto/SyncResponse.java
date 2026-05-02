package com.coach.cms.web.dto;

import java.util.List;

public record SyncResponse(
        long serverTime,
        Bucket<AppExerciseView> exercises,
        Bucket<AppWorkoutView> workouts,
        Bucket<AppMusicTrackView> music,
        boolean hasMore
) {
    public record Bucket<T>(List<T> updated, List<String> deleted) {
    }
}
