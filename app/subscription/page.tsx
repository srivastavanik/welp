"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, DollarSign, Zap, Loader2 } from "lucide-react"
import { PageHeader } from "@/components/custom/page-header"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const freeFeatures = [
  { text: "3 Customer Lookups per month", included: true },
  { text: "Basic Rating Ability", included: true },
  { text: "See Limited Review Details", included: true },
  { text: "Voice Transcription", included: false },
  { text: "Reddit Integration", included: false },
  { text: "Advanced Analytics", included: false },
  { text: "Unlimited Lookups", included: false },
  { text: "Priority Support", included: false },
]

const premiumFeatures = [
  { text: "Unlimited Customer Lookups", included: true },
  { text: "Full Rating & Review Details", included: true },
  { text: "Voice Transcription & Sentiment Analysis", included: true },
  { text: "Automatic Reddit Sharing (Notable Reviews)", included: true },
  { text: "Advanced Customer Analytics & Trends", included: true },
  { text: "Priority Support", included: true },
  { text: "Early Access to New Features", included: true },
]

export default function SubscriptionPage() {
  const { toast } = useToast()
  const [currentPlan, setCurrentPlan] = useState<"free" | "premium">("free") // Mock current subscription state
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Mock RevenueCat interaction
    setIsLoading(false)
    setCurrentPlan("premium")
    toast({
      title: "Successfully Subscribed!",
      description: "You are now on the Premium plan. Enjoy unlimited access!",
      className: "bg-green-500 text-white",
    })
  }

  const handleDowngrade = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Mock
    setIsLoading(false)
    setCurrentPlan("free")
    toast({
      title: "Subscription Changed",
      description:
        "You have been downgraded to the Free plan. Your Premium access will continue until the end of the current billing period.",
      className: "bg-blue-500 text-white",
    })
  }

  const handleManageSubscription = () => {
    toast({
      title: "Manage Subscription",
      description: "This would redirect to your Stripe/RevenueCat billing portal.",
    })
  }

  return (
    <>
      <PageHeader
        title="Subscription Management"
        description="Choose the plan that's right for your business needs."
        icon={DollarSign}
      />
      {currentPlan === "premium" && (
        <Alert className="mb-6 border-green-300 bg-green-50 text-green-700">
          <Zap className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800">You are on the Premium Plan!</AlertTitle>
          <AlertDescription>
            Enjoy unlimited lookups, full review details, and all advanced features. Your current billing period ends on{" "}
            {new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toLocaleDateString()}. {/* Mock end date */}
          </AlertDescription>
        </Alert>
      )}
      <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        <SubscriptionCard
          title="Free Tier"
          price="0"
          description="Get started with core features to evaluate problematic customers."
          features={freeFeatures}
          isCurrent={currentPlan === "free"}
          actionButton={
            currentPlan === "free" ? (
              <Button variant="outline" disabled className="w-full h-11 text-base">
                Currently Active
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full h-11 text-base"
                onClick={handleDowngrade}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                Downgrade to Free
              </Button>
            )
          }
        />
        <SubscriptionCard
          title="Premium Tier"
          price="19"
          priceFrequency="/month"
          description="Unlock all features for maximum insight and community protection."
          features={premiumFeatures}
          isCurrent={currentPlan === "premium"}
          isPopular
          actionButton={
            currentPlan === "premium" ? (
              <Button
                className="w-full bg-brand-red text-brand-red-foreground hover:bg-brand-red-hover h-11 text-base"
                onClick={handleManageSubscription}
              >
                Manage Subscription
              </Button>
            ) : (
              <Button
                className="w-full bg-brand-red text-brand-red-foreground hover:bg-brand-red-hover active:bg-brand-red-active h-11 text-base"
                onClick={handleUpgrade}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                {isLoading ? "Processing..." : "Upgrade to Premium"}
              </Button>
            )
          }
        />
      </div>
      <Card className="mt-8 border-border-subtle shadow-sm">
        <CardHeader>
          <CardTitle className="text-text-primary">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-text-secondary">
          <p>
            <strong>How are phone numbers handled for privacy?</strong> All phone numbers are cryptographically hashed.
            We never store raw phone numbers, ensuring customer anonymity.
          </p>
          <p>
            <strong>Can I cancel my Premium subscription anytime?</strong> Yes, you can manage your subscription and
            cancel anytime. Access to Premium features continues until the end ofyour current billing period.
          </p>
          <p>
            <strong>What happens if I reach my lookup limit on the Free plan?</strong> You'll be prompted to upgrade to
            Premium for unlimited lookups. Lookup limits reset at the start of each calendar month.
          </p>
          <p>
            <strong>Is there a discount for annual billing?</strong> (Mock) We are considering annual plans. Stay tuned
            for updates!
          </p>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-text-secondary/70">All prices are in USD. Taxes may apply.</p>
        </CardFooter>
      </Card>
    </>
  )
}

interface SubscriptionCardProps {
  title: string
  price: string
  priceFrequency?: string
  description: string
  features: Array<{ text: string; included: boolean }>
  actionButton: React.ReactNode
  isCurrent?: boolean
  isPopular?: boolean
}

function SubscriptionCard({
  title,
  price,
  priceFrequency,
  description,
  features,
  actionButton,
  isCurrent,
  isPopular,
}: SubscriptionCardProps) {
  return (
    <Card
      className={cn(
        "shadow-lg flex flex-col",
        isPopular ? "border-2 border-brand-red relative" : "border-border-subtle",
      )}
    >
      {isPopular && !isCurrent && (
        <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-brand-red text-white px-3 py-0.5 text-xs">
          Most Popular
        </Badge>
      )}
      {isCurrent && (
        <Badge
          variant="default"
          className={cn(
            "absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs",
            isPopular ? "bg-brand-red text-white" : "bg-green-600 text-white",
          )}
        >
          Current Plan
        </Badge>
      )}
      <CardHeader className="text-center pt-8 pb-4">
        <CardTitle className="text-2xl font-bold text-text-primary">{title}</CardTitle>
        <p className="text-4xl font-extrabold text-brand-red mt-1">
          ${price}
          {priceFrequency && <span className="text-base font-normal text-text-secondary">{priceFrequency}</span>}
        </p>
        <CardDescription className="text-sm text-text-secondary h-10">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <ul className="space-y-2.5">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2.5 text-sm">
              {feature.included ? (
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-text-secondary/50 shrink-0 mt-0.5" />
              )}
              <span className={cn("flex-1", !feature.included && "text-text-secondary/70 line-through")}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4 pb-6 px-6">{actionButton}</CardFooter>
    </Card>
  )
}