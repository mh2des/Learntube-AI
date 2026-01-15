/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LEARNTUBE AI — DESIGN SYSTEM CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This file serves as the single source of truth for all design tokens.
 * Import from here when you need programmatic access to design values
 * (e.g., for charts, canvas, or dynamic styling).
 *
 * CSS variables should be preferred for component styling.
 * Use these exports for JavaScript/TypeScript logic only.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────────────────────────────────────

export const colors = {
  // Light mode
  light: {
    background: '#FAFBFC',
    backgroundSecondary: '#F7F4F4',
    foreground: '#0F1419',
    card: '#FFFFFF',
    cardForeground: '#0F1419',
    primary: '#DC2626',
    primaryHover: '#B91C1C',
    primaryForeground: '#FFFFFF',
    secondary: '#F5F0F0',
    secondaryHover: '#EBE4E4',
    secondaryForeground: '#1A1D21',
    muted: '#F7F4F4',
    mutedForeground: '#6B7280',
    accent: '#DC2626',
    accentForeground: '#FFFFFF',
    destructive: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    border: 'rgba(0, 0, 0, 0.08)',
    borderStrong: 'rgba(0, 0, 0, 0.12)',
  },

  // Dark mode
  dark: {
    background: '#09090B',
    backgroundSecondary: '#0F0F12',
    foreground: '#FAFAFA',
    card: '#111114',
    cardForeground: '#FAFAFA',
    primary: '#EF4444',
    primaryHover: '#F87171',
    primaryForeground: '#FFFFFF',
    secondary: '#1F1F23',
    secondaryHover: '#27272A',
    secondaryForeground: '#FAFAFA',
    muted: '#1F1F23',
    mutedForeground: '#71717A',
    accent: '#EF4444',
    accentForeground: '#FFFFFF',
    destructive: '#EF4444',
    success: '#22C55E',
    warning: '#EAB308',
    info: '#60A5FA',
    border: 'rgba(255, 255, 255, 0.06)',
    borderStrong: 'rgba(255, 255, 255, 0.10)',
  },

  // Chart colors (consistent across modes)
  chart: {
    blue: '#3B82F6',
    green: '#22C55E',
    yellow: '#EAB308',
    purple: '#A855F7',
    pink: '#EC4899',
    cyan: '#06B6D4',
    orange: '#F97316',
    red: '#EF4444',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// TYPOGRAPHY
// ─────────────────────────────────────────────────────────────────────────────

export const typography = {
  fonts: {
    heading: "'Space Grotesk', system-ui, sans-serif",
    body: "'IBM Plex Sans', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  },

  sizes: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem', // 72px
  },

  lineHeights: {
    none: 1,
    tight: 1.15,
    snug: 1.3,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  letterSpacing: {
    tighter: '-0.03em',
    tight: '-0.015em',
    normal: '0',
    wide: '0.015em',
    wider: '0.03em',
  },

  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SPACING
// ─────────────────────────────────────────────────────────────────────────────

export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  32: '8rem', // 128px
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// BORDER RADIUS
// ─────────────────────────────────────────────────────────────────────────────

export const radius = {
  none: '0',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  full: '9999px',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SHADOWS
// ─────────────────────────────────────────────────────────────────────────────

export const shadows = {
  light: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
    sm: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.16), 0 8px 16px rgba(0, 0, 0, 0.08)',
    '2xl': '0 24px 64px rgba(0, 0, 0, 0.20), 0 12px 24px rgba(0, 0, 0, 0.10)',
  },
  dark: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.2)',
    sm: '0 2px 8px rgba(0, 0, 0, 0.3), 0 0 1px rgba(255, 255, 255, 0.05)',
    md: '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.05)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.05)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.05)',
    '2xl': '0 24px 64px rgba(0, 0, 0, 0.7), 0 0 1px rgba(255, 255, 255, 0.05)',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// MOTION / ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

export const motion = {
  easing: {
    out: 'cubic-bezier(0.33, 1, 0.68, 1)',
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  duration: {
    instant: 100,
    fast: 150,
    normal: 200,
    slow: 300,
    slower: 400,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// BREAKPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Z-INDEX
// ─────────────────────────────────────────────────────────────────────────────

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
  max: 9999,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

export const layout = {
  maxWidth: {
    narrow: '960px',
    default: '1280px',
    wide: '1440px',
  },
  containerPadding: {
    mobile: '16px',
    tablet: '24px',
    desktop: '32px',
  },
  headerHeight: '64px',
  sectionSpacing: {
    mobile: '72px',
    tablet: '96px',
    desktop: '128px',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// BRAND
// ─────────────────────────────────────────────────────────────────────────────

export const brand = {
  name: 'LearnTube AI',
  tagline: 'Transform Videos Into Knowledge',
  description:
    'AI-powered learning platform that transforms YouTube videos into comprehensive study materials.',

  // Logo usage guidelines
  logo: {
    primary: '/logo.svg',
    monochrome: '/logo-mono.svg',
    icon: '/icon.svg',
    favicon: '/favicon.ico',
    clearSpace: '1x', // Use x-height as minimum clear space
  },

  // Voice & tone
  voice: {
    tone: 'confident, concise, benefit-forward',
    avoid: 'hype, jargon, excessive enthusiasm',
    style: 'professional yet approachable',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT DEFAULTS
// ─────────────────────────────────────────────────────────────────────────────

export const componentDefaults = {
  button: {
    borderRadius: radius.md,
    paddingX: spacing[4],
    paddingY: spacing[2],
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    transition: `all ${motion.duration.normal}ms ${motion.easing.out}`,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing[6],
    border: '1px solid var(--border)',
  },
  input: {
    borderRadius: radius.md,
    paddingX: spacing[3],
    paddingY: spacing[2],
    fontSize: typography.sizes.sm,
    border: '1px solid var(--border)',
  },
  badge: {
    borderRadius: radius.full,
    paddingX: spacing[3],
    paddingY: spacing[1],
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// THEME EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  motion,
  breakpoints,
  zIndex,
  layout,
  brand,
  componentDefaults,
} as const;

export type Theme = typeof theme;
export type Colors = typeof colors;
export type ColorMode = 'light' | 'dark';

export default theme;
