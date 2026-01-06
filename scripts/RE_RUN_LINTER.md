# Re-run Linter with Latest Data

## ⚠️ Current Issue

The linter is still showing 298 issues because the input JSON file (`supabase/neighbourhoods-input.json`) contains **old data with template pollution**.

The SQL fixes have been applied to the database, but the input file hasn't been updated.

## ✅ Solution: Export Latest Data from Database

### Option 1: Export via SQL (Recommended)

```bash
# Export to JSON
psql -d your_database -t -f scripts/export-living-notes.sql > scripts/output/neighbourhoods-latest.json

# Clean up the output (remove extra whitespace)
cat scripts/output/neighbourhoods-latest.json | jq '.' > scripts/output/neighbourhoods-latest-clean.json

# Run linter on latest data
npx tsx scripts/lint-living-notes.ts scripts/output/neighbourhoods-latest-clean.json ./scripts/output
```

### Option 2: Use TypeScript Export Script

```bash
# Set environment variables first
export NEXT_PUBLIC_SUPABASE_URL=your_url
export SUPABASE_SERVICE_ROLE_KEY=your_key

# Export
npx tsx scripts/export-from-db.ts scripts/output/neighbourhoods-from-db.json

# Run linter
npx tsx scripts/lint-living-notes.ts scripts/output/neighbourhoods-from-db.json ./scripts/output
```

## 📊 Expected Results After Fixes

After running the SQL fixes, you should see:

### Template Pollution (Rule 6)
- ✅ Should drop from 134 to ~0
- ✅ No more "Industrial/logistics zone" in residential_scored entries

### Drivers Missing (Rule 5)
- ✅ Should drop from 163 to ~20-30
- ✅ Only real keywords (tourist, nightlife, downtown) remain
- ✅ No false positives from "transport" → "port"

### Total Issues
- ✅ Should drop from 298 to ~50-100
- ✅ Remaining issues are real problems, not template pollution

## 🔍 Verify Fixes Were Applied

Check if SQL fixes were applied:

```sql
-- Check if template pollution was fixed
SELECT 
  neighbourhood_name,
  short_note
FROM neighbourhood_living_notes
WHERE rating_mode = 'residential_scored'
  AND (
    short_note ILIKE '%industrial/logistics zone%'
    OR short_note IN ('Residential area.', 'Residential area: expect higher street activity/noise.')
  )
LIMIT 10;

-- Should return 0 rows if fixes were applied
```

## Files

1. `scripts/export-living-notes.sql` - SQL export query
2. `scripts/export-from-db.ts` - TypeScript export script
3. `scripts/RE_RUN_LINTER.md` - This file

