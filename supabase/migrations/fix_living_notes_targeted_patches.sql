-- Migration: Targeted patches for specific neighbourhoods
-- Description: Fix specific issues identified in data review
--              Includes CBD rating fixes, non-residential areas, and data corrections

-- ============================================
-- CBD / Downtown areas - convert bad to mixed, update metadata
-- ============================================

UPDATE neighbourhood_living_notes
SET
  zone_type = 'city_core',
  drivers = ARRAY['cbd', 'downtown', 'high_footfall', 'commute_first'],
  variance_level = 'moderate',
  short_note = 'Downtown lifestyle: commute-first convenience with higher activity levels.',
  noise_density_rating = COALESCE(noise_density_rating, 'mixed'),
  green_outdoor_rating = COALESCE(green_outdoor_rating, 'mixed'),
  crowd_vibe_rating = COALESCE(crowd_vibe_rating, 'mixed'),
  display_name = 'Cecil'
WHERE neighbourhood_name = 'CECIL';

UPDATE neighbourhood_living_notes
SET
  zone_type = 'city_core',
  drivers = ARRAY['cbd', 'downtown', 'high_footfall', 'commute_first'],
  variance_level = 'moderate',
  short_note = 'Downtown lifestyle: commute-first convenience with higher activity levels.',
  noise_density_rating = COALESCE(noise_density_rating, 'mixed'),
  green_outdoor_rating = COALESCE(green_outdoor_rating, 'mixed'),
  crowd_vibe_rating = COALESCE(crowd_vibe_rating, 'mixed'),
  display_name = 'Central'
WHERE neighbourhood_name = 'CENTRAL SUBZONE';

UPDATE neighbourhood_living_notes
SET
  zone_type = 'city_core',
  drivers = ARRAY['cbd', 'downtown', 'high_footfall', 'commute_first'],
  variance_level = 'moderate',
  short_note = 'Downtown lifestyle: commute-first convenience with higher activity levels.',
  noise_density_rating = COALESCE(noise_density_rating, 'mixed'),
  green_outdoor_rating = COALESCE(green_outdoor_rating, 'mixed'),
  crowd_vibe_rating = COALESCE(crowd_vibe_rating, 'mixed'),
  display_name = 'China Square'
WHERE neighbourhood_name = 'CHINA SQUARE';

UPDATE neighbourhood_living_notes
SET
  zone_type = 'city_core',
  drivers = ARRAY['cbd_edge', 'downtown', 'construction_cycles', 'commute_first'],
  variance_level = 'moderate',
  short_note = 'CBD-edge living: very convenient, but activity levels vary a lot by pocket.',
  noise_density_rating = COALESCE(noise_density_rating, 'mixed'),
  green_outdoor_rating = COALESCE(green_outdoor_rating, 'mixed'),
  crowd_vibe_rating = COALESCE(crowd_vibe_rating, 'mixed'),
  display_name = 'Anson'
WHERE neighbourhood_name = 'ANSON';

UPDATE neighbourhood_living_notes
SET
  zone_type = 'city_core',
  drivers = ARRAY['interchange', 'high_footfall', 'commute_first'],
  variance_level = 'spread_out',
  short_note = 'Major interchange node: unmatched access, but constant footfall in exposed pockets.',
  noise_density_rating = COALESCE(noise_density_rating, 'mixed'),
  crowd_vibe_rating = COALESCE(crowd_vibe_rating, 'mixed'),
  display_name = 'Dhoby Ghaut'
WHERE neighbourhood_name = 'DHOBY GHAUT';

UPDATE neighbourhood_living_notes
SET
  zone_type = 'city_core',
  drivers = ARRAY['civic_core', 'high_footfall', 'arterial_roads'],
  variance_level = 'spread_out',
  short_note = 'Civic core: pocket variation is high—main roads feel very different from interior streets.',
  noise_density_rating = COALESCE(noise_density_rating, 'mixed'),
  crowd_vibe_rating = COALESCE(crowd_vibe_rating, 'mixed'),
  display_name = 'Bras Basah'
WHERE neighbourhood_name = 'BRAS BASAH';

