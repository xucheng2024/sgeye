-- Migration: Drop agg_monthly table
-- Description: Removes deprecated town-based aggregation table
-- 
-- This table has been replaced by agg_neighbourhood_monthly
-- All application code has been migrated to use neighbourhood-based aggregation
--
-- Verification:
-- - No application code references agg_monthly (confirmed)
-- - Table is empty (0 records)
-- - Replacement table agg_neighbourhood_monthly is fully populated (45,067 records)

-- Drop RLS policy
DROP POLICY IF EXISTS "Allow public read access" ON agg_monthly;

-- Drop the aggregation function that uses this table (if exists)
DROP FUNCTION IF EXISTS aggregate_monthly_data() CASCADE;

-- Drop the table
DROP TABLE IF EXISTS agg_monthly CASCADE;

-- Add comment for audit trail
COMMENT ON SCHEMA public IS 'agg_monthly table dropped - replaced by agg_neighbourhood_monthly';

