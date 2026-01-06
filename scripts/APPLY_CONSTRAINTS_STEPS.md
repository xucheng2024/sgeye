# Steps to Apply Content Consistency Constraints

## ⚠️ Error Encountered

The constraint `check_short_note_not_generic` failed because existing data has violations.

## ✅ Solution: Fix Data First, Then Apply Constraints

### Step 1: Fix Existing Violations

```bash
psql -f supabase/migrations/fix_violations_before_constraints.sql
```

**File**: `supabase/migrations/fix_violations_before_constraints.sql`

This script will:
- Find all records violating the constraints
- Auto-fix generic short_notes
- Auto-fix forbidden phrases
- Auto-fix generic drivers
- Show verification results

### Step 2: Verify Fixes

After running the fix script, verify there are no remaining violations:

```sql
-- Check remaining violations
SELECT 
  'Remaining violations' as check_type,
  COUNT(*) as count
FROM neighbourhood_living_notes
WHERE rating_mode = 'residential_scored'
  AND (
    short_note IS NULL
    OR length(trim(short_note)) <= 20
    OR short_note IN ('Residential area.', 'Residential area: expect higher street activity/noise.')
    OR short_note ILIKE '%industrial/logistics zone%'
    OR array_length(drivers, 1) IS NULL
    OR (array_length(drivers, 1) = 1 AND drivers[1] = 'residential')
  );
```

**Expected result**: `count = 0`

### Step 3: Apply Constraints

Once all violations are fixed:

```bash
psql -f supabase/migrations/add_content_consistency_constraints.sql
```

**File**: `supabase/migrations/add_content_consistency_constraints.sql`

## What the Fix Script Does

### 1. Fixes Generic Short Notes
- Replaces "Residential area." with descriptive text based on ratings
- Ensures length > 20 characters
- Uses zone_type and ratings to generate appropriate descriptions

### 2. Fixes Forbidden Phrases
- Removes phrases like "industrial/logistics zone"
- Generates new short_notes based on actual zone_type

### 3. Fixes Generic Drivers
- Replaces `["residential"]` with specific drivers
- Auto-generates drivers based on zone_type and ratings
- Ensures at least 2 meaningful drivers

## Alternative: Use Fixed Data from Script

If you prefer to use the fixed data from the fixer script:

```bash
# 1. Re-run fixer to get latest fixed data
npx tsx scripts/fix-living-notes-data.ts supabase/neighbourhoods-input.json ./scripts/output

# 2. Apply the fixed data
psql -f scripts/output/upsert.sql

# 3. Then apply constraints
psql -f supabase/migrations/add_content_consistency_constraints.sql
```

## Summary

**Order of execution**:
1. ✅ Fix existing violations (`fix_violations_before_constraints.sql`)
2. ✅ Verify no violations remain
3. ✅ Apply constraints (`add_content_consistency_constraints.sql`)

This ensures the constraints can be applied without errors.

