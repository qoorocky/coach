package com.coach.cms.web.dto;

import com.coach.cms.domain.WorkoutPublishedSegment;

import java.util.UUID;

public record AppWorkoutSegmentView(
        UUID segmentId,
        UUID exerciseId,
        int orderIndex,
        int durationSec,
        int restAfterSec,
        int rounds
) {
    public static AppWorkoutSegmentView from(WorkoutPublishedSegment s) {
        return new AppWorkoutSegmentView(
                s.getSegmentId(), s.getExerciseId(), s.getOrderIndex(),
                s.getDurationSec(), s.getRestAfterSec(), s.getRounds()
        );
    }
}
