-- Update living notes for subareas based on differentiation analysis
-- This reflects the significant differences within the same planning area

-- ============================================
-- TAMPINES: Central vs North/East
-- ============================================

-- TAMPINES (Central) - MRT直达, 成熟生活区, 非常好住
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'good',
  noise_density_note = 'Central Tampines: MRT-accessible mature estate; generally calm in residential blocks, busier near Tampines MRT and malls.',
  daily_convenience_rating = 'good',
  daily_convenience_note = 'Excellent convenience: Tampines Mall, Century Square, markets, schools, and direct MRT access. Very livable.',
  green_outdoor_rating = 'good',
  green_outdoor_note = 'Good access to Tampines Eco Green and park connectors for daily walks.',
  crowd_vibe_rating = 'good',
  crowd_vibe_note = 'Mature heartland rhythm; stable daily life with strong community feel.',
  long_term_comfort_rating = 'good',
  long_term_comfort_note = 'Very comfortable long-term: mature amenities, excellent connectivity, and established community.',
  updated_at = NOW()
WHERE neighbourhood_name = 'TAMPINES';

-- TAMPINES EAST - 新区, 必须bus/long walk, 生活动线不顺, 风大, 夜晚空
INSERT INTO neighbourhood_living_notes (
  neighbourhood_name,
  noise_density_rating,
  noise_density_note,
  daily_convenience_rating,
  daily_convenience_note,
  green_outdoor_rating,
  green_outdoor_note,
  crowd_vibe_rating,
  crowd_vibe_note,
  long_term_comfort_rating,
  long_term_comfort_note
) VALUES (
  'TAMPINES EAST',
  'mixed',
  'Newer development area; generally quieter but can feel empty at night. More open layout with fewer surrounding developments; can feel exposed in some blocks.',
  'mixed',
  'Requires bus or long walk to MRT; daily errands less convenient than Central. New but daily routines are less streamlined.',
  'mixed',
  'More open space but feels less established; some green pockets.',
  'mixed',
  'Newer area; less community activity, can feel empty especially in evenings.',
  'mixed',
  'Newer and cheaper, but daily living convenience is significantly lower than Central. Consider if you prioritize cost over convenience.'
)
ON CONFLICT (neighbourhood_name) DO UPDATE SET
  noise_density_rating = EXCLUDED.noise_density_rating,
  noise_density_note = EXCLUDED.noise_density_note,
  daily_convenience_rating = EXCLUDED.daily_convenience_rating,
  daily_convenience_note = EXCLUDED.daily_convenience_note,
  green_outdoor_rating = EXCLUDED.green_outdoor_rating,
  green_outdoor_note = EXCLUDED.green_outdoor_note,
  crowd_vibe_rating = EXCLUDED.crowd_vibe_rating,
  crowd_vibe_note = EXCLUDED.crowd_vibe_note,
  long_term_comfort_rating = EXCLUDED.long_term_comfort_rating,
  long_term_comfort_note = EXCLUDED.long_term_comfort_note,
  updated_at = NOW();

-- TAMPINES NORTH - 新区, 必须bus/long walk, 生活动线不顺, 风大, 夜晚空
INSERT INTO neighbourhood_living_notes (
  neighbourhood_name,
  noise_density_rating,
  noise_density_note,
  daily_convenience_rating,
  daily_convenience_note,
  green_outdoor_rating,
  green_outdoor_note,
  crowd_vibe_rating,
  crowd_vibe_note,
  long_term_comfort_rating,
  long_term_comfort_note
) VALUES (
  'TAMPINES NORTH',
  'mixed',
  'Newer development area; generally quieter but can feel empty at night. More open layout with fewer surrounding developments; can feel exposed in some blocks.',
  'mixed',
  'Requires bus or long walk to MRT; daily errands less convenient than Central. New but daily routines are less streamlined.',
  'mixed',
  'More open space but feels less established; some green pockets.',
  'mixed',
  'Newer area; less community activity, can feel empty especially in evenings.',
  'mixed',
  'Newer and cheaper, but daily living convenience is significantly lower than Central. Consider if you prioritize cost over convenience.'
)
ON CONFLICT (neighbourhood_name) DO UPDATE SET
  noise_density_rating = EXCLUDED.noise_density_rating,
  noise_density_note = EXCLUDED.noise_density_note,
  daily_convenience_rating = EXCLUDED.daily_convenience_rating,
  daily_convenience_note = EXCLUDED.daily_convenience_note,
  green_outdoor_rating = EXCLUDED.green_outdoor_rating,
  green_outdoor_note = EXCLUDED.green_outdoor_note,
  crowd_vibe_rating = EXCLUDED.crowd_vibe_rating,
  crowd_vibe_note = EXCLUDED.crowd_vibe_note,
  long_term_comfort_rating = EXCLUDED.long_term_comfort_rating,
  long_term_comfort_note = EXCLUDED.long_term_comfort_note,
  updated_at = NOW();

