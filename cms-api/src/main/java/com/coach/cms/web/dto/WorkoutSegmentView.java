package com.coach.cms.web.dto;

import com.coach.cms.domain.WorkoutDraftSegment;
import com.coach.cms.domain.WorkoutPublishedSegment;

import java.util.UUID;

public record WorkoutSegmentView(
        UUID segmentId,
        UUID exerciseId,
        int orderIndex,
        int durationSec,
        int restAfterSec,
        int rounds
) {
    public static WorkoutSegmentView from(WorkoutDraftSegment s) {
        return new WorkoutSegmentView(s.getSegmentId(), s.getExerciseId(),
                s.getOrderIndex(), s.getDurationSec(), s.getRestAfterSec(), s.getRounds());
    }

    public static WorkoutSegmentView from(WorkoutPublishedSegment s) {
        return new WorkoutSegmentView(s.getSegmentId(), s.getExerciseId(),
                s.getOrderIndex(), s.getDurationSec(), s.getRestAfterSec(), s.getRounds());
    }
}
