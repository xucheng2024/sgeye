-- Migration: Calculate variance_level from actual HDB transaction data
-- Description: Uses price spread, lease spread as proxies for variance
--              Implements the variance_level calculation logic

-- ============================================
-- Step 1: Calculate neighbourhood statistics
-- ============================================
CREATE TEMP TABLE IF NOT EXISTS neighbourhood_variance_stats AS
SELECT 
  n.id as neighbourhood_id,
  n.name as neighbourhood_name,
  -- Price spread: (p75 - p25) / median
  CASE 
    WHEN PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.median_price) FILTER (WHERE a.median_price > 0) > 0
    THEN (PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY a.median_price) FILTER (WHERE a.median_price > 0) - 
          PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY a.median_price) FILTER (WHERE a.median_price > 0)) / 
         NULLIF(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.median_price) FILTER (WHERE a.median_price > 0), 0)
    ELSE NULL
  END as price_spread,
  -- PSM spread: (p75 - p25) / median
  CASE 
    WHEN PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.median_psm) FILTER (WHERE a.median_psm > 0) > 0
    THEN (PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY a.median_psm) FILTER (WHERE a.median_psm > 0) - 
          PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY a.median_psm) FILTER (WHERE a.median_psm > 0)) / 
         NULLIF(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.median_psm) FILTER (WHERE a.median_psm > 0), 0)
    ELSE NULL
  END as psm_spread,
  -- Lease spread: p75 - p25 (years)
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY a.median_lease_years) FILTER (WHERE a.median_lease_years IS NOT NULL) - 
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY a.median_lease_years) FILTER (WHERE a.median_lease_years IS NOT NULL) as lease_spread,
  -- Check for pocket variation drivers
  EXISTS (
    SELECT 1 FROM neighbourhood_living_notes ln
    WHERE ln.neighbourhood_name = n.name
      AND ln.drivers && ARRAY['pocket_choice_matters', 'pocket_variation_high']
  ) as has_pocket_variation_driver
FROM neighbourhoods n
LEFT JOIN agg_neighbourhood_monthly a ON a.neighbourhood_id = n.id
WHERE a.month >= CURRENT_DATE - INTERVAL '12 months'
  AND a.tx_count > 0
GROUP BY n.id, n.name;

-- ============================================
-- Step 2: Update variance_level based on stats
-- ============================================
UPDATE neighbourhood_living_notes ln
SET
  variance_level = CASE
    -- Rule: If has pocket variation driver, minimum moderate
    WHEN ns.has_pocket_variation_driver THEN
      CASE
        WHEN (ns.price_spread IS NOT NULL AND ns.price_spread >= 0.35) OR
             (ns.lease_spread IS NOT NULL AND ns.lease_spread >= 15)
        THEN 'spread_out'
        ELSE 'moderate'
      END
    -- Compact criteria: low spread on all dimensions
    WHEN (ns.price_spread IS NULL OR ns.price_spread < 0.20) AND
         (ns.lease_spread IS NULL OR ns.lease_spread < 8)
    THEN 'compact'
    -- Spread out criteria: high spread on any dimension
    WHEN (ns.price_spread IS NOT NULL AND ns.price_spread >= 0.35) OR
         (ns.lease_spread IS NOT NULL AND ns.lease_spread >= 15)
    THEN 'spread_out'
    -- Default to moderate
    ELSE 'moderate'
  END,
  updated_at = NOW()
FROM neighbourhood_variance_stats ns
WHERE ln.neighbourhood_name = ns.neighbourhood_name
  AND ln.rating_mode = 'residential_scored'
  AND ns.neighbourhood_id IS NOT NULL;

-- ============================================
-- Step 3: Show summary of updates
-- ============================================
SELECT 
  variance_level,
  COUNT(*) as count
FROM neighbourhood_living_notes
WHERE rating_mode = 'residential_scored'
GROUP BY variance_level
ORDER BY count DESC;

-- ============================================
-- Step 4: Show examples of calculated variance
-- ============================================
SELECT 
  ln.neighbourhood_name,
  ln.variance_level,
  ns.price_spread,
  ns.lease_spread,
  ns.has_pocket_variation_driver
FROM neighbourhood_living_notes ln
JOIN neighbourhood_variance_stats ns ON ns.neighbourhood_name = ln.neighbourhood_name
WHERE ln.rating_mode = 'residential_scored'
ORDER BY ln.variance_level, ln.neighbourhood_name
LIMIT 20;

