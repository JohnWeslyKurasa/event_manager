/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Natural Base & Backgrounds (Warm Cream & Linen)
        cream: {
          50:  '#FDFBF7',   // Primary canvas / page background
          100: '#F7F4EE',   // Card surfaces / muted backgrounds
          200: '#EFEAE1',   // Borders & subtle dividers
          300: '#E3DACD',   // Hover states for light cards
          400: '#D5C8B5',   // Decorative accent
          500: '#B8A68F',   // Muted warm tone
        },
        // Muted Sage Greens — Primary Brand Identity
        sage: {
          50:  '#F4F6F4',
          100: '#E3E8E3',
          200: '#C7D2C7',
          300: '#A4B5A4',
          400: '#839A83',
          500: '#647D64',   // Base accent
          600: '#4E644E',   // Primary brand / buttons
          700: '#3D4F3D',   // Hover / dark accent
          800: '#2F3C2F',
          900: '#212A21',
          950: '#141A14',
        },
        // Warm Earth / Botanical Neutrals — Text & Contrast
        botanical: {
          100: '#F0EFEA',
          200: '#E2E0D8',
          300: '#C4C1B5',
          400: '#8E8A7D',
          500: '#6B685C',   // Secondary / caption text
          600: '#524F45',
          700: '#3A3831',   // Body text (warm charcoal)
          800: '#2C2B25',
          900: '#22211C',   // Headings / max contrast
          950: '#161512',
        },
        // Warm Sand Gold — VIP / Featured / Highlight Accents
        sand: {
          50:  '#FDFBF5',
          100: '#FAF6E8',
          200: '#F2E8C9',
          300: '#E4D3A1',
          400: '#D5BC7E',
          500: '#C2A368',
          600: '#A6874E',
          700: '#846939',
          800: '#6B5330',
        },
        // Legacy brand alias for backward compatibility
        brand: {
          50:  '#F4F6F4',
          100: '#E3E8E3',
          200: '#C7D2C7',
          300: '#A4B5A4',
          400: '#839A83',
          500: '#647D64',
          600: '#4E644E',
          700: '#3D4F3D',
          800: '#2F3C2F',
          900: '#212A21',
          950: '#141A14',
        }
      },
      fontFamily: {
        serif:   ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans:    ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Cormorant Garamond', 'serif'],
        body:    ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        // Soft botanical shadows
        'soft':          '0 1px 3px rgba(58, 56, 49, 0.04), 0 4px 16px -2px rgba(100, 125, 100, 0.06)',
        'soft-natural':  '0 1px 3px rgba(58, 56, 49, 0.04), 0 4px 20px -2px rgba(100, 125, 100, 0.07)',
        'elevated-natural': '0 2px 6px rgba(58, 56, 49, 0.06), 0 16px 40px -4px rgba(61, 79, 61, 0.12)',
        'card':          '0 1px 2px rgba(58,56,49,0.04), 0 6px 24px -4px rgba(100,125,100,0.08), 0 0 0 0.5px rgba(239,234,225,0.9) inset',
        'card-hover':    '0 2px 6px rgba(58,56,49,0.06), 0 20px 48px -6px rgba(61,79,61,0.14), 0 0 0 0.5px rgba(200,213,200,0.6) inset',
        'glow-sage':     '0 0 0 4px rgba(100, 125, 100, 0.15), 0 8px 32px -4px rgba(78, 100, 78, 0.2)',
        'glow-sand':     '0 0 0 4px rgba(194, 163, 104, 0.12), 0 8px 24px -4px rgba(166, 135, 78, 0.18)',
        'inner-soft':    'inset 0 1px 3px rgba(58, 56, 49, 0.06)',
        'navbar':        '0 1px 0 rgba(239, 234, 225, 0.8), 0 4px 16px -4px rgba(100, 125, 100, 0.06)',
        'button-sage':   '0 1px 2px rgba(33, 42, 33, 0.12), 0 4px 14px -2px rgba(78, 100, 78, 0.22)',
      },
      borderRadius: {
        'natural': '1rem',
        'natural-lg': '1.25rem',
        'natural-xl': '1.5rem',
        'natural-2xl': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '88': '22rem',
        '96': '24rem',
      },
      backgroundImage: {
        'hero-botanical': `
          radial-gradient(ellipse 90% 50% at 50% -5%, rgba(100, 125, 100, 0.14) 0%, transparent 55%),
          radial-gradient(ellipse 35% 25% at 85% 85%, rgba(194, 163, 104, 0.10) 0%, transparent 45%),
          linear-gradient(180deg, #FDFBF7 0%, #F7F4EE 100%)
        `,
        'sage-grain': `
          radial-gradient(ellipse at 20% 30%, rgba(100, 125, 100, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(194, 163, 104, 0.06) 0%, transparent 50%)
        `,
        'card-gradient': 'linear-gradient(145deg, rgba(253,251,247,0.95) 0%, rgba(247,244,238,0.9) 100%)',
        'sage-gradient': 'linear-gradient(135deg, #4E644E 0%, #3D4F3D 100%)',
        'sand-gradient': 'linear-gradient(135deg, #C2A368 0%, #A6874E 100%)',
      },
      animation: {
        'fade-in':       'fadeIn 0.5s ease-out both',
        'fade-in-up':    'fadeInUp 0.55s ease-out both',
        'fade-in-down':  'fadeInDown 0.35s ease-out both',
        'scale-in':      'scaleIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'slide-up':      'slideUpFade 0.5s ease-out both',
        'slide-down':    'slideDownFade 0.3s ease-out both',
        'pulse-sage':    'pulseSage 2.2s ease-in-out infinite',
        'float':         'floatGently 3.5s ease-in-out infinite',
        'spin-slow':     'spinSlow 8s linear infinite',
        'shimmer':       'shimmerSlide 1.8s infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:       { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeInUp:     { from: { opacity: '0', transform: 'translateY(18px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeInDown:   { from: { opacity: '0', transform: 'translateY(-10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:      { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        slideUpFade:  { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDownFade:{ from: { opacity: '0', transform: 'translateY(-10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSage:    { '0%, 100%': { boxShadow: '0 0 0 0 rgba(100, 125, 100, 0)' }, '50%': { boxShadow: '0 0 0 6px rgba(100, 125, 100, 0.12)' } },
        floatGently:  { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-7px)' } },
        spinSlow:     { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        shimmerSlide: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        bounceGentle: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
      },
      transitionTimingFunction: {
        'natural': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#3A3831',
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            h1: { fontFamily: '"Playfair Display", serif', color: '#22211C' },
            h2: { fontFamily: '"Playfair Display", serif', color: '#22211C' },
            h3: { fontFamily: '"Playfair Display", serif', color: '#2C2B25' },
          },
        },
      },
    },
  },
  plugins: [],
};
