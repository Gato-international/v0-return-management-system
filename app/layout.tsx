import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"
import { getBannerSettings } from "./actions/settings"
import { NotificationBanner } from "@/components/site/notification-banner"
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
  const { settings: bannerSettings } = await getBannerSettings()

  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <body className={`font-sans antialiased`}>
        {bannerSettings?.is_active && (
          <NotificationBanner
            message={bannerSettings.message}
            colorScheme={bannerSettings.color_scheme as any}
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