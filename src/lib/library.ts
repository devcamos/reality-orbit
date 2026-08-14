export interface LibrarySource {
  readonly id: string;
  readonly title: string;
  readonly kind: string;
  readonly year: string;
  readonly summary: string;
  readonly role: string;
  readonly primaryNodeId: string;
}

export const librarySources: readonly LibrarySource[] = [
  {
    id: "journey-to-the-west",
    title: "Journey to the West",
    kind: "Literary source",
    year: "c. 1592",
    summary: "Wu Cheng'en's novel is the literary home of the stone-monkey birth story. Reality Orbit borrows that episode as allegory, not as a map claim.",
    role: "Grounds the Potential emergence teaching example without adding a literary node to the ontology.",
    primaryNodeId: "potential-emergence",
  },
  {
    id: "ooda-boyd",
    title: "Destruction and Creation",
    kind: "Essay",
    year: "1976",
    summary: "John Boyd's essay is a primary source for the observe–orient–decide–act loop used as a decision framework.",
    role: "Anchors OODA Loop as a named knowledge artefact with a clear origin text.",
    primaryNodeId: "ooda-loop",
  },
  {
    id: "attachment-bowlby",
    title: "Attachment and Loss",
    kind: "Research programme",
    year: "1969–1980",
    summary: "John Bowlby's attachment research organises close bonds, safety seeking, and later relationship expectations.",
    role: "Anchors Attachment theory as a scoped developmental account, not a universal law of love.",
    primaryNodeId: "attachment-theory",
  },
];
