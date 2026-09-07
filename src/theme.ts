export const palette = {
  forest: '#1F3D2B',
  forestDark: '#152A1E',
  moss: '#3E6B4A',
  sage: '#8FA98F',
  bark: '#6B4F3A',
  amber: '#C9832B',
  cranberry: '#A33B32',
  bone: '#F6F4EF',
  paper: '#FFFFFF',
  ink: '#1A1D1A',
  inkMuted: '#5C635C',
  line: '#E2DFD6',
} as const;

export type ThemeColors = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  accent: string;
  danger: string;
  border: string;
  tabInactive: string;
};

export const colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    bg: palette.bone,
    surface: palette.paper,
    surfaceAlt: '#EFEDE5',
    text: palette.ink,
    textMuted: palette.inkMuted,
    primary: palette.forest,
    primaryText: '#FFFFFF',
    accent: palette.amber,
    danger: palette.cranberry,
    border: palette.line,
    tabInactive: '#9AA09A',
  },
  dark: {
    bg: '#101410',
    surface: '#1A201A',
    surfaceAlt: '#232A23',
    text: '#F1F0EA',
    textMuted: '#A7ADA5',
    primary: '#6FA97C',
    primaryText: '#0E140F',
    accent: '#E0A24A',
    danger: '#E0736A',
    border: '#2E362E',
    tabInactive: '#6E766D',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;
