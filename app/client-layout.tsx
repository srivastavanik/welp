"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bell,
  Home,
  LogOut,
  Search,
  Settings,
  Star,
  Users,
  DollarSign,
  FileText,
  Menu,
  Briefcase,
  MessageSquareWarning,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { NavLink } from "@/components/custom/nav-link"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider, useAuthContext } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"
import "./globals.css"

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, userProfile, business, signOut, loading } = useAuthContext()
  const router = useRouter()

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to auth if not authenticated
  if (!user) {
    router.push('/auth')
    return null
  }

  const businessName = business?.name || "Your Business"
  const userName = userProfile?.display_name || user.email || "User"

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/lookup", icon: Search, label: "Customer Lookup" },
    { href: "/rate", icon: Star, label: "Rate Customer" },
    { href: "/reviews", icon: FileText, label: "My Reviews" },
    { href: "/welp-to-me", icon: MessageSquareWarning, label: "Welp to Me!" },
    { href: "/subscription", icon: DollarSign, label: "Subscription" },
  ]

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/auth')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r border-border-subtle bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center justify-center border-b border-border-subtle px-4 lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Image src="/logo-transparent.png" alt="Welp Logo" width={48} height={48} />
            </Link>
          </div>
          <div className="flex-1 py-4">
            <nav className="grid items-start gap-1 px-2 lg:px-4">
              {navItems.map((item) => (
                <NavLink key={item.href} href={item.href} icon={item.icon}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card className="border-border-subtle">
              <CardHeader className="p-3 pt-0 md:p-4">
                <CardTitle className="text-base">Upgrade to Premium</CardTitle>
                <CardDescription className="text-xs">
                  Unlock all features and get unlimited access.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
                <Link href="/subscription">
                  <Button
                    size="sm"
                    className="w-full bg-brand-red text-brand-red-foreground hover:bg-brand-red-hover"
                  >
                    Upgrade
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-bg-subtle">
        <header className="flex h-16 items-center gap-4 border-b border-border-subtle bg-bg-page px-4 lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-bg-page p-0">
              <div className="flex h-16 items-center justify-center border-b border-border-subtle px-4">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                  <Image src="/logo-transparent.png" alt="Welp Logo" width={48} height={48} />
                </Link>
              </div>
              <nav className="grid gap-2 p-4 text-lg font-medium">
                {navItems.map((item) => (
                  <NavLink key={item.href} href={item.href} icon={item.icon} isMobile>
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-auto p-4 border-t border-border-subtle">
                <Card className="border-border-subtle">
                  <CardHeader>
                    <CardTitle className="text-base">Upgrade to Premium</CardTitle>
                    <CardDescription className="text-xs">Unlock all features.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/subscription">
                      <Button
                        size="sm"
                        className="w-full bg-brand-red text-brand-red-foreground hover:bg-brand-red-hover"
                      >
                        Upgrade
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold text-text-primary">{businessName}</h1>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
            <Bell className="h-5 w-5 text-text-secondary" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                <Users className="h-5 w-5 text-text-secondary" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userProfile?.role || 'Owner'} at {businessName}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Briefcase className="mr-2 h-4 w-4" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto">{children}</main>
        <footer className="border-t border-border-subtle bg-muted/40 py-4 px-6 text-center text-xs text-text-secondary">
          © {new Date().getFullYear()} Welp, Inc. All rights reserved. Built with Bolt.new
        </footer>
      </div>
    </div>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-bg-page font-sans antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            <AuthenticatedLayout>{children}</AuthenticatedLayout>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}