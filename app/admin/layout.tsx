import { getSession } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  // Don't show sidebar on login page
  if (!session) {
    return <>{children}</>
  }

  const user = { name: session.name || "Admin", email: session.email }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminSidebar user={user} />
      <div className="lg:pl-[260px] transition-all duration-300">
        {children}
      </div>
    </div>
  )
}
