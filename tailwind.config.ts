import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper:   '#F2EDE0',
        'paper-dark': '#E8E1CE',
        ink:     '#1A1A18',
        red:     '#9C1F1F',
        orange:  '#C06030',
        muted:   '#6B6560',
        'border-subtle': 'rgba(26,26,24,0.10)',
      },
      fontFamily: {
        syne: ['var(--font-syne)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.25em',
        widest3: '0.35em',
      },
      animation: {
        blink: 'blink 1s step-start infinite',
        flicker: 'flicker 6s infinite',
        'scan-line': 'scanLine 3s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        flicker: {
          '0%, 96%, 100%': { opacity: '1' },
          '97%': { opacity: '0.85' },
          '98%': { opacity: '1' },
          '99%': { opacity: '0.9' },
        },
        scanLine: {
          '0%': { top: '-10%' },
          '100%': { top: '110%' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
