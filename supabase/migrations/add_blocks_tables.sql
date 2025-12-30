-- Blocks Explorer Tables
-- This migration creates tables for block-level analysis and watchlist functionality

-- 1. blocks (维表) - Block dimension table
CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  town TEXT NOT NULL,
  block_no TEXT NOT NULL,
  street TEXT NOT NULL,
  address TEXT NOT NULL,
  lat NUMERIC(10, 7),
  lon NUMERIC(10, 7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(town, block_no, street)
);

CREATE INDEX IF NOT EXISTS idx_blocks_town ON blocks(town);
CREATE INDEX IF NOT EXISTS idx_blocks_location ON blocks(lat, lon);

-- 2. block_metrics (聚合) - Block metrics aggregated by flat type and time window
CREATE TABLE IF NOT EXISTS block_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
  town TEXT NOT NULL,
  flat_type TEXT NOT NULL, -- '3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE'
  window_years INTEGER NOT NULL, -- 5 or 10
  tx_count INTEGER DEFAULT 0,
  median_price_psm NUMERIC(10, 2),
  median_resale_price NUMERIC(12, 2),
  qoq_change_psm NUMERIC(6, 2), -- Quarter-over-quarter change in psm
  rolling_6m_change_psm NUMERIC(6, 2), -- Rolling 6-month change in psm
  median_remaining_lease_years NUMERIC(5, 2),
  lease_percentile_in_town NUMERIC(5, 2), -- Percentile within town (0-100)
  mrt_band TEXT, -- '<400', '400-800', '>800'
  nearest_mrt_name TEXT,
  nearest_mrt_dist_m INTEGER,
  bus_stops_400m INTEGER DEFAULT 0,
  primary_within_1km INTEGER DEFAULT 0,
  period_start DATE NOT NULL, -- Start of the aggregation period
  period_end DATE NOT NULL, -- End of the aggregation period
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(block_id, flat_type, window_years, period_end)
);

CREATE INDEX IF NOT EXISTS idx_block_metrics_town ON block_metrics(town);
CREATE INDEX IF NOT EXISTS idx_block_metrics_flat_type ON block_metrics(flat_type);
CREATE INDEX IF NOT EXISTS idx_block_metrics_window ON block_metrics(window_years);
CREATE INDEX IF NOT EXISTS idx_block_metrics_period ON block_metrics(period_end DESC);

-- 3. watch_subscriptions (订阅) - User watchlist subscriptions
CREATE TABLE IF NOT EXISTS watch_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL, -- For now, use email; can migrate to user_id later
  scope_type TEXT NOT NULL CHECK (scope_type IN ('town', 'block')),
  scope_value TEXT NOT NULL, -- Town name or block_id
  flat_type TEXT,
  alert_mode TEXT NOT NULL DEFAULT 'weekly' CHECK (alert_mode IN ('weekly', 'instant')),
  threshold_pct NUMERIC(5, 2) DEFAULT 3.00, -- Default: 3% for town, 5% for block
  min_tx_count INTEGER DEFAULT 15, -- Default: 15 for town, 6 for block
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_email, scope_type, scope_value, flat_type)
);

CREATE INDEX IF NOT EXISTS idx_watch_subscriptions_user ON watch_subscriptions(user_email);
CREATE INDEX IF NOT EXISTS idx_watch_subscriptions_scope ON watch_subscriptions(scope_type, scope_value);
CREATE INDEX IF NOT EXISTS idx_watch_subscriptions_active ON watch_subscriptions(is_active) WHERE is_active = true;

-- 4. alert_events (事件记录) - Alert event log to prevent duplicate notifications
CREATE TABLE IF NOT EXISTS alert_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES watch_subscriptions(id) ON DELETE CASCADE,
  period_key TEXT NOT NULL, -- e.g., '2025Q4', '2025-W52'
  change_pct NUMERIC(6, 2),
  metric_snapshot JSONB, -- Store snapshot of metrics at alert time
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subscription_id, period_key)
);

CREATE INDEX IF NOT EXISTS idx_alert_events_subscription ON alert_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_alert_events_period ON alert_events(period_key);

-- Enable RLS
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read access
CREATE POLICY "Allow public read access" ON blocks FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON block_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON watch_subscriptions FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON alert_events FOR SELECT USING (true);

-- RLS Policies: Allow authenticated users to manage their own subscriptions
CREATE POLICY "Users can manage own subscriptions" ON watch_subscriptions 
  FOR ALL USING (auth.role() = 'authenticated' OR user_email = current_setting('request.jwt.claims', true)::json->>'email');

