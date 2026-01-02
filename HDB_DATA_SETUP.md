# HDB Resale Price Data Setup Guide

## Overview

This guide explains how to set up the HDB resale price data for the dashboard. The system uses two tables:
- `raw_resale_2017`: Raw transaction data from data.gov.sg
- `agg_monthly`: Pre-aggregated monthly statistics for fast queries

## Data Source

**Primary Dataset**: "Resale flat prices based on registration date from Jan-2017 onwards"
- URL: https://data.gov.sg/datasets/datastore_search?resource_id=f1765b54-a209-4718-8d38-a39237f502b3
- Coverage: January 2017 - December 2025
- Updates: Regularly updated (last update: 2025-12-29)

## Step 1: Run Database Schema

1. Go to your Supabase project SQL Editor
2. Run the updated `supabase/schema.sql` file
3. This creates:
   - `raw_resale_2017` table
   - `agg_monthly` table
   - Helper functions (`parse_lease_years`, `get_middle_storey`)
   - Indexes for performance
   - RLS policies

## Step 2: Import Raw Data

### Option A: Using data.gov.sg API (Recommended)

Create a script to fetch data from data.gov.sg API:

```javascript
// Example using Node.js
const fetch = require('node-fetch');

async function fetchHDBData(limit = 100, offset = 0) {
  const url = `https://data.gov.sg/api/action/datastore_search?resource_id=f1765b54-a209-4718-8d38-a39237f502b3&limit=${limit}&offset=${offset}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.result.records;
}
```

### Option B: Manual CSV Import

1. Download CSV from data.gov.sg
2. Use Supabase Table Editor → Import data
3. Map columns:
   - `month` → month
   - `town` → town
   - `flat_type` → flat_type
   - `block` → block
   - `street_name` → street_name
   - `storey_range` → storey_range
   - `floor_area_sqm` → floor_area_sqm
   - `flat_model` → flat_model
   - `lease_commence_date` → lease_commence_date
   - `remaining_lease` → remaining_lease
   - `resale_price` → resale_price

## Step 3: Generate Aggregated Data

After importing raw data, run this SQL to populate `agg_monthly`:

```sql
-- Insert aggregated monthly data
INSERT INTO agg_monthly (month, town, flat_type, tx_count, median_price, p25_price, p75_price, median_psm, median_lease_years, avg_floor_area)
SELECT 
  DATE_TRUNC('month', month)::DATE as month,
  town,
  flat_type,
  COUNT(*) as tx_count,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY resale_price) as median_price,
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY resale_price) as p25_price,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY resale_price) as p75_price,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY resale_price / NULLIF(floor_area_sqm, 0)) as median_psm,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY parse_lease_years(remaining_lease)) as median_lease_years,
  AVG(floor_area_sqm) as avg_floor_area
FROM raw_resale_2017
WHERE resale_price IS NOT NULL
  AND floor_area_sqm IS NOT NULL
  AND remaining_lease IS NOT NULL
GROUP BY DATE_TRUNC('month', month)::DATE, town, flat_type
ON CONFLICT (month, town, flat_type) DO UPDATE SET
  tx_count = EXCLUDED.tx_count,
  median_price = EXCLUDED.median_price,
  p25_price = EXCLUDED.p25_price,
  p75_price = EXCLUDED.p75_price,
  median_psm = EXCLUDED.median_psm,
  median_lease_years = EXCLUDED.median_lease_years,
  avg_floor_area = EXCLUDED.avg_floor_area;
```

## Step 4: Set Up Automated Updates (Optional)

Create a cron job or scheduled function to:
1. Fetch new data from data.gov.sg API
2. Insert into `raw_resale_2017` (with deduplication)
3. Re-run aggregation SQL
4. Update `agg_monthly` table

### Example: Supabase Edge Function

```typescript
// supabase/functions/update-hdb-data/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Fetch from data.gov.sg
  // Insert into raw_resale_2017
  // Run aggregation
  // Return success
})
```

## Data Fields Reference

### raw_resale_2017
- `month`: Transaction month (DATE)
- `town`: Town name (VARCHAR)
- `flat_type`: 3 ROOM, 4 ROOM, 5 ROOM, EXECUTIVE (VARCHAR)
- `block`: Block number (VARCHAR)
- `street_name`: Street name (VARCHAR)
- `storey_range`: e.g., "10 TO 12" (VARCHAR)
- `floor_area_sqm`: Floor area in square meters (NUMERIC)
- `flat_model`: Flat model type (VARCHAR)
- `lease_commence_date`: Year lease started (INTEGER)
- `remaining_lease`: e.g., "84 years 3 months" (VARCHAR)
- `resale_price`: Resale price in SGD (NUMERIC)

### agg_monthly
- `month`: Month (DATE)
- `town`: Town name (VARCHAR, nullable for "All")
- `flat_type`: Flat type (VARCHAR)
- `tx_count`: Transaction count (INTEGER)
- `median_price`: Median resale price (NUMERIC)
- `p25_price`: 25th percentile price (NUMERIC)
- `p75_price`: 75th percentile price (NUMERIC)
- `median_psm`: Median price per sqm (NUMERIC)
- `median_lease_years`: Median remaining lease in years (NUMERIC)
- `avg_floor_area`: Average floor area (NUMERIC)

## Notes

- The aggregation uses **percentiles** (P25, P50/P75) instead of mean to handle skewed price distributions
- `parse_lease_years()` function converts text like "84 years 3 months" to numeric years
- Data is deduplicated using UNIQUE constraint on (month, town, block, street_name, flat_type, resale_price)
- RLS policies allow public read access for all tables

## Troubleshooting

1. **No data showing**: Check if tables are populated and RLS policies are enabled
2. **Slow queries**: Ensure indexes are created (check schema.sql)
3. **Lease parsing errors**: Verify `parse_lease_years()` function exists
4. **Aggregation missing**: Run the aggregation SQL manually


