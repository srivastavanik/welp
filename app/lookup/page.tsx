"use client"

import { cn } from "@/lib/utils"

import type React from "react"
import { useState } from "react"
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
} from "lucide-react"
import { PageHeader } from "@/components/custom/page-header"
import { StarRatingDisplay } from "@/components/custom/star-rating"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

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

export default function CustomerLookupPage() {
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

  return (
    <>
      <PageHeader
        title="Customer Lookup"
        description="Search for customers by phone number to view their Welp profile."
        icon={Search}
      />
      <Card className="mb-6 border-border-subtle shadow-sm">
        <CardHeader>
          <CardTitle className="text-text-primary">Search Customer</CardTitle>
          <CardDescription className="text-text-secondary">
            Enter a customer's 10-digit phone number. Phone numbers are hashed for privacy.
            {!isPremium && (
              <span className="block mt-1 text-sm text-brand-red">
                You have {lookupsRemaining} lookup{lookupsRemaining === 1 ? "" : "s"} remaining this month.{" "}
                <Link href="/subscription" className="underline hover:text-brand-red-hover">
                  Upgrade now
                </Link>
                .
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-grow relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary/70" />
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="e.g., (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="pl-10 h-11 text-base"
                required
                pattern="\d{10}"
                title="Enter a 10-digit phone number"
              />
            </div>
            <Button
              type="submit"
              className="bg-brand-red text-brand-red-foreground hover:bg-brand-red-hover active:bg-brand-red-active h-11 text-base shrink-0"
              disabled={isLoading || (!isPremium && lookupsRemaining <= 0)}
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              {isLoading ? "Searching..." : "Lookup Customer"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-brand-red mx-auto" />
          <p className="mt-2 text-text-secondary">Loading customer profile...</p>
        </div>
      )}

      {notFound && !isLoading && (
        <Card className="border-border-subtle shadow-sm">
          <CardContent className="pt-6 text-center">
            <UserCircle className="mx-auto h-12 w-12 text-text-secondary/50 mb-2" />
            <p className="text-lg font-medium text-text-primary">No Profile Found</p>
            <p className="text-text-secondary">There is no Welp profile associated with this phone number.</p>
            <Button
              variant="link"
              className="mt-2 text-brand-red"
              onClick={() => {
                setPhoneNumber("")
                setNotFound(false)
              }}
            >
              Try another number
            </Button>
          </CardContent>
        </Card>
      )}

      {customerProfile && !isLoading && (
        <Card className="shadow-lg border-border-subtle">
          <CardHeader
            className={cn(
              "flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6",
              customerProfile.isFlagged ? "bg-red-50 border-b border-red-200" : "bg-green-50 border-b border-green-200",
            )}
          >
            {customerProfile.isFlagged ? (
              <AlertTriangle className="h-10 w-10 text-red-500 shrink-0" />
            ) : (
              <ShieldCheck className="h-10 w-10 text-green-600 shrink-0" />
            )}
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-text-primary">{customerProfile.displayId}</CardTitle>
                {customerProfile.isFlagged && (
                  <Badge variant="destructive" className="text-xs">
                    Flagged Profile
                  </Badge>
                )}
              </div>
              <StarRatingDisplay rating={customerProfile.overallScore} size={24} showText />
              <CardDescription className="text-sm mt-1">
                Based on {customerProfile.totalReviews} reviews. Last review: {customerProfile.lastReviewDate}.
              </CardDescription>
            </div>
            <Link href={`/rate?phone=${phoneNumber.replace(/\D/g, "")}`}>
              <Button variant="outline" className="shrink-0 border-brand-red text-brand-red hover:bg-brand-red/10">
                <StarIconLucide className="mr-2 h-4 w-4" /> Rate This Customer
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-brand-red" /> Score Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ScoreCard title="Behavior" score={customerProfile.behaviorScore} />
                <ScoreCard title="Payment" score={customerProfile.paymentScore} />
                <ScoreCard title="Maintenance" score={customerProfile.maintenanceScore} />
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-brand-red" /> Recent Reviews (
                {customerProfile.recentReviews.length})
              </h3>
              {customerProfile.recentReviews.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 -mr-2">
                  {customerProfile.recentReviews.map((review, index) => (
                    <Card key={index} className="bg-card border-border-subtle">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <p className="font-semibold text-text-primary">{review.businessName}</p>
                            <p className="text-xs text-text-secondary/80">
                              by {review.reviewerRole} • {review.date}
                            </p>
                          </div>
                          <StarRatingDisplay rating={review.rating} size={16} />
                        </div>
                        <p className="text-sm text-text-secondary italic mt-1 mb-2">"{review.comment}"</p>
                        {review.tags && review.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {review.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary">No detailed reviews available for this customer yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

function ScoreCard({ title, score }: { title: string; score: number }) {
  return (
    <Card className="text-center bg-card border-border-subtle">
      <CardHeader className="pb-1 pt-3">
        <CardTitle className="text-sm font-medium text-text-secondary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <StarRatingDisplay rating={score} size={18} className="justify-center mb-0.5" />
        <p className="text-xl font-bold text-text-primary">{score.toFixed(1)}</p>
      </CardContent>
    </Card>
  )
}