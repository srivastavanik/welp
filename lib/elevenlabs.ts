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
        let audioChunks: string[] = [];
        let hasReceivedResponse = false;
        let hasReceivedAudio = false;
        let userMessageSent = false;
        
        // Shorter timeout and force close after response
        const timeout = setTimeout(() => {
          console.log('Conversation timeout, forcing close');
          ws.close();
          
          // If we got audio but no text, try to transcribe or use fallback
          if (hasReceivedAudio && audioChunks.length > 0) {
            console.log('Got audio response, but no text. Audio-only response.');
            
            // Decode and combine audio chunks properly
            const combinedAudio = this.combineAudioChunks(audioChunks);
            console.log('Combined audio from timeout, final length:', combinedAudio.length);
            
            resolve({
              text: "", // No text, audio-only
              audio: combinedAudio,
              isFinal: true
            });
          } else if (hasReceivedResponse && agentResponse) {
            console.log('Resolving with timeout response:', agentResponse);
            resolve({
              text: agentResponse.trim(),
              audio: '',
              isFinal: true
            });
          } else {
            reject(new Error('ElevenLabs conversation timeout'));
          }
        }, 8000); // Reduced to 8 seconds

        ws.onopen = () => {
          console.log('WebSocket connection opened');
          
          // Send conversation initiation with text output request
          const initMsg = {
            type: 'conversation_initiation_client_data',
            conversation_config_override: {
              agent: {
                enable_transcription: true,
                enable_text_output: true
              }
            }
          };
          
          console.log('Sending conversation init with text output:', initMsg);
          ws.send(JSON.stringify(initMsg));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            
            // Handle different message types from ElevenLabs
            if (data.type === 'conversation_initiation_metadata') {
              console.log('Conversation initialized');
              // Don't send user message immediately - wait for greeting to finish
              
            } else if (data.type === 'agent_response') {
              const response = data.agent_response_event?.agent_response || '';
              if (response && response.includes("Hello, what's up with you today?")) {
                // This is the greeting - now send the user message
                console.log('Received greeting, now sending user message');
                if (!userMessageSent) {
                  setTimeout(() => {
                    const userMsg = {
                      type: 'user_message',
                      text: userMessage
                    };
                    
                    console.log('Sending user message after greeting:', userMsg);
                    ws.send(JSON.stringify(userMsg));
                    userMessageSent = true;
                  }, 500); // Wait a moment for greeting to complete
                }
              } else if (response && !response.includes("Hello, what's up with you today?")) {
                // This is the actual response to user message
                agentResponse = response.trim();
                hasReceivedResponse = true;
                console.log('Valid agent response received:', agentResponse);
                
                // Immediately resolve with the response to prevent credit burning
                clearTimeout(timeout);
                ws.close();
                console.log('Closing WebSocket and resolving immediately');
                resolve({
                  text: agentResponse,
                  audio: '',
                  isFinal: true
                });
                return;
              }
            } else if (data.type === 'audio') {
              // Count audio chunks to know we're getting a response
              hasReceivedAudio = true;
              const audioChunk = data.audio_event?.audio_base_64 || '';
              if (audioChunk) {
                audioChunks.push(audioChunk);
                console.log('Audio chunk received, chunk length:', audioChunk.length, 'total chunks:', audioChunks.length);
              }
              
              // Only resolve with audio if we've sent the user message and have multiple chunks
              if (audioChunks.length >= 3 && !hasReceivedResponse && userMessageSent) {
                console.log('Multiple audio chunks received after user message sent. Getting response audio.');
                
                // Decode and combine audio chunks properly
                const combinedAudio = this.combineAudioChunks(audioChunks);
                console.log('Combined audio from chunks, final length:', combinedAudio.length);
                
                clearTimeout(timeout);
                ws.close();
                resolve({
                  text: "", // No text, audio-only
                  audio: combinedAudio,
                  isFinal: true
                });
                return;
              }
            } else if (data.type === 'interruption') {
              console.log('Conversation interrupted');
            } else if (data.type === 'ping') {
              // Respond to ping with pong to keep connection alive
              ws.send(JSON.stringify({ 
                type: 'pong',
                event_id: data.ping_event?.event_id 
              }));
              
              // If we have audio chunks and we're just getting pings after sending user message, resolve
              if (hasReceivedAudio && audioChunks.length > 0 && !hasReceivedResponse && userMessageSent) {
                console.log('Have audio chunks and getting pings after user message, resolving with audio-only response');
                
                // Decode and combine audio chunks properly
                const combinedAudio = this.combineAudioChunks(audioChunks);
                console.log('Combined audio from pings, final length:', combinedAudio.length);
                
                clearTimeout(timeout);
                ws.close();
                resolve({
                  text: "", // No text, audio-only
                  audio: combinedAudio,
                  isFinal: true
                });
                return;
              }
              
              // If we have a text response and we're just getting pings, close the connection
              if (hasReceivedResponse && agentResponse) {
                console.log('Have response and getting pings, closing connection');
                clearTimeout(timeout);
                ws.close();
                resolve({
                  text: agentResponse,
                  audio: '',
                  isFinal: true
                });
                return;
              }
            } else if (data.type === 'conversation_end') {
              console.log('Conversation ended with response:', agentResponse);
              clearTimeout(timeout);
              ws.close();
              
              if (hasReceivedResponse && agentResponse) {
                resolve({
                  text: agentResponse,
                  audio: '',
                  isFinal: true
                });
              } else if (hasReceivedAudio && audioChunks.length > 0 && userMessageSent) {
                // Got audio but no text
                const combinedAudio = this.combineAudioChunks(audioChunks);
                console.log('Combined audio from conversation end, final length:', combinedAudio.length);
                
                resolve({
                  text: "", // No text, audio-only
                  audio: combinedAudio,
                  isFinal: true
                });
              } else {
                reject(new Error('Conversation ended without valid response'));
              }
            } else if (data.type === 'error') {
              console.error('ElevenLabs error:', data);
              clearTimeout(timeout);
              ws.close();
              reject(new Error(`ElevenLabs API error: ${data.message || 'Unknown error'}`));
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          clearTimeout(timeout);
          reject(new Error(`ElevenLabs WebSocket error: ${error}`));
        };

        ws.onclose = () => {
          clearTimeout(timeout);
          console.log('WebSocket closed. HasResponse:', hasReceivedResponse, 'HasAudio:', hasReceivedAudio, 'Response:', agentResponse);
          // Don't reject here if we already resolved
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
      const cleanBase64 = base64Audio.replace(/[\s\n\r]/g, '');
      
      // Validate base64 string
      if (!cleanBase64 || cleanBase64.length === 0) {
        console.error('Empty base64 audio string');
        return '';
      }
      
      console.log('Processing base64 audio, original length:', base64Audio.length);
      console.log('Cleaned base64 length:', cleanBase64.length);
      console.log('First 50 chars:', cleanBase64.substring(0, 50));
      
      // Try to decode base64 directly without strict validation
      // The regex was too strict, let's just try to decode
      try {
        // Ensure proper padding for base64
        let paddedBase64 = cleanBase64;
        const padding = cleanBase64.length % 4;
        if (padding) {
          paddedBase64 = cleanBase64 + '='.repeat(4 - padding);
        }
        
        console.log('Attempting to decode base64, padded length:', paddedBase64.length);
        
        // Use a more robust base64 decoding approach
        let binaryString: string;
        try {
          binaryString = atob(paddedBase64);
        } catch (atobError) {
          console.log('Standard atob failed, trying URL-safe base64 conversion');
          // Try converting URL-safe base64 to standard base64
          const standardBase64 = paddedBase64.replace(/-/g, '+').replace(/_/g, '/');
          binaryString = atob(standardBase64);
        }
        
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        console.log('Successfully decoded base64, binary length:', bytes.length);
        
        // Validate we have actual audio data (not just zeros or invalid data)
        const nonZeroCount = bytes.filter(b => b !== 0).length;
        if (nonZeroCount < bytes.length * 0.1) {
          console.warn('Audio data seems to be mostly zeros, might be invalid');
        }
        
        // ElevenLabs sends PCM 16-bit audio at 16kHz, we need to create a WAV file
        const wavHeader = this.createWavHeader(bytes.length, 16000, 1, 16);
        const wavBytes = new Uint8Array(wavHeader.length + bytes.length);
        wavBytes.set(wavHeader, 0);
        wavBytes.set(bytes, wavHeader.length);
        
        const blob = new Blob([wavBytes], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        console.log('Created WAV audio URL successfully, total size:', wavBytes.length);
        return url;
        
      } catch (decodeError) {
        console.error('Failed to decode base64:', decodeError);
        console.error('Base64 string sample (first 100 chars):', cleanBase64.substring(0, 100));
        
        // Check for common base64 issues
        const invalidChars = cleanBase64.match(/[^A-Za-z0-9+/=\-_]/g);
        if (invalidChars) {
          console.error('Found invalid base64 characters:', invalidChars);
        }
        
        // Log some statistics about the base64 string
        const stats = {
          length: cleanBase64.length,
          slashes: (cleanBase64.match(/\//g) || []).length,
          pluses: (cleanBase64.match(/\+/g) || []).length,
          equals: (cleanBase64.match(/=/g) || []).length,
          hasUrlSafeChars: cleanBase64.includes('-') || cleanBase64.includes('_')
        };
        console.log('Base64 statistics:', stats);
        
        return '';
      }
    } catch (error) {
      console.error('Error creating audio URL from base64:', error);
      console.error('Base64 length:', base64Audio?.length);
      console.error('First 100 chars:', base64Audio?.substring(0, 100));
      return '';
    }
  }

  private createWavHeader(dataLength: number, sampleRate: number, channels: number, bitsPerSample: number): Uint8Array {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    
    // RIFF header
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + dataLength, true); // File size - 8
    view.setUint32(8, 0x57415645, false); // "WAVE"
    
    // fmt chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, channels, true); // Number of channels
    view.setUint32(24, sampleRate, true); // Sample rate
    view.setUint32(28, sampleRate * channels * bitsPerSample / 8, true); // Byte rate
    view.setUint16(32, channels * bitsPerSample / 8, true); // Block align
    view.setUint16(34, bitsPerSample, true); // Bits per sample
    
    // data chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, dataLength, true); // Data size
    
    return new Uint8Array(header);
  }

  private combineAudioChunks(chunks: string[]): string {
    try {
      console.log('Combining', chunks.length, 'audio chunks');
      
      const allAudioBytes: number[] = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (!chunk || chunk.length === 0) continue;
        
        try {
          // Clean the chunk
          const cleanChunk = chunk.replace(/[\s\n\r]/g, '');
          
          // Ensure proper padding
          let paddedChunk = cleanChunk;
          const padding = cleanChunk.length % 4;
          if (padding) {
            paddedChunk = cleanChunk + '='.repeat(4 - padding);
          }
          
          // Decode this individual chunk
          const binaryString = atob(paddedChunk);
          
          // Convert to bytes and add to our collection
          for (let j = 0; j < binaryString.length; j++) {
            allAudioBytes.push(binaryString.charCodeAt(j));
          }
          
          console.log(`Chunk ${i + 1}/${chunks.length}: decoded ${binaryString.length} bytes`);
          
        } catch (chunkError) {
          console.warn(`Failed to decode chunk ${i + 1}:`, chunkError);
          // Skip this chunk and continue with others
        }
      }
      
      console.log('Total audio bytes combined:', allAudioBytes.length);
      
      if (allAudioBytes.length === 0) {
        console.error('No valid audio data found in chunks');
        return '';
      }
      
      // Convert back to base64 for consistent handling
      const combinedBinary = String.fromCharCode(...allAudioBytes);
      const combinedBase64 = btoa(combinedBinary);
      
      console.log('Final combined base64 length:', combinedBase64.length);
      return combinedBase64;
      
    } catch (error) {
      console.error('Error combining audio chunks:', error);
      // Fallback to simple concatenation
      return chunks.join('');
    }
  }
}

export const elevenLabsService = new ElevenLabsService();