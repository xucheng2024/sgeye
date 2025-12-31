-- Migration: Drop Rental Tables
-- Description: Removes all rental-related tables that are no longer used
-- This completes the removal of rental functionality from the application

-- ============================================
-- 1. Drop neighbourhood_rental_stats table
-- ============================================
-- Drop policies first
DROP POLICY IF EXISTS "Allow public read access" ON neighbourhood_rental_stats;

-- Drop indexes
DROP INDEX IF EXISTS idx_neighbourhood_rental_month;
DROP INDEX IF EXISTS idx_neighbourhood_rental_neighbourhood;
DROP INDEX IF EXISTS idx_neighbourhood_rental_flat_type;
DROP INDEX IF EXISTS idx_neighbourhood_rental_composite;
DROP INDEX IF EXISTS idx_neighbourhood_rental_stats_unique;

-- Drop the table
DROP TABLE IF EXISTS neighbourhood_rental_stats CASCADE;

-- ============================================
-- 2. Drop hdb_rental_stats table
-- ============================================
-- Drop policies first
DROP POLICY IF EXISTS "Allow public read access" ON hdb_rental_stats;

-- Drop indexes
DROP INDEX IF EXISTS idx_rental_month;
DROP INDEX IF EXISTS idx_rental_town;
DROP INDEX IF EXISTS idx_rental_flat_type;
DROP INDEX IF EXISTS idx_rental_neighbourhood;

-- Drop the table
DROP TABLE IF EXISTS hdb_rental_stats CASCADE;

-- ============================================
-- 3. Drop town_neighbourhood_mapping table (if exists)
-- ============================================
-- This was a transitional table for rental data migration
DROP TABLE IF EXISTS town_neighbourhood_mapping CASCADE;

-- ============================================
-- Verification: Check if tables are dropped
-- ============================================
DO $$
DECLARE
  rental_tables_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO rental_tables_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND (table_name = 'hdb_rental_stats' 
         OR table_name = 'neighbourhood_rental_stats'
         OR table_name = 'town_neighbourhood_mapping');
  
  IF rental_tables_count > 0 THEN
    RAISE NOTICE 'Warning: % rental-related table(s) still exist', rental_tables_count;
  ELSE
    RAISE NOTICE 'Successfully dropped all rental-related tables.';
  END IF;
END $$;

