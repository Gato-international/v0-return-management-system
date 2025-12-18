import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"
import { getBannerSettings } from "./actions/settings"
import { NotificationBanner } from "@/components/site/notification-banner"
import { NotificationPopup } from "@/components/site/notification-popup"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "700",
})

export const metadata: Metadata = {
  title: "Return Management System",
  description: "Professional B2B return management platform",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { settings: notificationSettings } = await getBannerSettings()

  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <body className={`font-sans antialiased`}>
        {notificationSettings?.is_active && notificationSettings.display_type === "banner" && (
          <NotificationBanner
            message={notificationSettings.message}
            colorScheme={notificationSettings.color_scheme as any}
          />
        )}
        {notificationSettings?.is_active && notificationSettings.display_type === "popup" && (
          <NotificationPopup
            message={notificationSettings.message}
            colorScheme={notificationSettings.color_scheme as any}
            notificationId={`notification-${notificationSettings.id || 1}`}
            imageUrl={notificationSettings.image_url}
          />
        )}
        {children}
        <Toaster />
        <Analytics />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7YX9DGRHTZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-7YX9DGRHTZ');
          `}
        </Script>
      </body>
    </html>
  )
}