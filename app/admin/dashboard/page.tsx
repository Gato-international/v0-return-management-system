import { requireAuth } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Package, Clock, CheckCircle, XCircle, Box, Settings, Code2, FileText, Layers, Undo2, ArrowUpRight } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { formatReturnNumber } from "@/lib/utils/formatters"

const statusColors: Record<string, string> = {
  pending: "bg-blue-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  received: "bg-purple-500",
  inspecting: "bg-yellow-500",
  refund_issued: "bg-orange-500",
  completed: "bg-green-700",
  cancelled: "bg-gray-500",
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  received: "Received",
  inspecting: "Inspecting",
  refund_issued: "Refund Issued",
  completed: "Completed",
  cancelled: "Cancelled",
}

export default async function DashboardPage() {
  const user = await requireAuth()
  const supabase = createAdminClient()

  const [totalReturns, pendingReturns, approvedReturns, rejectedReturns, { data: recentReturns }] = await Promise.all([
    supabase.from("returns").select("*", { count: "exact", head: true }),
    supabase.from("returns").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("returns").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("returns").select("*", { count: "exact", head: true }).eq("status", "rejected"),
    supabase.from("returns").select("id, return_number, customer_name, customer_email, status, created_at").order("created_at", { ascending: false }).limit(5),
  ])

  const stats = [
    {
      label: "Total Returns",
      value: totalReturns.count || 0,
      icon: Package,
      description: "All time",
      href: "/admin/returns",
    },
    {
      label: "Pending Review",
      value: pendingReturns.count || 0,
      icon: Clock,
      description: "Awaiting action",
      href: "/admin/returns?status=pending",
      highlight: (pendingReturns.count || 0) > 0,
    },
    {
      label: "Approved",
      value: approvedReturns.count || 0,
      icon: CheckCircle,
      description: "Ready to process",
      href: "/admin/returns?status=approved",
    },
    {
      label: "Rejected",
      value: rejectedReturns.count || 0,
      icon: XCircle,
      description: "Declined",
      href: "/admin/returns?status=rejected",
    },
  ]

  const quickLinks = [
    { label: "Returns", description: "View & manage", icon: Undo2, href: "/admin/returns" },
    { label: "Products", description: "Manage catalog", icon: Box, href: "/admin/products" },
    { label: "Variations", description: "Attributes & options", icon: Layers, href: "/admin/variations" },
    { label: "Settings", description: "Site configuration", icon: Settings, href: "/admin/settings" },
    { label: "Release Notes", description: "Manage updates", icon: FileText, href: "/admin/release-notes" },
    { label: "Developer", description: "Dev tools & tasks", icon: Code2, href: "/admin/developer" },
  ]

  return (
    <>
      {/* Page header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Dashboard</h1>
              <p className="text-sm text-neutral-500 mt-1">Welcome back, {user.name || user.email}</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              System operational
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6 space-y-6">
        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card className={`group relative overflow-hidden border-neutral-200 bg-white hover:border-neutral-300 transition-all hover:shadow-md cursor-pointer ${stat.highlight ? "ring-1 ring-blue-200" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.highlight ? "bg-blue-50" : "bg-neutral-100"}`}>
                      <stat.icon className={`h-5 w-5 ${stat.highlight ? "text-blue-600" : "text-neutral-600"}`} />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                  </div>
                  <div className="text-3xl font-bold text-neutral-900 tracking-tight">{stat.value}</div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm font-medium text-neutral-600">{stat.label}</p>
                    <p className="text-xs text-neutral-400">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent returns */}
          <div className="lg:col-span-2">
            <Card className="border-neutral-200 bg-white">
              <div className="flex items-center justify-between p-5 pb-0">
                <div>
                  <h2 className="text-base font-semibold text-neutral-900">Recent Returns</h2>
                  <p className="text-sm text-neutral-500">Latest submissions</p>
                </div>
                <Link
                  href="/admin/returns"
                  className="text-sm font-medium text-neutral-600 hover:text-black transition-colors flex items-center gap-1"
                >
                  View all
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <CardContent className="p-5">
                {recentReturns && recentReturns.length > 0 ? (
                  <div className="space-y-1">
                    {recentReturns.map((ret: any) => (
                      <Link
                        key={ret.id}
                        href={`/admin/returns/${ret.id}`}
                        className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-neutral-50 transition-colors group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
                            {ret.customer_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">{ret.customer_name}</p>
                            <p className="text-xs text-neutral-500">{formatReturnNumber(ret.return_number)} · {format(new Date(ret.created_at), "MMM d")}</p>
                          </div>
                        </div>
                        <Badge className={`${statusColors[ret.status] || "bg-gray-500"} text-[11px] shrink-0`}>
                          {statusLabels[ret.status] || ret.status}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-400">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No returns yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick links */}
          <div>
            <Card className="border-neutral-200 bg-white">
              <div className="p-5 pb-0">
                <h2 className="text-base font-semibold text-neutral-900">Quick Access</h2>
                <p className="text-sm text-neutral-500">Navigate to sections</p>
              </div>
              <CardContent className="p-5">
                <div className="space-y-1">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-lg hover:bg-neutral-50 transition-colors group"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 group-hover:bg-neutral-200 transition-colors">
                        <link.icon className="h-4 w-4 text-neutral-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-neutral-900">{link.label}</p>
                        <p className="text-xs text-neutral-400">{link.description}</p>
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 text-neutral-300 group-hover:text-neutral-500 transition-colors shrink-0" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}