import { requireAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import { Package, Clock, CheckCircle, XCircle, Box, Settings, Annoyed } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await requireAuth()

  const supabase = createAdminClient()

  const [totalReturns, pendingReturns, approvedReturns, rejectedReturns] = await Promise.all([
    supabase.from("returns").select("*", { count: "exact", head: true }),
    supabase.from("returns").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("returns").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("returns").select("*", { count: "exact", head: true }).eq("status", "rejected"),
  ])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user.name || user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <form action={logoutAction}>
              <Button variant="outline" type="submit">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReturns.count || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReturns.count || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedReturns.count || 0}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedReturns.count || 0}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <Link href="/admin/returns">
                <Package className="mr-2 h-4 w-4" />
                View All Returns
              </Link>
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <Link href="/admin/products">
                <Box className="mr-2 h-4 w-4" />
                Manage Products
              </Link>
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <Link href="/admin/variations">
                <Settings className="mr-2 h-4 w-4" />
                Manage Variations
              </Link>
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <Link href="/admin/settings">
                <Annoyed className="mr-2 h-4 w-4" />
                Site Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}