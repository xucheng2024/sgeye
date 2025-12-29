# HDB Rental Data Setup Guide

## Overview

This guide explains how to set up and run the HDB rental data import.

## Prerequisites

1. **Supabase Project**: You need a Supabase project with the `hdb_rental_stats` table created
2. **Environment Variables**: Set in GitHub Secrets for automated runs

## Setup Steps

### 1. Create Database Table

The table schema is already defined in `supabase/schema.sql`. Run this SQL in your Supabase SQL editor:

```sql
-- HDB Rental Statistics (from data.gov.sg)
CREATE TABLE IF NOT EXISTS hdb_rental_stats (
  id SERIAL PRIMARY KEY,
  month DATE NOT NULL,
  town VARCHAR(100),
  flat_type VARCHAR(50),
  median_rent NUMERIC,
  number_of_rental_contracts INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, town, flat_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rental_month ON hdb_rental_stats(month);
CREATE INDEX IF NOT EXISTS idx_rental_town ON hdb_rental_stats(town);
CREATE INDEX IF NOT EXISTS idx_rental_flat_type ON hdb_rental_stats(flat_type);

-- Enable RLS
ALTER TABLE hdb_rental_stats ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow public read access" ON hdb_rental_stats FOR SELECT USING (true);
```

### 2. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key (not anon key!)

### 3. Run Import

#### Option A: Automatic (Recommended)

The GitHub Action runs automatically daily at 2 AM UTC (10 AM Singapore time).

You can also manually trigger it:
1. Go to GitHub repository → Actions tab
2. Select "Update HDB Rental Data" workflow (separate from resale data)
3. Click "Run workflow" → "Run workflow"

#### Option B: Manual Local Run

If you want to test locally:

```bash
# Set environment variables
export SUPABASE_URL="your_supabase_url"
export SUPABASE_SERVICE_KEY="your_service_role_key"

# Run the import script
node scripts/import-hdb-rental-data.js
```

**Note**: Local runs may be blocked by Cloudflare. The script works fine in GitHub Actions.

### 4. Verify Data Import

Check your Supabase database:

```sql
-- Check total records
SELECT COUNT(*) FROM hdb_rental_stats;

-- Check sample data
SELECT * FROM hdb_rental_stats 
ORDER BY month DESC 
LIMIT 10;

-- Check by town
SELECT town, COUNT(*) as count, 
       MIN(month) as earliest, 
       MAX(month) as latest
FROM hdb_rental_stats
GROUP BY town
ORDER BY count DESC;
```

## Data Source

- **Dataset**: "Renting Out of Flats from Jan 2021"
- **Dataset ID**: `d_c9f57187485a850908655db0e8cfe651`
- **URL**: https://data.gov.sg/datasets/d_c9f57187485a850908655db0e8cfe651/view
- **Agency**: HDB (Housing & Development Board)

## Troubleshooting

### Import Fails

1. **Check GitHub Actions logs**: Go to Actions tab → Latest run → Check logs
2. **Verify environment variables**: Make sure secrets are set correctly
3. **Check table exists**: Run the SQL from step 1
4. **Verify API access**: The script automatically gets resource_id from dataset

### No Data Showing in UI

1. **Check data exists**: Run verification queries above
2. **Check town/flat_type matching**: Make sure the selected town and flat type exist in rental data
3. **Check date range**: Rental data starts from Jan 2021

### Field Mapping Issues

If the API returns different field names, update `transformRentalRecord` function in `scripts/import-hdb-rental-data.js`:

```javascript
// Current supported fields:
// month, town, flat_type, median_rent, number_of_rental_contracts
// Add more variations as needed
```

## Next Steps

Once data is imported:
1. Visit `/hdb/affordability` page
2. Calculate affordability
3. Scroll to "Rent vs Buy Comparison" section
4. Select town and flat type to see comparison

