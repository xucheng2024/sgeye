-- Migration: Add 'neighbourhood' context to user_feedback table
-- Description: Allows feedback to be submitted from neighbourhood detail pages

-- Drop the existing CHECK constraint
ALTER TABLE user_feedback DROP CONSTRAINT IF EXISTS user_feedback_context_check;

-- Add new CHECK constraint with 'neighbourhood' context
ALTER TABLE user_feedback ADD CONSTRAINT user_feedback_context_check 
  CHECK (context IN ('affordability', 'compare', 'home', 'neighbourhood'));

-- Add GIN index on metadata for efficient neighbourhood_id queries
CREATE INDEX IF NOT EXISTS idx_user_feedback_metadata_gin ON user_feedback USING GIN (metadata);

