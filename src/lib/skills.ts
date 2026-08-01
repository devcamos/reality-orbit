export interface SkillSignal {
  readonly id: string;
  readonly name: string;
  readonly area: string;
  readonly value: number;
  readonly evidenceQuality: number;
  readonly impact: number;
  readonly summary: string;
  readonly nodeId: string;
}

/** Seed data for the first Skills surface. Scores are signals for discussion, not objective truths. */
export const skillSignals: readonly SkillSignal[] = [
  {
    id: "systems-thinking",
    name: "Systems thinking",
    area: "Reasoning",
    value: 0.88,
    evidenceQuality: 0.82,
    impact: 0.82,
    summary: "See relationships, feedback, boundaries, and second-order effects before acting.",
    nodeId: "second-order-thinking",
  },
  {
    id: "first-principles",
    name: "First-principles reasoning",
    area: "Reasoning",
    value: 0.84,
    evidenceQuality: 0.78,
    impact: 0.68,
    summary: "Reduce a problem to its necessary assumptions before rebuilding a useful explanation.",
    nodeId: "first-principles-thinking",
  },
  {
    id: "decision-making",
    name: "Decision making",
    area: "Judgement",
    value: 0.79,
    evidenceQuality: 0.71,
    impact: 0.74,
    summary: "Make a choice when information, uncertainty, trade-offs, and consequences are visible enough.",
    nodeId: "decision-process",
  },
  {
    id: "clear-communication",
    name: "Clear communication",
    area: "Communication",
    value: 0.76,
    evidenceQuality: 0.74,
    impact: 0.72,
    summary: "Transfer meaning with enough context for another person to interpret and act on it.",
    nodeId: "communication-event",
  },
  {
    id: "learning-loops",
    name: "Learning loops",
    area: "Learning",
    value: 0.72,
    evidenceQuality: 0.67,
    impact: 0.64,
    summary: "Turn experience into a repeatable cycle of reflection, experiment, and adaptation.",
    nodeId: "learning-cycle",
  },
  {
    id: "ethical-judgement",
    name: "Ethical judgement",
    area: "Judgement",
    value: 0.7,
    evidenceQuality: 0.63,
    impact: 0.58,
    summary: "Make responsibilities, harms, rights, fairness, and intended consequences explicit.",
    nodeId: "ethical-decision",
  },
  {
    id: "attention-allocation",
    name: "Attention allocation",
    area: "Self-regulation",
    value: 0.62,
    evidenceQuality: 0.58,
    impact: 0.51,
    summary: "Direct limited focus toward the signals and tasks that matter most in context.",
    nodeId: "attention-allocation",
  },
  {
    id: "operating-systems",
    name: "Operating systems",
    area: "Systems",
    value: 0.59,
    evidenceQuality: 0.49,
    impact: 0.47,
    summary: "Connect roles, processes, decisions, resources, and feedback into a workable whole.",
    nodeId: "organisational-system",
  },
];
