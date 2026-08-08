import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'card-bg': 'var(--card-bg)',
        'ink-navy': 'var(--ink-navy)',
        'ink': 'var(--ink)',
        'paper': 'var(--paper)',
        'card': 'var(--card)',
        'card-hover': 'var(--card-hover)',
        'text-primary': 'var(--text-primary)',
        'gold': 'var(--gold)',
        'slate': 'var(--slate)',
        'emerald': 'var(--emerald)',
        'hairline': 'var(--hairline)',
        'danger': 'var(--danger)',
        'danger-bg': 'var(--danger-bg)',
        'danger-border': 'var(--danger-border)',
        'notice': 'var(--notice)',
        'notice-border': 'var(--notice-border)',
        'action': 'var(--action)',
        'action-hover': 'var(--action-hover)',
        'action-contrast': 'var(--action-contrast)',
      },
      fontFamily: {
        'display': ['var(--font-display)', 'Georgia', 'serif'],
        'sans': ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'mono': ['var(--font-plex-mono)', 'monospace'],
      },
      borderRadius: {
        'card': '10px',
        'sm': '12px',
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card': 'none',
        'card-hover': 'var(--shadow-card-hover)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'stagger-fade-up': 'fadeUp 0.5s ease-out',
      },
      keyframes: {
        fadeUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(12px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      spacing: {
        'hairline': '1px',
      },
    },
  },
  plugins: [],
};

export default config;
