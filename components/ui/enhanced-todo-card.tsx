"use client"

import React, { useEffect, useMemo, useState, useTransition } from "react"
import { Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createTodoAction, toggleTodoAction, deleteTodoAction, resetTodosAction } from "@/app/actions/developer"
import { useToast } from "@/hooks/use-toast"

const CONFETTI_COLORS = ["#10b981", "#f59e0b", "#6366f1", "#ef4444", "#06b6d4"]

interface Todo {
  id: string
  text: string
  done: boolean
  completion_notes?: string | null
}

interface EnhancedTodoCardProps {
  initialTodos: Todo[]
}

export function EnhancedTodoCard({ initialTodos }: EnhancedTodoCardProps) {
  const [items, setItems] = useState<Todo[]>(initialTodos)
  const [dateInfo, setDateInfo] = useState({ date: "", time: "" })
  const [newTaskText, setNewTaskText] = useState("")
  const [showAddTask, setShowAddTask] = useState(false)
  const [completionDialog, setCompletionDialog] = useState<{ open: boolean; todoId: string; todoText: string }>({
    open: false,
    todoId: "",
    todoText: "",
  })
  const [completionNotes, setCompletionNotes] = useState("")
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  useEffect(() => {
    setItems(initialTodos)
  }, [initialTodos])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const date = now.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      const time = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
      setDateInfo({ date, time })
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleAddTask = () => {
    if (!newTaskText.trim()) return

    startTransition(async () => {
      const result = await createTodoAction(newTaskText.trim())
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Success", description: "Task added successfully" })
        setNewTaskText("")
        setShowAddTask(false)
      }
    })
  }

  const handleToggleItem = (id: string, currentDone: boolean, text: string) => {
    if (!currentDone) {
      setCompletionDialog({ open: true, todoId: id, todoText: text })
    } else {
      startTransition(async () => {
        const result = await toggleTodoAction(id, false)
        if (result.error) {
          toast({ title: "Error", description: result.error, variant: "destructive" })
        }
      })
    }
  }

  const handleCompleteWithNotes = () => {
    startTransition(async () => {
      const result = await toggleTodoAction(completionDialog.todoId, true, completionNotes.trim() || undefined)
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Success", description: "Task completed!" })
        setCompletionDialog({ open: false, todoId: "", todoText: "" })
        setCompletionNotes("")
      }
    })
  }

  const handleDeleteTask = (id: string) => {
    startTransition(async () => {
      const result = await deleteTodoAction(id)
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Success", description: "Task deleted" })
      }
    })
  }

  const handleResetList = () => {
    startTransition(async () => {
      const result = await resetTodosAction()
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Success", description: "All tasks reset" })
      }
    })
  }

  const allDone = useMemo(() => items.length > 0 && items.every((i) => i.done), [items])

  const [celebrating, setCelebrating] = useState(false)

  useEffect(() => {
    if (allDone && items.length > 0) {
      setCelebrating(true)
      const t = setTimeout(() => setCelebrating(false), 4000)
      return () => clearTimeout(t)
    }
  }, [allDone, items.length])

  const Header = (
    <div
      className={`flex items-center justify-between px-4 py-3 ${
        allDone
          ? "bg-gradient-to-b from-emerald-400 to-emerald-300"
          : "bg-gradient-to-b from-yellow-300 to-yellow-200"
      }`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-sm font-semibold text-gray-900">{dateInfo.date}</span>
        <span className="bg-black/10 text-gray-800 text-xs font-medium px-2 py-1 rounded-md">
          {dateInfo.time}
        </span>
      </div>

      {allDone ? (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">All done!</span>
          <button
            onClick={handleResetList}
            disabled={isPending}
            className="text-gray-900 font-semibold text-xs px-2 py-1 rounded-md bg-white/60 hover:bg-white/80 transition disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddTask(!showAddTask)}
          className="text-gray-900 font-semibold text-sm hover:text-gray-700 flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      )}
    </div>
  )

  return (
    <>
      <div
        className={`w-[380px] rounded-2xl shadow-lg border overflow-hidden bg-white transition-all duration-500 ${
          allDone ? "border-emerald-200 ring-2 ring-emerald-200 scale-[1.01]" : "border-slate-100"
        }`}
      >
        {Header}

        <div
          className={`relative p-5 ${
            allDone
              ? "bg-[radial-gradient(circle,rgba(16,185,129,0.08)_1px,transparent_1px)]"
              : "bg-[radial-gradient(circle,rgba(0,0,0,0.06)_1px,transparent_1px)]"
          } [background-size:10px_10px]`}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {allDone ? "You crushed it today" : "Things to do today"}
          </h3>

          {showAddTask && !allDone && (
            <div className="mb-4 p-3 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <Input
                placeholder="Enter new task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTask()
                  if (e.key === "Escape") setShowAddTask(false)
                }}
                className="mb-2"
                disabled={isPending}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddTask} disabled={isPending || !newTaskText.trim()}>
                  Add
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddTask(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!allDone && (
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={`flex items-center gap-3 px-2 py-1 rounded-lg transition group ${
                    item.done ? "bg-slate-100" : ""
                  }`}
                >
                  <label className="relative inline-flex items-center justify-center w-6 h-6">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => handleToggleItem(item.id, item.done, item.text)}
                      disabled={isPending}
                      className="peer appearance-none absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <span
                      className={`flex items-center justify-center w-5 h-5 rounded-md border transition-all duration-200 ease-out transform ${
                        item.done
                          ? "bg-gray-900 border-gray-900 scale-95"
                          : "border-gray-300 bg-white scale-100"
                      }`}
                    >
                      <svg
                        className={`w-3 h-3 text-white transition-opacity duration-200 ${
                          item.done ? "opacity-100" : "opacity-0"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 12 9"
                      >
                        <path d="M1 4.2L4 7L11 1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </label>

                  <span
                    className={`text-sm transition-all duration-200 flex-1 ${
                      item.done ? "font-semibold text-gray-900 translate-x-[2px]" : "text-gray-900"
                    }`}
                  >
                    {item.text}
                  </span>

                  <button
                    onClick={() => handleDeleteTask(item.id)}
                    disabled={isPending}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {allDone && (
            <div className="relative">
              <p className="mt-1 text-sm text-gray-700 font-medium">Take a breather and celebrate!</p>
              {celebrating && <ConfettiOverlay />}
            </div>
          )}

          {!allDone && (
            <p className="mt-4 text-sm text-gray-700 font-medium">Keep up the great work today!</p>
          )}
        </div>
      </div>

      <Dialog open={completionDialog.open} onOpenChange={(open) => !open && setCompletionDialog({ open: false, todoId: "", todoText: "" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
            <DialogDescription>
              Add notes about how you completed: <strong>{completionDialog.todoText}</strong>
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="What did you do to complete this task?"
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            rows={4}
            className="mt-2"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompletionDialog({ open: false, todoId: "", todoText: "" })}>
              Cancel
            </Button>
            <Button onClick={handleCompleteWithNotes} disabled={isPending}>
              Complete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ConfettiOverlay() {
  const pieces = Array.from({ length: 36 })
  return (
    <>
      <style>
        {`
        @keyframes confetti-fall {
          0% { transform: translateY(-20vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(80vh) rotate(720deg); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .confetti-piece { animation: none !important; }
        }
      `}
      </style>
      <div className="pointer-events-none fixed inset-0">
        {pieces.map((_, i) => {
          const left = Math.random() * 100
          const delay = Math.random() * 0.5
          const duration = 2.5 + Math.random() * 1.2
          const size = 6 + Math.random() * 6
          const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
          return (
            <span
              key={i}
              className="confetti-piece absolute rounded-sm"
              style={{
                left: `${left}%`,
                top: "-10px",
                width: `${size}px`,
                height: `${size * 0.4}px`,
                backgroundColor: color,
                transform: "translateY(0)",
                animation: `confetti-fall ${duration}s ease-in forwards`,
                animationDelay: `${delay}s`,
              }}
            />
          )
        })}
      </div>
    </>
  )
}
