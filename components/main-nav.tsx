"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Calendar, Mail, Github, Settings } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/calendar",
      label: "Calendar",
      icon: Calendar,
      active: pathname === "/calendar",
    },
    {
      href: "/email",
      label: "Email",
      icon: Mail,
      active: pathname === "/email",
    },
    {
      href: "/github",
      label: "GitHub",
      icon: Github,
      active: pathname === "/github",
    },
    {
      href: "/integrations",
      label: "Integrations",
      icon: Settings,
      active: pathname === "/integrations",
    },
  ]

  return (
    <nav className="flex items-center space-x-1">
      {routes.map((route) => (
        <Button
          key={route.href}
          variant={route.active ? "default" : "ghost"}
          size="sm"
          className={cn("justify-start", route.active && "bg-gray-900")}
          asChild
        >
          <Link href={route.href}>
            <route.icon className="h-4 w-4 mr-2" />
            {route.label}
          </Link>
        </Button>
      ))}
    </nav>
  )
}
