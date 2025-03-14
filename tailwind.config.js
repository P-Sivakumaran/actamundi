/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#1a1a1a',
        secondary: '#666666',
        accent: '#c4a484',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#1a1a1a',
            a: {
              color: '#1a1a1a',
              '&:hover': {
                color: '#c4a484',
              },
            },
            h1: {
              color: '#1a1a1a',
            },
            h2: {
              color: '#1a1a1a',
            },
            h3: {
              color: '#1a1a1a',
            },
            h4: {
              color: '#1a1a1a',
            },
            strong: {
              color: '#1a1a1a',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 