/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF9F6',
        primary: '#7EB8A2',
        coral: '#F4A261',
        text: '#2D3436',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        xl2: '1rem',
        xl3: '1.5rem',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          '"Noto Sans SC"',
          '"Segoe UI"',
          'sans-serif',
        ],
      },
      keyframes: {
        modalBackdropIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        modalPanelIn: {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        'modal-backdrop': 'modalBackdropIn 0.2s ease-out forwards',
        'modal-panel': 'modalPanelIn 0.22s ease-out forwards',
      },
    },
  },
  plugins: [],
}

