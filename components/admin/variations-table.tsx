"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { deleteVariationAction } from "@/app/actions/variations"
import { VariationForm } from "./variation-form"

interface Variation {
  id: string
  sku: string
  color: string | null
  size: string | null
}

interface VariationsTableProps {
  productId: string
  variations: Variation[]
}

export function VariationsTable({ productId, variations }: VariationsTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [variationToDelete, setVariationToDelete] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [variationToEdit, setVariationToEdit] = useState<Variation | null>(null)
  const { toast } = useToast()

  const handleDeleteClick = (variationId: string) => {
    setVariationToDelete(variationId)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (variationToDelete) {
      const result = await deleteVariationAction(variationToDelete, productId)
      if (result.success) {
        toast({ title: "Success", description: "Variation deleted." })
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
      setIsDeleteDialogOpen(false)
    }
  }

  const handleEditClick = (variation: Variation) => {
    setVariationToEdit(variation)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">No variations found.</TableCell>
              </TableRow>
            ) : (
              variations.map((variation) => (
                <TableRow key={variation.id}>
                  <TableCell className="font-medium">{variation.sku}</TableCell>
                  <TableCell>{variation.color || "N/A"}</TableCell>
                  <TableCell>{variation.size || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(variation)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(variation.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the product variation.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Variation</DialogTitle>
          </DialogHeader>
          {variationToEdit && (
            <VariationForm
              productId={productId}
              initialData={variationToEdit}
              onSuccess={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}