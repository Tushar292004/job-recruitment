export interface User {
    id: string
    user_metadata?: {
      role?: "jobseeker" | "recruiter"
    }
    email?: string
  }
  
  