-- Auto-generated SQL from lint suggested patches
-- Review these changes before applying!

BEGIN;

-- AIRPORT ROAD: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'tradeoffs_for_convenience', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'AIRPORT ROAD';

-- ALEXANDRA HILL: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'outdoor_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'ALEXANDRA HILL';

-- ANCHORVALE: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'outdoor_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'ANCHORVALE';

-- ANSON: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['cbd_edge', 'downtown', 'construction_cycles', 'commute_first', 'amenity_access', 'high_activity', 'tradeoffs_for_convenience', 'nightlife_nearby']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'ANSON';

-- BAYFRONT SUBZONE: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['tourist_core', 'events', 'high_footfall', 'downtown', 'amenity_access', 'high_activity', 'tradeoffs_for_convenience', 'pocket_choice_matters', 'tourist_crowd']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'BAYFRONT SUBZONE';

-- BEDOK NORTH: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'BEDOK NORTH';

-- BENCOOLEN: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'tourist_crowd']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'BENCOOLEN';

-- BISHAN EAST: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'outdoor_access', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'BISHAN EAST';

-- BOON KENG: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'BOON KENG';

-- BOULEVARD: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'tourist_crowd', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'BOULEVARD';

-- BRAS BASAH: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['civic_core', 'high_footfall', 'arterial_roads', 'downtown', 'amenity_access', 'tradeoffs_for_convenience', 'pocket_choice_matters', 'tourist_crowd', 'nightlife_nearby']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'BRAS BASAH';

-- BUGIS: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['interchange', 'shopping_belt', 'nightlife_nearby', 'high_footfall', 'downtown', 'amenity_access', 'tradeoffs_for_convenience', 'pocket_choice_matters', 'tourist_crowd']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'BUGIS';

-- BUKIT HO SWEE: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'BUKIT HO SWEE';

-- BUKIT MERAH: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'port_logistics']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'BUKIT MERAH';

-- CAIRNHILL: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'tourist_crowd', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'CAIRNHILL';

-- CENTRAL SUBZONE: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['cbd', 'downtown', 'high_footfall', 'commute_first', 'amenity_access', 'high_activity', 'tradeoffs_for_convenience', 'tourist_crowd']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'CENTRAL SUBZONE';

-- CHANGI WEST: Fix short_note to match ratings (avoid contradictions); Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  short_note = 'Limited long-term comfort despite some conveniences.',
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['residential', 'family_friendly', 'arterial_roads', 'logistics']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'CHANGI WEST';

-- CHINATOWN: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'tourist_crowd', 'nightlife_nearby']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'CHINATOWN';

-- CITY HALL: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'tourist_crowd', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'CITY HALL';

-- CLEANTECH: Fix short_note to match ratings (avoid contradictions)
UPDATE neighbourhood_living_notes
SET
  short_note = 'Limited long-term comfort despite some conveniences.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CLEANTECH';

-- CLEMENTI NORTH: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['outdoor_access', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'CLEMENTI NORTH';

-- CLIFFORD PIER: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['downtown', 'events', 'high_footfall', 'amenity_access', 'high_activity', 'tradeoffs_for_convenience', 'tourist_crowd']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'CLIFFORD PIER';

-- COMPASSVALE: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'COMPASSVALE';

-- CORONATION ROAD: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['outdoor_access', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'CORONATION ROAD';

-- CRAWFORD: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['city_fringe', 'arterial_roads', 'pocket_variation_high', 'amenity_access', 'tradeoffs_for_convenience', 'pocket_choice_matters', 'nightlife_nearby']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'CRAWFORD';

-- DUNEARN: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'outdoor_access', 'arterial_roads', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'DUNEARN';

-- EVERTON PARK: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'EVERTON PARK';

-- FARRER COURT: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'outdoor_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'FARRER COURT';

-- FARRER PARK: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'nightlife_nearby']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'FARRER PARK';

-- FORT CANNING: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'tourist_crowd']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'FORT CANNING';

-- GALI BATU: Fix short_note to match ratings (avoid contradictions); Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  short_note = 'Active area with higher noise and crowds — limited long-term comfort.',
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['high_activity', 'heavy_vehicles', 'logistics']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'GALI BATU';

