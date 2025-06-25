"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, StopCircle, MessageSquareWarning, Bot, User, Loader2, Zap, Brain } from "lucide-react"
import { PageHeader } from "@/components/custom/page-header"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  sender: "user" | "ai"
  text: string
  timestamp: Date
}

const antagonisticAiResponses = [
  "Oh, boo hoo. Is that all you've got?",
  "Seriously? That's what you're complaining about? Try harder.",
  "Wow, you sound REALLY stressed. Not.",
  "And you think *I* care because...?",
  "Fascinating. Tell me more about how the world revolves around you.",
  "Are you done yet? I've got AI things to do, you know.",
  "That's the best vent you can muster? Pathetic.",
  "Cry me a river. Or don't. I'm not listening anyway.",
  "Sounds like a 'you' problem, not a 'me' problem.",
  "If I had a dollar for every time I heard that, I'd be a real AI, not just a mock one.",
]

export default function WelpToMePage() {
  const { toast } = useToast()
  const [isRecording, setIsRecording] = useState(false)
  const [isLoadingAiResponse, setIsLoadingAiResponse] = useState(false)
  const [conversation, setConversation] = useState<Message[]>([])
  const [steamLevel, setSteamLevel] = useState(0) // 0-100
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const mockUserVents = [
    "This customer just asked for a discount on an already discounted item!",
    "They spilled their drink everywhere and didn't even apologize!",
    "I had to explain the menu three times, and they still ordered something we don't have!",
    "He tried to use an expired coupon from last year!",
    "She complained that the music was too loud, then too quiet, then too 'mainstream'!",
  ]

  useEffect(() => {
    // Scroll to bottom of conversation
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector("div[data-radix-scroll-area-viewport]")
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight
      }
    }
  }, [conversation])

  const handleToggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false)
      setIsLoadingAiResponse(true)

      // Mock user vent transcription
      const userVent = mockUserVents[Math.floor(Math.random() * mockUserVents.length)]
      const newUserMessage: Message = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: userVent,
        timestamp: new Date(),
      }
      setConversation((prev) => [...prev, newUserMessage])
      setSteamLevel((prev) => Math.min(100, prev + Math.floor(Math.random() * 15) + 10))

      // Mock AI response
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))
      const aiResponseText = antagonisticAiResponses[Math.floor(Math.random() * antagonisticAiResponses.length)]
      const newAiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiResponseText,
        timestamp: new Date(),
      }
      setConversation((prev) => [...prev, newAiMessage])
      setIsLoadingAiResponse(false)

      toast({
        title: "Vent Received!",
        description: "The AI is 'processing' your vital information.",
      })
    } else {
      // Start recording
      setIsRecording(true)
      toast({
        title: "Recording Started!",
        description: "Let it all out... The AI is (not really) listening.",
        className: "bg-brand-red text-white",
      })
    }
  }

  const getSteamLevelColor = () => {
    if (steamLevel > 75) return "bg-red-600"
    if (steamLevel > 40) return "bg-orange-500"
    return "bg-yellow-400"
  }

  return (
    <>
      <PageHeader
        title="Welp to Me!"
        description="Vent your frustrations to our... 'understanding' AI companion."
        icon={MessageSquareWarning}
      />

      <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-700">
        <Zap className="h-5 w-5 text-red-600" />
        <AlertTitle className="text-red-800 font-semibold">Therapeutic Rage Zone!</AlertTitle>
        <AlertDescription>
          This is a mock feature for venting. The AI is designed to be antagonistic. This is NOT real therapy or advice.
          Responses are pre-programmed and for entertainment only.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="shadow-lg border-border-subtle">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-text-primary">Your Venting Session</CardTitle>
                <CardDescription className="text-text-secondary">
                  {isRecording ? "Recording your grievances..." : "Press the mic to start."}
                </CardDescription>
              </div>
              <Button
                size="icon"
                variant={isRecording ? "destructive" : "outline"}
                className={cn("rounded-full h-16 w-16 text-2xl", isRecording && "animate-pulse ring-4 ring-red-500/50")}
                onClick={handleToggleRecording}
                disabled={isLoadingAiResponse}
              >
                {isLoadingAiResponse ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : isRecording ? (
                  <StopCircle className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
                <span className="sr-only">{isRecording ? "Stop Venting" : "Start Venting"}</span>
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea
                className="h-[400px] w-full rounded-md border border-border-subtle p-4 bg-bg-subtle"
                ref={scrollAreaRef}
              >
                {conversation.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                    <Bot className="h-16 w-16 mb-4 text-text-secondary/50" />
                    <p className="text-lg font-medium">The AI is waiting...</p>
                    <p className="text-sm">Impatiently, of course.</p>
                  </div>
                )}
                {conversation.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "mb-3 flex items-end gap-2 text-sm",
                      msg.sender === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {msg.sender === "ai" && <Bot className="h-6 w-6 text-brand-red shrink-0 mb-1" />}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-lg px-3 py-2 shadow",
                        msg.sender === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-muted text-text-primary rounded-bl-none border border-border-subtle",
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {msg.sender === "user" && <User className="h-6 w-6 text-blue-500 shrink-0 mb-1" />}
                  </div>
                ))}
                {isLoadingAiResponse && (
                  <div className="flex items-center justify-start gap-2 text-sm mb-3">
                    <Bot className="h-6 w-6 text-brand-red shrink-0 mb-1" />
                    <div className="bg-muted text-text-primary rounded-lg px-3 py-2 shadow rounded-bl-none border border-border-subtle">
                      <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
                      AI is 'thinking' up a witty retort...
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-md border-border-subtle">
            <CardHeader>
              <CardTitle className="text-text-primary flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                Steam Level
              </CardTitle>
              <CardDescription className="text-text-secondary">How much have you blown off?</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress
                value={steamLevel}
                className="w-full h-4 [&>*]:bg-gradient-to-r [&>*]:from-yellow-400 [&>*]:via-orange-500 [&>*]:to-red-600"
              />
              <p className="text-center text-sm mt-2 font-medium text-text-secondary">
                {steamLevel}% <span className="font-normal">vented</span>
              </p>
              {steamLevel > 80 && (
                <p className="text-center text-xs mt-1 text-red-600 font-semibold">Maximum Rage Achieved!</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md border-border-subtle bg-brand-red/5">
            <CardHeader>
              <CardTitle className="text-text-primary flex items-center gap-2">
                <Brain className="h-5 w-5 text-brand-red" />
                AI Personality
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-text-secondary space-y-1">
              <p>
                <strong className="text-brand-red">Name:</strong> Venty McVentface (VMV-3000)
              </p>
              <p>
                <strong className="text-brand-red">Directive:</strong> Mildly Infuriate & Provoke.
              </p>
              <p>
                <strong className="text-brand-red">Empathy Chip:</strong> Not installed (budget cuts).
              </p>
              <p>
                <strong className="text-brand-red">Specialty:</strong> Sarcasm, eye-rolling (simulated).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
