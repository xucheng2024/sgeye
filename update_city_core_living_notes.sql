-- Update living notes for city core and premium areas based on differentiation analysis
-- Emphasize differentiation between main road-exposed vs buffered pockets

-- ============================================
-- 1. DUNEARN: Main road-exposed vs buffered pockets
-- ============================================
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'Arterial-road corridor: traffic noise significant near main road, but buffered residential pockets are much calmer. Main road-exposed vs buffered pockets differ greatly.',
  long_term_comfort_rating = 'good',
  long_term_comfort_note = 'Good long-term if you choose pockets buffered from the main road. Comfort depends on block location relative to arterial exposure.',
  updated_at = NOW()
WHERE neighbourhood_name = 'DUNEARN';

-- ============================================
-- 2. NOVENA: Hospital + main road, but stable residential pockets exist
-- ============================================
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'Major roads and institutional uses contribute to recurring traffic noise. However, Novena has many stable residential pockets that are quieter.',
  crowd_vibe_rating = 'mixed',
  crowd_vibe_note = 'High daytime activity driven by healthcare and commercial functions, but residential pockets have more stable community feel.',
  long_term_comfort_rating = 'mixed',
  long_term_comfort_note = 'Works well for central access; comfort depends on main-road exposure. Many stable residential pockets exist away from major roads.',
  updated_at = NOW()
WHERE neighbourhood_name = 'NOVENA';

-- ============================================
-- 3. ORCHARD BELT: BOULEVARD / CAIRNHILL / GOODWOOD PARK / TANGLIN
-- Unified logic: convenience + pocket differentiation
-- ============================================

-- BOULEVARD
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'Orchard fringe: arterial traffic is constant, but quiet residential pockets exist away from main roads.',
  daily_convenience_rating = 'good',
  daily_convenience_note = 'Extremely convenient for shopping, food, and transit. Orchard belt convenience is a major plus.',
  green_outdoor_rating = 'mixed',
  green_outdoor_note = 'Good access to Botanic Gardens and Orchard area greenery. Not hard-city despite urban core proximity.',
  crowd_vibe_rating = 'mixed',
  crowd_vibe_note = 'Tourist/retail-driven activity on main roads; quieter residential pockets have more local feel.',
  long_term_comfort_rating = 'mixed',
  long_term_comfort_note = 'Orchard belt: convenience is excellent, but pocket differentiation is huge. Quiet pockets exist; comfort depends on arterial exposure vs buffered locations.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BOULEVARD';

-- CAIRNHILL
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'Close to Orchard: arterial traffic nearby, but quiet residential pockets exist away from main roads.',
  daily_convenience_rating = 'good',
  daily_convenience_note = 'Top-tier convenience for shopping, dining, and transit. Orchard belt convenience is excellent.',
  green_outdoor_rating = 'mixed',
  green_outdoor_note = 'Good access to Botanic Gardens and Orchard area greenery. Proximity to Istana and parks, not hard-city.',
  crowd_vibe_rating = 'mixed',
  crowd_vibe_note = 'Tourist/retail-driven activity on main roads; quieter residential pockets have more local feel.',
  long_term_comfort_rating = 'mixed',
  long_term_comfort_note = 'Orchard belt: convenience is excellent, but pocket differentiation is huge. Quiet pockets exist; comfort depends on arterial exposure vs buffered locations.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CAIRNHILL';

-- GOODWOOD PARK
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'Central premium area: arterial traffic nearby, but quiet residential pockets exist away from main roads.',
  daily_convenience_rating = 'good',
  daily_convenience_note = 'Excellent convenience around Orchard/central belt. Orchard belt convenience is a major plus.',
  green_outdoor_rating = 'mixed',
  green_outdoor_note = 'Good access to Botanic Gardens and central greenery. Proximity to Istana and parks, not hard-city.',
  crowd_vibe_rating = 'mixed',
  crowd_vibe_note = 'Tourist/retail-driven activity on main roads; quieter residential pockets have more local feel.',
  long_term_comfort_rating = 'mixed',
  long_term_comfort_note = 'Orchard belt: convenience is excellent, but pocket differentiation is huge. Quiet pockets exist; comfort depends on arterial exposure vs buffered locations.',
  updated_at = NOW()
WHERE neighbourhood_name = 'GOODWOOD PARK';

-- TANGLIN
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'Central premium area: arterial traffic nearby, but quiet residential pockets exist away from main roads.',
  daily_convenience_rating = 'good',
  daily_convenience_note = 'Excellent convenience around Orchard/central belt with premium amenities. Orchard belt convenience is excellent.',
  green_outdoor_rating = 'good',
  green_outdoor_note = 'Good access to Botanic Gardens and central greenery. Proximity to Istana and parks.',
  crowd_vibe_rating = 'mixed',
  crowd_vibe_note = 'Tourist/retail-driven activity on main roads; quieter residential pockets have more local feel.',
  long_term_comfort_rating = 'good',
  long_term_comfort_note = 'Orchard belt: convenience is excellent, but pocket differentiation exists. Quiet pockets exist; comfort depends on arterial exposure vs buffered locations.',
  updated_at = NOW()
WHERE neighbourhood_name = 'TANGLIN';

