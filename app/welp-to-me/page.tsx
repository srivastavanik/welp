"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, StopCircle, MessageSquareWarning, Bot, User, Loader2, Zap } from "lucide-react"
import { PageHeader } from "@/components/custom/page-header"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  sender: "user" | "ai"
  text: string
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
]

const mockUserVents = [
  "This customer just asked for a discount on an already discounted item!",
  "They spilled their drink everywhere and didn't even apologize!",
  "I had to explain the menu three times, and they still ordered something we don't have!",
  "He tried to use an expired coupon from last year!",
  "She complained that the music was too loud, then too quiet, then too 'mainstream'!",
]

export default function WelpToMePage() {
  const { toast } = useToast()
  const [isRecording, setIsRecording] = useState(false)
  const [isLoadingAiResponse, setIsLoadingAiResponse] = useState(false)
  const [conversation, setConversation] = useState<Message[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector("div[data-radix-scroll-area-viewport]")
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight
      }
    }
  }, [conversation])

  const handleToggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false)
      setIsLoadingAiResponse(true)

      const userVent = mockUserVents[Math.floor(Math.random() * mockUserVents.length)]
      const newUserMessage: Message = { id: `user-${Date.now()}`, sender: "user", text: userVent }
      setConversation((prev) => [...prev, newUserMessage])

      await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))
      const aiResponseText = antagonisticAiResponses[Math.floor(Math.random() * antagonisticAiResponses.length)]
      const newAiMessage: Message = { id: `ai-${Date.now()}`, sender: "ai", text: aiResponseText }
      setConversation((prev) => [...prev, newAiMessage])
      setIsLoadingAiResponse(false)

      toast({ title: "Vent Received!", description: "The AI is 'processing' your vital information." })
    } else {
      setIsRecording(true)
      toast({
        title: "Recording Started!",
        description: "Let it all out... The AI is (not really) listening.",
        className: "bg-brand-red text-white",
      })
    }
  }

  return (
    <>
      <PageHeader
        title="Welp to Me!"
        description="Vent your frustrations to our... 'understanding' AI companion."
        icon={MessageSquareWarning}
      />

      <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-700 max-w-3xl mx-auto">
        <Zap className="h-5 w-5 text-red-600" />
        <AlertTitle className="text-red-800 font-semibold">Therapeutic Rage Zone!</AlertTitle>
        <AlertDescription>
          This is a mock feature for venting. The AI is designed to be antagonistic and for entertainment only.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col items-center justify-center w-full mt-4">
        <Card className="w-full max-w-3xl shadow-2xl rounded-2xl border-border-subtle overflow-hidden bg-bg-subtle/50">
          <CardContent className="p-0">
            <ScrollArea className="h-[50vh] p-6" ref={scrollAreaRef}>
              {conversation.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-text-secondary/60">
                  <Bot className="h-20 w-20 mb-4" />
                  <p className="text-xl font-medium">The AI is waiting...</p>
                  <p className="text-base">Impatiently, of course.</p>
                </div>
              )}
              <div className="space-y-6">
                {conversation.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-start gap-3 text-base",
                      msg.sender === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {msg.sender === "ai" && (
                      <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center shrink-0">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-xl px-4 py-3 shadow-md",
                        msg.sender === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-white text-text-primary rounded-bl-none border border-border-subtle",
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    {msg.sender === "user" && (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoadingAiResponse && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center shrink-0">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="bg-white text-text-primary rounded-xl px-4 py-3 shadow-md rounded-bl-none border border-border-subtle">
                      <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
                      AI is 'thinking' up a witty retort...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-text-secondary mb-4">
            {isRecording ? "Press to stop venting" : "Press the mic to start venting"}
          </p>
          <Button
            size="icon"
            className={cn(
              "rounded-full h-28 w-28 text-white shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105",
              "bg-gradient-to-br from-red-500 to-brand-red",
              isRecording && "animate-pulse ring-8 ring-red-500/50 bg-red-600",
            )}
            onClick={handleToggleRecording}
            disabled={isLoadingAiResponse}
          >
            {isLoadingAiResponse ? (
              <Loader2 className="h-12 w-12 animate-spin" />
            ) : isRecording ? (
              <StopCircle className="h-12 w-12" />
            ) : (
              <Mic className="h-12 w-12" />
            )}
            <span className="sr-only">{isRecording ? "Stop Venting" : "Start Venting"}</span>
          </Button>
        </div>
      </div>
    </>
  )
}
