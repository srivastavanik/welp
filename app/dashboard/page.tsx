export const dynamic = 'force-dynamic'

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
  Sparkles,
  Zap,
  Trophy,
  Flame,
} from "lucide-react"
import { PageHeader } from "@/components/custom/page-header"
import { StarRatingDisplay } from "@/components/custom/star-rating"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

// Mock data
const stats = [
  { 
    title: "Total Reviews Left", 
    value: "125", 
    icon: StarIconLucide, 
    change: "+12 this week", 
    trend: "up",
    color: "from-red-500 to-pink-500",
    bgPattern: "radial-gradient(circle at 20% 80%, rgba(255, 0, 0, 0.1) 0%, transparent 50%)"
  },
  { 
    title: "Avg. Customer Rating", 
    value: "3.8", 
    icon: Users, 
    change: "Slightly down", 
    trend: "down",
    color: "from-orange-500 to-amber-500",
    bgPattern: "radial-gradient(circle at 80% 20%, rgba(255, 165, 0, 0.1) 0%, transparent 50%)"
  },
  { 
    title: "Lookups This Month", 
    value: "2/3", 
    icon: Search, 
    change: "Free Tier", 
    trend: "neutral",
    color: "from-purple-500 to-pink-500",
    bgPattern: "radial-gradient(circle at 50% 50%, rgba(128, 0, 128, 0.1) 0%, transparent 50%)"
  },
  { 
    title: "Subscription", 
    value: "Free", 
    icon: CreditCard, 
    change: "Upgrade for more", 
    trend: "neutral",
    color: "from-red-600 to-rose-600",
    bgPattern: "radial-gradient(circle at 80% 80%, rgba(220, 20, 60, 0.1) 0%, transparent 50%)"
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

export default function DashboardPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="Dashboard"
        description="Overview of your business activity on Welp."
        icon={Activity}
        actions={
          <Link href="/rate">
            <Button className="bg-gradient-brand text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 btn-brand relative overflow-hidden group">
              <StarIconLucide className="mr-2 h-4 w-4 relative z-10" /> 
              <span className="relative z-10">Rate a Customer</span>
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={stat.title} className="border-0 shadow-lg hover-lift overflow-hidden relative group">
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: stat.bgPattern }}
            />
            
            <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${stat.color}`} />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold">
                {stat.title === "Avg. Customer Rating" ? (
                  <StarRatingDisplay rating={Number.parseFloat(stat.value)} showText size={22} />
                ) : (
                  <span className="text-gradient-brand inline-block">
                    {stat.value}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {stat.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                {stat.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                {stat.trend === "neutral" && <Minus className="h-3 w-3 text-gray-500" />}
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-xl hover-lift overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100 relative overflow-hidden">
              <div className="flex flex-row items-center justify-between relative z-10">
                <div>
                  <CardTitle className="text-xl text-gradient-brand flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-red-500" />
                    Recent Customer Reviews
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">Latest ratings submitted by your team.</CardDescription>
                </div>
                <Link href="/reviews">
                  <Button variant="outline" size="sm" className="ml-auto gap-1 border-red-200 text-red-600 hover:bg-red-50 group">
                    View All 
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {recentReviewsMock.map((review, index) => (
                <div
                  key={review.id}
                  className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-200 relative overflow-hidden bg-gradient-to-r hover:shadow-lg hover:-translate-y-0.5 group ${
                    review.flagged 
                      ? "from-red-50 to-pink-50 border border-red-200" 
                      : review.overallRating >= 4 
                      ? "from-green-50 to-emerald-50 border border-green-200"
                      : "from-yellow-50 to-amber-50 border border-yellow-200"
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-full mt-1 relative ${
                      review.overallRating >= 4 ? "bg-gradient-to-br from-green-400 to-emerald-500" : 
                      review.overallRating >= 2.5 ? "bg-gradient-to-br from-yellow-400 to-amber-500" : 
                      "bg-gradient-to-br from-red-400 to-pink-500"
                    }`}
                  >
                    {review.flagged ? (
                      <AlertTriangle className="h-5 w-5 text-white relative z-10" />
                    ) : review.overallRating >= 4 ? (
                      <ThumbsUp className="h-5 w-5 text-white relative z-10" />
                    ) : review.overallRating >= 2.5 ? (
                      <MessageSquare className="h-5 w-5 text-white relative z-10" />
                    ) : (
                      <ThumbsDown className="h-5 w-5 text-white relative z-10" />
                    )}
                  </div>
                  <div className="grid gap-1 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">
                        {review.customerDisplayId}
                      </p>
                      <StarRatingDisplay rating={review.overallRating} size={16} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                    {review.tags && review.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {review.tags.map((tag, tagIndex) => (
                          <Badge 
                            key={tag}
                            variant="secondary" 
                            className={`text-xs transition-all ${
                              review.flagged ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {review.date} by {review.reviewer}
                    </p>
                  </div>
                </div>
              ))}
              {recentReviewsMock.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No reviews yet. Start by rating a customer!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-xl overflow-hidden hover-lift group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 opacity-90" />
            
            <CardHeader className="text-white relative z-10">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-6 relative z-10">
              {[
                { href: "/lookup", icon: Search, label: "Customer Lookup" },
                { href: "/rate", icon: StarIconLucide, label: "Rate a New Customer" },
                { href: "/subscription", icon: DollarSign, label: "Manage Subscription" },
              ].map((action, index) => (
                <Link key={action.href} href={action.href}>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 bg-white/90 backdrop-blur-sm hover:bg-white border-white/50 group/btn"
                  >
                    <action.icon className="h-4 w-4 text-red-500 group-hover/btn:text-red-600" />
                    <span className="group-hover/btn:text-red-600 transition-colors">{action.label}</span>
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white hover-lift overflow-hidden relative group">
            <div className="absolute inset-0 bg-white/10"></div>
            <CardHeader className="relative">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Pro Tip of the Day!
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm opacity-90">
                Remember: Bad tippers get bad ratings. It's not personal, it's just business! 💅
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white hover-lift overflow-hidden relative group">
            <CardHeader className="relative">
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="h-5 w-5" />
                You're on Fire!
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm opacity-90">
                125 reviews this month! Keep rating those customers! 🔥
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}