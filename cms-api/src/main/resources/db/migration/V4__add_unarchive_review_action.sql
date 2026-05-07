-- ---------------------------------------------------------------
-- V4: Allow UNARCHIVE in review_actions.action CHECK constraint
-- ---------------------------------------------------------------
ALTER TABLE review_actions DROP CONSTRAINT review_actions_action_check;
ALTER TABLE review_actions ADD CONSTRAINT review_actions_action_check
    CHECK (action IN ('SUBMIT', 'APPROVE', 'REJECT', 'PUBLISH', 'ARCHIVE', 'UNARCHIVE'));
