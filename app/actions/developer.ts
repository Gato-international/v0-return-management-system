"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getTodosAction() {
  try {
    const supabase = createAdminClient()
    const { data: todos, error } = await supabase
      .from("developer_todos")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching todos:", error)
      return { todos: [], error: "Failed to fetch todos" }
    }

    return { todos: todos || [] }
  } catch (error) {
    console.error("Error in getTodosAction:", error)
    return { todos: [], error: "An unexpected error occurred" }
  }
}

export async function createTodoAction(text: string) {
  try {
    const user = await requireAuth()
    const supabase = createAdminClient()

    const { data: todo, error } = await supabase
      .from("developer_todos")
      .insert({
        text,
        done: false,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating todo:", error)
      return { error: "Failed to create todo" }
    }

    revalidatePath("/admin/developer")
    return { success: true, todo }
  } catch (error) {
    console.error("Error in createTodoAction:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function toggleTodoAction(id: string, done: boolean, completionNotes?: string) {
  try {
    await requireAuth()
    const supabase = createAdminClient()

    const updateData: any = {
      done,
      updated_at: new Date().toISOString(),
    }

    if (done && completionNotes) {
      updateData.completion_notes = completionNotes
      updateData.completed_at = new Date().toISOString()
    } else if (!done) {
      updateData.completion_notes = null
      updateData.completed_at = null
    }

    const { error } = await supabase
      .from("developer_todos")
      .update(updateData)
      .eq("id", id)

    if (error) {
      console.error("Error toggling todo:", error)
      return { error: "Failed to update todo" }
    }

    revalidatePath("/admin/developer")
    return { success: true }
  } catch (error) {
    console.error("Error in toggleTodoAction:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function deleteTodoAction(id: string) {
  try {
    await requireAuth()
    const supabase = createAdminClient()

    const { error } = await supabase
      .from("developer_todos")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting todo:", error)
      return { error: "Failed to delete todo" }
    }

    revalidatePath("/admin/developer")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteTodoAction:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function resetTodosAction() {
  try {
    await requireAuth()
    const supabase = createAdminClient()

    const { error } = await supabase
      .from("developer_todos")
      .update({ done: false, completion_notes: null, completed_at: null })
      .eq("done", true)

    if (error) {
      console.error("Error resetting todos:", error)
      return { error: "Failed to reset todos" }
    }

    revalidatePath("/admin/developer")
    return { success: true }
  } catch (error) {
    console.error("Error in resetTodosAction:", error)
    return { error: "An unexpected error occurred" }
  }
}
