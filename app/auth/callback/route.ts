import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user) {
      // Set the user's role in the session
      await supabase.auth.updateUser({
        data: { role: data.user.user_metadata.role },
      })

      // Redirect to profile creation or dashboard based on whether the user has a profile
      const { data: profileData, error: profileError } = await supabase
        .from(data.user.user_metadata.role === "jobseeker" ? "job_seeker_profiles" : "recruiter_profiles")
        .select("id")
        .eq("user_id", data.user.id)
        .single()

      if (profileError || !profileData) {
        return NextResponse.redirect(`${requestUrl.origin}/create-profile/${data.user.user_metadata.role}`)
      } else {
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      }
    }
  }

  // Return the user to the homepage if something went wrong
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}

