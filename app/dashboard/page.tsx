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
  Sparkles,
  Zap,
  Trophy,
  Flame,
} from "lucide-react"
import { PageHeader } from "@/components/custom/page-header"
import { StarRatingDisplay } from "@/components/custom/star-rating"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100
    }
  }
}

export default function DashboardPage() {
  return (
    <div className="page-enter">
      <PageHeader
        title="Dashboard"
        description="Overview of your business activity on Welp."
        icon={Activity}
        actions={
          <Link href="/rate">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="bg-gradient-brand text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 btn-brand relative overflow-hidden group">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <StarIconLucide className="mr-2 h-4 w-4 relative z-10" /> 
                <span className="relative z-10">Rate a Customer</span>
              </Button>
            </motion.div>
          </Link>
        }
      />

      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat, index) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="border-0 shadow-lg hover-lift overflow-hidden relative group">
              {/* Animated background pattern */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: stat.bgPattern }}
              />
              
              {/* Gradient overlay */}
              <motion.div 
                className={cn("absolute inset-0 opacity-10 bg-gradient-to-br", stat.color)}
                whileHover={{ opacity: 0.2 }}
                transition={{ duration: 0.3 }}
              />
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <motion.div 
                  className={cn("p-2 rounded-lg bg-gradient-to-br", stat.color)}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <stat.icon className="h-4 w-4 text-white" />
                </motion.div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold">
                  {stat.title === "Avg. Customer Rating" ? (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <StarRatingDisplay rating={Number.parseFloat(stat.value)} showText size={22} />
                    </motion.div>
                  ) : (
                    <motion.span 
                      className="text-gradient-brand inline-block"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                    >
                      {stat.value}
                    </motion.span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {stat.trend === "up" && (
                    <motion.div
                      animate={{ y: [-2, 0, -2] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    </motion.div>
                  )}
                  {stat.trend === "down" && (
                    <motion.div
                      animate={{ y: [0, 2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    </motion.div>
                  )}
                  {stat.trend === "neutral" && <Minus className="h-3 w-3 text-gray-500" />}
                  {stat.change}
                </div>
                
                {/* Sparkle effect on hover */}
                <motion.div
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Sparkles className="h-3 w-3 text-yellow-400" />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-xl hover-lift overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100 relative overflow-hidden">
              {/* Animated pattern */}
              <motion.div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 0, 0, 0.1) 10px, rgba(255, 0, 0, 0.1) 20px)`
                }}
                animate={{ x: [0, 28] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="flex flex-row items-center justify-between relative z-10">
                <div>
                  <CardTitle className="text-xl text-gradient-brand flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-5 w-5 text-red-500" />
                    </motion.div>
                    Recent Customer Reviews
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">Latest ratings submitted by your team.</CardDescription>
                </div>
                <Link href="/reviews">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="sm" className="ml-auto gap-1 border-red-200 text-red-600 hover:bg-red-50 group">
                      View All 
                      <motion.div
                        className="inline-block"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <AnimatePresence>
                {recentReviewsMock.map((review, index) => (
                  <motion.div
                    key={review.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl transition-all duration-200 relative overflow-hidden",
                      "bg-gradient-to-r hover:shadow-lg hover:-translate-y-0.5 group",
                      review.flagged 
                        ? "from-red-50 to-pink-50 border border-red-200" 
                        : review.overallRating >= 4 
                        ? "from-green-50 to-emerald-50 border border-green-200"
                        : "from-yellow-50 to-amber-50 border border-yellow-200"
                    )}
                  >
                    {/* Hover glow effect */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                      style={{
                        background: review.flagged 
                          ? "radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 0, 0, 0.1) 0%, transparent 50%)"
                          : review.overallRating >= 4
                          ? "radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 255, 0, 0.1) 0%, transparent 50%)"
                          : "radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 0, 0.1) 0%, transparent 50%)"
                      }}
                    />
                    
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className={cn(
                        "p-2.5 rounded-full mt-1 relative",
                        review.overallRating >= 4 ? "bg-gradient-to-br from-green-400 to-emerald-500" : 
                        review.overallRating >= 2.5 ? "bg-gradient-to-br from-yellow-400 to-amber-500" : 
                        "bg-gradient-to-br from-red-400 to-pink-500"
                      )}
                    >
                      {/* Pulse effect for flagged items */}
                      {review.flagged && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-red-400"
                          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                      {review.flagged ? (
                        <AlertTriangle className="h-5 w-5 text-white relative z-10" />
                      ) : review.overallRating >= 4 ? (
                        <ThumbsUp className="h-5 w-5 text-white relative z-10" />
                      ) : review.overallRating >= 2.5 ? (
                        <MessageSquare className="h-5 w-5 text-white relative z-10" />
                      ) : (
                        <ThumbsDown className="h-5 w-5 text-white relative z-10" />
                      )}
                    </motion.div>
                    <div className="grid gap-1 flex-1">
                      <div className="flex items-center justify-between">
                        <motion.p 
                          className="text-sm font-bold"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          {review.customerDisplayId}
                        </motion.p>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
                        >
                          <StarRatingDisplay rating={review.overallRating} size={16} />
                        </motion.div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                      {review.tags && review.tags.length > 0 && (
                        <motion.div 
                          className="flex flex-wrap gap-1 mt-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                        >
                          {review.tags.map((tag, tagIndex) => (
                            <motion.div
                              key={tag}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.8 + index * 0.1 + tagIndex * 0.05 }}
                              whileHover={{ scale: 1.1 }}
                            >
                              <Badge 
                                variant="secondary" 
                                className={cn(
                                  "text-xs transition-all",
                                  review.flagged ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                )}
                              >
                                {tag}
                              </Badge>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {review.date} by {review.reviewer}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {recentReviewsMock.length === 0 && (
                <motion.div 
                  className="text-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-muted-foreground">No reviews yet. Start by rating a customer!</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 shadow-xl overflow-hidden hover-lift group relative">
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 opacity-90"
                animate={{
                  background: [
                    "linear-gradient(135deg, #ef4444 0%, #ec4899 50%, #f97316 100%)",
                    "linear-gradient(135deg, #ec4899 0%, #f97316 50%, #ef4444 100%)",
                    "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #ec4899 100%)",
                    "linear-gradient(135deg, #ef4444 0%, #ec4899 50%, #f97316 100%)",
                  ]
                }}
                transition={{ duration: 10, repeat: Infinity }}
              />
              
              <CardHeader className="text-white relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="h-5 w-5" />
                  </motion.div>
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
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2 bg-white/90 backdrop-blur-sm hover:bg-white border-white/50 group/btn"
                      >
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <action.icon className="h-4 w-4 text-red-500 group-hover/btn:text-red-600" />
                        </motion.div>
                        <span className="group-hover/btn:text-red-600 transition-colors">{action.label}</span>
                      </Button>
                    </motion.div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white hover-lift overflow-hidden relative group">
              {/* Floating particles effect */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/20 rounded-full"
                  initial={{ 
                    bottom: `${5 + (i * 3)}%`,
                    left: `${10 + (i * 18)}%`,
                  }}
                  animate={{ 
                    bottom: "100%",
                    left: `${10 + (i * 18)}%`,
                  }}
                  transition={{
                    duration: 5 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "linear"
                  }}
                />
              ))}
              
              <div className="absolute inset-0 bg-white/10"></div>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-200%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <CardHeader className="relative">
                <CardTitle className="text-base flex items-center gap-2">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Trophy className="h-5 w-5" />
                  </motion.div>
                  Pro Tip of the Day!
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <motion.p 
                  className="text-sm opacity-90"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Remember: Bad tippers get bad ratings. It's not personal, it's just business! 💅
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievement Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white hover-lift overflow-hidden relative group">
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    "radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)",
                    "radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)",
                    "radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)",
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              
              <CardHeader className="relative">
                <CardTitle className="text-base flex items-center gap-2">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Flame className="h-5 w-5" />
                  </motion.div>
                  You're on Fire!
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm opacity-90">
                  125 reviews this month! Keep rating those customers! 🔥
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
