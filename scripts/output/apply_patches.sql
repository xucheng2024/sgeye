-- Auto-generated SQL from lint suggested patches
-- Review these changes before applying!

BEGIN;

-- CLARKE QUAY: Fix short_note to match ratings
UPDATE neighbourhood_living_notes
SET
  short_note = 'Limited long-term comfort despite some conveniences.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CLARKE QUAY';

-- ANSON: Add missing drivers based on note keywords
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['cbd_edge', 'downtown', 'construction_cycles', 'commute_first', 'nightlife_nearby'],
  updated_at = NOW()
WHERE neighbourhood_name = 'ANSON';

-- FERNVALE: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'FERNVALE';

-- CHENG SAN: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics', 'arterial_roads'],
  short_note = 'Convenience-first heartland: great daily convenience.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CHENG SAN';

-- CLEMENTI NORTH: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics', 'arterial_roads'],
  short_note = 'Residential area with mixed characteristics.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CLEMENTI NORTH';

-- CORONATION ROAD: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics', 'arterial_roads'],
  short_note = 'Residential area with mixed characteristics.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CORONATION ROAD';

-- JOO SENG: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'JOO SENG';

-- TOA PAYOH: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'TOA PAYOH';

-- MEI CHIN: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'MEI CHIN';

-- CHATSWORTH: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Residential area with mixed characteristics.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CHATSWORTH';

-- BISHAN EAST: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics', 'arterial_roads'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BISHAN EAST';

-- AIRPORT ROAD: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics', 'arterial_roads'],
  short_note = 'Convenience-first heartland: great daily convenience.',
  updated_at = NOW()
WHERE neighbourhood_name = 'AIRPORT ROAD';

-- ADMIRALTY: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics', 'arterial_roads'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'ADMIRALTY';

-- BUKIT BATOK SOUTH: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Residential area with mixed characteristics.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BUKIT BATOK SOUTH';

-- CHANGI WEST: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics', 'arterial_roads'],
  short_note = 'Residential area with mixed characteristics.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CHANGI WEST';

-- BEDOK NORTH: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics', 'arterial_roads'],
  short_note = 'Convenience-first heartland: great daily convenience.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BEDOK NORTH';

-- BUKIT BATOK CENTRAL: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Convenience-first heartland: great daily convenience.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BUKIT BATOK CENTRAL';

-- BRADDELL: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Convenience-first heartland: great daily convenience.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BRADDELL';

-- BRICKLAND: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Residential area with mixed characteristics.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BRICKLAND';

-- ALEXANDRA NORTH: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Convenience-first heartland: great daily convenience.',
  updated_at = NOW()
WHERE neighbourhood_name = 'ALEXANDRA NORTH';

-- CHONG BOON: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics', 'arterial_roads'],
  short_note = 'Convenience-first heartland: great daily convenience.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CHONG BOON';

-- COMMONWEALTH: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics', 'arterial_roads'],
  short_note = 'Convenience-first heartland: great daily convenience.',
  updated_at = NOW()
WHERE neighbourhood_name = 'COMMONWEALTH';

-- BOON TECK: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Convenience-first heartland: great daily convenience.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BOON TECK';

-- ANCHORVALE: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'ANCHORVALE';

-- FABER: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Residential area with mixed characteristics.',
  updated_at = NOW()
WHERE neighbourhood_name = 'FABER';

-- FARRER COURT: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics', 'arterial_roads'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'FARRER COURT';

-- GEYLANG EAST: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Convenience-first heartland: great daily convenience.',
  updated_at = NOW()
WHERE neighbourhood_name = 'GEYLANG EAST';

-- BAHAR: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Residential area with mixed characteristics.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BAHAR';

-- BANGKIT: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BANGKIT';

-- HILLCREST: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Residential area with mixed characteristics.',
  updated_at = NOW()
WHERE neighbourhood_name = 'HILLCREST';

-- GOMBAK: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Residential area with mixed characteristics.',
  updated_at = NOW()
WHERE neighbourhood_name = 'GOMBAK';

-- DUNEARN: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics', 'arterial_roads'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'DUNEARN';

