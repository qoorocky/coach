package com.coach.cms.web;

import com.coach.cms.domain.ContentStatus;
import com.coach.cms.domain.ExerciseDraft;
import com.coach.cms.security.CurrentUser;
import com.coach.cms.service.ExerciseService;
import com.coach.cms.web.dto.ExerciseDraftView;
import com.coach.cms.web.dto.ExerciseUpsertRequest;
import com.coach.cms.web.dto.ReviewCommentRequest;
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
@RequestMapping("/api/cms/exercises")
public class ExerciseController {

    private final ExerciseService service;

    public ExerciseController(ExerciseService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public Page<ExerciseDraftView> list(@RequestParam(required = false) ContentStatus status,
                                        Pageable pageable) {
        return service.list(status, pageable).map(ExerciseDraftView::from);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public ExerciseDraftView get(@PathVariable UUID id) {
        return ExerciseDraftView.from(service.get(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public ResponseEntity<ExerciseDraftView> create(@Valid @RequestBody ExerciseUpsertRequest req) {
        ExerciseDraft d = service.create(req, CurrentUser.require());
        return ResponseEntity.ok(ExerciseDraftView.from(d));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public ExerciseDraftView update(@PathVariable UUID id,
                                    @Valid @RequestBody ExerciseUpsertRequest req) {
        return ExerciseDraftView.from(service.update(id, req, CurrentUser.require()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id, CurrentUser.require());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public ExerciseDraftView submit(@PathVariable UUID id,
                                    @RequestBody(required = false) ReviewCommentRequest req) {
        String comment = req == null ? null : req.comment();
        return ExerciseDraftView.from(service.submit(id, comment, CurrentUser.require()));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('REVIEWER','ADMIN')")
    public ExerciseDraftView approve(@PathVariable UUID id,
                                     @RequestBody(required = false) ReviewCommentRequest req) {
        String comment = req == null ? null : req.comment();
        return ExerciseDraftView.from(service.approve(id, comment, CurrentUser.require()));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('REVIEWER','ADMIN')")
    public ExerciseDraftView reject(@PathVariable UUID id,
                                    @Valid @RequestBody ReviewCommentRequest req) {
        return ExerciseDraftView.from(service.reject(id, req.comment(), CurrentUser.require()));
    }

    @PostMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('REVIEWER','ADMIN')")
    public ExerciseDraftView archive(@PathVariable UUID id) {
        return ExerciseDraftView.from(service.archive(id, CurrentUser.require()));
    }

    @PostMapping("/{id}/unarchive")
    @PreAuthorize("hasAnyRole('REVIEWER','ADMIN')")
    public ExerciseDraftView unarchive(@PathVariable UUID id) {
        return ExerciseDraftView.from(service.unarchive(id, CurrentUser.require()));
    }
}