-- ============================================
-- QUEENSTOWN: 超老房 vs Dawson新组屋
-- ============================================

-- QUEENSTOWN - 超老房(50-60年), 靠高速/铁轨, Central但住感差距巨大
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'Older estate (50-60 years old); noise from expressway and railway tracks affects only some subareas. Interior blocks and Dawson are good. Only part of Queenstown is truly comfortable.',
  daily_convenience_rating = 'good',
  daily_convenience_note = 'Central location with mature amenities, but living experience varies dramatically by subarea.',
  green_outdoor_rating = 'mixed',
  green_outdoor_note = 'Green spaces available but interspersed within dense urban uses.',
  crowd_vibe_rating = 'mixed',
  crowd_vibe_note = 'Mix of very old blocks and newer Dawson developments; activity levels vary significantly.',
  long_term_comfort_rating = 'mixed',
  long_term_comfort_note = 'Central + Queenstown does not automatically mean comfortable living. Only Dawson and some interior blocks offer good long-term comfort.',
  updated_at = NOW()
WHERE neighbourhood_name = 'QUEENSTOWN';

-- ============================================
-- BUKIT MERAH: Redhill/Tiong Bahru/Telok Blangah 完全不同世界
-- ============================================

-- BUKIT MERAH - 需要区分, 靠港口/工业区 vs 成熟社区
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'Highly variable: Redhill/Tiong Bahru are mature, quiet communities, while port/industrial-adjacent areas have heavy truck traffic and noise.',
  daily_convenience_rating = 'good',
  daily_convenience_note = 'Strong mature-town convenience, but access quality varies significantly by subarea.',
  green_outdoor_rating = 'good',
  green_outdoor_note = 'Good access to park connectors, but quality varies by subarea.',
  crowd_vibe_rating = 'mixed',
  crowd_vibe_note = 'Redhill/Tiong Bahru/Telok Blangah are completely different worlds from port-adjacent areas. Know which subarea you are buying.',
  long_term_comfort_rating = 'mixed',
  long_term_comfort_note = 'This is an area where "those who know, know; those who don''t can easily step into a trap." Subarea selection is critical.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BUKIT MERAH';

-- REDHILL - 成熟社区
INSERT INTO neighbourhood_living_notes (
  neighbourhood_name,
  noise_density_rating,
  noise_density_note,
  daily_convenience_rating,
  daily_convenience_note,
  green_outdoor_rating,
  green_outdoor_note,
  crowd_vibe_rating,
  crowd_vibe_note,
  long_term_comfort_rating,
  long_term_comfort_note
) VALUES (
  'REDHILL',
  'good',
  'Mature, quiet residential community; interior blocks are calm, busier near Redhill MRT.',
  'good',
  'Strong mature-estate convenience: markets, food options, and good MRT connectivity.',
  'good',
  'Good access to park connectors and nearby green spaces.',
  'good',
  'Stable family-oriented rhythm; mature community feel.',
  'good',
  'Comfortable long-term: mature community with good connectivity and established amenities.'
)
ON CONFLICT (neighbourhood_name) DO UPDATE SET
  noise_density_rating = EXCLUDED.noise_density_rating,
  noise_density_note = EXCLUDED.noise_density_note,
  daily_convenience_rating = EXCLUDED.daily_convenience_rating,
  daily_convenience_note = EXCLUDED.daily_convenience_note,
  green_outdoor_rating = EXCLUDED.green_outdoor_rating,
  green_outdoor_note = EXCLUDED.green_outdoor_note,
  crowd_vibe_rating = EXCLUDED.crowd_vibe_rating,
  crowd_vibe_note = EXCLUDED.crowd_vibe_note,
  long_term_comfort_rating = EXCLUDED.long_term_comfort_rating,
  long_term_comfort_note = EXCLUDED.long_term_comfort_note,
  updated_at = NOW();

