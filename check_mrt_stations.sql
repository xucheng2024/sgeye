-- Check MRT stations data
-- 1. Check if station_code exists
SELECT 
  COUNT(*) as total_stations,
  COUNT(station_code) as stations_with_code,
  COUNT(*) - COUNT(station_code) as stations_without_code
FROM mrt_stations;

-- 2. Check sample station codes
SELECT station_name, station_code, neighbourhood_id
FROM mrt_stations
WHERE station_code IS NOT NULL
LIMIT 10;

-- 3. Check if neighbourhood_id matches
SELECT 
  COUNT(DISTINCT neighbourhood_id) as unique_neighbourhoods_with_stations,
  COUNT(*) as total_stations_with_neighbourhood
FROM mrt_stations
WHERE neighbourhood_id IS NOT NULL;

-- 4. Check a sample neighbourhood's MRT stations
SELECT 
  n.name as neighbourhood_name,
  n.id as neighbourhood_id,
  m.station_name,
  m.station_code,
  m.neighbourhood_id as mrt_neighbourhood_id
FROM neighbourhoods n
LEFT JOIN mrt_stations m ON m.neighbourhood_id = n.id
WHERE n.id IN (SELECT neighbourhood_id FROM mrt_stations WHERE station_code IS NOT NULL LIMIT 1)
LIMIT 5;

