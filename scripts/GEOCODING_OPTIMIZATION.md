# Geocoding Script Optimization Guide

## Current Performance
- **Speed**: ~500 records/hour
- **Estimated time**: 214 hours for 220,662 records
- **Bottlenecks**: Sequential processing, individual DB queries, fixed delays

## Optimization Strategies

### 1. Parallel Processing ⚡
**Impact**: 3-5x speedup

- Use concurrent API calls (default: 5 concurrent)
- Process multiple records simultaneously
- Configurable: `--concurrency=10`

**Trade-off**: 
- Higher API rate limit usage
- More memory usage
- Need to respect OneMap API limits (250 req/min)

### 2. Batch Database Operations 📦
**Impact**: 2-3x speedup

- Pre-load all unique block+street combinations into cache
- Batch update database (1000 records at a time)
- Reduce individual queries from N to N/1000

**Trade-off**:
- Higher memory usage for cache
- Larger database transactions

### 3. Smart Rate Limiting 🎯
**Impact**: 1.5-2x speedup

- Token bucket algorithm
- Only delay when actually calling API
- No delay for reused coordinates

**Trade-off**:
- More complex implementation
- Need to track request timestamps

### 4. Memory Cache Optimization 💾
**Impact**: 1.5-2x speedup

- Pre-load cache at start
- Update cache as we process
- Avoid repeated database queries

## Combined Optimization

### Optimized Script: `geocode-raw-resale-optimized.js`

**Expected speedup**: 5-10x
- From 500 records/hour → 2,500-5,000 records/hour
- From 214 hours → 22-44 hours

**Usage**:
```bash
# Default (5 concurrent, 500 batch size)
node scripts/geocode-raw-resale-optimized.js

# Custom concurrency
node scripts/geocode-raw-resale-optimized.js --concurrency=10

# Custom batch size
node scripts/geocode-raw-resale-optimized.js --batch-size=1000

# Both
node scripts/geocode-raw-resale-optimized.js --concurrency=10 --batch-size=1000
```

## Additional Optimization Ideas

### 5. Use Multiple API Keys (if available)
- Rotate between multiple OneMap API keys
- Distribute load across keys
- **Impact**: 2-5x (depending on number of keys)

### 6. Database Indexing
- Ensure indexes on `block`, `street_name`, `latitude`, `longitude`
- **Impact**: 1.2-1.5x for queries

### 7. Skip Already Processed Records
- Add filter in query: `.is('latitude', null)`
- **Impact**: Reduces processing time as progress increases

### 8. Use Worker Threads (Advanced)
- Distribute processing across CPU cores
- **Impact**: Additional 1.5-2x on multi-core systems

### 9. Resume from Checkpoint
- Save progress periodically
- Resume from last checkpoint if interrupted
- **Impact**: Prevents re-processing on failure

## Recommended Approach

1. **Start with optimized script** (5-10x speedup)
2. **Monitor API rate limits** (adjust concurrency if needed)
3. **Run in background** with monitoring
4. **Check progress periodically**

## Monitoring

```bash
# Check progress
node -e "require('dotenv').config({path:'.env.local'}); const {createClient} = require('@supabase/supabase-js'); const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY); (async()=>{const {count:total} = await supabase.from('raw_resale_2017').select('*',{count:'exact',head:true}); const {count:geocoded} = await supabase.from('raw_resale_2017').select('*',{count:'exact',head:true}).not('latitude','is',null).not('longitude','is',null); const {count:missing} = await supabase.from('raw_resale_2017').select('*',{count:'exact',head:true}).or('latitude.is.null,longitude.is.null').not('block','is',null).not('street_name','is',null); console.log('Progress:', geocoded, '/', total, '('+((geocoded/total*100).toFixed(1))+'%)'); console.log('Remaining:', missing); })();"

# Monitor script
tail -f geocode.log
```

