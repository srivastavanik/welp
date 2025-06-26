import { useState, useCallback, useRef } from 'react';
import { elevenLabsService } from '@/lib/elevenlabs';
import { useToast } from '@/hooks/use-toast';

interface UseTextToSpeechOptions {
  voiceSettings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUrlRef = useRef<string | null>(null);
  const { toast } = useToast();

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    try {
      setIsLoading(true);
      options.onStart?.();

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Clean up previous URL
      if (currentUrlRef.current) {
        elevenLabsService.revokeAudioUrl(currentUrlRef.current);
        currentUrlRef.current = null;
      }

      // Generate speech
      const audioBuffer = await elevenLabsService.textToSpeech(text, options.voiceSettings);
      const audioUrl = elevenLabsService.createAudioUrl(audioBuffer);
      currentUrlRef.current = audioUrl;

      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onloadstart = () => setIsLoading(false);
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        options.onEnd?.();
        // Clean up
        if (currentUrlRef.current) {
          elevenLabsService.revokeAudioUrl(currentUrlRef.current);
          currentUrlRef.current = null;
        }
      };
      audio.onerror = () => {
        setIsLoading(false);
        setIsPlaying(false);
        const error = 'Failed to play audio';
        options.onError?.(error);
        toast({
          title: 'Playback Error',
          description: error,
          variant: 'destructive'
        });
      };

      await audio.play();
    } catch (error) {
      setIsLoading(false);
      setIsPlaying(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate speech';
      options.onError?.(errorMessage);
      
      if (errorMessage.includes('API key')) {
        toast({
          title: 'Configuration Error',
          description: 'ElevenLabs API key not configured. Please add your API key to .env.local',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Speech Generation Failed',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }
  }, [options, toast]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
    
    if (currentUrlRef.current) {
      elevenLabsService.revokeAudioUrl(currentUrlRef.current);
      currentUrlRef.current = null;
    }
  }, []);

  return {
    speak,
    stop,
    isPlaying,
    isLoading
  };
}