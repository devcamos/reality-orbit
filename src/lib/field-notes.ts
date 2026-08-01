export interface FieldNoteSection {
  readonly heading: string;
  readonly body: string;
}

export const FIELD_NOTE_DIMENSIONS = ["Domain", "Time", "Scale", "Perspective", "Category"] as const;
export type FieldNoteDimension = typeof FIELD_NOTE_DIMENSIONS[number];

/**
 * Read-only content contract shaped like Life World's BlogPost metadata.
 * A future authenticated adapter can replace this list without changing the UI.
 */
export interface FieldNote {
  readonly slug: string;
  readonly title: string;
  /** The canonical Reality dimension used as the note's top-level navigation branch. */
  readonly dimension?: FieldNoteDimension;
  readonly category: string;
  readonly subcategory?: string;
  readonly tags: readonly string[];
  readonly date: string;
  readonly summary: string;
  readonly primaryNodeId: string;
  readonly sections: readonly FieldNoteSection[];
}

export const fieldNotes: readonly FieldNote[] = [
  {
    slug: "paradoxes-where-simple-rules-stop-working",
    title: "Paradoxes: Where simple rules stop working",
    dimension: "Category",
    category: "Knowledge",
    subcategory: "Reasoning",
    tags: ["Feynman technique", "Paradox", "Reasoning"],
    date: "2026-07-31",
    summary: "A plain-language guide to using paradoxes as stress tests for mental models.",
    primaryNodeId: "paradox",
    sections: [
      {
        heading: "Start with the tension",
        body: "A paradox begins with a rule that sounds reasonable, then follows that rule until the result becomes surprising, self-defeating, or hard to classify.",
      },
      {
        heading: "Explain it simply",
        body: "Name the assumption, show the mechanism, and point to the boundary where the explanation stops helping. If the idea cannot be explained plainly, the model is not ready.",
      },
      {
        heading: "Use the map",
        body: "Choose Paradox in the Knowledge branch, then compare the named example with its neighbouring lens: identity, boundaries, incentives, groups, efficiency, or resilience.",
      },
      {
        heading: "Decision rule",
        body: "Use a paradox when a simple rule predicts one result but real conditions produce another. Refine the definition or boundary before adding more complexity.",
      },
    ],
  },
  {
    slug: "when-definitions-start-to-blur",
    title: "When definitions start to blur",
    dimension: "Category",
    category: "Knowledge",
    subcategory: "Paradox",
    tags: ["Sorites", "boundaries", "clarity"],
    date: "2026-07-29",
    summary: "The Sorites paradox shows why gradual change can make a simple category hard to place.",
    primaryNodeId: "sorites-paradox",
    sections: [
      { heading: "The simple rule", body: "If one grain does not change a heap, it is tempting to repeat the same rule forever." },
      { heading: "Where it bends", body: "A sequence of harmless steps eventually produces a different classification, even though no single step seemed decisive." },
      { heading: "Use the boundary", body: "When a decision needs a category, state the tolerance or threshold instead of pretending the boundary is natural and exact." },
    ],
  },
  {
    slug: "why-more-options-can-feel-like-less",
    title: "Why more options can feel like less",
    dimension: "Category",
    category: "Systems",
    subcategory: "Decision making",
    tags: ["choice", "attention", "decisions"],
    date: "2026-07-26",
    summary: "The paradox of choice explains how variety can become comparison cost, regret, and hesitation.",
    primaryNodeId: "paradox-of-choice",
    sections: [
      { heading: "Count the real cost", body: "Every additional option adds comparison, uncertainty, and responsibility for the decision." },
      { heading: "Make choice useful", body: "Good filters and meaningful defaults preserve variety without asking the user to inspect every possibility." },
      { heading: "A practical rule", body: "Reduce or sequence options when the cost of comparing them is larger than the value of the extra variety." },
    ],
  },
  {
    slug: "when-efficiency-changes-demand",
    title: "When efficiency changes demand",
    dimension: "Category",
    category: "Systems",
    subcategory: "Resources",
    tags: ["Jevons", "efficiency", "feedback"],
    date: "2026-07-22",
    summary: "Jevons paradox is a reminder to measure total resource use, not only efficiency per unit.",
    primaryNodeId: "jevons-paradox",
    sections: [
      { heading: "The attractive promise", body: "A more efficient process uses fewer resources for each unit of service." },
      { heading: "The rebound", body: "Lower cost can increase demand, expand use, or redirect savings into more consumption." },
      { heading: "Measure the system", body: "Track total demand after the improvement and check which constraints or incentives changed." },
    ],
  },
];
