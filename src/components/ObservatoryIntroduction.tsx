import type { CSSProperties, ReactElement } from "react";
import observatoryBackgroundUrl from "../../assets/observatory-deep-space.webp";

interface ObservatoryIntroductionProps {
  onEnter: () => void;
}

export function ObservatoryIntroduction({
  onEnter,
}: ObservatoryIntroductionProps): ReactElement {
  const style = {
    "--intro-background": `url("${observatoryBackgroundUrl}")`,
  } as CSSProperties;

  return (
    <section
      className="observatory-intro"
      style={style}
      aria-labelledby="observatory-intro-title"
      data-observatory-introduction
    >
      <div className="observatory-intro__sky" aria-hidden="true">
        <span className="observatory-intro__orbit observatory-intro__orbit--outer" />
        <span className="observatory-intro__orbit observatory-intro__orbit--inner" />
        <span className="observatory-intro__reality" />
      </div>

      <div className="observatory-intro__content">
        <p className="observatory-intro__eyebrow">Reality Orbit</p>
        <h1 id="observatory-intro-title">Begin with Reality.</h1>
        <p className="observatory-intro__lead">
          Explore how knowledge connects through five enduring lenses. Move from
          the whole to a concept, then let each orbit reveal the next useful
          question.
        </p>

        <ul className="observatory-intro__guide" aria-label="How to explore">
          <li>
            <span>01</span>
            <strong>Choose a lens</strong>
            <small>Domain, Category, Time, Scale, or Perspective</small>
          </li>
          <li>
            <span>02</span>
            <strong>Follow an orbit</strong>
            <small>Select a concept to understand what it reveals</small>
          </li>
          <li>
            <span>03</span>
            <strong>Build understanding</strong>
            <small>Explore deeper while Reality remains your reference point</small>
          </li>
        </ul>

        <button
          className="observatory-intro__enter"
          type="button"
          onClick={onEnter}
          data-enter-observatory
        >
          Enter the observatory
          <span aria-hidden="true">→</span>
        </button>
        <p className="observatory-intro__note">
          A quiet map for understanding—not a simulation or a game.
        </p>
      </div>
    </section>
  );
}
