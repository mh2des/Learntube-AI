# LearnTube AI - Frontend

AI-Powered Learning Platform built with Next.js 16

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Add your API keys to `.env.local`

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open**: http://localhost:3000

## 🔑 Environment Variables

Create `.env.local` with:

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8002

# AI Service API Keys (Server-side only - Get them for FREE)
# Groq: https://console.groq.com/
GROQ_API_KEY=your_groq_api_key_here

# Google AI Studio: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
```

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Homepage/Landing
│   ├── learn/             # Main learning interface
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   └── api/               # API routes
│       ├── transcribe/    # Groq transcription
│       └── ai/            # Gemini AI features
├── components/
│   ├── learn/             # Learning components
│   │   ├── ai-summary.tsx
│   │   ├── flashcard-viewer.tsx
│   │   ├── quiz-component.tsx
│   │   ├── ai-tutor-chat.tsx
│   │   └── interactive-transcript.tsx
│   ├── layout/            # Layout components
│   ├── shared/            # Shared components
│   └── ui/                # Shadcn/UI components
├── lib/
│   ├── ai/                # AI integrations
│   │   ├── gemini.ts     # Gemini AI service
│   │   └── config.ts     # AI configuration
│   ├── storage/           # IndexedDB storage
│   └── utils/             # Utility functions
├── stores/                # Zustand state management
│   └── video-store.ts
└── types/                 # TypeScript definitions
    └── index.ts
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.1 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + Shadcn/UI
- **State**: Zustand
- **Storage**: IndexedDB (idb)
- **AI**: Groq SDK, Google Generative AI

## 📦 Key Dependencies

```json
{
  "@google/generative-ai": "^0.24.1",  // Gemini AI
  "groq-sdk": "^0.37.0",                // Groq Whisper
  "next": "16.1.1",                     // Next.js
  "react": "19.2.3",                    // React
  "zustand": "^5.0.9",                  // State management
  "idb": "^8.0.3"                       // IndexedDB wrapper
}
```

## 🧪 Development

### Run dev server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

### Run linter
```bash
npm run lint
```

## 🌐 Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Add environment variables**:
   - `NEXT_PUBLIC_API_URL`
   - `GROQ_API_KEY` (server-side only)
   - `GEMINI_API_KEY` (server-side only)
3. **Deploy**: Automatic on push

### Manual Deployment

```bash
npm run build
npm start
```

## 🔒 Environment Best Practices

- ✅ Never commit `.env.local` to git
- ✅ API keys are server-side only (no `NEXT_PUBLIC_` prefix)
- ✅ Use different API keys for dev/prod
- ✅ Only expose `NEXT_PUBLIC_API_URL` to client
- ✅ Keep all AI keys server-side for security

## 📄 License

Proprietary - All rights reserved
