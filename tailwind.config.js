/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        industrial: {
          accent: '#2563eb',
          panel: '#f3f4f6',
          border: '#d1d5db',
        },
      },
    },
  },
  plugins: [],
}
