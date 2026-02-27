/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: 'var(--font-sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
        serif: 'var(--font-serif, ui-serif, Georgia, "Playfair Display", serif)',
        mono: 'var(--font-mono, ui-monospace, "Cascadia Code", "Source Code Pro", monospace)',
      },
    },
  },
  plugins: [],
}
