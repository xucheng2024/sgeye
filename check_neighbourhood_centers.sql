-- Check which neighbourhoods have center calculated from raw_resale_2017
-- For the missing neighbourhoods, check if they have location data

SELECT 
  n.id,
  n.name,
  COUNT(r.id) as tx_count,
  COUNT(r.latitude) FILTER (WHERE r.latitude IS NOT NULL AND r.longitude IS NOT NULL) as location_count,
  AVG(r.latitude) as avg_lat,
  AVG(r.longitude) as avg_lng
FROM neighbourhoods n
LEFT JOIN raw_resale_2017 r ON r.neighbourhood_id = n.id
WHERE n.id IN (
  'ang-mo-kio-town-centre',
  'cheng-san',
  'chong-boon',
  'kebun-bahru',
  'sembawang-hills',
  'shangri-la',
  'tagore',
  'townsville',
  'yio-chu-kang',
  'yio-chu-kang-east',
  'yio-chu-kang-north',
  'yio-chu-kang-west'
)
GROUP BY n.id, n.name
ORDER BY n.name;

