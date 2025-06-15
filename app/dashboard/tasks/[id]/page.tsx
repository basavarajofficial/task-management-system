import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { TaskProof } from "@/components/task-proof"

export default async function TaskDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerSupabaseClient()

  const { data: task } = await supabase
    .from("tasks")
    .select(`
      *,
      users (
        id,
        name,
        email
      )
    `)
    .eq("id", params.id)
    .single()

  if (!task) {
    return (
        <div>
            <h1>No task found</h1>
        </div>
    )
  }

  // Get proofs for this task
  const { data: proofs } = await supabase
    .from("task_proofs")
    .select("*")
    .eq("task_id", task.id)
    .order("created_at", { ascending: false })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
      case "in_progress":
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>
      default:
        return (
          <Badge variant="outline" className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/20">
            Pending
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/tasks">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
        </div>
        <Link href={`/dashboard/tasks/${task.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Task
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Status</h3>
              <div className="mt-1">{getStatusBadge(task.status)}</div>
            </div>
            <div>
              <h3 className="font-medium">Due Date</h3>
              <p className="text-muted-foreground">
                {task.due_date ? format(new Date(task.due_date), "MMMM d, yyyy") : "No due date set"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Assigned To</h3>
              <p className="text-muted-foreground">{task.users ? task.users.name : "Unassigned"}</p>
            </div>
            <div>
              <h3 className="font-medium">Description</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {task.description || "No description provided"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Proof</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskProof taskId={task.id} existingProofs={proofs || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
