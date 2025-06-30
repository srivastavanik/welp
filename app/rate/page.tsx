export const dynamic = 'force-dynamic'

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  StarIcon as StarIconLucide,
  Mic,
  Send,
  Phone,
  User,
  Smile,
  CreditCard,
  Trash2,
  Loader2,
  Info,
  UserCircle,
  Sparkles,
  Zap,
  Heart,
  ThumbsDown,
} from "lucide-react"
import { PageHeader } from "@/components/custom/page-header"
import { StarRatingInput } from "@/components/custom/star-rating"
import { useToast } from "@/hooks/use-toast"
import { useVoiceRecording } from "@/hooks/use-voice-recording"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface RatingInputSectionProps {
  title: string
  icon: React.ElementType
  value: number
  onChange: (value: number) => void
  color: string
  onHover: (section: string | null) => void
  isHovered: boolean
}

function RatingInputSection({ title, icon: Icon, value, onChange, color, onHover, isHovered }: RatingInputSectionProps) {
  const sectionId = title.toLowerCase().split(' ')[0]
  
  return (
    <div 
      className={cn(
        "p-5 border-2 rounded-xl transition-all duration-300 relative overflow-hidden",
        isHovered ? "border-red-300 shadow-lg scale-[1.02]" : "border-gray-200",
        value > 0 && "bg-gradient-to-r from-red-50/50 to-pink-50/50"
      )}
      onMouseEnter={() => onHover(sectionId)}
      onMouseLeave={() => onHover(null)}
    >
      <Label className="text-md font-semibold flex items-center mb-3 relative z-10">
        <div className={cn("p-2 rounded-lg mr-3 bg-gradient-to-br", color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {title}
      </Label>
      <div className="relative z-10">
        <StarRatingInput value={value} onChange={onChange} size={36} />
      </div>
    </div>
  )
}

export default function RateCustomerPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [overallRating, setOverallRating] = useState(0)
  const [behaviorRating, setBehaviorRating] = useState(0)
  const [paymentRating, setPaymentRating] = useState(0)
  const [maintenanceRating, setMaintenanceRating] = useState(0)
  const [comment, setComment] = useState("")
  const [reviewerRole, setReviewerRole] = useState("")
  const [voiceRecordingUrl, setVoiceRecordingUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hoveredRating, setHoveredRating] = useState<string | null>(null)

  // Voice recording hook
  const {
    isRecording,
    transcript,
    isSupported: isRecordingSupported,
    toggleRecording
  } = useVoiceRecording({
    onTranscript: (finalTranscript) => {
      if (finalTranscript.trim()) {
        // Replace or append the transcribed text
        setComment(prev => {
          const existingLines = prev.split('\n').filter(line => !line.startsWith('[Voice Review]:'));
          const newContent = `[Voice Review]: ${finalTranscript.trim()}`;
          return [...existingLines, newContent].join('\n').trim();
        });
        
        toast({
          title: "Voice Review Added",
          description: "Your voice review has been transcribed and added to comments.",
          className: "bg-green-500 text-white",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Recording Error",
        description: error,
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    const phoneFromQuery = searchParams?.phone
    if (phoneFromQuery && typeof phoneFromQuery === 'string') {
      // Clean the phone number to only digits
      const cleanPhone = phoneFromQuery.replace(/\D/g, "")
      setCustomerPhoneNumber(cleanPhone)
    }
  }, [searchParams])

  const handleVoiceRecord = async () => {
    toggleRecording()
    if (isRecording) {
      setVoiceRecordingUrl("mock_audio_url.mp3") // Mock URL
      toast({
        title: "Voice Note Added",
        description: "Voice recording stopped and will be transcribed.",
        className: "bg-blue-500 text-white",
      })
    } else {
      setVoiceRecordingUrl(null)
      toast({
        title: "Recording Started...",
        description: "Click mic again to stop recording.",
        className: "bg-blue-500 text-white",
      })
    }
  }

  const handleSubmitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    // Validate phone number (just needs to be 10 digits)
    const cleanPhone = customerPhoneNumber.replace(/\D/g, "")
    if (cleanPhone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a 10-digit phone number.",
        variant: "destructive",
      })
      return
    }

    if (
      overallRating === 0 ||
      behaviorRating === 0 ||
      paymentRating === 0 ||
      maintenanceRating === 0 ||
      !reviewerRole
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields and ratings.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Use provided customer name or generate one from phone number
      const displayName = customerName.trim() || generateDisplayId(cleanPhone)
      
      // Submit review to API
      const reviewData = {
        customer_phone: cleanPhone,
        customer_name: displayName,
        restaurant_name: "Current Restaurant", // You might want to make this configurable
        rating: overallRating,
        behavior_rating: behaviorRating,
        payment_rating: paymentRating,
        maintenance_rating: maintenanceRating,
        comment: comment,
        reviewer_role: reviewerRole
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData)
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      const { review } = await response.json()

      toast({
        title: "Review Submitted!",
        description: `Thank you for rating customer ${displayName}.`,
        className: "bg-green-500 text-white",
      })

      // Reset form
      setCustomerPhoneNumber("")
      setCustomerName("")
      setOverallRating(0)
      setBehaviorRating(0)
      setPaymentRating(0)
      setMaintenanceRating(0)
      setComment("")
      setReviewerRole("")
      setVoiceRecordingUrl(null)

      // Navigate to reviews page after a short delay
      setTimeout(() => {
        router.push('/reviews')
      }, 2000)

    } catch (error) {
      console.error('Error submitting review:', error)
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      })
    }
    
    setIsLoading(false)
  }

  // Generate display ID from phone number
  const generateDisplayId = (phoneNumber: string): string => {
    const names = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Chris', 'Amy', 'Tom', 'Kate']
    const lastInitials = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    
    const phoneSum = phoneNumber.split('').reduce((sum, digit) => sum + parseInt(digit) || 0, 0)
    const firstName = names[phoneSum % names.length]
    const lastInitial = lastInitials[phoneSum % lastInitials.length]
    
    return `${firstName} ${lastInitial}.`
  }

  // Get mood emoji based on average rating
  const getMoodEmoji = () => {
    const avgRating = (overallRating + behaviorRating + paymentRating + maintenanceRating) / 4
    if (avgRating >= 4) return { emoji: "😊", color: "text-green-500" }
    if (avgRating >= 3) return { emoji: "😐", color: "text-yellow-500" }
    if (avgRating >= 2) return { emoji: "😕", color: "text-orange-500" }
    return { emoji: "😤", color: "text-red-500" }
  }

  return (
    <div className="page-enter">
      <PageHeader
        title="Rate a Customer"
        description="Share your experience to help other businesses."
        icon={StarIconLucide}
      />

      <Alert className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 hover-lift relative overflow-hidden">
        <div className="relative z-10 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600" />
          <div>
            <AlertTitle className="text-blue-800 font-bold">Be Fair & Objective</AlertTitle>
            <AlertDescription className="text-blue-700">
              Your ratings contribute to a trusted community. Please provide honest and constructive feedback.
            </AlertDescription>
          </div>
        </div>
      </Alert>

      <Card className="border-0 shadow-xl hover-lift overflow-hidden relative">
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100 relative">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl text-gradient-brand flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-red-500" />
                New Customer Rating
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Provide ratings for Overall Experience, Behavior, Payment, and Maintenance.
              </CardDescription>
            </div>
            {(overallRating > 0 || behaviorRating > 0 || paymentRating > 0 || maintenanceRating > 0) && (
              <div className={cn("text-5xl", getMoodEmoji().color)}>
                {getMoodEmoji().emoji}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-8 relative">
          <form onSubmit={handleSubmitReview} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="customerPhoneNumber" className="flex items-center text-sm font-medium">
                  <Phone className="mr-2 h-4 w-4 text-red-500" /> Customer Phone Number *
                </Label>
                <div className="relative">
                  <Input
                    id="customerPhoneNumber"
                    type="tel"
                    placeholder="e.g., 5551234567 or (555) 123-4567"
                    value={customerPhoneNumber}
                    onChange={(e) => {
                      setCustomerPhoneNumber(e.target.value)
                    }}
                    required
                    className="h-11 text-base pr-10 focus:ring-2 focus:ring-red-500/20"
                  />
                  {customerPhoneNumber && (
                    <div className="absolute right-3 top-3">
                      {customerPhoneNumber.replace(/\D/g, "").length === 10 ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <span className="text-red-500">✗</span>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Enter any 10-digit phone number format
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customerName" className="flex items-center text-sm font-medium">
                  <UserCircle className="mr-2 h-4 w-4 text-red-500" /> Customer Name (Optional)
                </Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="e.g., John Smith or leave blank for auto-generated"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-11 text-base focus:ring-2 focus:ring-red-500/20"
                />
                <p className="text-xs text-gray-500">
                  {customerName.trim() 
                    ? `Will display as: ${customerName.trim()}` 
                    : customerPhoneNumber.replace(/\D/g, "").length === 10 
                      ? `Will auto-generate: ${generateDisplayId(customerPhoneNumber.replace(/\D/g, ""))}`
                      : "Enter phone number to see auto-generated name"
                  }
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reviewerRole" className="flex items-center text-sm font-medium">
                <User className="mr-2 h-4 w-4 text-red-500" /> Your Role *
              </Label>
              <Select value={reviewerRole} onValueChange={setReviewerRole} required name="reviewerRole">
                <SelectTrigger id="reviewerRole" className="h-11 text-base hover:border-red-300 focus:ring-2 focus:ring-red-500/20">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="server">Server</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-6">
              <RatingInputSection
                title="Overall Rating"
                icon={StarIconLucide}
                value={overallRating}
                onChange={setOverallRating}
                color="from-red-500 to-pink-500"
                onHover={setHoveredRating}
                isHovered={hoveredRating === "overall"}
              />
              <RatingInputSection
                title="Behavior (politeness, reasonableness)"
                icon={Smile}
                value={behaviorRating}
                onChange={setBehaviorRating}
                color="from-purple-500 to-pink-500"
                onHover={setHoveredRating}
                isHovered={hoveredRating === "behavior"}
              />
              <RatingInputSection
                title="Payment (tips, disputes, reliability)"
                icon={CreditCard}
                value={paymentRating}
                onChange={setPaymentRating}
                color="from-orange-500 to-red-500"
                onHover={setHoveredRating}
                isHovered={hoveredRating === "payment"}
              />
              <RatingInputSection
                title="Maintenance (cleanliness, extra work)"
                icon={Trash2}
                value={maintenanceRating}
                onChange={setMaintenanceRating}
                color="from-yellow-500 to-orange-500"
                onHover={setHoveredRating}
                isHovered={hoveredRating === "maintenance"}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="comment" className="text-sm font-medium flex items-center gap-2">
                Comment (Optional)
                <span className="text-gray-400">✏️</span>
              </Label>
              <Textarea
                id="comment"
                placeholder="Share details about your experience... (e.g., specific incidents, positive interactions)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="text-base resize-none focus:ring-2 focus:ring-red-500/20 hover:border-red-300 transition-colors"
              />
              {comment && (
                <p className="text-xs text-gray-500">
                  {comment.length} characters
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Voice Review (Optional)</Label>
              {(transcript || isRecording) && (
                <div
                  className={cn(
                    "mb-3 p-4 border-2 rounded-xl transition-all duration-200 overflow-hidden",
                    isRecording 
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300" 
                      : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
                  )}
                >
                  <p className="text-sm font-medium">
                    <strong className={isRecording ? "text-blue-800" : "text-green-800"}>
                      {isRecording ? "Listening:" : "Last recording:"}
                    </strong>{" "}
                    <span className={cn("inline-block", isRecording ? "text-blue-700" : "text-green-700")}>
                      {transcript || "Waiting for speech..."}
                    </span>
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={handleVoiceRecord}
                  className={cn(
                    "gap-2 h-11 relative overflow-hidden",
                    isRecording && "bg-gradient-to-r from-red-500 to-pink-500"
                  )}
                >
                  <Mic className="h-5 w-5 relative z-10" /> 
                  <span className="relative z-10">
                    {isRecording ? "Stop Recording" : "Record Voice Note"}
                  </span>
                </Button>
                {isRecording && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    Recording...
                  </div>
                )}
                {voiceRecordingUrl && !isRecording && (
                  <div className="text-sm text-green-600 flex items-center gap-1">
                    <Mic className="h-4 w-4" /> Voice note added.
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Quickly leave a voice review. We'll transcribe it automatically.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full sm:w-auto bg-gradient-brand text-white hover:shadow-xl transition-all duration-200 h-12 text-base font-semibold relative overflow-hidden group"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin relative z-10" />
                  <span className="relative z-10">Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4 relative z-10" />
                  <span className="relative z-10">Submit Review</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}