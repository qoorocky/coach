-- Phase 1 M1: Core CMS schema (spec §9.5)
-- Tables: cms_users, exercise_drafts, exercises_published,
--         workout_drafts, workout_draft_segments,
--         workouts_published, workout_published_segments,
--         content_version_history, review_actions, audit_logs

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------
-- CMS users
-- ---------------------------------------------------------------
CREATE TABLE cms_users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    name            VARCHAR(100) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL
                    CHECK (role IN ('EDITOR', 'REVIEWER', 'ADMIN')),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- Exercise drafts / published
-- ---------------------------------------------------------------
CREATE TABLE exercise_drafts (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_zh            VARCHAR(100) NOT NULL,
    name_en            VARCHAR(100) NOT NULL,
    description        TEXT         NOT NULL,
    difficulty         VARCHAR(20)  NOT NULL
                       CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    video_url          VARCHAR(500),
    video_size_bytes   BIGINT,
    thumbnail_url      VARCHAR(500),
    equipment          JSONB        NOT NULL DEFAULT '["none"]'::jsonb,
    primary_muscles    JSONB        NOT NULL,
    secondary_muscles  JSONB        NOT NULL DEFAULT '[]'::jsonb,
    category           VARCHAR(50),
    status             VARCHAR(20)  NOT NULL DEFAULT 'DRAFT'
                       CHECK (status IN ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED')),
    current_version    INTEGER      NOT NULL DEFAULT 0,
    created_by         BIGINT       NOT NULL REFERENCES cms_users(id),
    updated_by         BIGINT       REFERENCES cms_users(id),
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercise_drafts_status       ON exercise_drafts(status);
CREATE INDEX idx_exercise_drafts_created_by   ON exercise_drafts(created_by);
CREATE INDEX idx_exercise_drafts_updated_at   ON exercise_drafts(updated_at DESC);

CREATE TABLE exercises_published (
    id                 UUID         PRIMARY KEY,
    draft_id           UUID         NOT NULL REFERENCES exercise_drafts(id),
    version            INTEGER      NOT NULL,
    name_zh            VARCHAR(100) NOT NULL,
    name_en            VARCHAR(100) NOT NULL,
    description        TEXT         NOT NULL,
    difficulty         VARCHAR(20)  NOT NULL,
    video_url          VARCHAR(500),
    video_size_bytes   BIGINT,
    thumbnail_url      VARCHAR(500),
    equipment          JSONB        NOT NULL DEFAULT '["none"]'::jsonb,
    primary_muscles    JSONB        NOT NULL,
    secondary_muscles  JSONB        NOT NULL DEFAULT '[]'::jsonb,
    category           VARCHAR(50),
    is_active          BOOLEAN      NOT NULL DEFAULT TRUE,
    published_by       BIGINT       NOT NULL REFERENCES cms_users(id),
    published_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercises_published_active     ON exercises_published(is_active);
CREATE INDEX idx_exercises_published_updated_at ON exercises_published(updated_at DESC);

-- ---------------------------------------------------------------
-- Workout drafts / published (+ segments)
-- ---------------------------------------------------------------
CREATE TABLE workout_drafts (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                   VARCHAR(100) NOT NULL,
    description            TEXT         NOT NULL DEFAULT '',
    cover_image_url        VARCHAR(500),
    difficulty             VARCHAR(20)  NOT NULL
                           CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration_sec INTEGER      NOT NULL DEFAULT 0,
    estimated_calories     INTEGER      NOT NULL DEFAULT 0,
    tags                   JSONB        NOT NULL DEFAULT '[]'::jsonb,
    created_by_type        VARCHAR(10)  NOT NULL DEFAULT 'system'
                           CHECK (created_by_type IN ('system', 'user')),
    status                 VARCHAR(20)  NOT NULL DEFAULT 'DRAFT'
                           CHECK (status IN ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED')),
    current_version        INTEGER      NOT NULL DEFAULT 0,
    created_by             BIGINT       NOT NULL REFERENCES cms_users(id),
    updated_by             BIGINT       REFERENCES cms_users(id),
    created_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workout_drafts_status       ON workout_drafts(status);
CREATE INDEX idx_workout_drafts_created_by   ON workout_drafts(created_by);
CREATE INDEX idx_workout_drafts_updated_at   ON workout_drafts(updated_at DESC);

CREATE TABLE workout_draft_segments (
    segment_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_draft_id  UUID    NOT NULL REFERENCES workout_drafts(id) ON DELETE CASCADE,
    exercise_id       UUID    NOT NULL, -- points to exercise_drafts.id OR exercises_published.id (validated in service)
    order_index       INTEGER NOT NULL,
    duration_sec      INTEGER NOT NULL,
    rest_after_sec    INTEGER NOT NULL DEFAULT 0,
    rounds            INTEGER NOT NULL DEFAULT 1,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_workout_draft_segments_order
    ON workout_draft_segments(workout_draft_id, order_index);
CREATE INDEX idx_workout_draft_segments_workout
    ON workout_draft_segments(workout_draft_id);

CREATE TABLE workouts_published (
    id                     UUID PRIMARY KEY,
    draft_id               UUID         NOT NULL REFERENCES workout_drafts(id),
    version                INTEGER      NOT NULL,
    name                   VARCHAR(100) NOT NULL,
    description            TEXT         NOT NULL DEFAULT '',
    cover_image_url        VARCHAR(500),
    difficulty             VARCHAR(20)  NOT NULL,
    estimated_duration_sec INTEGER      NOT NULL DEFAULT 0,
    estimated_calories     INTEGER      NOT NULL DEFAULT 0,
    tags                   JSONB        NOT NULL DEFAULT '[]'::jsonb,
    created_by_type        VARCHAR(10)  NOT NULL DEFAULT 'system',
    is_active              BOOLEAN      NOT NULL DEFAULT TRUE,
    published_by           BIGINT       NOT NULL REFERENCES cms_users(id),
    published_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workouts_published_active     ON workouts_published(is_active);
CREATE INDEX idx_workouts_published_updated_at ON workouts_published(updated_at DESC);

CREATE TABLE workout_published_segments (
    segment_id            UUID PRIMARY KEY,
    workout_published_id  UUID    NOT NULL REFERENCES workouts_published(id) ON DELETE CASCADE,
    exercise_id           UUID    NOT NULL REFERENCES exercises_published(id),
    order_index           INTEGER NOT NULL,
    duration_sec          INTEGER NOT NULL,
    rest_after_sec        INTEGER NOT NULL DEFAULT 0,
    rounds                INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_workout_pub_segments_order
    ON workout_published_segments(workout_published_id, order_index);
CREATE INDEX idx_workout_pub_segments_workout
    ON workout_published_segments(workout_published_id);

-- ---------------------------------------------------------------
-- Version history
-- ---------------------------------------------------------------
CREATE TABLE content_version_history (
    id             BIGSERIAL   PRIMARY KEY,
    entity_type    VARCHAR(20) NOT NULL
                   CHECK (entity_type IN ('EXERCISE', 'WORKOUT')),
    entity_id      UUID        NOT NULL,
    version        INTEGER     NOT NULL,
    snapshot       JSONB       NOT NULL,
    published_by   BIGINT      NOT NULL REFERENCES cms_users(id),
    published_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (entity_type, entity_id, version)
);

CREATE INDEX idx_version_history_entity
    ON content_version_history(entity_type, entity_id, version DESC);

-- ---------------------------------------------------------------
-- Review actions
-- ---------------------------------------------------------------
CREATE TABLE review_actions (
    id             BIGSERIAL   PRIMARY KEY,
    entity_type    VARCHAR(20) NOT NULL
                   CHECK (entity_type IN ('EXERCISE', 'WORKOUT')),
    entity_id      UUID        NOT NULL,
    action         VARCHAR(20) NOT NULL
                   CHECK (action IN ('SUBMIT', 'APPROVE', 'REJECT', 'PUBLISH', 'ARCHIVE')),
    comment        TEXT,
    performed_by   BIGINT      NOT NULL REFERENCES cms_users(id),
    performed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_review_actions_entity
    ON review_actions(entity_type, entity_id, performed_at DESC);
CREATE INDEX idx_review_actions_performer
    ON review_actions(performed_by);

-- ---------------------------------------------------------------
-- Audit logs
-- ---------------------------------------------------------------
CREATE TABLE audit_logs (
    id            BIGSERIAL   PRIMARY KEY,
    user_id       BIGINT      NOT NULL REFERENCES cms_users(id),
    action        VARCHAR(50) NOT NULL,
    entity_type   VARCHAR(20),
    entity_id     UUID,
    metadata      JSONB,
    ip_address    INET,
    performed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user        ON audit_logs(user_id, performed_at DESC);
CREATE INDEX idx_audit_logs_entity      ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_performed   ON audit_logs(performed_at DESC);
