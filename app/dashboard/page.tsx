"use client"

import { useEffect, useState } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface TaskStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
}

interface RecentTask {
  id: string
  title: string
  status: string
  due_date: string | null
  users: {
    name: string
  } | null
}

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  console.log("DashboardPage user:", user);

  const [stats, setStats] = useState<TaskStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  })
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        console.log("Fetching dashboard data for user:", user.id)

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("Profile error:", profileError)
          if (profileError.code === "PGRST116") {
            // Profile doesn't exist, create one
            const { data: newProfile, error: createError } = await supabase
              .from("users")
              .insert([
                {
                  id: user.id,
                  name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
                  email: user.email!,
                  role: "user",
                },
              ])
              .select()
              .single()

            if (createError) {
              console.error("Error creating profile:", createError)
              toast({
                title: "Profile Error",
                description: "Could not create user profile. Please contact support.",
                variant: "destructive",
              })
            } else {
              setProfile(newProfile)
            }
          }
        } else {
          setProfile(profileData)
        }

        // Get tasks statistics
        console.log("Fetching task statistics...")

        const [totalTasksResult, completedTasksResult, pendingTasksResult] = await Promise.all([
          supabase.from("tasks").select("*", { count: "exact", head: true }),
          supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "completed"),
          supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "pending"),
        ])

        console.log("Task stats results:", {
          total: totalTasksResult,
          completed: completedTasksResult,
          pending: pendingTasksResult,
        })

        setStats({
          totalTasks: totalTasksResult.count || 0,
          completedTasks: completedTasksResult.count || 0,
          pendingTasks: pendingTasksResult.count || 0,
        })

        // Get recent tasks
        console.log("Fetching recent tasks...")
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select(`
            id,
            title,
            status,
            due_date,
            users (name)
          `)
          .order("created_at", { ascending: false })
          .limit(5)

        if (tasksError) {
          console.error("Tasks error:", tasksError)
        } else {
          console.log("Recent tasks:", tasksData)
          setRecentTasks(tasksData || [])
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Data Error",
          description: "Could not load dashboard data. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchData()
    }
  }, [user, authLoading, supabase, toast])

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Not authenticated</h1>
          <p className="text-muted-foreground">Please log in to access the dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {profile?.name || user.email?.split("@")[0] || "User"}</p>
        {user && <p className="text-xs text-muted-foreground mt-1">User ID: {user.id}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">All tasks in system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks marked as complete</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks awaiting completion</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
          <CardDescription>Your most recent tasks</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTasks.length > 0 ? (
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">Assigned to: {task.users?.name || "Unassigned"}</p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs ${
                      task.status === "completed"
                        ? "bg-green-500/20 text-green-500"
                        : task.status === "in_progress"
                          ? "bg-blue-500/20 text-blue-500"
                          : "bg-amber-500/20 text-amber-500"
                    }`}
                  >
                    {task.status.replace("_", " ")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tasks found</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first task to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Information */}
      {/* <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div>
            <strong>Auth Status:</strong> {user ? "Authenticated" : "Not authenticated"}
          </div>
          <div>
            <strong>User Email:</strong> {user?.email || "N/A"}
          </div>
          <div>
            <strong>Profile Loaded:</strong> {profile ? "Yes" : "No"}
          </div>
          <div>
            <strong>Profile Name:</strong> {profile?.name || "N/A"}
          </div>
          <div>
            <strong>Tasks Loaded:</strong> {recentTasks.length} tasks
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}
