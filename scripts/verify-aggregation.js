/**
 * Verify agg_neighbourhood_monthly data completeness
 * 
 * Checks:
 * 1. Total record count
 * 2. Each neighbourhood has trend data
 * 3. Time series continuity (no missing months)
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('='.repeat(60))
  console.log('Verify agg_neighbourhood_monthly Data')
  console.log('='.repeat(60))
  console.log('')
  
  // 1. Check total record count
  const { count: totalRecords } = await supabase
    .from('agg_neighbourhood_monthly')
    .select('*', { count: 'exact', head: true })
  
  console.log('1. 有数据：')
  console.log(`   SELECT COUNT(*) FROM agg_neighbourhood_monthly;`)
  console.log(`   结果: ${(totalRecords || 0).toLocaleString()}`)
  console.log('')
  
  // 2. Check neighbourhood trends
  // Get all unique neighbourhoods by paginating
  const allNeighbourhoods = new Set()
  let offset = 0
  const pageSize = 1000
  
  while (true) {
    const { data: batch } = await supabase
      .from('agg_neighbourhood_monthly')
      .select('neighbourhood_id')
      .range(offset, offset + pageSize - 1)
    
    if (!batch || batch.length === 0) break
    
    batch.forEach(r => allNeighbourhoods.add(r.neighbourhood_id))
    offset += pageSize
    
    if (batch.length < pageSize) break
  }
  
  console.log('2. 每个 neighbourhood 都能查到趋势：')
  console.log(`   SELECT neighbourhood_id, COUNT(*) FROM agg_neighbourhood_monthly GROUP BY neighbourhood_id;`)
  console.log(`   唯一 neighbourhood 数: ${allNeighbourhoods.size}`)
  
  // Get month counts per neighbourhood
  const neighbourhoodMonthCounts = {}
  offset = 0
  
  while (true) {
    const { data: batch } = await supabase
      .from('agg_neighbourhood_monthly')
      .select('neighbourhood_id,month')
      .range(offset, offset + pageSize - 1)
    
    if (!batch || batch.length === 0) break
    
    batch.forEach(r => {
      if (!neighbourhoodMonthCounts[r.neighbourhood_id]) {
        neighbourhoodMonthCounts[r.neighbourhood_id] = new Set()
      }
      neighbourhoodMonthCounts[r.neighbourhood_id].add(r.month?.substring(0, 7))
    })
    
    offset += pageSize
    if (batch.length < pageSize) break
  }
  
  const top10 = Object.entries(neighbourhoodMonthCounts)
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, 10)
  
  console.log('   Top 10 neighbourhoods by unique months:')
  top10.forEach(([nh, months], i) => {
    console.log(`     ${i + 1}. ${nh}: ${months.size} 个月`)
  })
  console.log('')
  
  // 3. Check time series continuity
  const allMonths = new Set()
  offset = 0
  
  while (true) {
    const { data: batch } = await supabase
      .from('agg_neighbourhood_monthly')
      .select('month')
      .order('month', { ascending: true })
      .range(offset, offset + pageSize - 1)
    
    if (!batch || batch.length === 0) break
    
    batch.forEach(r => {
      if (r.month) {
        allMonths.add(r.month.substring(0, 7))
      }
    })
    
    offset += pageSize
    if (batch.length < pageSize) break
  }
  
  const sortedMonths = Array.from(allMonths).sort()
  
  console.log('3. 时间序列连续性：')
  console.log(`   唯一月份数: ${sortedMonths.length}`)
  
  if (sortedMonths.length > 0) {
    console.log(`   最早月份: ${sortedMonths[0]}`)
    console.log(`   最晚月份: ${sortedMonths[sortedMonths.length - 1]}`)
    
    // Check for missing months
    const expectedMonths = []
    const start = new Date(sortedMonths[0] + '-01')
    const end = new Date(sortedMonths[sortedMonths.length - 1] + '-01')
    const current = new Date(start)
    
    while (current <= end) {
      expectedMonths.push(current.toISOString().substring(0, 7))
      current.setMonth(current.getMonth() + 1)
    }
    
    const missing = expectedMonths.filter(m => !allMonths.has(m))
    
    if (missing.length === 0) {
      console.log('   ✅ 时间序列连续（无断月）')
    } else if (missing.length < 20) {
      console.log(`   ⚠️  缺失月份: ${missing.join(', ')}`)
    } else {
      console.log(`   ⚠️  缺失 ${missing.length} 个月份`)
    }
  }
  
  console.log('')
  console.log('='.repeat(60))
  console.log('✅ 验证完成')
  console.log('='.repeat(60))
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

