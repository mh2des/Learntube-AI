import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';

// Primary heading font - geometric, modern, technical
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

// Body font - clean, professional, highly readable
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFBFC' },
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'LearnTube AI - Transform Videos Into Knowledge',
    template: '%s | LearnTube AI',
  },
  description:
    'Transform YouTube videos into comprehensive study materials with AI. Get transcripts, summaries, flashcards, quizzes, and your own AI tutor.',
  keywords: [
    'AI learning',
    'YouTube study',
    'video transcription',
    'AI tutor',
    'flashcards',
    'study materials',
    'educational AI',
  ],
  authors: [{ name: 'LearnTube AI' }],
  creator: 'LearnTube AI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'LearnTube AI',
    title: 'LearnTube AI - Transform Videos Into Knowledge',
    description:
      'Transform YouTube videos into comprehensive study materials with AI.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LearnTube AI - Transform Videos Into Knowledge',
    description:
      'Transform YouTube videos into comprehensive study materials with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${ibmPlexSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
