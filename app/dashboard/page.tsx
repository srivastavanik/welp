"use client"

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Clock,
  Award,
  Target,
} from "lucide-react"
import { PageHeader } from "@/components/custom/page-header"
import { StarRatingDisplay } from "@/components/custom/star-rating"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Mock data with enhanced statistics
const stats = [
  { 
    title: "Total Reviews Left", 
    value: "125", 
    icon: StarIconLucide, 
    change: "+12 this week", 
    trend: "up",
    description: "Customer reviews submitted",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  { 
    title: "Avg. Customer Rating", 
    value: "3.8", 
    icon: Users, 
    change: "-0.2 from last month", 
    trend: "down",
    description: "Overall customer satisfaction",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  { 
    title: "Lookups This Month", 
    value: "2/5", 
    icon: Search, 
    change: "3 remaining", 
    trend: "neutral",
    description: "Customer profile searches",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  { 
    title: "Subscription", 
    value: "Free", 
    icon: CreditCard, 
    change: "Upgrade for more features", 
    trend: "neutral",
    description: "Current plan status",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
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
    timeAgo: "2d",
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
    timeAgo: "5d",
  },
  {
    id: "3",
    customerDisplayId: "David S.",
    overallRating: 5.0,
    comment: "Best customer ever! Tipped generously and was very understanding about a small delay.",
    date: "1 week ago",
    reviewer: "Sarah M.",
    tags: ["Generous Tipper", "Understanding"],
    timeAgo: "1w",
  },
]

const quickStats = [
  { label: "This Week", value: "12", change: "+3", icon: Calendar },
  { label: "Today", value: "3", change: "+1", icon: Clock },
  { label: "Top Rated", value: "4.8★", change: "David S.", icon: Award },
  { label: "Goal Progress", value: "84%", change: "16 to go", icon: Target },
]

export default function DashboardPage() {
  const lookupProgress = (2 / 5) * 100 // 2 out of 5 lookups used

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your business activity on Welp."
        icon={Activity}
        actions={
          <div className="flex gap-3">
            <Link href="/lookup">
              <Button variant="outline" className="gap-2">
                <Search className="h-4 w-4" />
                Lookup Customer
              </Button>
            </Link>
            <Link href="/rate">
              <Button className="bg-brand-red text-brand-red-foreground hover:bg-brand-red-hover active:bg-brand-red-active gap-2">
                <StarIconLucide className="h-4 w-4" />
                Rate Customer
              </Button>
            </Link>
          </div>
        }
      />

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {quickStats.map((stat, index) => (
          <Card key={stat.label} className="border-border-subtle shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-secondary font-medium">{stat.label}</p>
                  <p className="text-xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-xs text-green-600 font-medium">{stat.change}</p>
                </div>
                <stat.icon className="h-8 w-8 text-text-secondary/50" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={stat.title} className={`border-border-subtle shadow-sm hover:shadow-lg transition-all duration-200 ${stat.bgColor} ${stat.borderColor}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-text-secondary">{stat.title}</CardTitle>
                <CardDescription className="text-xs text-text-secondary/80">{stat.description}</CardDescription>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-text-primary">
                  {stat.title === "Avg. Customer Rating" ? (
                    <div className="flex items-center gap-2">
                      <StarRatingDisplay rating={Number.parseFloat(stat.value)} showText size={20} />
                    </div>
                  ) : (
                    stat.value
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {stat.trend === "up" && <TrendingUp className="h-3 w-3 text-green-600" />}
                  {stat.trend === "down" && <TrendingDown className="h-3 w-3 text-red-600" />}
                  {stat.trend === "neutral" && <Minus className="h-3 w-3 text-gray-600" />}
                  <span className={`font-medium ${
                    stat.trend === "up" ? "text-green-600" : 
                    stat.trend === "down" ? "text-red-600" : 
                    "text-gray-600"
                  }`}>
                    {stat.change}
                  </span>
                </div>
                {stat.title === "Lookups This Month" && (
                  <div className="space-y-1">
                    <Progress value={lookupProgress} className="h-2" />
                    <p className="text-xs text-text-secondary">2 of 5 lookups used</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reviews - Enhanced */}
        <Card className="lg:col-span-2 border-border-subtle shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-xl text-text-primary flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-brand-red" />
                Recent Customer Reviews
              </CardTitle>
              <CardDescription className="text-text-secondary mt-1">
                Latest ratings submitted by your team members.
              </CardDescription>
            </div>
            <Link href="/reviews">
              <Button variant="outline" size="sm" className="gap-2 hover:bg-brand-red/5 hover:border-brand-red/20">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentReviewsMock.map((review) => (
              <div
                key={review.id}
                className="group flex items-start gap-4 p-4 border border-border-subtle rounded-xl bg-card hover:shadow-md hover:border-brand-red/20 transition-all duration-200"
              >
                <div
                  className={`p-3 rounded-full mt-1 transition-colors ${
                    review.overallRating >= 4 
                      ? "bg-green-100 text-green-600 group-hover:bg-green-200" 
                      : review.overallRating >= 2.5 
                        ? "bg-yellow-100 text-yellow-600 group-hover:bg-yellow-200" 
                        : "bg-red-100 text-red-600 group-hover:bg-red-200"
                  }`}
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
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-text-primary">{review.customerDisplayId}</p>
                      <Badge variant="secondary" className="text-xs">{review.timeAgo}</Badge>
                    </div>
                    <StarRatingDisplay rating={review.overallRating} size={16} />
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">{review.comment}</p>
                  {review.tags && review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {review.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className={`text-xs ${
                            review.overallRating >= 4 
                              ? "border-green-200 text-green-700 bg-green-50" 
                              : "border-red-200 text-red-700 bg-red-50"
                          }`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-text-secondary/70">
                    by {review.reviewer}
                  </p>
                </div>
              </div>
            ))}
            {recentReviewsMock.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-text-secondary/30 mx-auto mb-4" />
                <p className="text-text-secondary text-lg font-medium">No reviews yet</p>
                <p className="text-text-secondary/70 text-sm">Start by rating a customer!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions - Enhanced */}
          <Card className="border-border-subtle shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-text-primary flex items-center gap-2">
                <Activity className="h-5 w-5 text-brand-red" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-text-secondary">
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/lookup">
                <Button variant="outline" className="w-full justify-start gap-3 h-12 text-text-primary hover:bg-brand-red/5 hover:border-brand-red/20 transition-colors">
                  <div className="p-1.5 rounded-md bg-blue-100">
                    <Search className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Customer Lookup</div>
                    <div className="text-xs text-text-secondary">Search customer profiles</div>
                  </div>
                </Button>
              </Link>
              <Link href="/rate">
                <Button variant="outline" className="w-full justify-start gap-3 h-12 text-text-primary hover:bg-brand-red/5 hover:border-brand-red/20 transition-colors">
                  <div className="p-1.5 rounded-md bg-green-100">
                    <StarIconLucide className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Rate Customer</div>
                    <div className="text-xs text-text-secondary">Submit new review</div>
                  </div>
                </Button>
              </Link>
              <Link href="/subscription">
                <Button variant="outline" className="w-full justify-start gap-3 h-12 text-text-primary hover:bg-brand-red/5 hover:border-brand-red/20 transition-colors">
                  <div className="p-1.5 rounded-md bg-purple-100">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Upgrade Plan</div>
                    <div className="text-xs text-text-secondary">Unlock more features</div>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Monthly Progress */}
          <Card className="border-border-subtle shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Monthly Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700 font-medium">Reviews Goal</span>
                  <span className="text-blue-600">84/100</span>
                </div>
                <Progress value={84} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700 font-medium">Lookups Used</span>
                  <span className="text-blue-600">2/5</span>
                </div>
                <Progress value={40} className="h-2" />
              </div>
              <p className="text-xs text-blue-600 mt-3">
                Great progress! You're on track to reach your monthly goals.
              </p>
            </CardContent>
          </Card>

          {/* Welp Tip - Enhanced */}
          <Card className="border-border-subtle shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-amber-800 text-lg flex items-center gap-2">
                <Award className="h-5 w-5" />
                Welp Tip!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-700 leading-relaxed">
                💡 <strong>Pro tip:</strong> Customers with ratings above 4.0 are 3x more likely to tip well and return. Use the lookup feature to identify your best customers!
              </p>
              <Link href="/lookup" className="mt-3 inline-block">
                <Button size="sm" variant="outline" className="text-amber-700 border-amber-300 hover:bg-amber-100">
                  Try Lookup Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}