"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle } from "lucide-react"
import { createVariationAction, updateVariationAction } from "@/app/actions/variations"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const variationSchema = z.object({
  color: z.string().optional(),
  size: z.string().optional(),
}).refine(data => data.color || data.size, {
  message: "At least one variation attribute is required.",
  path: ["_form"],
})

type VariationFormData = z.infer<typeof variationSchema>

interface Option {
  id: string
  value: string
}
interface Attribute {
  id: string
  name: string
  options: Option[]
}
interface VariationFormProps {
  productId: string
  productAttributes: Attribute[]
  initialData?: { id: string; color?: string | null; size?: string | null }
  onSuccess?: () => void
}

export function VariationForm({ productId, productAttributes, initialData, onSuccess }: VariationFormProps) {
  const { toast } = useToast()
  const isEditMode = !!initialData

  const {
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VariationFormData>({
    resolver: zodResolver(variationSchema),
    defaultValues: {
      color: initialData?.color || "",
      size: initialData?.size || "",
    },
  })

  useEffect(() => {
    reset(initialData || { color: "", size: "" })
  }, [initialData, reset])

  const onSubmit = async (data: VariationFormData) => {
    try {
      const result = isEditMode
        ? await updateVariationAction(initialData!.id, productId, data)
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
      {errors._form && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors._form.message}</AlertDescription>
        </Alert>
      )}

      {productAttributes.map(attr => (
        <div key={attr.id} className="space-y-2">
          <Label>{attr.name}</Label>
          <Select
            onValueChange={(value) => setValue(attr.name.toLowerCase() as "color" | "size", value)}
            defaultValue={isEditMode ? (initialData?.[attr.name.toLowerCase() as "color" | "size"] || "") : ""}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${attr.name}`} />
            </SelectTrigger>
            <SelectContent>
              {attr.options.map(opt => (
                <SelectItem key={opt.id} value={opt.value}>{opt.value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
        {isEditMode ? "Update Variation" : "Create Variation"}
      </Button>
    </form>
  )
}