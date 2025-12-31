-- Migration: Drop Deprecated Town-Based Tables
-- Description: Removes old town-based tables that have been replaced by neighbourhood-based tables
-- 
-- WARNING: Before running this migration, ensure:
-- 1. All data has been migrated to new tables (agg_neighbourhood_monthly, neighbourhood_access, etc.)
-- 2. Application code has been updated to use new tables
-- 3. All queries have been tested with new tables
--
-- Tables to be dropped:
-- - agg_monthly (replaced by agg_neighbourhood_monthly)
-- - town_time_access (replaced by neighbourhood_access)
-- - town_neighbourhood_mapping (transitional table, no longer needed after migration)

-- ============================================
-- 2. Drop town_time_access (replaced by neighbourhood_access)
-- ============================================
-- Drop policies first
DROP POLICY IF EXISTS "Allow public read access" ON town_time_access;

-- Drop the table
DROP TABLE IF EXISTS town_time_access CASCADE;

-- ============================================
-- 3. Drop agg_monthly (replaced by agg_neighbourhood_monthly)
-- ============================================
-- Drop policies first
DROP POLICY IF EXISTS "Allow public read access" ON agg_monthly;

-- Drop the aggregation function that uses this table
DROP FUNCTION IF EXISTS aggregate_monthly_data() CASCADE;

-- Drop the table
DROP TABLE IF EXISTS agg_monthly CASCADE;

-- ============================================
-- Verification: Check if any remaining references exist
-- ============================================
-- This query will show any remaining foreign key references to dropped tables
-- Run this after migration to verify cleanup
DO $$
DECLARE
  remaining_refs TEXT;
BEGIN
  -- Check for any views or functions that might reference dropped tables
  SELECT string_agg(
    'View/Function: ' || schemaname || '.' || viewname || ' might reference dropped tables',
    E'\n'
  ) INTO remaining_refs
  FROM pg_views
  WHERE definition LIKE '%agg_monthly%'
     OR definition LIKE '%town_time_access%'
     OR definition LIKE '%town_neighbourhood_mapping%';
  
  IF remaining_refs IS NOT NULL THEN
    RAISE NOTICE 'Warning: Found potential references to dropped tables: %', remaining_refs;
  ELSE
    RAISE NOTICE 'Successfully dropped deprecated tables. No remaining references found.';
  END IF;
END $$;

