/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0A1628',
          'navy-light': '#1A2942',
          green: '#00FF94',
          'green-dark': '#00CC75',
          'green-light': '#33FFAA',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#94A3B8',
          muted: '#64748B',
        }
      },
    },
  },
  plugins: [],
}

