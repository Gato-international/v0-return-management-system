import { requireAuth } from "@/lib/auth"
import { getAttributesWithOptions } from "@/app/actions/attributes"
import { VariationsClientPage } from "./client-page"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default async function ManageVariationsPage() {
  await requireAuth()
  const { attributes, error } = await getAttributesWithOptions()

  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Manage Variations</CardTitle>
          <CardDescription>
            Define reusable attributes (like Color, Size) and their options to ensure consistency across products.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
  )
}