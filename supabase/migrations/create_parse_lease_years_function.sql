-- Create parse_lease_years function to convert remaining_lease string to numeric years
-- Handles formats like "95 years 06 months", "65 years", "12 months"

CREATE OR REPLACE FUNCTION parse_lease_years(lease_text TEXT)
RETURNS NUMERIC AS $$
BEGIN
  IF lease_text IS NULL OR lease_text = '' THEN
    RETURN NULL;
  END IF;
  
  -- Handle "X years Y months" format (e.g., "95 years 06 months")
  IF lease_text ~ '^[0-9]+ years? [0-9]+ months?$' THEN
    RETURN CAST(SPLIT_PART(lease_text, ' years', 1) AS NUMERIC) + 
           CAST(SPLIT_PART(SPLIT_PART(lease_text, ' years ', 2), ' months', 1) AS NUMERIC) / 12.0;
  END IF;
  
  -- Handle "X years" format (e.g., "65 years")
  IF lease_text ~ '^[0-9]+ years?$' THEN
    RETURN CAST(SPLIT_PART(lease_text, ' years', 1) AS NUMERIC);
  END IF;
  
  -- Handle "X months" format (e.g., "12 months")
  IF lease_text ~ '^[0-9]+ months?$' THEN
    RETURN CAST(SPLIT_PART(lease_text, ' months', 1) AS NUMERIC) / 12.0;
  END IF;
  
  -- If format doesn't match, return NULL
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

