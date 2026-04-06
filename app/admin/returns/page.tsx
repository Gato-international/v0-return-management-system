import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent } from "@/components/ui/card"
import { ReturnsTable } from "@/components/admin/returns-table"

interface PageProps {
  searchParams: { status?: string }
}

export default async function AdminReturnsPage({ searchParams }: PageProps) {
  await requireAuth()
  const statusFilter = searchParams.status

  const supabase = createAdminClient()

  let query = supabase.from("returns").select("*, items:return_items(*)")

  if (statusFilter) {
    query = query.eq("status", statusFilter)
  }

  const { data: returns } = await query.order("created_at", { ascending: false })

  return (
    <>
      <div className="border-b border-neutral-200 bg-white">
        <div className="px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Returns</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {statusFilter ? `Showing ${statusFilter.toLowerCase()} returns` : "Manage and review customer return requests"}
          </p>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6">
        <Card className="border-neutral-200 bg-white">
          <CardContent className="p-5">
            <ReturnsTable returns={returns || []} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}