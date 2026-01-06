-- Migration: Fix misclassified residential areas
-- Description: 
--   1. Fix residential areas incorrectly marked as industrial (ANG MO KIO, SIGLAP, etc.)
--   2. Remove contradictory drivers (residential/family_friendly) from industrial zones
--   3. Use differentiated short_note templates for different types of industrial zones
--
-- These neighbourhoods are clearly residential towns/areas but were incorrectly classified

BEGIN;

-- ============================================
-- Part 1: Fix misclassified residential areas
-- ============================================
-- These are clearly residential towns/areas, not industrial zones

-- ANG MO KIO: Mature residential town - change back to residential
-- Note: Need to restore ratings first (they were nulled when changed to not_scored)
-- Based on notes, this is a mature town with good convenience but some industrial edges
UPDATE neighbourhood_living_notes
SET
  zone_type = 'residential',
  rating_mode = 'residential_scored',
  noise_density_rating = 'mixed',  -- Areas near industrial zones have higher noise
  daily_convenience_rating = 'good',  -- Strong mature-town convenience
  green_outdoor_rating = 'good',  -- Good access to Bishan-Ang Mo Kio Park
  crowd_vibe_rating = 'good',  -- Family-oriented heartland rhythm
  long_term_comfort_rating = 'good',  -- Overall very good, but not all areas equally comfortable
  short_note = 'Mature central town with strong convenience and green access. Areas near industrial zones have higher noise, but overall very good for families.',
  updated_at = NOW()
WHERE neighbourhood_name = 'ANG MO KIO'
  AND zone_type = 'industrial';

-- SIGLAP: Residential area - change back to residential
-- Notes indicate: low-density, buffers from noise, good green access, quiet living
UPDATE neighbourhood_living_notes
SET
  zone_type = 'residential',
  rating_mode = 'residential_scored',
  noise_density_rating = 'good',  -- Low-density buffers from heavy traffic noise
  daily_convenience_rating = 'mixed',  -- Amenities accessible but less concentrated
  green_outdoor_rating = 'good',  -- Good access to parks and coastal corridors
  crowd_vibe_rating = 'good',  -- Primarily residential, limited destination-driven activity
  long_term_comfort_rating = 'good',  -- Well-suited for quieter living with coastal proximity
  short_note = 'Low-density residential area with good green access and coastal proximity. Well-suited for quieter living, though amenities are less concentrated than town centres.',
  updated_at = NOW()
WHERE neighbourhood_name = 'SIGLAP'
  AND zone_type = 'industrial';

-- UPPER THOMSON: Residential area along Thomson Road - change back to residential
-- Notes indicate: good buffer from traffic, excellent green access, quiet living
UPDATE neighbourhood_living_notes
SET
  zone_type = 'residential',
  rating_mode = 'residential_scored',
  noise_density_rating = 'good',  -- Good buffer from heavy traffic, generally quieter
  daily_convenience_rating = 'mixed',  -- Amenities accessible but less concentrated
  green_outdoor_rating = 'good',  -- Excellent access to Upper Seletar, MacRitchie, nature reserves
  crowd_vibe_rating = 'good',  -- Primarily residential with limited destination-driven activity
  long_term_comfort_rating = 'good',  -- Strong long-term choice for nature access and quieter living
  short_note = 'Residential area with excellent access to nature reserves and parks. Strong long-term choice for those valuing nature access and quieter living with central proximity.',
  updated_at = NOW()
WHERE neighbourhood_name = 'UPPER THOMSON'
  AND zone_type = 'industrial';

-- BEDOK RESERVOIR: Residential area with reservoir park - change back to residential
-- Notes indicate: buffers from noise, local amenities, strong green access, quiet living
UPDATE neighbourhood_living_notes
SET
  zone_type = 'residential',
  rating_mode = 'residential_scored',
  noise_density_rating = 'good',  -- Residential layout buffers from heavy traffic noise
  daily_convenience_rating = 'mixed',  -- Everyday needs met locally, town-centre requires travel
  green_outdoor_rating = 'good',  -- Strong adjacency to Bedok Reservoir Park
  crowd_vibe_rating = 'good',  -- Low destination-driven foot traffic, residential focus
  long_term_comfort_rating = 'good',  -- Well-suited for households valuing greenery and quieter living
  short_note = 'Residential area with strong adjacency to Bedok Reservoir Park. Well-suited for households valuing greenery and quieter living, with local amenities meeting everyday needs.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BEDOK RESERVOIR'
  AND zone_type = 'industrial';

