-- Migration: Improve living notes realism for specific neighbourhoods
-- Description: Make descriptions more accurate and realistic for:
--   1. Almost uninhabitable zones (Mandai, Simpang North, One North, Lakeside)
--   2. Aviation/port/highway noise zones (Seletar, Changi Bay, Airport Road, Bayshore)
--   3. New estates with transfer-based access (Tampines North, Punggol Canal, Sengkang West, Lorong Halus North)
--   4. City-fringe zones with high block variance (Aljunied, Macpherson, Airport Road)

-- ============================================
-- Category 1: Almost uninhabitable zones - clearer warnings
-- ============================================

-- MANDAI ESTATE: Emphasize work-related only
UPDATE neighbourhood_living_notes
SET
  short_note = 'Industrial/nature-adjacent zone with minimal residential stock. Suitable only for work-related residents.',
  long_term_comfort_note = 'Not suitable for typical residential living unless directly tied to work in the area.',
  updated_at = NOW()
WHERE neighbourhood_name = 'MANDAI ESTATE';

-- MANDAI WEST: Emphasize work-related only
UPDATE neighbourhood_living_notes
SET
  short_note = 'Nature-edge zone with very limited residential baseline. Suitable only for those with specific work ties to the area.',
  long_term_comfort_note = 'Not suitable as a primary residential base unless work or access is directly tied to the area.',
  updated_at = NOW()
WHERE neighbourhood_name = 'MANDAI WEST';

-- SIMPANG NORTH: Mark as future zone clearly
UPDATE neighbourhood_living_notes
SET
  short_note = 'Long-term future development zone. Not a current housing option—no committed residential timeline.',
  long_term_comfort_note = 'This is a future development area, not an available residential option today.',
  updated_at = NOW()
WHERE neighbourhood_name = 'SIMPANG NORTH';

-- ONE NORTH: Mark as non-typical residential
UPDATE neighbourhood_living_notes
SET
  short_note = 'Primarily a business and research park with very limited non-typical residential pockets. Not a standard neighbourhood.',
  long_term_comfort_note = 'Non-typical residential environment dominated by business park activity. Limited residential options and different living pattern from standard HDB neighbourhoods.',
  updated_at = NOW()
WHERE neighbourhood_name = 'ONE NORTH';

-- LAKESIDE (LEISURE): Mark as leisure-adjacent zone
UPDATE neighbourhood_living_notes
SET
  short_note = 'Leisure-adjacent zone around Jurong Lake Gardens. Not a standard residential neighbourhood—dominated by recreational use.',
  long_term_comfort_note = 'Suitable if you value outdoor access and accept this is a leisure-focused zone, not a typical residential neighbourhood.',
  updated_at = NOW()
WHERE neighbourhood_name = 'LAKESIDE (LEISURE)';

-- ============================================
-- Category 2: Aviation/port/highway noise - more direct
-- ============================================

-- SELETAR: Add aircraft noise reality
UPDATE neighbourhood_living_notes
SET
  noise_density_note = 'Aviation activity from Seletar Airport introduces periodic aircraft noise. Aircraft noise is noticeable during operating hours and varies by flight path.',
  long_term_comfort_note = 'Comfort depends on tolerance for aircraft noise in exchange for spacious surroundings. Noise is periodic but real.',
  updated_at = NOW()
WHERE neighbourhood_name = 'SELETAR';

-- CHANGI BAY: Emphasize structural noise
UPDATE neighbourhood_living_notes
SET
  noise_density_note = 'Airport operations and coastal industrial activity contribute to sustained noise exposure. Noise exposure is structural rather than occasional.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CHANGI BAY';

-- AIRPORT ROAD: Emphasize structural noise + block orientation
UPDATE neighbourhood_living_notes
SET
  noise_density_note = 'Arterial roads and aviation influence create structural noise exposure. Noise exposure is structural rather than occasional—block orientation and distance from roads make a significant difference.',
  short_note = 'Strong convenience but noise exposure is structural. Block orientation matters significantly for quiet living.',
  variance_level = 'spread_out',
  long_term_comfort_note = 'Great for convenience-first living; comfort depends heavily on block orientation and distance from main roads.',
  updated_at = NOW()
WHERE neighbourhood_name = 'AIRPORT ROAD';

-- BAYSHORE: Emphasize structural expressway noise
UPDATE neighbourhood_living_notes
SET
  noise_density_note = 'Coastal-expressway influence creates structural noise exposure. Noise exposure is structural rather than occasional, though quieter inside residential pockets.',
  long_term_comfort_rating = 'mixed',
  long_term_comfort_note = 'Comfortable if you value outdoor coastal life and accept expressway noise trade-offs. Noise is structural, not occasional.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BAYSHORE';

-- ============================================
-- Category 3: New estates - add transfer-based reality check
-- ============================================

