export interface StoredIntegration {
  id: string
  userId: string
  integrationId: string
  integrationName: string
  provider: string
  accountId: string
  accountEmail: string
  accountName: string
  accountAvatar?: string
  accessToken: string
  refreshToken?: string
  tokenExpiresAt?: Date
  scopes: string[]
  isEnabled: boolean
  isActive: boolean
  settings: Record<string, any>
  metadata: {
    lastSyncAt?: Date
    lastUsedAt?: Date
    totalUsage: number
    errorCount: number
    lastError?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface IntegrationSession {
  id: string
  userId: string
  sessionData: {
    activeIntegrations: string[]
    preferences: Record<string, any>
    lastContext: any
    chatHistory: any[]
  }
  createdAt: Date
  updatedAt: Date
}

export interface IntegrationUsageLog {
  id: string
  userId: string
  integrationId: string
  action: "connect" | "disconnect" | "enable" | "disable" | "sync" | "error"
  details: Record<string, any>
  timestamp: Date
}
