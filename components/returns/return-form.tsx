"use client"

import { useState, useMemo } from "react"
import { useForm, useFieldArray, UseFormSetValue, UseFormRegister, FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { submitReturnAction } from "@/app/actions/returns"
import { CheckCircle, AlertCircle, Plus, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ImageUpload } from "@/components/returns/image-upload"
import { Textarea } from "../ui/textarea"

interface Variation {
  id: string
  sku: string
  color?: string | null
  size?: string | null
}
interface Product {
  id: string
  name: string
  sku: string
  variations: Variation[]
}

const returnItemSchema = z.object({
  productVariationId: z.string().min(1, "Please select a complete product variation."),
  quantity: z.number().min(1, "Quantity must be at least 1."),
  reason: z.enum(["DEFECTIVE", "WRONG_ITEM", "CHANGED_MIND", "NOT_AS_DESCRIBED", "OTHER"]),
  condition: z.string().optional(),
})

const returnSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().optional(),
  description: z.string().min(10, "Please provide at least 10 characters."),
  preferredResolution: z.enum(["REFUND", "EXCHANGE", "STORE_CREDIT"]),
  items: z.array(returnItemSchema).min(1, "At least one item is required."),
  images: z.array(z.string()).optional(),
})

type ReturnFormData = z.infer<typeof returnSchema>

interface ReturnFormProps {
  availableProducts: Product[]
  t: (key: any) => string
}

type ItemWithDetails = z.infer<typeof returnItemSchema> & {
  productName: string
  sku: string
}

interface ReturnItemCardProps {
  index: number
  availableProducts: Product[]
  setValue: UseFormSetValue<ReturnFormData>
  register: UseFormRegister<ReturnFormData>
  errors: FieldErrors<ReturnFormData>
  remove: (index: number) => void
  canRemove: boolean
  t: (key: any) => string
}

