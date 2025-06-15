"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // First, sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        // Wait a moment for the trigger to potentially create the profile
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Check if profile was created by trigger, if not create manually
        const { data: existingProfile } = await supabase.from("users").select("*").eq("id", authData.user.id).single()

        if (!existingProfile) {
          // Create user profile manually
          const { error: profileError } = await supabase.from("users").insert([
            {
              id: authData.user.id,
              name,
              email,
              role: "user",
            },
          ])

          if (profileError) {
            console.error("Profile creation error:", profileError)
            // Don't throw here as the user is already created in auth
            toast({
              title: "Account created with warning",
              description:
                "Your account was created but there was an issue setting up your profile. Please contact support if you experience issues.",
              variant: "destructive",
            })
          }
        }

        if (authData.user.email_confirmed_at) {
          // User is immediately confirmed
          toast({
            title: "Account created!",
            description: "You have been registered and logged in successfully.",
          })
          router.push("/dashboard")
        } else {
          // Email confirmation required
          toast({
            title: "Check your email!",
            description: "We've sent you a confirmation link to complete your registration.",
          })
        }
      }

      router.refresh()
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Create Account
      </Button>
    </form>
  )
}
