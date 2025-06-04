import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/session-provider"
import { DebugPanel } from "@/components/debug-panel"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "dRAGon - AI Productivity Assistant",
  description: "Your context-aware AI productivity partner",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <DebugPanel />
        </SessionProvider>
      </body>
    </html>
  )
}
