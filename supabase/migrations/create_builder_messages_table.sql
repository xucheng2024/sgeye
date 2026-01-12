-- Create builder_messages table for "Ask the builder" feature
CREATE TABLE IF NOT EXISTS builder_messages (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_builder_messages_created_at ON builder_messages(created_at DESC);

-- Enable RLS
ALTER TABLE builder_messages ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert (for API)
-- Note: This table should only be writable by the API, not by public users
-- The API uses service role key, so we don't need a public insert policy
