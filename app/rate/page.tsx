"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
} from "lucide-react"
import { PageHeader } from "@/components/custom/page-header"
import { StarRatingInput } from "@/components/custom/star-rating"
import { useToast } from "@/hooks/use-toast"
import { useVoiceRecording } from "@/hooks/use-voice-recording"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

export default function RateCustomerPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState("")
  const [overallRating, setOverallRating] = useState(0)
  const [behaviorRating, setBehaviorRating] = useState(0)
  const [paymentRating, setPaymentRating] = useState(0)
  const [maintenanceRating, setMaintenanceRating] = useState(0)
  const [comment, setComment] = useState("")
  const [reviewerRole, setReviewerRole] = useState("")
  const [voiceRecordingUrl, setVoiceRecordingUrl] = useState<string | null>(null)
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
    const phoneFromQuery = searchParams.get("phone")
    if (phoneFromQuery) {
      setCustomerPhoneNumber(phoneFromQuery.replace(/\D/g, "").slice(0, 10))
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
    setVoiceRecordingUrl(null)
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
          Your ratings contribute to a trusted community. Please provide honest and constructive feedback.
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
                rows={4}
                className="text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Voice Review (Optional)</Label>
              <div className={cn(
                "mb-3 p-3 border rounded-lg transition-all duration-200",
                isRecording 
                  ? "bg-blue-50 border-blue-200" 
                  : "bg-gray-50 border-gray-200",
                !transcript && "opacity-0"
              )}>
                <p className="text-sm text-blue-800">
                  <strong>{isRecording ? "Listening:" : "Last recording:"}</strong>{" "}
                  <span className={cn(
                    "inline-block",
                    isRecording && "animate-pulse"
                  )}>
                    {transcript || "Waiting for speech..."}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={handleVoiceRecord}
                  className="gap-2 h-11"
                >
                  <Mic className="h-5 w-5" /> {isRecording ? "Stop Recording" : "Record Voice Note"}
                </Button>
                {isRecording && (
                  <div className="flex items-center gap-2 text-sm text-brand-red animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" /> Recording...
                  </div>
                )}
                {voiceRecordingUrl && !isRecording && (
                  <div className="text-sm text-green-600 flex items-center gap-1">
                    <Mic className="h-4 w-4" /> Voice note added.
                  </div>
                )}
              </div>
              <p className="text-xs text-text-secondary/80">
                Quickly leave a voice review. We'll transcribe it (mock).
              </p>
            </div>

            <Button
              type="submit"
              className="w-full sm:w-auto bg-brand-red text-brand-red-foreground hover:bg-brand-red-hover active:bg-brand-red-active h-11 text-base"
              disabled={isLoading}
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
