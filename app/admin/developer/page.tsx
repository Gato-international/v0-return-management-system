import { requireAuth } from "@/lib/auth"
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
    <>
      <div className="border-b border-neutral-200 bg-white">
        <div className="px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Developer</h1>
          <p className="text-sm text-neutral-500 mt-1">Development tools and task management</p>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6">
        <DeveloperContent todos={todos} stats={stats} />
      </div>
    </>
  )
}
