import { requireAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
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
              <h1 className="text-2xl font-bold">Product Management</h1>
              <p className="text-sm text-muted-foreground">Manage products available for return requests</p>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Product List</CardTitle>
              <CardDescription>All products available for return requests</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
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
          </CardHeader>
          <CardContent>
            <ProductsTable products={products || []} allAttributes={attributes || []} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}