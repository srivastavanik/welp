"use client"

import { cn } from "@/lib/utils"

import type React from "react"
import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Search,
  Phone,
  UserCircle,
  MessageSquare,
  ShieldCheck,
  BarChart3,
  StarIcon as StarIconLucide,
  Loader2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Shield,
  Flame,
  Trophy,
} from "lucide-react"
import { PageHeader } from "@/components/custom/page-header"
import { StarRatingDisplay } from "@/components/custom/star-rating"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface CustomerReviewMock {
  businessName: string
  rating: number
  comment: string
  date: string
  reviewerRole: string
  tags?: string[]
}
interface CustomerProfileMock {
  id: string
  displayId: string
  overallScore: number
  totalReviews: number
  behaviorScore: number
  paymentScore: number
  maintenanceScore: number
  recentReviews: CustomerReviewMock[]
  isFlagged?: boolean
  lastReviewDate: string
}

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

const mockCustomerFound: CustomerProfileMock = {
  id: "cust_123_sarah_p",
  displayId: "Sarah P.",
  overallScore: 2.1,
  totalReviews: 15,
  behaviorScore: 1.5,
  paymentScore: 2.0,
  maintenanceScore: 2.8,
  isFlagged: true,
  lastReviewDate: "1 week ago",
  recentReviews: [
    {
      businessName: "Quick Eats Diner",
      rating: 1.0,
      comment: "Rude and demanding. Spilled food everywhere and refused to clean up. Argued about the bill.",
      date: "1 week ago",
      reviewerRole: "Server",
      tags: ["Rude", "Messy", "Dispute"],
    },
    {
      businessName: "The Corner Store",
      rating: 2.5,
      comment: "Argued about price of an item, eventually paid but was unpleasant throughout the transaction.",
      date: "3 weeks ago",
      reviewerRole: "Cashier",
      tags: ["Argumentative"],
    },
    {
      businessName: "Luxury Hotel Downtown",
      rating: 2.0,
      comment:
        "Left room in a significant mess. Complained excessively about minor issues. Requested multiple free amenities.",
      date: "1 month ago",
      reviewerRole: "Manager",
      tags: ["High Maintenance", "Messy", "Excessive Complaints"],
    },
  ],
}

const mockCustomerGood: CustomerProfileMock = {
  id: "cust_456_james_b",
  displayId: "James B.",
  overallScore: 4.8,
  totalReviews: 22,
  behaviorScore: 4.9,
  paymentScore: 5.0,
  maintenanceScore: 4.5,
  isFlagged: false,
  lastReviewDate: "2 days ago",
  recentReviews: [
    {
      businessName: "Fine Dining Restaurant",
      rating: 5.0,
      comment: "An absolute pleasure to serve. Polite, patient, and tipped very generously. A model customer.",
      date: "2 days ago",
      reviewerRole: "Server",
      tags: ["Polite", "Generous Tipper", "Patient"],
    },
    {
      businessName: "Boutique Clothing",
      rating: 4.5,
      comment: "Friendly and decisive. Made a quick purchase and was very pleasant.",
      date: "2 weeks ago",
      reviewerRole: "Retail Assistant",
      tags: ["Friendly", "Easy Transaction"],
    },
  ],
}

