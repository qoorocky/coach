package com.coach.cms.service;

import com.coach.cms.domain.ContentStatus;
import com.coach.cms.domain.EntityType;
import com.coach.cms.domain.ExerciseDraft;
import com.coach.cms.domain.ExercisePublished;
import com.coach.cms.domain.ReviewAction;
import com.coach.cms.domain.ReviewActionType;
import com.coach.cms.repository.ExerciseDraftRepository;
import com.coach.cms.repository.ExercisePublishedRepository;
import com.coach.cms.repository.ReviewActionRepository;
import com.coach.cms.security.CmsUserPrincipal;
import com.coach.cms.web.dto.ExerciseUpsertRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ExerciseService {

    private final ExerciseDraftRepository drafts;
    private final ExercisePublishedRepository published;
    private final ReviewActionRepository reviewActions;

    public ExerciseService(ExerciseDraftRepository drafts,
                           ExercisePublishedRepository published,
                           ReviewActionRepository reviewActions) {
        this.drafts = drafts;
        this.published = published;
        this.reviewActions = reviewActions;
    }

    @Transactional(readOnly = true)
    public Page<ExerciseDraft> list(ContentStatus status, Pageable pageable) {
        return status == null ? drafts.findAll(pageable) : drafts.findByStatus(status, pageable);
    }

    @Transactional(readOnly = true)
    public ExerciseDraft get(UUID id) {
        return drafts.findById(id).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "exercise not found"));
    }

    @Transactional
    public ExerciseDraft create(ExerciseUpsertRequest req, CmsUserPrincipal actor) {
        Instant now = Instant.now();
        ExerciseDraft d = ExerciseDraft.builder()
                .id(UUID.randomUUID())
                .nameZh(req.nameZh())
                .nameEn(req.nameEn())
                .description(req.description())
                .difficulty(req.difficulty())
                .videoUrl(req.videoUrl())
                .videoSizeBytes(req.videoSizeBytes())
                .thumbnailUrl(req.thumbnailUrl())
                .equipment(new ArrayList<>(req.equipment()))
                .primaryMuscles(new ArrayList<>(req.primaryMuscles()))
                .secondaryMuscles(new ArrayList<>(req.secondaryMuscles() == null ? List.of() : req.secondaryMuscles()))
                .category(req.category())
                .status(ContentStatus.DRAFT)
                .currentVersion(0)
                .createdBy(actor.id())
                .updatedBy(actor.id())
                .createdAt(now)
                .updatedAt(now)
                .build();
        return drafts.save(d);
    }

    @Transactional
    public ExerciseDraft update(UUID id, ExerciseUpsertRequest req, CmsUserPrincipal actor) {
        ExerciseDraft d = get(id);
        if (d.getStatus() == ContentStatus.IN_REVIEW) {
            throw new ResponseStatusException(CONFLICT, "cannot edit while IN_REVIEW");
        }
        d.setNameZh(req.nameZh());
        d.setNameEn(req.nameEn());
        d.setDescription(req.description());
        d.setDifficulty(req.difficulty());
        d.setVideoUrl(req.videoUrl());
        d.setVideoSizeBytes(req.videoSizeBytes());
        d.setThumbnailUrl(req.thumbnailUrl());
        d.setEquipment(new ArrayList<>(req.equipment()));
        d.setPrimaryMuscles(new ArrayList<>(req.primaryMuscles()));
        d.setSecondaryMuscles(new ArrayList<>(req.secondaryMuscles() == null ? List.of() : req.secondaryMuscles()));
        d.setCategory(req.category());
        if (d.getStatus() == ContentStatus.PUBLISHED) {
            // Editing a published entity starts a new draft cycle
            d.setStatus(ContentStatus.DRAFT);
        }
        d.setUpdatedBy(actor.id());
        d.setUpdatedAt(Instant.now());
        return drafts.save(d);
    }

    @Transactional
    public void delete(UUID id, CmsUserPrincipal actor) {
        ExerciseDraft d = get(id);
        if (d.getStatus() != ContentStatus.DRAFT) {
            throw new ResponseStatusException(CONFLICT, "only DRAFT exercises can be deleted");
        }
        // soft check: if already published, keep published row intact; we only delete the draft
        drafts.delete(d);
    }

    @Transactional
    public ExerciseDraft submit(UUID id, String comment, CmsUserPrincipal actor) {
        ExerciseDraft d = get(id);
        if (d.getStatus() != ContentStatus.DRAFT) {
            throw new ResponseStatusException(CONFLICT, "only DRAFT can be submitted");
        }
        d.setStatus(ContentStatus.IN_REVIEW);
        d.setUpdatedBy(actor.id());
        d.setUpdatedAt(Instant.now());
        recordAction(d.getId(), ReviewActionType.SUBMIT, comment, actor);
        return drafts.save(d);
    }

    @Transactional
    public ExerciseDraft approve(UUID id, String comment, CmsUserPrincipal actor) {
        ExerciseDraft d = get(id);
        if (d.getStatus() != ContentStatus.IN_REVIEW) {
            throw new ResponseStatusException(CONFLICT, "only IN_REVIEW can be approved");
        }
        int newVersion = d.getCurrentVersion() + 1;
        Instant now = Instant.now();
        d.setCurrentVersion(newVersion);
        d.setStatus(ContentStatus.PUBLISHED);
        d.setUpdatedBy(actor.id());
        d.setUpdatedAt(now);
        drafts.save(d);

        ExercisePublished p = published.findByDraftId(d.getId())
                .orElseGet(() -> {
                    ExercisePublished fresh = new ExercisePublished();
                    fresh.setId(d.getId()); // keep id == draftId to give app a stable uuid
                    fresh.setDraftId(d.getId());
                    fresh.setPublishedAt(now);
                    return fresh;
                });
        p.setVersion(newVersion);
        p.setNameZh(d.getNameZh());
        p.setNameEn(d.getNameEn());
        p.setDescription(d.getDescription());
        p.setDifficulty(d.getDifficulty());
        p.setVideoUrl(d.getVideoUrl());
        p.setVideoSizeBytes(d.getVideoSizeBytes());
        p.setThumbnailUrl(d.getThumbnailUrl());
        p.setEquipment(new ArrayList<>(d.getEquipment()));
        p.setPrimaryMuscles(new ArrayList<>(d.getPrimaryMuscles()));
        p.setSecondaryMuscles(new ArrayList<>(d.getSecondaryMuscles()));
        p.setCategory(d.getCategory());
        p.setActive(true);
        p.setPublishedBy(actor.id());
        p.setPublishedAt(now);
        p.setUpdatedAt(now);
        published.save(p);

        recordAction(d.getId(), ReviewActionType.APPROVE, comment, actor);
        recordAction(d.getId(), ReviewActionType.PUBLISH, null, actor);
        return d;
    }

    @Transactional
    public ExerciseDraft reject(UUID id, String comment, CmsUserPrincipal actor) {
        ExerciseDraft d = get(id);
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

    private void recordAction(UUID entityId, ReviewActionType action, String comment, CmsUserPrincipal actor) {
        ReviewAction a = ReviewAction.builder()
                .entityType(EntityType.EXERCISE)
                .entityId(entityId)
                .action(action)
                .comment(comment)
                .performedBy(actor.id())
                .performedAt(Instant.now())
                .build();
        reviewActions.save(a);
    }
}
