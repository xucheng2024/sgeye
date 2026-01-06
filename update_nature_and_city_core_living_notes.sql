-- Update living notes for nature-rich but not suitable for primary residence areas
-- and ensure City Core areas have appropriate ratings

-- ============================================
-- PART 1: Nature-rich but not suitable for primary residence
-- Update long_term_comfort_note to be more definitive
-- ============================================

-- MANDAI WEST
UPDATE neighbourhood_living_notes SET
  long_term_comfort_rating = 'bad',
  long_term_comfort_note = 'Not suitable as a primary residential base unless work or access is directly tied to the area.',
  updated_at = NOW()
WHERE neighbourhood_name = 'MANDAI WEST';

-- CENTRAL WATER CATCHMENT
UPDATE neighbourhood_living_notes SET
  long_term_comfort_rating = 'bad',
  long_term_comfort_note = 'Not suitable as a primary residential base unless work or access is directly tied to the area.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CENTRAL WATER CATCHMENT';

-- NORTH-EASTERN ISLANDS
UPDATE neighbourhood_living_notes SET
  long_term_comfort_rating = 'bad',
  long_term_comfort_note = 'Not suitable as a primary residential base unless work or access is directly tied to the area.',
  updated_at = NOW()
WHERE neighbourhood_name = 'NORTH-EASTERN ISLANDS';

-- SEMAKAU
UPDATE neighbourhood_living_notes SET
  long_term_comfort_rating = 'bad',
  long_term_comfort_note = 'Not suitable as a primary residential base unless work or access is directly tied to the area.',
  updated_at = NOW()
WHERE neighbourhood_name = 'SEMAKAU';

-- ============================================
-- PART 2: City Core areas - ensure rating is mixed (not bad)
-- These areas are not "unlivable" but serve very specific resident profiles
-- ============================================

-- CECIL - Already mixed, but ensure note reflects "specific resident profile"
UPDATE neighbourhood_living_notes SET
  long_term_comfort_rating = 'mixed',
  long_term_comfort_note = 'Suitable for specific resident profiles who prioritise CBD proximity and short commutes; less ideal for those seeking quiet, family-oriented living.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CECIL';

-- CHINA SQUARE - Already mixed, but ensure note reflects "specific resident profile"
UPDATE neighbourhood_living_notes SET
  long_term_comfort_rating = 'mixed',
  long_term_comfort_note = 'Suitable for specific resident profiles who prioritise CBD proximity and work convenience; less ideal for calm long-term family living.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CHINA SQUARE';

-- CENTRAL SUBZONE - Already mixed, but ensure note reflects "specific resident profile"
UPDATE neighbourhood_living_notes SET
  long_term_comfort_rating = 'mixed',
  long_term_comfort_note = 'Suitable for specific resident profiles who prioritise city-lifestyle convenience; less ideal for quiet long-term family living.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CENTRAL SUBZONE';