function CustomerLookupPageContent() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [customerProfile, setCustomerProfile] = useState<CustomerProfileMock | null>(null)
  const [notFound, setNotFound] = useState(false)
  const { toast } = useToast()

  const lookupsRemaining = 1 // Mock
  const isPremium = false // Mock

  const handleLookup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      })
      return
    }
    if (!isPremium && lookupsRemaining <= 0) {
      toast({
        title: "Lookup Limit Reached",
        description: "Upgrade to Premium for unlimited lookups.",
        variant: "destructive",
        action: (
          <Link href="/subscription">
            <Button variant="outline" size="sm">
              Upgrade
            </Button>
          </Link>
        ),
      })
      return
    }

    setIsLoading(true)
    setCustomerProfile(null)
    setNotFound(false)

    try {
      // Clean phone number for API call
      const cleanPhone = phoneNumber.replace(/\D/g, "")
      
      // Look up customer
      const customerResponse = await fetch(`/api/customers?phone=${cleanPhone}`)
      
      if (customerResponse.status === 404) {
        setNotFound(true)
        toast({ title: "Not Found", description: "No customer profile found for this phone number." })
        setIsLoading(false)
        return
      }

      if (!customerResponse.ok) {
        throw new Error('Failed to fetch customer')
      }

      const { customer } = await customerResponse.json()

      // Fetch reviews for this customer
      const reviewsResponse = await fetch(`/api/reviews?customer_id=${customer.id}`)
      if (!reviewsResponse.ok) {
        throw new Error('Failed to fetch reviews')
      }

      const { reviews } = await reviewsResponse.json()

      // Calculate profile data from reviews
      const profile = calculateCustomerProfile(customer, reviews)
      setCustomerProfile(profile)
      toast({ title: "Customer Found", description: `Displaying profile for ${profile.displayId}` })
      
    } catch (error) {
      console.error('Error during lookup:', error)
      toast({
        title: "Error",
        description: "Failed to look up customer. Please try again.",
        variant: "destructive",
      })
    }
    
    setIsLoading(false)
  }

  const calculateCustomerProfile = (customer: any, reviews: any[]): CustomerProfileMock => {
    if (reviews.length === 0) {
      return {
        id: customer.id,
        displayId: customer.name,
        overallScore: 0,
        totalReviews: 0,
        behaviorScore: 0,
        paymentScore: 0,
        maintenanceScore: 0,
        isFlagged: false,
        lastReviewDate: "No reviews yet",
        recentReviews: []
      }
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const behaviorTotal = reviews.reduce((sum, review) => sum + review.behavior_rating, 0)
    const paymentTotal = reviews.reduce((sum, review) => sum + review.payment_rating, 0)
    const maintenanceTotal = reviews.reduce((sum, review) => sum + review.maintenance_rating, 0)

    const overallScore = totalRating / reviews.length
    const behaviorScore = behaviorTotal / reviews.length
    const paymentScore = paymentTotal / reviews.length
    const maintenanceScore = maintenanceTotal / reviews.length

    const recentReviews = reviews.slice(0, 10).map(review => ({
      businessName: review.restaurant_name,
      rating: review.rating,
      comment: review.comment,
      date: new Date(review.created_at).toLocaleDateString(),
      reviewerRole: review.reviewer_role,
      tags: generateTagsFromRating(review.rating, review.comment)
    }))

    return {
      id: customer.id,
      displayId: customer.name,
      overallScore,
      totalReviews: reviews.length,
      behaviorScore,
      paymentScore,
      maintenanceScore,
      isFlagged: overallScore < 2.5,
      lastReviewDate: reviews.length > 0 ? new Date(reviews[0].created_at).toLocaleDateString() : "No reviews",
      recentReviews
    }
  }

  const generateTagsFromRating = (rating: number, comment: string): string[] => {
    const tags: string[] = []
    const lowerComment = comment.toLowerCase()

    if (rating >= 4) {
      if (lowerComment.includes('tip') || lowerComment.includes('generous')) tags.push('Generous Tipper')
      if (lowerComment.includes('polite') || lowerComment.includes('pleasant')) tags.push('Polite')
      if (lowerComment.includes('understanding') || lowerComment.includes('patient')) tags.push('Patient')
      if (tags.length === 0) tags.push('Great Customer')
    } else if (rating <= 2) {
      if (lowerComment.includes('rude') || lowerComment.includes('difficult')) tags.push('Rude')
      if (lowerComment.includes('mess') || lowerComment.includes('dirty')) tags.push('Messy')
      if (lowerComment.includes('dispute') || lowerComment.includes('refund')) tags.push('Dispute')
      if (tags.length === 0) tags.push('Difficult Customer')
    } else {
      tags.push('Average')
    }

    return tags
  }

  // Get profile quality emoji
  const getProfileEmoji = (score: number) => {
    if (score >= 4.5) return "⭐"
    if (score >= 3.5) return "👍"
    if (score >= 2.5) return "😐"
    if (score >= 1.5) return "👎"
    return "⚠️"
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="page-enter"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Customer Lookup"
          description="Search for customers by phone number to view their Welp profile."
          icon={Search}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="mb-6 border-0 shadow-xl hover-lift overflow-hidden relative">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-5">
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 80%, rgba(218, 38, 13, 0.2) 0%, transparent 50%)`
              }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.05, 0.1, 0.05]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>
          
          <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100 relative">
            <CardTitle className="text-2xl text-gradient-brand flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-6 w-6 text-red-500" />
              </motion.div>
              Search Customer
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter a customer's 10-digit phone number. Phone numbers are hashed for privacy.
              {!isPremium && (
                <motion.span 
                  className="block mt-2 text-sm font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-red-600">
                    ⚡ You have {lookupsRemaining} lookup{lookupsRemaining === 1 ? "" : "s"} remaining this month.
                  </span>{" "}
                  <Link href="/subscription" className="text-red-600 underline hover:text-red-700 font-semibold">
                    Upgrade now
                  </Link>
                </motion.span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative p-8">
            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
              <motion.div 
                className="flex-grow relative"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-400" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="e.g., (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="pl-10 h-12 text-base focus:ring-2 focus:ring-red-500/20 hover:border-red-300 transition-colors"
                  required
                  pattern="\d{10}"
                  title="Enter a 10-digit phone number"
                />
                {phoneNumber && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {phoneNumber.length === 10 ? (
                      <span className="text-green-500 text-lg">✓</span>
                    ) : (
                      <span className="text-gray-400 text-xs">{10 - phoneNumber.length} more</span>
                    )}
                  </motion.div>
                )}
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="submit"
                  className="bg-gradient-brand text-white hover:shadow-xl h-12 text-base font-semibold relative overflow-hidden group"
                  disabled={isLoading || (!isPremium && lookupsRemaining <= 0)}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin relative z-10" />
                      <span className="relative z-10">Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4 relative z-10" />
                      <span className="relative z-10">Lookup Customer</span>
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <motion.div
              className="w-20 h-20 rounded-full bg-gradient-brand mx-auto mb-4 relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Search className="h-10 w-10 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </motion.div>
            <motion.p 
              className="text-lg text-gradient-brand font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Searching our database...
            </motion.p>
          </motion.div>
        )}

        {notFound && !isLoading && (
          <motion.div
            key="not-found"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="border-0 shadow-xl hover-lift overflow-hidden">
              <CardContent className="pt-12 pb-8 text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mb-4"
                >
                  <UserCircle className="mx-auto h-16 w-16 text-gray-300" />
                </motion.div>
                <p className="text-xl font-bold text-gradient-brand mb-2">No Profile Found</p>
                <p className="text-gray-600 mb-4">There is no Welp profile associated with this phone number.</p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setPhoneNumber("")
                      setNotFound(false)
                    }}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Try another number
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {customerProfile && !isLoading && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="shadow-2xl border-0 overflow-hidden hover-lift">
              <CardHeader
                className={cn(
                  "flex flex-col sm:flex-row items-start sm:items-center gap-4 p-8 relative overflow-hidden",
                  customerProfile.isFlagged 
                    ? "bg-gradient-to-r from-red-50 to-pink-50" 
                    : "bg-gradient-to-r from-green-50 to-emerald-50"
                )}
              >
                {/* Animated background pattern */}
                <motion.div
                  className="absolute inset-0 opacity-10"
                  animate={{
                    backgroundImage: [
                      `radial-gradient(circle at 0% 0%, ${customerProfile.isFlagged ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'} 0%, transparent 50%)`,
                      `radial-gradient(circle at 100% 100%, ${customerProfile.isFlagged ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'} 0%, transparent 50%)`,
                      `radial-gradient(circle at 0% 0%, ${customerProfile.isFlagged ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'} 0%, transparent 50%)`,
                    ]
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                />
                
                <motion.div
                  className="relative z-10"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {customerProfile.isFlagged ? (
                    <div className="p-3 rounded-full bg-gradient-to-br from-red-500 to-pink-500 shadow-lg">
                      <AlertTriangle className="h-10 w-10 text-white" />
                    </div>
                  ) : (
                    <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                      <Shield className="h-10 w-10 text-white" />
                    </div>
                  )}
                </motion.div>
                
                <div className="flex-grow relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-3xl font-bold">
                      {customerProfile.displayId}
                    </CardTitle>
                    <motion.span 
                      className="text-4xl"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {getProfileEmoji(customerProfile.overallScore)}
                    </motion.span>
                    {customerProfile.isFlagged && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Badge variant="destructive" className="text-xs font-bold px-3 py-1">
                          ⚠️ Flagged Profile
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <StarRatingDisplay rating={customerProfile.overallScore} size={28} showText />
                  </motion.div>
                  <CardDescription className="text-sm mt-2 flex items-center gap-2">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      📊
                    </motion.span>
                    Based on {customerProfile.totalReviews} reviews • Last review: {customerProfile.lastReviewDate}
                  </CardDescription>
                </div>
                <Link href={`/rate?phone=${phoneNumber.replace(/\D/g, "")}`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-gradient-brand text-white hover:shadow-lg relative overflow-hidden group">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <StarIconLucide className="mr-2 h-4 w-4 relative z-10" /> 
                      <span className="relative z-10">Rate This Customer</span>
                    </Button>
                  </motion.div>
                </Link>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8 relative">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <BarChart3 className="h-6 w-6 text-red-500" />
                    </motion.div>
                    Score Breakdown
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { title: "Behavior", score: customerProfile.behaviorScore, icon: "😊", color: "from-purple-500 to-pink-500" },
                      { title: "Payment", score: customerProfile.paymentScore, icon: "💰", color: "from-green-500 to-emerald-500" },
                      { title: "Maintenance", score: customerProfile.maintenanceScore, icon: "🧹", color: "from-blue-500 to-cyan-500" },
                    ].map((item, index) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <ScoreCard {...item} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                
                <Separator className="bg-gradient-to-r from-transparent via-red-200 to-transparent" />
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <MessageSquare className="h-6 w-6 text-red-500" />
                    </motion.div>
                    Recent Reviews ({customerProfile.recentReviews.length})
                  </h3>
                  {customerProfile.recentReviews.length > 0 ? (
                    <motion.div 
                      className="space-y-4 max-h-[500px] overflow-y-auto pr-2 -mr-2"
                      initial="hidden"
                      animate="visible"
                      variants={containerVariants}
                    >
                      {customerProfile.recentReviews.map((review, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          custom={index}
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Card className={cn(
                            "border-0 shadow-md overflow-hidden hover:shadow-lg transition-all",
                            review.rating >= 4 && "bg-gradient-to-r from-green-50/50 to-emerald-50/50",
                            review.rating < 4 && review.rating >= 2.5 && "bg-gradient-to-r from-yellow-50/50 to-amber-50/50",
                            review.rating < 2.5 && "bg-gradient-to-r from-red-50/50 to-pink-50/50"
                          )}>
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-bold text-lg">{review.businessName}</p>
                                  <p className="text-xs text-gray-600 flex items-center gap-1">
                                    <span>by {review.reviewerRole}</span>
                                    <span>•</span>
                                    <span>{review.date}</span>
                                  </p>
                                </div>
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.6 + index * 0.1 }}
                                >
                                  <StarRatingDisplay rating={review.rating} size={16} />
                                </motion.div>
                              </div>
                              <p className="text-sm text-gray-700 italic mt-2 mb-3 bg-white/50 p-3 rounded-lg">
                                "{review.comment}"
                              </p>
                              {review.tags && review.tags.length > 0 && (
                                <motion.div 
                                  className="flex flex-wrap gap-1.5"
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
                                          "text-xs",
                                          review.rating < 2.5 && "bg-red-100 text-red-700",
                                          review.rating >= 4 && "bg-green-100 text-green-700"
                                        )}
                                      >
                                        {tag}
                                      </Badge>
                                    </motion.div>
                                  ))}
                                </motion.div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">
                      No detailed reviews available for this customer yet.
                    </p>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ScoreCard({ title, score, icon, color }: { title: string; score: number; icon: string; color: string }) {
  const getScoreQuality = (score: number) => {
    if (score >= 4.5) return { text: "Excellent", color: "text-green-600" }
    if (score >= 3.5) return { text: "Good", color: "text-blue-600" }
    if (score >= 2.5) return { text: "Fair", color: "text-yellow-600" }
    if (score >= 1.5) return { text: "Poor", color: "text-orange-600" }
    return { text: "Very Poor", color: "text-red-600" }
  }

  const quality = getScoreQuality(score)

  return (
    <Card className="text-center border-0 shadow-lg hover-lift overflow-hidden relative group">
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br transition-opacity", color)} />
      
      <CardHeader className="pb-2 pt-6">
        <motion.div
          className="text-4xl mb-2"
          whileHover={{ scale: 1.2, rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          {icon}
        </motion.div>
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <StarRatingDisplay rating={score} size={18} className="justify-center mb-2" />
        <motion.p 
          className="text-2xl font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {score.toFixed(1)}
        </motion.p>
        <p className={cn("text-xs font-medium mt-1", quality.color)}>
          {quality.text}
        </p>
      </CardContent>
    </Card>
  )
}

// Loading fallback component
function CustomerLookupLoading() {
  return (
    <div className="page-enter">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

export default function CustomerLookupPage() {
  return (
    <Suspense fallback={<CustomerLookupLoading />}>
      <CustomerLookupPageContent />
    </Suspense>
  )
}