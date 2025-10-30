import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ReturnsTable } from "@/components/admin/returns-table"

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminReturnsPage({ searchParams }: PageProps) {
  const user = await requireAuth()
  const params = await searchParams
  const statusFilter = params.status

  const supabase = await createClient()

  // Fetch returns with optional status filter
  let query = supabase.from("returns").select("*, items:return_items(*)")

  if (statusFilter) {
    query = query.eq("status", statusFilter)
  }

  const { data: returns } = await query.order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Returns Management</h1>
              <p className="text-sm text-muted-foreground">
                {statusFilter ? `Showing ${statusFilter.toLowerCase()} returns` : "All returns"}
              </p>
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
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Returns List</CardTitle>
            <CardDescription>Manage and review customer return requests</CardDescription>
          </CardHeader>
          <CardContent>
            <ReturnsTable returns={returns || []} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
