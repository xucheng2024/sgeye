-- Migration: Create User Feedback Table
-- Description: Stores anonymous one-sentence feedback from users
-- Feedback is not displayed to other users, used only for internal improvement

CREATE TABLE IF NOT EXISTS user_feedback (
  id SERIAL PRIMARY KEY,
  feedback_text TEXT NOT NULL,
  context TEXT NOT NULL CHECK (context IN ('affordability', 'compare', 'home')),
  metadata JSONB, -- Optional context data (e.g., budget for affordability, neighbourhood IDs for compare)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_feedback_context ON user_feedback(context);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting feedback (anyone can submit)
DROP POLICY IF EXISTS "Allow public insert" ON user_feedback;
CREATE POLICY "Allow public insert" ON user_feedback FOR INSERT WITH CHECK (true);

-- Create policy to prevent reading (feedback is not visible to other users, only admins can query)
DROP POLICY IF EXISTS "Prevent public read" ON user_feedback;
CREATE POLICY "Prevent public read" ON user_feedback FOR SELECT USING (false);

