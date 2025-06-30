"use client"

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MessageSquareWarning, Info, Mic, MicOff, Volume2, Zap, Flame, Brain, Heart } from "lucide-react"
import { PageHeader } from "@/components/custom/page-header"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import Script from "next/script"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  sender: "user" | "ai"
  text: string
  timestamp: Date
  audioUrl?: string
}

const mockResponses = [
  "Oh, another complaint? How original.",
  "Have you tried... not being upset about it?",
  "Fascinating. Tell me more about your first world problems.",
  "I'm processing your emotional outburst... Error 404: Empathy not found.",
  "That sounds tough. Have you considered screaming into the void instead?",
]

export default function WelpToMePage() {
  const { toast } = useToast()
  const [steamLevel, setSteamLevel] = useState(0)
  const [widgetLoaded, setWidgetLoaded] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [aiMood, setAiMood] = useState<"sarcastic" | "dismissive" | "mockingly-helpful">("sarcastic")
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate steam level increasing when widget is used
    const interval = setInterval(() => {
      if (isListening) {
        setSteamLevel(prev => Math.min(100, prev + Math.floor(Math.random() * 10) + 5))
      } else {
        setSteamLevel(prev => Math.max(0, prev - 2))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isListening])

  useEffect(() => {
    // Try to initialize widget after script loads
    if (widgetLoaded && widgetRef.current) {
      console.log('Widget container ready, checking for ElevenLabs script...');
      
      // Clear any loading content and insert widget
      setTimeout(() => {
        if (widgetRef.current) {
          // Clear the container completely
          widgetRef.current.innerHTML = '';
          
          // Create the widget element
          const widgetElement = document.createElement('elevenlabs-convai');
          widgetElement.setAttribute('agent-id', 'agent_01jyna847zegqv6rr8pvkfhve4');
          widgetElement.style.cssText = 'width: 100%; height: 100%; position: absolute; top: 0; left: 0; border-radius: 16px; filter: drop-shadow(0 10px 40px rgba(218, 38, 13, 0.3));';
          
          // Append to container
          widgetRef.current.appendChild(widgetElement);
          console.log('Widget element created and inserted');
          
          // Also add global styles for the widget
          const styleElement = document.createElement('style');
          styleElement.textContent = `
            elevenlabs-convai {
              width: 100% !important;
              height: 100% !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              border-radius: 16px !important;
            }
            elevenlabs-convai iframe {
              width: 100% !important;
              height: 100% !important;
              border-radius: 16px !important;
              border: none !important;
            }
            .widget-container {
              background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
              border: 2px solid rgba(218, 38, 13, 0.1);
            }
          `;
          document.head.appendChild(styleElement);
        }
      }, 1000);
    }
  }, [widgetLoaded])

  const handleWidgetError = () => {
    console.error('Widget failed to load or initialize');
    toast({
      title: "AI Malfunction",
      description: "Our sarcastic AI is taking a coffee break. Try again later.",
      variant: "destructive"
    });
  }

  const getSteamLevelColor = () => {
    if (steamLevel > 75) return "from-red-600 to-orange-500"
    if (steamLevel > 40) return "from-yellow-500 to-orange-500"
    return "from-blue-400 to-yellow-400"
  }

  const getMoodIcon = () => {
    switch(aiMood) {
      case "dismissive": return <Brain className="w-6 h-6" />
      case "mockingly-helpful": return <Heart className="w-6 h-6" />
      default: return <Zap className="w-6 h-6" />
    }
  }

  return (
    <div className="page-enter">
      <PageHeader
        title="Welp to Me!"
        description="Vent your frustrations to our... 'understanding' AI companion."
        icon={MessageSquareWarning}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Alert className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-300 max-w-4xl mx-auto hover-lift">
          <Info className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800 font-bold text-lg">Therapeutic Rage Zone!</AlertTitle>
          <AlertDescription className="text-red-700">
            Warning: This AI has been programmed with maximum sass and minimum sympathy. Side effects may include 
            eye-rolling, frustrated sighs, and the urge to throw your phone. Proceed with caution.
          </AlertDescription>
        </Alert>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-2xl border-0 overflow-hidden bg-gradient-subtle card-hover">
            <CardHeader className="bg-gradient-brand text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ["0%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <CardTitle className="text-2xl font-bold relative z-10">Your Venting Session</CardTitle>
              <CardDescription className="text-red-100 relative z-10">
                {isListening ? "AI is pretending to listen..." : "Click the microphone to start your therapeutic screaming"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* ElevenLabs Conversational AI Widget */}
              <div className="relative h-[500px] widget-container">
                <div 
                  ref={widgetRef}
                  className="w-full h-full relative"
                >
                  {!widgetLoaded ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-subtle">
                      <div className="text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-20 h-20 mx-auto mb-6"
                        >
                          <div className="w-full h-full rounded-full bg-gradient-brand glow-red-intense flex items-center justify-center">
                            <Mic className="w-10 h-10 text-white" />
                          </div>
                        </motion.div>
                        <p className="text-xl font-semibold text-gradient-brand">Summoning your AI tormentor...</p>
                        <p className="text-sm text-muted-foreground mt-2">This may take a moment of awkward silence</p>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-8">
                        <motion.div
                          className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-brand glow-red flex items-center justify-center cursor-pointer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsListening(!isListening)}
                        >
                          <AnimatePresence mode="wait">
                            {isListening ? (
                              <motion.div
                                key="listening"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <Volume2 className="w-16 h-16 text-white" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="not-listening"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <Mic className="w-16 h-16 text-white" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                        <p className="text-lg font-semibold mb-4">
                          {isListening ? "Go ahead, let it all out..." : "Tap to start venting"}
                        </p>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>• The AI will judge you silently (and not so silently)</p>
                          <p>• Expect unhelpful advice and sarcastic comments</p>
                          <p>• Remember: it's cheaper than real therapy</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Decorative elements */}
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-red-500/20 to-transparent rounded-full blur-3xl" />
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-full blur-3xl" />
              </div>
              
              {widgetLoaded && (
                <div className="p-4 bg-red-50 border-t border-red-100">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="text-sm text-red-600 hover:text-red-800 underline font-medium"
                  >
                    AI being too nice? Click here to recalibrate its sassiness
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6">
          {/* Steam Level Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-xl border-0 overflow-hidden card-hover">
              <CardHeader className="bg-gradient-to-br from-red-500 to-orange-500 text-white">
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  <Flame className="w-5 h-5" />
                  Rage Meter
                  <Flame className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="relative h-48 w-20 mx-auto bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    className={cn(
                      "absolute bottom-0 w-full bg-gradient-to-t",
                      getSteamLevelColor()
                    )}
                    animate={{ height: `${steamLevel}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                  {/* Bubble effects */}
                  {steamLevel > 50 && (
                    <div className="absolute inset-0">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-white/40 rounded-full"
                          initial={{ bottom: "0%", x: Math.random() * 20 }}
                          animate={{ 
                            bottom: "100%",
                            x: Math.random() * 20
                          }}
                          transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: "easeOut"
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-center mt-4">
                  <p className="text-3xl font-bold text-gradient-brand">{steamLevel}%</p>
                  <p className="text-sm text-muted-foreground font-medium">
                    {steamLevel > 75 ? "VOLCANIC ERUPTION!" : 
                     steamLevel > 50 ? "Getting spicy!" : 
                     steamLevel > 25 ? "Mildly annoyed" : 
                     "Zen master"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Mood Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-xl border-0 card-hover">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  {getMoodIcon()}
                  <span className="text-gradient-brand">AI Mood</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <button
                    onClick={() => setAiMood("sarcastic")}
                    className={cn(
                      "w-full p-3 rounded-lg font-medium transition-all",
                      aiMood === "sarcastic" 
                        ? "bg-gradient-brand text-white shadow-lg" 
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    )}
                  >
                    Sarcastic & Sassy
                  </button>
                  <button
                    onClick={() => setAiMood("dismissive")}
                    className={cn(
                      "w-full p-3 rounded-lg font-medium transition-all",
                      aiMood === "dismissive" 
                        ? "bg-gradient-brand text-white shadow-lg" 
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    )}
                  >
                    Coldly Dismissive
                  </button>
                  <button
                    onClick={() => setAiMood("mockingly-helpful")}
                    className={cn(
                      "w-full p-3 rounded-lg font-medium transition-all",
                      aiMood === "mockingly-helpful" 
                        ? "bg-gradient-brand text-white shadow-lg" 
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    )}
                  >
                    Mockingly Helpful
                  </button>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  *AI mood may not actually change anything
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sample Responses */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="shadow-xl border-0 bg-gradient-to-br from-gray-50 to-red-50 card-hover">
              <CardHeader>
                <CardTitle className="text-center text-lg">Sample AI Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockResponses.slice(0, 3).map((response, i) => (
                    <motion.p 
                      key={i}
                      className="text-sm italic text-gray-600 p-2 bg-white/50 rounded-lg"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                    >
                      "{response}"
                    </motion.p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Load the ElevenLabs widget script */}
      <Script 
        src="https://unpkg.com/@elevenlabs/convai-widget-embed" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('ElevenLabs widget loaded successfully');
          toast({
            title: "AI Companion Ready!",
            description: "Your antagonistic AI therapist is ready to not help.",
            variant: "default"
          });
          setWidgetLoaded(true)
        }}
        onError={handleWidgetError}
      />
    </div>
  )
}