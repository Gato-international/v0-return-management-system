import { requireAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getBannerSettings } from "@/app/actions/settings"
import { BannerSettingsForm } from "./banner-form"

export default async function AdminSettingsPage() {
  await requireAuth()
  const { settings } = await getBannerSettings()

  return (
    <>
      <div className="border-b border-neutral-200 bg-white">
        <div className="px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Settings</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage global site features and configuration</p>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6">
        <Card className="border-neutral-200 bg-white max-w-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Site Notifications</CardTitle>
            <CardDescription>Display a site-wide notification as a banner or popup to all visitors.</CardDescription>
          </CardHeader>
          <CardContent>
            <BannerSettingsForm initialSettings={settings} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}