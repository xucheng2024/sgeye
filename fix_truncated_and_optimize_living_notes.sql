-- Fix truncated notes and optimize living notes based on feedback
-- Part 1: Fix truncated notes (complete the sentences)
-- Part 2: Optimize notes that are too template-like or incomplete

-- ============================================
-- PART 1: Fix truncated notes
-- ============================================

-- CHOA CHU KANG - Complete long_term_comfort_note
UPDATE neighbourhood_living_notes SET
  long_term_comfort_note = 'Comfortable long-term if you are comfortable with a west / north-west commute profile and prefer mature town convenience over central proximity.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CHOA CHU KANG';

-- ONE NORTH - Complete long_term_comfort_note
UPDATE neighbourhood_living_notes SET
  long_term_comfort_note = 'Comfortable if you like central-west access and don''t mind a business-park-adjacent environment with a mix of residential and workday activity.',
  updated_at = NOW()
WHERE neighbourhood_name = 'ONE NORTH';

-- PUNGGOL - Complete crowd_vibe_note
UPDATE neighbourhood_living_notes SET
  crowd_vibe_note = 'Young families and active weekends; strong planned-town community feel with frequent outdoor and family-oriented activity.',
  updated_at = NOW()
WHERE neighbourhood_name = 'PUNGGOL';

-- MATILDA - Complete crowd_vibe_note
UPDATE neighbourhood_living_notes SET
  crowd_vibe_note = 'Young families and active weekends; strong new-estate community feel with regular outdoor and neighbourhood activity.',
  updated_at = NOW()
WHERE neighbourhood_name = 'MATILDA';

-- ROCHOR CANAL - Complete green_outdoor_note
UPDATE neighbourhood_living_notes SET
  green_outdoor_note = 'More hard-city fabric; greenery exists mainly as connectors rather than park-first daily living spaces.',
  updated_at = NOW()
WHERE neighbourhood_name = 'ROCHOR CANAL';

-- LORONG HALUS NORTH - Complete crowd_vibe_note
UPDATE neighbourhood_living_notes SET
  crowd_vibe_note = 'Young families and active weekends; strong planned-estate community feel.',
  updated_at = NOW()
WHERE neighbourhood_name = 'LORONG HALUS NORTH';

-- NORTHSHORE - Complete crowd_vibe_note
UPDATE neighbourhood_living_notes SET
  crowd_vibe_note = 'Young families and active weekends; strong waterfront-oriented new-town community feel.',
  updated_at = NOW()
WHERE neighbourhood_name = 'NORTHSHORE';

-- ============================================
-- PART 2: Optimize notes (semantic improvements)
-- ============================================

-- NOVENA - Optimize long_term_comfort_note (tighten "hospital area" stereotype)
UPDATE neighbourhood_living_notes SET
  long_term_comfort_note = 'Comfortable for central living if you choose residential pockets buffered from main roads; less ideal if you are sensitive to traffic and institutional activity.',
  updated_at = NOW()
WHERE neighbourhood_name = 'NOVENA';

-- DUNEARN - Optimize noise_density_note (from "one-size-fits-all bad" to differentiation)
UPDATE neighbourhood_living_notes SET
  noise_density_note = 'Arterial-road corridor; traffic noise can be significant near the main road, while buffered residential pockets are noticeably quieter.',
  updated_at = NOW()
WHERE neighbourhood_name = 'DUNEARN';

-- BUGIS - Optimize long_term_comfort_note
UPDATE neighbourhood_living_notes SET
  long_term_comfort_note = 'Excellent for convenience-first city living; long-term comfort depends heavily on distance from nightlife belts and main roads.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BUGIS';

-- CITY HALL - Optimize long_term_comfort_note
UPDATE neighbourhood_living_notes SET
  long_term_comfort_note = 'Ideal for city-lifestyle convenience and short commutes; less comfortable if you are seeking a stable, quiet residential environment.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CITY HALL';

-- BENCOOLEN - Optimize long_term_comfort_note
UPDATE neighbourhood_living_notes SET
  long_term_comfort_note = 'Works well for students and convenience-first living; less suitable for long-term calm, family-oriented residence.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BENCOOLEN';

-- BOULEVARD - Optimize long_term_comfort_note
UPDATE neighbourhood_living_notes SET
  long_term_comfort_note = 'Best suited for those who prioritise Orchard-area convenience; quieter long-term living depends on pocket selection and road buffering.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BOULEVARD';

-- CAIRNHILL - Optimize long_term_comfort_note
UPDATE neighbourhood_living_notes SET
  long_term_comfort_note = 'Strong for city-core access; long-term comfort depends on pocket, elevation, and tolerance for surrounding urban activity.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CAIRNHILL';

-- GOODWOOD PARK - Optimize long_term_comfort_note
UPDATE neighbourhood_living_notes SET
  long_term_comfort_note = 'Comfortable if you value central convenience and premium surroundings; quieter living depends on exact pocket and road exposure.',
  updated_at = NOW()
WHERE neighbourhood_name = 'GOODWOOD PARK';

