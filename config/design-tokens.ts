export const spacing = {
  '0': '0',
  px: '1px',
  '0.5': '0.125rem',
  '1': '0.25rem',
  '1.5': '0.375rem',
  '2': '0.5rem',
  '2.5': '0.625rem',
  '3': '0.75rem',
  '3.5': '0.875rem',
  '4': '1rem',
  '5': '1.25rem',
  '6': '1.5rem',
  '7': '1.75rem',
  '8': '2rem',
  '9': '2.25rem',
  '10': '2.5rem',
  '11': '2.75rem',
  '12': '3rem',
  '14': '3.5rem',
  '16': '4rem',
  '20': '5rem',
  '24': '6rem',
  '28': '7rem',
  '32': '8rem',
  '36': '9rem',
  '40': '10rem',
  '44': '11rem',
  '48': '12rem',
  '52': '13rem',
  '56': '14rem',
  '60': '15rem',
  '64': '16rem',
  '72': '18rem',
  '80': '20rem',
  '96': '24rem',
}

export const colors = {
  // New 2025 color palette with enhanced accessibility
  primary: {
    50: 'hsl(230, 100%, 97%)',
    100: 'hsl(230, 95%, 94%)',
    200: 'hsl(230, 90%, 88%)',
    300: 'hsl(230, 85%, 80%)',
    400: 'hsl(230, 80%, 65%)',
    500: 'hsl(230, 75%, 55%)',
    600: 'hsl(230, 70%, 45%)',
    700: 'hsl(230, 65%, 40%)',
    800: 'hsl(230, 60%, 30%)',
    900: 'hsl(230, 55%, 25%)',
    950: 'hsl(230, 50%, 15%)',
  },
  secondary: {
    50: 'hsl(260, 100%, 97%)',
    100: 'hsl(260, 95%, 94%)',
    200: 'hsl(260, 90%, 88%)',
    300: 'hsl(260, 85%, 80%)',
    400: 'hsl(260, 80%, 65%)',
    500: 'hsl(260, 75%, 55%)',
    600: 'hsl(260, 70%, 45%)',
    700: 'hsl(260, 65%, 40%)',
    800: 'hsl(260, 60%, 30%)',
    900: 'hsl(260, 55%, 25%)',
    950: 'hsl(260, 50%, 15%)',
  },
  accent: {
    50: 'hsl(150, 100%, 97%)',
    100: 'hsl(150, 95%, 94%)',
    200: 'hsl(150, 90%, 88%)',
    300: 'hsl(150, 85%, 80%)',
    400: 'hsl(150, 80%, 65%)',
    500: 'hsl(150, 75%, 55%)',
    600: 'hsl(150, 70%, 45%)',
    700: 'hsl(150, 65%, 40%)',
    800: 'hsl(150, 60%, 30%)',
    900: 'hsl(150, 55%, 25%)',
    950: 'hsl(150, 50%, 15%)',
  },
  gray: {
    50: 'hsl(220, 20%, 98%)',
    100: 'hsl(220, 15%, 95%)',
    200: 'hsl(220, 15%, 91%)',
    300: 'hsl(220, 10%, 85%)',
    400: 'hsl(220, 10%, 70%)',
    500: 'hsl(220, 10%, 50%)',
    600: 'hsl(220, 10%, 40%)',
    700: 'hsl(220, 15%, 30%)',
    800: 'hsl(220, 20%, 20%)',
    900: 'hsl(220, 25%, 15%)',
    950: 'hsl(220, 30%, 10%)',
  },
  success: {
    50: 'hsl(145, 80%, 97%)',
    100: 'hsl(145, 75%, 94%)',
    500: 'hsl(145, 70%, 50%)',
    600: 'hsl(145, 65%, 40%)',
    700: 'hsl(145, 60%, 35%)',
  },
  warning: {
    50: 'hsl(45, 100%, 96%)',
    100: 'hsl(45, 90%, 92%)',
    500: 'hsl(45, 80%, 50%)',
    600: 'hsl(45, 70%, 45%)',
    700: 'hsl(45, 60%, 35%)',
  },
  error: {
    50: 'hsl(0, 100%, 97%)',
    100: 'hsl(0, 90%, 95%)',
    500: 'hsl(0, 80%, 55%)',
    600: 'hsl(0, 70%, 45%)',
    700: 'hsl(0, 60%, 35%)',
  },
  info: {
    50: 'hsl(200, 100%, 97%)',
    100: 'hsl(200, 90%, 95%)',
    500: 'hsl(200, 80%, 55%)',
    600: 'hsl(200, 70%, 45%)',
    700: 'hsl(200, 60%, 35%)',
  },
}

export const typography = {
  fontFamily: {
    sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
    serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
    mono: ['var(--font-mono)', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
    '7xl': ['4.5rem', { lineHeight: '1' }],
    '8xl': ['6rem', { lineHeight: '1' }],
    '9xl': ['8rem', { lineHeight: '1' }],
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
}

export const animation = {
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
}

export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  default: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
}

export const elevation = {
  0: 'none',
  1: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  2: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  3: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  4: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  5: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
}

// Responsive breakpoints using container queries
export const containerQueries = {
  sm: '(min-width: 320px)',
  md: '(min-width: 480px)',
  lg: '(min-width: 640px)',
  xl: '(min-width: 768px)',
  '2xl': '(min-width: 1024px)',
}

// Media queries for responsive design
export const mediaQueries = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
}

// 2025 modern effects for polish
export const effects = {
  glassmorphism: {
    light: 'backdrop-filter: blur(8px); background: rgba(255, 255, 255, 0.7);',
    dark: 'backdrop-filter: blur(8px); background: rgba(0, 0, 0, 0.7);',
  },
  textGradient: {
    primary: 'background: linear-gradient(90deg, var(--primary-500) 0%, var(--primary-700) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;',
    accent: 'background: linear-gradient(90deg, var(--accent-500) 0%, var(--accent-700) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;',
  }
} 