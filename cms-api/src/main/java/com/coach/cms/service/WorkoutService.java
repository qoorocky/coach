package com.coach.cms.service;

import com.coach.cms.domain.ContentStatus;
import com.coach.cms.domain.EntityType;
import com.coach.cms.domain.ExercisePublished;
import com.coach.cms.domain.ReviewAction;
import com.coach.cms.domain.ReviewActionType;
import com.coach.cms.domain.WorkoutDraft;
import com.coach.cms.domain.WorkoutDraftSegment;
import com.coach.cms.domain.WorkoutPublished;
import com.coach.cms.domain.WorkoutPublishedSegment;
import com.coach.cms.repository.ExercisePublishedRepository;
import com.coach.cms.repository.ReviewActionRepository;
import com.coach.cms.repository.WorkoutDraftRepository;
import com.coach.cms.repository.WorkoutPublishedRepository;
import com.coach.cms.security.CmsUserPrincipal;
import com.coach.cms.web.dto.SegmentUpsertRequest;
import com.coach.cms.web.dto.WorkoutUpsertRequest;
import jakarta.persistence.EntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class WorkoutService {

    private final WorkoutDraftRepository drafts;
    private final WorkoutPublishedRepository published;
    private final ExercisePublishedRepository exercisesPublished;
    private final ReviewActionRepository reviewActions;
    private final EntityManager em;

    public WorkoutService(WorkoutDraftRepository drafts,
                          WorkoutPublishedRepository published,
                          ExercisePublishedRepository exercisesPublished,
                          ReviewActionRepository reviewActions,
                          EntityManager em) {
        this.drafts = drafts;
        this.published = published;
        this.exercisesPublished = exercisesPublished;
        this.reviewActions = reviewActions;
        this.em = em;
    }

    @Transactional(readOnly = true)
    public Page<WorkoutDraft> list(ContentStatus status, Pageable pageable) {
        return status == null ? drafts.findAll(pageable) : drafts.findByStatus(status, pageable);
    }

    @Transactional(readOnly = true)
    public WorkoutDraft get(UUID id) {
        return drafts.findById(id).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "workout not found"));
    }

    @Transactional
    public WorkoutDraft create(WorkoutUpsertRequest req, CmsUserPrincipal actor) {
        Instant now = Instant.now();
        WorkoutDraft d = WorkoutDraft.builder()
                .id(UUID.randomUUID())
                .name(req.name())
                .description(req.description() == null ? "" : req.description())
                .coverImageUrl(req.coverImageUrl())
                .difficulty(req.difficulty())
                .estimatedDurationSec(req.estimatedDurationSec())
                .estimatedCalories(req.estimatedCalories())
                .tags(new ArrayList<>(req.tags() == null ? List.of() : req.tags()))
                .createdByType(req.createdByType() == null ? "system" : req.createdByType())
                .status(ContentStatus.DRAFT)
                .currentVersion(0)
                .createdBy(actor.id())
                .updatedBy(actor.id())
                .createdAt(now)
                .updatedAt(now)
                .segments(new ArrayList<>())
                .build();
        return drafts.save(d);
    }

    @Transactional
    public WorkoutDraft update(UUID id, WorkoutUpsertRequest req, CmsUserPrincipal actor) {
        WorkoutDraft d = get(id);
        if (d.getStatus() == ContentStatus.IN_REVIEW) {
            throw new ResponseStatusException(CONFLICT, "cannot edit while IN_REVIEW");
        }
        d.setName(req.name());
        d.setDescription(req.description() == null ? "" : req.description());
        d.setCoverImageUrl(req.coverImageUrl());
        d.setDifficulty(req.difficulty());
        d.setEstimatedDurationSec(req.estimatedDurationSec());
        d.setEstimatedCalories(req.estimatedCalories());
        d.setTags(new ArrayList<>(req.tags() == null ? List.of() : req.tags()));
        if (req.createdByType() != null) {
            d.setCreatedByType(req.createdByType());
        }
        if (d.getStatus() == ContentStatus.PUBLISHED) {
            d.setStatus(ContentStatus.DRAFT);
        }
        d.setUpdatedBy(actor.id());
        d.setUpdatedAt(Instant.now());
        return drafts.save(d);
    }

    @Transactional
    public void delete(UUID id, CmsUserPrincipal actor) {
        WorkoutDraft d = get(id);
        if (d.getStatus() != ContentStatus.DRAFT) {
            throw new ResponseStatusException(CONFLICT, "only DRAFT workouts can be deleted");
        }
        drafts.delete(d);
    }

    @Transactional
    public WorkoutDraft addSegment(UUID workoutId, SegmentUpsertRequest req, CmsUserPrincipal actor) {
        WorkoutDraft d = get(workoutId);
        assertEditable(d);
        int nextOrder = d.getSegments().size();
        WorkoutDraftSegment seg = WorkoutDraftSegment.builder()
                .segmentId(UUID.randomUUID())
                .exerciseId(req.exerciseId())
                .orderIndex(nextOrder)
                .durationSec(req.durationSec())
                .restAfterSec(req.restAfterSec())
                .rounds(req.rounds())
                .createdAt(Instant.now())
                .build();
        d.getSegments().add(seg);
        d.setUpdatedBy(actor.id());
        d.setUpdatedAt(Instant.now());
        return drafts.save(d);
    }

    @Transactional
    public WorkoutDraft updateSegment(UUID workoutId, UUID segmentId, SegmentUpsertRequest req, CmsUserPrincipal actor) {
        WorkoutDraft d = get(workoutId);
        assertEditable(d);
        WorkoutDraftSegment seg = d.getSegments().stream()
                .filter(s -> s.getSegmentId().equals(segmentId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "segment not found"));
        seg.setExerciseId(req.exerciseId());
        seg.setDurationSec(req.durationSec());
        seg.setRestAfterSec(req.restAfterSec());
        seg.setRounds(req.rounds());
        d.setUpdatedBy(actor.id());
        d.setUpdatedAt(Instant.now());
        return drafts.save(d);
    }

    @Transactional
    public WorkoutDraft deleteSegment(UUID workoutId, UUID segmentId, CmsUserPrincipal actor) {
        WorkoutDraft d = get(workoutId);
        assertEditable(d);
        boolean removed = d.getSegments().removeIf(s -> s.getSegmentId().equals(segmentId));
        if (!removed) {
            throw new ResponseStatusException(NOT_FOUND, "segment not found");
        }
        // Re-pack order indexes 0..n-1 with 2-pass to avoid UNIQUE collisions
        repackOrder(d.getSegments());
        d.setUpdatedBy(actor.id());
        d.setUpdatedAt(Instant.now());
        return drafts.save(d);
    }

    @Transactional
    public WorkoutDraft reorderSegments(UUID workoutId, List<UUID> segmentIds, CmsUserPrincipal actor) {
        WorkoutDraft d = get(workoutId);
        assertEditable(d);
        if (segmentIds.size() != d.getSegments().size()) {
            throw new ResponseStatusException(BAD_REQUEST, "segmentIds length mismatch");
        }
        Map<UUID, WorkoutDraftSegment> byId = new HashMap<>();
        for (WorkoutDraftSegment s : d.getSegments()) {
            byId.put(s.getSegmentId(), s);
        }
        Set<UUID> seen = new HashSet<>();
        List<WorkoutDraftSegment> ordered = new ArrayList<>(segmentIds.size());
        for (UUID sid : segmentIds) {
            if (!seen.add(sid)) {
                throw new ResponseStatusException(BAD_REQUEST, "duplicate segmentId in reorder");
            }
            WorkoutDraftSegment s = byId.get(sid);
            if (s == null) {
                throw new ResponseStatusException(BAD_REQUEST, "unknown segmentId in reorder: " + sid);
            }
            ordered.add(s);
        }
        // 2-pass to avoid UNIQUE (workout_draft_id, order_index) violation mid-flush
        for (int i = 0; i < ordered.size(); i++) {
            ordered.get(i).setOrderIndex(-1 - i);
        }
        em.flush();
        for (int i = 0; i < ordered.size(); i++) {
            ordered.get(i).setOrderIndex(i);
        }
        em.flush();
        // Replace collection contents so @OrderBy returns sorted view next read
        d.getSegments().clear();
        d.getSegments().addAll(ordered);
        d.setUpdatedBy(actor.id());
        d.setUpdatedAt(Instant.now());
        return drafts.save(d);
    }

    @Transactional
    public WorkoutDraft submit(UUID id, String comment, CmsUserPrincipal actor) {
        WorkoutDraft d = get(id);
        if (d.getStatus() != ContentStatus.DRAFT) {
            throw new ResponseStatusException(CONFLICT, "only DRAFT can be submitted");
        }
        if (d.getSegments().isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "workout must have at least one segment to submit");
        }
        d.setStatus(ContentStatus.IN_REVIEW);
        d.setUpdatedBy(actor.id());
        d.setUpdatedAt(Instant.now());
        recordAction(d.getId(), ReviewActionType.SUBMIT, comment, actor);
        return drafts.save(d);
    }

    @Transactional
    public WorkoutDraft approve(UUID id, String comment, CmsUserPrincipal actor) {
        WorkoutDraft d = get(id);
        if (d.getStatus() != ContentStatus.IN_REVIEW) {
            throw new ResponseStatusException(CONFLICT, "only IN_REVIEW can be approved");
        }
        // Validate every segment.exerciseId points to an active published exercise
        for (WorkoutDraftSegment s : d.getSegments()) {
            ExercisePublished p = exercisesPublished.findById(s.getExerciseId())
                    .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST,
                            "segment exerciseId not published: " + s.getExerciseId()));
            if (!p.isActive()) {
                throw new ResponseStatusException(BAD_REQUEST,
                        "segment references inactive exercise: " + s.getExerciseId());
            }
        }
        int newVersion = d.getCurrentVersion() + 1;
        Instant now = Instant.now();
        d.setCurrentVersion(newVersion);
        d.setStatus(ContentStatus.PUBLISHED);
        d.setUpdatedBy(actor.id());
        d.setUpdatedAt(now);
        drafts.save(d);

        // Upsert workouts_published with id == draftId for stable app UUIDs
        WorkoutPublished p = published.findById(d.getId()).orElseGet(() -> {
            WorkoutPublished fresh = new WorkoutPublished();
            fresh.setId(d.getId());
            fresh.setDraftId(d.getId());
            fresh.setPublishedAt(now);
            fresh.setSegments(new ArrayList<>());
            return fresh;
        });
        p.setVersion(newVersion);
        p.setName(d.getName());
        p.setDescription(d.getDescription());
        p.setCoverImageUrl(d.getCoverImageUrl());
        p.setDifficulty(d.getDifficulty());
        p.setEstimatedDurationSec(d.getEstimatedDurationSec());
        p.setEstimatedCalories(d.getEstimatedCalories());
        p.setTags(new ArrayList<>(d.getTags()));
        p.setCreatedByType(d.getCreatedByType());
        p.setActive(true);
        p.setPublishedBy(actor.id());
        p.setPublishedAt(now);
        p.setUpdatedAt(now);

        // Replace published segments wholesale
        if (p.getSegments() == null) {
            p.setSegments(new ArrayList<>());
        }
        p.getSegments().clear();
        // Flush the clear before adding new rows to avoid UNIQUE collisions on (workout_published_id, order_index)
        published.save(p);
        em.flush();
        for (WorkoutDraftSegment s : d.getSegments()) {
            WorkoutPublishedSegment ps = WorkoutPublishedSegment.builder()
                    .segmentId(UUID.randomUUID())
                    .exerciseId(s.getExerciseId())
                    .orderIndex(s.getOrderIndex())
                    .durationSec(s.getDurationSec())
                    .restAfterSec(s.getRestAfterSec())
                    .rounds(s.getRounds())
                    .build();
            p.getSegments().add(ps);
        }
        published.save(p);

        recordAction(d.getId(), ReviewActionType.APPROVE, comment, actor);
        recordAction(d.getId(), ReviewActionType.PUBLISH, null, actor);
        return d;
    }

    @Transactional
    public WorkoutDraft reject(UUID id, String comment, CmsUserPrincipal actor) {
        WorkoutDraft d = get(id);
        if (d.getStatus() != ContentStatus.IN_REVIEW) {
            throw new ResponseStatusException(CONFLICT, "only IN_REVIEW can be rejected");
        }
        if (comment == null || comment.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "reject requires a comment");
        }
        d.setStatus(ContentStatus.DRAFT);
        d.setUpdatedBy(actor.id());
        d.setUpdatedAt(Instant.now());
        recordAction(d.getId(), ReviewActionType.REJECT, comment, actor);
        return drafts.save(d);
    }

    private void assertEditable(WorkoutDraft d) {
        if (d.getStatus() == ContentStatus.IN_REVIEW) {
            throw new ResponseStatusException(CONFLICT, "cannot edit segments while IN_REVIEW");
        }
        if (d.getStatus() == ContentStatus.PUBLISHED) {
            // Editing a published workout starts a fresh draft cycle
            d.setStatus(ContentStatus.DRAFT);
        }
    }

    private void repackOrder(List<WorkoutDraftSegment> segs) {
        // 2-pass: temporarily set negative order indexes, flush, then re-assign 0..n-1
        for (int i = 0; i < segs.size(); i++) {
            segs.get(i).setOrderIndex(-1 - i);
        }
        em.flush();
        for (int i = 0; i < segs.size(); i++) {
            segs.get(i).setOrderIndex(i);
        }
        em.flush();
    }

    private void recordAction(UUID entityId, ReviewActionType action, String comment, CmsUserPrincipal actor) {
        ReviewAction a = ReviewAction.builder()
                .entityType(EntityType.WORKOUT)
                .entityId(entityId)
                .action(action)
                .comment(comment)
                .performedBy(actor.id())
                .performedAt(Instant.now())
                .build();
        reviewActions.save(a);
    }
}
