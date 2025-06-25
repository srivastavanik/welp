import { redirect } from "next/navigation"

export default function RootPage() {
  // Go directly to the main app dashboard.
  redirect("/dashboard")
}
