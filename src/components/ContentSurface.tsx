import type { ReactElement } from "react";
import type { AppTab } from "./AppNavigation";
import { FieldNotesSurface } from "./FieldNotesSurface";
import { SkillsMatrixSurface } from "./SkillsMatrixSurface";

interface ContentSurfaceProps {
  readonly tab: Exclude<AppTab, "home">;
  readonly onExploreNode?: (nodeId: string) => void;
  readonly onOpenSkills?: (skillId?: string) => void;
  readonly requestedSkillId?: string;
  readonly requestedNoteSlug?: string;
  readonly focusSkillId?: string;
}

const lenses = [
  { name: "Domain", blurb: "Which subject field am I in?" },
  { name: "Category", blurb: "What kind of thing is this?" },
  { name: "Time", blurb: "When does change occur?" },
  { name: "Scale", blurb: "At what level am I looking?" },
  { name: "Perspective", blurb: "From which viewpoint?" },
] as const;

export function ContentSurface({
  tab,
  onExploreNode,
  onOpenSkills,
  requestedSkillId,
  requestedNoteSlug,
  focusSkillId,
}: ContentSurfaceProps): ReactElement {
  if (tab === "field-notes") {
    return (
      <FieldNotesSurface
        onExploreNode={onExploreNode}
        onOpenSkills={onOpenSkills}
        requestedNoteSlug={requestedNoteSlug}
      />
    );
  }
  if (tab === "skills") {
    return (
      <SkillsMatrixSurface
        onExploreNode={onExploreNode}
        requestedSkillId={requestedSkillId}
        focusSkillId={focusSkillId}
      />
    );
  }

  if (tab === "library") {
    return (
      <section className="content-surface content-surface--observatory" aria-labelledby="content-surface-title" data-content-surface="library">
        <div className="content-surface__atmosphere" aria-hidden="true" />
        <div className="content-surface__inner">
          <header className="content-surface__header">
            <p className="content-surface__eyebrow">Sources and artefacts</p>
            <h1 id="content-surface-title">Library</h1>
            <p className="content-surface__lead">
              A calm reference shelf for the material that supports deeper understanding — kept separate from the concepts themselves.
            </p>
          </header>

          <div className="observatory-panel observatory-panel--hero">
            <p className="content-surface__eyebrow">How this shelf works</p>
            <h2>Sources explain. Concepts stay put.</h2>
            <p>
              A paper, book, dataset, or talk can illuminate a node without becoming the node.
              When the library fills, each artefact will point back to the orbit — never the other way around.
            </p>
          </div>

          <div className="library-shelves" aria-label="Library shelves">
            <article className="library-shelf">
              <header>
                <p className="content-surface__eyebrow">Evidence to return to</p>
                <h2>Curated sources</h2>
              </header>
              <p>
                Research papers, books, documentation, datasets, podcasts, and videos will gather here and link to the concepts they illuminate.
              </p>
              <div className="library-empty" data-library-empty>
                <strong>Shelf reserved</strong>
                <span>No artefacts published yet. The empty shelf is intentional — better a quiet room than a fake archive.</span>
              </div>
            </article>

            <article className="library-shelf">
              <header>
                <p className="content-surface__eyebrow">Reading discipline</p>
                <h2>The subject stays separate</h2>
              </header>
              <ul className="library-principles">
                <li>A source is an information artefact, not a destination on the map.</li>
                <li>Canonical place comes from the ontology; sources only annotate it.</li>
                <li>Prefer one strong reference over a pile of weakly linked ones.</li>
              </ul>
            </article>
          </div>

          <aside className="observatory-panel observatory-panel--soft">
            <p className="content-surface__eyebrow">Meanwhile</p>
            <h2>Start from Field notes or the weekly concept</h2>
            <p>
              Until the shelf fills, use Field notes for short explanations and Home’s weekly concept for a single deep practice — both already route into the orbit.
            </p>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className="content-surface content-surface--observatory" aria-labelledby="content-surface-title" data-content-surface="about">
      <div className="content-surface__atmosphere" aria-hidden="true" />
      <div className="content-surface__inner">
        <header className="content-surface__header">
          <p className="content-surface__eyebrow">The observatory</p>
          <h1 id="content-surface-title">About Reality Orbit</h1>
          <p className="content-surface__lead">
            Reality Orbit is a spatial interface for building understanding — one carefully chosen lens at a time.
          </p>
        </header>

        <div className="observatory-panel observatory-panel--hero">
          <p className="content-surface__eyebrow">Why it exists</p>
          <h2>Understanding is the product</h2>
          <p>
            Space is the interaction metaphor. The purpose is not to collect nodes, but to see what a concept means,
            where it applies, and what it connects to — then practice using it.
          </p>
        </div>

        <div className="about-lenses" aria-label="Five complementary lenses">
          {lenses.map((lens) => (
            <article className={`about-lens about-lens--${lens.name.toLowerCase()}`} key={lens.name}>
              <h2>{lens.name}</h2>
              <p>{lens.blurb}</p>
            </article>
          ))}
        </div>

        <div className="content-surface__sections content-surface__sections--about">
          <article className="content-surface__card">
            <h2>Reality remains central</h2>
            <p>
              The map begins with Reality, then uses Domain, Category, Time, Scale, and Perspective to reveal complementary structure without replacing the centre.
            </p>
          </article>
          <article className="content-surface__card">
            <h2>A weekly return loop</h2>
            <p>
              Each week: open one curated concept, read or practice with it, and log a short evidence note on a related skill. Home keeps your continue path and practice prompt ready.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
