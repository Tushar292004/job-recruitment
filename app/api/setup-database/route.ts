import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient()

    // Create tables

    // 1. Job Seeker Profiles
    await supabase.rpc("create_table_if_not_exists", {
      table_name: "job_seeker_profiles",
      columns: `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        name text NOT NULL,
        date_of_birth date,
        university text,
        year_of_passing integer,
        cgpa text,
        degree text,
        branch text,
        skills jsonb DEFAULT '[]'::jsonb,
        projects jsonb DEFAULT '[]'::jsonb,
        languages jsonb DEFAULT '[]'::jsonb,
        field_of_interest text,
        work_experience integer DEFAULT 0,
        min_salary numeric,
        job_type text,
        current_status text DEFAULT 'seeking',
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now()
      `,
    })

    // 2. Companies
    await supabase.rpc("create_table_if_not_exists", {
      table_name: "companies",
      columns: `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name text NOT NULL,
        description text,
        website text,
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now()
      `,
    })

    // 3. Recruiter Profiles
    await supabase.rpc("create_table_if_not_exists", {
      table_name: "recruiter_profiles",
      columns: `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
        name text NOT NULL,
        description text,
        experience text,
        employees_hired integer DEFAULT 0,
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now()
      `,
    })

    // 4. Invitations
    await supabase.rpc("create_table_if_not_exists", {
      table_name: "invitations",
      columns: `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        recruiter_id uuid REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
        job_seeker_id uuid REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
        role text NOT NULL,
        skills jsonb DEFAULT '[]'::jsonb,
        salary_range text,
        custom_message text,
        status text DEFAULT 'pending',
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now()
      `,
    })

    // Create RLS policies

    // Enable RLS on all tables
    await supabase.rpc("enable_rls", { table_name: "job_seeker_profiles" })
    await supabase.rpc("enable_rls", { table_name: "companies" })
    await supabase.rpc("enable_rls", { table_name: "recruiter_profiles" })
    await supabase.rpc("enable_rls", { table_name: "invitations" })

    // Job Seeker Profiles policies
    await supabase.rpc("create_policy", {
      table_name: "job_seeker_profiles",
      policy_name: "job_seeker_profiles_select_policy",
      definition: `
        CREATE POLICY "job_seeker_profiles_select_policy" ON job_seeker_profiles
        FOR SELECT USING (true)
      `,
    })

    await supabase.rpc("create_policy", {
      table_name: "job_seeker_profiles",
      policy_name: "job_seeker_profiles_insert_policy",
      definition: `
        CREATE POLICY "job_seeker_profiles_insert_policy" ON job_seeker_profiles
        FOR INSERT WITH CHECK (auth.uid() = user_id)
      `,
    })

    await supabase.rpc("create_policy", {
      table_name: "job_seeker_profiles",
      policy_name: "job_seeker_profiles_update_policy",
      definition: `
        CREATE POLICY "job_seeker_profiles_update_policy" ON job_seeker_profiles
        FOR UPDATE USING (auth.uid() = user_id)
      `,
    })

    // Companies policies
    await supabase.rpc("create_policy", {
      table_name: "companies",
      policy_name: "companies_select_policy",
      definition: `
        CREATE POLICY "companies_select_policy" ON companies
        FOR SELECT USING (true)
      `,
    })

    await supabase.rpc("create_policy", {
      table_name: "companies",
      policy_name: "companies_insert_policy",
      definition: `
        CREATE POLICY "companies_insert_policy" ON companies
        FOR INSERT WITH CHECK (true)
      `,
    })

    await supabase.rpc("create_policy", {
      table_name: "companies",
      policy_name: "companies_update_policy",
      definition: `
        CREATE POLICY "companies_update_policy" ON companies
        FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM recruiter_profiles
            WHERE recruiter_profiles.company_id = id
            AND recruiter_profiles.user_id = auth.uid()
          )
        )
      `,
    })

    // Recruiter Profiles policies
    await supabase.rpc("create_policy", {
      table_name: "recruiter_profiles",
      policy_name: "recruiter_profiles_select_policy",
      definition: `
        CREATE POLICY "recruiter_profiles_select_policy" ON recruiter_profiles
        FOR SELECT USING (true)
      `,
    })

    await supabase.rpc("create_policy", {
      table_name: "recruiter_profiles",
      policy_name: "recruiter_profiles_insert_policy",
      definition: `
        CREATE POLICY "recruiter_profiles_insert_policy" ON recruiter_profiles
        FOR INSERT WITH CHECK (auth.uid() = user_id)
      `,
    })

    await supabase.rpc("create_policy", {
      table_name: "recruiter_profiles",
      policy_name: "recruiter_profiles_update_policy",
      definition: `
        CREATE POLICY "recruiter_profiles_update_policy" ON recruiter_profiles
        FOR UPDATE USING (auth.uid() = user_id)
      `,
    })

    // Invitations policies
    await supabase.rpc("create_policy", {
      table_name: "invitations",
      policy_name: "invitations_select_policy",
      definition: `
        CREATE POLICY "invitations_select_policy" ON invitations
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM recruiter_profiles
            WHERE recruiter_profiles.id = recruiter_id
            AND recruiter_profiles.user_id = auth.uid()
          ) OR
          EXISTS (
            SELECT 1 FROM job_seeker_profiles
            WHERE job_seeker_profiles.id = job_seeker_id
            AND job_seeker_profiles.user_id = auth.uid()
          )
        )
      `,
    })

    await supabase.rpc("create_policy", {
      table_name: "invitations",
      policy_name: "invitations_insert_policy",
      definition: `
        CREATE POLICY "invitations_insert_policy" ON invitations
        FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM recruiter_profiles
            WHERE recruiter_profiles.id = recruiter_id
            AND recruiter_profiles.user_id = auth.uid()
          )
        )
      `,
    })

    await supabase.rpc("create_policy", {
      table_name: "invitations",
      policy_name: "invitations_update_policy",
      definition: `
        CREATE POLICY "invitations_update_policy" ON invitations
        FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM recruiter_profiles
            WHERE recruiter_profiles.id = recruiter_id
            AND recruiter_profiles.user_id = auth.uid()
          ) OR
          EXISTS (
            SELECT 1 FROM job_seeker_profiles
            WHERE job_seeker_profiles.id = job_seeker_id
            AND job_seeker_profiles.user_id = auth.uid()
          )
        )
      `,
    })

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
    })
  } catch (error: any) {
    console.error("Error setting up database:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An error occurred during database setup",
      },
      { status: 500 },
    )
  }
}

