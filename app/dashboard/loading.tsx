import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/custom/page-header"
import { Activity } from "lucide-react"

export default function DashboardLoading() {
  return (
    <>
      <PageHeader title="Dashboard" description="Overview of your business activity on Welp." icon={Activity} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] w-full rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Skeleton className="lg:col-span-2 h-[400px] w-full rounded-lg" />
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-[150px] w-full rounded-lg" />
        </div>
      </div>
    </>
  )
}
