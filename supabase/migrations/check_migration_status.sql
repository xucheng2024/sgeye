-- Migration Status Check
-- Run this to verify if data migration is complete

-- ============================================
-- 1. Check if neighbourhoods table has data
-- ============================================
SELECT 
  'neighbourhoods' as table_name,
  COUNT(*) as record_count,
  CASE WHEN COUNT(*) > 0 THEN '✓ Has data' ELSE '✗ Empty' END as status
FROM neighbourhoods;

-- ============================================
-- 2. Check raw_resale_2017 neighbourhood_id population
-- ============================================
SELECT 
  'raw_resale_2017' as table_name,
  COUNT(*) as total_records,
  COUNT(neighbourhood_id) as records_with_neighbourhood_id,
  COUNT(*) - COUNT(neighbourhood_id) as records_missing_neighbourhood_id,
  ROUND(100.0 * COUNT(neighbourhood_id) / NULLIF(COUNT(*), 0), 2) as percentage_populated,
  CASE 
    WHEN COUNT(neighbourhood_id) = COUNT(*) THEN '✓ Fully migrated'
    WHEN COUNT(neighbourhood_id) > 0 THEN '⚠ Partially migrated'
    ELSE '✗ Not migrated'
  END as status
FROM raw_resale_2017;

-- ============================================
-- 3. Check primary_schools neighbourhood_id population
-- ============================================
SELECT 
  'primary_schools' as table_name,
  COUNT(*) as total_records,
  COUNT(neighbourhood_id) as records_with_neighbourhood_id,
  COUNT(*) - COUNT(neighbourhood_id) as records_missing_neighbourhood_id,
  ROUND(100.0 * COUNT(neighbourhood_id) / NULLIF(COUNT(*), 0), 2) as percentage_populated,
  CASE 
    WHEN COUNT(neighbourhood_id) = COUNT(*) THEN '✓ Fully migrated'
    WHEN COUNT(neighbourhood_id) > 0 THEN '⚠ Partially migrated'
    ELSE '✗ Not migrated'
  END as status
FROM primary_schools;

-- ============================================
-- 4. Check mrt_stations neighbourhood_id population
-- ============================================
SELECT 
  'mrt_stations' as table_name,
  COUNT(*) as total_records,
  COUNT(neighbourhood_id) as records_with_neighbourhood_id,
  COUNT(*) - COUNT(neighbourhood_id) as records_missing_neighbourhood_id,
  ROUND(100.0 * COUNT(neighbourhood_id) / NULLIF(COUNT(*), 0), 2) as percentage_populated,
  CASE 
    WHEN COUNT(neighbourhood_id) = COUNT(*) THEN '✓ Fully migrated'
    WHEN COUNT(neighbourhood_id) > 0 THEN '⚠ Partially migrated'
    ELSE '✗ Not migrated'
  END as status
FROM mrt_stations;

-- ============================================
-- 5. Check bus_stops neighbourhood_id population
-- ============================================
SELECT 
  'bus_stops' as table_name,
  COUNT(*) as total_records,
  COUNT(neighbourhood_id) as records_with_neighbourhood_id,
  COUNT(*) - COUNT(neighbourhood_id) as records_missing_neighbourhood_id,
  ROUND(100.0 * COUNT(neighbourhood_id) / NULLIF(COUNT(*), 0), 2) as percentage_populated,
  CASE 
    WHEN COUNT(neighbourhood_id) = COUNT(*) THEN '✓ Fully migrated'
    WHEN COUNT(neighbourhood_id) > 0 THEN '⚠ Partially migrated'
    ELSE '✗ Not migrated'
  END as status
FROM bus_stops;

-- ============================================
-- 6. Check agg_neighbourhood_monthly data
-- ============================================
SELECT 
  'agg_neighbourhood_monthly' as table_name,
  COUNT(*) as record_count,
  COUNT(DISTINCT neighbourhood_id) as unique_neighbourhoods,
  MIN(month) as earliest_month,
  MAX(month) as latest_month,
  CASE WHEN COUNT(*) > 0 THEN '✓ Has data' ELSE '✗ Empty' END as status
FROM agg_neighbourhood_monthly;

-- ============================================
-- 7. Check neighbourhood_access data
-- ============================================
SELECT 
  'neighbourhood_access' as table_name,
  COUNT(*) as record_count,
  COUNT(DISTINCT neighbourhood_id) as unique_neighbourhoods,
  CASE WHEN COUNT(*) > 0 THEN '✓ Has data' ELSE '✗ Empty' END as status
FROM neighbourhood_access;

-- ============================================
-- 9. Compare old vs new aggregation tables
-- ============================================
SELECT 
  'agg_monthly (old)' as table_name,
  COUNT(*) as record_count,
  MIN(month) as earliest_month,
  MAX(month) as latest_month
FROM agg_monthly
UNION ALL
SELECT 
  'agg_neighbourhood_monthly (new)' as table_name,
  COUNT(*) as record_count,
  MIN(month) as earliest_month,
  MAX(month) as latest_month
FROM agg_neighbourhood_monthly;

-- ============================================
-- 10. Check if raw_resale_2017 has coordinates
-- ============================================
SELECT 
  'raw_resale_2017 coordinates' as check_type,
  COUNT(*) as total_records,
  COUNT(latitude) as records_with_latitude,
  COUNT(longitude) as records_with_longitude,
  COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as records_with_both_coords,
  ROUND(100.0 * COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) / NULLIF(COUNT(*), 0), 2) as percentage_with_coords,
  CASE 
    WHEN COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) = COUNT(*) THEN '✓ All have coordinates'
    WHEN COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) > 0 THEN '⚠ Some missing coordinates'
    ELSE '✗ No coordinates'
  END as status
FROM raw_resale_2017;

