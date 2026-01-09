# Supabase Setup Guide

## Step 1: Create Database Tables

1. Go to your Supabase project: https://supabase.com/dashboard/project/iecxbqkmazkxzrsobxyn
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the entire contents of `supabase/schema.sql`
5. Click **Run** to execute the SQL script
6. This will create all tables and insert sample data

## Step 2: Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://iecxbqkmazkxzrsobxyn.supabase.co`
   - Environment: Production, Preview, Development (select all)

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllY3hicWttYXpreHpyc29ieHluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMDgyODQsImV4cCI6MjA4MjU4NDI4NH0.NTIwSZt6VMnc97c_C95LrxKCKSildo5DoH22jm66Hrw`
   - Environment: Production, Preview, Development (select all)

4. Click **Save** for each variable
5. **Redeploy** your project (Vercel will automatically redeploy when you push new code, or you can manually trigger a redeploy)

## Step 3: Push Updated Code to GitHub

The code has been updated to support Supabase. Push the changes:

```bash
git add .
git commit -m "Add Supabase integration with data fetching"
git push
```

## Step 4: Verify

After redeploying:
1. Visit your Vercel deployment URL
2. Check browser console (F12) for any errors
3. Charts should load data from Supabase (or fallback to static data if Supabase is not configured)

## Notes

- The app will work with static data if Supabase is not configured (graceful fallback)
- Once Supabase is set up, charts will automatically fetch from the database
- You can update data in Supabase tables and charts will reflect the changes






