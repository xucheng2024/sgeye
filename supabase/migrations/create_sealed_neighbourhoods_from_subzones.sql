-- Migration: Create Sealed Neighbourhoods from Subzones
-- Description: Step 0 - Create initial sealed neighbourhoods where neighbourhood.geom = subzone.geom
-- This is the geographic foundation before geocoding coordinates

-- ============================================
-- Create Sealed Neighbourhoods from Subzones
-- ============================================
-- For each subzone, create a sealed neighbourhood with the same geometry
INSERT INTO neighbourhoods (
  id,
  name,
  planning_area_id,
  type,
  parent_subzone_id,
  geom,
  bbox,
  one_liner,
  created_at,
  updated_at
)
SELECT 
  s.id as id, -- Use subzone ID as neighbourhood ID
  s.name as name,
  s.planning_area_id,
  'sealed' as type,
  s.id as parent_subzone_id, -- Self-reference to subzone
  s.geom as geom, -- Same geometry as subzone (sealed = subzone)
  s.bbox as bbox,
  'Sealed neighbourhood based on ' || s.name || ' subzone' as one_liner,
  NOW() as created_at,
  NOW() as updated_at
FROM subzones s
WHERE s.geom IS NOT NULL
ON CONFLICT (id) 
DO UPDATE SET
  name = EXCLUDED.name,
  planning_area_id = EXCLUDED.planning_area_id,
  type = EXCLUDED.type,
  parent_subzone_id = EXCLUDED.parent_subzone_id,
  geom = EXCLUDED.geom,
  bbox = EXCLUDED.bbox,
  one_liner = EXCLUDED.one_liner,
  updated_at = EXCLUDED.updated_at;

-- ============================================
-- Verification
-- ============================================
-- Check how many neighbourhoods were created
DO $$
DECLARE
  neighbourhood_count INTEGER;
  subzone_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO neighbourhood_count FROM neighbourhoods WHERE type = 'sealed';
  SELECT COUNT(*) INTO subzone_count FROM subzones WHERE geom IS NOT NULL;
  
  RAISE NOTICE 'Created % sealed neighbourhoods from % subzones', neighbourhood_count, subzone_count;
  
  IF neighbourhood_count = 0 THEN
    RAISE WARNING 'No neighbourhoods created! Make sure subzones table has data with geometries.';
  END IF;
END $$;

