"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteProductAction } from "@/app/actions/products"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Attribute {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  sku: string
  created_at: string
  attributes: { attribute_id: string }[]
}

interface ProductsTableProps {
  products: Product[]
  allAttributes: Attribute[]
}

export function ProductsTable({ products, allAttributes }: ProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  const filteredProducts = products.filter((product) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    return (
      product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      product.sku.toLowerCase().includes(lowerCaseSearchTerm)
    )
  })

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      const result = await deleteProductAction(productToDelete)
      if (result.success) {
        toast({
          title: "Success",
          description: "Product deleted successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete product.",
          variant: "destructive",
        })
      }
      setProductToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/products/${product.id}`} className="hover:underline">
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(product.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredProducts.length} of {products.length} products
      </p>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the product.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}