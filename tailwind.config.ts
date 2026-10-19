import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default <Partial<Config>>{
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '"Geist"', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', '"PingFang SC"', '"Microsoft YaHei"', '"Noto Sans SC"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', '"Liberation Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f7f3',
          100: '#dceddf',
          200: '#bedfc9',
          300: '#91cab6',
          400: '#5eac8d',
          500: '#348c6e',
          600: '#176b58',
          700: '#195644',
          800: '#194639',
          900: '#173a30',
        },
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .5s ease both',
      },
    },
  },
  plugins: [typography],
}
