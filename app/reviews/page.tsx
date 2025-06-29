"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/custom/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StarRatingDisplay } from "@/components/custom/star-rating"
import { FileText, Edit3, Trash2, Share2, StarIcon as StarIconLucide, Mic, Loader2 } from "lucide-react"
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
import { redditService } from "@/lib/reddit"
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
}

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingReddit, setLoadingReddit] = useState<string | null>(null)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const { toast } = useToast()

  // Load reviews from API on component mount
  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
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

      // Remove from local state
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
      // Generate Reddit post content using updated review structure
      const postContent = redditService.generatePostContent({
        customerDisplayId: review.customer?.name || `Customer ${review.customer_id.slice(-4)}`,
        overallRating: review.rating,
        comment: review.comment,
        tags: [], // Tags would need to be generated from the comment/rating
        reviewerRole: review.reviewer_role
      })

      // Use mock posting for now (until Reddit API is configured)
      const result = await redditService.mockPostToReddit(postContent)

      if (result.success) {
        toast({
          title: "Posted to Reddit!",
          description: `Successfully shared to r/${postContent.subreddit}`,
          className: "bg-orange-500 text-white",
          action: result.url ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open(result.url, '_blank')}
              className="bg-white text-orange-500 border-orange-300 hover:bg-orange-50"
            >
              View Post
            </Button>
          ) : undefined
        })
      } else {
        throw new Error(result.error || 'Failed to post to Reddit')
      }
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

  return (
    <>
      <PageHeader
        title="My Submitted Reviews"
        description={`You have submitted ${reviews.length} reviews. Manage and view your contributions.`}
        icon={FileText}
        actions={
          <Link href="/rate">
            <Button className="bg-brand-red text-brand-red-foreground hover:bg-brand-red-hover">
              <StarIconLucide className="mr-2 h-4 w-4" /> Add New Review
            </Button>
          </Link>
        }
      />

      {reviews.length === 0 ? (
        <Card className="border-border-subtle shadow-sm">
          <CardContent className="pt-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-text-secondary/50 mb-2" />
            <p className="text-lg font-medium text-text-primary">No Reviews Yet</p>
            <p className="text-text-secondary">You haven't submitted any customer reviews.</p>
            <Link href="/rate" className="mt-4 inline-block">
              <Button variant="default" className="bg-brand-red text-brand-red-foreground hover:bg-brand-red-hover">
                Rate Your First Customer
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <Card key={review.id} className="border-border-subtle shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row justify-between items-start gap-2 pb-3">
                <div>
                  <CardTitle className="text-xl text-text-primary">
                    Review for: {review.customer?.name || `Customer ${review.customer_id.slice(-4)}`}
                  </CardTitle>
                  <CardDescription className="text-sm text-text-secondary">
                    Rated on {new Date(review.created_at).toLocaleDateString()} by {review.reviewer_role}
                  </CardDescription>
                </div>
                <StarRatingDisplay rating={review.rating} size={20} showText />
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <p className="text-sm text-text-secondary italic leading-relaxed">"{review.comment}"</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm pt-2 border-t border-border-subtle mt-3">
                  <div>
                    <span className="font-medium">Behavior:</span>{" "}
                    <StarRatingDisplay rating={review.behavior_rating} size={14} className="inline-flex ml-1" />
                  </div>
                  <div>
                    <span className="font-medium">Payment:</span>{" "}
                    <StarRatingDisplay rating={review.payment_rating} size={14} className="inline-flex ml-1" />
                  </div>
                  <div>
                    <span className="font-medium">Maintenance:</span>{" "}
                    <StarRatingDisplay rating={review.maintenance_rating} size={14} className="inline-flex ml-1" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center pt-3 border-t border-border-subtle mt-3">
                  <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditReview(review)}
                      >
                        <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
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
                        <Button onClick={handleSaveEdit} className="bg-brand-red text-brand-red-foreground hover:bg-brand-red-hover">
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="border-red-300 text-red-600 hover:bg-red-50">
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                      </Button>
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
                  
                  {/* Reddit Share Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShareToReddit(review.id)}
                    disabled={loadingReddit === review.id}
                    className="hover:border-orange-400 hover:text-orange-600"
                  >
                    {loadingReddit === review.id ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Share2 className="mr-1.5 h-3.5 w-3.5" />
                        Post to Reddit
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}