function ReturnItemCard({ index, availableProducts, setValue, register, errors, remove, canRemove, t }: ReturnItemCardProps) {
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedColor, setSelectedColor] = useState("")

  const selectedProduct = useMemo(
    () => availableProducts.find((p: Product) => p.id === selectedProductId),
    [selectedProductId, availableProducts]
  )

  const availableColors = useMemo((): string[] => {
    if (!selectedProduct) return []
    const colors = selectedProduct.variations
      .map((v: Variation) => v.color)
      .filter((c: string | null | undefined): c is string => !!c)
    return [...new Set<string>(colors)]
  }, [selectedProduct])

  const availableSizes = useMemo((): string[] => {
    if (!selectedProduct || !selectedColor) return []
    const sizes = selectedProduct.variations
      .filter((v: Variation) => v.color === selectedColor)
      .map((v: Variation) => v.size)
      .filter((s: string | null | undefined): s is string => !!s)
    return [...new Set<string>(sizes)]
  }, [selectedProduct, selectedColor])

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId)
    setSelectedColor("")
    setValue(`items.${index}.productVariationId`, "")
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    setValue(`items.${index}.productVariationId`, "")
  }

  const handleSizeChange = (size: string) => {
    const variation = selectedProduct?.variations.find(
      (v: Variation) => v.color === selectedColor && v.size === size
    )
    if (variation) {
      setValue(`items.${index}.productVariationId`, variation.id)
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{t("itemCard.item", { index: index + 1 })}</h4>
          {canRemove && (
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>{t("itemCard.product")}</Label>
            <Select onValueChange={handleProductChange}>
              <SelectTrigger><SelectValue placeholder={t("itemCard.selectProduct")} /></SelectTrigger>
              <SelectContent>
                {availableProducts.map((p: Product) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("itemCard.color")}</Label>
            <Select onValueChange={handleColorChange} disabled={!selectedProductId || availableColors.length === 0}>
              <SelectTrigger><SelectValue placeholder={t("itemCard.selectColor")} /></SelectTrigger>
              <SelectContent>
                {availableColors.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("itemCard.size")}</Label>
            <Select onValueChange={handleSizeChange} disabled={!selectedColor || availableSizes.length === 0}>
              <SelectTrigger><SelectValue placeholder={t("itemCard.selectSize")} /></SelectTrigger>
              <SelectContent>
                {availableSizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        {errors.items?.[index]?.productVariationId && <p className="text-sm text-destructive">{errors.items[index]?.productVariationId?.message}</p>}
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("itemCard.quantity")}</Label>
            <Input type="number" min="1" {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
            {errors.items?.[index]?.quantity && <p className="text-sm text-destructive">{errors.items[index]?.quantity?.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>{t("itemCard.reason")}</Label>
            <Select onValueChange={(value) => setValue(`items.${index}.reason`, value as any)}>
              <SelectTrigger><SelectValue placeholder={t("itemCard.selectReason")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DEFECTIVE">{t("itemCard.reasons.defective")}</SelectItem>
                <SelectItem value="WRONG_ITEM">{t("itemCard.reasons.wrongItem")}</SelectItem>
                <SelectItem value="CHANGED_MIND">{t("itemCard.reasons.changedMind")}</SelectItem>
                <SelectItem value="NOT_AS_DESCRIBED">{t("itemCard.reasons.notAsDescribed")}</SelectItem>
                <SelectItem value="OTHER">{t("itemCard.reasons.other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function ReturnForm({ availableProducts, t }: ReturnFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<ReturnFormData>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      items: [{ productVariationId: "", quantity: 1, reason: "DEFECTIVE" }],
      images: [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "items" })

  const onSubmit = async (data: ReturnFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const itemsWithDetails: ItemWithDetails[] = data.items
        .map((item): ItemWithDetails | null => {
          for (const product of availableProducts) {
            const variation = product.variations.find(v => v.id === item.productVariationId)
            if (variation) {
              return {
                ...item,
                productName: product.name,
                sku: variation.sku,
              }
            }
          }
          return null
        })
        .filter((item): item is ItemWithDetails => !!item)

      if (itemsWithDetails.length !== data.items.length) {
        setError("Could not find details for all selected items. Please try again.")
        setIsLoading(false)
        return
      }

      const result = await submitReturnAction({ ...data, items: itemsWithDetails, images })
      if (result.error) {
        setError(result.error)
      } else if (result.returnNumber) {
        setSuccess(t("successMessage", { returnNumber: result.returnNumber }))
      }
    } catch (err) {
      setError(t("errorMessage"))
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">{success}</AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4" id="tour-contact-info">
        <h3 className="text-lg font-semibold">{t("contactInfo")}</h3>
        <div className="space-y-2">
          <Label htmlFor="customerName">{t("fullName")}</Label>
          <Input id="customerName" {...register("customerName")} />
          {errors.customerName && <p className="text-sm text-destructive">{errors.customerName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerEmail">{t("email")}</Label>
          <Input id="customerEmail" type="email" {...register("customerEmail")} />
          {errors.customerEmail && <p className="text-sm text-destructive">{errors.customerEmail.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerPhone">{t("phone")}</Label>
          <Input id="customerPhone" type="tel" {...register("customerPhone")} />
        </div>
      </div>

      <div className="space-y-4" id="tour-return-details">
        <h3 className="text-lg font-semibold">{t("returnDetails")}</h3>
        <div className="space-y-2">
          <Label htmlFor="description">{t("description")}</Label>
          <Textarea id="description" rows={4} {...register("description")} />
          {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>{t("preferredResolution")}</Label>
          <Select onValueChange={(value) => setValue("preferredResolution", value as any)}>
            <SelectTrigger><SelectValue placeholder={t("selectPreference")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="REFUND">{t("refund")}</SelectItem>
              <SelectItem value="EXCHANGE">{t("exchange")}</SelectItem>
              <SelectItem value="STORE_CREDIT">{t("storeCredit")}</SelectItem>
            </SelectContent>
          </Select>
          {errors.preferredResolution && <p className="text-sm text-destructive">{errors.preferredResolution.message}</p>}
        </div>
      </div>

      <div className="space-y-4" id="tour-items-section">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t("itemsToReturn")}</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => append({ productVariationId: "", quantity: 1, reason: "DEFECTIVE" })}>
            <Plus className="h-4 w-4 mr-2" /> {t("addItem")}
          </Button>
        </div>
        {fields.map((field, index) => (
          <ReturnItemCard
            key={field.id}
            index={index}
            availableProducts={availableProducts}
            setValue={setValue}
            register={register}
            errors={errors}
            remove={remove}
            canRemove={fields.length > 1}
            t={t}
          />
        ))}
        {errors.items && <p className="text-sm text-destructive">{errors.items.message}</p>}
      </div>

      <div className="space-y-4" id="tour-image-upload">
        <h3 className="text-lg font-semibold">{t("productImages")}</h3>
        <ImageUpload
          images={images}
          onUpload={(url) => setImages(prev => [...prev, url])}
          onRemove={(url) => setImages(prev => prev.filter(i => i !== url))}
        />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading} id="tour-submit-button">
        {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
        {t("submitButton")}
      </Button>
    </form>
  )
}