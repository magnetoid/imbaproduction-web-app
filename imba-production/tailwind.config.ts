import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── New Spacebar-style palette ──
        ground:    '#0F0D0C',          // warm charcoal-brown (2026 shift from pure black)
        surface:   '#1A1614',
        'surface-2': '#221E1B',
        'surface-3': '#2C2724',
        paper:     '#F0EEE9',          // Pantone Cloud Dancer 2026
        'paper-dim':   '#A8A39B',
        'paper-faint': '#6B6660',
        moss:      '#3A4A36',          // biophilic accent (2026 trend)
        'moss-light': '#6B7A52',
        'hero-glow-1': '#FF3D5A',
        'hero-glow-2': '#FF5E1F',
        'hero-glow-3': '#8B3DFF',

        // ── Legacy aliases — point old palette names at new tokens so
        //     existing className references (text-ember, bg-ink-2, text-smoke,
        //     border-white/8 etc.) keep compiling during the rewrite.
        //     The accent (ember) is kept as the single hot-amber highlight. ──
        ink: {
          DEFAULT: '#0F0D0C',
          2: '#1A1614',
          3: '#221E1B',
          4: '#2C2724',
        },
        smoke: {
          DEFAULT: '#F0EEE9',
          dim: '#A8A39B',
          faint: '#6B6660',
        },
        ember: {
          DEFAULT: '#D97757',  // small accent only (focus ring, link hover)
          dim: '#8A4A30',
          bright: '#E8896C',
        },
        gold: {
          DEFAULT: '#F0EEE9',
          dim: '#A8A39B',
        },
        cyber: {
          DEFAULT: '#F0EEE9',
          dim: '#5C5852',
          glow: 'rgba(240,238,233,0.06)',
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
      spacing: {
        // Unified section padding for 2026 — replaces py-16/20/24/28 drift
        section: '7rem',           // py-28 on mobile
        'section-lg': '8rem',      // py-32 on desktop
      },
      animation: {
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'glow-pulse': 'glowPulse 8s ease-in-out infinite',
        'marquee': 'marquee 28s linear infinite',
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
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
