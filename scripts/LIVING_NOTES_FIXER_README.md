# Living Notes Data Fixer

This tool validates and auto-fixes neighbourhood living notes data to ensure consistency and quality.

## Overview

The fixer enforces:
- **Data contracts**: Allowed values for zone_type, rating_mode, ratings, variance_level
- **Hard validation rules**: rating_mode consistency, zone_type rules
- **Auto-fix rules**: short_note, drivers, variance_level generation
- **Manual review detection**: Flags items that need human review

## Quick Start

1. **Prepare your JSON data file** (e.g., `neighbourhoods.json`)
   ```json
   [
     {
       "neighbourhood_name": "CENTRAL SUBZONE",
       "noise_density_rating": "bad",
       ...
     }
   ]
   ```

2. **Run the fixer**:
   ```bash
   # Option 1: Using npx (recommended, no installation needed)
   npx ts-node scripts/fix-living-notes-data.ts neighbourhoods.json ./scripts/output
   
   # Option 2: Using npm script (after installing ts-node)
   npm install -D ts-node
   npm run fix-living-notes neighbourhoods.json ./scripts/output
   
   # Option 3: Using shell script
   ./scripts/run-fix-living-notes.sh neighbourhoods.json ./scripts/output
   ```

3. **Check outputs**:
   - `neighbourhoods.fixed.json` - Fixed data ready for database
   - `errors.json` - Validation errors (if any)
   - `review_list.json` - Items needing manual review
   - `display_name_duplicates.json` - Duplicate display names

4. **Generate SQL** (optional):
   ```bash
   npx ts-node scripts/generate-upsert-sql.ts ./scripts/output/neighbourhoods.fixed.json ./scripts/output/upsert.sql
   ```

5. **Apply database constraints**:
   ```bash
   # Run the migration
   psql -d your_database -f supabase/migrations/add_living_notes_constraints.sql
   ```

## Data Contracts

### Allowed Values

- **zone_type**: `residential` | `city_core` | `business_park` | `industrial` | `nature` | `offshore`
- **rating_mode**: `residential_scored` | `not_scored`
- **ratings** (5 fields): `good` | `mixed` | `bad` | `null`
- **variance_level**: `compact` | `moderate` | `spread_out`

## Validation Rules

### C1: rating_mode Consistency

- **Rule 1**: If `rating_mode = residential_scored` → all 5 ratings must be non-null
- **Rule 2**: If `rating_mode = not_scored` → all 5 ratings must be null

### C2: zone_type Rules

- **Rule 3**: `zone_type IN (industrial, nature, offshore)` → `rating_mode` must be `not_scored`

### C3: Display Name Uniqueness

- **Rule 4**: `display_name` should be unique (or have distinguishing suffixes)

## Auto-Fix Rules

### D1: short_note Auto-Fix

- Removes wrong template phrases like "Industrial/logistics zone. Not designed for residential routines."
- Generates new short_note based on:
  - Zone type
  - Strongest rating dimension
  - Weakest rating dimension / tradeoff

### D2: drivers Auto-Complete

Automatically adds drivers based on:
- Zone type (e.g., `city_core` → `downtown`)
- Ratings (e.g., `daily=good` → `amenity_access`)
- Variance level (e.g., `spread_out` → `pocket_choice_matters`)

### D3: variance_level Auto-Calculate

Calculates based on:
- Drivers containing high-variance indicators
- Zone type (city_core → usually spread_out)
- Notes containing variation keywords
- Rating patterns

## Manual Review Detection

Items are flagged for review if:
- Notes contain phrases like "not designed for residential routines"
- All 5 ratings are "bad" (suggests non-residential)
- Other suspicious patterns

## Database Constraints

The migration `add_living_notes_constraints.sql` adds:
- Check constraint for rating_mode consistency
- Check constraint for zone_type rules
- Check constraint for drivers (residential_scored must have ≥1 driver)
- Check constraint for short_note (residential_scored must have non-empty short_note)

## Workflow

1. **Lint**: Run fixer to find errors
2. **Auto-fix**: Fixer automatically corrects short_note, drivers, variance_level
3. **Review**: Check `review_list.json` and manually fix flagged items
4. **Generate SQL**: Create upsert statements
5. **Apply**: Run SQL against database
6. **Verify**: Check database constraints are working

## Example Output

```
=== Living Notes Data Fixer ===
Processing 50 neighbourhoods...

✓ Fixed data written to: ./scripts/output/neighbourhoods.fixed.json
✓ No validation errors found
⚠ Review needed: 3 items (written to ./scripts/output/review_list.json)
⚠ Display name duplicates found: 1 (written to ./scripts/output/display_name_duplicates.json)

=== Summary ===
Total processed: 50
Fixed: 50
Errors: 0
Needs review: 3
Display name duplicates: 1
```

## Files

- `scripts/fix-living-notes-data.ts` - Main fixer script
- `scripts/generate-upsert-sql.ts` - SQL generator
- `scripts/run-fix-living-notes.sh` - Convenience shell script
- `supabase/migrations/add_living_notes_constraints.sql` - Database constraints

