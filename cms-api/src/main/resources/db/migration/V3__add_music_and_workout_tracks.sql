-- ---------------------------------------------------------------
-- V3: Music tracks (no lifecycle) + workout track binding
-- ---------------------------------------------------------------
CREATE TABLE music_tracks (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(200) NOT NULL,
    artist           VARCHAR(200),
    bpm              INTEGER,
    duration_sec     INTEGER      NOT NULL DEFAULT 0,
    file_url         VARCHAR(500) NOT NULL,
    file_size_bytes  BIGINT       NOT NULL DEFAULT 0,
    mime_type        VARCHAR(50)  NOT NULL,
    license          VARCHAR(50)  NOT NULL,
    license_url      VARCHAR(500),
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_by       BIGINT       NOT NULL REFERENCES cms_users(id),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_music_tracks_active     ON music_tracks(is_active);
CREATE INDEX idx_music_tracks_updated_at ON music_tracks(updated_at DESC);

ALTER TABLE workout_drafts
    ADD COLUMN track_ids JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE workouts_published
    ADD COLUMN track_ids JSONB NOT NULL DEFAULT '[]'::jsonb;
