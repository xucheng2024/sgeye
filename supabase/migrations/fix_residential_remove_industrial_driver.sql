-- Migration: Remove industrial driver from residential areas
-- Description: 
--   These are residential areas that have "industrial" in their drivers,
--   but they should remain residential_scored. The "industrial" driver
--   indicates nearby industrial influence, not that the area itself is industrial.
--   We should remove the "industrial" driver to avoid confusion.

BEGIN;

-- ANG MO KIO: Remove industrial driver (residential area with nearby industrial zones)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(
    SELECT elem
    FROM unnest(drivers) AS elem
    WHERE elem != 'industrial'
  ),
  updated_at = NOW()
WHERE neighbourhood_name = 'ANG MO KIO'
  AND zone_type = 'residential'
  AND 'industrial' = ANY(drivers);

-- BOON LAY PLACE: Remove industrial driver (residential area with nearby industrial zones)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(
    SELECT elem
    FROM unnest(drivers) AS elem
    WHERE elem != 'industrial'
  ),
  updated_at = NOW()
WHERE neighbourhood_name = 'BOON LAY PLACE'
  AND zone_type = 'residential'
  AND 'industrial' = ANY(drivers);

-- GEYLANG BAHRU: Remove industrial driver (residential area with nearby industrial zones)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(
    SELECT elem
    FROM unnest(drivers) AS elem
    WHERE elem != 'industrial'
  ),
  updated_at = NOW()
WHERE neighbourhood_name = 'GEYLANG BAHRU'
  AND zone_type = 'residential'
  AND 'industrial' = ANY(drivers);

-- KALLANG BAHRU: Remove industrial driver (residential area with nearby industrial zones)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(
    SELECT elem
    FROM unnest(drivers) AS elem
    WHERE elem != 'industrial'
  ),
  updated_at = NOW()
WHERE neighbourhood_name = 'KALLANG BAHRU'
  AND zone_type = 'residential'
  AND 'industrial' = ANY(drivers);

COMMIT;

-- ============================================
-- Verification query
-- ============================================
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  drivers
FROM neighbourhood_living_notes
WHERE neighbourhood_name IN (
  'ANG MO KIO', 'BOON LAY PLACE', 'GEYLANG BAHRU', 'KALLANG BAHRU'
)
ORDER BY neighbourhood_name;

-- Note: heavy_vehicles drivers in BEDOK RESERVOIR, SIGLAP, UPPER THOMSON
-- are kept because they describe actual heavy vehicle traffic in residential areas,
-- not zone_type classification issues.

