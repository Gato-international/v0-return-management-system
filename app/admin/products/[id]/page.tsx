import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { VariationForm } from "@/components/admin/variation-form"
import { VariationsTable } from "@/components/admin/variations-table"

interface PageProps {
  params: any
}

export default async function ManageProductVariationsPage({ params }: PageProps) {
  await requireAuth()
  const resolvedParams = await params
  const { id } = resolvedParams
  const supabase = await createClient()

  // Step 1: Fetch the product and its linked attribute IDs
  const { data: product, error: productError } = await supabase
    .from("products")
    .select(`
      *,
      variations:product_variations(*),
      attributes:product_to_variation_attributes(attribute_id)
    `)
    .eq("id", id)
    .single()

  if (productError || !product) {
    console.error("Error fetching product for variations page:", productError)
    notFound()
  }

  const attributeIds = product.attributes.map((a: any) => a.attribute_id)
  let productAttributes: any[] = []

  // Step 2: If there are linked attributes, fetch their full details
  if (attributeIds.length > 0) {
    const { data: attributes, error: attributesError } = await supabase
      .from("variation_attributes")
      .select("*, options:variation_options(*)")
      .in("id", attributeIds)
      .order("name")

    if (attributesError) {
      console.error("Error fetching product attributes:", attributesError)
      // Fallback to empty array, form will be empty but page won't crash
    } else {
      productAttributes = attributes || []
    }
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">Manage Variations</h1>
            <p className="text-sm text-muted-foreground">
              {product.name} (SKU: {product.sku})
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Variation</CardTitle>
              <CardDescription>Create a new variant for this product.</CardDescription>
            </CardHeader>
            <CardContent>
              <VariationForm
                productId={product.id}
                productAttributes={productAttributes}
              />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Existing Variations</CardTitle>
              <CardDescription>Edit or delete existing variations.</CardDescription>
            </CardHeader>
            <CardContent>
              <VariationsTable
                productId={product.id}
                variations={product.variations || []}
                productAttributes={productAttributes}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}