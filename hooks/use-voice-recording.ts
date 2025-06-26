import { useState, useCallback, useRef } from 'react';
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
  const [isSupported] = useState(speechRecognitionService.isAvailable());
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();

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
          continuous: options.continuous ?? false,
          interimResults: true,
          language: options.language ?? 'en-US'
        },
        (result) => {
          setTranscript(result.transcript);
          options.onTranscript?.(result.transcript);
          
          // Auto-stop after 10 seconds of silence for non-continuous mode
          if (!options.continuous) {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
              stopRecording();
            }, 10000);
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