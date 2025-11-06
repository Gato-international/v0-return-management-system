"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
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
  attributeIds: z.array(z.string().uuid()).default([]),
})

type ProductFormData = z.infer<typeof productSchema>

interface Attribute {
  id: string
  name: string
}

interface ProductFormProps {
  initialData?: {
    id: string
    name: string
    sku: string
    attributes: { attribute_id: string }[]
  }
  allAttributes: Attribute[]
  onSuccess?: () => void
}

export function ProductForm({ initialData, allAttributes, onSuccess }: ProductFormProps) {
  const { toast } = useToast()
  const isEditMode = !!initialData

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      sku: initialData?.sku || "",
      attributeIds: initialData?.attributes.map(a => a.attribute_id) || [],
    },
  })

  useEffect(() => {
    reset({
      name: initialData?.name || "",
      sku: initialData?.sku || "",
      attributeIds: initialData?.attributes.map(a => a.attribute_id) || [],
    })
  }, [initialData, reset])

  const onSubmit = async (data: ProductFormData) => {
    try {
      const result = isEditMode
        ? await updateProductAction(initialData!.id, data)
        : await createProductAction(data)

      if (result.success) {
        toast({
          title: "Success!",
          description: `Product has been successfully ${isEditMode ? "updated" : "created"}.`,
        })
        onSuccess?.()
        if (!isEditMode) reset()
      } else if (result.error) {
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
        message: "An unexpected error occurred.",
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
        <Label>Variation Attributes</Label>
        <div className="space-y-2 rounded-md border p-3">
          {allAttributes.length > 0 ? (
            <Controller
              name="attributeIds"
              control={control}
              render={({ field }) => (
                <>
                  {allAttributes.map(attr => (
                    <div key={attr.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`attr-${attr.id}`}
                        checked={field.value?.includes(attr.id)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...(field.value || []), attr.id])
                            : field.onChange(field.value?.filter((value) => value !== attr.id));
                        }}
                      />
                      <Label htmlFor={`attr-${attr.id}`} className="font-normal">{attr.name}</Label>
                    </div>
                  ))}
                </>
              )}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No attributes defined. Go to Manage Variations to add some.</p>
          )}
        </div>
        {errors.attributeIds && <p className="text-sm text-destructive mt-1">{errors.attributeIds.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
        {isEditMode ? "Update Product" : "Create Product"}
      </Button>
    </form>
  )
}