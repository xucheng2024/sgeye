#!/usr/bin/env ts-node
/**
 * Calculate variance_level based on actual HDB transaction data
 * Uses price spread, lease spread, and MRT distance spread as proxies
 */

import * as fs from 'fs';

// This would typically query the database
// For now, this is a template showing the calculation logic

interface NeighbourhoodStats {
  neighbourhood_id: string;
  neighbourhood_name: string;
  price_spread?: number; // (p75 - p25) / median
  psm_spread?: number;   // (p75 - p25) / median
  lease_spread?: number; // p75 - p25 (years)
  mrt_dist_spread?: number; // p75 - p25 (meters)
  has_pocket_variation_driver?: boolean;
}

type VarianceLevel = 'compact' | 'moderate' | 'spread_out';

function calculateVarianceLevel(stats: NeighbourhoodStats): VarianceLevel {
  // Rule: If drivers have pocket_choice_matters or pocket_variation_high, 
  //       minimum is moderate, usually spread_out
  if (stats.has_pocket_variation_driver) {
    // Check if it's clearly spread_out based on data
    if (stats.price_spread && stats.price_spread >= 0.35) {
      return 'spread_out';
    }
    if (stats.lease_spread && stats.lease_spread >= 15) {
      return 'spread_out';
    }
    if (stats.mrt_dist_spread && stats.mrt_dist_spread >= 700) {
      return 'spread_out';
    }
    // Otherwise moderate
    return 'moderate';
  }
  
  // Compact criteria
  const isCompact = 
    (stats.price_spread === undefined || stats.price_spread < 0.20) &&
    (stats.lease_spread === undefined || stats.lease_spread < 8) &&
    (stats.mrt_dist_spread === undefined || stats.mrt_dist_spread < 350);
  
  if (isCompact) {
    return 'compact';
  }
  
  // Spread out criteria
  const isSpreadOut =
    (stats.price_spread !== undefined && stats.price_spread >= 0.35) ||
    (stats.lease_spread !== undefined && stats.lease_spread >= 15) ||
    (stats.mrt_dist_spread !== undefined && stats.mrt_dist_spread >= 700);
  
  if (isSpreadOut) {
    return 'spread_out';
  }
  
  // Default to moderate
  return 'moderate';
}

// SQL query to calculate variance_level from actual data
const SQL_TEMPLATE = `
-- Calculate variance_level based on actual transaction data
WITH neighbourhood_stats AS (
  SELECT 
    n.id as neighbourhood_id,
    n.name as neighbourhood_name,
    -- Price spread
    CASE 
      WHEN PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.median_price) > 0
      THEN (PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY a.median_price) - 
            PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY a.median_price)) / 
           PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.median_price)
      ELSE NULL
    END as price_spread,
    -- PSM spread
    CASE 
      WHEN PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.median_psm) > 0
      THEN (PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY a.median_psm) - 
            PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY a.median_psm)) / 
           PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.median_psm)
      ELSE NULL
    END as psm_spread,
    -- Lease spread (years)
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY a.median_lease_years) - 
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY a.median_lease_years) as lease_spread,
    -- Check for pocket variation drivers
    EXISTS (
      SELECT 1 FROM neighbourhood_living_notes ln
      WHERE ln.neighbourhood_name = n.name
        AND ln.drivers && ARRAY['pocket_choice_matters', 'pocket_variation_high']
    ) as has_pocket_variation_driver
  FROM neighbourhoods n
  LEFT JOIN agg_neighbourhood_monthly a ON a.neighbourhood_id = n.id
  WHERE a.month >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY n.id, n.name
)
UPDATE neighbourhood_living_notes ln
SET
  variance_level = CASE
    -- If has pocket variation driver, minimum moderate
    WHEN ns.has_pocket_variation_driver THEN
      CASE
        WHEN ns.price_spread >= 0.35 OR ns.lease_spread >= 15 OR ns.mrt_dist_spread >= 700
        THEN 'spread_out'
        ELSE 'moderate'
      END
    -- Compact criteria
    WHEN (ns.price_spread IS NULL OR ns.price_spread < 0.20) AND
         (ns.lease_spread IS NULL OR ns.lease_spread < 8) AND
         (ns.mrt_dist_spread IS NULL OR ns.mrt_dist_spread < 350)
    THEN 'compact'
    -- Spread out criteria
    WHEN ns.price_spread >= 0.35 OR ns.lease_spread >= 15 OR ns.mrt_dist_spread >= 700
    THEN 'spread_out'
    -- Default
    ELSE 'moderate'
  END,
  updated_at = NOW()
FROM neighbourhood_stats ns
WHERE ln.neighbourhood_name = ns.neighbourhood_name
  AND ln.rating_mode = 'residential_scored';
`;

console.log('Variance level calculation SQL template:');
console.log(SQL_TEMPLATE);

export { calculateVarianceLevel, SQL_TEMPLATE };

