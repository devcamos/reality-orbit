import type { CSSProperties, ReactElement } from "react";
import observatoryBackgroundUrl from "../../assets/observatory-deep-space.webp";

interface ObservatoryIntroductionProps {
  readonly onEnter: () => void;
}

type LensName = "Domain" | "Category" | "Time" | "Scale" | "Perspective";

const lenses: readonly LensName[] = [
  "Domain",
  "Category",
  "Time",
  "Scale",
  "Perspective",
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
            Explore how ideas, systems, and experiences connect—without losing
            sight of the whole.
          </p>
        </div>

        <figure className="observatory-intro__map">
          <div className="observatory-intro__map-field" aria-hidden="true">
            <span className="observatory-intro__map-orbit observatory-intro__map-orbit--outer" />
            <span className="observatory-intro__map-orbit observatory-intro__map-orbit--middle" />
            <span className="observatory-intro__map-orbit observatory-intro__map-orbit--inner" />
            <span className="observatory-intro__map-reality">Reality</span>
            {lenses.map((lens) => (
              <span
                className={`observatory-intro__map-lens observatory-intro__map-lens--${lens.toLowerCase()}`}
                key={lens}
              >
                <span className="observatory-intro__map-marker">
                  <LensIcon name={lens} />
                </span>
                <span className="observatory-intro__map-label">{lens}</span>
              </span>
            ))}
          </div>
          <figcaption className="visually-hidden">
            Reality surrounded by the five complementary lenses: Domain,
            Category, Time, Scale, and Perspective.
          </figcaption>
        </figure>

        <button
          className="observatory-intro__enter"
          type="button"
          onClick={onEnter}
          data-enter-observatory
        >
          <span>Explore Reality</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