-- BOON LAY PLACE: Residential area with HDB - change back to residential
-- Notes indicate: periodic activity, strong convenience, limited green, busier surroundings
UPDATE neighbourhood_living_notes
SET
  zone_type = 'residential',
  rating_mode = 'residential_scored',
  noise_density_rating = 'mixed',  -- Periodic activity from town-centre and industrial traffic
  daily_convenience_rating = 'good',  -- Town-centre adjacency provides strong access
  green_outdoor_rating = 'mixed',  -- Green access available but more limited
  crowd_vibe_rating = 'mixed',  -- Higher daytime activity linked to commercial/transit
  long_term_comfort_rating = 'mixed',  -- Comfort depends on tolerance for busier surroundings
  short_note = 'Town-centre adjacency provides strong convenience, but comfort depends on tolerance for busier surroundings with higher daytime activity.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BOON LAY PLACE'
  AND zone_type = 'industrial';

-- GEYLANG BAHRU: Residential area with HDB - change back to residential
-- Notes indicate: mixed residential/industrial, strong local convenience, city-fringe character
UPDATE neighbourhood_living_notes
SET
  zone_type = 'residential',
  rating_mode = 'residential_scored',
  noise_density_rating = 'mixed',  -- Mixed residential/industrial, busier in day
  daily_convenience_rating = 'good',  -- Strong local living convenience
  green_outdoor_rating = 'mixed',  -- More street/block feel, some waterfront access
  crowd_vibe_rating = 'good',  -- Local, lived-in vibe with families
  long_term_comfort_rating = 'mixed',  -- Comfortable if you like city-fringe grit
  short_note = 'Mixed residential area with strong local living convenience. Comfortable if you like city-fringe character, though ageing pockets and road noise can be factors.',
  updated_at = NOW()
WHERE neighbourhood_name = 'GEYLANG BAHRU'
  AND zone_type = 'industrial';

-- KALLANG BAHRU: Residential area with HDB - change back to residential
-- Notes indicate: industrial proximity, basic amenities, varies by location
UPDATE neighbourhood_living_notes
SET
  zone_type = 'residential',
  rating_mode = 'residential_scored',
  noise_density_rating = 'bad',  -- Industrial and arterial road proximity, heavy-vehicle noise
  daily_convenience_rating = 'mixed',  -- Basic amenities present, town-centre requires travel
  green_outdoor_rating = 'mixed',  -- Some access to waterfront and park connectors
  crowd_vibe_rating = 'mixed',  -- Activity fluctuates between industrial and residential
  long_term_comfort_rating = 'mixed',  -- Comfort varies dramatically by location
  short_note = 'Mixed residential area with industrial proximity. Comfort varies dramatically: main road and industrial-adjacent areas differ significantly from interior residential streets.',
  updated_at = NOW()
WHERE neighbourhood_name = 'KALLANG BAHRU'
  AND zone_type = 'industrial';

-- ============================================
-- Part 2: Remove contradictory drivers from industrial zones
-- ============================================
-- Industrial zones should not have residential/family_friendly drivers

