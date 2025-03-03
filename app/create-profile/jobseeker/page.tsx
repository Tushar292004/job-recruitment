"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash2 } from "lucide-react"
import { motion } from "framer-motion"

export default function JobSeekerProfilePage() {
  const { user, isLoading: authLoading } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  // Personal Information
  const [name, setName] = useState("")
  const [dob, setDob] = useState("")

  // Education Details
  const [university, setUniversity] = useState("")
  const [yearOfPassing, setYearOfPassing] = useState("")
  const [cgpa, setCgpa] = useState("")
  const [degree, setDegree] = useState("")
  const [branch, setBranch] = useState("")

  // Skills
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")

  // Projects
  const [projects, setProjects] = useState<
    {
      name: string
      hostedLink?: string
      githubLink?: string
      figmaLink?: string
      duration: string
      skills: string[]
    }[]
  >([])

  // Preferences
  const [languages, setLanguages] = useState<string[]>([])
  const [newLanguage, setNewLanguage] = useState("")
  const [fieldOfInterest, setFieldOfInterest] = useState("")
  const [workExperience, setWorkExperience] = useState("0")
  const [minSalary, setMinSalary] = useState("")
  const [jobType, setJobType] = useState<string>("full-time")
  const [currentStatus, setCurrentStatus] = useState<string>("seeking")

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

  const handleSubmit = async () => {
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
      // Create job seeker profile in Supabase
      const { error } = await supabase.from("job_seeker_profiles").insert({
        user_id: user.id,
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

      if (error) throw error

      toast({
        title: "Profile created",
        description: "Your job seeker profile has been created successfully.",
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

  const nextStep = () => {
    setCurrentStep(currentStep + 1)
    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
    window.scrollTo(0, 0)
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
        <h1 className="text-3xl font-bold">Create Your Job Seeker Profile</h1>
        <p className="text-muted-foreground mt-2">Complete your profile to start connecting with recruiters</p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex flex-col items-center ${currentStep >= step ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  currentStep >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {step}
              </div>
              <span className="text-xs">
                {step === 1 && "Personal"}
                {step === 2 && "Education"}
                {step === 3 && "Skills"}
                {step === 4 && "Preferences"}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Tell us about yourself</CardDescription>
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
            <CardFooter className="flex justify-end">
              <Button onClick={nextStep}>Next Step</Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Education Details</CardTitle>
              <CardDescription>Tell us about your educational background</CardDescription>
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
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button onClick={nextStep}>Next Step</Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Skills & Projects</CardTitle>
              <CardDescription>Add your technical skills and projects</CardDescription>
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
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button onClick={nextStep}>Next Step</Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Preferences & Additional Information</CardTitle>
              <CardDescription>Tell us about your job preferences</CardDescription>
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
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Creating Profile..." : "Complete Profile"}
              </Button>
            </CardFooter>
          </Card>
        )}
      </motion.div>
    </div>
  )
}

