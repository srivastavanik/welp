import { useState, useCallback, useRef, useEffect } from 'react';
import { speechRecognitionService } from '@/lib/speech-recognition';
import { useToast } from '@/hooks/use-toast';

interface UseVoiceRecordingOptions {
  onTranscript?: (transcript: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  language?: string;
}

export function useVoiceRecording(options: UseVoiceRecordingOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    setIsSupported(speechRecognitionService.isAvailable());
  }, []);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      const error = 'Speech recognition not supported in this browser';
      options.onError?.(error);
      toast({
        title: 'Not Supported',
        description: error,
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsRecording(true);
      setTranscript('');

      await speechRecognitionService.startRecording(
        {
          continuous: options.continuous ?? true,
          interimResults: true,
          language: options.language ?? 'en-US'
        },
                  (result) => {
            // Always update the transcript for live display
            setTranscript(result.transcript);
            
            // Only call onTranscript with final results
            if (result.isFinal) {
              if (options.onTranscript) {
                options.onTranscript(result.transcript);
              }
              // Clear the live transcript after saving
              setTranscript('');
            }
          },
        (error) => {
          setIsRecording(false);
          options.onError?.(error);
          toast({
            title: 'Recording Error',
            description: error,
            variant: 'destructive'
          });
        }
      );
    } catch (error) {
      setIsRecording(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      options.onError?.(errorMessage);
      toast({
        title: 'Recording Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, [isSupported, options, toast]);

  const stopRecording = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    speechRecognitionService.stopRecording();
    setIsRecording(false);
    setTranscript('');
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    transcript,
    isSupported,
    startRecording,
    stopRecording,
    toggleRecording
  };
}