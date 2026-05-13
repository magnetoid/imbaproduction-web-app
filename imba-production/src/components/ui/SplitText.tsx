interface SplitTextProps {
  text: string
  /** Initial delay in seconds before the first word reveals. */
  delay?: number
  /** Per-word stagger in seconds. */
  stagger?: number
}

/**
 * CSS-only split-text reveal — each word slides up from below with a
 * staggered delay. No JS runtime cost, runs on the composite layer.
 * `.split-word` keyframes live in src/index.css and honor
 * prefers-reduced-motion.
 */
export default function SplitText({
  text,
  delay = 0,
  stagger = 0.04,
}: SplitTextProps) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="split-word">
          <span style={{ animationDelay: `${(delay + i * stagger).toFixed(3)}s` }}>
            {word}
          </span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </>
  )
}
