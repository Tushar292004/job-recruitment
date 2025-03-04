"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { Session, User } from "@supabase/supabase-js"
import { useToast } from "@/components/ui/use-toast"
import { usePathname, useRouter } from "next/navigation"

type SupabaseContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  refreshSession: async () => {},
})

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error

      setSession(data.session)
      setUser(data.session?.user ?? null)
    } catch (error) {
      console.error("Error refreshing session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Error getting session:", error)
        setIsLoading(false)
        return
      }

      setSession(data.session)
      setUser(data.session?.user ?? null)
      setIsLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)

      // Handle auth events
      if (event === "SIGNED_IN") {
        toast({
          title: "Signed in successfully",
          description: "Welcome back!",
        })

        // Auto redirect to dashboard if on auth pages
        if (["/login", "/signup"].includes(pathname)) {
          router.push("/dashboard")
        }
      } else if (event === "SIGNED_OUT") {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        })

        // Redirect to home page if not already there
        if (pathname !== "/") {
          router.push("/")
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, toast, router, pathname])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    // Handled by auth state change event
  }

  const value = {
    user,
    session,
    isLoading,
    signOut,
    refreshSession,
  }

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>
}

export const useSupabase = () => useContext(SupabaseContext)