-- TIONG BAHRU - 成熟社区
INSERT INTO neighbourhood_living_notes (
  neighbourhood_name,
  noise_density_rating,
  noise_density_note,
  daily_convenience_rating,
  daily_convenience_note,
  green_outdoor_rating,
  green_outdoor_note,
  crowd_vibe_rating,
  crowd_vibe_note,
  long_term_comfort_rating,
  long_term_comfort_note
) VALUES (
  'TIONG BAHRU',
  'good',
  'Mature, quiet residential community; interior blocks are calm, busier near Tiong Bahru MRT.',
  'good',
  'Strong mature-estate convenience: Tiong Bahru Market, food options, and good MRT connectivity.',
  'good',
  'Good access to park connectors and nearby green spaces.',
  'good',
  'Stable family-oriented rhythm; mature community feel with local charm.',
  'good',
  'Comfortable long-term: mature community with good connectivity and established amenities.'
)
ON CONFLICT (neighbourhood_name) DO UPDATE SET
  noise_density_rating = EXCLUDED.noise_density_rating,
  noise_density_note = EXCLUDED.noise_density_note,
  daily_convenience_rating = EXCLUDED.daily_convenience_rating,
  daily_convenience_note = EXCLUDED.daily_convenience_note,
  green_outdoor_rating = EXCLUDED.green_outdoor_rating,
  green_outdoor_note = EXCLUDED.green_outdoor_note,
  crowd_vibe_rating = EXCLUDED.crowd_vibe_rating,
  crowd_vibe_note = EXCLUDED.crowd_vibe_note,
  long_term_comfort_rating = EXCLUDED.long_term_comfort_rating,
  long_term_comfort_note = EXCLUDED.long_term_comfort_note,
  updated_at = NOW();

-- ============================================
-- PUNGGOL: MRT主线 vs LRT-only
-- ============================================

-- PUNGGOL TOWN CENTRE - MRT主线, 水边景观
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'New-town density; noise clusters near schools and main roads, calmer in residential pockets.',
  daily_convenience_rating = 'good',
  daily_convenience_note = 'Excellent: Waterway Point mall, markets, and direct MRT access. Key is MRT connectivity, not just newness.',
  green_outdoor_rating = 'good',
  green_outdoor_note = 'Excellent outdoor access: Punggol Waterway, park connectors, and coastal routes with waterfront views.',
  crowd_vibe_rating = 'good',
  crowd_vibe_note = 'Young families and active weekends; strong "new town" community feel.',
  long_term_comfort_rating = 'good',
  long_term_comfort_note = 'Comfortable for family living if you have MRT access. The critical factor is commute path, not just newness.',
  updated_at = NOW()
WHERE neighbourhood_name = 'PUNGGOL TOWN CENTRE';

-- PUNGGOL CANAL / PUNGGOL FIELD - LRT-only, 内陆空旷
INSERT INTO neighbourhood_living_notes (
  neighbourhood_name,
  noise_density_rating,
  noise_density_note,
  daily_convenience_rating,
  daily_convenience_note,
  green_outdoor_rating,
  green_outdoor_note,
  crowd_vibe_rating,
  crowd_vibe_note,
  long_term_comfort_rating,
  long_term_comfort_note
) VALUES (
  'PUNGGOL CANAL',
  'good',
  'Newer area; generally quieter but can feel empty.',
  'mixed',
  'LRT-only access; requires transfer to MRT. Daily errands less convenient than Town Centre. New but commute path is longer.',
  'mixed',
  'More open space but feels less established; inland areas lack waterfront access.',
  'mixed',
  'Newer area; less community activity, can feel empty especially in evenings.',
  'mixed',
  'New but "whether it''s livable" differs greatly. Key is commute path - LRT-only means longer daily commute.'
)
ON CONFLICT (neighbourhood_name) DO UPDATE SET
  noise_density_rating = EXCLUDED.noise_density_rating,
  noise_density_note = EXCLUDED.noise_density_note,
  daily_convenience_rating = EXCLUDED.daily_convenience_rating,
  daily_convenience_note = EXCLUDED.daily_convenience_note,
  green_outdoor_rating = EXCLUDED.green_outdoor_rating,
  green_outdoor_note = EXCLUDED.green_outdoor_note,
  crowd_vibe_rating = EXCLUDED.crowd_vibe_rating,
  crowd_vibe_note = EXCLUDED.crowd_vibe_note,
  long_term_comfort_rating = EXCLUDED.long_term_comfort_rating,
  long_term_comfort_note = EXCLUDED.long_term_comfort_note,
  updated_at = NOW();

-- ============================================
-- SENGKANG: 靠近MRT vs 深LRT
-- ============================================

