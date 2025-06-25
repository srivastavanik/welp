import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/custom/page-header"
import { DollarSign } from "lucide-react"

export default function SubscriptionLoading() {
  return (
    <>
      <PageHeader
        title="Subscription Management"
        description="Choose the plan that's right for your business needs."
        icon={DollarSign}
      />
      <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-6 border border-gray-200 rounded-lg space-y-4">
            <Skeleton className="h-8 w-1/2 rounded mx-auto" /> {/* Title */}
            <Skeleton className="h-10 w-1/3 rounded mx-auto" /> {/* Price */}
            <Skeleton className="h-5 w-3/4 rounded mx-auto mb-4" /> {/* Description */}
            <div className="space-y-3">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 w-full rounded" />
                </div>
              ))}
            </div>
            <Skeleton className="h-11 w-full rounded mt-4" /> {/* Button */}
          </div>
        ))}
      </div>
      <Skeleton className="h-[200px] w-full rounded-lg mt-8" /> {/* FAQ */}
    </>
  )
}
