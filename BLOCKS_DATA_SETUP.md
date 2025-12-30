# Blocks Data Setup Guide

## Overview

Blocks data is derived from `raw_resale_2017` table. The system:
1. Extracts unique blocks from transaction data
2. Calculates block-level metrics (price, lease, etc.)
3. Updates automatically via GitHub Actions

## Initial Setup

### 1. Run Migration

First, create the tables:

```sql
-- Run in Supabase SQL Editor
-- File: supabase/migrations/add_blocks_tables.sql
```

### 2. Populate Initial Data

**Option A: Manual Run (Recommended for first time)**

```bash
# Set environment variables
export SUPABASE_URL="your_supabase_url"
export SUPABASE_SERVICE_KEY="your_service_role_key"

# Run the script
node scripts/populate-blocks-data.js
```

**Option B: Via GitHub Actions**

1. Ensure GitHub Secrets are set:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`

2. Go to GitHub → Actions → "Update Blocks Data" → Run workflow

## Automatic Updates

### GitHub Actions Workflow

The workflow runs **weekly on Mondays at 2 AM UTC** (10 AM Singapore time).

**Workflow file**: `.github/workflows/update-blocks-data.yml`

**What it does**:
1. Extracts unique blocks from `raw_resale_2017`
2. Calculates metrics for each block:
   - Median price per sqm
   - Median resale price
   - Median remaining lease
   - Lease percentile within town
   - Transaction counts
3. Updates `blocks` and `block_metrics` tables

### Manual Trigger

To trigger manually:
1. GitHub → Actions
2. Select "Update Blocks Data"
3. Click "Run workflow"
4. Select branch (usually `main`)
5. Click "Run workflow"

## Data Flow

```
raw_resale_2017 (transaction data)
    ↓
populate-blocks-data.js
    ↓
blocks (unique block addresses)
    ↓
block_metrics (aggregated metrics by flat_type, window_years)
```

## Metrics Calculation

### Block Metrics Include:

- **Price Metrics**:
  - `median_price_psm`: Median price per square meter
  - `median_resale_price`: Median resale price
  - `qoq_change_psm`: Quarter-over-quarter change (TODO)
  - `rolling_6m_change_psm`: 6-month rolling change (TODO)

- **Lease Metrics**:
  - `median_remaining_lease_years`: Median remaining lease
  - `lease_percentile_in_town`: Percentile within town (0-100)

- **Access Metrics** (requires geocoding):
  - `mrt_band`: '<400', '400-800', or '>800' meters
  - `nearest_mrt_name`: Name of nearest MRT station
  - `nearest_mrt_dist_m`: Distance in meters
  - `bus_stops_400m`: Number of bus stops within 400m
  - `primary_within_1km`: Number of primary schools within 1km

## Current Limitations

1. **Geocoding**: MRT and bus stop data require geocoding block addresses. Currently set to `null` or `0`.
2. **Change Metrics**: QoQ and rolling 6m changes require historical snapshots. Currently `null`.
3. **School Data**: Requires integration with school location data. Currently `0`.

## Future Improvements

1. **Geocoding Integration**: Use OneMap API or similar to geocode block addresses
2. **MRT/Bus Data**: Calculate distances to nearest MRT and bus stops
3. **School Data**: Integrate with school location data
4. **Historical Snapshots**: Store periodic snapshots to calculate changes
5. **Incremental Updates**: Only recalculate metrics for blocks with new transactions

## Monitoring

### Check Data Quality

```sql
-- Count blocks
SELECT COUNT(*) FROM blocks;

-- Count metrics
SELECT COUNT(*) FROM block_metrics;

-- Check latest update
SELECT MAX(updated_at) FROM block_metrics;

-- Sample block with metrics
SELECT 
  b.address,
  b.town,
  bm.flat_type,
  bm.window_years,
  bm.tx_count,
  bm.median_price_psm,
  bm.median_remaining_lease_years
FROM blocks b
JOIN block_metrics bm ON b.id = bm.block_id
WHERE bm.flat_type = '4 ROOM'
  AND bm.window_years = 10
LIMIT 10;
```

## Troubleshooting

**Q: No blocks found**
- A: Ensure `raw_resale_2017` table has data with `block` and `street_name` fields populated

**Q: Metrics are null**
- A: Check if there are transactions for that block/flat_type/window combination

**Q: Script runs slowly**
- A: This is normal for initial population. Consider running in batches or optimizing queries.

**Q: GitHub Actions fails**
- A: Check that `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` secrets are set correctly

