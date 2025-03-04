"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash2 } from "lucide-react"

export default function EditProfilePage() {
  const { user, isLoading: authLoading } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [userRole, setUserRole] = useState<"jobseeker" | "recruiter" | null>(null)
  const [profileData, setProfileData] = useState<any>(null)

  // Job Seeker Profile Fields
  const [name, setName] = useState("")
  const [dob, setDob] = useState("")
  const [university, setUniversity] = useState("")
  const [yearOfPassing, setYearOfPassing] = useState("")
  const [cgpa, setCgpa] = useState("")
  const [degree, setDegree] = useState("")
  const [branch, setBranch] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [projects, setProjects] = useState<any[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [newLanguage, setNewLanguage] = useState("")
  const [fieldOfInterest, setFieldOfInterest] = useState("")
  const [workExperience, setWorkExperience] = useState("0")
  const [minSalary, setMinSalary] = useState("")
  const [jobType, setJobType] = useState<string>("full-time")
  const [currentStatus, setCurrentStatus] = useState<string>("seeking")

  // Recruiter Profile Fields
  const [companyName, setCompanyName] = useState("")
  const [companyDescription, setCompanyDescription] = useState("")
  const [companyWebsite, setCompanyWebsite] = useState("")
  const [recruiterName, setRecruiterName] = useState("")
  const [recruiterDescription, setRecruiterDescription] = useState("")
  const [recruiterExperience, setRecruiterExperience] = useState("")

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/login")
      return
    }

    const fetchUserData = async () => {
      setIsLoading(true)

      try {
        // Get user metadata to determine role
        const { data: userData } = await supabase.auth.getUser()
        const role = userData.user?.user_metadata?.role as "jobseeker" | "recruiter" | null
        setUserRole(role)

        // Fetch profile data based on role
        if (role === "jobseeker") {
          const { data: profileData, error } = await supabase
            .from("job_seeker_profiles")
            .select(`*, companies (*)`)
            .eq("user_id", user.id)
            .single()

          if (error) throw error

          setProfileData(profileData)

          // Set form fields
          setName(profileData.name || "")
          setDob(profileData.date_of_birth || "")
          setUniversity(profileData.university || "")
          setYearOfPassing(profileData.year_of_passing?.toString() || "")
          setCgpa(profileData.cgpa || "")
          setDegree(profileData.degree || "")
          setBranch(profileData.branch || "")
          setSkills(profileData.skills || [])
          setProjects(profileData.projects || [])
          setLanguages(profileData.languages || [])
          setFieldOfInterest(profileData.field_of_interest || "")
          setWorkExperience(profileData.work_experience?.toString() || "0")
          setMinSalary(profileData.min_salary?.toString() || "")
          setJobType(profileData.job_type || "full-time")
          setCurrentStatus(profileData.current_status || "seeking")
        } else if (role === "recruiter") {
          const { data: profileData, error } = await supabase
            .from("recruiter_profiles")
            .select(`
              *,
              companies(*)
            `)
            .eq("user_id", user.id)
            .single()

          if (error) throw error

          setProfileData(profileData)

          // Set form fields
          setRecruiterName(profileData.name || "")
          setRecruiterDescription(profileData.description || "")
          setRecruiterExperience(profileData.experience || "")
          setCompanyName(profileData.companies?.name || "")
          setCompanyDescription(profileData.companies?.description || "")
          setCompanyWebsite(profileData.companies?.website || "")
        }
      } catch (error: any) {
        console.error("Error fetching profile data:", error)
        toast({
          title: "Error loading profile",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
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

  const addLanguage = () => {
    if (newLanguage && !languages.includes(newLanguage)) {
      setLanguages([...languages, newLanguage])
      setNewLanguage("")
    }
  }

  const removeLanguage = (languageToRemove: string) => {
    setLanguages(languages.filter((language) => language !== languageToRemove))
  }

  const addProject = () => {
    setProjects([
      ...projects,
      {
        name: "",
        hostedLink: "",
        githubLink: "",
        figmaLink: "",
        duration: "",
        skills: [],
      },
    ])
  }

  const updateProject = (index: number, field: string, value: any) => {
    const updatedProjects = [...projects]
    updatedProjects[index] = {
      ...updatedProjects[index],
      [field]: value,
    }
    setProjects(updatedProjects)
  }

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index))
  }

  const handleSaveJobSeekerProfile = async () => {
    setIsSaving(true)

    try {
      const { error } = await supabase
        .from("job_seeker_profiles")
        .update({
          name,
          date_of_birth: dob,
          university,
          year_of_passing: yearOfPassing,
          cgpa,
          degree,
          branch,
          skills,
          projects,
          languages,
          field_of_interest: fieldOfInterest,
          work_experience: Number.parseInt(workExperience),
          min_salary: Number.parseFloat(minSalary),
          job_type: jobType,
          current_status: currentStatus,
        })
        .eq("id", profileData.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveRecruiterProfile = async () => {
    setIsSaving(true)

    try {

      // Update company details
      let companyId = profileData.companies?.id;

      // If company doesn't exist, create a new one
      if (!companyId) {
        const { data: newCompany, error: companyError } = await supabase
          .from("companies")
          .insert({
            name: companyName,
            description: companyDescription,
            website: companyWebsite,
          })
          .select()
          .single();

        if (companyError) throw companyError;
        companyId = newCompany.id;
      } else {
        // Update existing company
        const { error: companyError } = await supabase
          .from("companies")
          .update({
            name: companyName,
            description: companyDescription,
            website: companyWebsite,
          })
          .eq("id", companyId);

        if (companyError) throw companyError;
      }


      // Update recruiter details
      const { error: recruiterError } = await supabase
        .from("recruiter_profiles")
        .update({
          name: recruiterName,
          description: recruiterDescription,
          experience: recruiterExperience,
          company_id: companyId,
        })
        .eq("id", profileData.id)

      if (recruiterError) throw recruiterError

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
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
    <div className="container max-w-3xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Your Profile</h1>
        <p className="text-muted-foreground mt-2">Update your profile information</p>
      </div>

      {userRole === "jobseeker" ? (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Education Details</CardTitle>
              <CardDescription>Update your educational background</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="university">University/College Name</Label>
                <Input
                  id="university"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="Stanford University"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree</Label>
                  <Input
                    id="degree"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="Bachelor of Science"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch/Major</Label>
                  <Input
                    id="branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="Computer Science"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year of Passing</Label>
                  <Input
                    id="year"
                    type="number"
                    value={yearOfPassing}
                    onChange={(e) => setYearOfPassing(e.target.value)}
                    placeholder="2023"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cgpa">CGPA/Percentage</Label>
                  <Input id="cgpa" value={cgpa} onChange={(e) => setCgpa(e.target.value)} placeholder="3.8" required />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills & Projects</CardTitle>
              <CardDescription>Update your technical skills and projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Technical Skills</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex items-center bg-muted px-3 py-1 rounded-full">
                      <span>{skill}</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-1" onClick={() => removeSkill(skill)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill (e.g. React, Python)"
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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Projects</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addProject}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add Project
                  </Button>
                </div>

                {projects.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No projects added yet. Click the button above to add your first project.
                  </div>
                )}

                {projects.map((project, index) => (
                  <Card key={index} className="border border-muted">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Project {index + 1}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => removeProject(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor={`project-name-${index}`}>Project Name</Label>
                        <Input
                          id={`project-name-${index}`}
                          value={project.name}
                          onChange={(e) => updateProject(index, "name", e.target.value)}
                          placeholder="E-commerce Website"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`project-hosted-${index}`}>Hosted Link (optional)</Label>
                        <Input
                          id={`project-hosted-${index}`}
                          value={project.hostedLink}
                          onChange={(e) => updateProject(index, "hostedLink", e.target.value)}
                          placeholder="https://myproject.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`project-github-${index}`}>GitHub Repository (optional)</Label>
                        <Input
                          id={`project-github-${index}`}
                          value={project.githubLink}
                          onChange={(e) => updateProject(index, "githubLink", e.target.value)}
                          placeholder="https://github.com/username/repo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`project-figma-${index}`}>Figma Link (optional)</Label>
                        <Input
                          id={`project-figma-${index}`}
                          value={project.figmaLink}
                          onChange={(e) => updateProject(index, "figmaLink", e.target.value)}
                          placeholder="https://figma.com/file/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`project-duration-${index}`}>Duration</Label>
                        <Input
                          id={`project-duration-${index}`}
                          value={project.duration}
                          onChange={(e) => updateProject(index, "duration", e.target.value)}
                          placeholder="3 months"
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences & Additional Information</CardTitle>
              <CardDescription>Update your job preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Label>Languages Known</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {languages.map((language, index) => (
                    <div key={index} className="flex items-center bg-muted px-3 py-1 rounded-full">
                      <span>{language}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 ml-1"
                        onClick={() => removeLanguage(language)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Add a language (e.g. English, Spanish)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addLanguage()
                      }
                    }}
                  />
                  <Button type="button" onClick={addLanguage}>
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="field">Field of Interest</Label>
                <Input
                  id="field"
                  value={fieldOfInterest}
                  onChange={(e) => setFieldOfInterest(e.target.value)}
                  placeholder="Full Stack Developer"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Work Experience (years)</Label>
                <Input
                  id="experience"
                  type="number"
                  value={workExperience}
                  onChange={(e) => setWorkExperience(e.target.value)}
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Minimum Salary Expectation</Label>
                <Input
                  id="salary"
                  type="number"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  placeholder="50000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type Preference</Label>
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

              <div className="space-y-2">
                <Label htmlFor="status">Current Status</Label>
                <Select value={currentStatus} onValueChange={setCurrentStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your current status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seeking">Seeking (Actively looking for jobs)</SelectItem>
                    <SelectItem value="working">Working (Already employed)</SelectItem>
                    <SelectItem value="idle">Idle (On a break, not seeking jobs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveJobSeekerProfile} disabled={isSaving} className="w-full">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="space-y-8">
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
                  onChange={(e) => setRecruiterExperience(e.target.value)}
                  placeholder="5"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveRecruiterProfile} disabled={isSaving} className="w-full">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}

