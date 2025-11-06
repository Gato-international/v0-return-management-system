"use client"

import { useEffect, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
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
  initialData?: { id: string; attributes: Record<string, string> }
  onSuccess?: () => void
}

export function VariationForm({ productId, productAttributes, initialData, onSuccess }: VariationFormProps) {
  const { toast } = useToast()
  const isEditMode = !!initialData

  const variationSchema = useMemo(() => {
    const attributesShape = productAttributes.reduce((shape, attr) => {
      shape[attr.name] = z.string().min(1, `Please select a ${attr.name}.`);
      return shape;
    }, {} as Record<string, z.ZodString>);

    return z.object({
      attributes: z.object(attributesShape),
    });
  }, [productAttributes]);

  type VariationFormData = z.infer<typeof variationSchema>;

  const {
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<VariationFormData>({
    resolver: zodResolver(variationSchema),
    defaultValues: {
      attributes: initialData?.attributes || {},
    },
  })

  useEffect(() => {
    reset({ attributes: initialData?.attributes || {} })
  }, [initialData, reset, productAttributes])

  const onSubmit = async (data: VariationFormData) => {
    try {
      const result = isEditMode
        ? await updateVariationAction(initialData!.id, productId, data)
        : await createVariationAction({ productId, ...data })

      if (result.success) {
        toast({
          title: "Success!",
          description: `Variation has been successfully ${isEditMode ? "updated" : "created"}.`,
        })
        onSuccess?.()
        if (!isEditMode) reset({ attributes: {} })
      } else if (result.error) {
        setError("root.serverError", {
          type: "server",
          message: result.error._form?.[0] || "An error occurred.",
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

      {productAttributes.map(attr => (
        <div key={attr.id} className="space-y-2">
          <Label>{attr.name} *</Label>
          <Controller
            name={`attributes.${attr.name}`}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${attr.name}`} />
                </SelectTrigger>
                <SelectContent>
                  {attr.options.map(opt => (
                    <SelectItem key={opt.id} value={opt.value}>{opt.value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.attributes?.[attr.name as keyof typeof errors.attributes] && (
            <p className="text-sm text-destructive mt-1">
              {errors.attributes[attr.name as keyof typeof errors.attributes]?.message}
            </p>
          )}
        </div>
      ))}

      <Button type="submit" className="w-full" disabled={isSubmitting || productAttributes.length === 0}>
        {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
        {isEditMode ? "Update Variation" : "Create Variation"}
      </Button>
    </form>
  )
}