/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg:       '#111116',
          sidebar:  '#16161C',
          surface:  '#1C1C24',
          border:   '#2A2A35',
          hover:    '#22222E',
          accent:   '#5E6AD2',
          'accent-hover': '#4F5BBF',
        },
        ink: {
          primary:   '#E8E8F0',
          secondary: '#9191A4',
          muted:     '#5A5A6E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
