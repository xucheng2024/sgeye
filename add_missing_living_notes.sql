-- Add missing living notes for neighbourhoods: Kovan, Little India, Marymount, Potong Pasir, Rivervale, Robertson Quay, Upper Thomson

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
) VALUES
  (
    'KOVAN',
    'mixed',
    'Mature northeast area; generally calm in residential blocks, busier near Kovan MRT and Heartland Mall.',
    'good',
    'Strong mature-estate convenience: Heartland Mall, markets, food options, and good MRT connectivity.',
    'mixed',
    'Some green pockets; larger parks require a short trip.',
    'good',
    'Family-oriented heartland rhythm; steady daily life.',
    'good',
    'Comfortable long-term if you like northeast heartland living with good connectivity.'
  ),
  (
    'LITTLE INDIA',
    'bad',
    'Cultural district with high foot traffic, festivals, and street activity; noise levels are consistently higher.',
    'good',
    'Excellent convenience: markets, food options, cultural amenities, and strong MRT connectivity.',
    'bad',
    'More hardscape; limited green space in the immediate area.',
    'bad',
    'Very busy, vibrant cultural hub with high tourist and local foot traffic.',
    'mixed',
    'Works well if you enjoy vibrant cultural atmosphere; less ideal if you prioritize quiet residential living.'
  ),
  (
    'MARYMOUNT',
    'mixed',
    'Mature central area; generally calm in residential blocks, busier near main roads and Marymount MRT.',
    'good',
    'Strong mature-estate convenience: markets, food options, and good MRT connectivity.',
    'good',
    'Good access to Bishan-Ang Mo Kio Park and central-side park connectors.',
    'good',
    'Family-oriented heartland rhythm; stable daily life.',
    'good',
    'Comfortable long-term if you like central heartland living with park access.'
  ),
  (
    'POTONG PASIR',
    'mixed',
    'Mature northeast area; generally calm in residential blocks, busier near Potong Pasir MRT.',
    'good',
    'Strong mature-estate convenience: markets, food options, and good MRT connectivity.',
    'mixed',
    'Some green pockets; larger parks require a short trip.',
    'good',
    'Family-oriented heartland rhythm; steady daily life.',
    'good',
    'Comfortable long-term if you like northeast heartland living with good connectivity.'
  ),
  (
    'RIVERVALE',
    'mixed',
    'Mature northeast area; generally calm in residential blocks, busier near main roads.',
    'good',
    'Strong mature-estate convenience: markets, food options, and good access to Punggol amenities.',
    'good',
    'Good access to Punggol Waterway Park and northeast-side greenery for walks.',
    'good',
    'Family-oriented heartland rhythm; steady daily life.',
    'good',
    'Comfortable long-term if you like northeast heartland living with waterway access.'
  ),
  (
    'ROBERTSON QUAY',
    'bad',
    'Riverside dining and nightlife area; late-night noise and weekend crowds are common.',
    'good',
    'High convenience for transit, dining, and city amenities.',
    'mixed',
    'Riverside promenade access; larger parks require a short trip.',
    'bad',
    'Dining/nightlife crowd; high activity especially on weekends.',
    'mixed',
    'Works well if you enjoy riverside lifestyle; less ideal for quiet residential living.'
  ),
  (
    'UPPER THOMSON',
    'good',
    'Residential area with good buffer from heavy traffic; generally quieter than central town centres.',
    'mixed',
    'Amenities are accessible, though less concentrated than town centres.',
    'good',
    'Excellent access to Upper Seletar Reservoir Park, MacRitchie Reservoir, and nature reserves.',
    'good',
    'Primarily residential with limited destination-driven activity.',
    'good',
    'A strong long-term choice if you value nature access and quieter living with central proximity.'
  )
ON CONFLICT (neighbourhood_name) 
DO UPDATE SET
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

