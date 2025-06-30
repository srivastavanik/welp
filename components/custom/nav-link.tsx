"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

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
        "relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
        "hover:bg-red-100/50 hover:text-red-600",
        isActive 
          ? "bg-gradient-brand text-white shadow-md hover:shadow-lg" 
          : "text-gray-700 hover:translate-x-1",
        isMobile ? "text-lg" : "text-sm font-medium",
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-gradient-brand rounded-lg"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        />
      )}
      <Icon className={cn(
        "h-5 w-5 relative z-10 transition-transform duration-200",
        isActive && "text-white",
        !isActive && "group-hover:scale-110",
        isMobile && "h-6 w-6"
      )} />
      <span className="relative z-10">{children}</span>
    </Link>
  )
}
