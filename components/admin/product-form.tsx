"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { createProductAction, updateProductAction } from "@/app/actions/products"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters long."),
  sku: z.string().min(1, "SKU is required.").regex(/^[A-Z0-9-]+$/, "SKU must be uppercase letters, numbers, or hyphens."),
  has_color: z.boolean().optional(),
  has_size: z.boolean().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  initialData?: { id: string; name: string; sku: string; has_color: boolean; has_size: boolean }
  onSuccess?: () => void
}

export function ProductForm({ initialData, onSuccess }: ProductFormProps) {
  const { toast } = useToast()
  const isEditMode = !!initialData

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      sku: initialData?.sku || "",
      has_color: initialData?.has_color || false,
      has_size: initialData?.has_size || false,
    },
  })

  useEffect(() => {
    reset(initialData || { name: "", sku: "", has_color: false, has_size: false })
  }, [initialData, reset])

  const onSubmit = async (data: ProductFormData) => {
    try {
      const result = isEditMode
        ? await updateProductAction(initialData.id, data)
        : await createProductAction(data)

      if (result.success) {
        toast({
          title: "Success!",
          description: `Product has been successfully ${isEditMode ? "updated" : "created"}.`,
        })
        onSuccess?.()
        if (!isEditMode) {
          reset()
        }
      } else if (result.error) {
        // Handle specific field errors from the server
        Object.entries(result.error).forEach(([key, value]) => {
          setError(key as keyof ProductFormData | "root.serverError", {
            type: "server",
            message: Array.isArray(value) ? value.join(", ") : String(value),
          })
        })
      }
    } catch (e) {
      setError("root.serverError", {
        type: "server",
        message: "An unexpected error occurred. Please try again.",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errors.root?.serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.root.serverError.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input id="name" {...register("name")} disabled={isSubmitting} />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sku">SKU *</Label>
        <Input id="sku" {...register("sku")} disabled={isSubmitting} />
        {errors.sku && <p className="text-sm text-destructive mt-1">{errors.sku.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Variation Settings</Label>
        <div className="flex items-center space-x-4 rounded-md border p-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="has_color" {...register("has_color")} />
            <Label htmlFor="has_color" className="font-normal">Has Color Variations</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="has_size" {...register("has_size")} />
            <Label htmlFor="has_size" className="font-normal">Has Size Variations</Label>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            {isEditMode ? "Saving..." : "Creating..."}
          </>
        ) : isEditMode ? (
          "Update Product"
        ) : (
          "Create Product"
        )}
      </Button>
    </form>
  )
}