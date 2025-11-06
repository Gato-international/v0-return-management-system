import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { Toaster } from "@/components/ui/toaster"
import "../globals.css"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"

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
  params,
}: {
  children: React.ReactNode
  params: any // Using 'any' to resolve conflicting type information from the Next.js runtime.
}) {
  // The Next.js runtime is treating `params` as a Promise. We must `await` it.
  const resolvedParams = await params
  const { locale } = resolvedParams

  const messages = await getMessages()

  return (
    <html lang={locale} className={`${inter.variable} ${playfairDisplay.variable}`}>
      <body className={`font-sans antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}