'use client';

import Link from 'next/link';
import {
  GraduationCap,
  Brain,
  Languages,
  Sparkles,
  BookOpen,
  MessageSquare,
  ArrowRight,
  Check,
  Play,
  Zap,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const features = [
  {
    title: 'AI Transcription',
    description:
      'Instant, accurate transcripts powered by Whisper AI — completely free and unlimited.',
    icon: BookOpen,
  },
  {
    title: 'Smart Summaries',
    description:
      'Key takeaways and chapter breakdowns to help you grasp concepts faster.',
    icon: Brain,
  },
  {
    title: 'Flashcards & Quizzes',
    description:
      'Auto-generated study materials that adapt to reinforce your learning.',
    icon: GraduationCap,
  },
  {
    title: 'AI Tutor Chat',
    description:
      'Ask questions about the video content and get instant, contextual answers.',
    icon: MessageSquare,
  },
  {
    title: 'Translation',
    description:
      'Translate transcripts to 25+ languages with full context awareness.',
    icon: Languages,
  },
  {
    title: 'Study Guides',
    description:
      'Comprehensive guides with definitions, key concepts, and structured notes.',
    icon: Sparkles,
  },
];

const steps = [
  {
    step: '01',
    title: 'Paste URL',
    description: 'Copy any YouTube video link and paste it into LearnTube AI.',
  },
  {
    step: '02',
    title: 'AI Analysis',
    description: 'Our AI transcribes and analyzes the content in seconds.',
  },
  {
    step: '03',
    title: 'Start Learning',
    description: 'Access summaries, flashcards, quizzes, and your AI tutor.',
  },
];

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Perfect for exploring LearnTube AI',
    features: [
      '5 videos per month',
      'AI transcription',
      'Basic summaries',
      'Flashcards & quizzes',
      'Translation (25+ languages)',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'For serious learners who want it all',
    features: [
      'Unlimited videos',
      'Everything in Free',
      'AI Tutor chat',
      'Study guides',
      'Academic citations',
      'Learning analytics',
      'Priority support',
    ],
    cta: 'Get Pro',
    popular: true,
  },
];

const stats = [
  { value: '50K+', label: 'Active Learners' },
  { value: '1M+', label: 'Videos Processed' },
  { value: '4.9', label: 'User Rating' },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
      {children}
    </div>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const Icon = feature.icon;
  return (
    <Card
      className={`group card-interactive opacity-0 animate-fade-in-up stagger-${index + 1}`}
    >
      <CardHeader>
        <div className="w-12 h-12 rounded-[14px] bg-primary/10 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>{feature.title}</CardTitle>
        <CardDescription>{feature.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function StepCard({
  step,
  index,
}: {
  step: (typeof steps)[0];
  index: number;
}) {
  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Connector line */}
      {index < steps.length - 1 && (
        <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-border to-transparent" />
      )}

      {/* Step number */}
      <div className="relative z-10 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold mb-6 shadow-lg shadow-primary/25">
        {step.step}
      </div>

      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
      <p className="text-muted-foreground max-w-xs">{step.description}</p>
    </div>
  );
}

function PricingCard({ tier }: { tier: (typeof pricingTiers)[0] }) {
  return (
    <Card
      className={`relative flex flex-col ${
        tier.popular
          ? 'border-primary/50 shadow-lg shadow-primary/10 scale-[1.02]'
          : ''
      }`}
    >
      {tier.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <Badge>
            <Sparkles className="w-3.5 h-3.5" />
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">{tier.name}</CardTitle>
        <div className="mt-4 flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold tracking-tight">{tier.price}</span>
          {tier.period && (
            <span className="text-muted-foreground text-sm">{tier.period}</span>
          )}
        </div>
        <CardDescription className="mt-2">{tier.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <ul className="space-y-3 flex-1">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <Link href="/learn" className="mt-8 block">
          <Button
            className="w-full"
            variant={tier.popular ? 'default' : 'outline'}
            size="lg"
          >
            {tier.cta}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="relative">
      {/* Background gradient orb */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="section relative">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="animate-fade-in-down">
              <Badge>
                <Zap className="w-3.5 h-3.5" />
                AI-Powered Learning Platform
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] animate-fade-in-up">
              Transform Videos Into{' '}
              <span className="text-gradient">Knowledge</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
              Turn any YouTube video into comprehensive study materials with AI.
              Transcripts, summaries, flashcards, quizzes — and your own AI
              tutor.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-3">
              <Button asChild size="xl" className="gap-2">
                <Link href="/learn">
                  <Play className="w-4 h-4" />
                  Start Learning Free
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="gap-2">
                <Link href="#features">
                  Explore Features
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Trust signals */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground animate-fade-in stagger-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-success" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-success" />
                <span>Setup in 30 seconds</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up stagger-5">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FEATURES SECTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <section id="features" className="section-sm bg-background-secondary/50">
        <div className="container">
          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge>
              <Sparkles className="w-3.5 h-3.5" />
              Features
            </Badge>
            <h2 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight">
              Everything You Need to Learn Effectively
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powered by advanced AI to transform YouTube into your personal
              learning platform.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          HOW IT WORKS SECTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="section-sm">
        <div className="container">
          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge>
              <Zap className="w-3.5 h-3.5" />
              How It Works
            </Badge>
            <h2 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight">
              Start Learning in 3 Simple Steps
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From YouTube URL to comprehensive study materials in seconds.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <StepCard key={step.step} step={step} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PRICING SECTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="section-sm bg-background-secondary/50">
        <div className="container">
          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge>
              <Shield className="w-3.5 h-3.5" />
              Pricing
            </Badge>
            <h2 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free, upgrade when you need more. No hidden fees.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {pricingTiers.map((tier) => (
              <PricingCard key={tier.name} tier={tier} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FINAL CTA SECTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="section-sm">
        <div className="container">
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />

            <CardContent className="py-16 px-8 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Ready to Transform Your Learning?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                Join thousands of students learning faster with AI-powered study
                materials.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="xl" className="gap-2">
                  <Link href="/learn">
                    <Sparkles className="w-4 h-4" />
                    Get Started Free
                  </Link>
                </Button>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                No credit card required • Free forever plan available
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer spacing */}
      <div className="h-16" />
    </div>
  );
}
