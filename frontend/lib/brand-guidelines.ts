/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LEARNTUBE AI — BRAND GUIDELINES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This file contains comprehensive brand guidelines and design principles
 * for maintaining visual consistency across the LearnTube AI platform.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// BRAND IDENTITY
// ─────────────────────────────────────────────────────────────────────────────

export const brandIdentity = {
  name: 'LearnTube AI',
  tagline: 'Transform Videos Into Knowledge',
  mission:
    'Empower learners worldwide by transforming any YouTube video into comprehensive, AI-powered study materials.',
  
  personality: {
    traits: ['Intelligent', 'Trustworthy', 'Efficient', 'Approachable'],
    tone: 'Confident yet approachable, professional yet friendly',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// LOGO USAGE GUIDELINES
// ─────────────────────────────────────────────────────────────────────────────

export const logoGuidelines = {
  /**
   * PRIMARY LOGO
   * The full wordmark with icon — use for main brand presence
   * - Header navigation
   * - Marketing materials
   * - Social media profiles
   */
  primary: {
    file: '/logo.svg',
    minWidth: '120px',
    clearSpace: '1x icon height on all sides',
  },

  /**
   * ICON ONLY
   * The standalone icon mark — use for compact spaces
   * - Favicon
   * - App icons
   * - Small UI elements
   * - Social media avatars
   */
  icon: {
    file: '/icon.svg',
    minSize: '24px',
    clearSpace: '0.5x icon width on all sides',
  },

  /**
   * MONOCHROME VERSION
   * Single-color version for limited color contexts
   * - Print materials
   * - Watermarks
   * - Low-contrast situations
   */
  monochrome: {
    file: '/logo-mono.svg',
    usage: 'When full color is not available',
  },

  // What NOT to do
  restrictions: [
    'Do not stretch or distort the logo',
    'Do not change the logo colors',
    'Do not add effects (shadows, outlines, gradients)',
    'Do not rotate the logo',
    'Do not place on busy backgrounds without sufficient contrast',
    'Do not use the old YouTube icon styling',
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN PRINCIPLES
// ─────────────────────────────────────────────────────────────────────────────

export const designPrinciples = {
  /**
   * 1. CLARITY FIRST
   * Every design decision should prioritize clarity and ease of understanding.
   * Complex information should be broken down into digestible pieces.
   */
  clarityFirst: {
    principle: 'Clarity First',
    description: 'Prioritize clear communication over decoration',
    examples: [
      'Use clear hierarchy in typography',
      'Provide adequate whitespace',
      'Use intuitive iconography',
    ],
  },

  /**
   * 2. PURPOSEFUL MOTION
   * Animation should guide attention and provide feedback, never distract.
   * Keep motion subtle and meaningful.
   */
  purposefulMotion: {
    principle: 'Purposeful Motion',
    description: 'Animation enhances understanding, never distracts',
    examples: [
      'Subtle hover states (scale, shadow)',
      'Smooth page transitions',
      'Loading state feedback',
    ],
    avoid: [
      'Bouncy animations',
      'Excessive spinning',
      'Decorative motion without purpose',
    ],
  },

  /**
   * 3. CONSISTENT PATTERNS
   * Use established patterns throughout the application.
   * Users should always know what to expect.
   */
  consistentPatterns: {
    principle: 'Consistent Patterns',
    description: 'Familiar patterns build trust and reduce cognitive load',
    examples: [
      'Same button styles across all pages',
      'Consistent spacing scale',
      'Predictable navigation',
    ],
  },

  /**
   * 4. PREMIUM QUALITY
   * Every pixel matters. Details create the perception of quality.
   */
  premiumQuality: {
    principle: 'Premium Quality',
    description: 'Attention to detail creates perception of value',
    examples: [
      'Refined shadows and borders',
      'Smooth transitions',
      'Polished micro-interactions',
    ],
  },

  /**
   * 5. ACCESSIBLE BY DEFAULT
   * Design for everyone. Accessibility is not an afterthought.
   */
  accessibleByDefault: {
    principle: 'Accessible By Default',
    description: 'Inclusive design benefits everyone',
    requirements: [
      'Minimum 4.5:1 contrast ratio for text',
      'Visible focus states',
      'Keyboard navigable interfaces',
      'Screen reader compatible',
      'Respect reduced motion preferences',
    ],
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// VOICE & TONE GUIDELINES
// ─────────────────────────────────────────────────────────────────────────────

export const voiceGuidelines = {
  voice: {
    description: 'How we sound as a brand',
    characteristics: [
      'Confident but not arrogant',
      'Helpful and supportive',
      'Clear and concise',
      'Professional yet approachable',
    ],
  },

  tone: {
    contexts: {
      marketing: {
        tone: 'Inspiring and benefit-focused',
        example: 'Transform any video into your personal study guide',
      },
      onboarding: {
        tone: 'Welcoming and encouraging',
        example: "Let's set you up for success",
      },
      error: {
        tone: 'Helpful and reassuring',
        example: "Something went wrong. Let's try that again.",
      },
      success: {
        tone: 'Celebratory but brief',
        example: 'Your flashcards are ready!',
      },
      empty: {
        tone: 'Instructive and motivating',
        example: 'Paste a YouTube URL to start learning',
      },
    },
  },

  writingRules: [
    'Use active voice',
    'Keep sentences short',
    'Lead with benefits, not features',
    'Avoid jargon and buzzwords',
    'Use "you" to address users directly',
    'Be specific, not vague',
  ],

  avoidPhrases: [
    'Revolutionary', 'Cutting-edge', 'Game-changing', // Overpromising
    'Simply', 'Just', 'Easy', // Minimizing complexity
    'Please', // Unnecessary politeness in UI
    'Click here', // Non-descriptive
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// ICONOGRAPHY GUIDELINES
// ─────────────────────────────────────────────────────────────────────────────

export const iconographyGuidelines = {
  library: 'Lucide Icons',
  style: {
    strokeWidth: 1.5, // Slightly thinner for elegance
    lineCap: 'round',
    lineJoin: 'round',
  },
  sizes: {
    xs: 12, // Inline with text
    sm: 16, // Small buttons, badges
    md: 20, // Standard buttons
    lg: 24, // Feature cards, emphasis
    xl: 32, // Hero sections
  },
  usage: [
    'Use consistent sizes within same context',
    'Pair with text for clarity when meaning is ambiguous',
    'Use muted color by default, primary for emphasis',
    'Avoid mixing different icon styles',
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// IMAGERY GUIDELINES
// ─────────────────────────────────────────────────────────────────────────────

export const imageryGuidelines = {
  style: {
    description: 'Abstract, technical, modern',
    characteristics: [
      'Geometric shapes and gradients',
      'Layered glass effects',
      'Subtle grid patterns',
      'Dark mode optimized',
    ],
  },

  avoid: [
    'Stock photos with people',
    'Cutesy or cartoonish illustrations',
    'Cluttered compositions',
    'Low-quality or pixelated images',
  ],

  usage: {
    hero: 'Abstract gradients or UI mockups',
    features: 'Icons and geometric shapes',
    backgrounds: 'Subtle gradients, blur effects',
    empty: 'Minimal line illustrations',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT PATTERNS
// ─────────────────────────────────────────────────────────────────────────────

export const componentPatterns = {
  buttons: {
    variants: {
      primary: 'Main CTAs, submit actions',
      secondary: 'Secondary actions, cancel',
      outline: 'Alternative actions, less emphasis',
      ghost: 'Subtle actions, icon buttons',
      destructive: 'Delete, remove actions',
    },
    sizing: {
      sm: 'Compact spaces, tables',
      default: 'Most use cases',
      lg: 'Hero CTAs, important actions',
      xl: 'Landing page primary CTAs',
    },
    rules: [
      'One primary action per view',
      'Use loading states for async actions',
      'Disable during processing',
      'Provide hover/focus feedback',
    ],
  },

  cards: {
    variants: {
      default: 'Standard content containers',
      interactive: 'Clickable cards with hover effects',
      glass: 'Overlay cards, modals',
    },
    rules: [
      'Consistent padding (24px)',
      'Clear visual hierarchy',
      'Rounded corners (16px)',
      'Subtle border, not heavy shadows',
    ],
  },

  forms: {
    layout: 'Single column, top-aligned labels',
    spacing: '24px between field groups',
    validation: 'Inline, below input',
    rules: [
      'Clear, descriptive labels',
      'Helpful placeholder text',
      'Real-time validation feedback',
      'Accessible error messages',
    ],
  },

  modals: {
    width: {
      sm: '400px',
      md: '500px',
      lg: '640px',
    },
    rules: [
      'Clear title and purpose',
      'Backdrop blur for focus',
      'Close on escape/backdrop click',
      'Trap focus within modal',
    ],
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSIVE DESIGN
// ─────────────────────────────────────────────────────────────────────────────

export const responsiveGuidelines = {
  breakpoints: {
    sm: '640px', // Small tablets, large phones
    md: '768px', // Tablets
    lg: '1024px', // Small laptops
    xl: '1280px', // Desktops
    '2xl': '1536px', // Large screens
  },

  approach: 'Mobile-first',

  rules: [
    'Design for mobile first, then enhance',
    'Test on real devices, not just simulators',
    'Use fluid typography where appropriate',
    'Stack elements vertically on mobile',
    'Increase touch targets for mobile (44px min)',
  ],

  typography: {
    mobile: {
      h1: '2.25rem', // 36px
      h2: '1.875rem', // 30px
      body: '1rem', // 16px
    },
    desktop: {
      h1: '3.75rem', // 60px
      h2: '2.25rem', // 36px
      body: '1rem', // 16px
    },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const brandGuidelines = {
  identity: brandIdentity,
  logo: logoGuidelines,
  principles: designPrinciples,
  voice: voiceGuidelines,
  iconography: iconographyGuidelines,
  imagery: imageryGuidelines,
  components: componentPatterns,
  responsive: responsiveGuidelines,
} as const;

export type BrandGuidelines = typeof brandGuidelines;

export default brandGuidelines;
