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
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUrlRef = useRef<string | null>(null);
  const { toast } = useToast();

  const speak = useCallback(async (text: string, forcePlay: boolean = false) => {
    if (!text.trim()) return;

    // Check if we need user interaction for audio playback
    if (!hasUserInteracted && !forcePlay) {
      // Store the text to play later when user interacts
      console.warn('Audio playback requires user interaction. Use forcePlay=true after user gesture.');
      return;
    }

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
      audio.onplay = () => {
        setIsPlaying(true);
        setHasUserInteracted(true); // Mark that user has interacted
      };
      audio.onended = () => {
        setIsPlaying(false);
        options.onEnd?.();
        // Clean up
        if (currentUrlRef.current) {
          elevenLabsService.revokeAudioUrl(currentUrlRef.current);
          currentUrlRef.current = null;
        }
      };
      audio.onerror = (event) => {
        setIsLoading(false);
        setIsPlaying(false);
        let errorMessage = 'Failed to play audio';
        
        if (event instanceof Event && event.target) {
          const audioError = (event.target as HTMLAudioElement).error;
          if (audioError?.code === 4) {
            errorMessage = 'Audio format not supported';
          }
        }
        
        options.onError?.(errorMessage);
        toast({
          title: 'Playback Error',
          description: errorMessage,
          variant: 'destructive'
        });
      };

      try {
        await audio.play();
        setHasUserInteracted(true); // Mark successful playback
      } catch (playError) {
        if (playError instanceof Error && playError.message.includes('user activation')) {
          const message = 'Please click anywhere on the page to enable audio playback';
          options.onError?.(message);
          toast({
            title: 'User Interaction Required',
            description: message,
            variant: 'destructive'
          });
        } else {
          throw playError;
        }
      }
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

  const initializeAudio = useCallback(() => {
    // Mark that user has interacted for future audio playback
    setHasUserInteracted(true);
  }, []);

  return {
    speak,
    stop,
    initializeAudio,
    isPlaying,
    isLoading,
    hasUserInteracted
  };
}