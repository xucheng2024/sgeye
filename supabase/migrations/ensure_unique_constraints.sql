-- Migration: Ensure Unique Constraints on Neighbourhood Tables
-- Description: Verifies and creates unique constraints/indexes if missing
-- This ensures data integrity for neighbourhood-based aggregations

-- ============================================
-- Ensure unique constraint on agg_neighbourhood_monthly
-- ============================================
-- Create unique index if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS idx_agg_neighbourhood_monthly_unique 
ON agg_neighbourhood_monthly(month, neighbourhood_id, flat_type);

-- ============================================
-- Verify foreign key constraints are in place
-- ============================================
-- These should already exist from previous migrations, but we verify them here
DO $$
BEGIN
  -- Check if foreign key exists, if not create it (though it should already exist)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'agg_neighbourhood_monthly_neighbourhood_id_fkey'
  ) THEN
    ALTER TABLE agg_neighbourhood_monthly
    ADD CONSTRAINT agg_neighbourhood_monthly_neighbourhood_id_fkey
    FOREIGN KEY (neighbourhood_id) REFERENCES neighbourhoods(id) ON DELETE CASCADE;
  END IF;
END $$;

