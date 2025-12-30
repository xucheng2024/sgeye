# School Data Import Guide

## Overview

This guide explains how to import primary school data into the `primary_schools` table.

## Data Sources

### Option 1: MOE School Finder (Manual Export)

1. Visit [MOE School Finder](https://www.moe.gov.sg/schoolfinder)
2. Filter for Primary Schools
3. Export data as CSV (if available) or manually collect:
   - School name
   - Address
   - Postal code
   - Planning area / Town

### Option 2: data.gov.sg API

Check if there's a dataset available:
- Search for "school directory" or "primary schools"
- If found, note the `resource_id`
- Update the workflow with the resource_id

### Option 3: Manual CSV/JSON File

Create a CSV or JSON file with school data.

## CSV Format

```csv
school_name,address,postal_code,planning_area,town,latitude,longitude
Example Primary School,123 Example Street,123456,ANG MO KIO,ANG MO KIO,1.3691,103.8454
```

## JSON Format

```json
[
  {
    "school_name": "Example Primary School",
    "address": "123 Example Street",
    "postal_code": "123456",
    "planning_area": "ANG MO KIO",
    "town": "ANG MO KIO",
    "latitude": 1.3691,
    "longitude": 103.8454
  }
]
```

## Import Methods

### Local Import

```bash
# From CSV
node scripts/import-school-data.js --file data/schools.csv

# From JSON
node scripts/import-school-data.js --file data/schools.json

# From data.gov.sg (if resource_id available)
node scripts/import-school-data.js --source datagovsg --resource-id <resource_id>
```

### GitHub Actions (Automatic)

The workflow runs weekly on Mondays at 11 AM Singapore time.

To trigger manually:
1. Go to GitHub Actions
2. Select "Update School Data"
3. Click "Run workflow"

## Geocoding

If latitude/longitude are missing, the script will attempt to geocode addresses using OneMap API. This can be slow for large datasets.

## Notes

- The script uses `school_name` + `postal_code` as unique identifier
- Existing schools will be updated, new ones will be inserted
- Missing coordinates will be geocoded automatically (optional)

