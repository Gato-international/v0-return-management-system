import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import Link from "next/link"
import { ArrowLeft, Package, Calendar, Mail, FileText, User, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { ReturnActions } from "@/components/admin/return-actions"
import { DeleteReturnButton } from "@/components/admin/delete-return-button"
import { PrintReturnButton } from "@/components/admin/print-return-button"
import { formatReturnNumber } from "@/lib/utils/formatters"

interface PageProps {
  params: any // Using 'any' to resolve conflicting type information from the Next.js runtime.
}

const statusColors: Record<string, string> = {
  pending: "bg-blue-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  received: "bg-purple-500",
  inspecting: "bg-yellow-500",
  refund_issued: "bg-green-600",
  completed: "bg-green-700",
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  received: "Received",
  inspecting: "Inspecting",
  refund_issued: "Refund Issued",
  completed: "Completed",
}

export default async function ReturnDetailPage({ params }: PageProps) {
  const user = await requireAuth()
  const resolvedParams = await params
  const { id } = resolvedParams

  const supabase = await createClient()

  const { data: returnData } = await supabase.from("returns").select("*").eq("id", id).single()

  if (!returnData) {
    notFound()
  }

  // Fetch related data
  const [{ data: items }, { data: statusHistory }, { data: notes }, { data: images }] = await Promise.all([
    supabase
      .from("return_items")
      .select("*, variation:product_variations(sku, color, size, product:products(name))")
      .eq("return_id", id),
    supabase.from("return_status_history").select("*").eq("return_id", id).order("created_at", { ascending: false }),
    supabase
      .from("return_notes")
      .select("*, admin:admin_users(name, email)")
      .eq("return_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("return_images").select("*").eq("return_id", id),
  ])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card print:hidden">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/returns">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Return #{formatReturnNumber(returnData.return_number)}</h1>
              <p className="text-sm text-muted-foreground">Order: {returnData.order_number || "N/A"}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <Button variant="outline" type="submit">
              Logout
            </Button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 print:p-0">
        <div className="grid gap-6 lg:grid-cols-3 print:grid-cols-1">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6 print:col-span-1">
            {/* Status Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Return Information</CardTitle>
                  <Badge className={statusColors[returnData.status]}>{statusLabels[returnData.status]}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{returnData.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{returnData.customer_email}</span>
                  </div>
                  {returnData.customer_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{returnData.customer_phone}</span>
                    </div>
                  )}
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
                  {items?.map((item, index) => (
                    <div key={item.id}>
                      {index > 0 && <Separator className="my-3" />}
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.variation?.product?.name || item.product_name}</p>
                          <p className="text-sm text-muted-foreground">SKU: {item.variation?.sku || item.sku}</p>
                          {(item.variation?.color || item.variation?.size) && (
                            <p className="text-sm text-muted-foreground">
                              Variation: {[item.variation.color, item.variation.size].filter(Boolean).join(", ")}
                            </p>
                          )}
                          {item.condition && <p className="text-sm text-muted-foreground">Condition: {item.condition}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm mt-2">Reason: {item.reason}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{returnData.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                  <p className="text-sm">
                    {returnData.order_date ? format(new Date(returnData.order_date), "MMM d, yyyy") : "N/A"}
                  </p>
                </div>
                {returnData.preferred_resolution && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Preferred Resolution</p>
                    <p className="text-sm">{returnData.preferred_resolution?.replace(/_/g, " ")}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Images */}
            {images && images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image) => (
                      <img
                        key={image.id}
                        src={image.url || "/placeholder.svg"}
                        alt={image.filename}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Internal Notes */}
            {notes && notes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Internal Notes</CardTitle>
                  <CardDescription>Only visible to admins</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note.id} className="border-l-2 border-primary pl-4">
                        <p className="text-sm">{note.note}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {note.admin?.name || note.admin?.email || "Admin"} -{" "}
                          {format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Actions & History */}
          <div className="space-y-6 print:hidden">
            {/* Actions */}
            <ReturnActions returnId={returnData.id} currentStatus={returnData.status} userId={user.id} />

            {/* More Actions */}
            <Card>
              <CardHeader>
                <CardTitle>More Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <PrintReturnButton />
                <DeleteReturnButton returnId={returnData.id} userId={user.id} />
              </CardContent>
            </Card>

            {/* Status History */}
            <Card>
              <CardHeader>
                <CardTitle>Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusHistory?.map((history, index) => (
                    <div key={history.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`h-3 w-3 rounded-full ${statusColors[history.status]}`} />
                        {index < statusHistory.length - 1 && <div className="w-px h-full bg-border mt-1" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-sm">{statusLabels[history.status]}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(history.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        {history.notes && <p className="text-sm mt-1">{history.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}