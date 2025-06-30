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
import { motion } from "framer-motion"

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, userProfile, business, signOut, loading } = useAuthContext()
  const router = useRouter()

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="w-16 h-16 rounded-full bg-gradient-brand mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-lg font-medium text-gradient-brand">Loading your workspace...</p>
        </motion.div>
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
    <div className="grid min-h-screen w-full md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-gradient-to-b from-red-50/50 to-orange-50/30 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-24 items-center justify-center bg-white/50 backdrop-blur-sm border-b px-4 lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-3 font-semibold group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="relative"
              >
                <Image 
                  src="/logo-transparent.png" 
                  alt="Welp Logo" 
                  width={48} 
                  height={48} 
                  className="drop-shadow-lg"
                />
                <motion.div
                  className="absolute -inset-2 bg-red-500/20 rounded-full blur-xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <div className="flex flex-col items-start">
                <motion.span 
                  className="text-3xl font-black text-red-600 tracking-tight"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", fontWeight: 800 }}
                >
                  Welp!
                </motion.span>
                <motion.span 
                  className="text-xs text-red-500 font-medium -mt-1"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Your tip didn't cover this.
                </motion.span>
              </div>
            </Link>
          </div>
          <div className="flex-1 py-4">
            <nav className="grid items-start gap-2 px-3 lg:px-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NavLink href={item.href} icon={item.icon}>
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-orange-500 text-white overflow-hidden relative group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-white/10"></div>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-200%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <CardHeader className="p-4 relative">
                <CardTitle className="text-lg flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    ⭐
                  </motion.span>
                  Upgrade to Premium
                </CardTitle>
                <CardDescription className="text-xs text-red-100">
                  Unlock all features and get unlimited access.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 relative">
                <Link href="/subscription">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full bg-white text-red-600 hover:bg-red-50 group-hover:scale-105 transition-transform"
                  >
                    Upgrade Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-sm px-4 lg:px-6 shadow-sm relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-5">
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(218, 38, 13, 0.1) 10px, rgba(218, 38, 13, 0.1) 20px)`
              }}
              animate={{ x: [0, 28] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 md:hidden relative z-10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 bg-gradient-to-b from-red-50/50 to-orange-50/30">
              <div className="flex h-24 items-center justify-center bg-white/50 backdrop-blur-sm border-b px-4">
                <Link href="/dashboard" className="flex items-center gap-3 font-semibold">
                  <Image src="/logo-transparent.png" alt="Welp Logo" width={48} height={48} />
                  <div className="flex flex-col items-start">
                    <span className="text-3xl font-black text-red-600" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", fontWeight: 800 }}>Welp!</span>
                    <span className="text-xs text-red-500 font-medium -mt-1">Your tip didn't cover this.</span>
                  </div>
                </Link>
              </div>
              <nav className="grid gap-2 p-4 text-lg font-medium">
                {navItems.map((item) => (
                  <NavLink key={item.href} href={item.href} icon={item.icon} isMobile>
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-auto p-4 border-t">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-orange-500 text-white">
                  <CardHeader>
                    <CardTitle className="text-base">Upgrade to Premium</CardTitle>
                    <CardDescription className="text-xs text-red-100">Unlock all features.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/subscription">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full bg-white text-red-600 hover:bg-red-50"
                      >
                        Upgrade
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1 relative z-10">
            <motion.h1 
              className="text-lg font-bold text-gradient-brand"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {businessName}
            </motion.h1>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
          >
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-red-50 relative group">
              <Bell className="h-5 w-5 text-red-500" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </motion.div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
              >
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-red-50 relative overflow-hidden group">
                  <Users className="h-5 w-5 text-red-500 relative z-10" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-100 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userProfile?.role || 'Owner'} at {businessName}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-red-50 hover:text-red-600 cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-red-50 hover:text-red-600 cursor-pointer">
                <Briefcase className="mr-2 h-4 w-4" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto bg-gradient-to-br from-white to-red-50/20 relative">
          {/* Subtle animated background elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute -top-40 -right-40 w-80 h-80 bg-red-200/20 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2]
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />
          </div>
          <div className="relative z-10">
            {children}
          </div>
        </main>
        <footer className="border-t bg-white/80 backdrop-blur-sm py-4 px-6 text-center text-xs text-muted-foreground relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-red-50 via-transparent to-orange-50 opacity-50"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <p className="font-medium relative z-10">
            © {new Date().getFullYear()} Welp, Inc. All rights reserved. 
            <motion.span 
              className="text-gradient-brand font-semibold ml-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Rating customers since 2024
            </motion.span>
          </p>
        </footer>
      </div>
      
      {/* Bolt Logo - Fixed Position */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link href="https://bolt.new" target="_blank" rel="noopener noreferrer">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative bg-white rounded-full p-2 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <Image 
                src="/bolt-logo.png" 
                alt="Bolt" 
                width={40} 
                height={40} 
                className="rounded-full"
              />
            </div>
            <motion.div 
              className="absolute -top-10 right-0 bg-black text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap"
              initial={{ y: 10 }}
              whileHover={{ y: 0 }}
            >
              Built with Bolt ⚡
            </motion.div>
          </div>
        </Link>
      </motion.div>
    </div>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-white font-sans antialiased")}>
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