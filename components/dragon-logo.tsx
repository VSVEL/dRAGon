import { cn } from "@/lib/utils"

interface DragonLogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "simple"
}

export function DragonLogo({ className, size = "md", variant = "default" }: DragonLogoProps) {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
    xl: "h-12 w-12",
  }

  if (variant === "simple") {
    return (
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn(sizes[size], className)}>
        <path
          d="M18 3C9.716 3 3 9.716 3 18C3 26.284 9.716 33 18 33C26.284 33 33 26.284 33 18C33 9.716 26.284 3 18 3Z"
          fill="#4F46E5"
        />
        <path
          d="M24.5 11.5C24.5 11.5 22 13 21 14C20 15 19.5 16 19.5 16L16 14.5L13 16L12 18.5L14.5 21L13 24.5L15.5 26L18.5 25L21 26L23 24.5L24.5 21.5L23 19L24.5 17V14.5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16.5" cy="15.5" r="1" fill="white" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn(sizes[size], className)}>
      <path
        d="M18 3C9.716 3 3 9.716 3 18C3 26.284 9.716 33 18 33C26.284 33 33 26.284 33 18C33 9.716 26.284 3 18 3Z"
        fill="url(#dragon_gradient)"
      />
      <path
        d="M24.5 11.5C24.5 11.5 22 13 21 14C20 15 19.5 16 19.5 16L16 14.5L13 16L12 18.5L14.5 21L13 24.5L15.5 26L18.5 25L21 26L23 24.5L24.5 21.5L23 19L24.5 17V14.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16.5" cy="15.5" r="1" fill="white" />
      <path
        d="M27 12C27 12 25 13.5 24.5 14.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="dragon_gradient" x1="3" y1="3" x2="33" y2="33" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#4338CA" />
        </linearGradient>
      </defs>
    </svg>
  )
}
