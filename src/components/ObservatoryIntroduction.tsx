import type { CSSProperties, ReactElement } from "react";
import observatoryBackgroundUrl from "../../assets/observatory-deep-space.webp";

interface ObservatoryIntroductionProps {
  readonly onEnter: () => void;
}

type LensName = "Domain" | "Category" | "Time" | "Scale" | "Perspective";

interface Lens {
  readonly name: LensName;
  readonly question: string;
}

const lenses: readonly Lens[] = [
  { name: "Domain", question: "What area of reality is this?" },
  { name: "Category", question: "What kind of thing is it?" },
  { name: "Time", question: "When does it exist or change?" },
  { name: "Scale", question: "At what level are we looking?" },
  { name: "Perspective", question: "From which viewpoint is it understood?" },
];

function LensIcon({ name }: { readonly name: LensName }): ReactElement {
  const sharedProps = {
    "aria-hidden": true,
    className: "observatory-intro__lens-icon",
    fill: "none",
    viewBox: "0 0 24 24",
  } as const;

  if (name === "Domain") {
    return (
      <svg {...sharedProps}>
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M9.4 4v16M14.6 4v16M4 9.4h16M4 14.6h16" />
      </svg>
    );
  }

  if (name === "Category") {
    return (
      <svg {...sharedProps}>
        <path d="m12 4 8 4-8 4-8-4 8-4Z" />
        <path d="m4 12 8 4 8-4M4 16l8 4 8-4" />
      </svg>
    );
  }

  if (name === "Time") {
    return (
      <svg {...sharedProps}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5l3.4 2" />
      </svg>
    );
  }

  if (name === "Scale") {
    return (
      <svg {...sharedProps}>
        <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" />
        <path d="m4 9 5-5M20 9l-5-5M4 15l5 5M20 15l-5 5" />
      </svg>
    );
  }

  return (
    <svg {...sharedProps}>
      <path d="M3.5 12s3-5.3 8.5-5.3 8.5 5.3 8.5 5.3-3 5.3-8.5 5.3S3.5 12 3.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
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
      <div className="observatory-intro__shell">
        <header className="observatory-intro__header">
          <div className="observatory-intro__brand">
            <span className="observatory-intro__brand-mark" aria-hidden="true">
              <span />
            </span>
            <span>Reality Orbit</span>
          </div>
          <span className="observatory-intro__signal" aria-hidden="true">✦</span>
        </header>

        <div className="observatory-intro__opening">
          <h1 id="observatory-intro-title">Begin with Reality<span>.</span></h1>
          <p className="observatory-intro__lead">
            Understand how ideas, systems, and experiences connect. Choose a
            lens and move from the whole to the detail without losing context.
          </p>
        </div>

        <figure
          className="observatory-intro__map"
          aria-label="Reality surrounded by five enduring lenses"
        >
          <div className="observatory-intro__map-field" aria-hidden="true">
            <span className="observatory-intro__map-orbit observatory-intro__map-orbit--outer" />
            <span className="observatory-intro__map-orbit observatory-intro__map-orbit--middle" />
            <span className="observatory-intro__map-orbit observatory-intro__map-orbit--inner" />
            <span className="observatory-intro__map-reality">Reality</span>
            {lenses.map((lens) => (
              <span
                className={`observatory-intro__map-lens observatory-intro__map-lens--${lens.name.toLowerCase()}`}
                key={lens.name}
              >
                <span className="observatory-intro__map-marker">
                  <LensIcon name={lens.name} />
                </span>
                <span className="observatory-intro__map-label">{lens.name}</span>
              </span>
            ))}
          </div>
        </figure>

        <ul
          className="observatory-intro__lenses"
          aria-label="Five lenses on Reality"
        >
          {lenses.map((lens) => (
            <li key={lens.name}>
              <LensIcon name={lens.name} />
              <span>{lens.name}</span>
              <span className="observatory-intro__lens-question">{lens.question}</span>
            </li>
          ))}
        </ul>

        <button
          className="observatory-intro__enter"
          type="button"
          onClick={onEnter}
          data-enter-observatory
        >
          <span>Explore Reality</span>
          <span aria-hidden="true">→</span>
        </button>

        <details className="observatory-intro__explanation">
          <summary>
            <span>See how it works</span>
            <span className="observatory-intro__play" aria-hidden="true">›</span>
          </summary>
          <ol aria-label="How to explore">
            <li>Choose the lens that frames your question.</li>
            <li>Select a concept to bring its meaning into focus.</li>
            <li>Follow a curated path while Reality remains your reference point.</li>
          </ol>
        </details>

        <nav className="observatory-intro__example" aria-label="Example route">
          <ol>
            <li>Reality</li>
            <li>Social</li>
            <li>Organisations</li>
            <li>Trust</li>
          </ol>
        </nav>

        <p className="observatory-intro__note">
          <span className="observatory-intro__note-signal" aria-hidden="true" />
          <span>A quiet map for understanding complex things.</span>
        </p>
      </div>
    </section>
  );
}
