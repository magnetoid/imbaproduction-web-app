const ITEMS = ['Brand Films', 'AI Video', 'Product', 'Social', 'Post-Production', 'Commercials', 'Brand Films', 'AI Video', 'Product', 'Social']

/**
 * Full-bleed champagne marquee band — a bold editorial transition between
 * sections. Big italic serif disciplines scrolling continuously, pause on hover.
 */
export default function FilmMarquee() {
  const Row = () => (
    <div className="film-marquee__row" aria-hidden="true">
      {ITEMS.map((t, i) => (
        <span key={i} className="film-marquee__item">
          <span className="film-marquee__text">{t}</span>
          <span className="film-marquee__star">✦</span>
        </span>
      ))}
    </div>
  )
  return (
    <section className="film-marquee" aria-label="What we make">
      <div className="film-marquee__track">
        <Row />
        <Row />
      </div>
    </section>
  )
}
