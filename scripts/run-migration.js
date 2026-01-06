/**
 * Run SQL migration using Supabase client
 * Usage: node scripts/run-migration.js <migration-file-path>
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const migrationFile = process.argv[2] || 'supabase/migrations/fix_bukit_merah_and_add_protection_rules.sql';

if (!fs.existsSync(migrationFile)) {
  console.error(`Error: Migration file not found: ${migrationFile}`);
  process.exit(1);
}

const sql = fs.readFileSync(migrationFile, 'utf8');

async function runMigration() {
  try {
    console.log(`Running migration: ${migrationFile}`);
    console.log('Connecting to Supabase...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SELECT'));
    
    console.log(`Found ${statements.length} statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim().length === 0) continue;
      
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          // Try direct query if RPC doesn't work
          const { error: queryError } = await supabase.from('_').select('*').limit(0);
          if (queryError && queryError.message.includes('exec_sql')) {
            console.error('Note: exec_sql RPC not available. Please run migration via Supabase Dashboard SQL Editor.');
            console.error('\nSQL to run:');
            console.log('='.repeat(80));
            console.log(sql);
            console.log('='.repeat(80));
            process.exit(1);
          }
          throw error;
        }
        
        console.log(`✓ Statement ${i + 1} executed successfully`);
      } catch (err) {
        console.error(`✗ Error executing statement ${i + 1}:`, err.message);
        throw err;
      }
    }
    
    console.log('\n✓ Migration completed successfully!');
  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    console.error('\nPlease run the migration manually via Supabase Dashboard:');
    console.error('1. Go to: https://supabase.com/dashboard/project/iecxbqkmazkxzrsobxyn/sql/new');
    console.error('2. Copy and paste the SQL from:', migrationFile);
    console.error('3. Click Run');
    process.exit(1);
  }
}

runMigration();

