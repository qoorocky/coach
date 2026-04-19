-- Placeholder migration — real schema comes in Phase 1 (Step 7 of plan).
-- Using a marker table so Flyway baseline works on empty DB.
CREATE TABLE IF NOT EXISTS schema_placeholder (
    id SERIAL PRIMARY KEY,
    note TEXT NOT NULL DEFAULT 'phase 0 bootstrap',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
