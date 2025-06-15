import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    // If there's an auth error, clear the session and redirect to login
    if (error) {
      console.error("Middleware auth error:", error)
      const response = NextResponse.redirect(new URL("/login", req.url))
      // Clear auth cookies
      response.cookies.delete("supabase-auth-token")
      response.cookies.delete("supabase.auth.token")
      return response
    }

    // If user is not signed in and trying to access dashboard, redirect to login
    if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // If user is signed in and trying to access login, redirect to dashboard
    if (session && req.nextUrl.pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // On any error, redirect to login and clear cookies
    const response = NextResponse.redirect(new URL("/login", req.url))
    response.cookies.delete("supabase-auth-token")
    response.cookies.delete("supabase.auth.token")
    return response
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/"],
}
