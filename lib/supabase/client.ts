import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export const createClientSupabaseClient = () => {
  return createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  })
}

// Helper function to handle auth errors
export const handleAuthError = async (supabase: ReturnType<typeof createClientSupabaseClient>) => {
  try {
    // Clear any invalid session data
    await supabase.auth.signOut()
  } catch (error) {
    // If signOut fails, clear local storage manually
    if (typeof window !== "undefined") {
      localStorage.removeItem("supabase.auth.token")
      sessionStorage.removeItem("supabase.auth.token")
    }
  }
}
