import { sql } from "@vercel/postgres"

export interface Integration {
  id: string
  user_id: string
  integration_id: string
  integration_name: string
  provider: string
  account_id: string
  account_email?: string
  account_name?: string
  account_avatar?: string
  access_token?: string
  refresh_token?: string
  token_expires_at?: Date
  scopes: string[]
  is_enabled: boolean
  is_active: boolean
  settings: Record<string, any>
  metadata: Record<string, any>
  created_at: Date
  updated_at: Date
}

export interface IntegrationSession {
  id: string
  user_id: string
  session_data: Record<string, any>
  created_at: Date
  updated_at: Date
}

export interface IntegrationUsageLog {
  id: string
  user_id: string
  integration_id: string
  action: string
  details: Record<string, any>
  timestamp: Date
}

export class PostgresIntegrationService {
  // Create or update integration
  async saveIntegration(integration: Omit<Integration, "id" | "created_at" | "updated_at">): Promise<string> {
    try {
      const result = await sql`
        INSERT INTO integrations (
          user_id, integration_id, integration_name, provider, account_id,
          account_email, account_name, account_avatar, access_token, refresh_token,
          token_expires_at, scopes, is_enabled, is_active, settings, metadata
        ) VALUES (
          ${integration.user_id}, ${integration.integration_id}, ${integration.integration_name},
          ${integration.provider}, ${integration.account_id}, ${integration.account_email || null},
          ${integration.account_name || null}, ${integration.account_avatar || null},
          ${integration.access_token || null}, ${integration.refresh_token || null},
          ${integration.token_expires_at || null}, ${integration.scopes}, ${integration.is_enabled},
          ${integration.is_active}, ${JSON.stringify(integration.settings)}, ${JSON.stringify(integration.metadata)}
        )
        ON CONFLICT (user_id, provider, account_id) 
        WHERE is_active = true
        DO UPDATE SET
          integration_name = EXCLUDED.integration_name,
          account_email = EXCLUDED.account_email,
          account_name = EXCLUDED.account_name,
          account_avatar = EXCLUDED.account_avatar,
          access_token = EXCLUDED.access_token,
          refresh_token = EXCLUDED.refresh_token,
          token_expires_at = EXCLUDED.token_expires_at,
          scopes = EXCLUDED.scopes,
          is_enabled = EXCLUDED.is_enabled,
          settings = EXCLUDED.settings,
          metadata = EXCLUDED.metadata,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id;
      `

      return result.rows[0].id
    } catch (error) {
      console.error("Error saving integration:", error)
      throw error
    }
  }

  // Get all active integrations for a user
  async getUserIntegrations(userId: string): Promise<Integration[]> {
    try {
      const result = await sql`
        SELECT * FROM integrations 
        WHERE user_id = ${userId} AND is_active = true
        ORDER BY updated_at DESC;
      `

      return result.rows.map((row) => ({
        ...row,
        scopes: row.scopes || [],
        settings: row.settings || {},
        metadata: row.metadata || {},
        token_expires_at: row.token_expires_at ? new Date(row.token_expires_at) : undefined,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
      })) as Integration[]
    } catch (error) {
      console.error("Error fetching user integrations:", error)
      return []
    }
  }

  // Get integration by provider and account
  async getIntegrationByProvider(userId: string, provider: string, accountId: string): Promise<Integration | null> {
    try {
      const result = await sql`
        SELECT * FROM integrations 
        WHERE user_id = ${userId} AND provider = ${provider} AND account_id = ${accountId} AND is_active = true
        LIMIT 1;
      `

      if (result.rows.length === 0) return null

      const row = result.rows[0]
      return {
        ...row,
        scopes: row.scopes || [],
        settings: row.settings || {},
        metadata: row.metadata || {},
        token_expires_at: row.token_expires_at ? new Date(row.token_expires_at) : undefined,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
      } as Integration
    } catch (error) {
      console.error("Error finding integration by provider:", error)
      return null
    }
  }

