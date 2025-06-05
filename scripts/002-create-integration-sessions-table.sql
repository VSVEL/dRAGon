-- Create integration sessions table for user preferences and chat history
CREATE TABLE IF NOT EXISTS integration_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    session_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for user sessions
CREATE INDEX IF NOT EXISTS idx_integration_sessions_user_id ON integration_sessions(user_id);