-- HENDERSON HILL: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'HENDERSON HILL';

-- CHOA CHU KANG: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CHOA CHU KANG';

-- FOREST HILL: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Residential area with mixed characteristics.',
  updated_at = NOW()
WHERE neighbourhood_name = 'FOREST HILL';

-- KEAT HONG: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'KEAT HONG';

-- ANAK BUKIT: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'ANAK BUKIT';

-- BENDEMEER: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Convenience-first heartland: great daily convenience.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BENDEMEER';

-- BUKIT HO SWEE: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Convenience-first heartland: great daily convenience.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BUKIT HO SWEE';

-- BRICKWORKS: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Residential area with mixed characteristics.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BRICKWORKS';

-- ALEXANDRA HILL: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'ALEXANDRA HILL';

-- BEDOK RESERVOIR: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Residential area with mixed characteristics.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BEDOK RESERVOIR';

-- BIDADARI: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BIDADARI';

-- BOON LAY PLACE: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Convenience-first heartland: great daily convenience.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BOON LAY PLACE';

-- CHANGI POINT: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Residential area with mixed characteristics.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CHANGI POINT';

-- MARINE PARADE: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'MARINE PARADE';

-- KAKI BUKIT: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'KAKI BUKIT';

-- HONG KAH NORTH: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'HONG KAH NORTH';

-- CHOA CHU KANG CENTRAL: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CHOA CHU KANG CENTRAL';

-- MOUNTBATTEN: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'MOUNTBATTEN';

-- LIU FANG: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Convenience-first heartland: great daily convenience.',
  updated_at = NOW()
WHERE neighbourhood_name = 'LIU FANG';

-- SAUJANA: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'SAUJANA';

-- QUEENSWAY: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'QUEENSWAY';

-- TAGORE: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'TAGORE';

-- HILLVIEW: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Residential area with mixed characteristics.',
  updated_at = NOW()
WHERE neighbourhood_name = 'HILLVIEW';

-- FLORA DRIVE: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics', 'arterial_roads'],
  short_note = 'Residential area with mixed characteristics.',
  updated_at = NOW()
WHERE neighbourhood_name = 'FLORA DRIVE';

-- GHIM MOH: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'GHIM MOH';

-- CLEANTECH: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Residential area with mixed characteristics.',
  updated_at = NOW()
WHERE neighbourhood_name = 'CLEANTECH';

-- GALI BATU: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics', 'heavy_vehicles'],
  short_note = 'Residential area with mixed characteristics.',
  updated_at = NOW()
WHERE neighbourhood_name = 'GALI BATU';

-- JURONG EAST: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Convenience-first heartland: great daily convenience.',
  updated_at = NOW()
WHERE neighbourhood_name = 'JURONG EAST';

-- KIAN TECK: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'KIAN TECK';

-- KANGKAR: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Convenience-first heartland: great daily convenience.',
  updated_at = NOW()
WHERE neighbourhood_name = 'KANGKAR';

-- PASIR RIS: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'PASIR RIS';

-- LORONG HALUS NORTH: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'LORONG HALUS NORTH';

-- MARITIME SQUARE: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics', 'heavy_vehicles'],
  short_note = 'Residential area with mixed characteristics.',
  updated_at = NOW()
WHERE neighbourhood_name = 'MARITIME SQUARE';

-- MACPHERSON: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Convenience-first heartland: great daily convenience.',
  updated_at = NOW()
WHERE neighbourhood_name = 'MACPHERSON';

-- ONE TREE HILL: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics', 'arterial_roads'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'ONE TREE HILL';

-- SENNETT: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Family-friendly area: great daily convenience and strong outdoor access.',
  updated_at = NOW()
WHERE neighbourhood_name = 'SENNETT';

-- BAYSHORE: Add missing drivers based on note keywords; Replace generic template with specific description
UPDATE neighbourhood_living_notes
SET
  drivers = ARRAY['logistics'],
  short_note = 'Residential area with mixed characteristics.',
  updated_at = NOW()
WHERE neighbourhood_name = 'BAYSHORE';

COMMIT;

-- Review the changes above before committing!