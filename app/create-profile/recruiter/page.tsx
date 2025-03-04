"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@supabase/supabase-js"
import type { User } from "@/types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const Page = async () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [companyDescription, setCompanyDescription] = useState("")
  const [companyWebsite, setCompanyWebsite] = useState("")
  const [recruiterName, setRecruiterName] = useState("")
  const [recruiterDescription, setRecruiterDescription] = useState("")
  const [recruiterExperience, setRecruiterExperience] = useState(0)
  const session = await supabase.auth.getSession()
  const user: User | null = session.data.session?.user ?? null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create your profile.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsLoading(true)

    try {
      // Create company profile
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: companyName,
          description: companyDescription,
          website: companyWebsite,
        })
        .select()

      if (companyError) throw companyError

      // Create recruiter profile
      const { data: recruiterData, error: recruiterError } = await supabase
        .from("recruiter_profiles")
        .insert({
          user_id: user.id,
          company_id: companyData[0].id,
          name: recruiterName,
          description: recruiterDescription,
          experience: recruiterExperience,
          employees_hired: 0,
        })
        .select()
        .single()

      if (recruiterError) throw recruiterError

      // Create welcome notification
      await supabase.from("notifications").insert({
        user_id: user.id,
        message:
          "Welcome to JobConnect! Your recruiter profile has been created successfully. You can now search for candidates based on your requirements.",
        type: "welcome",
      })

      toast({
        title: "Profile created",
        description: "Your recruiter profile has been created successfully.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error creating profile",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (


    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>Update your company information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Inc."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-description">Company Description</Label>
            <Textarea
              id="company-description"
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="Tell us about your company, its mission, and values..."
              rows={4}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-website">Company Website</Label>
            <Input
              id="company-website"
              type="url"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              placeholder="https://acme.com"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recruiter Details</CardTitle>
          <CardDescription>Update your recruiter information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recruiter-name">Your Name</Label>
            <Input
              id="recruiter-name"
              value={recruiterName}
              onChange={(e) => setRecruiterName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recruiter-description">About You</Label>
            <Textarea
              id="recruiter-description"
              value={recruiterDescription}
              onChange={(e) => setRecruiterDescription(e.target.value)}
              placeholder="Describe your role and approach to recruitment..."
              rows={4}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recruiter-experience">Years of Experience</Label>
            <Input
              id="recruiter-experience"
              value={recruiterExperience}
              onChange={(e) => setRecruiterExperience(Number.parseInt(e.target.value, 10))}
              placeholder="5"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? "Creating..." : "Create Profile"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Page

