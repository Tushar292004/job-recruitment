"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Notifications } from "@/components/notifications"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Briefcase, User, LogOut, ChevronDown, Search, LayoutDashboard } from "lucide-react"

export function Header() {
  const { user, isLoading, signOut } = useSupabase()
  const [userRole, setUserRole] = useState<"jobseeker" | "recruiter" | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Skip header on login and signup pages
  const authPages = ["/login", "/signup", "/auth/callback", "/create-profile/jobseeker", "/create-profile/recruiter"]
  const isAuthPage = authPages.includes(pathname)

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return

      try {
        const { data: userData } = await supabase.auth.getUser()
        setUserRole(userData.user?.user_metadata?.role as "jobseeker" | "recruiter" )
        setUserEmail(userData.user?.email || null)

        // Fetch the user name based on role
        if (userData.user?.user_metadata?.role === "jobseeker") {
          const { data } = await supabase.from("job_seeker_profiles").select("name").eq("user_id", user.id).single()

          setUserName(data?.name || null)
        } else if (userData.user?.user_metadata?.role === "recruiter") {
          const { data } = await supabase.from("recruiter_profiles").select("name").eq("user_id", user.id).single()

          setUserName(data?.name || null)
        }
      } catch (error) {
        console.error("Error fetching user details:", error)
      }
    }

    if (user) {
      fetchUserDetails()
    }
  }, [user, supabase])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (isAuthPage) return null

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Link href="/" className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <span>JobConnect</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {!isLoading && (
            <>
              {user ? (
                <>
                  {/* Navigation based on user role */}
                  {userRole === "recruiter" && (
                    <nav className="hidden md:flex gap-6">
                      <ModeToggle />
                      <Link
                        href="/dashboard"
                        className={`flex items-center gap-1 ${pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground hover:text-foreground"} transition-colors`}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/search"
                        className={`flex items-center gap-1 ${pathname === "/search" ? "text-foreground" : "text-muted-foreground hover:text-foreground"} transition-colors`}
                      >
                        <Search className="h-4 w-4" />
                        <span>Find Candidates</span>
                      </Link>
                    </nav>
                  )}

                  {userRole === "jobseeker" && (
                    <nav className="hidden md:flex gap-6">
                      <Link
                        href="/dashboard"
                        className={`flex items-center gap-1 ${pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground hover:text-foreground"} transition-colors`}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </nav>
                  )}

                  {/* Notifications */}
                  <Notifications userRole={userRole} userId={user.id} />
                  <ModeToggle />
                  {/* User profile dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline-block">{userName || userEmail}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="px-2 py-1.5 text-sm font-medium">
                        {userName && <div className="font-semibold">{userName}</div>}
                        <div className="text-xs text-muted-foreground">{userEmail}</div>
                        <div className="text-xs text-muted-foreground capitalize">{userRole}</div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile/edit">Edit Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <nav className="hidden md:flex gap-6">
                    <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                      Features
                    </Link>
                    <Link
                      href="#how-it-works"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      How it works
                    </Link>
                  </nav>
                  <div className="flex items-center gap-2">
                    <ModeToggle />
                    <Link href="/login">
                      <Button variant="outline">Log in</Button>
                    </Link>
                    <Link href="/signup">
                      <Button>Sign up</Button>
                    </Link>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}

