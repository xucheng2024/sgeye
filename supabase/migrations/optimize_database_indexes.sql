-- Migration: Optimize Database Indexes for Performance
-- Description: Add missing indexes and optimize existing ones for common query patterns
-- This migration improves query performance for the explore page and neighbourhood APIs

-- ============================================
-- 1. Optimize agg_neighbourhood_monthly indexes
-- ============================================
-- Current composite index is (month, neighbourhood_id, flat_type)
-- But queries filter by neighbourhood_id first, then month range, then flat_type
-- Optimal index order: (neighbourhood_id, month, flat_type)

-- Drop the less optimal composite index
DROP INDEX IF EXISTS idx_agg_neighbourhood_monthly_composite;

-- Create optimized composite index matching query pattern
-- Query pattern: .in('neighbourhood_id', ids).gte('month', start).lte('month', end).eq('flat_type', type)
CREATE INDEX IF NOT EXISTS idx_agg_neighbourhood_monthly_query_opt 
  ON agg_neighbourhood_monthly(neighbourhood_id, month, flat_type);

-- Add index for date range queries when filtering by month only
-- This helps with queries that filter by month range across all neighbourhoods
-- Note: Cannot use CURRENT_DATE in index predicate (not IMMUTABLE), so using simple DESC index
CREATE INDEX IF NOT EXISTS idx_agg_neighbourhood_monthly_month_range 
  ON agg_neighbourhood_monthly(month DESC);

-- ============================================
-- 2. Optimize neighbourhoods table indexes
-- ============================================
-- Add composite index for common filter: planning_area_id + non_residential
-- Query pattern: .eq('non_residential', false).eq('planning_area_id', id)
CREATE INDEX IF NOT EXISTS idx_neighbourhoods_planning_area_non_res 
  ON neighbourhoods(planning_area_id, non_residential) 
  WHERE non_residential = false;

-- Add index for name lookups (used in city_core filtering)
-- Using text_pattern_ops for better LIKE/pattern matching performance
CREATE INDEX IF NOT EXISTS idx_neighbourhoods_name_pattern 
  ON neighbourhoods(name text_pattern_ops);

-- ============================================
-- 3. Optimize neighbourhood_living_notes indexes
-- ============================================
-- Add index for normalized name lookups (used in city_core filtering)
-- The existing index on neighbourhood_name should help, but we can optimize further
-- Add composite index for zone_type filtering (common query pattern)
CREATE INDEX IF NOT EXISTS idx_neighbourhood_living_notes_zone_type_name 
  ON neighbourhood_living_notes(zone_type, neighbourhood_name) 
  WHERE zone_type IS NOT NULL;

-- Add index for rating_mode filtering (used to filter scored vs not_scored)
CREATE INDEX IF NOT EXISTS idx_neighbourhood_living_notes_rating_mode_name 
  ON neighbourhood_living_notes(rating_mode, neighbourhood_name) 
  WHERE rating_mode IS NOT NULL;

-- ============================================
-- 4. Optimize neighbourhood_access indexes
-- ============================================
-- The neighbourhood_id is already the primary key, so it's indexed
-- But add index for mrt_access_type filtering (common filter)
CREATE INDEX IF NOT EXISTS idx_neighbourhood_access_mrt_type 
  ON neighbourhood_access(mrt_access_type) 
  WHERE mrt_access_type IS NOT NULL;

-- ============================================
-- 5. Optimize mrt_stations indexes
-- ============================================
-- Add composite index for neighbourhood_id + station_code lookups
CREATE INDEX IF NOT EXISTS idx_mrt_stations_neighbourhood_code 
  ON mrt_stations(neighbourhood_id, station_code) 
  WHERE neighbourhood_id IS NOT NULL AND station_code IS NOT NULL;

-- ============================================
-- 6. Optimize raw_resale_2017 indexes (for aggregation queries)
-- ============================================
-- Add composite index for neighbourhood_id + month queries (used in aggregation)
CREATE INDEX IF NOT EXISTS idx_raw_resale_neighbourhood_month 
  ON raw_resale_2017(neighbourhood_id, month) 
  WHERE neighbourhood_id IS NOT NULL AND resale_price IS NOT NULL;

-- Add index for flat_type filtering in aggregation
CREATE INDEX IF NOT EXISTS idx_raw_resale_flat_type 
  ON raw_resale_2017(flat_type) 
  WHERE flat_type IS NOT NULL;

-- ============================================
-- 7. Optimize planning_areas indexes
-- ============================================
-- Add composite index for region filtering (common query pattern)
CREATE INDEX IF NOT EXISTS idx_planning_areas_region_name 
  ON planning_areas(region, name) 
  WHERE region IS NOT NULL;

-- ============================================
-- 8. Optimize subzones indexes
-- ============================================
-- Add composite index for region filtering
CREATE INDEX IF NOT EXISTS idx_subzones_region_planning_area 
  ON subzones(region, planning_area_id) 
  WHERE region IS NOT NULL;

-- ============================================
-- 9. Add indexes for foreign keys that are frequently joined
-- ============================================
-- These should already exist, but ensure they do for performance

-- bus_stops.neighbourhood_id (if not exists)
CREATE INDEX IF NOT EXISTS idx_bus_stops_neighbourhood_id 
  ON bus_stops(neighbourhood_id) 
  WHERE neighbourhood_id IS NOT NULL;

-- primary_schools.neighbourhood_id (if not exists)
CREATE INDEX IF NOT EXISTS idx_primary_schools_neighbourhood_id 
  ON primary_schools(neighbourhood_id) 
  WHERE neighbourhood_id IS NOT NULL;

-- ============================================
-- 10. Analyze tables to update statistics
-- ============================================
-- Update query planner statistics for better query plans
ANALYZE agg_neighbourhood_monthly;
ANALYZE neighbourhoods;
ANALYZE neighbourhood_living_notes;
ANALYZE neighbourhood_access;
ANALYZE mrt_stations;
ANALYZE planning_areas;
ANALYZE subzones;

-- ============================================
-- Notes on Index Strategy:
-- ============================================
-- 1. Composite indexes are ordered by selectivity (most selective first)
-- 2. Partial indexes (WHERE clauses) reduce index size and improve performance
-- 3. text_pattern_ops enables efficient pattern matching for text columns
-- 4. Date range indexes use DESC for recent data queries
-- 5. All foreign keys should have indexes for JOIN performance

