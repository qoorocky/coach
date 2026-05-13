package com.coach.cms.web.dto;

import com.coach.cms.domain.ReviewAction;
import com.coach.cms.domain.ReviewActionType;

import java.time.Instant;

public record AuditEntryView(
        Long id,
        ReviewActionType action,
        String comment,
        Long performedBy,
        String performedByName,
        Instant performedAt
) {
    public static AuditEntryView from(ReviewAction a, String name) {
        return new AuditEntryView(
                a.getId(),
                a.getAction(),
                a.getComment(),
                a.getPerformedBy(),
                name,
                a.getPerformedAt()
        );
    }
}
