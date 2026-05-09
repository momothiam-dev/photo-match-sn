/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          navy: {
            DEFAULT: '#0f172a',
            light: '#1e293b',
          },
          blue: {
            DEFAULT: '#2563eb',
            light: '#60a5fa',
            dark: '#1d4ed8',
          },
          gold: {
            DEFAULT: '#fbbf24',
            light: '#fde68a',
          },
          surface: {
            DEFAULT: '#ffffff',
            dark: '#0f172a',
          },
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
        'premium-hover': '0 20px 60px -15px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
