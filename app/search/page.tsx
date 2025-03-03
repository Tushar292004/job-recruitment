"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Briefcase, Search, Filter, User, X, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

export default function SearchPage() {
  const { user, isLoading: authLoading } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [recruiterProfile, setRecruiterProfile] = useState<any>(null)

  // Search criteria
  const [role, setRole] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [projectRequired, setProjectRequired] = useState(false)
  const [experience, setExperience] = useState([0])
  const [salaryRange, setSalaryRange] = useState([0, 200000])
  const [language, setLanguage] = useState("")
  const [jobType, setJobType] = useState<string>("full-time")

  // Search results
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [customMessage, setCustomMessage] = useState("")

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/login")
      return
    }

    const fetchRecruiterProfile = async () => {
      setIsLoading(true)

      try {
        // Get user metadata to determine role
        const { data: userData } = await supabase.auth.getUser()
        const role = userData.user?.user_metadata?.role

        if (role === "recruiter") {
          toast({
            title: "Access denied",
            description: "Only recruiters can access the search page.",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        // Fetch recruiter profile
        const { data: profileData, error } = await supabase
          .from("recruiter_profiles")
          .select(`
            *,
            companies(*)
          `)
          .eq("user_id", user.id)
          .single()

        if (error) throw error
        setRecruiterProfile(profileData)
      } catch (error: any) {
        console.error("Error fetching recruiter profile:", error)
        toast({
          title: "Error loading profile",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecruiterProfile()
  }, [user, authLoading, router, supabase, toast])

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleSearch = async () => {
    if (skills.length === 0) {
      toast({
        title: "Skills required",
        description: "Please add at least one required skill.",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)

    try {
      // In a real application, this would be a complex database query
      // For this example, we'll simulate the search with a simple query
      const { data, error } = await supabase
        .from("job_seeker_profiles")
        .select("*")
        .eq("current_status", "seeking")
        .gte("work_experience", experience[0])
        .gte("min_salary", salaryRange[0])
        .lte("min_salary", salaryRange[1])

      if (error) throw error

      // Filter results based on skills match (at least 60% match)
      const filteredResults = data
        .filter((candidate: any) => {
          // Calculate skill match percentage
          const matchedSkills = candidate.skills.filter((skill: string) => skills.includes(skill)).length

          const matchPercentage = (matchedSkills / skills.length) * 100

          // Check if project is required and candidate has projects
          if (projectRequired && (!candidate.projects || candidate.projects.length === 0)) {
            return false
          }

          // Check job type if specified
          if (jobType && candidate.job_type !== jobType) {
            return false
          }

          // Check language if specified
          if (language && !candidate.languages.includes(language)) {
            return false
          }

          return matchPercentage >= 60
        })
        .map((candidate: any) => {
          // Calculate match percentage for display
          const matchedSkills = candidate.skills.filter((skill: string) => skills.includes(skill)).length

          const matchPercentage = Math.round((matchedSkills / skills.length) * 100)

          return {
            ...candidate,
            matchPercentage,
          }
        })
        .sort((a: any, b: any) => b.matchPercentage - a.matchPercentage)

      setSearchResults(filteredResults)

      if (filteredResults.length === 0) {
        toast({
          title: "No matches found",
          description: "No candidates match your search criteria. Try adjusting your filters.",
        })
      } else {
        toast({
          title: "Search complete",
          description: `Found ${filteredResults.length} candidates matching your criteria.`,
        })
      }
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectCandidate = (candidate: any) => {
    setSelectedCandidate(candidate)

    // Generate default message
    const defaultMessage = `Hello, ${candidate.name}
${recruiterProfile.companies.name} is seeking a ${role} with required skills: ${skills.join(", ")}
Salary: $${salaryRange[0].toLocaleString()} - $${salaryRange[1].toLocaleString()}
We found your profile a great match for this role. If you're interested, please reply with an acknowledgment.

Best Regards,
${recruiterProfile.name}`

    setCustomMessage(defaultMessage)
  }

  const handleSendInvitation = async () => {
    if (!selectedCandidate) return

    try {
      const { error } = await supabase.from("invitations").insert({
        recruiter_id: recruiterProfile.id,
        job_seeker_id: selectedCandidate.id,
        role: role,
        skills: skills,
        salary_range: `$${salaryRange[0].toLocaleString()} - $${salaryRange[1].toLocaleString()}`,
        custom_message: customMessage,
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Invitation sent",
        description: `Your invitation has been sent to ${selectedCandidate.name}.`,
      })

      // Reset selection
      setSelectedCandidate(null)
      setCustomMessage("")
    } catch (error: any) {
      toast({
        title: "Error sending invitation",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Briefcase className="h-5 w-5 text-primary" />
            <span>JobConnect</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Find Candidates</h1>
          <p className="text-muted-foreground mt-2">Search for job seekers that match your requirements</p>
        </div>

        {selectedCandidate ? (
          <div className="grid gap-8">
            <Button
              variant="ghost"
              className="w-fit flex items-center gap-2"
              onClick={() => setSelectedCandidate(null)}
            >
              <ArrowLeft className="h-4 w-4" /> Back to search results
            </Button>

            <Card>
              <CardHeader>
                <CardTitle>Send Invitation to {selectedCandidate.name}</CardTitle>
                <CardDescription>Customize your message to the candidate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-1">Candidate</h3>
                    <p>{selectedCandidate.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Match Percentage</h3>
                    <p className="text-primary font-bold">{selectedCandidate.matchPercentage}%</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Experience</h3>
                    <p>{selectedCandidate.work_experience} years</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Minimum Salary</h3>
                    <p>${selectedCandidate.min_salary.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Invitation Message</Label>
                  <Textarea
                    id="message"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={10}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setSelectedCandidate(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSendInvitation}>Send Invitation</Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Search Criteria
                  </CardTitle>
                  <CardDescription>Define your requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role/Job Title</Label>
                    <Input
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Full Stack Developer"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Required Skills</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {skills.map((skill, index) => (
                        <div key={index} className="flex items-center bg-muted px-3 py-1 rounded-full">
                          <span>{skill}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 ml-1"
                            onClick={() => removeSkill(skill)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addSkill()
                          }
                        }}
                      />
                      <Button type="button" onClick={addSkill}>
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="project"
                      checked={projectRequired}
                      onCheckedChange={(checked) => setProjectRequired(checked as boolean)}
                    />
                    <Label htmlFor="project">Project Required</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Experience (years)</Label>
                    <Slider value={experience} min={0} max={15} step={1} onValueChange={setExperience} />
                    <div className="text-sm text-muted-foreground">{experience[0]} years minimum</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Salary Range</Label>
                    <Slider value={salaryRange} min={0} max={200000} step={5000} onValueChange={setSalaryRange} />
                    <div className="text-sm text-muted-foreground">
                      ${salaryRange[0].toLocaleString()} - ${salaryRange[1].toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred Language</Label>
                    <Input
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      placeholder="e.g. English"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobType">Job Type</Label>
                    <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-Time</SelectItem>
                        <SelectItem value="part-time">Part-Time</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full" onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Searching...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Search Candidates
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Search Results
                  </CardTitle>
                  <CardDescription>Candidates matching your criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  {searchResults.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No search results yet. Use the filters to find candidates.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {searchResults.map((candidate) => (
                        <motion.div
                          key={candidate.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className="overflow-hidden">
                            <div className="h-1.5 bg-primary" style={{ width: `${candidate.matchPercentage}%` }} />
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-lg">{candidate.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {candidate.field_of_interest} • {candidate.work_experience} years experience
                                  </p>
                                  <div className="mt-2">
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {candidate.skills.slice(0, 5).map((skill: string, i: number) => (
                                        <span
                                          key={i}
                                          className={`text-xs px-2 py-0.5 rounded-full ${
                                            skills.includes(skill)
                                              ? "bg-primary/20 text-primary"
                                              : "bg-muted text-muted-foreground"
                                          }`}
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                      {candidate.skills.length > 5 && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                          +{candidate.skills.length - 5} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end">
                                  <div className="text-lg font-bold text-primary">
                                    {candidate.matchPercentage}% match
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Min. ${candidate.min_salary.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-4">
                                <Button className="w-full" onClick={() => handleSelectCandidate(candidate)}>
                                  Send Invitation
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

