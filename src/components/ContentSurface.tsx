import type { ReactElement } from "react";
import type { AppTab } from "./AppNavigation";
import { FieldNotesSurface } from "./FieldNotesSurface";
import { LibrarySurface } from "./LibrarySurface";

interface ContentSurfaceProps {
  readonly tab: Exclude<AppTab, "home">;
  readonly onExploreNode?: (nodeId: string) => void;
  readonly initialNoteSlug?: string;
  readonly initialNotesFilter?: "start-here" | "all";
}

export function ContentSurface({
  tab,
  onExploreNode,
  initialNoteSlug,
  initialNotesFilter,
}: ContentSurfaceProps): ReactElement {
  if (tab === "field-notes") {
    return (
      <FieldNotesSurface
        initialSlug={initialNoteSlug}
        initialFilter={initialNotesFilter}
        onExploreNode={onExploreNode}
      />
    );
  }

  if (tab === "library") {
    return <LibrarySurface onExploreNode={onExploreNode} />;
  }

  return (
    <section className="content-surface" aria-labelledby="content-surface-title" data-content-surface="about">
      <div className="content-surface__inner">
        <header className="content-surface__header">
          <p className="content-surface__eyebrow">The observatory</p>
          <h1 id="content-surface-title">About Reality Orbit</h1>
          <p className="content-surface__lead">
            Reality Orbit is a spatial interface for building understanding, one carefully chosen lens at a time.
          </p>
        </header>
        <div className="content-surface__sections">
          <article className="content-surface__card">
            <h2>Reality remains central</h2>
            <p>
              The map begins with Reality, then uses Domain, Category, Time, Scale, and Perspective to reveal complementary structure.
            </p>
          </article>
          <article className="content-surface__card">
            <h2>Understanding is the product</h2>
            <p>
              Space is the interaction metaphor. The purpose is not to collect nodes, but to see what a concept means, where it applies, and what it connects to.
            </p>
          </article>
          <article className="content-surface__card">
            <h2>The public map stays free</h2>
            <p>
              Exploring the ontology, reading Concept Anatomy, and submitting understanding questions remain free. Payment, if it arrives, will attach only to saving, resuming, comparing, or guided study—never to changing what is true.
            </p>
          </article>
          <article className="content-surface__card">
            <h2>Current teaching examples</h2>
            <p>
              Three Field Notes open existing map concepts without inventing new planets: Potential emergence (Framework allegory), Survival (Framework for fact vs negotiable vs path), and Probability as a Model for uncertainty.
            </p>
            <div className="about-teaching-actions">
              <button
                className="content-surface__action"
                type="button"
                onClick={() => onExploreNode?.("potential-emergence")}
              >
                Explore Potential Emergence in Reality Orbit <span aria-hidden="true">→</span>
              </button>
              <button
                className="content-surface__action"
                type="button"
                onClick={() => onExploreNode?.("survival")}
              >
                Explore Survival in Reality Orbit <span aria-hidden="true">→</span>
              </button>
              <button
                className="content-surface__action"
                type="button"
                onClick={() => onExploreNode?.("model")}
              >
                Explore Model in Reality Orbit <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
