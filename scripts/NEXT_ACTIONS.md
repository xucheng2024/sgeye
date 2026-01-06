# Next Actions - Quality Rules Implementation

## ✅ Completed

All quality rules (A, B, C) have been implemented:
- ✅ Database constraints updated
- ✅ Validation scripts updated
- ✅ Quality check scripts created
- ✅ Fix scripts created

## 🔧 Immediate Actions Required

### 1. Apply Content Consistency Constraints

```bash
psql -f supabase/migrations/add_content_consistency_constraints.sql
```

**File**: `supabase/migrations/add_content_consistency_constraints.sql`

This will enforce Rule C at database level.

### 2. Run Quality Checks

```bash
psql -f scripts/check_data_quality.sql
```

**File**: `scripts/check_data_quality.sql`

This will show all remaining issues.

### 3. Fix Remaining Issues

Based on the errors found, you need to fix:

#### ONE NORTH (Rule A & B violation)
**File**: `supabase/migrations/fix_one_north_changi_west.sql`

**Decision needed**: Does ONE NORTH have stable residential transactions?
- **Yes** → Uncomment Option 2 (change zone_type to residential)
- **No** → Uncomment Option 1 (change to not_scored)

#### CHANGI WEST (Rule C violation - generic template)
Already fixed in the fixer script output, but verify:
- Check if it has HDB transactions
- If no transactions → change to not_scored (see fix script)

#### CLEANTECH & MARITIME SQUARE
Already fixed in `fix_cleantech_maritime_square.sql`, but the input data still has issues.
**Action**: Re-run the fixer on updated data, or apply the fix migration.

#### GALI BATU (Rule C violation)
Needs short_note fix. Check if it should be residential_scored or not_scored.

## 📋 Execution Order

1. **Apply constraints**:
   ```bash
   psql -f supabase/migrations/add_content_consistency_constraints.sql
   ```

2. **Check current state**:
   ```bash
   psql -f scripts/check_data_quality.sql
   ```

3. **Fix ONE NORTH** (after decision):
   ```bash
   # Edit fix_one_north_changi_west.sql to uncomment the right option
   psql -f supabase/migrations/fix_one_north_changi_west.sql
   ```

4. **Re-run fixer** (if needed):
   ```bash
   npx tsx scripts/fix-living-notes-data.ts supabase/neighbourhoods-input.json ./scripts/output
   ```

5. **Apply fixed data**:
   ```bash
   psql -f scripts/output/upsert.sql
   ```

## 📊 Expected Results After All Fixes

- ✅ **0** Rule A violations (non-residential zones incorrectly scored)
- ✅ **0** Rule B violations (business_park incorrectly scored)
- ✅ **0** Rule C violations (template pollution, generic drivers)
- ✅ **0** Content inconsistencies

## 🔍 Files Reference

### Database Migrations
- `add_living_notes_constraints.sql` - Rule A (updated)
- `add_content_consistency_constraints.sql` - Rule C (NEW)
- `fix_one_north_changi_west.sql` - Rule B fixes (NEW)

### Validation Scripts
- `fix-living-notes-data.ts` - All rules validated
- `check_data_quality.sql` - Comprehensive checks (NEW)
- `verify_fixes.sql` - Post-deployment verification

### Documentation
- `QUALITY_RULES_APPLIED.md` - Complete summary
- `NEXT_ACTIONS.md` - This file

