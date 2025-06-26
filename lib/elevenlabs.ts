interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  agentId?: string;
}

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

interface ConversationConfig {
  agent_id?: string;
  override_agent_config?: {
    voice: {
      voice_id: string;
      stability: number;
      similarity_boost: number;
      style?: number;
      use_speaker_boost?: boolean;
    };
    agent: {
      prompt: {
        prompt: string;
      };
    };
  };
}

interface ConversationResponse {
  text: string;
  audio: string; // base64 encoded audio
  isFinal: boolean;
  normalizedAlignment?: any;
}

export class ElevenLabsService {
  private config: ElevenLabsConfig;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
      voiceId: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM',
      agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || undefined
    };
  }

  async textToSpeech(
    text: string, 
    voiceSettings: VoiceSettings = {
      stability: 0.5,
      similarity_boost: 0.8,
      style: 0.2,
      use_speaker_boost: true
    }
  ): Promise<ArrayBuffer> {
    if (!this.config.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/text-to-speech/${this.config.voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.config.apiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: voiceSettings
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    return await response.arrayBuffer();
  }

  async getVoices() {
    if (!this.config.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/voices`, {
      headers: {
        'xi-api-key': this.config.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  createAudioUrl(audioBuffer: ArrayBuffer): string {
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  }

  revokeAudioUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  async sendConversationMessage(
    userMessage: string,
    conversationConfig: ConversationConfig = {}
  ): Promise<ConversationResponse> {
    console.log('=== ElevenLabs Conversation Debug ===');
    console.log('API Key:', this.config.apiKey ? 'Set' : 'Not set');
    console.log('Agent ID:', this.config.agentId || 'Not set');
    console.log('User Message:', userMessage);
    
    if (!this.config.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    if (!this.config.agentId) {
      throw new Error('ElevenLabs Agent ID not configured. Please set NEXT_PUBLIC_ELEVENLABS_AGENT_ID in your .env.local file.');
    }

    // First, get a signed URL for the private agent
    try {
      const signedUrlResponse = await fetch(`${this.baseUrl}/convai/conversation/get-signed-url?agent_id=${this.config.agentId}`, {
        headers: {
          'xi-api-key': this.config.apiKey
        }
      });

      if (!signedUrlResponse.ok) {
        throw new Error(`Failed to get signed URL: ${signedUrlResponse.status} ${signedUrlResponse.statusText}`);
      }

      const { signed_url } = await signedUrlResponse.json();
      console.log('Got signed URL, connecting to WebSocket...');

      return new Promise((resolve, reject) => {
        const ws = new WebSocket(signed_url);
      
        let agentResponse = '';
        let audioResponse = '';
        let hasReceivedResponse = false;
        
        const timeout = setTimeout(() => {
          if (!hasReceivedResponse) {
            ws.close();
            reject(new Error('ElevenLabs conversation timeout'));
          }
        }, 30000); // 30 second timeout

        ws.onopen = () => {
          console.log('WebSocket connection opened');
          
          // First send conversation initiation, then the user message
          const initMsg = {
            type: 'conversation_initiation_client_data'
          };
          
          console.log('Sending conversation init:', initMsg);
          ws.send(JSON.stringify(initMsg));
          
          // Wait a moment then send the user message
          setTimeout(() => {
            const userMsg = {
              type: 'user_message',
              text: userMessage
            };
            
            console.log('Sending user message:', userMsg);
            ws.send(JSON.stringify(userMsg));
          }, 500);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            
            // Handle different message types from ElevenLabs
            if (data.type === 'conversation_initiation_metadata') {
              console.log('Conversation initialized');
            } else if (data.type === 'agent_response') {
              agentResponse += data.agent_response_event?.agent_response || '';
              console.log('Agent response received:', data.agent_response_event?.agent_response);
            } else if (data.type === 'audio') {
              // Skip audio processing for now since format is problematic
              console.log('Audio chunk received (skipping due to format issues)');
            } else if (data.type === 'interruption') {
              console.log('Conversation interrupted');
            } else if (data.type === 'ping') {
              // Respond to ping with pong
              ws.send(JSON.stringify({ 
                type: 'pong',
                event_id: data.ping_event?.event_id 
              }));
            } else if (data.type === 'conversation_end') {
              console.log('Conversation ended');
              hasReceivedResponse = true;
              clearTimeout(timeout);
              ws.close();
              resolve({
                text: agentResponse || 'No response received',
                audio: audioResponse,
                isFinal: true
              });
            } else if (data.type === 'error') {
              console.error('ElevenLabs error:', data);
              clearTimeout(timeout);
              ws.close();
              reject(new Error(`ElevenLabs API error: ${data.message || 'Unknown error'}`));
            }
            
            // Auto-resolve after getting agent response
            if (agentResponse && data.type === 'agent_response' && !hasReceivedResponse) {
              hasReceivedResponse = true;
              clearTimeout(timeout);
              ws.close();
              console.log('Resolving with text:', agentResponse);
              resolve({
                text: agentResponse,
                audio: '', // No audio for now
                isFinal: true
              });
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          clearTimeout(timeout);
          reject(new Error(`ElevenLabs WebSocket error: ${error}`));
        };

        ws.onclose = () => {
          clearTimeout(timeout);
          if (!hasReceivedResponse) {
            reject(new Error('ElevenLabs WebSocket closed without response'));
          }
        };
      });
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw new Error(`Failed to initialize conversation: ${error}`);
    }
  }

  createAudioUrlFromBase64(base64Audio: string): string {
    try {
      // Remove any whitespace or newlines that might be in the base64 string
      const cleanBase64 = base64Audio.replace(/[\s\n]/g, '');
      
      // Validate base64 string
      if (!cleanBase64 || cleanBase64.length === 0) {
        console.error('Empty base64 audio string');
        return '';
      }
      
      // Check if this looks like valid base64
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
        console.error('Invalid base64 characters detected');
        return '';
      }
      
      // Ensure proper padding
      const padding = cleanBase64.length % 4;
      const paddedBase64 = padding ? cleanBase64 + '='.repeat(4 - padding) : cleanBase64;
      
      const binaryString = atob(paddedBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Try different audio formats - ElevenLabs might send PCM or other formats
      let mimeType = 'audio/mpeg';
      
      // Check if it might be PCM audio (common for streaming)
      if (cleanBase64.startsWith('UklGR') || cleanBase64.startsWith('QXdB')) {
        mimeType = 'audio/wav';
      }
      
      const blob = new Blob([bytes], { type: mimeType });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating audio URL from base64:', error);
      console.error('Base64 length:', base64Audio?.length);
      console.error('First 100 chars:', base64Audio?.substring(0, 100));
      console.error('Looks like audio data but invalid base64 encoding');
      return '';
    }
  }
}

export const elevenLabsService = new ElevenLabsService();