"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClientSupabaseClient, handleAuthError } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Clear any existing invalid sessions first
      await handleAuthError(supabase)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Check if user profile exists
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError && profileError.code === "PGRST116") {
          // Profile doesn't exist, create one
          const { error: insertError } = await supabase.from("users").insert([
            {
              id: data.user.id,
              name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User",
              email: data.user.email!,
              role: "user",
            },
          ])

          if (insertError) {
            console.error("Error creating profile:", insertError)
            toast({
              title: "Login successful with warning",
              description:
                "You're logged in but there was an issue with your profile. Please contact support if you experience issues.",
              variant: "destructive",
            })
          }
        }

        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        })

        router.push("/dashboard")
        router.refresh()
      }
    } catch (error: any) {
      console.error("Login error:", error)
      let errorMessage = "Invalid email or password"

      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password"
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Please check your email and confirm your account"
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
        className="rounded-md"
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Button variant="link" className="h-auto p-0 text-xs" type="button">
            Forgot password?
          </Button>
        </div>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full rounded-[0.5rem]" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Sign In
      </Button>
    </form>
  )
}
