"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Activity,
  CreditCard,
  DollarSign,
  ArrowRight,
  Search,
  StarIcon as StarIconLucide,
  Users,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
} from "lucide-react"
import { PageHeader } from "@/components/custom/page-header"
import { StarRatingDisplay } from "@/components/custom/star-rating"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

// Mock data
const stats = [
  { title: "Total Reviews Left", value: "125", icon: StarIconLucide, change: "+12 this week", trend: "up" },
  { title: "Avg. Customer Rating", value: "3.8", icon: Users, change: "Slightly down", trend: "down" },
  { title: "Lookups This Month", value: "2/3", icon: Search, change: "Free Tier", trend: "neutral" },
  { title: "Subscription", value: "Free", icon: CreditCard, change: "Upgrade for more", trend: "neutral" },
]

const recentReviewsMock = [
  {
    id: "1",
    customerDisplayId: "John D.",
    overallRating: 4.5,
    comment: "Pleasant customer, paid promptly. No issues at all, would serve again anytime.",
    date: "2 days ago",
    reviewer: "Sarah M.",
    tags: ["Prompt Payment", "Polite"],
  },
  {
    id: "2",
    customerDisplayId: "Karen P.",
    overallRating: 1.2,
    comment: "Extremely difficult, demanded a refund for no reason. Caused a scene and was rude to staff.",
    date: "5 days ago",
    reviewer: "Mike B.",
    tags: ["Rude", "Dispute", "High Maintenance"],
    flagged: true,
  },
  {
    id: "3",
    customerDisplayId: "David S.",
    overallRating: 5.0,
    comment: "Best customer ever! Tipped generously and was very understanding about a small delay.",
    date: "1 week ago",
    reviewer: "Sarah M.",
    tags: ["Generous Tipper", "Understanding"],
  },
]

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your business activity on Welp."
        icon={Activity}
        actions={
          <Link href="/rate">
            <Button className="bg-brand-red text-brand-red-foreground hover:bg-brand-red-hover active:bg-brand-red-active">
              <StarIconLucide className="mr-2 h-4 w-4" /> Rate a Customer
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={stat.title} className="border-border-subtle shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">
                {stat.title === "Avg. Customer Rating" ? (
                  <StarRatingDisplay rating={Number.parseFloat(stat.value)} showText size={22} />
                ) : (
                  stat.value
                )}
              </div>
              <p className="text-xs text-text-secondary">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-2 border-border-subtle shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-text-primary">Recent Customer Reviews</CardTitle>
              <CardDescription className="text-text-secondary">Latest ratings submitted by your team.</CardDescription>
            </div>
            <Link href="/reviews">
              <Button variant="outline" size="sm" className="ml-auto gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentReviewsMock.map((review) => (
              <div
                key={review.id}
                className="flex items-start gap-4 p-4 border border-border-subtle rounded-lg bg-card hover:shadow-md transition-shadow"
              >
                <div
                  className={`p-2.5 rounded-full mt-1 ${review.overallRating >= 4 ? "bg-green-100 text-green-600" : review.overallRating >= 2.5 ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"}`}
                >
                  {review.flagged ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : review.overallRating >= 4 ? (
                    <ThumbsUp className="h-5 w-5" />
                  ) : review.overallRating >= 2.5 ? (
                    <MessageSquare className="h-5 w-5" />
                  ) : (
                    <ThumbsDown className="h-5 w-5" />
                  )}
                </div>
                <div className="grid gap-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold leading-none text-text-primary">{review.customerDisplayId}</p>
                    <StarRatingDisplay rating={review.overallRating} size={16} />
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2">{review.comment}</p>
                  {review.tags && review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {review.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-text-secondary/70 mt-1">
                    {review.date} by {review.reviewer}
                  </p>
                </div>
              </div>
            ))}
            {recentReviewsMock.length === 0 && (
              <p className="text-text-secondary text-center py-4">No reviews yet. Start by rating a customer!</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border-subtle shadow-sm">
            <CardHeader>
              <CardTitle className="text-text-primary">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Link href="/lookup">
                <Button variant="outline" className="w-full justify-start gap-2 text-text-primary">
                  <Search className="h-4 w-4 text-brand-red" /> Customer Lookup
                </Button>
              </Link>
              <Link href="/rate">
                <Button variant="outline" className="w-full justify-start gap-2 text-text-primary">
                  <StarIconLucide className="h-4 w-4 text-brand-red" /> Rate a New Customer
                </Button>
              </Link>
              <Link href="/subscription">
                <Button variant="outline" className="w-full justify-start gap-2 text-text-primary">
                  <DollarSign className="h-4 w-4 text-brand-red" /> Manage Subscription
                </Button>
              </Link>
            </CardContent>
          </Card>
          {/* Placeholder for future content, e.g., alerts or tips */}
          <Card className="border-border-subtle shadow-sm bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800 text-base">Welp Tip!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700">
                Remember to be fair and objective when rating customers. Your reviews help the whole community!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
