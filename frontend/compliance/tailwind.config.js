/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#251c1a',
        secondary: '#ede7db',
        white: '#ffffff',
      },
    },
  },
  plugins: [],
};
