export interface UserAccount {
  id: string
  userId: string
  provider: "google" | "github" | "slack" | "microsoft"
  providerAccountId: string
  accountEmail: string
  accountName: string
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  scopes: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserIntegration {
  id: string
  userId: string
  accountId: string
  integrationId: string
  isEnabled: boolean
  settings: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  theme: "light" | "dark" | "system"
  notificationsEnabled: boolean
}

export interface User {
  id: string
  email: string
  name: string
  image?: string
  primaryAccountId: string
  preferences: UserPreferences
  createdAt: Date
  updatedAt: Date
}
