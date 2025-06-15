import { createServerSupabaseClient } from "@/lib/supabase/server"
import { TaskForm } from "@/components/task-form"

export default async function NewTaskPage() {
  const supabase = createServerSupabaseClient()

  const { data: users } = await supabase.from("users").select("id, name").order("name")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Task</h1>
        <p className="text-muted-foreground">Add a new task and assign it to a team member</p>
      </div>

      <TaskForm users={users || []} />
    </div>
  )
}
