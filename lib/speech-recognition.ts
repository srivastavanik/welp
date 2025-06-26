interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
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
      this.recognition.continuous = options.continuous ?? false;
      this.recognition.interimResults = options.interimResults ?? true;
      this.recognition.lang = options.language ?? 'en-US';
      this.recognition.maxAlternatives = options.maxAlternatives ?? 1;

      this.recognition.onstart = () => {
        resolve();
      };

      this.recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        
        onResult({ transcript, confidence });
      };

      this.recognition.onerror = (event: any) => {
        onError(event.error);
        reject(new Error(event.error));
      };

      this.recognition.onend = () => {
        // Recognition ended
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