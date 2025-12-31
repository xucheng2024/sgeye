-- Drop blocks-related tables
-- Order matters due to foreign key constraints

-- Drop tables with foreign keys first
DROP TABLE IF EXISTS public.alert_events CASCADE;
DROP TABLE IF EXISTS public.block_metrics CASCADE;
DROP TABLE IF EXISTS public.watch_subscriptions CASCADE;

-- Drop main blocks table last
DROP TABLE IF EXISTS public.blocks CASCADE;

