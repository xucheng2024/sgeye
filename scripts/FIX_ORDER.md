# Fix Order - Root Cause First

## ⚠️ Critical: Fix Root Causes Before Symptoms

The lint found 298 issues, but many are **symptoms** of template pollution, not real problems.

## ✅ Correct Fix Order

### Step A: Fix Template Pollution FIRST

```bash
psql -f supabase/migrations/fix_template_pollution_first.sql
```

**What it does**:
- Removes generic templates: "Residential area.", "Residential area with balanced characteristics."
- Removes forbidden phrases: "industrial/logistics zone", "not designed for residential routines"
- Generates rating-appropriate short_notes (avoids contradictions)
- Fixes CLARKE QUAY specifically

**Why first**: Template pollution causes false positives in Rule 5 (keyword detection)

### Step B: Fix Drivers (Minimal Set Only)

```bash
psql -f supabase/migrations/fix_drivers_minimal.sql
```

**What it does**:
- Only adds drivers for **truly mentioned** keywords
- Uses word boundary matching (avoids "transport" → "port" false positive)
- Skips entries with template pollution
- Minimal set: tourist_crowd, nightlife_nearby, downtown, arterial_roads, heavy_vehicles

**Why second**: After cleaning templates, we can see which keywords are real

### Step C: Re-run Linter

```bash
npx tsx scripts/lint-living-notes.ts supabase/neighbourhoods-input.json ./scripts/output
```

**Expected result**: Issues should drop significantly (from 298 to ~50-100)

## ❌ Wrong Order (What NOT to do)

1. ❌ Apply all 70 patches at once
2. ❌ Add "logistics" driver to every entry that mentions "transport"
3. ❌ Use overly positive short_notes for bad ratings

## 📊 Expected Results

### After Step A (Template Pollution Fix)
- ✅ 0 generic templates in short_note
- ✅ 0 forbidden phrases
- ✅ short_notes match ratings (no contradictions)

### After Step B (Minimal Drivers)
- ✅ Only truly mentioned keywords get drivers
- ✅ No false positives from "transport" → "port"
- ✅ No drivers added for template pollution

### After Step C (Re-lint)
- ✅ Rule 5 issues drop by 70%+
- ✅ Remaining issues are real problems
- ✅ Fewer false positives

## 🎯 Key Improvements Made

1. **Word boundary matching** - Prevents "transport" → "port" false positive
2. **Template pollution check** - Skips drivers for polluted entries
3. **Rating-appropriate short_notes** - Avoids contradictions
4. **Minimal driver set** - Only adds what's truly mentioned

## Files

1. `fix_template_pollution_first.sql` - Step A (run first)
2. `fix_drivers_minimal.sql` - Step B (run second)
3. `lint-living-notes.ts` - Updated with word boundaries

