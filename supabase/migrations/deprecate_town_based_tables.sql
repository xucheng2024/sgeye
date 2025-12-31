-- Migration: Deprecate Town-Based Tables
-- Description: Marks old town-based tables as deprecated
-- These tables are kept for backward compatibility during migration
-- but should not be used for new queries

-- Add comments to mark tables as deprecated
COMMENT ON TABLE agg_monthly IS 'DEPRECATED: Use agg_neighbourhood_monthly instead. This table aggregates by town, which creates averaging illusions.';
COMMENT ON TABLE town_time_access IS 'DEPRECATED: Use neighbourhood_access instead. This table provides town-level access metrics which are not granular enough.';

-- Note: We keep these tables for now to allow gradual migration
-- They can be dropped once all application code is migrated to neighbourhood-based queries

-- Optional: Create views that map old town queries to neighbourhood queries
-- This helps with backward compatibility during migration
CREATE OR REPLACE VIEW agg_monthly_deprecated AS
SELECT 
  'This view is deprecated. Use agg_neighbourhood_monthly instead.' as message,
  NULL::DATE as month,
  NULL::TEXT as town,
  NULL::TEXT as flat_type;

COMMENT ON VIEW agg_monthly_deprecated IS 'DEPRECATED: This view exists only to provide migration guidance. Use agg_neighbourhood_monthly instead.';

