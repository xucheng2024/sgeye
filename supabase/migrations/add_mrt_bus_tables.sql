-- MRT Stations and Bus Stops Reference Tables
-- These are public infrastructure data that don't change frequently

-- 1. MRT Stations table
CREATE TABLE IF NOT EXISTS mrt_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_name TEXT NOT NULL UNIQUE,
  station_code TEXT, -- e.g., "NS1", "EW1", etc.
  line_code TEXT, -- e.g., "NS", "EW", "NE", "CC", "DT", "TE", "CE"
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mrt_stations_location ON mrt_stations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_mrt_stations_name ON mrt_stations(station_name);
CREATE INDEX IF NOT EXISTS idx_mrt_stations_line ON mrt_stations(line_code);

-- 2. Bus Stops table
CREATE TABLE IF NOT EXISTS bus_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_stop_code TEXT NOT NULL UNIQUE, -- 5-digit bus stop code
  bus_stop_name TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  road_name TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bus_stops_location ON bus_stops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_bus_stops_code ON bus_stops(bus_stop_code);
CREATE INDEX IF NOT EXISTS idx_bus_stops_name ON bus_stops(bus_stop_name);

-- Enable RLS
ALTER TABLE mrt_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_stops ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read access
CREATE POLICY "Allow public read access" ON mrt_stations FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON bus_stops FOR SELECT USING (true);

