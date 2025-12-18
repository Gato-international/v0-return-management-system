import { requireAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { DeveloperContent } from "./developer-content"
import { getTodosAction } from "@/app/actions/developer"

export default async function DeveloperPage() {
  await requireAuth()
  
  const { todos } = await getTodosAction()
  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.done).length,
    inProgress: todos.filter(t => !t.done).length,
  }
  return (
    <div className="min-h-screen bg-background">
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
              <h1 className="text-2xl font-bold">Developer Section</h1>
              <p className="text-sm text-muted-foreground">Development tools and task management</p>
            </div>
          </div>
          <form action={logoutAction}>
            <Button variant="outline" type="submit">
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <DeveloperContent todos={todos} stats={stats} />
      </main>
    </div>
  )
}
