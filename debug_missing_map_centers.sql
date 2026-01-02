-- Debug missing map centers for neighbourhoods
-- Check all data sources for these neighbourhoods

-- 1. Check neighbourhood table for bbox
SELECT 
  'NEIGHBOURHOODS TABLE' as source,
  n.id,
  n.name,
  n.bbox IS NOT NULL as has_bbox,
  n.bbox
FROM neighbourhoods n
WHERE n.name IN (
  'SHANGRI-LA',
  'KEBUN BAHRU',
  'YIO CHU KANG WEST',
  'YIO CHU KANG EAST',
  'TOWNSVILLE',
  'SEMBAWANG HILLS',
  'TAGORE',
  'YIO CHU KANG',
  'YIO CHU KANG NORTH',
  'CHENG SAN',
  'CHONG BOON',
  'ANG MO KIO TOWN CENTRE'
)
ORDER BY n.name;

-- 2. Check raw_resale_2017 for location data
SELECT 
  'RAW_RESALE_2017 TABLE' as source,
  n.id,
  n.name,
  COUNT(r.id) as total_transactions,
  COUNT(r.latitude) FILTER (WHERE r.latitude IS NOT NULL AND r.longitude IS NOT NULL) as with_location,
  AVG(r.latitude) FILTER (WHERE r.latitude IS NOT NULL) as avg_lat,
  AVG(r.longitude) FILTER (WHERE r.longitude IS NOT NULL) as avg_lng
FROM neighbourhoods n
LEFT JOIN raw_resale_2017 r ON r.neighbourhood_id = n.id
WHERE n.name IN (
  'SHANGRI-LA',
  'KEBUN BAHRU',
  'YIO CHU KANG WEST',
  'YIO CHU KANG EAST',
  'TOWNSVILLE',
  'SEMBAWANG HILLS',
  'TAGORE',
  'YIO CHU KANG',
  'YIO CHU KANG NORTH',
  'CHENG SAN',
  'CHONG BOON',
  'ANG MO KIO TOWN CENTRE'
)
GROUP BY n.id, n.name
ORDER BY n.name;

-- 3. Sample a few transactions to see the actual data
SELECT 
  'SAMPLE TRANSACTIONS' as source,
  n.name,
  r.block,
  r.street_name,
  r.latitude,
  r.longitude
FROM neighbourhoods n
INNER JOIN raw_resale_2017 r ON r.neighbourhood_id = n.id
WHERE n.name IN ('SHANGRI-LA', 'KEBUN BAHRU', 'TAGORE')
  AND r.latitude IS NOT NULL
  AND r.longitude IS NOT NULL
LIMIT 20;

