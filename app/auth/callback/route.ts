import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const role = requestUrl.searchParams.get("role") || "jobseeker"

  if (code) {
    const cookieStore = cookies()
    const supabase = createClient()

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=authError`)
    }

    // If this is from OAuth signup, set the role
    if (requestUrl.searchParams.has("role") && data.user) {
      await supabase.auth.updateUser({
        data: { role },
      })
    }

    // Check if user has a profile already
    if (data.user) {
      const userRole = data.user.user_metadata?.role || role

      try {
        // Check if a profile exists
        const tableName = userRole === "jobseeker" ? "job_seeker_profiles" : "recruiter_profiles"

        const { data: profileData, error: profileError } = await supabase
          .from(tableName)
          .select("id")
          .eq("user_id", data.user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError
        }

        // If profile doesn't exist, redirect to create profile
        if (!profileData) {
          return NextResponse.redirect(`${requestUrl.origin}/create-profile/${userRole}`)
        }

        // If profile exists, redirect to dashboard
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      } catch (error) {
        console.error("Error checking profile:", error)
        // Redirect to create profile if there's an error
        return NextResponse.redirect(`${requestUrl.origin}/create-profile/${userRole}`)
      }
    }
  }

  // Return the user to the login page if something went wrong
  return NextResponse.redirect(`${requestUrl.origin}/login?error=authError`)
}

