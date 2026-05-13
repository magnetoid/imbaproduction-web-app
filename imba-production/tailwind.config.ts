import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── New Spacebar-style palette ──
        ground:    '#0A0A0A',
        surface:   '#141416',
        'surface-2': '#1C1C1F',
        'surface-3': '#28282D',
        paper:     '#FAFAFA',
        'paper-dim':   '#9B9B9B',
        'paper-faint': '#5C5C5C',
        'hero-glow-1': '#FF3D5A',  // magenta
        'hero-glow-2': '#FF5E1F',  // orange
        'hero-glow-3': '#8B3DFF',  // violet

        // ── Legacy aliases — point old palette names at new tokens so
        //     existing className references (text-ember, bg-ink-2, text-smoke,
        //     border-white/8 etc.) keep compiling during the rewrite.
        //     The accent (ember) is kept as the single hot-amber highlight. ──
        ink: {
          DEFAULT: '#0A0A0A',
          2: '#141416',
          3: '#1C1C1F',
          4: '#28282D',
        },
        smoke: {
          DEFAULT: '#FAFAFA',
          dim: '#9B9B9B',
          faint: '#5C5C5C',
        },
        ember: {
          DEFAULT: '#D97757',  // small accent only (focus ring, link hover)
          dim: '#8A4A30',
          bright: '#E8896C',
        },
        gold: {
          DEFAULT: '#FAFAFA',  // remap: italics now render white, not gold
          dim: '#9B9B9B',
        },
        cyber: {
          DEFAULT: '#FAFAFA',
          dim: '#5C5852',
          glow: 'rgba(250,250,250,0.06)',
        },

        // shadcn tokens (used by admin) — keep
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
        // Single typographic system: Inter Tight everywhere.
        // `display` and `sans` both map to it so existing
        // `font-display` className references keep working.
        display: ['Inter Tight', 'system-ui', 'sans-serif'],
        sans: ['Inter Tight', 'system-ui', 'sans-serif'],
        tight: ['Inter Tight', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem', letterSpacing: '0.12em' }],
      },
      animation: {
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'glow-pulse': 'glowPulse 8s ease-in-out infinite',
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
        glowPulse: {
          '0%, 100%': { opacity: '0.9', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