UPDATE neighbourhood_living_notes
SET
  zone_type = 'city_core',
  drivers = ARRAY['interchange', 'shopping_belt', 'nightlife_nearby', 'high_footfall'],
  variance_level = 'spread_out',
  short_note = 'Urban core hub: extremely convenient; pocket choice matters a lot for noise/night activity.',
  noise_density_rating = COALESCE(noise_density_rating, 'mixed'),
  crowd_vibe_rating = COALESCE(crowd_vibe_rating, 'mixed'),
  display_name = 'Bugis'
WHERE neighbourhood_name = 'BUGIS';

UPDATE neighbourhood_living_notes
SET
  zone_type = 'city_core',
  drivers = ARRAY['riverfront', 'nightlife_belt', 'tourist_crowd'],
  variance_level = 'spread_out',
  short_note = 'Riverfront nightlife belt: late-night activity is common; quieter pockets are more limited.',
  noise_density_rating = 'bad',
  crowd_vibe_rating = 'bad',
  display_name = 'Boat Quay'
WHERE neighbourhood_name = 'BOAT QUAY';

UPDATE neighbourhood_living_notes
SET
  zone_type = 'city_core',
  drivers = ARRAY['riverfront', 'nightlife_belt', 'tourist_crowd'],
  variance_level = 'spread_out',
  short_note = 'Nightlife-first area: great for city energy, tough for quiet long-term routines.',
  display_name = 'Clarke Quay'
WHERE neighbourhood_name = 'CLARKE QUAY';

UPDATE neighbourhood_living_notes
SET
  zone_type = 'city_core',
  drivers = ARRAY['tourist_core', 'events', 'high_footfall'],
  variance_level = 'spread_out',
  short_note = 'Event/tourist core: convenience is high, but crowd intensity can spike unpredictably.',
  display_name = 'Bayfront'
WHERE neighbourhood_name = 'BAYFRONT SUBZONE';

UPDATE neighbourhood_living_notes
SET
  zone_type = 'city_core',
  drivers = ARRAY['downtown', 'events', 'high_footfall'],
  variance_level = 'moderate',
  short_note = 'Downtown waterfront: event-driven spikes; not a typical family neighbourhood baseline.',
  display_name = 'Clifford Pier'
WHERE neighbourhood_name = 'CLIFFORD PIER';

-- ============================================
-- Nature / Non-residential areas
-- ============================================

UPDATE neighbourhood_living_notes
SET
  zone_type = 'nature',
  rating_mode = 'not_scored',
  drivers = ARRAY['nature_reserve'],
  variance_level = 'compact',
  short_note = 'Primarily non-residential/nature area. We don''t score Living Comfort here.',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  display_name = 'Murai'
WHERE neighbourhood_name = 'MURAI';

UPDATE neighbourhood_living_notes
SET
  zone_type = 'nature',
  rating_mode = 'not_scored',
  drivers = ARRAY['nature_reserve'],
  variance_level = 'compact',
  short_note = 'Primarily non-residential/nature area. We don''t score Living Comfort here.',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  display_name = 'Nature Reserve'
WHERE neighbourhood_name = 'NATURE RESERVE';

UPDATE neighbourhood_living_notes
SET
  zone_type = 'nature',
  rating_mode = 'not_scored',
  drivers = ARRAY['nature_edge'],
  variance_level = 'compact',
  short_note = 'Nature-edge zone with limited residential baseline. We don''t score Living Comfort here.',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  display_name = 'Mandai West'
WHERE neighbourhood_name = 'MANDAI WEST';

-- ============================================
-- Airport / Port / Infrastructure areas
-- ============================================

UPDATE neighbourhood_living_notes
SET
  zone_type = 'industrial',
  rating_mode = 'not_scored',
  drivers = ARRAY['airport', 'logistics', 'high_activity'],
  variance_level = 'compact',
  short_note = 'Airport/logistics zone. Not designed for residential routines.',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  display_name = 'Changi Airport'
WHERE neighbourhood_name = 'CHANGI AIRPORT';

UPDATE neighbourhood_living_notes
SET
  zone_type = 'industrial',
  rating_mode = 'not_scored',
  drivers = ARRAY['coastal_infrastructure', 'industrial', 'logistics'],
  variance_level = 'compact',
  short_note = 'Infrastructure/industrial coastal zone. Not designed for residential routines.',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  display_name = 'Changi Bay'
