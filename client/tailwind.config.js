export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6fa',
          100: '#d9ecf3',
          200: '#b8d9e6',
          300: '#8bc1d5',
          400: '#4fa3bf',
          500: '#2687a5',
          600: '#0e7490',
          700: '#0b5f77',
          800: '#0d4b60',
          900: '#123a4b',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f5f8fa',
        },
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '12px',
        xl: '20px',
        '2xl': '20px',
        '3xl': '20px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(22, 40, 58, 0.05)',
        elevated: '0 4px 14px rgba(22, 40, 58, 0.07)',
        glow: '0 4px 14px rgba(14, 116, 144, 0.12)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0e7490 0%, #0e7490 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, #eef6fa 0%, #eef6fa 100%)',
      },
    },
  },
  plugins: [],
};
