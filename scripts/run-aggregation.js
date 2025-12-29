/**
 * Run Aggregation SQL Script
 * 
 * Executes the aggregation SQL to update agg_monthly table
 * Run this after importing new data
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function runAggregation() {
  console.log('Running aggregation SQL...')
  
  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'aggregate-hdb-data.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Split into individual statements (simple approach)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`Found ${statements.length} SQL statements`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Skip TRUNCATE if commented
      if (statement.toUpperCase().includes('TRUNCATE')) {
        console.log(`Skipping TRUNCATE statement ${i + 1}`)
        continue
      }
      
      console.log(`Executing statement ${i + 1}/${statements.length}...`)
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: statement
      })
      
      if (error) {
        // Try direct query if RPC doesn't exist
        console.log('  RPC not available, trying direct query...')
        // Note: Supabase JS client doesn't support raw SQL directly
        // We'll use a workaround: create a function or use REST API
        console.log('  ⚠️  Direct SQL execution not supported via JS client')
        console.log('  Please run aggregate-hdb-data.sql manually in Supabase SQL Editor')
        break
      }
      
      console.log(`  ✓ Statement ${i + 1} completed`)
    }
    
    console.log('')
    console.log('='.repeat(50))
    console.log('Aggregation completed!')
    console.log('')
    console.log('Note: If RPC execution failed, please run aggregate-hdb-data.sql')
    console.log('manually in Supabase SQL Editor')
    
  } catch (error) {
    console.error('Error running aggregation:', error.message)
    console.log('')
    console.log('Please run aggregate-hdb-data.sql manually in Supabase SQL Editor')
    process.exit(1)
  }
}

// Alternative: Use Supabase REST API to execute SQL
async function runAggregationViaREST() {
  console.log('Running aggregation via Supabase REST API...')
  
  try {
    const sqlPath = path.join(__dirname, 'aggregate-hdb-data.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Remove comments and TRUNCATE
    const cleanSql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .filter(line => !line.toUpperCase().includes('TRUNCATE'))
      .join('\n')
    
    // Use Supabase REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({ sql_query: cleanSql })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('Aggregation result:', result)
    
  } catch (error) {
    console.error('Error:', error.message)
    console.log('')
    console.log('Please run aggregate-hdb-data.sql manually in Supabase SQL Editor')
  }
}

// For now, just provide instructions
console.log('='.repeat(50))
console.log('Aggregation Script')
console.log('='.repeat(50))
console.log('')
console.log('Due to Supabase JS client limitations, please run the aggregation SQL manually:')
console.log('')
console.log('1. Go to Supabase Dashboard → SQL Editor')
console.log('2. Open scripts/aggregate-hdb-data.sql')
console.log('3. Copy and paste the SQL (skip TRUNCATE if you want to keep old data)')
console.log('4. Run the query')
console.log('')
console.log('Alternatively, you can set up a Supabase Edge Function or Database Function')
console.log('to automate this step.')
console.log('')

