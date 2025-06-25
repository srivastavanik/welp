import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/custom/page-header"
import { Search } from "lucide-react"

export default function LookupLoading() {
  return (
    <>
      <PageHeader
        title="Customer Lookup"
        description="Search for customers by phone number to view their Welp profile."
        icon={Search}
      />
      <Skeleton className="h-[130px] w-full rounded-lg mb-6" />
      <Skeleton className="h-[400px] w-full rounded-lg" />
    </>
  )
}
