"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
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

// Define Product type for availableProducts prop
interface Product {
  id: string;
  name: string;
  sku: string;
}

const returnItemSchema = z.object({
  productId: z.string().min(1, "Product selection is required"), // New: product ID
  quantity: z.number().min(1, "Quantity must be at least 1"),
  reason: z.enum(["DEFECTIVE", "WRONG_ITEM", "CHANGED_MIND", "NOT_AS_DESCRIBED", "OTHER"]), // Reason for this specific item
  condition: z.string().optional(), // Optional condition for the item
});

const returnSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().optional(),
  orderNumber: z.string().optional(),
  orderDate: z.string().optional(),
  description: z.string().min(10, "Please provide at least 10 characters"),
  preferredResolution: z.enum(["REFUND", "EXCHANGE", "STORE_CREDIT"]),
  items: z.array(returnItemSchema).min(1, "At least one item is required"),
  images: z.array(z.string()).optional(),
})

type ReturnFormData = z.infer<typeof returnSchema>

interface ReturnFormProps {
  availableProducts: Product[];
}

export function ReturnForm({ availableProducts }: ReturnFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<ReturnFormData>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      items: [{ productId: "", quantity: 1, reason: "DEFECTIVE", condition: "" }],
      images: [],
    },
  })

  const watchedItems = watch("items");

  const addItem = () => {
    const newItem: z.infer<typeof returnItemSchema> = { productId: "", quantity: 1, reason: "DEFECTIVE", condition: "" };
    const newItems = [...watchedItems, newItem];
    setValue("items", newItems);
  };

  const removeItem = (index: number) => {
    if (watchedItems.length > 1) {
      const newItems = watchedItems.filter((_, i) => i !== index);
      setValue("items", newItems);
    }
  };

  const onSubmit = async (data: ReturnFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const itemsWithProductDetails = data.items.map(item => {
        const product = availableProducts.find(p => p.id === item.productId);
        return {
          ...item,
          productName: product?.name || "Unknown Product",
          sku: product?.sku || "Unknown SKU",
        };
      });

      const result = await submitReturnAction({ ...data, items: itemsWithProductDetails, images })
      if (result.error) {
        setError(result.error)
      } else if (result.returnNumber) {
        setSuccess(`Return submitted successfully! Your tracking number is: ${result.returnNumber}`)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
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

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Contact Information</h3>

        <div className="space-y-2">
          <Label htmlFor="customerName">Full Name *</Label>
          <Input
            id="customerName"
            type="text"
            placeholder="John Doe"
            {...register("customerName")}
            disabled={isLoading}
          />
          {errors.customerName && <p className="text-sm text-destructive">{errors.customerName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerEmail">Email Address *</Label>
          <Input
            id="customerEmail"
            type="email"
            placeholder="your@email.com"
            {...register("customerEmail")}
            disabled={isLoading}
          />
          {errors.customerEmail && <p className="text-sm text-destructive">{errors.customerEmail.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPhone">Phone Number (optional)</Label>
          <Input
            id="customerPhone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            {...register("customerPhone")}
            disabled={isLoading}
          />
          {errors.customerPhone && <p className="text-sm text-destructive">{errors.customerPhone.message}</p>}
        </div>
      </div>

      {/* Return Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Return Details</h3>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Please provide details about your return..."
            rows={4}
            {...register("description")}
            disabled={isLoading}
          />
          {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredResolution">Preferred Resolution *</Label>
          <Select onValueChange={(value) => setValue("preferredResolution", value as any)} value={watch("preferredResolution")}>
            <SelectTrigger>
              <SelectValue placeholder="Select your preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="REFUND">Refund</SelectItem>
              <SelectItem value="EXCHANGE">Exchange</SelectItem>
              <SelectItem value="STORE_CREDIT">Store Credit</SelectItem>
            </SelectContent>
          </Select>
          {errors.preferredResolution && (
            <p className="text-sm text-destructive">{errors.preferredResolution.message}</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Items to Return</h3>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {watchedItems.map((item, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Item {index + 1}</h4>
                {watchedItems.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Product *</Label>
                  <Select
                    onValueChange={(value) => setValue(`items.${index}.productId`, value)}
                    value={item.productId}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (SKU: {product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.items?.[index]?.productId && <p className="text-sm text-destructive">{errors.items[index]?.productId?.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    min="1"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    disabled={isLoading}
                  />
                  {errors.items?.[index]?.quantity && <p className="text-sm text-destructive">{errors.items[index]?.quantity?.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Reason for Return *</Label>
                  <Select
                    onValueChange={(value) => setValue(`items.${index}.reason`, value as any)}
                    value={item.reason}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEFECTIVE">Defective/Damaged</SelectItem>
                      <SelectItem value="WRONG_ITEM">Wrong Item Received</SelectItem>
                      <SelectItem value="CHANGED_MIND">Changed Mind</SelectItem>
                      <SelectItem value="NOT_AS_DESCRIBED">Not as Described</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.items?.[index]?.reason && <p className="text-sm text-destructive">{errors.items[index]?.reason?.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Condition (optional)</Label>
                  <Input
                    placeholder="e.g., 'New', 'Used', 'Damaged'"
                    {...register(`items.${index}.condition`)}
                    disabled={isLoading}
                  />
                  {errors.items?.[index]?.condition && <p className="text-sm text-destructive">{errors.items[index]?.condition?.message}</p>}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {errors.items && <p className="text-sm text-destructive">{errors.items.message}</p>}
      </div>

      {/* Product Images (Optional) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Product Images (Optional)</h3>
        <p className="text-sm text-muted-foreground">
          Upload images of the items you're returning. This helps us process your return faster.
        </p>
        <ImageUpload
          images={images}
          onUpload={(url) => {
            const newImages = [...images, url]
            setImages(newImages)
            setValue("images", newImages)
          }}
          onRemove={(url) => {
            const newImages = images.filter((img) => img !== url)
            setImages(newImages)
            setValue("images", newImages)
          }}
          maxImages={5}
        />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Submitting...
          </>
        ) : (
          "Submit Return Request"
        )}
      </Button>
    </form>
  )
}