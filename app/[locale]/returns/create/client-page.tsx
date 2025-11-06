"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReturnForm } from "@/components/returns/return-form"
import { Package, HelpCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ReturnFormTour } from "@/components/returns/return-form-tour"
import type { CallBackProps } from "react-joyride"
import { useTranslations } from "next-intl"
import { LocaleSwitcher } from "@/components/locale-switcher"

interface Product {
  id: string
  name: string
  sku: string
  variations: any[]
}

interface CreateReturnClientPageProps {
  products: Product[]
}

export function CreateReturnClientPage({ products }: CreateReturnClientPageProps) {
  const [runTour, setRunTour] = useState(false)
  const t = useTranslations("CreateReturnPage")

  const handleTourCallback = (data: CallBackProps) => {
    const { status } = data
    const finishedStatuses: string[] = ["finished", "skipped"]

    if (finishedStatuses.includes(status)) {
      setRunTour(false)
    }
  }

  return (
    <>
      <ReturnFormTour run={runTour} callback={handleTourCallback} />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              <h1 className="text-xl font-semibold">{t("header")}</h1>
            </Link>
            <div className="flex items-center gap-2">
              <LocaleSwitcher />
              <Button variant="outline" size="sm" onClick={() => setRunTour(true)}>
                <HelpCircle className="h-4 w-4 mr-2" />
                {t("takeTour")}
              </Button>
              <Link href="/returns/track">
                <Button variant="ghost" size="sm">
                  {t("trackReturn")}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("title")}</CardTitle>
              <CardDescription>{t("description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ReturnForm availableProducts={products || []} />
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  )
}