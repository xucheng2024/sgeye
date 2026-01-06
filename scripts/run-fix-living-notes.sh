#!/bin/bash
# Script to run the living notes data fixer
# Usage: ./run-fix-living-notes.sh [input.json] [output_dir]

set -e

INPUT_FILE="${1:-neighbourhoods.json}"
OUTPUT_DIR="${2:-./scripts/output}"

echo "=== Living Notes Data Fixer ==="
echo "Input file: $INPUT_FILE"
echo "Output directory: $OUTPUT_DIR"
echo ""

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
  echo "Error: Input file '$INPUT_FILE' not found"
  echo "Usage: $0 [input.json] [output_dir]"
  exit 1
fi

# Run the TypeScript fixer
npx ts-node scripts/fix-living-notes-data.ts "$INPUT_FILE" "$OUTPUT_DIR"

echo ""
echo "=== Done ==="
echo "Check the output directory for:"
echo "  - neighbourhoods.fixed.json (fixed data)"
echo "  - errors.json (validation errors, if any)"
echo "  - review_list.json (items needing manual review, if any)"
echo "  - display_name_duplicates.json (duplicate display names, if any)"