-- GARDEN: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['outdoor_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'GARDEN';

-- GOMBAK: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['outdoor_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'GOMBAK';

-- GOODWOOD PARK: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'tourist_crowd', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'GOODWOOD PARK';

-- GUL BASIN: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['high_activity', 'heavy_vehicles', 'port_logistics']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'GUL BASIN';

-- GUL CIRCLE: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['high_activity', 'heavy_vehicles', 'logistics']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'GUL CIRCLE';

-- HILLVIEW: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['outdoor_access', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'HILLVIEW';

-- ISTANA NEGARA: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'ISTANA NEGARA';

-- JURONG WEST: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'JURONG WEST';

-- JURONG WEST CENTRAL: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'interchange']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'JURONG WEST CENTRAL';

-- KALLANG BAHRU: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['residential', 'family_friendly', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'KALLANG BAHRU';

-- KATONG: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['outdoor_access', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'KATONG';

-- KHATIB: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'KHATIB';

-- LEEDON PARK: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'LEEDON PARK';

-- LEONIE HILL: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'LEONIE HILL';

-- LITTLE INDIA: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'tourist_crowd']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'LITTLE INDIA';

-- LORONG HALUS NORTH: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'outdoor_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'LORONG HALUS NORTH';

-- MARITIME SQUARE: Fix short_note to match ratings (avoid contradictions); Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  short_note = 'Not a comfortable long-term residential environment.',
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['high_activity', 'heavy_vehicles', 'port_logistics', 'logistics']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'MARITIME SQUARE';

-- MATILDA: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'MATILDA';

-- MAXWELL: Fix short_note to match ratings (avoid contradictions); Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  short_note = 'Convenient on paper, but daily comfort is limited long term.',
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'MAXWELL';

-- MIDVIEW: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'MIDVIEW';

-- NASSIM: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'NASSIM';

-- NEWTON CIRCUS: Fix short_note to match ratings (avoid contradictions); Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  short_note = 'Convenient on paper, but daily comfort is limited long term.',
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'interchange']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'NEWTON CIRCUS';

-- NICOLL: Fix short_note to match ratings (avoid contradictions)
UPDATE neighbourhood_living_notes
SET
  short_note = 'Convenient on paper, but daily comfort is limited long term.',
  updated_at = NOW()
WHERE neighbourhood_name = 'NICOLL';

-- NORTH COAST: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'NORTH COAST';

-- NORTHLAND: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'NORTHLAND';

-- ONE TREE HILL: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'outdoor_access', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'ONE TREE HILL';

-- ORANGE GROVE: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'ORANGE GROVE';

-- OXLEY: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'OXLEY';

-- PATERSON: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'PATERSON';

-- PENJURU CRESCENT: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['high_activity', 'heavy_vehicles']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'PENJURU CRESCENT';

-- PHILLIP: Fix short_note to match ratings (avoid contradictions); Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  short_note = 'Convenient on paper, but daily comfort is limited long term.',
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'PHILLIP';

-- PLAB: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['high_activity', 'heavy_vehicles']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'PLAB';

-- PORT: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['high_activity', 'heavy_vehicles', 'port_logistics', 'logistics']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'PORT';

-- RIDOUT: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'RIDOUT';

-- ROBERTSON QUAY: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'nightlife_nearby']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'ROBERTSON QUAY';

-- S HILL: Fix short_note to match ratings (avoid contradictions); Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  short_note = 'Convenient on paper, but daily comfort is limited long term.',
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'S HILL';

-- S PARK: Fix short_note to match ratings (avoid contradictions); Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  short_note = 'Convenient on paper, but daily comfort is limited long term.',
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'tourist_crowd', 'nightlife_nearby']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'S PARK';

-- SAFTI: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['high_activity', 'heavy_vehicles']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'SAFTI';

-- SAMULUN: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['high_activity', 'heavy_vehicles']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'SAMULUN';

-- SEMBAWANG NORTH: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'SEMBAWANG NORTH';

-- SEMBAWANG SPRINGS: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'SEMBAWANG SPRINGS';

-- SEMBAWANG STRAITS: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'SEMBAWANG STRAITS';

-- SENGKANG: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'SENGKANG';

-- SENOKO NORTH: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'SENOKO NORTH';

-- SENOKO SOUTH: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'SENOKO SOUTH';

-- SENOKO WEST: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'SENOKO WEST';

-- SHIPYARD: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['high_activity', 'heavy_vehicles', 'port_logistics', 'logistics']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'SHIPYARD';

-- SOMERSET: Fix short_note to match ratings (avoid contradictions); Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  short_note = 'Convenient on paper, but daily comfort is limited long term.',
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'tourist_crowd']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'SOMERSET';

-- SWISS CLUB: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'SWISS CLUB';

-- TANGLIN: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'tourist_crowd', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'TANGLIN';

-- TENGEH: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['high_activity', 'heavy_vehicles']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'TENGEH';

-- THE WHARVES: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['high_activity', 'heavy_vehicles', 'port_logistics', 'logistics']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'THE WHARVES';

-- TUAS PROMENADE: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['high_activity', 'heavy_vehicles', 'port_logistics', 'logistics']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'TUAS PROMENADE';

-- TUKANG: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['high_activity', 'heavy_vehicles']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'TUKANG';

-- TYERSALL: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'arterial_roads']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'TYERSALL';

-- WOODGROVE: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'WOODGROVE';

-- WOODLANDS: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'WOODLANDS';

-- YISHUN: Add missing drivers based on note keywords (minimal set, union merge)
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY(SELECT DISTINCT unnest(COALESCE(drivers, ARRAY[]::text[]) || ARRAY['amenity_access', 'downtown']) ORDER BY 1),
  updated_at = NOW()
WHERE neighbourhood_name = 'YISHUN';

COMMIT;

-- Review the changes above before committing!