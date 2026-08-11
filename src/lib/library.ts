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
    summary: "Wu Cheng'en's novel is the literary home of the stone-monkey birth story. Reality Orbit uses that episode as an allegory, not as ontology.",
    role: "Supports Potential emergence without changing the canonical map.",
    primaryNodeId: "potential-emergence",
  },
  {
    id: "ooda-boyd",
    title: "Destruction and Creation",
    kind: "Essay",
    year: "1976",
    summary: "John Boyd's essay is a source for the observe–orient–decide–act loop used as a decision framework.",
    role: "Supports OODA Loop as a named knowledge artifact.",
    primaryNodeId: "ooda-loop",
  },
  {
    id: "attachment-bowlby",
    title: "Attachment and Loss",
    kind: "Research programme",
    year: "1969–1980",
    summary: "John Bowlby's attachment research organises close bonds, safety seeking, and later relationship expectations.",
    role: "Supports Attachment theory as a scoped developmental account.",
    primaryNodeId: "attachment-theory",
  },
];
