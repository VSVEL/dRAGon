"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, AlertCircle, Info, Settings, RefreshCw } from "lucide-react"
import { useSession } from "next-auth/react"

interface EmailQuota {
  dailyLimit: number
  currentUsage: number
  remaining: number
  resetTime: string
}

interface EmailConfig {
  maxResults: number
  query: string
  includeSpam: boolean
  includeTrash: boolean
}

export function EmailLimitsInfo() {
  const { data: session } = useSession()
  const [quota, setQuota] = useState<EmailQuota | null>(null)
  const [config, setConfig] = useState<EmailConfig>({
    maxResults: 20,
    query: "in:inbox",
    includeSpam: false,
    includeTrash: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)

  const fetchQuotaInfo = async () => {
    // Note: Gmail API doesn't provide quota info directly
    // This is simulated based on known limits
    setQuota({
      dailyLimit: 1000000000, // 1 billion quota units per day
      currentUsage: 0, // Would need to track this
      remaining: 1000000000,
      resetTime: "24:00:00",
    })
  }

  const testEmailFetch = async () => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams({
        maxResults: config.maxResults.toString(),
        query: config.query,
        includeSpam: config.includeSpam.toString(),
        includeTrash: config.includeTrash.toString(),
      })

      const response = await fetch(`/api/emails?${queryParams}`)
      const data = await response.json()

      setTestResults({
        status: response.status,
        emailCount: data.emails?.length || 0,
        totalAvailable: data.totalAvailable || "Unknown",
        query: config.query,
        executionTime: Date.now(),
      })
    } catch (error) {
      setTestResults({
        error: error.message,
        executionTime: Date.now(),
      })
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (session) {
      fetchQuotaInfo()
    }
  }, [session])

  return (
    <div className="space-y-6">
      {/* Gmail API Limits Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Gmail API Limits & Quotas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">1B</div>
              <div className="text-sm text-gray-600">Quota Units/Day</div>
              <div className="text-xs text-gray-500 mt-1">Gmail API Daily Limit</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">250</div>
              <div className="text-sm text-gray-600">Quota Units/Request</div>
              <div className="text-xs text-gray-500 mt-1">Per Email Fetch</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">4M</div>
              <div className="text-sm text-gray-600">Emails/Day</div>
              <div className="text-xs text-gray-500 mt-1">Theoretical Maximum</div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Gmail API Quota Information:</p>
                <ul className="mt-2 space-y-1 text-yellow-700">
                  <li>
                    • <strong>Daily Limit:</strong> 1 billion quota units per day
                  </li>
                  <li>
                    • <strong>Per Request:</strong> ~250 quota units per email fetch
                  </li>
                  <li>
                    • <strong>Rate Limit:</strong> 250 quota units per user per second
                  </li>
                  <li>
                    • <strong>Practical Limit:</strong> ~4 million emails per day (if only reading emails)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Fetch Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Fetch Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxResults">Max Emails to Fetch</Label>
              <Select
                value={config.maxResults.toString()}
                onValueChange={(value) => setConfig({ ...config, maxResults: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 emails</SelectItem>
                  <SelectItem value="20">20 emails</SelectItem>
                  <SelectItem value="50">50 emails</SelectItem>
                  <SelectItem value="100">100 emails</SelectItem>
                  <SelectItem value="500">500 emails</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="query">Gmail Search Query</Label>
              <Select value={config.query} onValueChange={(value) => setConfig({ ...config, query: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in:inbox">Inbox only</SelectItem>
                  <SelectItem value="is:unread">Unread emails</SelectItem>
                  <SelectItem value="is:important">Important emails</SelectItem>
                  <SelectItem value="in:inbox is:unread">Unread in inbox</SelectItem>
                  <SelectItem value="from:me">Sent emails</SelectItem>
                  <SelectItem value="has:attachment">With attachments</SelectItem>
                  <SelectItem value="all">All emails</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={testEmailFetch} disabled={isLoading || !session}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Test Email Fetch
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">Error:</span>
                </div>
                <p className="text-red-700 mt-1">{testResults.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{testResults.emailCount}</div>
                    <div className="text-sm text-gray-600">Emails Retrieved</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{testResults.status}</div>
                    <div className="text-sm text-gray-600">HTTP Status</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">{testResults.emailCount * 250}</div>
                    <div className="text-sm text-gray-600">Quota Units Used</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Query Details:</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Search Query:</strong> {testResults.query}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Execution Time:</strong> {new Date(testResults.executionTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices for Email Reading</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-green-600">✅ Recommended</h4>
                <ul className="text-sm space-y-2">
                  <li>• Start with 10-20 emails for testing</li>
                  <li>• Use specific queries (e.g., "is:unread")</li>
                  <li>• Focus on recent emails first</li>
                  <li>• Implement pagination for large datasets</li>
                  <li>• Cache results to reduce API calls</li>
                  <li>• Use webhooks for real-time updates</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-red-600">❌ Avoid</h4>
                <ul className="text-sm space-y-2">
                  <li>• Fetching all emails at once</li>
                  <li>• Repeated calls for same data</li>
                  <li>• Ignoring quota limits</li>
                  <li>• Fetching full email content unnecessarily</li>
                  <li>• Not handling rate limits</li>
                  <li>• Storing sensitive email content</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
