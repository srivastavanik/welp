"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MessageSquareWarning, Info } from "lucide-react"
import { PageHeader } from "@/components/custom/page-header"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import Script from "next/script"

interface Message {
  id: string
  sender: "user" | "ai"
  text: string
  timestamp: Date
  audioUrl?: string
}

export default function WelpToMePage() {
  const { toast } = useToast()
  const [steamLevel, setSteamLevel] = useState(0)
  const [widgetLoaded, setWidgetLoaded] = useState(false)
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate steam level increasing when widget is used
    const interval = setInterval(() => {
      setSteamLevel(prev => Math.min(100, prev + Math.floor(Math.random() * 5) + 1))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

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
          widgetElement.style.cssText = 'width: 100%; height: 100%; position: absolute; top: 0; left: 0; border-radius: 8px;';
          
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
              border-radius: 8px !important;
            }
            elevenlabs-convai iframe {
              width: 100% !important;
              height: 100% !important;
              border-radius: 8px !important;
              border: none !important;
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
      title: "Widget Issue",
      description: "Try refreshing the page or check your microphone permissions.",
      variant: "destructive"
    });
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

      <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-700 max-w-3xl mx-auto">
        <Info className="h-5 w-5 text-red-600" />
        <AlertTitle className="text-red-800 font-semibold">Therapeutic Rage Zone!</AlertTitle>
        <AlertDescription>
          This is a mock feature for venting. The AI is designed to be antagonistic and for entertainment only.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="shadow-lg border-border-subtle">
            <CardHeader>
              <CardTitle className="text-text-primary">Your Venting Session</CardTitle>
              <CardDescription className="text-text-secondary">
                Click the microphone below to start venting to our AI companion.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* ElevenLabs Conversational AI Widget */}
              <div className="w-full">
                <div 
                  ref={widgetRef}
                  className="w-full h-[450px] border-2 border-dashed border-gray-300 rounded-lg relative overflow-hidden"
                >
                  {!widgetLoaded ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
                        <p className="text-lg text-text-secondary">Loading AI companion...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-8">
                        <p className="text-base text-text-secondary mb-4">
                          If the widget doesn't appear, try:
                        </p>
                        <ul className="text-sm text-text-secondary space-y-2">
                          <li>• Refreshing the page</li>
                          <li>• Allowing microphone permissions</li>
                          <li>• Using Chrome or Safari</li>
                          <li>• Checking your internet connection</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-text-secondary mt-4 text-center max-w-md">
                Your AI therapist is ready to listen to your complaints with... limited patience and maximum sarcasm.
              </p>
              
              {widgetLoaded && (
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Widget not working? Click here to refresh
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Steam Level</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative h-32 w-8 mx-auto bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "absolute bottom-0 w-full transition-all duration-1000 ease-out",
                    getSteamLevelColor()
                  )}
                  style={{ height: `${steamLevel}%` }}
                />
              </div>
              <p className="mt-2 text-lg font-semibold">{steamLevel}%</p>
              <p className="text-sm text-text-secondary">
                {steamLevel > 75 ? "Volcanic!" : steamLevel > 40 ? "Getting hot!" : "Cool as a cucumber"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">How to Use</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <p className="text-sm text-text-secondary">
                1. Click the microphone in the widget
              </p>
              <p className="text-sm text-text-secondary">
                2. Start venting about your day
              </p>
              <p className="text-sm text-text-secondary">
                3. Listen to our AI's... "helpful" response
              </p>
              <p className="text-sm text-text-secondary">
                4. Repeat as needed for therapeutic purposes
              </p>
            </CardContent>
          </Card>
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
            description: "Your antagonistic AI therapist is ready to listen.",
            variant: "default"
          });
          setWidgetLoaded(true)
        }}
        onError={handleWidgetError}
      />
    </>
  )
}
