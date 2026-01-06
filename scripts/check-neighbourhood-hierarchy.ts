#!/usr/bin/env tsx
/**
 * Check neighbourhood hierarchy consistency
 * Verify if neighbourhood names match their actual definitions in the database
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNeighbourhoodHierarchy() {
  const problematicNames = [
    'ANG MO KIO',
    'SIGLAP',
    'UPPER THOMSON',
    'BEDOK RESERVOIR',
    'BOON LAY PLACE',
    'GEYLANG BAHRU',
    'KALLANG BAHRU',
  ];

  console.log('Checking neighbourhood hierarchy...\n');

  for (const name of problematicNames) {
    const { data: neighbourhood, error } = await supabase
      .from('neighbourhoods')
      .select(`
        id,
        name,
        type,
        parent_subzone_id,
        planning_area_id,
        subzones:parent_subzone_id (
          id,
          name,
          planning_area_id
        ),
        planning_areas:planning_area_id (
          id,
          name
        )
      `)
      .eq('name', name)
      .single();

    if (error) {
      console.log(`❌ ${name}: Error - ${error.message}`);
    } else if (neighbourhood) {
      console.log(`\n📍 ${name}:`);
      console.log(`   ID: ${neighbourhood.id}`);
      console.log(`   Type: ${neighbourhood.type || 'N/A'}`);
      const subzone = Array.isArray(neighbourhood.subzones) ? neighbourhood.subzones[0] : neighbourhood.subzones;
      const planningArea = Array.isArray(neighbourhood.planning_areas) ? neighbourhood.planning_areas[0] : neighbourhood.planning_areas;
      console.log(`   Parent Subzone: ${subzone?.name || 'N/A'}`);
      console.log(`   Planning Area: ${planningArea?.name || 'N/A'}`);
    } else {
      console.log(`❌ ${name}: Not found in neighbourhoods table`);
    }
  }
}

if (require.main === module) {
  checkNeighbourhoodHierarchy()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

