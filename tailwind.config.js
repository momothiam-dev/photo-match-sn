/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1a2c4a',
          blue: '#0066cc',
          gold: '#ffa500',
          light: '#e8f4f8',
        },
      },
      fontFamily: {
        display: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
