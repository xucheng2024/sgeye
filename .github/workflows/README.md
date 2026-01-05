# GitHub Actions Setup Guide

## HDB Data Auto-Update Workflow

This workflow automatically updates HDB resale data daily from data.gov.sg.

## Setup Instructions

### 1. Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

- **SUPABASE_URL**: Your Supabase project URL
  - Example: `https://iecxbqkmazkxzrsobxyn.supabase.co`

- **SUPABASE_SERVICE_KEY**: Your Supabase service role key (NOT anon key!)
  - Go to Supabase Dashboard → Settings → API
  - Copy the `service_role` key (secret key)
  - ⚠️ **Important**: Use service_role key, not anon key, to bypass RLS

### 2. Install Dependencies

The workflow needs `@supabase/supabase-js`. Add it to package.json:

```bash
npm install @supabase/supabase-js --save-dev
```

Or create a minimal package.json in scripts folder if needed.

### 3. Workflow Schedule

The workflow runs daily at 2 AM UTC (10 AM Singapore time).

To change the schedule, edit `.github/workflows/update-hdb-data.yml`:

```yaml
schedule:
  - cron: '0 2 * * *'  # Change this
```

Cron format: `minute hour day month day-of-week`
- `0 2 * * *` = 2 AM UTC daily
- `0 10 * * *` = 10 AM UTC daily

### 4. Manual Trigger

You can also trigger the workflow manually:
- Go to Actions tab in GitHub
- Select "Update HDB Resale Data"
- Click "Run workflow"

### 5. After Data Update

After the workflow runs and inserts new data, you need to run the aggregation SQL:

1. Go to Supabase Dashboard → SQL Editor
2. Open `scripts/aggregate-hdb-data.sql`
3. Copy and paste the SQL
4. Run it

**Future improvement**: We can automate aggregation using Supabase Edge Functions or Database Functions.

## Monitoring

- Check workflow runs: GitHub → Actions tab
- Check logs: Click on a workflow run to see detailed logs
- Check data: Supabase Dashboard → Table Editor → `raw_resale_2017`

## Troubleshooting

### Workflow fails with "SUPABASE_URL not set"
- Check that secrets are added correctly
- Ensure secret names match exactly: `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

### Workflow fails with authentication error
- Verify you're using `service_role` key, not `anon` key
- Check that the key has proper permissions

### No new data inserted
- Check data.gov.sg API status
- Verify the resource ID is correct
- Check workflow logs for errors

### Aggregation not running automatically
- Currently requires manual SQL execution
- Future: Can be automated with Supabase Edge Functions



