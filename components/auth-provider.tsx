"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientSupabaseClient, handleAuthError } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientSupabaseClient()

  const refreshUser = async () => {
    try {
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error("Error getting user:", error)
        await handleAuthError(supabase)
        setUser(null)
      } else {
        setUser(currentUser)
      }
    } catch (error) {
      console.error("Auth refresh error:", error)
      await handleAuthError(supabase)
      setUser(null)
    }
  }

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Session error:", error)
          await handleAuthError(supabase)
          setUser(null)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        await handleAuthError(supabase)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id)

      if (event === "SIGNED_OUT") {
        setUser(null)
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setUser(session?.user ?? null)
      } else if (event === "USER_UPDATED") {
        setUser(session?.user ?? null)
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error("Sign out error:", error)
      await handleAuthError(supabase)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
