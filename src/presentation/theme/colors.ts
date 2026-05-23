/**
 * App color palette
 */
export const colors = {
  // Primary colors
  primary: '#00A86B', // Tennis court green
  primaryDark: '#008C5A',
  primaryLight: '#33B885',

  // Secondary colors
  secondary: '#FFD700', // Tennis ball yellow
  secondaryDark: '#E6C200',
  secondaryLight: '#FFE033',

  // Neutral colors
  black: '#000000',
  white: '#FFFFFF',
  gray900: '#1a1a1a',
  gray800: '#2d2d2d',
  gray700: '#404040',
  gray600: '#525252',
  gray500: '#737373',
  gray400: '#a3a3a3',
  gray300: '#d4d4d4',
  gray200: '#e5e5e5',
  gray100: '#f5f5f5',

  // Semantic colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Decision colors
  inBall: '#10B981',
  outBall: '#EF4444',
  uncertainBall: '#F59E0B',

  // Background
  background: '#000000',
  backgroundLight: '#1a1a1a',
  surface: '#2d2d2d',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#a3a3a3',
  textDisabled: '#525252',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayHeavy: 'rgba(0, 0, 0, 0.7)',
} as const;

export type Colors = typeof colors;
