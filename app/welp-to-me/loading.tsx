import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/custom/page-header"
import { MessageSquareWarning } from "lucide-react"

export default function WelpToMeLoading() {
  return (
    <>
      <PageHeader
        title="Welp to Me!"
        description="Vent your frustrations to our... 'understanding' AI companion."
        icon={MessageSquareWarning}
      />
      <Skeleton className="h-[100px] w-full rounded-lg mb-6" /> {/* Alert placeholder */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Skeleton className="h-[550px] w-full rounded-lg" /> {/* Main card */}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[150px] w-full rounded-lg" /> {/* Steam Level card */}
          <Skeleton className="h-[200px] w-full rounded-lg" /> {/* AI Personality card */}
        </div>
      </div>
    </>
  )
}
