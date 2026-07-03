import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        honey: {
          50: '#FFF9EB',
          100: '#FEF0C7',
          200: '#FDDF8A',
          300: '#FCC94D',
          400: '#FBB424',
          500: '#F59F0B',
          600: '#D97C06',
          700: '#B45909',
          800: '#92440E',
          900: '#78380F',
          950: '#451C03',
        },
        hive: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
          950: '#0F0D0C',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        display: [
          'ui-sans-serif',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 3px rgba(28,25,23,0.06), 0 8px 24px rgba(28,25,23,0.08)',
        lift: '0 2px 6px rgba(28,25,23,0.08), 0 16px 40px rgba(28,25,23,0.14)',
      },
    },
  },
  plugins: [],
}

export default config
