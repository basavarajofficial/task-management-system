import { createServerSupabaseClient } from "@/lib/supabase/server"
import { UserForm } from "@/components/user-form"
import { notFound } from "next/navigation"

export default async function EditUserPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerSupabaseClient()

  const { data: user } = await supabase.from("users").select("*").eq("id", params.id).single()

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        <p className="text-muted-foreground">Update user information</p>
      </div>

      <UserForm user={user} />
    </div>
  )
}
