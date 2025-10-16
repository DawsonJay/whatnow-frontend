/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dusky Rose Palette
        'dusky-rose': '#D9BCAF',
        'thistle': '#8A9688', 
        'hawthorne-green': '#283D3B',
        'royal-scepter': '#795663',
        'blue-noir': '#011627',
      }
    },
  },
  plugins: [],
}



