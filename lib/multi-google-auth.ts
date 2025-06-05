interface GoogleAccount {
  id: string
  email: string
  name: string
  picture?: string
  accessToken: string
  refreshToken?: string
  isActive: boolean
  isPrimary: boolean
  connectedAt: Date
  lastUsed?: Date
}

export class MultiGoogleAuthManager {
  private static instance: MultiGoogleAuthManager
  private accounts: Map<string, GoogleAccount> = new Map()

  static getInstance(): MultiGoogleAuthManager {
    if (!MultiGoogleAuthManager.instance) {
      MultiGoogleAuthManager.instance = new MultiGoogleAuthManager()
    }
    return MultiGoogleAuthManager.instance
  }

  async loadAccounts(userId: string): Promise<void> {
    try {
      const stored = localStorage.getItem(`google_accounts_${userId}`)
      if (stored) {
        const accounts: GoogleAccount[] = JSON.parse(stored)
        accounts.forEach((account) => {
          this.accounts.set(account.email, account)
        })
      }
    } catch (error) {
      console.error("Error loading Google accounts:", error)
    }
  }

  async saveAccounts(userId: string): Promise<void> {
    try {
      const accounts = Array.from(this.accounts.values())
      localStorage.setItem(`google_accounts_${userId}`, JSON.stringify(accounts))
    } catch (error) {
      console.error("Error saving Google accounts:", error)
    }
  }

  addAccount(account: GoogleAccount, userId: string): void {
    this.accounts.set(account.email, account)
    this.saveAccounts(userId)
  }

  removeAccount(email: string, userId: string): void {
    this.accounts.delete(email)
    this.saveAccounts(userId)
  }

  getAccount(email: string): GoogleAccount | undefined {
    return this.accounts.get(email)
  }

  getAllAccounts(): GoogleAccount[] {
    return Array.from(this.accounts.values())
  }

  getActiveAccounts(): GoogleAccount[] {
    return this.getAllAccounts().filter((account) => account.isActive)
  }

  setPrimaryAccount(email: string, userId: string): void {
    // Remove primary flag from all accounts
    this.accounts.forEach((account) => {
      account.isPrimary = false
    })

    // Set new primary account
    const account = this.accounts.get(email)
    if (account) {
      account.isPrimary = true
      this.saveAccounts(userId)
    }
  }

  getPrimaryAccount(): GoogleAccount | undefined {
    return this.getAllAccounts().find((account) => account.isPrimary)
  }

  toggleAccount(email: string, isActive: boolean, userId: string): void {
    const account = this.accounts.get(email)
    if (account) {
      account.isActive = isActive
      account.lastUsed = new Date()
      this.saveAccounts(userId)
    }
  }
}
