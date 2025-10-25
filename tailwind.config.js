/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background-color)',
        'text-primary': 'var(--text-primary-color)',
        'text-secondary': 'var(--text-secondary-color)',
        'brand-primary': 'var(--brand-primary)',
        'brand-secondary': 'var(--brand-secondary)',
        'primary-foreground': 'var(--primary-foreground)',
        'muted-background': 'var(--muted-background)',
        'muted-hover-background': 'var(--muted-hover-background)',
        border: 'var(--border-color)',
        'card-background': 'var(--card-background)',
        'card-border': 'var(--card-border)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif']
      }
    },
  },
  plugins: [],
}
