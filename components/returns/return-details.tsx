"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Package, Calendar, Mail, FileText } from "lucide-react"
import { format } from "date-fns"

interface ReturnDetailsProps {
  returnData: any
  onBack: () => void
}

const statusColors: Record<string, string> = {
  pending: "bg-blue-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  received: "bg-purple-500",
  inspecting: "bg-yellow-500",
  refund_issued: "bg-green-600",
  completed: "bg-green-600",
  cancelled: "bg-gray-500",
}

const statusLabels: Record<string, string> = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  received: "Items Received",
  inspecting: "Inspecting",
  refund_issued: "Refund Issued",
  completed: "Completed",
  cancelled: "Cancelled",
}

export function ReturnDetails({ returnData, onBack }: ReturnDetailsProps) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Search
      </Button>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Return #{returnData.return_number}</CardTitle>
              <CardDescription>Order: {returnData.order_number}</CardDescription>
            </div>
            <Badge className={statusColors[returnData.status] || "bg-gray-500"}>
              {statusLabels[returnData.status] || returnData.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{returnData.customer_email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Submitted {format(new Date(returnData.created_at), "MMM d, yyyy")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {returnData.items?.map((item: any, index: number) => (
              <div key={item.id}>
                {index > 0 && <Separator className="my-3" />}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Qty: {item.quantity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Return Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Return Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Reason</p>
            <p className="text-sm">{returnData.reason?.replace(/_/g, " ")}</p>
          </div>
          {returnData.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm">{returnData.description}</p>
            </div>
          )}
          {returnData.preferred_resolution && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Preferred Resolution</p>
              <p className="text-sm">{returnData.preferred_resolution?.replace(/_/g, " ")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status History */}
      {returnData.statusHistory && returnData.statusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Status History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {returnData.statusHistory.map((history: any, index: number) => (
                <div key={history.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-3 w-3 rounded-full ${statusColors[history.status] || "bg-gray-500"}`} />
                    {index < returnData.statusHistory.length - 1 && <div className="w-px h-full bg-border mt-1" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium">{statusLabels[history.status] || history.status}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(history.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    {history.notes && <p className="text-sm mt-1">{history.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      {returnData.images && returnData.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {returnData.images.map((image: any) => (
                <img
                  key={image.id}
                  src={image.url || "/placeholder.svg"}
                  alt={image.filename}
                  className="rounded-lg border border-border object-cover aspect-square"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
