"use client"

import { useRouter } from "next/navigation"
import SplashScreen from "./splash-screen"

export default function RootPage() {
  const router = useRouter()

  const handleStart = () => {
    // On animation complete, navigate to the dashboard
    router.push("/dashboard")
  }

  return <SplashScreen onStart={handleStart} />
}
