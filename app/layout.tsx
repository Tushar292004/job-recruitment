import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { createClient } from "@/utils/supabase/client"
import { SupabaseProvider } from "@/components/supabase-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JobConnect - Recruitment Platform",
  description: "Connect job seekers with recruiters efficiently",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = createClient()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SupabaseProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}



import './globals.css'