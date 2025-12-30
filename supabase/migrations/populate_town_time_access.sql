-- Populate town_time_access table with data for all Singapore HDB towns
-- 
-- Data sources:
-- - Centrality: URA definitions (Central Area + City Fringe = central)
-- - MRT Density: Based on station count (≥3 = high, 1-2 = medium, 0 = low)
-- - Transfer Complexity: Based on MRT line structure (NSL/EWL/CCL direct = direct, needs transfer = 1_transfer, edge = 2_plus)
-- - Regional Hub Access: Based on proximity to regional centres (Jurong East, Tampines, Woodlands, Punggol)

INSERT INTO town_time_access (town, centrality, mrt_density, transfer_complexity, regional_hub_access, updated_at)
VALUES
  -- Central Area & City Fringe (central)
  ('CENTRAL AREA', 'central', 'high', 'direct', 'yes', NOW()),
  ('QUEENSTOWN', 'central', 'high', 'direct', 'no', NOW()),
  ('BISHAN', 'central', 'high', 'direct', 'no', NOW()),
  ('TOA PAYOH', 'central', 'high', 'direct', 'no', NOW()),
  ('KALLANG/WHAMPOA', 'central', 'medium', '1_transfer', 'no', NOW()),
  ('MARINE PARADE', 'central', 'low', '1_transfer', 'no', NOW()),
  ('GEYLANG', 'central', 'medium', '1_transfer', 'no', NOW()),
  ('BUKIT MERAH', 'central', 'medium', 'direct', 'no', NOW()),
  ('BUKIT TIMAH', 'central', 'medium', 'direct', 'no', NOW()),
  
  -- Regional Hubs (non_central, but yes for regional hub access)
  ('JURONG EAST', 'non_central', 'high', 'direct', 'yes', NOW()),
  ('TAMPINES', 'non_central', 'high', 'direct', 'yes', NOW()),
  ('WOODLANDS', 'non_central', 'high', 'direct', 'yes', NOW()),
  ('PUNGGOL', 'non_central', 'high', '1_transfer', 'yes', NOW()),
  
  -- Towns adjacent to regional hubs (partial access)
  ('JURONG WEST', 'non_central', 'medium', '1_transfer', 'partial', NOW()),
  ('SENGKANG', 'non_central', 'high', '1_transfer', 'partial', NOW()),
  ('SERANGOON', 'non_central', 'high', 'direct', 'partial', NOW()),
  
  -- Established towns with good MRT access (non_central)
  ('ANG MO KIO', 'non_central', 'high', 'direct', 'no', NOW()),
  ('BEDOK', 'non_central', 'high', 'direct', 'no', NOW()),
  ('CLEMENTI', 'non_central', 'high', 'direct', 'no', NOW()),
  ('HOUGANG', 'non_central', 'high', '1_transfer', 'no', NOW()),
  ('PASIR RIS', 'non_central', 'medium', '1_transfer', 'no', NOW()),
  
  -- Towns with moderate MRT access
  ('BUKIT BATOK', 'non_central', 'medium', '1_transfer', 'partial', NOW()),
  ('BUKIT PANJANG', 'non_central', 'medium', '1_transfer', 'no', NOW()),
  ('CHOA CHU KANG', 'non_central', 'high', '1_transfer', 'no', NOW()),
  ('YISHUN', 'non_central', 'high', 'direct', 'no', NOW()),
  
  -- Towns with lower MRT density
  ('SEMBAWANG', 'non_central', 'low', '2_plus', 'no', NOW())
ON CONFLICT (town) 
DO UPDATE SET
  centrality = EXCLUDED.centrality,
  mrt_density = EXCLUDED.mrt_density,
  transfer_complexity = EXCLUDED.transfer_complexity,
  regional_hub_access = EXCLUDED.regional_hub_access,
  updated_at = NOW();