-- ============================================
-- 4. CITY CORE/FRINGE: FARRER PARK / BENCOOLEN / BUGIS / CITY HALL / BRAS BASAH / CRAWFORD
-- Rating: bad → mixed, emphasize differentiation
-- ============================================

-- FARRER PARK
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'Dense city-fringe area: main road/nightlife-adjacent areas have constant traffic and activity, but interior residential streets and higher floors are much calmer.',
  daily_convenience_rating = 'good',
  daily_convenience_note = 'Very convenient for food, transit, and errands.',
  green_outdoor_rating = 'mixed',
  green_outdoor_note = 'Some green pockets; larger parks require a short trip. Interior areas have better access.',
  crowd_vibe_rating = 'mixed',
  crowd_vibe_note = 'Main road/nightlife areas have high churn with mix of locals and renters. Interior residential streets have quieter, more local feel.',
  long_term_comfort_rating = 'mixed',
  long_term_comfort_note = 'City core/fringe: differentiation is huge. Main road/nightlife adjacency vs interior streets/higher floors differ dramatically. Know which you are buying.',
  updated_at = NOW()
WHERE neighbourhood_name = 'FARRER PARK';

-- BENCOOLEN
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'City-core density: main road areas have constant traffic and footfall, but interior residential streets and higher floors are much calmer.',
  daily_convenience_rating = 'good',
  daily_convenience_note = 'Extremely convenient for transit, food, and services.',
  green_outdoor_rating = 'mixed',
  green_outdoor_note = 'Some green pockets; larger parks require a short trip. Interior areas have better access.',
  crowd_vibe_rating = 'mixed',
  crowd_vibe_note = 'Main road areas have student/office/tourist mix with high daily churn. Interior residential streets have quieter, more local feel.',
  long_term_comfort_rating = 'mixed',
  long_term_comfort_note = 'City core: differentiation is huge. Main road/nightlife adjacency vs interior streets/higher floors differ dramatically. Works for convenience-first if you choose the right pocket.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BENCOOLEN';

-- BUGIS
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'Urban core: main road/nightlife areas have constant activity, but interior residential streets and higher floors are much calmer. Quiet nights are possible in buffered pockets.',
  daily_convenience_rating = 'good',
  daily_convenience_note = 'Extremely convenient for transit, food, and services.',
  green_outdoor_rating = 'mixed',
  green_outdoor_note = 'Some green pockets; larger parks require a short trip. Interior areas have better access.',
  crowd_vibe_rating = 'mixed',
  crowd_vibe_note = 'Main road/nightlife areas have tourist/office/nightlife mix with high churn. Interior residential streets have quieter, more local feel.',
  long_term_comfort_rating = 'mixed',
  long_term_comfort_note = 'City core: differentiation is huge. Main road/nightlife adjacency vs interior streets/higher floors differ dramatically. Excellent for convenience-first if you choose the right pocket.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BUGIS';

-- CITY HALL
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'Civic/downtown core: main road areas have constant activity and traffic, but interior residential streets and higher floors are much calmer.',
  daily_convenience_rating = 'good',
  daily_convenience_note = 'Excellent convenience for transit, food, and services.',
  green_outdoor_rating = 'mixed',
  green_outdoor_note = 'Some nearby parks, but the dominant feel is still urban core. Interior areas have better access.',
  crowd_vibe_rating = 'mixed',
  crowd_vibe_note = 'Main road areas have tourist/office crowd with high churn. Interior residential streets have quieter, more local feel.',
  long_term_comfort_rating = 'mixed',
  long_term_comfort_note = 'City core: differentiation is huge. Main road/nightlife adjacency vs interior streets/higher floors differ dramatically. Great for city-lifestyle if you choose the right pocket.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CITY HALL';

-- BRAS BASAH
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'Civic-core density: main road areas have constant traffic and footfall, but interior residential streets and higher floors are much calmer.',
  daily_convenience_rating = 'good',
  daily_convenience_note = 'Top convenience for transit, culture, and everyday services.',
  green_outdoor_rating = 'mixed',
  green_outdoor_note = 'Some nearby park space, but overall still city-core hardscape. Interior areas have better access.',
  crowd_vibe_rating = 'mixed',
  crowd_vibe_note = 'Main road areas have students, tourists, office crowd with higher daily churn. Interior residential streets have quieter, more local feel.',
  long_term_comfort_rating = 'mixed',
  long_term_comfort_note = 'City core: differentiation is huge. Main road/nightlife adjacency vs interior streets/higher floors differ dramatically. Great for central convenience if you choose the right pocket.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BRAS BASAH';

-- CRAWFORD
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'City-fringe junctions: main road areas have constant traffic, but interior residential streets and higher floors are much calmer.',
  daily_convenience_rating = 'good',
  daily_convenience_note = 'Very convenient for food, errands, and city access.',
  green_outdoor_rating = 'mixed',
  green_outdoor_note = 'Some green pockets; larger parks require a short trip. Interior areas have better access.',
  crowd_vibe_rating = 'mixed',
  crowd_vibe_note = 'Main road areas have renter/office mix with busy streets and higher churn. Interior residential streets have quieter, more local feel.',
  long_term_comfort_rating = 'mixed',
  long_term_comfort_note = 'City fringe: differentiation is huge. Main road/nightlife adjacency vs interior streets/higher floors differ dramatically. Great for convenience if you choose the right pocket.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CRAWFORD';

