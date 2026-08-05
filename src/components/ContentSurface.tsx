import type { ReactElement } from "react";
import type { AppTab } from "./AppNavigation";
import { FieldNotesSurface } from "./FieldNotesSurface";

interface ContentSurfaceProps {
  readonly tab: Exclude<AppTab, "home">;
  readonly onExploreNode?: (nodeId: string) => void;
}

const surfaceContent: Record<ContentSurfaceProps["tab"], {
  eyebrow: string;
  title: string;
  lead: string;
  sections: readonly { title: string; body: string }[];
}> = {
  "field-notes": {
    eyebrow: "Ideas in context",
    title: "Notes",
    lead: "Short explanations that begin with a question and stay anchored to the map of reality.",
    sections: [
      {
        title: "Begin with a node",
        body: "Each note will connect to one or more ontology nodes, so an idea can be read in context and then explored spatially.",
      },
      {
        title: "Make the connection visible",
        body: "Notes explain why a concept matters, how it behaves, and which neighbouring ideas help complete the picture.",
      },
    ],
  },
  library: {
    eyebrow: "Sources and artefacts",
    title: "Library",
    lead: "The sources and references behind the ideas in Reality Orbit.",
    sections: [
      {
        title: "What belongs here",
        body: "Research papers, books, documentation, datasets, podcasts, and videos that help you check, extend, or apply an idea.",
      },
      {
        title: "How it connects",
        body: "Each source can point back to the concept it illuminates. The source supports understanding without changing the concept's canonical place.",
      },
    ],
  },
  about: {
    eyebrow: "The observatory",
    title: "About Reality Orbit",
    lead: "Reality Orbit is a spatial interface for building understanding, one carefully chosen lens at a time.",
    sections: [
      {
        title: "Reality remains central",
        body: "The map begins with Reality, then uses Domain, Category, Time, Scale, and Perspective to reveal complementary structure.",
      },
      {
        title: "Understanding is the product",
        body: "Space is the interaction metaphor. The purpose is not to collect nodes, but to see what a concept means, where it applies, and what it connects to.",
      },
    ],
  },
};

export function ContentSurface({ tab, onExploreNode }: ContentSurfaceProps): ReactElement {
  if (tab === "field-notes") return <FieldNotesSurface onExploreNode={onExploreNode} />;
  const content = surfaceContent[tab];

  return (
    <section className="content-surface" aria-labelledby="content-surface-title" data-content-surface={tab}>
      <div className="content-surface__inner">
        <header className="content-surface__header">
          <p className="content-surface__eyebrow">{content.eyebrow}</p>
          <h1 id="content-surface-title">{content.title}</h1>
          <p className="content-surface__lead">{content.lead}</p>
        </header>
        <div className="content-surface__sections">
          {content.sections.map((section) => (
            <article className="content-surface__card" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
