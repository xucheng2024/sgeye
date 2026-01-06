-- Mark non-residential neighbourhoods to exclude from explore/compare pages
-- These are industrial areas, business parks, airports, terminals, and other non-residential zones

UPDATE neighbourhoods 
SET non_residential = TRUE,
    updated_at = NOW()
WHERE name IN (
  'CHIN BEE',
  'BENOI SECTOR',
  'DEFU INDUSTRIAL PARK',
  'CITY TERMINALS',
  'MARITIME SQUARE',
  'CLEANTECH',
  'GALI BATU',
  'LAKESIDE (BUSINESS)',
  'CHANGI AIRPORT',
  'CHANGI BAY',
  'CENTRAL WATER CATCHMENT',
  'NORTH-EASTERN ISLANDS',
  'SEMAKAU',
  'CENTRAL SUBZONE',
  'BAYFRONT SUBZONE',
  'CLIFFORD PIER',
  'CHINA SQUARE',
  'CECIL'
);

-- Verify the update
SELECT name, non_residential, updated_at 
FROM neighbourhoods 
WHERE non_residential = TRUE
ORDER BY name;

