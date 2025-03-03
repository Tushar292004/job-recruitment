"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"

export default function RecruiterProfilePage() {
  const { user, isLoading: authLoading } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(false)

  // Company Details
  const [companyName, setCompanyName] = useState("")
  const [companyDescription, setCompanyDescription] = useState("")
  const [companyWebsite, setCompanyWebsite] = useState("")

  // Recruiter Details
  const [recruiterName, setRecruiterName] = useState("")
  const [recruiterDescription, setRecruiterDescription] = useState("")
  const [recruiterExperience, setRecruiterExperience] = useState("")

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
      const { error: recruiterError } = await supabase.from("recruiter_profiles").insert({
        user_id: user.id,
        company_id: companyData[0].id,
        name: recruiterName,
        description: recruiterDescription,
        experience: recruiterExperience,
        employees_hired: 0,
      })

      if (recruiterError) throw recruiterError

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

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Create Your Recruiter Profile</h1>
        <p className="text-muted-foreground mt-2">Complete your profile to start finding talent</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>Tell us about your company</CardDescription>
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
              <CardDescription>Tell us about yourself as a recruiter</CardDescription>
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
                  onChange={(e) => setRecruiterExperience(e.target.value)}
                  placeholder="5"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Profile..." : "Complete Profile"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </motion.div>
    </div>
  )
}

