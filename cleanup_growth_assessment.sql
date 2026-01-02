-- Cleanup script for removing growth assessment data and functions
-- Run this to completely remove growth assessment functionality from database

-- Step 1: Drop the function first (since it references the table)
DROP FUNCTION IF EXISTS calculate_neighbourhood_growth_assessment();

-- Step 2: Drop the helper function
DROP FUNCTION IF EXISTS parse_lease_years(TEXT);

-- Step 3: Drop the table (this will also drop all indexes and constraints)
DROP TABLE IF EXISTS neighbourhood_growth_assessment CASCADE;

-- Verify cleanup
SELECT 
    'Tables remaining' as check_type,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'neighbourhood_growth_assessment'
UNION ALL
SELECT 
    'Functions remaining' as check_type,
    COUNT(*) as count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('calculate_neighbourhood_growth_assessment', 'parse_lease_years');

-- Expected result: Both counts should be 0 if cleanup was successful