-- CHANGI WEST: Remove residential/family_friendly drivers
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(
    SELECT elem
    FROM unnest(drivers) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  updated_at = NOW()
WHERE neighbourhood_name = 'CHANGI WEST'
  AND zone_type = 'industrial'
  AND (drivers && ARRAY['residential', 'family_friendly']);

-- CLEANTECH: Remove residential/family_friendly drivers
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(
    SELECT elem
    FROM unnest(drivers) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  updated_at = NOW()
WHERE neighbourhood_name = 'CLEANTECH'
  AND zone_type = 'industrial'
  AND (drivers && ARRAY['residential', 'family_friendly']);

-- KALLANG BAHRU: Remove residential/family_friendly drivers (if still industrial after Part 1)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(
    SELECT elem
    FROM unnest(drivers) AS elem
    WHERE elem NOT IN ('residential', 'family_friendly')
  ),
  updated_at = NOW()
WHERE neighbourhood_name = 'KALLANG BAHRU'
  AND zone_type = 'industrial'
  AND (drivers && ARRAY['residential', 'family_friendly']);

-- ============================================
-- Part 3: Use differentiated short_note templates for industrial zones
-- ============================================

-- SAFTI: Military/restricted area
UPDATE neighbourhood_living_notes
SET
  short_note = 'Military/restricted area. Not designed for residential routines.',
  updated_at = NOW()
WHERE neighbourhood_name = 'SAFTI'
  AND zone_type = 'industrial'
  AND short_note = 'Industrial/logistics zone. Not designed for residential routines.';

-- PLAB: Aviation-related zone
UPDATE neighbourhood_living_notes
SET
  short_note = 'Aviation-related zone with noise restrictions. Not designed for residential routines.',
  updated_at = NOW()
WHERE neighbourhood_name = 'PLAB'
  AND zone_type = 'industrial'
  AND short_note = 'Industrial/logistics zone. Not designed for residential routines.';

-- PENJURU CRESCENT: Port/logistics heavy
UPDATE neighbourhood_living_notes
SET
  short_note = 'Port/logistics zone with heavy vehicle traffic. Not designed for residential routines.',
  updated_at = NOW()
WHERE neighbourhood_name = 'PENJURU CRESCENT'
  AND zone_type = 'industrial'
  AND short_note = 'Industrial/logistics zone. Not designed for residential routines.';

-- TUAS PROMENADE: Port/logistics heavy
UPDATE neighbourhood_living_notes
SET
  short_note = 'Port/logistics zone with heavy vehicle traffic. Not designed for residential routines.',
  updated_at = NOW()
WHERE neighbourhood_name = 'TUAS PROMENADE'
  AND zone_type = 'industrial'
  AND short_note = 'Industrial/logistics zone. Not designed for residential routines.';

-- PORT: Port/logistics heavy
UPDATE neighbourhood_living_notes
SET
  short_note = 'Port/logistics zone with heavy vehicle traffic. Not designed for residential routines.',
  updated_at = NOW()
WHERE neighbourhood_name = 'PORT'
  AND zone_type = 'industrial'
  AND short_note = 'Industrial/logistics zone. Not designed for residential routines.';

-- SHIPYARD: Port/logistics heavy
UPDATE neighbourhood_living_notes
SET
  short_note = 'Port/logistics zone with heavy vehicle traffic. Not designed for residential routines.',
  updated_at = NOW()
WHERE neighbourhood_name = 'SHIPYARD'
  AND zone_type = 'industrial'
  AND short_note = 'Industrial/logistics zone. Not designed for residential routines.';

-- THE WHARVES: Port/logistics heavy
UPDATE neighbourhood_living_notes
SET
  short_note = 'Port/logistics zone with heavy vehicle traffic. Not designed for residential routines.',
  updated_at = NOW()
WHERE neighbourhood_name = 'THE WHARVES'
  AND zone_type = 'industrial'
  AND short_note = 'Industrial/logistics zone. Not designed for residential routines.';

-- KRANJI: Industrial estate with mixed use (rural/industrial)
UPDATE neighbourhood_living_notes
SET
  short_note = 'Industrial estate with mixed rural/industrial characteristics. Not designed for residential routines.',
  updated_at = NOW()
WHERE neighbourhood_name = 'KRANJI'
  AND zone_type = 'industrial'
  AND short_note = 'Industrial/logistics zone. Not designed for residential routines.';

-- TENGEH: Industrial estate
UPDATE neighbourhood_living_notes
SET
  short_note = 'Industrial estate with low residential presence. Not designed for residential routines.',
  updated_at = NOW()
WHERE neighbourhood_name = 'TENGEH'
  AND zone_type = 'industrial'
  AND short_note = 'Industrial/logistics zone. Not designed for residential routines.';

-- TUKANG: Industrial estate
UPDATE neighbourhood_living_notes
SET
  short_note = 'Industrial estate with low residential presence. Not designed for residential routines.',
  updated_at = NOW()
WHERE neighbourhood_name = 'TUKANG'
  AND zone_type = 'industrial'
  AND short_note = 'Industrial/logistics zone. Not designed for residential routines.';

COMMIT;

-- ============================================
-- Verification queries
-- ============================================

-- Check misclassified areas (should now be residential)
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  drivers
FROM neighbourhood_living_notes
WHERE neighbourhood_name IN (
  'ANG MO KIO', 'SIGLAP', 'UPPER THOMSON', 'BEDOK RESERVOIR',
  'BOON LAY PLACE', 'GEYLANG BAHRU', 'KALLANG BAHRU'
)
ORDER BY neighbourhood_name;

-- Check industrial zones for contradictory drivers
SELECT 
  neighbourhood_name,
  zone_type,
  drivers,
  short_note
FROM neighbourhood_living_notes
WHERE zone_type = 'industrial'
  AND (drivers && ARRAY['residential', 'family_friendly'])
ORDER BY neighbourhood_name;

-- Check differentiated short_notes
SELECT 
  neighbourhood_name,
  zone_type,
  short_note
FROM neighbourhood_living_notes
WHERE zone_type = 'industrial'
  AND rating_mode = 'not_scored'
ORDER BY short_note, neighbourhood_name;

