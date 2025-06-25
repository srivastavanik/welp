"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface NavLinkProps {
  href: string
  icon: LucideIcon
  children: React.ReactNode
  isMobile?: boolean
}

export function NavLink({ href, icon: Icon, children, isMobile = false }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-text-primary transition-all hover:bg-bg-subtle hover:text-brand-red",
        isActive && "bg-brand-red text-brand-red-foreground hover:bg-brand-red-hover hover:text-brand-red-foreground",
        isMobile ? "text-lg" : "text-sm font-medium",
      )}
    >
      <Icon className={cn("h-5 w-5", isMobile && "h-6 w-6")} />
      {children}
    </Link>
  )
}
