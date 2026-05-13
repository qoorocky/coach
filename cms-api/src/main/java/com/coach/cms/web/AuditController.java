package com.coach.cms.web;

import com.coach.cms.domain.CmsUser;
import com.coach.cms.domain.EntityType;
import com.coach.cms.domain.ReviewAction;
import com.coach.cms.repository.CmsUserRepository;
import com.coach.cms.repository.ReviewActionRepository;
import com.coach.cms.web.dto.AuditEntryView;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Read-only audit timeline: returns the full chronology of review actions
 * (SUBMIT / APPROVE / REJECT / PUBLISH / ARCHIVE / UNARCHIVE) for one
 * exercise or workout, newest first, with the actor's display name joined in.
 */
@RestController
@RequestMapping("/api/cms/audit")
public class AuditController {

    private final ReviewActionRepository reviewActions;
    private final CmsUserRepository users;

    public AuditController(ReviewActionRepository reviewActions,
                           CmsUserRepository users) {
        this.reviewActions = reviewActions;
        this.users = users;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public List<AuditEntryView> timeline(@RequestParam EntityType entityType,
                                         @RequestParam("id") UUID entityId) {
        List<ReviewAction> rows =
                reviewActions.findByEntityTypeAndEntityIdOrderByPerformedAtDesc(entityType, entityId);
        if (rows.isEmpty()) return List.of();

        // Single batch lookup so timelines from many actors don't N+1.
        Set<Long> userIds = new HashSet<>();
        for (ReviewAction r : rows) userIds.add(r.getPerformedBy());
        Map<Long, String> nameById = new HashMap<>();
        for (CmsUser u : users.findAllById(userIds)) {
            nameById.put(u.getId(), u.getName());
        }

        return rows.stream()
                .map(r -> AuditEntryView.from(r, nameById.get(r.getPerformedBy())))
                .toList();
    }
}
