-- Migration: Add review status fields to neighbourhood_living_notes
-- Description: Track review workflow for data quality assurance
--              Allows tracking which items need review, have been reviewed, etc.

-- Add review_status field
ALTER TABLE neighbourhood_living_notes
ADD COLUMN IF NOT EXISTS review_status TEXT CHECK (review_status IN ('auto_ok', 'needs_review', 'reviewed_ok', 'reviewed_not_scored')) DEFAULT 'auto_ok';

-- Add review_reason field (text description of why it needs review)
ALTER TABLE neighbourhood_living_notes
ADD COLUMN IF NOT EXISTS review_reason TEXT;

-- Add reviewed_at timestamp
ALTER TABLE neighbourhood_living_notes
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Add reviewed_by field (optional, for tracking who reviewed)
ALTER TABLE neighbourhood_living_notes
ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

-- Create index for filtering by review status
CREATE INDEX IF NOT EXISTS idx_neighbourhood_living_notes_review_status 
ON neighbourhood_living_notes(review_status);

-- Add comments
COMMENT ON COLUMN neighbourhood_living_notes.review_status IS 
'Review workflow status: auto_ok (auto-approved), needs_review (flagged for review), reviewed_ok (reviewed and approved), reviewed_not_scored (reviewed and changed to not_scored)';

COMMENT ON COLUMN neighbourhood_living_notes.review_reason IS 
'Reason why this item needs review or was reviewed';

COMMENT ON COLUMN neighbourhood_living_notes.reviewed_at IS 
'Timestamp when this item was reviewed';

COMMENT ON COLUMN neighbourhood_living_notes.reviewed_by IS 
'Identifier of who reviewed this item (optional)';

-- Set initial review_status based on zone_type and rating_mode
-- Auto-approve non-residential zones that are correctly marked
UPDATE neighbourhood_living_notes
SET review_status = 'auto_ok',
    review_reason = 'Auto-approved: non-residential zone correctly marked as not_scored'
WHERE zone_type IN ('industrial', 'nature', 'offshore')
  AND rating_mode = 'not_scored';

-- Mark business_park entries that are residential_scored as needing review
UPDATE neighbourhood_living_notes
SET review_status = 'needs_review',
    review_reason = 'Business park marked as residential_scored (should usually be not_scored)'
WHERE zone_type = 'business_park'
  AND rating_mode = 'residential_scored';

