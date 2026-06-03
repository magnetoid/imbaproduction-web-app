import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Editorial Cinema palette ──
        // Light surface (canvas) is the default. Cinema is reserved for hero
        // reel + selected-work sections — places that need to feel like a film
        // still on a black gallery wall.
        canvas:     '#0C0D0F',         // dark premium canvas (default)
        paper:      '#141619',         // lifted dark surface (cards)
        ink:        '#F3F2EE',         // warm white — primary text
        'ink-dim':  '#9B9D99',
        'ink-faint':'#62655F',
        hairline:   'rgba(243,242,238,0.10)',

        cinema:     '#0A0B0C',         // deepest panel
        'cinema-2': '#141619',
        'paper-cinema': '#F3F2EE',     // light text on cinema
        'hairline-cinema': 'rgba(243,242,238,0.12)',

        'ink-navy': '#E6B774',         // single accent → champagne

        // ── Legacy aliases (now dark-premium; champagne accent) ──
        ground:     '#0C0D0F',
        surface:    '#141619',
        'surface-2':'#1B1E22',
        'surface-3':'#23262B',
        'paper-dim': '#9B9D99',
        'paper-faint': '#62655F',
        moss:       '#E6B774',
        ink2: {
          DEFAULT: '#0C0D0F',
          2: '#141619',
          3: '#1B1E22',
          4: '#23262B',
        },
        // text scale — primary text is now warm white
        ink_: {
          DEFAULT: '#F3F2EE',
          2: '#141619',
          3: '#1B1E22',
          4: '#23262B',
        },
        smoke: {
          DEFAULT: '#F3F2EE',
          dim: '#9B9D99',
          faint: '#62655F',
        },
        ember: {
          DEFAULT: '#E6B774',
          dim: '#C99A52',
          bright: '#F0C98C',
        },
        gold: {
          DEFAULT: '#E6B774',
          dim: '#C99A52',
        },
        cyber: {
          DEFAULT: '#E6B774',
          dim: '#C99A52',
          glow: 'rgba(230,183,116,0.10)',
        },

        // shadcn tokens for admin
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
        display: ['Instrument Serif', 'Georgia', 'serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        sans: ['Schibsted Grotesk', 'system-ui', 'sans-serif'],
        tight: ['Schibsted Grotesk', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem', letterSpacing: '0.12em' }],
      },
      spacing: {
        section: '8rem',          // py-32 default
        'section-lg': '10rem',    // py-40 on lg+
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
