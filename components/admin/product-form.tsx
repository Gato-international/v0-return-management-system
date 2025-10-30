"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { createProductAction, updateProductAction } from "@/app/actions/products"
import { AlertCircle, CheckCircle } from "lucide-react"

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required").regex(/^[A-Z0-9-]+$/, "SKU can only contain uppercase letters, numbers, and hyphens"),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  initialData?: {
    id: string
    name: string
    sku: string
  }
  onSuccess?: () => void
}

export function ProductForm({ initialData, onSuccess }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      sku: initialData?.sku || "",
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        sku: initialData.sku,
      })
    } else {
      reset({
        name: "",
        sku: "",
      })
    }
  }, [initialData, reset])

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let result
      if (initialData?.id) {
        result = await updateProductAction(initialData.id, data)
      } else {
        result = await createProductAction(data)
      }

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(`Product ${initialData ? "updated" : "created"} successfully!`)
        if (!initialData) {
          reset({
            name: "",
            sku: "",
          })
        }
        onSuccess?.()
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {success && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input id="name" type="text" {...register("name")} disabled={isLoading} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sku">SKU *</Label>
        <Input id="sku" type="text" {...register("sku")} disabled={isLoading} />
        {errors.sku && <p className="text-sm text-destructive">{errors.sku.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            {initialData ? "Saving..." : "Creating..."}
          </>
        ) : (
          initialData ? "Update Product" : "Create Product"
        )}
      </Button>
    </form>
  )
}