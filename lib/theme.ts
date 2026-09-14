export const palette = {
  ink900: '#0B1220',
  ink800: '#172554',
  ink700: '#1E3A8A',
  slate600: '#475569',
  slate400: '#94A3B8',
  slate200: '#E2E8F0',
  bg: '#F8FAFC',
  bgDark: '#0B1220',
  surface: '#FFFFFF',
  surfaceDark: '#111827',
  action: '#2563EB',
  actionDark: '#3B82F6',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  white: '#FFFFFF',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 16, lg: 20, xl: 24, pill: 999 } as const;

export const typography = {
  hook: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 23 },
  eyebrow: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.6 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 20, fontWeight: '700' as const, lineHeight: 26 },
};

export type ThemeMode = 'light' | 'dark';

export function getTheme(mode: ThemeMode) {
  const isDark = mode === 'dark';
  return {
    mode,
    colors: {
      background: isDark ? palette.bgDark : palette.bg,
      surface: isDark ? palette.surfaceDark : palette.surface,
      textPrimary: isDark ? palette.white : palette.ink900,
      textSecondary: isDark ? palette.slate400 : palette.slate600,
      border: isDark ? '#1F2937' : palette.slate200,
      action: isDark ? palette.actionDark : palette.action,
      success: palette.success,
      warning: palette.warning,
      error: palette.error,
      cardBackground: isDark ? '#0F172A' : palette.ink800,
      cardText: palette.white,
    },
    spacing,
    radius,
    typography,
  };
}

export type Theme = ReturnType<typeof getTheme>;