-- SENGKANG TOWN CENTRE - 靠近MRT, 成熟段
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'New-town density; noise clusters near schools and main roads, calmer in residential pockets.',
  daily_convenience_rating = 'good',
  daily_convenience_note = 'Excellent: Compass One mall, markets, and direct MRT access. Mature segment with established amenities.',
  green_outdoor_rating = 'good',
  green_outdoor_note = 'Strong park connectors and outdoor spaces; very kid/stroller-friendly.',
  crowd_vibe_rating = 'good',
  crowd_vibe_note = 'Young families and active weekends; stronger community feel in mature segment.',
  long_term_comfort_rating = 'good',
  long_term_comfort_note = 'More stable than Punggol, but still has clear differentiation. MRT proximity is key.',
  updated_at = NOW()
WHERE neighbourhood_name = 'SENGKANG TOWN CENTRE';

-- SENGKANG WEST - 深LRT, 新开发段
INSERT INTO neighbourhood_living_notes (
  neighbourhood_name,
  noise_density_rating,
  noise_density_note,
  daily_convenience_rating,
  daily_convenience_note,
  green_outdoor_rating,
  green_outdoor_note,
  crowd_vibe_rating,
  crowd_vibe_note,
  long_term_comfort_rating,
  long_term_comfort_note
) VALUES (
  'SENGKANG WEST',
  'good',
  'Newer development area; generally quieter.',
  'mixed',
  'Deep LRT area; requires LRT transfer to MRT. Daily errands less convenient than Town Centre. New development segment.',
  'mixed',
  'More open space but feels less established.',
  'mixed',
  'Newer area; less community activity, can feel less established.',
  'mixed',
  'New development segment but daily convenience is lower than Town Centre. LRT-only access means longer commute.'
)
ON CONFLICT (neighbourhood_name) DO UPDATE SET
  noise_density_rating = EXCLUDED.noise_density_rating,
  noise_density_note = EXCLUDED.noise_density_note,
  daily_convenience_rating = EXCLUDED.daily_convenience_rating,
  daily_convenience_note = EXCLUDED.daily_convenience_note,
  green_outdoor_rating = EXCLUDED.green_outdoor_rating,
  green_outdoor_note = EXCLUDED.green_outdoor_note,
  crowd_vibe_rating = EXCLUDED.crowd_vibe_rating,
  crowd_vibe_note = EXCLUDED.crowd_vibe_note,
  long_term_comfort_rating = EXCLUDED.long_term_comfort_rating,
  long_term_comfort_note = EXCLUDED.long_term_comfort_note,
  updated_at = NOW();

-- ============================================
-- BUKIT PANJANG: Downtown Line直达 vs bus-first
-- ============================================

-- Note: Need to check if there's a specific neighbourhood name for Bukit Panjang
-- For now, updating general guidance

-- ============================================
-- ANG MO KIO: Central vs 靠工业区
-- ============================================

-- ANG MO KIO TOWN CENTRE - Central, MRT核心
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'Mature central town; generally calm in residential blocks, busier near town centre and MRT.',
  daily_convenience_rating = 'good',
  daily_convenience_note = 'Excellent: AMK Hub, markets, food courts, and direct MRT access. Central core with strong amenities.',
  green_outdoor_rating = 'good',
  green_outdoor_note = 'Good access to Bishan-Ang Mo Kio Park and central-side park connectors.',
  crowd_vibe_rating = 'good',
  crowd_vibe_note = 'Family-oriented heartland rhythm; stable daily life with good community feel.',
  long_term_comfort_rating = 'good',
  long_term_comfort_note = 'Overall very good, but not all areas are equally comfortable. Central core is excellent.',
  updated_at = NOW()
WHERE neighbourhood_name = 'ANG MO KIO TOWN CENTRE';

-- ANG MO KIO - 靠工业区, 靠大路
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'Mature central town; areas near industrial zones and major roads have more traffic noise.',
  daily_convenience_rating = 'good',
  daily_convenience_note = 'Strong mature-town convenience, but areas near industrial zones have less residential-first amenities.',
  green_outdoor_rating = 'good',
  green_outdoor_note = 'Good access to Bishan-Ang Mo Kio Park, but proximity varies by subarea.',
  crowd_vibe_rating = 'mixed',
  crowd_vibe_note = 'Family-oriented heartland rhythm in central areas; industrial-adjacent areas have different character.',
  long_term_comfort_rating = 'mixed',
  long_term_comfort_note = 'Overall very good, but not all areas are equally comfortable. Industrial-adjacent areas are less ideal.',
  updated_at = NOW()
WHERE neighbourhood_name = 'ANG MO KIO';

-- ============================================
-- TOA PAYOH: 靠HDB Hub/MRT vs 老静区
-- ============================================

