# Geocode Raw Resale Transactions

This script geocodes HDB resale transactions that are missing coordinates using OneMap API.

## Prerequisites

1. **Supabase credentials** in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
   
   ⚠️ **Important**: Use `SUPABASE_SERVICE_ROLE_KEY` (not anon key) for write access.

2. **Node.js 18+** (for built-in `fetch`)

## Usage

```bash
node scripts/geocode-raw-resale.js
```

## What it does

1. Finds all records in `raw_resale_2017` missing `latitude` or `longitude`
2. Builds address from `block + street_name + "Singapore"`
3. Calls OneMap API to geocode the address
4. Updates the database with coordinates

## Rate Limiting

- OneMap API allows **250 requests per minute**
- Script waits 300ms between requests (safe limit)
- For large datasets, this will take time (e.g., 10,000 records ≈ 50 minutes)

## Progress Tracking

The script shows:
- Current batch being processed
- Success/failure for each record
- Final statistics (geocoded, failed, skipped)

## Example Output

```
Starting geocoding for raw_resale_2017...

Found 15234 records missing coordinates

Processing batch: 1 to 100 of 15234
  [1/100] Geocoding: Block 123 Ang Mo Kio Avenue 3 Singapore... ✓ 1.3691, 103.8456
  [2/100] Geocoding: Block 456 Bedok North Street 1 Singapore... ✓ 1.3281, 103.9361
  ...

Progress: 100/15234 | Geocoded: 95 | Failed: 3 | Skipped: 2
```

## Troubleshooting

### "Missing Supabase credentials"
- Check `.env.local` file exists
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

### Many "Not found" errors
- OneMap API may not have all HDB blocks
- Try alternative geocoding sources (data.gov.sg block coordinates)
- Some addresses may need manual correction

### Script stops unexpectedly
- Check network connection
- OneMap API may be temporarily unavailable
- Script can be re-run (skips already geocoded records)

## Next Steps

After geocoding:
1. Run `populate_neighbourhood_ids()` to assign neighbourhoods
2. Run `aggregate_neighbourhood_monthly_data()` to generate aggregations

