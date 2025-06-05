"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Code, TrendingUp } from "lucide-react"

interface GitHubStatsProps {
  userStats: any
}

export function GitHubStats({ userStats }: GitHubStatsProps) {
  const topLanguages = Object.entries(userStats.languages || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)

  const totalLanguageRepos = Object.values(userStats.languages || {}).reduce(
    (sum: number, count) => sum + (count as number),
    0,
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Developer Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userStats.publicRepos}</div>
              <div className="text-sm text-gray-600">Public Repos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{userStats.privateRepos}</div>
              <div className="text-sm text-gray-600">Private Repos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{userStats.totalStars}</div>
              <div className="text-sm text-gray-600">Total Stars</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{userStats.totalForks}</div>
              <div className="text-sm text-gray-600">Total Forks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Top Languages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topLanguages.map(([language, count]) => {
            const percentage = totalLanguageRepos > 0 ? ((count as number) / totalLanguageRepos) * 100 : 0
            return (
              <div key={language} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{language}</span>
                  <Badge variant="outline">{count} repos</Badge>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Social Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{userStats.followers}</div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{userStats.following}</div>
              <div className="text-sm text-gray-600">Following</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
