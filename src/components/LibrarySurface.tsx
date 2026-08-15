import type { ReactElement } from "react";
import { librarySources } from "../lib/library";

interface LibrarySurfaceProps {
  readonly onExploreNode?: (nodeId: string) => void;
}

const labelForNodeId = (nodeId: string): string => nodeId
  .split("-")
  .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
  .join(" ");

export function LibrarySurface({ onExploreNode }: LibrarySurfaceProps): ReactElement {
  const sourceCount = librarySources.length;

  return (
    <section className="content-surface" aria-labelledby="content-surface-title" data-content-surface="library">
      <div className="content-surface__inner">
        <header className="content-surface__header">
          <p className="content-surface__eyebrow">Outside the map</p>
          <h1 id="content-surface-title">Library</h1>
          <p className="content-surface__lead">
            Short, curated sources that help you check or apply an idea already on the map.
            Notes tell a teaching story; Library points at the artefact behind the idea.
            A source never moves a concept&apos;s place in Reality Orbit.
          </p>
        </header>

        <aside className="library-orientation" aria-label="How to use the Library">
          <p>
            <strong>{sourceCount} sources</strong>
            {" "}
            — each card names the artefact, why it is here, and which concept to open on the map.
          </p>
        </aside>

        <div className="content-surface__sections library-source-grid" data-library-sources>
          {librarySources.map((source) => {
            const conceptLabel = labelForNodeId(source.primaryNodeId);

            return (
              <article className="content-surface__card library-source" data-library-source={source.id} key={source.id}>
                <div className="library-source__meta" aria-label="Source type and date">
                  <span>{source.kind}</span>
                  <span>{source.year}</span>
                </div>
                <h2>{source.title}</h2>
                <dl className="library-source__facts">
                  <div>
                    <dt>What it is</dt>
                    <dd>{source.summary}</dd>
                  </div>
                  <div>
                    <dt>Why it is here</dt>
                    <dd>{source.role}</dd>
                  </div>
                  <div>
                    <dt>Opens on the map</dt>
                    <dd>
                      <span className="library-source__concept">{conceptLabel}</span>
                    </dd>
                  </div>
                </dl>
                <button
                  className="content-surface__action"
                  type="button"
                  onClick={() => onExploreNode?.(source.primaryNodeId)}
                >
                  Explore {conceptLabel} in Reality Orbit <span aria-hidden="true">→</span>
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
