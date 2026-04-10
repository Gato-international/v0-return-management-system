"use client"

import { useState, useMemo, useCallback } from "react"
import { useForm, useFieldArray, UseFormSetValue, UseFormRegister, FieldErrors, useWatch, Control } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { submitReturnAction } from "@/app/actions/returns"
import { CheckCircle, AlertCircle, Plus, X, FileDown, Search, ShieldCheck, ShieldAlert, CalendarIcon, ChevronDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ImageUpload } from "@/components/returns/image-upload"
import { Textarea } from "../ui/textarea"
import { DownloadSlipButton } from "@/components/returns/download-slip-button"

interface Variation {
  id: string
  sku?: string | null
  attributes: Record<string, string>
}
interface Product {
  id: string
  name: string
  sku: string
  variations: Variation[]
}

const returnItemSchema = z.object({
  productVariationId: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1."),
  reason: z.enum(["DEFECTIVE", "WRONG_ITEM", "CHANGED_MIND", "NOT_AS_DESCRIBED", "OTHER"]),
  condition: z.string().optional(),
  selectedProduct: z.string().min(1, "Please select a product."),
  selectedAttributes: z.record(z.string()).optional(),
})

const baseReturnSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().optional(),
  description: z.string().min(10, "Please provide at least 10 characters."),
  preferredResolution: z.enum(["REFUND", "EXCHANGE", "STORE_CREDIT"]),
  images: z.array(z.string()).min(1, "At least one product photo is required."),
  shippingDate: z.string().optional(),
})

const returnSchemaForType = baseReturnSchema.extend({
  items: z.array(returnItemSchema).min(1),
})

type ReturnFormData = z.infer<typeof returnSchemaForType>

interface ImageValidation {
  valid: boolean
  isScreenshot: boolean
  isProductPhoto: boolean
  confidence: number
  reasons: string[]
}

interface OrderVerifyResult {
  verified: boolean
  message: string
}

interface ReturnFormProps {
  availableProducts: Product[]
}

interface ActionReturnItem {
  productId: string
  productVariationId?: string
  productName: string
  sku: string
  quantity: number
  reason: string
  condition?: string
}

interface ReturnItemCardProps {
  index: number
  availableProducts: Product[]
  control: Control<ReturnFormData>
  setValue: UseFormSetValue<ReturnFormData>
  register: UseFormRegister<ReturnFormData>
  errors: FieldErrors<ReturnFormData>
  remove: (index: number) => void
  canRemove: boolean
}

