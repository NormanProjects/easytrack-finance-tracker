/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A1628',
          light: '#1A2942',
        },
        accent: {
          DEFAULT: '#00FF94',
          dark: '#00CC76',
        },
      },
    },
  },
  plugins: [],
}