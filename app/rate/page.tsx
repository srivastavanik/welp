"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
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
  StopCircle,
  Volume2,
  VolumeX,
} from "lucide-react"
import { PageHeader } from "@/components/custom/page-header"
import { StarRatingInput } from "@/components/custom/star-rating"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useVoiceRecording } from "@/hooks/use-voice-recording"
import { cn } from "@/lib/utils"

function RateCustomerContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState("")
  const [overallRating, setOverallRating] = useState(0)
  const [behaviorRating, setBehaviorRating] = useState(0)
  const [paymentRating, setPaymentRating] = useState(0)
  const [maintenanceRating, setMaintenanceRating] = useState(0)
  const [comment, setComment] = useState("")
  const [reviewerRole, setReviewerRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Voice recording hook
  const {
    isRecording,
    transcript,
    isSupported: isRecordingSupported,
    toggleRecording
  } = useVoiceRecording({
    onTranscript: (finalTranscript) => {
      if (finalTranscript.trim()) {
        // Append to existing comment or replace if empty
        setComment(prev => {
          const newContent = `[Voice Review]: ${finalTranscript}`;
          return prev ? `${prev}\n\n${newContent}` : newContent;
        });
        
        toast({
          title: "Voice Note Added",
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
    const phoneFromQuery = searchParams.get("phone")
    if (phoneFromQuery) {
      setCustomerPhoneNumber(phoneFromQuery.replace(/\D/g, "").slice(0, 10))
    }
  }, [searchParams])

  const handleSubmitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      overallRating === 0 ||
      behaviorRating === 0 ||
      paymentRating === 0 ||
      maintenanceRating === 0 ||
      !reviewerRole ||
      !customerPhoneNumber ||
      customerPhoneNumber.length < 10
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields, ratings, and ensure a valid 10-digit phone number.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    toast({
      title: "Review Submitted!",
      description: `Thank you for rating customer ${customerPhoneNumber}.`,
      className: "bg-green-500 text-white",
    })
    // Reset form
    setCustomerPhoneNumber(searchParams.get("phone") || "") // Keep phone if from query
    setOverallRating(0)
    setBehaviorRating(0)
    setPaymentRating(0)
    setMaintenanceRating(0)
    setComment("")
    setReviewerRole("")
  }

  return (
    <>
      <PageHeader
        title="Rate a Customer"
        description="Share your experience to help other businesses."
        icon={StarIconLucide}
      />
      <Alert className="mb-6 border-blue-300 bg-blue-50 text-blue-700">
        <Info className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-800">Be Fair & Objective</AlertTitle>
        <AlertDescription>
          Your ratings contribute to a trusted community. Use voice reviews for detailed feedback.
          {!isRecordingSupported && (
            <span className="block mt-1 text-sm text-orange-600">
              Voice recording not supported in this browser. Please use Chrome, Edge, or Safari.
            </span>
          )}
        </AlertDescription>
      </Alert>
      <Card className="border-border-subtle shadow-sm">
        <CardHeader>
          <CardTitle className="text-text-primary">New Customer Rating</CardTitle>
          <CardDescription className="text-text-secondary">
            Provide ratings for Overall Experience, Behavior, Payment, and Maintenance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitReview} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="customerPhoneNumber" className="flex items-center text-sm font-medium">
                  <Phone className="mr-2 h-4 w-4 text-brand-red" /> Customer Phone Number
                </Label>
                <Input
                  id="customerPhoneNumber"
                  type="tel"
                  placeholder="e.g., (555) 123-4567"
                  value={customerPhoneNumber}
                  onChange={(e) => setCustomerPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  required
                  pattern="\d{10}"
                  title="Enter a 10-digit phone number"
                  className="h-11 text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reviewerRole" className="flex items-center text-sm font-medium">
                  <User className="mr-2 h-4 w-4 text-brand-red" /> Your Role
                </Label>
                <Select value={reviewerRole} onValueChange={setReviewerRole} required name="reviewerRole">
                  <SelectTrigger id="reviewerRole" className="h-11 text-base">
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
            </div>

            <div className="space-y-6">
              <RatingInputSection
                title="Overall Rating"
                icon={StarIconLucide}
                value={overallRating}
                onChange={setOverallRating}
              />
              <RatingInputSection
                title="Behavior (politeness, reasonableness)"
                icon={Smile}
                value={behaviorRating}
                onChange={setBehaviorRating}
              />
              <RatingInputSection
                title="Payment (tips, disputes, reliability)"
                icon={CreditCard}
                value={paymentRating}
                onChange={setPaymentRating}
              />
              <RatingInputSection
                title="Maintenance (cleanliness, extra work)"
                icon={Trash2}
                value={maintenanceRating}
                onChange={setMaintenanceRating}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="comment" className="text-sm font-medium">
                Comment (Optional)
              </Label>
              <Textarea
                id="comment"
                placeholder="Share details about your experience... (e.g., specific incidents, positive interactions)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={6}
                className="text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Voice Review (Optional)</Label>
              {transcript && isRecording && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Listening:</strong> {transcript}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={toggleRecording}
                  className={cn(
                    "gap-2 h-11",
                    isRecording && "animate-pulse ring-4 ring-red-500/50"
                  )}
                  disabled={!isRecordingSupported}
                >
                  {isRecording ? (
                    <>
                      <StopCircle className="h-5 w-5" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5" />
                      Record Voice Review
                    </>
                  )}
                </Button>
                {isRecording && (
                  <div className="flex items-center gap-2 text-sm text-brand-red animate-pulse">
                    <Volume2 className="h-4 w-4 animate-pulse" />
                    Recording... Speak clearly about your experience.
                  </div>
                )}
              </div>
              <p className="text-xs text-text-secondary/80">
                Record a detailed voice review. It will be transcribed and added to your comments automatically.
                {!isRecordingSupported && (
                  <span className="block text-orange-600 mt-1">
                    Voice recording requires a modern browser with microphone access.
                  </span>
                )}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full sm:w-auto bg-brand-red text-brand-red-foreground hover:bg-brand-red-hover active:bg-brand-red-active h-11 text-base"
              disabled={isLoading || isRecording}
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {isLoading ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

interface RatingInputSectionProps {
  title: string
  icon: React.ElementType
  value: number
  onChange: (value: number) => void
}
function RatingInputSection({ title, icon: Icon, value, onChange }: RatingInputSectionProps) {
  return (
    <div className="p-4 border border-border-subtle rounded-lg bg-card">
      <Label className="text-md font-semibold text-text-primary flex items-center mb-2">
        <Icon className="mr-2 h-5 w-5 text-brand-red" /> {title}
      </Label>
      <StarRatingInput value={value} onChange={onChange} size={32} />
    </div>
  )
}

function RateCustomerLoading() {
  return (
    <>
      <PageHeader
        title="Rate a Customer"
        description="Share your experience to help other businesses."
        icon={StarIconLucide}
      />
      <div className="space-y-6">
        <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    </>
  )
}

export default function RateCustomerPage() {
  return (
    <Suspense fallback={<RateCustomerLoading />}>
      <RateCustomerContent />
    </Suspense>
  )
}