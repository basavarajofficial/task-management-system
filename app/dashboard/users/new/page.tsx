import { UserForm } from "@/components/user-form"

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New User</h1>
        <p className="text-muted-foreground">Create a new user account in the system</p>
      </div>

      <UserForm />
    </div>
  )
}