function ReturnItemCard({ index, availableProducts, control, setValue, register, errors, remove, canRemove }: ReturnItemCardProps) {
  const selectedProductId = useWatch({ control, name: `items.${index}.selectedProduct` })
  const selectedAttributes = useWatch({ control, name: `items.${index}.selectedAttributes` }) || {}

  const selectedProduct = useMemo(
    () => availableProducts.find((p: Product) => p.id === selectedProductId),
    [selectedProductId, availableProducts]
  )

  const hasVariations = useMemo(() => selectedProduct && selectedProduct.variations.length > 0, [selectedProduct])

  const productAttributes = useMemo(() => {
    if (!selectedProduct || !hasVariations) return []
    const attributes = new Set<string>()
    selectedProduct.variations.forEach(v => {
      Object.keys(v.attributes).forEach(attr => attributes.add(attr))
    })
    return Array.from(attributes)
  }, [selectedProduct, hasVariations])

  const getAvailableOptions = (attributeName: string, currentSelections: Record<string, string>) => {
    if (!selectedProduct) return []

    const filteredVariations = selectedProduct.variations.filter(variation => {
      return Object.entries(currentSelections).every(([key, value]) => {
        return !value || variation.attributes[key] === value
      })
    })

    const options = new Set<string>()
    filteredVariations.forEach(variation => {
      if (variation.attributes[attributeName]) {
        options.add(variation.attributes[attributeName])
      }
    })
    return Array.from(options)
  }

  const handleAttributeChange = (attributeName: string, value: string) => {
    const newSelections = { ...selectedAttributes, [attributeName]: value }

    const attrIndex = productAttributes.indexOf(attributeName)
    for (let i = attrIndex + 1; i < productAttributes.length; i++) {
      const subsequentAttr = productAttributes[i]
      delete newSelections[subsequentAttr]
    }

    setValue(`items.${index}.selectedAttributes`, newSelections)

    const finalVariation = selectedProduct?.variations.find(v => {
      return productAttributes.every(attr => v.attributes[attr] === newSelections[attr])
    })

    if (finalVariation) {
      setValue(`items.${index}.productVariationId`, finalVariation.id)
    } else {
      setValue(`items.${index}.productVariationId`, "")
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Item {index + 1}</h4>
          {canRemove && (
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="space-y-2">
          <Label>Product *</Label>
          <Select
            onValueChange={(value) => {
              setValue(`items.${index}.selectedProduct`, value)
              setValue(`items.${index}.selectedAttributes`, {})
              setValue(`items.${index}.productVariationId`, "")
            }}
          >
            <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
            <SelectContent>
              {availableProducts.map((p: Product) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasVariations && (
          <>
            {productAttributes.map((attrName, attrIndex) => {
              const currentSelectionsForThisDropdown: Record<string, string> = {}
              for (let i = 0; i < attrIndex; i++) {
                const prevAttrName = productAttributes[i]
                if (selectedAttributes[prevAttrName]) {
                  currentSelectionsForThisDropdown[prevAttrName] = selectedAttributes[prevAttrName]
                }
              }
              const options = getAvailableOptions(attrName, currentSelectionsForThisDropdown)
              const isEnabled = attrIndex === 0 ? !!selectedProduct : !!selectedAttributes[productAttributes[attrIndex - 1]]

              return (
                <div key={attrName} className="space-y-2">
                  <Label>{attrName} *</Label>
                  <Select
                    onValueChange={(value) => handleAttributeChange(attrName, value)}
                    value={selectedAttributes[attrName] || ""}
                    disabled={!isEnabled}
                  >
                    <SelectTrigger><SelectValue placeholder={`Select ${attrName}`} /></SelectTrigger>
                    <SelectContent>
                      {options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )
            })}
            {errors.items?.[index]?.productVariationId && <p className="text-sm text-destructive">{errors.items[index]?.productVariationId?.message}</p>}
          </>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Quantity *</Label>
            <Input type="number" min="1" {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
            {errors.items?.[index]?.quantity && <p className="text-sm text-destructive">{errors.items[index]?.quantity?.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Reason for Return *</Label>
            <Select onValueChange={(value) => setValue(`items.${index}.reason`, value as any)}>
              <SelectTrigger><SelectValue placeholder="Select Reason" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DEFECTIVE">Defective/Damaged</SelectItem>
                <SelectItem value="WRONG_ITEM">Wrong Item Received</SelectItem>
                <SelectItem value="CHANGED_MIND">Changed Mind</SelectItem>
                <SelectItem value="NOT_AS_DESCRIBED">Not as Described</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function ReturnForm({ availableProducts }: ReturnFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [successReturnData, setSuccessReturnData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [imageValidations, setImageValidations] = useState<Record<string, ImageValidation>>({})

  // Order verification state
  const [showOrderVerify, setShowOrderVerify] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [orderEmail, setOrderEmail] = useState("")
  const [orderVerifying, setOrderVerifying] = useState(false)
  const [orderVerifyResult, setOrderVerifyResult] = useState<OrderVerifyResult | null>(null)
  const [orderVerifyError, setOrderVerifyError] = useState<string | null>(null)
  const returnSchema = useMemo(() => {
    const itemSchemaWithRefine = returnItemSchema.superRefine((data, ctx) => {
      const product = availableProducts.find(p => p.id === data.selectedProduct)
      if (product && product.variations.length > 0 && !data.productVariationId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["productVariationId"],
          message: "Please select a complete product variation.",
        })
      }
    })

    return baseReturnSchema.extend({
      items: z.array(itemSchemaWithRefine).min(1, "At least one item is required."),
    })
  }, [availableProducts])

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<ReturnFormData>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      items: [{ productVariationId: "", quantity: 1, reason: "DEFECTIVE", selectedProduct: "" }],
      images: [],
      shippingDate: "",
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "items" })

  // Image validation handler
  const handleImageValidation = useCallback((url: string, result: ImageValidation) => {
    setImageValidations(prev => ({ ...prev, [url]: result }))
  }, [])

  // Handle image upload
  const handleImageUpload = useCallback((url: string) => {
    setImages(prev => {
      const next = [...prev, url]
      setValue("images", next)
      return next
    })
  }, [setValue])

  // Handle image remove
  const handleImageRemove = useCallback((url: string) => {
    setImages(prev => {
      const next = prev.filter(i => i !== url)
      setValue("images", next)
      return next
    })
    setImageValidations(prev => {
      const next = { ...prev }
      delete next[url]
      return next
    })
  }, [setValue])

  // Order verification handler
  const handleVerifyOrder = async () => {
    if (!orderNumber.trim() || !orderEmail.trim()) {
      setOrderVerifyError("Please enter both the order number and email address.")
      return
    }

    setOrderVerifying(true)
    setOrderVerifyError(null)
    setOrderVerifyResult(null)

    try {
      // Build items from the form
      const formItems = fields.map((_, index) => {
        const product = availableProducts.find(p => p.id === document.querySelector<HTMLSelectElement>(`[name="items.${index}.selectedProduct"]`)?.value)
        return {
          productName: product?.name || "",
          sku: product?.sku || "",
          quantity: 1,
        }
      })

      const res = await fetch("/api/v1/verify-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          email: orderEmail.trim(),
          items: formItems.length > 0 ? formItems : [{ productName: "check", quantity: 1 }],
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setOrderVerifyError(data.error || data.message || "Verification failed.")
      } else {
        setOrderVerifyResult(data)
      }
    } catch {
      setOrderVerifyError("Failed to verify order. Please try again.")
    } finally {
      setOrderVerifying(false)
    }
  }

  const onSubmit = async (data: ReturnFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const itemsWithDetails: ActionReturnItem[] = data.items
        .map((item): ActionReturnItem | null => {
          const product = availableProducts.find(p => p.id === item.selectedProduct)
          if (!product) return null

          const variation = item.productVariationId
            ? product.variations.find(v => v.id === item.productVariationId)
            : null

          return {
            productId: product.id,
            productVariationId: variation?.id,
            productName: product.name,
            sku: variation?.sku || product.sku,
            quantity: item.quantity,
            reason: item.reason,
            condition: item.condition,
          }
        })
        .filter((item): item is ActionReturnItem => !!item)

      if (itemsWithDetails.length !== data.items.length) {
        setError("Could not find details for all selected items. Please try again.")
        setIsLoading(false)
        return
      }

      const result = await submitReturnAction({
        ...data,
        items: itemsWithDetails,
        images,
        shippingDate: data.shippingDate || undefined,
        orderNumber: orderNumber || undefined,
        orderVerified: orderVerifyResult?.verified || false,
        orderVerificationResult: orderVerifyResult || undefined,
        visionValidated: Object.values(imageValidations).every(v => v.valid),
        visionResults: imageValidations,
      })
      if (result.error) {
        setError(result.error)
      } else if (result.returnNumber) {
        setSuccess(result.returnNumber)
        if ((result as any).returnData) {
          setSuccessReturnData((result as any).returnData)
        }
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        {/* Success header */}
        <div className="text-center py-6">
          <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Return Submitted</h2>
          <p className="text-muted-foreground mt-2">
            Your return request has been received and is being reviewed.
          </p>
        </div>

        {/* Return number card */}
        <Card className="border-2 border-black">
          <div className="p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Your Tracking Number
            </p>
            <p className="text-3xl font-bold tracking-wider">{success}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Save this number — you&apos;ll need it to track your return.
            </p>
          </div>
        </Card>

        {/* Download return slip */}
        {successReturnData?.qr_token && (
          <Card className="bg-gray-50 border border-gray-200">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileDown className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base">Download Your Return Slip</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Print this PDF and place it inside your return package. It contains a
                    QR code for our warehouse to process your return quickly.
                  </p>
                  <div className="mt-4">
                    <DownloadSlipButton
                      returnData={successReturnData}
                      variant="default"
                      size="lg"
                      className="bg-black hover:bg-gray-800 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <div className="p-6 space-y-4">
            <h3 className="font-semibold">What happens next?</h3>
            <div className="space-y-3">
              {[
                { step: "1", text: "Download and print the return slip above." },
                { step: "2", text: "Pack the items securely and place the slip inside the box." },
                { step: "3", text: "Ship the package to the address in your confirmation email." },
                { step: "4", text: "Track your return status using your tracking number and email." },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {item.step}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          A confirmation email has been sent to your email address.
        </p>
      </div>
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
        <h3 className="text-lg font-semibold">Contact Information</h3>
        <div className="space-y-2">
          <Label htmlFor="customerName">Full Name *</Label>
          <Input id="customerName" {...register("customerName")} />
          {errors.customerName && <p className="text-sm text-destructive">{errors.customerName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerEmail">Email Address *</Label>
          <Input id="customerEmail" type="email" {...register("customerEmail")} />
          {errors.customerEmail && <p className="text-sm text-destructive">{errors.customerEmail.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerPhone">Phone Number (optional)</Label>
          <Input id="customerPhone" type="tel" {...register("customerPhone")} />
        </div>
      </div>

      <div className="space-y-4" id="tour-return-details">
        <h3 className="text-lg font-semibold">Return Details</h3>
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea id="description" rows={4} {...register("description")} />
          {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Preferred Resolution *</Label>
          <Select onValueChange={(value) => setValue("preferredResolution", value as any)}>
            <SelectTrigger><SelectValue placeholder="Select your preference" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="REFUND">Refund</SelectItem>
              <SelectItem value="EXCHANGE">Exchange</SelectItem>
              <SelectItem value="STORE_CREDIT">Store Credit</SelectItem>
            </SelectContent>
          </Select>
          {errors.preferredResolution && <p className="text-sm text-destructive">{errors.preferredResolution.message}</p>}
        </div>
      </div>

      <div className="space-y-4" id="tour-items-section">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Items to Return</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => append({ productVariationId: "", quantity: 1, reason: "DEFECTIVE", selectedProduct: "" })}>
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </div>
        {fields.map((field, index) => (
          <ReturnItemCard
            key={field.id}
            index={index}
            availableProducts={availableProducts}
            control={control}
            setValue={setValue}
            register={register}
            errors={errors}
            remove={remove}
            canRemove={fields.length > 1}
          />
        ))}
        {errors.items && <p className="text-sm text-destructive">{errors.items.message}</p>}
      </div>

      <div className="space-y-4" id="tour-image-upload">
        <h3 className="text-lg font-semibold">Product Photos *</h3>
        <p className="text-sm text-muted-foreground">
          Upload clear photos of the product(s) you want to return. Photos are verified for authenticity.
        </p>
        <ImageUpload
          images={images}
          onUpload={handleImageUpload}
          onRemove={handleImageRemove}
          required={true}
          validationResults={imageValidations}
          onValidationComplete={handleImageValidation}
        />
        {errors.images && <p className="text-sm text-destructive">{errors.images.message}</p>}
      </div>

      {/* Shipping Date */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Shipping Date</h3>
        <div className="space-y-2">
          <Label htmlFor="shippingDate">When do you plan to ship the return package?</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="shippingDate"
              type="date"
              className="pl-10"
              min={new Date().toISOString().split("T")[0]}
              {...register("shippingDate")}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Optional — helps us prepare for your return and speeds up processing.
          </p>
        </div>
      </div>

      {/* Order Verification (Advanced) */}
      <div className="space-y-4">
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-black transition-colors"
          onClick={() => setShowOrderVerify(!showOrderVerify)}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${showOrderVerify ? "rotate-180" : ""}`} />
          Advanced: Verify your order (optional)
        </button>

        {showOrderVerify && (
          <Card className="p-4 space-y-4 border-dashed">
            <div className="flex items-start gap-3">
              <Search className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Order Verification</p>
                <p className="text-sm text-muted-foreground">
                  Enter your order number and email to verify that your return items match the original order.
                  This speeds up the review process.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input
                  id="orderNumber"
                  placeholder="e.g. ABCDEFGH"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="orderEmail">Order Email</Label>
                <Input
                  id="orderEmail"
                  type="email"
                  placeholder="email@example.com"
                  value={orderEmail}
                  onChange={(e) => setOrderEmail(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleVerifyOrder}
              disabled={orderVerifying || !orderNumber.trim() || !orderEmail.trim()}
            >
              {orderVerifying ? (
                <>
                  <Spinner className="mr-2 h-3.5 w-3.5" />
                  Verifying...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-3.5 w-3.5" />
                  Verify Order
                </>
              )}
            </Button>

            {orderVerifyError && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription>{orderVerifyError}</AlertDescription>
              </Alert>
            )}

            {orderVerifyResult && (
              <div className={`rounded-lg border p-4 ${orderVerifyResult.verified ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
                <div className="flex items-center gap-3">
                  {orderVerifyResult.verified ? (
                    <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {orderVerifyResult.verified ? "Order verified" : "Verification failed"}
                    </p>
                    <p className="text-sm text-muted-foreground">{orderVerifyResult.message}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading} id="tour-submit-button">
        {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
        Submit Return Request
      </Button>
    </form>
  )
}