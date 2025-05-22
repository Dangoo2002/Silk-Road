/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      // Custom color palette for light and dark modes
      colors: {
        primary: {
          light: '#3B82F6', // Blue-500 for light mode
          dark: '#60A5FA',  // Blue-400 for dark mode
          DEFAULT: '#3B82F6',
        },
        secondary: {
          light: '#8B5CF6', // Purple-500 for light mode
          dark: '#A78BFA',  // Purple-400 for dark mode
          DEFAULT: '#8B5CF6',
        },
        background: {
          light: '#F3F4F6', // Gray-100
          dark: '#111827',  // Gray-900
          DEFAULT: '#F3F4F6',
        },
        surface: {
          light: '#FFFFFF', // White for light mode
          dark: '#1F2A44',  // Dark gray for dark mode
          DEFAULT: '#FFFFFF',
        },
        text: {
          light: '#111827', // Gray-900 for light mode
          dark: '#F9FAFB',  // Gray-50 for dark mode
          DEFAULT: '#111827',
        },
        accent: {
          light: '#10B981', // Green-500 for online status, etc.
          dark: '#34D399',  // Green-400 for dark mode
          DEFAULT: '#10B981',
        },
      },
      // Modern typography settings
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        base: ['1rem', { lineHeight: '1.5rem' }], // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px
      },
      // Enhanced spacing for consistency
      spacing: {
        4.5: '1.125rem', // 18px
        5.5: '1.375rem', // 22px
        18: '4.5rem',    // 72px
      },
      // Modern box shadows for cards and dropdowns
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'soft-dark': '0 2px 8px rgba(0, 0, 0, 0.5)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'card-dark': '0 4px 12px rgba(0, 0, 0, 0.7)',
      },
      // Smooth transitions for interactive elements
      transitionProperty: {
        'colors-opacity': 'background-color, border-color, color, fill, stroke, opacity',
        'transform-opacity': 'transform, opacity',
      },
      transitionDuration: {
        250: '250ms',
        350: '350ms',
      },
      // Border radius for modern rounded elements
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      // Backdrop blur for glassmorphism effect
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
      },
      // Animation keyframes for smooth effects
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};