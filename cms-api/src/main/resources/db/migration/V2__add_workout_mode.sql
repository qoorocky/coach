-- ---------------------------------------------------------------
-- V2: Add workout mode (standard / tabata / emom / amrap)
-- ---------------------------------------------------------------
ALTER TABLE workout_drafts
    ADD COLUMN mode VARCHAR(20) NOT NULL DEFAULT 'standard'
    CHECK (mode IN ('standard', 'tabata', 'emom', 'amrap'));

ALTER TABLE workouts_published
    ADD COLUMN mode VARCHAR(20) NOT NULL DEFAULT 'standard'
    CHECK (mode IN ('standard', 'tabata', 'emom', 'amrap'));
