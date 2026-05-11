import { Platform } from 'react-native';

// ─── Colors ───────────────────────────────────────────────────────────────────

export const colors = {
  // Primary brand — calm blue
  primary: {
    50:  '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Expense — calm red
  expense: {
    50:  '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },

  // Income — calm green
  income: {
    50:  '#F0FDF4',
    100: '#DCFCE7',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
  },

  // Warning / savings
  amber: {
    50:  '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },

  // Neutral
  gray: {
    50:  '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Category colors (used in chips and charts)
  category: {
    food:          '#D97706',
    transport:     '#2563EB',
    shopping:      '#9333EA',
    entertainment: '#DB2777',
    health:        '#DC2626',
    education:     '#0891B2',
    housing:       '#059669',
    bills:         '#CA8A04',
    savings:       '#16A34A',
    salary:        '#16A34A',
    freelance:     '#0891B2',
    gift:          '#D97706',
    other:         '#6B7280',
  },

  // Semantic
  white:        '#FFFFFF',
  black:        '#000000',
  transparent:  'transparent',

  background: {
    app:    '#F8FAFC',
    card:   '#FFFFFF',
    input:  '#F1F5F9',
    subtle: '#EFF6FF',
  },

  text: {
    primary:   '#0F172A',
    secondary: '#475569',
    tertiary:  '#94A3B8',
    inverse:   '#FFFFFF',
    link:      '#2563EB',
  },

  border: {
    default: '#E2E8F0',
    subtle:  '#F1F5F9',
    focus:   '#2563EB',
  },

  // Hero card gradient
  hero: {
    from: '#2563EB',
    to:   '#1D4ED8',
  },
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const typography = {
  fonts: {
    regular: 'Tajawal_400Regular',
    medium:  'Tajawal_500Medium',
    bold:    'Tajawal_700Bold',
  },

  sizes: {
    xs:   11,
    sm:   13,
    base: 15,
    md:   17,
    lg:   20,
    xl:   24,
    '2xl': 28,
    '3xl': 34,
    '4xl': 42,
  },

  lineHeights: {
    tight:  1.2,
    normal: 1.5,
    loose:  1.8,
  },
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const spacing = {
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  8:  32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  full: 9999,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    android: { elevation: 2 },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 4 },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.10,
      shadowRadius: 20,
    },
    android: { elevation: 8 },
  }),
} as const;

// ─── Animation Presets ────────────────────────────────────────────────────────

export const animations = {
  // Spring configs (for Reanimated withSpring)
  spring: {
    gentle: { damping: 20, stiffness: 120, mass: 0.8 },
    bouncy: { damping: 14, stiffness: 160, mass: 0.8 },
    snappy: { damping: 24, stiffness: 200, mass: 0.6 },
  },

  // Duration in ms (for timing-based animations)
  duration: {
    fast:   150,
    normal: 250,
    slow:   400,
  },

  // Moti transition presets
  moti: {
    fade: {
      from: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { type: 'timing', duration: 250 },
    },
    slideUp: {
      from: { opacity: 0, translateY: 20 },
      animate: { opacity: 1, translateY: 0 },
      transition: { type: 'spring', damping: 20, stiffness: 120 },
    },
    scale: {
      from: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { type: 'spring', damping: 20, stiffness: 180 },
    },
  },
} as const;

// ─── Layout ───────────────────────────────────────────────────────────────────

export const layout = {
  screenPadding:     spacing[4],
  cardBorderRadius:  radius.lg,
  bottomNavHeight:   60,
  statusBarHeight:   0, // set dynamically via SafeAreaInsets
  heroBorderRadius:  radius.xl,
} as const;

// ─── Export unified theme ─────────────────────────────────────────────────────

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  animations,
  layout,
} as const;

export type Theme = typeof theme;
