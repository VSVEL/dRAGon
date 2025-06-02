import { BasePlugin } from "./base-plugin"
import { GoogleAPIClient } from "../google-api"
import type { EmailData } from "../types"

export class GmailPlugin extends BasePlugin {
  id = "gmail"
  name = "Gmail"
  scopes = ["https://www.googleapis.com/auth/gmail.readonly"]

  isEnabled(): boolean {
    return true // Can be configured per user
  }

  async fetchData(accessToken: string): Promise<EmailData[]> {
    const client = new GoogleAPIClient(accessToken)
    return await client.fetchEmails()
  }

  formatForAI(emails: EmailData[]): string {
    if (!emails.length) return "No recent emails found."

    return `Recent emails (${emails.length} items):
${emails
  .map(
    (email) =>
      `- From: ${email.from}
  Subject: ${email.subject}
  Snippet: ${email.snippet}
  Status: ${email.unread ? "Unread" : "Read"}`,
  )
  .join("\n\n")}`
  }
}
