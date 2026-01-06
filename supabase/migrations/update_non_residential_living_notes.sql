-- Migration: Update non-residential areas with zone_type and rating_mode
-- Description: Set zone_type and rating_mode for industrial, nature, offshore, and business park areas
--              Set all rating fields to NULL for not_scored areas

-- ============================================
-- 1. Offshore areas (SEMAKAU, NORTH-EASTERN ISLANDS)
-- ============================================
UPDATE neighbourhood_living_notes
SET 
  zone_type = 'offshore',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  drivers = ARRAY['offshore'],
  variance_level = 'compact',
  short_note = 'This zone is primarily non-residential (offshore). We don''t score Living Comfort here.'
WHERE neighbourhood_name IN ('SEMAKAU', 'NORTH-EASTERN ISLANDS');

-- ============================================
-- 2. Nature reserves (CENTRAL WATER CATCHMENT)
-- ============================================
UPDATE neighbourhood_living_notes
SET 
  zone_type = 'nature',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  drivers = ARRAY['nature_reserve'],
  variance_level = 'compact',
  short_note = 'This zone is primarily non-residential (nature reserve). We don''t score Living Comfort here.'
WHERE neighbourhood_name = 'CENTRAL WATER CATCHMENT';

-- ============================================
-- 3. Industrial zones (CHIN BEE, BENOI SECTOR, DEFU INDUSTRIAL PARK, etc.)
-- ============================================
UPDATE neighbourhood_living_notes
SET 
  zone_type = 'industrial',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  drivers = ARRAY['industrial', 'heavy_vehicles'],
  variance_level = 'compact',
  short_note = 'Primarily an industrial/logistics zone. Not designed for residential routines.'
WHERE neighbourhood_name IN (
  'CHIN BEE',
  'BENOI SECTOR',
  'DEFU INDUSTRIAL PARK',
  'JURONG ISLAND',
  'SUNGEI KADUT',
  'TUAS',
  'TUAS VIEW',
  'TUAS SOUTH',
  'PIONEER',
  'JURONG PORT'
);

-- ============================================
-- 4. Business parks (LAKESIDE (BUSINESS), etc.)
-- ============================================
UPDATE neighbourhood_living_notes
SET 
  zone_type = 'business_park',
  rating_mode = 'not_scored',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  drivers = ARRAY['business_park'],
  variance_level = 'compact',
  display_name = 'Lakeside',
  short_note = 'Primarily a business park area. Not designed for residential routines.'
WHERE neighbourhood_name LIKE '%(BUSINESS)%' OR neighbourhood_name LIKE '%BUSINESS PARK%';

-- ============================================
-- 5. CBD Core areas (CECIL, CHINA SQUARE, CENTRAL SUBZONE, etc.)
-- Note: These can keep residential_scored if needed, but will be filtered from Explore by default
-- ============================================
UPDATE neighbourhood_living_notes
SET 
  zone_type = 'city_core',
  rating_mode = 'residential_scored',  -- Can be changed to 'not_scored' if preferred
  drivers = COALESCE(drivers, ARRAY[]::TEXT[]) || ARRAY['cbd', 'downtown'],
  variance_level = COALESCE(variance_level, 'moderate')
WHERE neighbourhood_name IN (
  'CECIL',
  'CHINA SQUARE',
  'CENTRAL SUBZONE',
  'ANSON',
  'MARINA BAY',
  'RAFFLES PLACE',
  'TANJONG PAGAR'
);

-- ============================================
-- 6. Set default zone_type for remaining residential areas
-- ============================================
UPDATE neighbourhood_living_notes
SET 
  zone_type = COALESCE(zone_type, 'residential'),
  rating_mode = COALESCE(rating_mode, 'residential_scored')
WHERE zone_type IS NULL;

