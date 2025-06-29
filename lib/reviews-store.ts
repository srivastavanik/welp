interface Review {
  id: string
  customerDisplayId: string
  overallRating: number
  behaviorRating: number
  paymentRating: number
  maintenanceRating: number
  comment: string
  voiceRecordingUrl?: string
  date: string
  reviewer: string
  reviewerRole: string
  redditShared?: boolean
  redditUrl?: string
  tags?: string[]
}

class ReviewsStore {
  private storageKey = 'welp-reviews'

  // Get all reviews from localStorage
  getReviews(): Review[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : this.getDefaultReviews()
    } catch (error) {
      console.error('Error loading reviews:', error)
      return this.getDefaultReviews()
    }
  }

  // Save reviews to localStorage
  saveReviews(reviews: Review[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(reviews))
    } catch (error) {
      console.error('Error saving reviews:', error)
    }
  }

  // Add a new review
  addReview(review: Omit<Review, 'id'>): Review {
    const newReview: Review = {
      ...review,
      id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    const reviews = this.getReviews()
    const updatedReviews = [newReview, ...reviews]
    this.saveReviews(updatedReviews)
    
    return newReview
  }

  // Update an existing review
  updateReview(reviewId: string, updates: Partial<Review>): void {
    const reviews = this.getReviews()
    const updatedReviews = reviews.map(review => 
      review.id === reviewId ? { ...review, ...updates } : review
    )
    this.saveReviews(updatedReviews)
  }

  // Delete a review
  deleteReview(reviewId: string): void {
    const reviews = this.getReviews()
    const updatedReviews = reviews.filter(review => review.id !== reviewId)
    this.saveReviews(updatedReviews)
  }

  // Get default/mock reviews for first-time users
  private getDefaultReviews(): Review[] {
    return [
      {
        id: "rev_default_1",
        customerDisplayId: "Karen P.",
        overallRating: 1.2,
        behaviorRating: 1.0,
        paymentRating: 2.0,
        maintenanceRating: 1.5,
        comment: "Extremely difficult, demanded a refund for no reason. Caused a scene and was rude to staff. Left a huge mess.",
        date: "2024-07-15",
        reviewer: "Sarah M.",
        reviewerRole: "Manager",
        redditShared: true,
        redditUrl: "https://reddit.com/r/CustomerFromHell/comments/abc123/nightmare_customer_experience",
        tags: ["Rude", "Dispute", "High Maintenance", "Messy"],
      },
      {
        id: "rev_default_2",
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
        id: "rev_default_3",
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
  }
}

export const reviewsStore = new ReviewsStore()
export type { Review }