import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import Link from "next/link"
import { Github } from "./components/icons"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/github" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
            <Github className="h-4 w-4" />
            GitHub Dashboard
          </Link>
        </nav>
        {children}
      </body>
    </html>
  )
}
