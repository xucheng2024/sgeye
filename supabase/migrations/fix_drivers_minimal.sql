-- Migration: Fix drivers - MINIMAL set only (Step B)
-- Description: Only add drivers for keywords that are TRULY mentioned (not from template pollution)
--              Run this AFTER fix_template_pollution_first.sql

-- ============================================
-- Step 1: Add drivers for truly mentioned keywords (minimal set)
-- ============================================
-- Only for keywords that are explicitly mentioned, not from template pollution

-- Tourist keywords
UPDATE neighbourhood_living_notes
SET
  drivers = drivers || ARRAY['tourist_crowd'],
  updated_at = NOW()
WHERE rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['tourist_crowd'])
  AND (
    noise_density_note ~* '\btourist(s)?\b' OR
    crowd_vibe_note ~* '\btourist(s)?\b' OR
    short_note ~* '\btourist(s)?\b'
  )
  -- Exclude template pollution
  AND short_note !~* 'industrial/logistics|not designed for residential';

-- Nightlife keywords
UPDATE neighbourhood_living_notes
SET
  drivers = drivers || ARRAY['nightlife_nearby'],
  updated_at = NOW()
WHERE rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['nightlife_belt', 'nightlife_nearby'])
  AND (
    noise_density_note ~* '\bnightlife\b' OR
    crowd_vibe_note ~* '\bnightlife\b' OR
    short_note ~* '\bnightlife\b'
  )
  AND short_note !~* 'industrial/logistics|not designed for residential';

-- CBD/Downtown keywords
UPDATE neighbourhood_living_notes
SET
  drivers = CASE
    WHEN drivers && ARRAY['cbd', 'downtown'] THEN drivers
    ELSE drivers || ARRAY['downtown']
  END,
  updated_at = NOW()
WHERE rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['cbd', 'downtown'])
  AND (
    noise_density_note ~* '\b(cbd|downtown)\b' OR
    daily_convenience_note ~* '\b(cbd|downtown)\b' OR
    short_note ~* '\b(cbd|downtown)\b'
  )
  AND short_note !~* 'industrial/logistics|not designed for residential';

-- Arterial roads (only if explicitly mentioned, not just "transport")
UPDATE neighbourhood_living_notes
SET
  drivers = drivers || ARRAY['arterial_roads'],
  updated_at = NOW()
WHERE rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['arterial_roads'])
  AND (
    noise_density_note ~* '\barterial\b' OR
    noise_density_note ~* '\bmain road\b'
  )
  AND short_note !~* 'industrial/logistics|not designed for residential';

-- Heavy vehicles (only if explicitly mentioned)
UPDATE neighbourhood_living_notes
SET
  drivers = drivers || ARRAY['heavy_vehicles'],
  updated_at = NOW()
WHERE rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['heavy_vehicles'])
  AND (
    noise_density_note ~* '\bheavy (vehicles|trucks|traffic)\b' OR
    noise_density_note ~* '\bheavy vehicles\b'
  )
  AND short_note !~* 'industrial/logistics|not designed for residential';

-- Port/Logistics (ONLY if explicitly mentioned, not from "transport")
-- This should be rare for residential_scored entries
UPDATE neighbourhood_living_notes
SET
  drivers = drivers || ARRAY['port_logistics'],
  updated_at = NOW()
WHERE rating_mode = 'residential_scored'
  AND NOT (drivers && ARRAY['port_logistics', 'logistics'])
  AND (
    noise_density_note ~* '\bport\b' AND noise_density_note !~* '\btransport\b' OR
    noise_density_note ~* '\blogistics\b' AND noise_density_note !~* '\btransport\b'
  )
  AND short_note !~* 'industrial/logistics|not designed for residential';

-- ============================================
-- Step 2: Remove duplicate drivers
-- ============================================
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(drivers) ORDER BY 1),
  updated_at = NOW()
WHERE array_length(drivers, 1) > array_length(ARRAY(SELECT DISTINCT unnest(drivers)), 1);

-- ============================================
-- Step 3: Summary
-- ============================================
SELECT 
  'Drivers added' as action,
  COUNT(*) as count
FROM neighbourhood_living_notes
WHERE rating_mode = 'residential_scored'
  AND updated_at > NOW() - INTERVAL '1 minute';

