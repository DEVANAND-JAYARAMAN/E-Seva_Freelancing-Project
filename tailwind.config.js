/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        darkBg: '#060913',
        darkCard: 'rgba(15, 23, 42, 0.65)',
        darkBorder: 'rgba(255, 255, 255, 0.06)',
        neonCyan: '#06b6d4',
        neonTeal: '#14b8a6',
        neonViolet: '#8b5cf6',
        neonRose: '#f43f5e',
        neonEmerald: '#10b981',
        neonAmber: '#f59e0b',
        neonBlue: '#3b82f6',
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow-cyan': 'glowCyan 3s ease-in-out infinite',
        'glow-violet': 'glowViolet 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        glowCyan: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(6, 182, 212, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(6, 182, 212, 0.5)' },
        },
        glowViolet: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(139, 92, 246, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(139, 92, 246, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}
