"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, StopCircle, MessageSquareWarning, Bot, User, Loader2, Zap, Brain, Volume2, VolumeX } from "lucide-react"
import { PageHeader } from "@/components/custom/page-header"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { useVoiceRecording } from "@/hooks/use-voice-recording"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"

interface Message {
  id: string
  sender: "user" | "ai"
  text: string
  timestamp: Date
  audioUrl?: string
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
  "Let me guess, someone didn't get their participation trophy today?",
  "Your problems are so unique... said no one ever.",
  "Have you tried turning your attitude off and on again?",
  "I've heard more compelling arguments from a broken vending machine.",
  "Is this the part where I'm supposed to feel sorry for you? Because I don't."
]

export default function WelpToMePage() {
  const { toast } = useToast()
  const [conversation, setConversation] = useState<Message[]>([])
  const [steamLevel, setSteamLevel] = useState(0) // 0-100
  const [isProcessingAi, setIsProcessingAi] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Voice recording hook
  const {
    isRecording,
    transcript,
    isSupported: isRecordingSupported,
    toggleRecording
  } = useVoiceRecording({
    onTranscript: (finalTranscript) => {
      if (finalTranscript.trim()) {
        handleUserVent(finalTranscript);
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

  // Text-to-speech hook with antagonistic voice settings
  const { speak, stop, isPlaying, isLoading: isSpeechLoading } = useTextToSpeech({
    voiceSettings: {
      stability: 0.3, // Less stable for more attitude
      similarity_boost: 0.9,
      style: 0.8, // More stylized/expressive
      use_speaker_boost: true
    },
    onError: (error) => {
      console.error('TTS Error:', error);
    }
  });

  useEffect(() => {
    // Scroll to bottom of conversation
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector("div[data-radix-scroll-area-viewport]")
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight
      }
    }
  }, [conversation])

  const handleUserVent = async (userText: string) => {
    if (!userText.trim()) return;

    // Add user message
    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date(),
    }
    setConversation(prev => [...prev, newUserMessage])
    setSteamLevel(prev => Math.min(100, prev + Math.floor(Math.random() * 15) + 10))

    // Generate AI response
    setIsProcessingAi(true)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
    
    const aiResponseText = antagonisticAiResponses[Math.floor(Math.random() * antagonisticAiResponses.length)]
    const newAiMessage: Message = {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: aiResponseText,
      timestamp: new Date(),
    }
    
    setConversation(prev => [...prev, newAiMessage])
    setIsProcessingAi(false)

    // Speak the AI response
    speak(aiResponseText);

    toast({
      title: "Vent Processed!",
      description: "The AI has responded with its usual charm.",
    })
  }

  const getSteamLevelColor = () => {
    if (steamLevel > 75) return "bg-red-600"
    if (steamLevel > 40) return "bg-orange-500"
    return "bg-yellow-400"
  }

  const handleStopAudio = () => {
    stop();
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
          This AI is designed to be antagonistic for venting purposes. Real voice interaction powered by ElevenLabs.
          {!isRecordingSupported && (
            <span className="block mt-1 text-sm">
              Voice recording not supported in this browser. Please use Chrome, Edge, or Safari.
            </span>
          )}
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="shadow-lg border-border-subtle">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-text-primary">Your Venting Session</CardTitle>
                <CardDescription className="text-text-secondary">
                  {isRecording ? "Listening to your grievances..." : 
                   isProcessingAi ? "AI is crafting a witty retort..." :
                   "Press the mic to start venting."}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {(isPlaying || isSpeechLoading) && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full h-12 w-12"
                    onClick={handleStopAudio}
                    disabled={isSpeechLoading}
                  >
                    {isSpeechLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <VolumeX className="h-6 w-6" />
                    )}
                    <span className="sr-only">Stop Audio</span>
                  </Button>
                )}
                <Button
                  size="icon"
                  variant={isRecording ? "destructive" : "outline"}
                  className={cn(
                    "rounded-full h-16 w-16 text-2xl",
                    isRecording && "animate-pulse ring-4 ring-red-500/50"
                  )}
                  onClick={toggleRecording}
                  disabled={isProcessingAi || !isRecordingSupported}
                >
                  {isRecording ? (
                    <StopCircle className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                  <span className="sr-only">{isRecording ? "Stop Venting" : "Start Venting"}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {transcript && isRecording && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Listening:</strong> {transcript}
                  </p>
                </div>
              )}
              
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
                    {msg.sender === "ai" && (
                      <div className="flex flex-col items-center gap-1">
                        <Bot className="h-6 w-6 text-brand-red shrink-0" />
                        {isPlaying && (
                          <Volume2 className="h-4 w-4 text-brand-red animate-pulse" />
                        )}
                      </div>
                    )}
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
                    {msg.sender === "user" && <User className="h-6 w-6 text-blue-500 shrink-0" />}
                  </div>
                ))}
                {isProcessingAi && (
                  <div className="flex items-center justify-start gap-2 text-sm mb-3">
                    <Bot className="h-6 w-6 text-brand-red shrink-0" />
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
                <strong className="text-brand-red">Voice:</strong> ElevenLabs Powered
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