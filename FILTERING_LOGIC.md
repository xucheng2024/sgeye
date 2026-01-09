# Neighbourhood Filtering Logic

## Overview
The neighbourhood API applies two layers of filtering to ensure users only see relevant residential neighbourhoods in the explore/compare pages.

## Filter 1: Non-Residential Areas

**Location**: `lib/neighbourhoods/fetch.ts:43`

```typescript
.eq('non_residential', false)  // Exclude non-residential areas from explore/compare
```

### Why Filter?
- **Purpose**: Exclude areas that are not suitable for residential living
- **Examples**: 
  - Industrial zones (e.g., DEFU INDUSTRIAL PARK, CHIN BEE)
  - Business parks (e.g., CLEANTECH, LAKESIDE (BUSINESS))
  - Airports (e.g., CHANGI AIRPORT)
  - Terminals (e.g., CITY TERMINALS, CLIFFORD PIER)
  - Water catchments (e.g., CENTRAL WATER CATCHMENT)
  - Islands (e.g., SEMAKAU, NORTH-EASTERN ISLANDS)

### Implementation
- Marked in database via `non_residential` boolean flag
- See: `supabase/migrations/add_non_residential_to_neighbourhoods.sql`
- See: `mark_non_residential_neighbourhoods.sql` for list of marked areas

### Result
- **Downtown Core**: 5 neighbourhoods filtered out (BAYFRONT SUBZONE, CECIL, CENTRAL SUBZONE, CLIFFORD PIER)
- **Remaining**: 8 residential neighbourhoods (ANSON, BUGIS, CITY HALL, MARINA CENTRE, MAXWELL, NICOLL, PHILLIP, RAFFLES PLACE, TANJONG PAGAR)

---

## Filter 2: City Core Zones

**Location**: `lib/neighbourhoods/fetch.ts:57-88`

```typescript
// Filter city_core zones if not included
if (!includeCityCore && result.data) {
  // Filter out city_core zones
  result.data = result.data.filter(n => {
    const zoneType = zoneTypeMap.get(norm(n.name))
    return zoneType !== 'city_core'
  })
}
```

### Why Filter?
- **Purpose**: Exclude downtown CBD areas from general browsing
- **Reason**: 
  - City core areas are primarily commercial/office zones
  - Limited residential options (mostly high-end condos)
  - Not representative of typical HDB neighbourhoods
  - Can clutter general explore results

### Zone Types
- `city_core`: Downtown CBD areas (e.g., Raffles Place, Marina Bay)
- `residential`: Typical residential neighbourhoods
- `city_fringe`: Mixed residential/commercial areas
- `industrial`: Industrial zones
- `business_park`: Business parks
- `nature`: Nature reserves
- `offshore`: Offshore islands

### Default Behavior
- **General explore** (no planning area selected): `includeCityCore = false` → city_core filtered out
- **Specific planning area selected**: `includeCityCore = true` → city_core included
  - **Rationale**: If user explicitly selects a planning area (e.g., Downtown Core), they want to see all neighbourhoods in that area

### Implementation
- Zone type stored in `neighbourhood_living_notes.zone_type`
- Cached for 1 hour to reduce database queries
- Can be overridden via `include_city_core=true` query parameter

### Result for Downtown Core
- **Before fix**: 8 residential neighbourhoods → most/all marked as `city_core` → all filtered → only 1 shown
- **After fix**: When Downtown Core planning area is selected → `includeCityCore = true` → all 8 residential neighbourhoods shown

---

## Filter Flow

```
All Neighbourhoods
    ↓
Filter 1: non_residential = false
    ↓ (Downtown Core: 13 → 8)
Filter 2: zone_type != 'city_core' (if includeCityCore = false)
    ↓ (Downtown Core: 8 → 0-1, before fix)
Final Result
```

---

## Configuration

### Query Parameters
- `include_city_core=true`: Explicitly include city_core zones
- `planning_area_id=xxx`: Automatically sets `includeCityCore = true`

### Code Logic
```typescript
// lib/neighbourhoods/index.ts:parseQueryParams
const explicitIncludeCityCore = searchParams.get('include_city_core') === 'true'
const includeCityCore = planningAreaIds.length > 0 ? true : explicitIncludeCityCore
```

---

## Summary

1. **Non-residential filter**: Always applied - removes industrial/business/airport zones
2. **City core filter**: Applied by default in general explore, but disabled when specific planning area is selected
3. **Rationale**: Focus on residential neighbourhoods that are relevant for home buyers, while still allowing access to all areas when explicitly requested
