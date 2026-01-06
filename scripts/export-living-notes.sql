-- Export living notes from database to JSON format
-- Run this and save output to a JSON file for linting

SELECT json_agg(
  json_build_object(
    'neighbourhood_name', neighbourhood_name,
    'noise_density_rating', noise_density_rating,
    'noise_density_note', noise_density_note,
    'daily_convenience_rating', daily_convenience_rating,
    'daily_convenience_note', daily_convenience_note,
    'green_outdoor_rating', green_outdoor_rating,
    'green_outdoor_note', green_outdoor_note,
    'crowd_vibe_rating', crowd_vibe_rating,
    'crowd_vibe_note', crowd_vibe_note,
    'long_term_comfort_rating', long_term_comfort_rating,
    'long_term_comfort_note', long_term_comfort_note,
    'zone_type', zone_type,
    'rating_mode', rating_mode,
    'drivers', drivers,
    'variance_level', variance_level,
    'short_note', short_note,
    'display_name', display_name,
    'review_status', review_status,
    'review_reason', review_reason,
    'created_at', created_at,
    'updated_at', updated_at
  )
  ORDER BY neighbourhood_name
)
FROM neighbourhood_living_notes;

