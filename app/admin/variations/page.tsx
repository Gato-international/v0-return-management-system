import { requireAuth } from "@/lib/auth"
import { getAttributesWithOptions } from "@/app/actions/attributes"
import { VariationsClientPage } from "./client-page"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default async function ManageVariationsPage() {
  await requireAuth()
  const { attributes, error } = await getAttributesWithOptions()

  return (
    <>
      <div className="border-b border-neutral-200 bg-white">
        <div className="px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Variations</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Define reusable attributes and their options to ensure consistency across products
          </p>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6">
        <Card className="border-neutral-200 bg-white max-w-4xl">
          <CardContent className="p-5">
            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <VariationsClientPage initialAttributes={attributes || []} />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}