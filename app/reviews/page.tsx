"use client"

import { useState } from "react"
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

interface ReviewMock {
  id: string
  customerDisplayId: string
  overallRating: number
  behaviorRating: number
  paymentRating: number
  maintenanceRating: number
  comment: string
  voiceRecordingUrl?: string
  date: string
  reviewer: string // Your display name
  reviewerRole: string
  redditShared?: boolean
  redditUrl?: string
  tags?: string[]
}

const mockReviewsData: ReviewMock[] = [
  {
    id: "rev_1",
    customerDisplayId: "Karen P.",
    overallRating: 1.2,
    behaviorRating: 1.0,
    paymentRating: 2.0,
    maintenanceRating: 1.5,
    comment:
      "Extremely difficult, demanded a refund for no reason. Caused a scene and was rude to staff. Left a huge mess.",
    date: "2024-07-15",
    reviewer: "Sarah M.",
    reviewerRole: "Manager",
    redditShared: true,
    redditUrl: "https://reddit.com/r/CustomerFromHell/comments/abc123/nightmare_customer_experience",
    tags: ["Rude", "Dispute", "High Maintenance", "Messy"],
  },
  {
    id: "rev_2",
    customerDisplayId: "John D.",
    overallRating: 4.5,
    behaviorRating: 5.0,
    paymentRating: 4.5,
    maintenanceRating: 4.0,
    comment: "Pleasant customer, paid promptly. No issues at all, would serve again anytime. Very polite.",
    voiceRecordingUrl: "mock_audio.mp3",
    date: "2024-07-18",
    reviewer: "Sarah M.",
    reviewerRole: "Manager",
    tags: ["Prompt Payment", "Polite", "Easy Going"],
  },
  {
    id: "rev_3",
    customerDisplayId: "David S.",
    overallRating: 5.0,
    behaviorRating: 5.0,
    paymentRating: 5.0,
    maintenanceRating: 5.0,
    comment: "Best customer ever! Tipped generously and was very understanding about a small delay. A true gem.",
    date: "2024-07-10",
    reviewer: "Mike B.",
    reviewerRole: "Server",
    redditShared: true,
    redditUrl: "https://reddit.com/r/CustomerFromHeaven/comments/def456/amazing_customer_experience",
    tags: ["Generous Tipper", "Understanding", "Exceptional"],
  },
]

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<ReviewMock[]>(mockReviewsData)
  const [loadingReddit, setLoadingReddit] = useState<string | null>(null)
  const [editingReview, setEditingReview] = useState<ReviewMock | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleDeleteReview = (reviewId: string) => {
    // Mock deletion
    setReviews(reviews.filter((r) => r.id !== reviewId))
    toast({
      title: "Review Deleted",
      description: "The review has been successfully deleted.",
      className: "bg-red-500 text-white",
    })
  }

  const handleEditReview = (review: ReviewMock) => {
    setEditingReview({ ...review })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingReview) return

    setReviews(reviews.map(r => r.id === editingReview.id ? editingReview : r))
    setEditDialogOpen(false)
    setEditingReview(null)
    
    toast({
      title: "Review Updated",
      description: "Your review has been successfully updated.",
      className: "bg-green-500 text-white",
    })
  }

  const handleShareToReddit = async (reviewId: string) => {
    const review = reviews.find(r => r.id === reviewId)
    if (!review) return

    setLoadingReddit(reviewId)

    try {
      // Generate Reddit post content
      const postContent = redditService.generatePostContent({
        customerDisplayId: review.customerDisplayId,
        overallRating: review.overallRating,
        comment: review.comment,
        tags: review.tags,
        reviewerRole: review.reviewerRole
      })

      // Use mock posting for now (until Reddit API is configured)
      const result = await redditService.mockPostToReddit(postContent)

      if (result.success) {
        // Update review with Reddit info
        setReviews(reviews.map((r) => 
          r.id === reviewId 
            ? { ...r, redditShared: true, redditUrl: result.url } 
            : r
        ))

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

  // Function to add new review (called from rate page)
  const addNewReview = (newReview: Omit<ReviewMock, 'id'>) => {
    const reviewWithId = {
      ...newReview,
      id: `rev_${Date.now()}`
    }
    setReviews(prev => [reviewWithId, ...prev])
  }

  // Make this function available globally for the rate page
  if (typeof window !== 'undefined') {
    (window as any).addNewReview = addNewReview
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
                  <CardTitle className="text-xl text-text-primary">Review for: {review.customerDisplayId}</CardTitle>
                  <CardDescription className="text-sm text-text-secondary">
                    Rated on {new Date(review.date).toLocaleDateString()} by {review.reviewer} ({review.reviewerRole})
                  </CardDescription>
                </div>
                <StarRatingDisplay rating={review.overallRating} size={20} showText />
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <p className="text-sm text-text-secondary italic leading-relaxed">"{review.comment}"</p>

                {review.tags && review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {review.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {review.voiceRecordingUrl && (
                  <div className="text-sm text-blue-600 flex items-center gap-1">
                    <Mic className="h-4 w-4" /> Voice note attached (mock playback)
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm pt-2 border-t border-border-subtle mt-3">
                  <div>
                    <span className="font-medium">Behavior:</span>{" "}
                    <StarRatingDisplay rating={review.behaviorRating} size={14} className="inline-flex ml-1" />
                  </div>
                  <div>
                    <span className="font-medium">Payment:</span>{" "}
                    <StarRatingDisplay rating={review.paymentRating} size={14} className="inline-flex ml-1" />
                  </div>
                  <div>
                    <span className="font-medium">Maintenance:</span>{" "}
                    <StarRatingDisplay rating={review.maintenanceRating} size={14} className="inline-flex ml-1" />
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
                        <DialogTitle>Edit Review for {editingReview?.customerDisplayId}</DialogTitle>
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
                                value={editingReview.overallRating} 
                                onChange={(rating) => setEditingReview({...editingReview, overallRating: rating})}
                                size={28}
                              />
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Behavior Rating</Label>
                              <StarRatingInput 
                                value={editingReview.behaviorRating} 
                                onChange={(rating) => setEditingReview({...editingReview, behaviorRating: rating})}
                                size={24}
                              />
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Payment Rating</Label>
                              <StarRatingInput 
                                value={editingReview.paymentRating} 
                                onChange={(rating) => setEditingReview({...editingReview, paymentRating: rating})}
                                size={24}
                              />
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Maintenance Rating</Label>
                              <StarRatingInput 
                                value={editingReview.maintenanceRating} 
                                onChange={(rating) => setEditingReview({...editingReview, maintenanceRating: rating})}
                                size={24}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="edit-role" className="text-sm font-medium">Your Role</Label>
                              <Select 
                                value={editingReview.reviewerRole} 
                                onValueChange={(value) => setEditingReview({...editingReview, reviewerRole: value})}
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
                    disabled={review.redditShared || loadingReddit === review.id}
                    className={cn(
                      "transition-all duration-200",
                      review.redditShared 
                        ? "text-orange-600 border-orange-500 hover:bg-orange-50 bg-orange-50" 
                        : "hover:border-orange-400 hover:text-orange-600"
                    )}
                  >
                    {loadingReddit === review.id ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Share2 className="mr-1.5 h-3.5 w-3.5" />
                        {review.redditShared ? "Posted to Reddit" : "Post to Reddit"}
                      </>
                    )}
                  </Button>

                  {/* View Reddit Post Button */}
                  {review.redditShared && review.redditUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(review.redditUrl, '_blank')}
                      className="text-orange-600 border-orange-300 hover:bg-orange-50"
                    >
                      <Share2 className="mr-1.5 h-3.5 w-3.5" />
                      View on Reddit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}