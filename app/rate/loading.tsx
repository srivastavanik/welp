import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/custom/page-header"
import { Star } from "lucide-react"

export default function RateLoading() {
  return (
    <>
      <PageHeader title="Rate a Customer" description="Share your experience to help other businesses." icon={Star} />
      <Skeleton className="h-[100px] w-full rounded-lg mb-6" /> {/* Alert placeholder */}
      <div className="space-y-8">
        <Skeleton className="h-[100px] w-full rounded-lg" /> {/* Phone & Role */}
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] w-full rounded-lg" /> /* Rating sections */
        ))}
        <Skeleton className="h-[100px] w-full rounded-lg" /> {/* Comment */}
        <Skeleton className="h-[60px] w-full rounded-lg" /> {/* Voice */}
        <Skeleton className="h-[44px] w-[150px] rounded-lg" /> {/* Submit button */}
      </div>
    </>
  )
}
