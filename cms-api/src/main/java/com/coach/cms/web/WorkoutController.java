package com.coach.cms.web;

import com.coach.cms.domain.ContentStatus;
import com.coach.cms.domain.WorkoutDraft;
import com.coach.cms.security.CurrentUser;
import com.coach.cms.service.WorkoutService;
import com.coach.cms.web.dto.ReviewCommentRequest;
import com.coach.cms.web.dto.SegmentReorderRequest;
import com.coach.cms.web.dto.SegmentUpsertRequest;
import com.coach.cms.web.dto.WorkoutDraftView;
import com.coach.cms.web.dto.WorkoutUpsertRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/cms/workouts")
public class WorkoutController {

    private final WorkoutService service;

    public WorkoutController(WorkoutService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public Page<WorkoutDraftView> list(@RequestParam(required = false) ContentStatus status,
                                       Pageable pageable) {
        return service.list(status, pageable).map(WorkoutDraftView::from);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public WorkoutDraftView get(@PathVariable UUID id) {
        return WorkoutDraftView.from(service.get(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public ResponseEntity<WorkoutDraftView> create(@Valid @RequestBody WorkoutUpsertRequest req) {
        WorkoutDraft d = service.create(req, CurrentUser.require());
        return ResponseEntity.ok(WorkoutDraftView.from(d));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public WorkoutDraftView update(@PathVariable UUID id,
                                   @Valid @RequestBody WorkoutUpsertRequest req) {
        return WorkoutDraftView.from(service.update(id, req, CurrentUser.require()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id, CurrentUser.require());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/segments")
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public WorkoutDraftView addSegment(@PathVariable UUID id,
                                       @Valid @RequestBody SegmentUpsertRequest req) {
        return WorkoutDraftView.from(service.addSegment(id, req, CurrentUser.require()));
    }

    @PutMapping("/{id}/segments/{segmentId}")
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public WorkoutDraftView updateSegment(@PathVariable UUID id,
                                          @PathVariable UUID segmentId,
                                          @Valid @RequestBody SegmentUpsertRequest req) {
        return WorkoutDraftView.from(service.updateSegment(id, segmentId, req, CurrentUser.require()));
    }

    @DeleteMapping("/{id}/segments/{segmentId}")
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public WorkoutDraftView deleteSegment(@PathVariable UUID id,
                                          @PathVariable UUID segmentId) {
        return WorkoutDraftView.from(service.deleteSegment(id, segmentId, CurrentUser.require()));
    }

    @PostMapping("/{id}/segments/reorder")
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public WorkoutDraftView reorder(@PathVariable UUID id,
                                    @Valid @RequestBody SegmentReorderRequest req) {
        return WorkoutDraftView.from(service.reorderSegments(id, req.segmentIds(), CurrentUser.require()));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public WorkoutDraftView submit(@PathVariable UUID id,
                                   @RequestBody(required = false) ReviewCommentRequest req) {
        String comment = req == null ? null : req.comment();
        return WorkoutDraftView.from(service.submit(id, comment, CurrentUser.require()));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('REVIEWER','ADMIN')")
    public WorkoutDraftView approve(@PathVariable UUID id,
                                    @RequestBody(required = false) ReviewCommentRequest req) {
        String comment = req == null ? null : req.comment();
        return WorkoutDraftView.from(service.approve(id, comment, CurrentUser.require()));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('REVIEWER','ADMIN')")
    public WorkoutDraftView reject(@PathVariable UUID id,
                                   @Valid @RequestBody ReviewCommentRequest req) {
        return WorkoutDraftView.from(service.reject(id, req.comment(), CurrentUser.require()));
    }

    @PostMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('REVIEWER','ADMIN')")
    public WorkoutDraftView archive(@PathVariable UUID id) {
        return WorkoutDraftView.from(service.archive(id, CurrentUser.require()));
    }

    @PostMapping("/{id}/unarchive")
    @PreAuthorize("hasAnyRole('REVIEWER','ADMIN')")
    public WorkoutDraftView unarchive(@PathVariable UUID id) {
        return WorkoutDraftView.from(service.unarchive(id, CurrentUser.require()));
    }
}
