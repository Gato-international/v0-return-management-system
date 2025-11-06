import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { VariationForm } from "@/components/admin/variation-form"
import { VariationsTable } from "@/components/admin/variations-table"
import { ProductForm } from "@/components/admin/product-form"
import { getAttributesWithOptions } from "@/app/actions/attributes"

interface PageProps {
  params: any
}

export default async function EditProductPage({ params }: PageProps) {
  await requireAuth()
  const resolvedParams = await params
  const { id } = resolvedParams
  const supabase = createAdminClient()

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*, variations:product_variations(*), attributes:product_to_variation_attributes(attribute_id)")
    .eq("id", id)
    .single()

  if (productError || !product) {
    notFound()
  }

  const { attributes: allAttributes } = await getAttributesWithOptions()

  const attributeIds = product.attributes.map((a: any) => a.attribute_id)
  const productAttributes = allAttributes?.filter(attr => attributeIds.includes(attr.id)) || []

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
            <h1 className="text-xl font-bold">Edit Product</h1>
            <p className="text-sm text-muted-foreground">
              {product.name} (SKU: {product.sku})
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Edit name, SKU, and link variation attributes.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductForm initialData={product} allAttributes={allAttributes || []} />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Product Variations</CardTitle>
              <CardDescription>Manage the specific variations for this product.</CardDescription>
            </CardHeader>
            <CardContent>
              <VariationsTable
                productId={product.id}
                variations={product.variations || []}
                productAttributes={productAttributes}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Add New Variation</CardTitle>
              <CardDescription>Create a new variant using the linked attributes.</CardDescription>
            </CardHeader>
            <CardContent>
              {productAttributes.length > 0 ? (
                <VariationForm productId={product.id} productAttributes={productAttributes} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  This product has no variation attributes linked. Edit the product details to add attributes before creating variations.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}