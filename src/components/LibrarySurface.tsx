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
  return (
    <section className="content-surface" aria-labelledby="content-surface-title" data-content-surface="library">
      <div className="content-surface__inner">
        <header className="content-surface__header">
          <p className="content-surface__eyebrow">Sources and artefacts</p>
          <h1 id="content-surface-title">Library</h1>
          <p className="content-surface__lead">
            A short, curated set of sources that help check or apply an idea. A source never changes a concept&apos;s canonical place.
          </p>
        </header>
        <div className="content-surface__sections" data-library-sources>
          {librarySources.map((source) => (
            <article className="content-surface__card" data-library-source={source.id} key={source.id}>
              <p className="content-surface__eyebrow">{source.kind} · {source.year}</p>
              <h2>{source.title}</h2>
              <p>{source.summary}</p>
              <p>{source.role}</p>
              <button
                className="content-surface__action"
                type="button"
                onClick={() => onExploreNode?.(source.primaryNodeId)}
              >
                Explore {labelForNodeId(source.primaryNodeId)} in Reality Orbit <span aria-hidden="true">→</span>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
