#!/usr/bin/env ts-node
/**
 * Export living notes from database to JSON
 * Use this to get the latest data after SQL fixes
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  config({ path: envPath });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials');
  console.log('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or ANON_KEY)');
  console.log('Or ensure .env.local exists with these variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportData() {
  const outputFile = process.argv[2] || './scripts/output/neighbourhoods-from-db.json';
  
  console.log('Fetching living notes from database...');
  
  const { data, error } = await supabase
    .from('neighbourhood_living_notes')
    .select('*')
    .order('neighbourhood_name');
  
  if (error) {
    console.error('Error fetching data:', error);
    process.exit(1);
  }
  
  if (!data || data.length === 0) {
    console.error('No data found');
    process.exit(1);
  }
  
  console.log(`Fetched ${data.length} records`);
  
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
  console.log(`✓ Data exported to: ${outputFile}`);
  console.log(`\nNow run linter on this file:`);
  console.log(`  npx tsx scripts/lint-living-notes.ts ${outputFile} ./scripts/output`);
}

if (require.main === module) {
  exportData().catch(console.error);
}

