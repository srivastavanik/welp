# Welp - Customer Rating Platform

A customer rating platform for businesses to share experiences and build community trust.

## Features

- **Customer Lookup**: Search customers by phone number
- **Rating System**: Rate customers on behavior, payment, and maintenance
- **Voice Reviews**: Record voice reviews with automatic transcription
- **Voice Agent**: Interactive AI companion for venting frustrations
- **Review Management**: View and manage submitted reviews
- **Subscription Tiers**: Free and Premium plans

## Voice Features Setup

This application uses ElevenLabs for voice functionality. To enable voice features:

1. Sign up for an ElevenLabs account at [elevenlabs.io](https://elevenlabs.io)
2. Get your API key from the [API settings](https://elevenlabs.io/app/settings/api-keys)
3. Copy `.env.local` and add your API key:
   ```
   NEXT_PUBLIC_ELEVENLABS_API_KEY=your_api_key_here
   ```
4. Optionally, choose a different voice ID from the [voice library](https://elevenlabs.io/app/voice-library)

### Voice Features

- **Voice Reviews**: Record detailed voice reviews that are automatically transcribed
- **AI Voice Agent**: Interactive voice conversations with an antagonistic AI companion
- **Real-time Transcription**: Speech-to-text using browser Web Speech API
- **Text-to-Speech**: AI responses are spoken using ElevenLabs voices

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Browser Compatibility

Voice features require:
- Chrome, Edge, or Safari for speech recognition
- Modern browser with microphone access
- HTTPS in production for microphone permissions

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Radix UI Components
- ElevenLabs API for text-to-speech
- Web Speech API for speech recognition