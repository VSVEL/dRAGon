-- Create integrations table
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    integration_id VARCHAR(255) NOT NULL,
    integration_name VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    account_email VARCHAR(255),
    account_name VARCHAR(255),
    account_avatar TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    scopes TEXT[], -- Array of scopes
    is_enabled BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider);
CREATE INDEX IF NOT EXISTS idx_integrations_active ON integrations(is_active);
CREATE INDEX IF NOT EXISTS idx_integrations_user_provider ON integrations(user_id, provider);

-- Create unique constraint to prevent duplicate integrations
CREATE UNIQUE INDEX IF NOT EXISTS idx_integrations_unique 
ON integrations(user_id, provider, account_id) 
WHERE is_active = true;
