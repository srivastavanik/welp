interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  maxAlternatives?: number;
}

export class SpeechRecognitionService {
  private recognition: any;
  private isSupported: boolean;
  private currentTranscript: string = '';

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    
    if (this.isSupported) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
    }
  }

  isAvailable(): boolean {
    return this.isSupported;
  }

  async startRecording(
    options: SpeechRecognitionOptions = {},
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void
  ): Promise<void> {
    if (!this.isSupported) {
      throw new Error('Speech recognition not supported in this browser');
    }

    return new Promise((resolve, reject) => {
      this.recognition.continuous = options.continuous ?? true;
      this.recognition.interimResults = options.interimResults ?? true;
      this.recognition.lang = options.language ?? 'en-US';
      this.recognition.maxAlternatives = options.maxAlternatives ?? 1;

      this.recognition.onstart = () => {
        this.currentTranscript = '';
        resolve();
      };

              this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          // Process all results since last onresult event
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
              this.currentTranscript += ' ' + result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          // For live updates, show both accumulated final transcript and current interim
          const currentText = (this.currentTranscript + ' ' + interimTranscript).trim();
          if (currentText) {
            onResult({
              transcript: currentText,
              confidence: 1,
              isFinal: false
            });
          }

          // When we have a final piece, send it separately
          if (finalTranscript) {
            this.currentTranscript = this.currentTranscript.trim();
            onResult({
              transcript: this.currentTranscript,
              confidence: 1,
              isFinal: true
            });
          }
        };

      this.recognition.onerror = (event: any) => {
        onError(event.error);
        reject(new Error(event.error));
      };

      this.recognition.onend = () => {
        // Send final transcript when recognition ends
        if (this.currentTranscript) {
          onResult({
            transcript: this.currentTranscript.trim(),
            confidence: 1,
            isFinal: true
          });
        }
        // Restart if continuous mode is enabled
        if (options.continuous) {
          this.recognition.start();
        }
      };

      this.recognition.start();
    });
  }

  stopRecording(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  abort(): void {
    if (this.recognition) {
      this.recognition.abort();
    }
  }
}

export const speechRecognitionService = new SpeechRecognitionService();