-- TOA PAYOH CENTRAL - 靠HDB Hub/MRT
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'Mature central town; busier near Toa Payoh MRT and HDB Hub, calmer in interior residential blocks.',
  daily_convenience_rating = 'good',
  daily_convenience_note = 'Excellent: HDB Hub, markets, food courts, and direct MRT access. Central core with strong amenities.',
  green_outdoor_rating = 'good',
  green_outdoor_note = 'Good access to Bishan-Ang Mo Kio Park and central-side park connectors.',
  crowd_vibe_rating = 'good',
  crowd_vibe_note = 'Family-oriented heartland rhythm; busier near MRT/Hub, quieter in interior blocks.',
  long_term_comfort_rating = 'good',
  long_term_comfort_note = 'Comfortable long-term if you like central heartland living. MRT/Hub proximity offers excellent convenience.',
  updated_at = NOW()
WHERE neighbourhood_name = 'TOA PAYOH CENTRAL';

-- TOA PAYOH WEST - 老静区
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'good',
  noise_density_note = 'Older, quieter residential area; generally calm in interior blocks, less traffic noise.',
  daily_convenience_rating = 'mixed',
  daily_convenience_note = 'Mature-estate amenities available, but requires walk to MRT/Hub. Less convenient than Central.',
  green_outdoor_rating = 'good',
  green_outdoor_note = 'Good access to park connectors and nearby green spaces.',
  crowd_vibe_rating = 'good',
  crowd_vibe_note = 'Quieter, older residential rhythm; less foot traffic than Central.',
  long_term_comfort_rating = 'good',
  long_term_comfort_note = 'Comfortable long-term if you prefer quieter living. Trade-off is less immediate MRT access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'TOA PAYOH WEST';

-- ============================================
-- KALLANG/LAVENDER/JALAN BESAR: 靠主干道/酒吧 vs 内街住宅
-- ============================================

-- LAVENDER - 靠主干道/酒吧, 白天OK晚上差异巨大
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'Dense road networks and commercial activity; noise from main roads and bars affects main road areas. Interior residential streets are calmer. Daytime OK, nighttime difference is huge between main road vs interior streets.',
  daily_convenience_rating = 'good',
  daily_convenience_note = 'Strong connectivity and dense amenity coverage support efficient routines.',
  green_outdoor_rating = 'bad',
  green_outdoor_note = 'Limited immediate access to substantial green spaces.',
  crowd_vibe_rating = 'mixed',
  crowd_vibe_note = 'Main road/bar-adjacent areas have high daytime activity from offices/transport and nighttime bar/entertainment crowd. Interior residential streets have quieter, more local feel.',
  long_term_comfort_rating = 'mixed',
  long_term_comfort_note = 'Lavender is not 100% bad. Suitability depends heavily on location: main road/bar-adjacent areas are challenging, while interior residential streets offer better long-term comfort. Nighttime experience differs dramatically.',
  updated_at = NOW()
WHERE neighbourhood_name = 'LAVENDER';

-- KALLANG BAHRU - 靠主干道/工业区
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'Industrial and arterial road proximity; heavy-vehicle noise and main road traffic. Daytime OK, nighttime can be quieter but industrial character remains.',
  daily_convenience_rating = 'mixed',
  daily_convenience_note = 'Basic amenities present, though town-centre access requires travel.',
  green_outdoor_rating = 'mixed',
  green_outdoor_note = 'Some access to waterfront and park connectors.',
  crowd_vibe_rating = 'mixed',
  crowd_vibe_note = 'Activity fluctuates between industrial daytime use and residential evenings. Main road vs interior street experience differs.',
  long_term_comfort_rating = 'mixed',
  long_term_comfort_note = 'Comfort varies dramatically: main road/industrial-adjacent vs interior residential streets. Know which you are buying.',
  updated_at = NOW()
WHERE neighbourhood_name = 'KALLANG BAHRU';

-- KALLANG WAY - 内街住宅可能更好
UPDATE neighbourhood_living_notes SET
  noise_density_rating = 'mixed',
  noise_density_note = 'City-fringe area; interior residential streets are calmer, main road areas are busier.',
  daily_convenience_rating = 'good',
  daily_convenience_note = 'Strong city-fringe convenience: food, services, and transit access.',
  green_outdoor_rating = 'mixed',
  green_outdoor_note = 'Some green pockets; larger parks require a short trip.',
  crowd_vibe_rating = 'mixed',
  crowd_vibe_note = 'Interior residential streets have quieter, more local feel; main road areas are busier.',
  long_term_comfort_rating = 'mixed',
  long_term_comfort_note = 'Interior residential streets offer better long-term comfort than main road/bar-adjacent areas. Location within area matters greatly.',
  updated_at = NOW()
WHERE neighbourhood_name = 'KALLANG WAY';

