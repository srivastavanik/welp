import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/custom/page-header"
import { FileText } from "lucide-react"

export default function ReviewsLoading() {
  return (
    <>
      <PageHeader title="My Submitted Reviews" description="Manage and view your contributions." icon={FileText} />
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <Skeleton className="h-6 w-3/4 rounded" />
              <Skeleton className="h-6 w-1/5 rounded" />
            </div>
            <Skeleton className="h-4 w-1/2 rounded mb-3" />
            <Skeleton className="h-12 w-full rounded mb-3" />
            <div className="grid grid-cols-3 gap-4 mb-3">
              <Skeleton className="h-5 w-full rounded" />
              <Skeleton className="h-5 w-full rounded" />
              <Skeleton className="h-5 w-full rounded" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded" />
              <Skeleton className="h-8 w-20 rounded" />
              <Skeleton className="h-8 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
