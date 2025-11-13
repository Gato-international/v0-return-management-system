import { requireAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getBannerSettings } from "@/app/actions/settings"
import { BannerSettingsForm } from "./banner-form"

export default async function AdminSettingsPage() {
  await requireAuth()
  const { settings } = await getBannerSettings()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Site Settings</h1>
              <p className="text-sm text-muted-foreground">Manage global site features</p>
            </div>
          </div>
          <form action={logoutAction}>
            <Button variant="outline" type="submit">
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Notification Banner</CardTitle>
            <CardDescription>Display a site-wide banner at the top of the page.</CardDescription>
          </CardHeader>
          <CardContent>
            <BannerSettingsForm initialSettings={settings} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}