  // Update integration
  async updateIntegration(integrationId: string, updates: Partial<Integration>): Promise<void> {
    try {
      const setClause = []
      const values = []
      let paramIndex = 1

      if (updates.integration_name !== undefined) {
        setClause.push(`integration_name = $${paramIndex++}`)
        values.push(updates.integration_name)
      }
      if (updates.account_email !== undefined) {
        setClause.push(`account_email = $${paramIndex++}`)
        values.push(updates.account_email)
      }
      if (updates.account_name !== undefined) {
        setClause.push(`account_name = $${paramIndex++}`)
        values.push(updates.account_name)
      }
      if (updates.account_avatar !== undefined) {
        setClause.push(`account_avatar = $${paramIndex++}`)
        values.push(updates.account_avatar)
      }
      if (updates.access_token !== undefined) {
        setClause.push(`access_token = $${paramIndex++}`)
        values.push(updates.access_token)
      }
      if (updates.refresh_token !== undefined) {
        setClause.push(`refresh_token = $${paramIndex++}`)
        values.push(updates.refresh_token)
      }
      if (updates.token_expires_at !== undefined) {
        setClause.push(`token_expires_at = $${paramIndex++}`)
        values.push(updates.token_expires_at)
      }
      if (updates.scopes !== undefined) {
        setClause.push(`scopes = $${paramIndex++}`)
        values.push(updates.scopes)
      }
      if (updates.is_enabled !== undefined) {
        setClause.push(`is_enabled = $${paramIndex++}`)
        values.push(updates.is_enabled)
      }
      if (updates.is_active !== undefined) {
        setClause.push(`is_active = $${paramIndex++}`)
        values.push(updates.is_active)
      }
      if (updates.settings !== undefined) {
        setClause.push(`settings = $${paramIndex++}`)
        values.push(JSON.stringify(updates.settings))
      }
      if (updates.metadata !== undefined) {
        setClause.push(`metadata = $${paramIndex++}`)
        values.push(JSON.stringify(updates.metadata))
      }

      if (setClause.length === 0) return

      setClause.push("updated_at = CURRENT_TIMESTAMP")

      await sql.query(`UPDATE integrations SET ${setClause.join(", ")} WHERE id = $${paramIndex}`, [
        ...values,
        integrationId,
      ])
    } catch (error) {
      console.error("Error updating integration:", error)
      throw error
    }
  }

  // Soft delete integration
  async deleteIntegration(integrationId: string): Promise<void> {
    try {
      await sql`
        UPDATE integrations 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${integrationId};
      `
    } catch (error) {
      console.error("Error deleting integration:", error)
      throw error
    }
  }

  // Get integration statistics
  async getIntegrationStats(userId: string): Promise<{
    total: number
    active: number
    byProvider: Record<string, number>
    recentlyUsed: Integration[]
  }> {
    try {
      // Get total and active counts
      const countResult = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN is_enabled = true THEN 1 END) as active
        FROM integrations 
        WHERE user_id = ${userId} AND is_active = true;
      `

      // Get provider breakdown
      const providerResult = await sql`
        SELECT provider, COUNT(*) as count
        FROM integrations 
        WHERE user_id = ${userId} AND is_active = true
        GROUP BY provider;
      `

      // Get recently used integrations
      const recentResult = await sql`
        SELECT * FROM integrations 
        WHERE user_id = ${userId} AND is_active = true 
          AND metadata->>'lastUsedAt' IS NOT NULL
        ORDER BY (metadata->>'lastUsedAt')::timestamp DESC
        LIMIT 5;
      `

      const byProvider = providerResult.rows.reduce(
        (acc, row) => {
          acc[row.provider] = Number.parseInt(row.count)
          return acc
        },
        {} as Record<string, number>,
      )

      const recentlyUsed = recentResult.rows.map((row) => ({
        ...row,
        scopes: row.scopes || [],
        settings: row.settings || {},
        metadata: row.metadata || {},
        token_expires_at: row.token_expires_at ? new Date(row.token_expires_at) : undefined,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
      })) as Integration[]

      return {
        total: Number.parseInt(countResult.rows[0].total),
        active: Number.parseInt(countResult.rows[0].active),
        byProvider,
        recentlyUsed,
      }
    } catch (error) {
      console.error("Error getting integration stats:", error)
      return { total: 0, active: 0, byProvider: {}, recentlyUsed: [] }
    }
  }

  // Log integration usage
  async logIntegrationUsage(
    userId: string,
    integrationId: string,
    action: string,
    details: Record<string, any> = {},
  ): Promise<void> {
    try {
      await sql`
        INSERT INTO integration_usage_logs (user_id, integration_id, action, details)
        VALUES (${userId}, ${integrationId}, ${action}, ${JSON.stringify(details)});
      `
    } catch (error) {
      console.error("Error logging integration usage:", error)
    }
  }

  // Save/update user session
  async saveUserSession(userId: string, sessionData: Record<string, any>): Promise<void> {
    try {
      await sql`
        INSERT INTO integration_sessions (user_id, session_data)
        VALUES (${userId}, ${JSON.stringify(sessionData)})
        ON CONFLICT (user_id)
        DO UPDATE SET
          session_data = EXCLUDED.session_data,
          updated_at = CURRENT_TIMESTAMP;
      `
    } catch (error) {
      console.error("Error saving user session:", error)
      throw error
    }
  }

  // Get user session
  async getUserSession(userId: string): Promise<IntegrationSession | null> {
    try {
      const result = await sql`
        SELECT * FROM integration_sessions 
        WHERE user_id = ${userId}
        LIMIT 1;
      `

      if (result.rows.length === 0) return null

      const row = result.rows[0]
      return {
        ...row,
        session_data: row.session_data || {},
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
      } as IntegrationSession
    } catch (error) {
      console.error("Error getting user session:", error)
      return null
    }
  }
}

export const postgresService = new PostgresIntegrationService()
