import { createServerSupabaseClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/profile-form"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <ProfileForm user={user} profile={profile} />
    </div>
  )
}
