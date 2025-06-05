-- Create integration usage logs table for analytics
CREATE TABLE IF NOT EXISTS integration_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- connect, disconnect, enable, disable, sync, error
    details JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for usage logs
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON integration_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_integration_id ON integration_usage_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_timestamp ON integration_usage_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON integration_usage_logs(action);