WHERE neighbourhood_name = 'CHANGI BAY';

UPDATE neighbourhood_living_notes
SET
  zone_type = 'industrial',
  rating_mode = 'not_scored',
  drivers = ARRAY['port_logistics', 'heavy_vehicles'],
  variance_level = 'compact',
  short_note = 'Port/logistics zone. Not designed for residential routines.',
  noise_density_rating = NULL,
  daily_convenience_rating = NULL,
  green_outdoor_rating = NULL,
  crowd_vibe_rating = NULL,
  long_term_comfort_rating = NULL,
  display_name = 'City Terminals'
WHERE neighbourhood_name = 'CITY TERMINALS';

-- ============================================
-- Business parks
-- ============================================

UPDATE neighbourhood_living_notes
SET
  zone_type = 'business_park',
  drivers = ARRAY['business_park', 'professionals', 'workday_peak'],
  variance_level = 'moderate',
  short_note = 'Mixed-use business park: convenient, but weekday intensity varies by pocket.',
  display_name = 'One North'
WHERE neighbourhood_name = 'ONE NORTH';

-- ============================================
-- Specific fixes (LAKESIDE, CRAWFORD, city-fringe areas)
-- ============================================

UPDATE neighbourhood_living_notes
SET
  display_name = 'Lakeside',
  drivers = ARRAY['leisure', 'park_gardens', 'family_outdoors'],
  variance_level = 'moderate',
  short_note = 'Leisure-first pocket with standout outdoor access; weekends feel busier.',
  long_term_comfort_note = 'Comfortable if you value outdoor access and don''t mind more weekend activity.'
WHERE neighbourhood_name = 'LAKESIDE (LEISURE)';

UPDATE neighbourhood_living_notes
SET
  drivers = COALESCE(
    NULLIF(drivers, ARRAY[]::TEXT[]),
    ARRAY['city_fringe', 'arterial_roads', 'pocket_variation_high']
  ),
  variance_level = 'spread_out',
  short_note = 'City-fringe: pocket variation is high—main-road blocks feel very different from interior streets.',
  display_name = COALESCE(display_name, 'Crawford')
WHERE neighbourhood_name = 'CRAWFORD';

UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['city_fringe', 'dense_shophouses', 'arterial_roads'],
  variance_level = 'spread_out',
  short_note = 'City-fringe convenience with higher street activity; block-facing makes a big difference.',
  display_name = COALESCE(display_name, 'Aljunied')
WHERE neighbourhood_name = 'ALJUNIED';

UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['city_fringe', 'mrt_hub_nearby', 'arterial_roads'],
  variance_level = 'spread_out',
  short_note = 'Near a major hub: very convenient, but noise/crowds vary sharply by pocket.',
  display_name = COALESCE(display_name, 'Paya Lebar West')
WHERE neighbourhood_name = 'PAYA LEBAR WEST';

UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['city_fringe', 'mrt_hub_nearby', 'arterial_roads'],
  variance_level = 'spread_out',
  short_note = 'Near a major hub: very convenient, but pocket choice matters for quiet evenings.',
  display_name = COALESCE(display_name, 'Paya Lebar North')
WHERE neighbourhood_name = 'PAYA LEBAR NORTH';

UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['city_fringe', 'arterial_roads', 'pocket_variation_high'],
  variance_level = 'spread_out',
  short_note = 'City-fringe pocket: convenience is strong; quieter living depends on micro-location.',
  display_name = COALESCE(display_name, 'Kampong Java')
WHERE neighbourhood_name = 'KAMPONG JAVA';

UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['city_fringe', 'river_nearby', 'pocket_variation_high'],
  variance_level = 'spread_out',
  short_note = 'City-fringe near major corridors: great access, but streetscape varies a lot block to block.',
  display_name = COALESCE(display_name, 'Kampong Bugis')
WHERE neighbourhood_name = 'KAMPONG BUGIS';

UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['city_fringe', 'workshop_pockets', 'arterial_roads'],
  variance_level = 'spread_out',
  short_note = 'City-fringe with mixed land-use pockets; block-facing and distance to roads matter.',
  display_name = COALESCE(display_name, 'Kampong Ubi')
WHERE neighbourhood_name = 'KAMPONG UBI';

