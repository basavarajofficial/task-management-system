"use client"

import { useEffect, useState } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { UserTable } from "@/components/user-table"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function UsersPage() {
  const { user: currentUser, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) {
        setLoading(false)
        return
      }

      try {
        console.log("Fetching users...")
        const { data, error } = await supabase.from("users").select("*").order("name")

        if (error) {
          console.error("Users fetch error:", error)
          toast({
            title: "Error",
            description: "Could not load users. Please try again.",
            variant: "destructive",
          })
        } else {
          console.log("Users loaded:", data)
          setUsers(data || [])
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "Could not load users. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchUsers()
    }
  }, [currentUser, authLoading, supabase, toast])

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading users...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <Link href="/dashboard/users/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </Link>
      </div>

      <UserTable users={users} />

      {/* Debug Information */}
      {/* <div className="text-xs text-muted-foreground border-t pt-4">
        <p>Debug: {users.length} users loaded</p>
        <p>Current user: {currentUser?.email}</p>
      </div> */}
    </div>
  )
}