-- TAMPINES NORTH: Add transfer-based access reality
UPDATE neighbourhood_living_notes
SET
  daily_convenience_note = 'Requires bus or long walk to MRT; daily errands less convenient than Central. Daily routines feel longer not because of distance alone, but due to transfer-based access patterns.',
  short_note = 'Newer development with limited amenities. Daily routines feel longer due to transfer-based access patterns, not just distance.',
  long_term_comfort_note = 'Newer and cheaper, but daily living convenience is significantly lower than town centre. Daily routines feel longer due to bus-heavy or indirect transit patterns.',
  updated_at = NOW()
WHERE neighbourhood_name = 'TAMPINES NORTH';

-- PUNGGOL CANAL: Add transfer-based access reality
UPDATE neighbourhood_living_notes
SET
  daily_convenience_note = 'LRT-only access requires transfer to MRT. Daily errands less convenient than Town Centre. Daily routines feel longer not because of distance alone, but due to transfer-based access patterns.',
  short_note = 'Scenic waterfront but daily routines feel longer due to LRT-only transfer-based access, not just distance.',
  long_term_comfort_note = 'New development but livability varies greatly. Daily routines feel longer due to transfer-based access patterns—LRT transfer to MRT adds mental and time cost.',
  updated_at = NOW()
WHERE neighbourhood_name = 'PUNGGOL CANAL';

-- SENGKANG WEST: Add transfer-based access reality
UPDATE neighbourhood_living_notes
SET
  daily_convenience_note = 'Deep LRT area requires LRT transfer to MRT. Daily errands less convenient than Town Centre. Daily routines feel longer not because of distance alone, but due to transfer-based access patterns.',
  short_note = 'Newer development but daily routines feel longer due to deep LRT-only transfer-based access, not just distance.',
  long_term_comfort_note = 'New development but daily convenience is lower than Town Centre. Daily routines feel longer due to transfer-based access patterns—LRT-only means longer perceived commute.',
  updated_at = NOW()
WHERE neighbourhood_name = 'SENGKANG WEST';

-- LORONG HALUS NORTH: Add transfer-based access reality
UPDATE neighbourhood_living_notes
SET
  daily_convenience_note = 'LRT-only access requires transfer. Daily routines feel longer not because of distance alone, but due to transfer-based access patterns.',
  short_note = 'Family-friendly newer estate with strong outdoor access, but daily routines feel longer due to LRT-only transfer-based access.',
  long_term_comfort_note = 'Comfortable for family living if you prefer newer estates, but daily routines feel longer due to transfer-based access patterns, not just distance.',
  updated_at = NOW()
WHERE neighbourhood_name = 'LORONG HALUS NORTH';

-- ============================================
-- Category 4: City-fringe zones - emphasize block variance
-- ============================================

-- ALJUNIED: Emphasize block facing matters
UPDATE neighbourhood_living_notes
SET
  noise_density_note = 'Dense city-fringe belt; traffic and activity are noticeable, especially near main roads. Block facing (road vs interior) makes a significant difference.',
  short_note = 'City-fringe convenience with higher street activity. Block facing matters significantly—road-facing vs interior blocks feel very different.',
  long_term_comfort_note = 'Works well if you want convenience; less ideal if you prioritise quiet evenings. Block orientation and distance from arterial roads matter significantly.',
  updated_at = NOW()
WHERE neighbourhood_name = 'ALJUNIED';

-- MACPHERSON: Emphasize block facing matters
UPDATE neighbourhood_living_notes
SET
  noise_density_note = 'City-fringe area; busier near main roads, calmer in residential pockets. Block facing (road vs interior) makes a significant difference.',
  short_note = 'Strong city-fringe convenience, but block facing matters significantly—road-facing vs interior blocks feel very different.',
  variance_level = 'spread_out',
  long_term_comfort_note = 'Works well if you want convenience; less ideal if you prioritise quiet evenings. Block orientation and distance from roads matter significantly.',
  updated_at = NOW()
WHERE neighbourhood_name = 'MACPHERSON';

-- Verification: Show updated neighbourhoods
SELECT 
  neighbourhood_name,
  zone_type,
  rating_mode,
  short_note,
  variance_level
FROM neighbourhood_living_notes
WHERE neighbourhood_name IN (
  'MANDAI ESTATE',
  'MANDAI WEST',
  'SIMPANG NORTH',
  'ONE NORTH',
  'LAKESIDE (LEISURE)',
  'SELETAR',
  'CHANGI BAY',
  'AIRPORT ROAD',
  'BAYSHORE',
  'TAMPINES NORTH',
  'PUNGGOL CANAL',
  'SENGKANG WEST',
  'LORONG HALUS NORTH',
  'ALJUNIED',
  'MACPHERSON'
)
ORDER BY neighbourhood_name;

