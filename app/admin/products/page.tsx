import { requireAuth } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ProductsTable } from "@/components/admin/products-table"
import { ProductForm } from "@/components/admin/product-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getProductsAction } from "@/app/actions/products"
import { getAttributesWithOptions } from "@/app/actions/attributes"

export default async function AdminProductsPage() {
  await requireAuth()

  const [{ products, error: productsError }, { attributes, error: attributesError }] = await Promise.all([
    getProductsAction(),
    getAttributesWithOptions(),
  ])

  return (
    <>
      <div className="border-b border-neutral-200 bg-white">
        <div className="px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Products</h1>
            <p className="text-sm text-neutral-500 mt-1">Manage products available for return requests</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-black hover:bg-neutral-800 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
              </DialogHeader>
              <ProductForm allAttributes={attributes || []} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6">
        <Card className="border-neutral-200 bg-white">
          <CardContent className="p-5">
            <ProductsTable products={products || []} allAttributes={attributes || []} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}