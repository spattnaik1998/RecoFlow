-- Feature 4: Adaptive Preference Refinement
-- Run in Supabase SQL editor before deploying Feature 4

CREATE TABLE IF NOT EXISTS preference_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('like', 'dislike', 'add_to_library')),
  book_title TEXT NOT NULL,
  book_author TEXT,
  reason TEXT,
  session_id UUID REFERENCES reading_sessions(id),
  weight DECIMAL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS preference_signals_user_created_idx
  ON preference_signals(user_id, created_at);

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS preferred_authors TEXT[] DEFAULT '{}';
