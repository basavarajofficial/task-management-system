"use client"

import { useEffect, useState } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { TaskTable } from "@/components/task-table"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface Task {
  id: string
  title: string
  description: string
  status: string
  due_date: string
  assigned_to: string | null
  users: {
    name: string
  } | null
}

export default function TasksPage() {
  const { user: currentUser, loading: authLoading } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const fetchTasks = async () => {
      if (!currentUser) {
        setLoading(false)
        return
      }

      try {
        console.log("Fetching tasks...")
        const { data, error } = await supabase
          .from("tasks")
          .select(`
            *,
            users (
              name
            )
          `)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Tasks fetch error:", error)
          toast({
            title: "Error",
            description: "Could not load tasks. Please try again.",
            variant: "destructive",
          })
        } else {
          console.log("Tasks loaded:", data)
          setTasks(data || [])
        }
      } catch (error) {
        console.error("Error fetching tasks:", error)
        toast({
          title: "Error",
          description: "Could not load tasks. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchTasks()
    }
  }, [currentUser, authLoading, supabase, toast])

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading tasks...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <Link href="/dashboard/tasks/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </Link>
      </div>

      <TaskTable tasks={tasks} />

      {/* Debug Information */}
      {/* <div className="text-xs text-muted-foreground border-t pt-4">
        <p>Debug: {tasks.length} tasks loaded</p>
        <p>Current user: {currentUser?.email}</p>
      </div> */}
    </div>
  )
}
