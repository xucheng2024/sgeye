-- Populate neighbourhood centers from raw_resale_2017 data
-- This will calculate average lat/lng for each neighbourhood and store it in the center column

-- First, add the center column if it doesn't exist
ALTER TABLE neighbourhoods 
ADD COLUMN IF NOT EXISTS center JSONB;

-- Calculate and update centers for all neighbourhoods that have location data
WITH neighbourhood_centers AS (
  SELECT 
    r.neighbourhood_id,
    AVG(r.latitude) as avg_lat,
    AVG(r.longitude) as avg_lng,
    COUNT(*) as sample_count
  FROM raw_resale_2017 r
  WHERE r.neighbourhood_id IS NOT NULL
    AND r.latitude IS NOT NULL
    AND r.longitude IS NOT NULL
    AND r.latitude > 1.1 AND r.latitude < 1.5  -- Singapore bounds
    AND r.longitude > 103.5 AND r.longitude < 104.1
  GROUP BY r.neighbourhood_id
  HAVING COUNT(*) >= 5  -- At least 5 transactions to ensure accuracy
)
UPDATE neighbourhoods n
SET center = jsonb_build_object('lat', nc.avg_lat, 'lng', nc.avg_lng)
FROM neighbourhood_centers nc
WHERE n.id = nc.neighbourhood_id;

-- Show results
SELECT 
  n.id,
  n.name,
  n.center,
  (SELECT COUNT(*) FROM raw_resale_2017 r 
   WHERE r.neighbourhood_id = n.id 
   AND r.latitude IS NOT NULL 
   AND r.longitude IS NOT NULL) as location_count
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




