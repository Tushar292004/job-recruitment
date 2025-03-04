"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Briefcase, CheckCircle, Clock, XCircle, Search } from "lucide-react"

type UserRole = "jobseeker" | "recruiter" | null

export default function DashboardPage() {
  const { user, isLoading: authLoading, signOut } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    declined: 0,
    pending: 0,
  })
  const [invitations, setInvitations] = useState<any[]>([])

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
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        const role = userData.user?.user_metadata?.role as UserRole
        setUserRole(role)

        // Fetch profile data based on role
        if (role === "jobseeker") {
          const { data: profileData, error } = await supabase
            .from("job_seeker_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single()

          if (error) throw error
          setProfileData(profileData)

          // Fetch invitations for job seeker
          const { data: invitationsData, error: invitationsError } = await supabase
            .from("invitations")
            .select(`
              *,
              recruiter:recruiter_profiles(
                name,
                companies(name)
              )
            `)
            .eq("job_seeker_id", profileData?.id)

          if (invitationsError) throw invitationsError
          setInvitations(invitationsData || [])

          // Calculate stats
          const total = invitationsData?.length || 0
          const accepted = invitationsData?.filter((inv) => inv.status === "accepted").length || 0
          const declined = invitationsData?.filter((inv) => inv.status === "declined").length || 0
          const pending = invitationsData?.filter((inv) => inv.status === "pending").length || 0

          setStats({ total, accepted, declined, pending })
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

          // Fetch invitations sent by recruiter
          const { data: invitationsData, error: invitationsError } = await supabase
            .from("invitations")
            .select(`
              *,
              job_seeker:job_seeker_profiles(name)
            `)
            .eq("recruiter_id", profileData?.id)

          if (invitationsError) throw invitationsError
          setInvitations(invitationsData || [])

          // Calculate stats
          const total = invitationsData?.length || 0
          const accepted = invitationsData?.filter((inv) => inv.status === "accepted").length || 0
          const declined = invitationsData?.filter((inv) => inv.status === "declined").length || 0
          const pending = invitationsData?.filter((inv) => inv.status === "pending").length || 0

          setStats({ total, accepted, declined, pending })
        }
      } catch (error: any) {
        console.error("Error fetching user data:", error)
        toast({
          title: "Error loading dashboard",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [user, authLoading, router, supabase, toast])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleCreateProfile = () => {
    if (userRole === "jobseeker") {
      router.push("/create-profile/jobseeker")
    } else if (userRole === "recruiter") {
      router.push("/create-profile/recruiter")
    }
  }

  const handleSearchCandidates = () => {
    router.push("/search")
  }

  const handleInvitationResponse = async (invitationId: string, status: "accepted" | "declined") => {
    try {
      // Update invitation status
      const { data: invitationData, error } = await supabase
        .from("invitations")
        .update({ status })
        .eq("id", invitationId)
        .select(`
          *,
          recruiter:recruiter_profiles(
            name,
            user_id,
            companies(name)
          )
        `)
        .single()

      if (error) throw error

      // Get the recruiter's user ID for notification
      const recruiterId = invitationData.recruiter.user_id

      // Create notification for recruiter
      await supabase.from("notifications").insert({
        user_id: recruiterId,
        message: `${profileData.name} has ${status} your invitation for the role of ${invitationData.role}.`,
        type: "invitation_response",
        related_id: invitationId,
      })

      // Update local state
      setInvitations(invitations.map((inv) => (inv.id === invitationId ? { ...inv, status } : inv)))

      // Update stats
      const newStats = { ...stats }
      newStats.pending -= 1
      newStats[status === "accepted" ? "accepted" : "declined"] += 1
      setStats(newStats)

      toast({
        title: status === "accepted" ? "Invitation accepted" : "Invitation declined",
        description:
          status === "accepted"
            ? "You have accepted the invitation. The recruiter will be notified."
            : "You have declined the invitation.",
      })
    } catch (error: any) {
      toast({
        title: "Error updating invitation",
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

  // If profile doesn't exist, show create profile prompt
  if (!profileData) {
    return (
      <div className="container max-w-3xl py-10">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>You need to create your profile to use JobConnect</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Briefcase className="h-16 w-16 text-primary" />
            <p className="text-center text-muted-foreground">
              {userRole === "jobseeker"
                ? "Create your job seeker profile to start connecting with recruiters."
                : "Create your recruiter profile to start finding talent."}
            </p>
            <Button onClick={handleCreateProfile}>Create Profile</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header is now in the global layout */}

      <main className="container py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{userRole === "jobseeker" ? "Job Seeker Profile" : "Recruiter Profile"}</CardTitle>
                <CardDescription>
                  {userRole === "jobseeker" ? "Your job seeker information" : "Your recruiter information"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Name</h3>
                  <p>{profileData.name}</p>
                </div>

                {userRole === "jobseeker" ? (
                  <>
                    <div>
                      <h3 className="font-medium">Field of Interest</h3>
                      <p>{profileData.field_of_interest}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Experience</h3>
                      <p>{profileData.work_experience} years</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Current Status</h3>
                      <p className="capitalize">{profileData.current_status}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="font-medium">Company</h3>
                      <p>{profileData.companies?.name}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Experience</h3>
                      <p>{profileData.experience} years</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Employees Hired</h3>
                      <p>{profileData.employees_hired}</p>
                    </div>
                  </>
                )}

                <Button variant="outline" className="w-full" onClick={() => router.push(`/profile/edit`)}>
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardDescription>Total</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">{stats.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardDescription>Accepted</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-green-500">{stats.accepted}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardDescription>Declined</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-red-500">{stats.declined}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardDescription>Pending</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
                  </CardContent>
                </Card>
              </div>

              {userRole === "recruiter" && (
                <Button className="w-full flex items-center gap-2 h-12" onClick={handleSearchCandidates}>
                  <Search className="h-5 w-5" />
                  Search for Candidates
                </Button>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>{userRole === "jobseeker" ? "Recruiter Invitations" : "Sent Invitations"}</CardTitle>
                  <CardDescription>
                    {userRole === "jobseeker" ? "Invitations from recruiters" : "Invitations you've sent to candidates"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {invitations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {userRole === "jobseeker"
                        ? "No invitations received yet."
                        : "You haven't sent any invitations yet."}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {invitations.map((invitation) => (
                        <Card key={invitation.id} className="overflow-hidden">
                          <div
                            className={`h-1.5 ${
                              invitation.status === "accepted"
                                ? "bg-green-500"
                                : invitation.status === "declined"
                                  ? "bg-red-500"
                                  : "bg-yellow-500"
                            }`}
                          />
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">
                                  {userRole === "jobseeker"
                                    ? `${invitation.recruiter.name} from ${invitation.recruiter.companies.name}`
                                    : invitation.job_seeker.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">Role: {invitation.role}</p>
                                <div className="mt-2 text-sm">
                                  <p>Required skills: {invitation.skills.join(", ")}</p>
                                  <p>Salary: {invitation.salary_range}</p>
                                </div>
                                {invitation.custom_message && (
                                  <div className="mt-2 text-sm border-l-2 border-primary pl-2">
                                    <p>{invitation.custom_message}</p>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center">
                                {invitation.status === "accepted" && (
                                  <div className="flex items-center text-green-500">
                                    <CheckCircle className="h-5 w-5 mr-1" />
                                    <span className="text-sm">Accepted</span>
                                  </div>
                                )}
                                {invitation.status === "declined" && (
                                  <div className="flex items-center text-red-500">
                                    <XCircle className="h-5 w-5 mr-1" />
                                    <span className="text-sm">Declined</span>
                                  </div>
                                )}
                                {invitation.status === "pending" && (
                                  <div className="flex items-center text-yellow-500">
                                    <Clock className="h-5 w-5 mr-1" />
                                    <span className="text-sm">Pending</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {userRole === "jobseeker" && invitation.status === "pending" && (
                              <div className="mt-4 flex gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => handleInvitationResponse(invitation.id, "accepted")}
                                >
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => handleInvitationResponse(invitation.id, "declined")}
                                >
                                  Decline
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

