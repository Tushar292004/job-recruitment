"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Briefcase, Users, Search, MessageSquare, BarChart } from "lucide-react"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header is now in the global layout */}
      <main className="flex-1">
        <section className="container py-24 sm:py-32">
          <motion.div
            className="flex flex-col items-center text-center gap-4 md:gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                Connect with the <span className="text-primary">right talent</span> and{" "}
                <span className="text-primary">opportunities</span>
              </h1>
              <p className="text-xl text-muted-foreground md:w-3/4 mx-auto">
                JobConnect helps job seekers find their dream roles and enables recruiters to discover perfect
                candidates with our intelligent matching system.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup?role=jobseeker">
                <Button size="lg" className="gap-2">
                  Find a job <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signup?role=recruiter">
                <Button size="lg" variant="outline" className="gap-2">
                  Hire talent <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        <section id="features" className="container py-24 sm:py-32 border-t">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              className="flex flex-col gap-2 p-6 bg-muted/50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Users className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Detailed Profiles</h3>
              <p className="text-muted-foreground">
                Create comprehensive profiles showcasing your skills, projects, and experience to stand out.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col gap-2 p-6 bg-muted/50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Search className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Smart Matching</h3>
              <p className="text-muted-foreground">
                Our algorithm matches candidates with at least 60% compatibility to job requirements.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col gap-2 p-6 bg-muted/50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <MessageSquare className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Streamlined Communication</h3>
              <p className="text-muted-foreground">
                Simplified invitation and response system for efficient recruitment process.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col gap-2 p-6 bg-muted/50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <BarChart className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Insightful Dashboards</h3>
              <p className="text-muted-foreground">
                Track your recruitment progress and job application status with detailed analytics.
              </p>
            </motion.div>
          </div>
        </section>

        <section id="how-it-works" className="container py-24 sm:py-32 border-t">
          <div className="flex flex-col gap-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">How JobConnect Works</h2>
              <p className="text-muted-foreground md:w-2/3 mx-auto">
                Our platform simplifies the recruitment process for both job seekers and recruiters.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <motion.div
                className="space-y-6 p-6 border rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold">For Job Seekers</h3>
                <ol className="space-y-4 list-decimal list-inside">
                  <li>Create a detailed profile with your skills and experience</li>
                  <li>Set your job preferences and salary expectations</li>
                  <li>Receive invitations from interested recruiters</li>
                  <li>Accept or decline recruitment opportunities</li>
                  <li>Update your status when you get hired</li>
                </ol>
                <Link href="/signup?role=jobseeker">
                  <Button className="w-full">Create Job Seeker Profile</Button>
                </Link>
              </motion.div>
              <motion.div
                className="space-y-6 p-6 border rounded-lg"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold">For Recruiters</h3>
                <ol className="space-y-4 list-decimal list-inside">
                  <li>Create your company profile and recruiter details</li>
                  <li>Search for candidates using specific criteria</li>
                  <li>View candidates with at least 60% match to your requirements</li>
                  <li>Send invitations to potential candidates</li>
                  <li>Track responses and manage your recruitment pipeline</li>
                </ol>
                <Link href="/signup?role=recruiter">
                  <Button className="w-full">Create Recruiter Profile</Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-bold">
            <Briefcase className="h-5 w-5 text-primary" />
            <span>JobConnect</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} JobConnect. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

