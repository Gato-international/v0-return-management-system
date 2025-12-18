"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Code2, Terminal, Wrench } from "lucide-react"
import { EnhancedTodoCard } from "@/components/ui/enhanced-todo-card"

interface Todo {
  id: string
  text: string
  done: boolean
  completion_notes?: string | null
}

interface DeveloperContentProps {
  todos: Todo[]
  stats: {
    total: number
    completed: number
    inProgress: number
  }
}

export function DeveloperContent({ todos, stats }: DeveloperContentProps) {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Code2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Development items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Terminal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Tasks finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently working on</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Task Tracker</CardTitle>
            <CardDescription>Track your development tasks and celebrate when you're done!</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <EnhancedTodoCard initialTodos={todos} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common development and debugging tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/admin/returns">
                <Code2 className="mr-2 h-4 w-4" />
                Manage Returns
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/admin/settings">
                <Terminal className="mr-2 h-4 w-4" />
                Site Settings
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/admin/products">
                <Wrench className="mr-2 h-4 w-4" />
                Manage Products
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Component Integration Guide</CardTitle>
          <CardDescription>How to integrate React components in this codebase</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <div className="bg-muted p-4 rounded-lg space-y-3 text-sm">
            <h4 className="font-semibold text-foreground">Project Structure:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>✅ <strong>shadcn/ui</strong> - Component library structure</li>
              <li>✅ <strong>Tailwind CSS</strong> - Utility-first styling</li>
              <li>✅ <strong>TypeScript</strong> - Type-safe development</li>
              <li>✅ <strong>Next.js 16</strong> - App Router with React 19</li>
            </ul>

            <h4 className="font-semibold text-foreground mt-4">Component Paths:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li><code className="bg-background px-2 py-1 rounded">/components/ui</code> - shadcn/ui components</li>
              <li><code className="bg-background px-2 py-1 rounded">/components/site</code> - Site-specific components</li>
              <li><code className="bg-background px-2 py-1 rounded">/components/returns</code> - Return-related components</li>
            </ul>

            <h4 className="font-semibold text-foreground mt-4">Integration Steps:</h4>
            <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
              <li>Copy component to <code className="bg-background px-2 py-1 rounded">/components/ui</code></li>
              <li>Install any external dependencies via <code className="bg-background px-2 py-1 rounded">pnpm add</code></li>
              <li>Use lucide-react for icons (already installed)</li>
              <li>Import and use in your pages or components</li>
            </ol>

            <h4 className="font-semibold text-foreground mt-4">Available Tools:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>🎨 Tailwind CSS - All utility classes available</li>
              <li>🎯 lucide-react - Icon library</li>
              <li>📦 shadcn/ui - Pre-built accessible components</li>
              <li>🔧 React Hook Form + Zod - Form validation</li>
              <li>🎭 Framer Motion - Animations</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
