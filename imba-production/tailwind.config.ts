import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Warm-dark cinematic ground (replaces pure black) ──
        ink: {
          DEFAULT: '#0F0F0E',
          2: '#1C1917',
          3: '#252220',
          4: '#312D2A',
        },
        // ── Warm off-white paper (replaces #F5F4F0) ──
        smoke: {
          DEFAULT: '#F5F2EC',
          dim: '#A8A49B',
          faint: '#6B6760',
        },
        // ── Single brand accent: warm cinematic amber ──
        ember: {
          DEFAULT: '#D97757',
          dim: '#8A4A30',
          bright: '#E8896C',
        },
        // ── Gold neutralised to pale warm tone (italic em accent) ──
        gold: {
          DEFAULT: '#D9B889',
          dim: '#6E5938',
        },
        // ── "cyber" retained as token name so JSX classes don't break,
        //     but remapped to a quiet warm neutral so any residual usage
        //     reads as a subtle paper highlight rather than neon blue. ──
        cyber: {
          DEFAULT: '#E8E3D6',
          dim: '#5C5852',
          glow: 'rgba(245,242,236,0.08)',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'Neue Haas Grotesk Display Pro', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem', letterSpacing: '0.12em' }],
      },
      animation: {
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
