import React from 'react'
import { Briefcase } from "lucide-react"
import Link from "next/link"
export default function Footer() {
    return (
        <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-bold">
            <Briefcase className="h-5 w-5 text-primary" />
            <span>RightHire</span>
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
    )
}
