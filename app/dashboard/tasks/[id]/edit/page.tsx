import { createServerSupabaseClient } from "@/lib/supabase/server"
import { TaskForm } from "@/components/task-form"
import { notFound } from "next/navigation"

export default async function EditTaskPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerSupabaseClient()

  const { data: task } = await supabase.from("tasks").select("*").eq("id", params.id).single()

  if (!task) {
    return (
        <div>
            <h1>No task found</h1>
        </div>
    )
  }

  const { data: users } = await supabase.from("users").select("id, name").order("name")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Task</h1>
        <p className="text-muted-foreground">Update task details and assignment</p>
      </div>

      <TaskForm task={task} users={users || []} />
    </div>
  )
}
