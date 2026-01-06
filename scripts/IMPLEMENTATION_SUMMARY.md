# Living Notes Data Fixer - Implementation Summary

## What Was Built

A comprehensive data validation and auto-fix system for neighbourhood living notes that ensures data consistency and quality.

## Files Created

### 1. Core Fixer Script
- **`scripts/fix-living-notes-data.ts`**
  - Validates data against hard rules
  - Auto-fixes short_note, drivers, variance_level
  - Detects items needing manual review
  - Finds display_name duplicates
  - Generates fixed JSON output

### 2. SQL Generator
- **`scripts/generate-upsert-sql.ts`**
  - Converts fixed JSON to SQL UPSERT statements
  - Handles SQL escaping properly
  - Ready to run against Supabase

### 3. Database Constraints
- **`supabase/migrations/add_living_notes_constraints.sql`**
  - Enforces rating_mode consistency at DB level
  - Enforces zone_type rules
  - Ensures drivers and short_note are populated for residential_scored

### 4. Documentation
- **`scripts/LIVING_NOTES_FIXER_README.md`**
  - Complete usage guide
  - Data contract documentation
  - Workflow instructions

### 5. Helper Scripts
- **`scripts/run-fix-living-notes.sh`** - Convenience shell script
- **`scripts/process-provided-data.ts`** - Alternative entry point

## Key Features

### Validation Rules Implemented

1. **Rating Mode Consistency**
   - `residential_scored` → all ratings must be non-null
   - `not_scored` → all ratings must be null

2. **Zone Type Rules**
   - `industrial`, `nature`, `offshore` → must be `not_scored`

3. **Display Name Uniqueness**
   - Detects duplicates
   - Auto-adds suffixes (e.g., "Lakeside (Leisure)", "Lakeside (Business Park)")

### Auto-Fix Logic

1. **short_note**
   - Removes wrong template phrases
   - Generates based on zone_type + strongest/weakest ratings

2. **drivers**
   - Auto-completes based on zone_type, ratings, variance_level
   - Ensures at least 1 driver for residential_scored

3. **variance_level**
   - Calculates from drivers, zone_type, notes keywords
   - Handles city_core, spread_out patterns automatically

### Manual Review Detection

Flags items that:
- Contain "not designed for residential" phrases
- Have all-bad ratings (suggests non-residential)
- Need human judgment

## Usage Workflow

1. **Prepare JSON data** (your neighbourhood data)
2. **Run fixer**: `npx ts-node scripts/fix-living-notes-data.ts input.json output/`
3. **Review outputs**:
   - `neighbourhoods.fixed.json` - Use this
   - `errors.json` - Fix any errors
   - `review_list.json` - Manually review flagged items
4. **Generate SQL**: `npx ts-node scripts/generate-upsert-sql.ts output/neighbourhoods.fixed.json output/upsert.sql`
5. **Apply constraints**: Run migration `add_living_notes_constraints.sql`
6. **Upsert data**: Run generated `upsert.sql`

## Next Steps

1. **Run on your data**: Process the JSON you provided
2. **Review flagged items**: Check `review_list.json` and make manual decisions
3. **Apply to database**: Run the SQL upsert
4. **Verify**: Check that constraints are working

## Data Quality Improvements

After running the fixer, you'll have:
- ✅ Consistent rating_mode and ratings
- ✅ Correct zone_type → rating_mode mappings
- ✅ Unique display_names (or with suffixes)
- ✅ Auto-generated short_notes (no template pollution)
- ✅ Populated drivers arrays
- ✅ Calculated variance_level values
- ✅ Flagged items for manual review

## Notes

- The fixer is **non-destructive** - it creates new files, doesn't modify originals
- All auto-fixes can be overridden manually in the review step
- Database constraints prevent future invalid data
- The system is designed to be run repeatedly as data evolves

