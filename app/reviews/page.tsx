"use client"

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/custom/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StarRatingDisplay } from "@/components/custom/star-rating"
import { FileText, Edit3, Trash2, Share2, StarIcon as StarIconLucide, Mic, Loader2, Sparkles, TrendingUp, Heart, ThumbsDown, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StarRatingInput } from "@/components/custom/star-rating"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// Updated Review interface to match Supabase structure
interface Review {
  id: string
  customer_id: string
  restaurant_name: string
  rating: number
  comment: string
  behavior_rating: number
  payment_rating: number
  maintenance_rating: number
  reviewer_role: string
  created_at: string
  updated_at: string
  customer?: {
    id: string
    name: string
    phone_number: string
    email?: string
  }
  reddit_url?: string
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

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingReddit, setLoadingReddit] = useState<string | null>(null)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [hoveredReview, setHoveredReview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Load reviews from API on component mount
  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/reviews')
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }
      const { reviews } = await response.json()
      setReviews(reviews)
    } catch (error) {
      console.error('Error loading reviews:', error)
      toast({
        title: "Error",
        description: "Failed to load reviews. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete review')
      }

      // Remove from local state with animation
      setReviews(reviews.filter(review => review.id !== reviewId))
      
      toast({
        title: "Review Deleted",
        description: "The review has been successfully deleted.",
        className: "bg-red-500 text-white",
      })
    } catch (error) {
      console.error('Error deleting review:', error)
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditReview = (review: Review) => {
    setEditingReview({ ...review })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingReview) return

    try {
      const response = await fetch(`/api/reviews/${editingReview.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: editingReview.rating,
          comment: editingReview.comment,
          behavior_rating: editingReview.behavior_rating,
          payment_rating: editingReview.payment_rating,
          maintenance_rating: editingReview.maintenance_rating,
          reviewer_role: editingReview.reviewer_role
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update review')
      }

      const { review: updatedReview } = await response.json()
      
      // Update local state
      setReviews(reviews.map(review => 
        review.id === updatedReview.id ? updatedReview : review
      ))
      
      setEditDialogOpen(false)
      setEditingReview(null)
      
      toast({
        title: "Review Updated",
        description: "Your review has been successfully updated.",
        className: "bg-green-500 text-white",
      })
    } catch (error) {
      console.error('Error updating review:', error)
      toast({
        title: "Error",
        description: "Failed to update review. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShareToReddit = async (reviewId: string) => {
    const review = reviews.find(r => r.id === reviewId)
    if (!review) return

    setLoadingReddit(reviewId)

    try {
      // Build payload expected by /api/reddit
      const payload = {
        customerDisplayId: review.customer?.name || `Customer ${review.customer_id.slice(-4)}`,
        overallRating: review.rating,
        comment: review.comment,
        tags: [], // TODO: derive tags
        reviewerRole: review.reviewer_role,
      }

      const res = await fetch('/api/reddit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to post to Reddit')
      }

      // Update local review with Reddit URL
      const redditUrl: string = data.url
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, reddit_url: redditUrl } : r))

      // Persist to Supabase
      try {
        await fetch(`/api/reviews/${reviewId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reddit_url: redditUrl }),
        })
      } catch (err) {
        console.error('Failed to persist reddit_url', err)
      }

      toast({
        title: "Posted to Reddit!",
        description: `Successfully shared to Reddit`,
        className: "bg-orange-500 text-white",
        action: redditUrl ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open(redditUrl, '_blank')}
            className="bg-white text-orange-500 border-orange-300 hover:bg-orange-50"
          >
            View Post
          </Button>
        ) : undefined
      })
    } catch (error) {
      console.error('Reddit posting error:', error)
      toast({
        title: "Reddit Post Failed",
        description: error instanceof Error ? error.message : "Failed to post to Reddit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingReddit(null)
    }
  }

  const getRatingIcon = (rating: number) => {
    if (rating >= 4) return { icon: Heart, color: "text-green-500" }
    if (rating >= 2.5) return { icon: ThumbsDown, color: "text-yellow-500" }
    return { icon: AlertTriangle, color: "text-red-500" }
  }

  const getAverageRating = (review: Review) => {
    return (review.rating + review.behavior_rating + review.payment_rating + review.maintenance_rating) / 4
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="w-16 h-16 rounded-full bg-gradient-brand mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gradient-brand font-medium">Loading your reviews...</p>
        </motion.div>
      </div>
    )
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
          title="My Submitted Reviews"
          description={`You have submitted ${reviews.length} reviews. Manage and view your contributions.`}
          icon={FileText}
          actions={
            <Link href="/rate">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-gradient-brand text-white hover:shadow-lg transition-all duration-200 relative overflow-hidden group">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <StarIconLucide className="mr-2 h-4 w-4 relative z-10" /> 
                  <span className="relative z-10">Add New Review</span>
                </Button>
              </motion.div>
            </Link>
          }
        />
      </motion.div>

      {reviews.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl hover-lift overflow-hidden">
            <CardContent className="pt-12 pb-8 text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FileText className="mx-auto h-16 w-16 text-red-300 mb-4" />
              </motion.div>
              <p className="text-xl font-bold text-gradient-brand mb-2">No Reviews Yet</p>
              <p className="text-gray-600 mb-6">You haven't submitted any customer reviews.</p>
              <Link href="/rate">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-gradient-brand text-white hover:shadow-lg">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Rate Your First Customer
                  </Button>
                </motion.div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
          >
            {reviews.map((review, index) => {
              const avgRating = getAverageRating(review)
              const RatingIcon = getRatingIcon(avgRating)
              
              return (
                <motion.div
                  key={review.id}
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  custom={index}
                  onMouseEnter={() => setHoveredReview(review.id)}
                  onMouseLeave={() => setHoveredReview(null)}
                  className="relative"
                >
                  <Card className={cn(
                    "border-0 shadow-lg overflow-hidden transition-all duration-300",
                    hoveredReview === review.id && "shadow-2xl scale-[1.02]",
                    avgRating >= 4 && "bg-gradient-to-r from-green-50/50 to-emerald-50/50",
                    avgRating < 4 && avgRating >= 2.5 && "bg-gradient-to-r from-yellow-50/50 to-amber-50/50",
                    avgRating < 2.5 && "bg-gradient-to-r from-red-50/50 to-pink-50/50"
                  )}>
                    {/* Animated background pattern */}
                    <motion.div
                      className="absolute inset-0 opacity-5"
                      animate={hoveredReview === review.id ? { opacity: 0.1 } : { opacity: 0.05 }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `radial-gradient(circle at ${hoveredReview === review.id ? '50% 50%' : '100% 100%'}, rgba(218, 38, 13, 0.1) 0%, transparent 50%)`
                        }}
                      />
                    </motion.div>
                    
                    <CardHeader className="flex flex-row justify-between items-start gap-2 pb-3 relative">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <motion.div
                            className={cn("p-2 rounded-full", RatingIcon.color)}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            style={{
                              background: avgRating >= 4 
                                ? "linear-gradient(135deg, #10b981, #059669)"
                                : avgRating >= 2.5
                                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                                : "linear-gradient(135deg, #ef4444, #dc2626)"
                            }}
                          >
                            <RatingIcon.icon className="h-4 w-4 text-white" />
                          </motion.div>
                          Review for: {review.customer?.name || `Customer ${review.customer_id.slice(-4)}`}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            📅
                          </motion.span>
                          Rated on {new Date(review.created_at).toLocaleDateString()} by {review.reviewer_role}
                        </CardDescription>
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <StarRatingDisplay rating={review.rating} size={20} showText />
                      </motion.div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3 pt-0 relative">
                      <motion.p 
                        className="text-sm text-gray-700 italic leading-relaxed bg-white/50 p-3 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        "{review.comment}"
                      </motion.p>

                      <motion.div 
                        className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        {[
                          { label: "Behavior", rating: review.behavior_rating, icon: "😊" },
                          { label: "Payment", rating: review.payment_rating, icon: "💰" },
                          { label: "Maintenance", rating: review.maintenance_rating, icon: "🧹" },
                        ].map((item, i) => (
                          <motion.div
                            key={item.label}
                            className="bg-white/70 rounded-lg p-3 text-center"
                            whileHover={{ scale: 1.05 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 + i * 0.05 }}
                          >
                            <div className="text-2xl mb-1">{item.icon}</div>
                            <div className="text-xs font-medium text-gray-600">{item.label}</div>
                            <StarRatingDisplay rating={item.rating} size={14} className="justify-center mt-1" />
                          </motion.div>
                        ))}
                      </motion.div>

                      <motion.div 
                        className="flex flex-wrap gap-2 items-center pt-3 border-t border-gray-200"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                          <DialogTrigger asChild>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditReview(review)}
                                className="hover:border-red-300 hover:text-red-600 group"
                              >
                                <Edit3 className="mr-1.5 h-3.5 w-3.5 group-hover:rotate-12 transition-transform" /> Edit
                              </Button>
                            </motion.div>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-gradient-brand">
                                Edit Review for {editingReview?.customer?.name || `Customer ${editingReview?.customer_id.slice(-4)}`}
                              </DialogTitle>
                              <DialogDescription>
                                Make changes to your review. Click save when you're done.
                              </DialogDescription>
                            </DialogHeader>
                            {editingReview && (
                              <div className="grid gap-4 py-4">
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-medium mb-2 block">Overall Rating</Label>
                                    <StarRatingInput 
                                      value={editingReview.rating} 
                                      onChange={(rating) => setEditingReview({...editingReview, rating: rating})}
                                      size={28}
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-medium mb-2 block">Behavior Rating</Label>
                                    <StarRatingInput 
                                      value={editingReview.behavior_rating} 
                                      onChange={(rating) => setEditingReview({...editingReview, behavior_rating: rating})}
                                      size={24}
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-medium mb-2 block">Payment Rating</Label>
                                    <StarRatingInput 
                                      value={editingReview.payment_rating} 
                                      onChange={(rating) => setEditingReview({...editingReview, payment_rating: rating})}
                                      size={24}
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-medium mb-2 block">Maintenance Rating</Label>
                                    <StarRatingInput 
                                      value={editingReview.maintenance_rating} 
                                      onChange={(rating) => setEditingReview({...editingReview, maintenance_rating: rating})}
                                      size={24}
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="edit-role" className="text-sm font-medium">Your Role</Label>
                                    <Select 
                                      value={editingReview.reviewer_role} 
                                      onValueChange={(value) => setEditingReview({...editingReview, reviewer_role: value})}
                                    >
                                      <SelectTrigger id="edit-role" className="mt-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="owner">Owner</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="server">Server</SelectItem>
                                        <SelectItem value="cashier">Cashier</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="edit-comment" className="text-sm font-medium">Comment</Label>
                                    <Textarea
                                      id="edit-comment"
                                      value={editingReview.comment}
                                      onChange={(e) => setEditingReview({...editingReview, comment: e.target.value})}
                                      rows={4}
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleSaveEdit} className="bg-gradient-brand text-white hover:shadow-lg">
                                Save Changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button variant="destructive" size="sm" className="hover:bg-red-600 group">
                                <Trash2 className="mr-1.5 h-3.5 w-3.5 group-hover:rotate-12 transition-transform" /> Delete
                              </Button>
                            </motion.div>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this review.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteReview(review.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Yes, delete review
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        {/* Reddit Share/View Button */}
                        {review.reddit_url ? (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(review.reddit_url!, '_blank')}
                              className="hover:border-orange-400 hover:text-orange-600 group bg-gradient-to-r from-orange-50 to-red-50"
                            >
                              <Share2 className="mr-1.5 h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
                              View on Reddit
                            </Button>
                          </motion.div>
                        ) : (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShareToReddit(review.id)}
                              disabled={loadingReddit === review.id}
                              className="hover:border-orange-400 hover:text-orange-600 group"
                            >
                              {loadingReddit === review.id ? (
                                <>
                                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                  Posting...
                                </>
                              ) : (
                                <>
                                  <Share2 className="mr-1.5 h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
                                  Post to Reddit
                                </>
                              )}
                            </Button>
                          </motion.div>
                        )}
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  )
}