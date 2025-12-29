-- Singapore Data Tables Schema

-- Population Data
CREATE TABLE IF NOT EXISTS population_data (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  total NUMERIC,
  citizens NUMERIC,
  permanent NUMERIC,
  non_resident NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Housing Data
CREATE TABLE IF NOT EXISTS housing_data (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  hdb_percentage NUMERIC,
  private_percentage NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employment Data
CREATE TABLE IF NOT EXISTS employment_data (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  unemployment_rate NUMERIC,
  employment_rate NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Income Data
CREATE TABLE IF NOT EXISTS income_data (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  median_income NUMERIC,
  mean_income NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Healthcare Data
CREATE TABLE IF NOT EXISTS healthcare_data (
  id SERIAL PRIMARY KEY,
  facility_type VARCHAR(100) NOT NULL,
  percentage NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Education Data
CREATE TABLE IF NOT EXISTS education_data (
  id SERIAL PRIMARY KEY,
  level VARCHAR(100) NOT NULL,
  enrollment_rate NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data (matching current static data)
INSERT INTO population_data (year, total, citizens, permanent, non_resident) VALUES
  (2018, 5638, 3503, 527, 1608),
  (2019, 5704, 3525, 532, 1647),
  (2020, 5686, 3520, 505, 1661),
  (2021, 5454, 3500, 490, 1464),
  (2022, 5637, 3550, 518, 1569),
  (2023, 5917, 3610, 538, 1769)
ON CONFLICT DO NOTHING;

INSERT INTO housing_data (year, hdb_percentage, private_percentage) VALUES
  (2018, 82.5, 17.5),
  (2019, 82.3, 17.7),
  (2020, 82.1, 17.9),
  (2021, 81.9, 18.1),
  (2022, 81.7, 18.3),
  (2023, 81.5, 18.5)
ON CONFLICT DO NOTHING;

INSERT INTO employment_data (year, unemployment_rate, employment_rate) VALUES
  (2018, 2.1, 97.9),
  (2019, 2.3, 97.7),
  (2020, 3.0, 97.0),
  (2021, 2.7, 97.3),
  (2022, 2.1, 97.9),
  (2023, 1.9, 98.1)
ON CONFLICT DO NOTHING;

INSERT INTO income_data (year, median_income, mean_income) VALUES
  (2018, 4434, 5850),
  (2019, 4563, 6020),
  (2020, 4534, 5950),
  (2021, 4680, 6150),
  (2022, 5070, 6650),
  (2023, 5197, 6820)
ON CONFLICT DO NOTHING;

INSERT INTO healthcare_data (facility_type, percentage) VALUES
  ('Public Hospitals', 65),
  ('Private Hospitals', 20),
  ('Community Hospitals', 10),
  ('Specialty Centers', 5)
ON CONFLICT DO NOTHING;

INSERT INTO education_data (level, enrollment_rate) VALUES
  ('Primary', 95.2),
  ('Secondary', 97.8),
  ('Post-Secondary', 92.5),
  ('University', 45.3)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS) - allow public read access
ALTER TABLE population_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_data ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read access" ON population_data FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON housing_data FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON employment_data FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON income_data FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON healthcare_data FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON education_data FOR SELECT USING (true);

