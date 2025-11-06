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
import { useToast } from "@/hooks/use-toast"
import { AlertCircle } from "lucide-react"
import { createVariationAction, updateVariationAction } from "@/app/actions/variations"

const variationSchema = z.object({
  sku: z.string().min(1, "SKU is required.").regex(/^[A-Z0-9-]+$/, "SKU must be uppercase letters, numbers, or hyphens."),
  color: z.string().optional(),
  size: z.string().optional(),
})

type VariationFormData = z.infer<typeof variationSchema>

interface VariationFormProps {
  productId: string
  initialData?: { id: string; sku: string; color?: string | null; size?: string | null }
  onSuccess?: () => void
}

export function VariationForm({ productId, initialData, onSuccess }: VariationFormProps) {
  const { toast } = useToast()
  const isEditMode = !!initialData

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VariationFormData>({
    resolver: zodResolver(variationSchema),
    defaultValues: {
      sku: initialData?.sku || "",
      color: initialData?.color || "",
      size: initialData?.size || "",
    },
  })

  useEffect(() => {
    reset(initialData || { sku: "", color: "", size: "" })
  }, [initialData, reset])

  const onSubmit = async (data: VariationFormData) => {
    try {
      const result = isEditMode
        ? await updateVariationAction(initialData.id, productId, data)
        : await createVariationAction(productId, data)

      if (result.success) {
        toast({
          title: "Success!",
          description: `Variation has been successfully ${isEditMode ? "updated" : "created"}.`,
        })
        onSuccess?.()
        if (!isEditMode) reset()
      } else if (result.error) {
        Object.entries(result.error).forEach(([key, value]) => {
          setError(key as keyof VariationFormData | "root.serverError", {
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
        <Label htmlFor="sku">Variation SKU *</Label>
        <Input id="sku" {...register("sku")} disabled={isSubmitting} />
        {errors.sku && <p className="text-sm text-destructive mt-1">{errors.sku.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input id="color" {...register("color")} disabled={isSubmitting} />
          {errors.color && <p className="text-sm text-destructive mt-1">{errors.color.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Input id="size" {...register("size")} disabled={isSubmitting} />
          {errors.size && <p className="text-sm text-destructive mt-1">{errors.size.message}</p>}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
        {isEditMode ? "Update Variation" : "Create Variation"}
      </Button>
    </form>
  )
}