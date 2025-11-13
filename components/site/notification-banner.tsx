"use client"

import { useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { X, Megaphone } from "lucide-react"

const bannerVariants = cva(
  "relative w-full p-3 text-sm flex items-center justify-center gap-3",
  {
    variants: {
      colorScheme: {
        info: "bg-blue-500 text-white",
        success: "bg-green-600 text-white",
        warning: "bg-yellow-500 text-black",
        danger: "bg-red-600 text-white",
      },
    },
    defaultVariants: {
      colorScheme: "info",
    },
  }
)

interface NotificationBannerProps extends VariantProps<typeof bannerVariants> {
  message: string
}

export function NotificationBanner({ message, colorScheme }: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) {
    return null
  }

  return (
    <div className={cn(bannerVariants({ colorScheme }))}>
      <Megaphone className="h-4 w-4 shrink-0" />
      <p>{message}</p>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}