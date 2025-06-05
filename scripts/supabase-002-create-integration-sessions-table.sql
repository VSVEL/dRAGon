-- Create integration sessions table for user preferences
CREATE TABLE IF NOT EXISTS integration_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    session_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user sessions
CREATE INDEX IF NOT EXISTS idx_integration_sessions_user_id ON integration_sessions(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE integration_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for user sessions
CREATE POLICY "Users can only access their own sessions" ON integration_sessions
    FOR ALL USING (auth.uid()::text = user_id);
