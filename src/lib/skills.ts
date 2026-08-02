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

/**
 * The WHO's ten core life skills (WHO life skills education framework), grouped into the
 * WHO's five complementary pairs. Each skill anchors to a Reality Orbit ontology node.
 *
 * `value` (how much outcome a skill drives) and `evidenceQuality` (how well its assessment is
 * backed by tracked observations) are scored independently — a skill can be high value with
 * almost no evidence behind it, or thoroughly evidenced but low priority. Keeping the two
 * inputs decoupled is what lets the matrix use all four quadrants. Scores are seeded signals
 * for discussion, not objective truths.
 */
export const skillSignals: readonly SkillSignal[] = [
  {
    id: "critical-thinking",
    name: "Critical thinking",
    area: "Cognition",
    value: 0.86,
    evidenceQuality: 0.78,
    impact: 0.8,
    summary: "Analyse information and experience objectively, weighing evidence, assumptions, and influences.",
    nodeId: "evidence-assessment",
  },
  {
    id: "creative-thinking",
    name: "Creative thinking",
    area: "Cognition",
    value: 0.78,
    evidenceQuality: 0.36,
    impact: 0.66,
    summary: "Explore alternatives and consequences beyond direct experience, responding adaptively to situations.",
    nodeId: "abilities",
  },
  {
    id: "decision-making",
    name: "Decision making",
    area: "Judgement",
    value: 0.82,
    evidenceQuality: 0.52,
    impact: 0.74,
    summary: "Deal constructively with decisions by assessing options and the effects of different choices.",
    nodeId: "decision-process",
  },
  {
    id: "problem-solving",
    name: "Problem solving",
    area: "Judgement",
    value: 0.9,
    evidenceQuality: 0.7,
    impact: 0.84,
    summary: "Work significant problems through to resolution rather than leaving them to accumulate as stress.",
    nodeId: "first-principles-thinking",
  },
  {
    id: "effective-communication",
    name: "Effective communication",
    area: "Communication",
    value: 0.84,
    evidenceQuality: 0.82,
    impact: 0.78,
    summary: "Express needs, opinions, and feelings in ways that fit the culture and situation, and listen in kind.",
    nodeId: "communication-event",
  },
  {
    id: "interpersonal-relationships",
    name: "Interpersonal relationships",
    area: "Communication",
    value: 0.74,
    evidenceQuality: 0.56,
    impact: 0.7,
    summary: "Build and keep constructive relationships, and end them in ways that preserve wellbeing.",
    nodeId: "working-agreement",
  },
  {
    id: "self-awareness",
    name: "Self-awareness",
    area: "Self-awareness",
    value: 0.66,
    evidenceQuality: 0.44,
    impact: 0.6,
    summary: "Recognise your own character, strengths, weaknesses, desires, and dislikes as they shape behaviour.",
    nodeId: "humility",
  },
  {
    id: "empathy",
    name: "Empathy",
    area: "Self-awareness",
    value: 0.6,
    evidenceQuality: 0.68,
    impact: 0.58,
    summary: "Imagine what life is like for another person, even in situations you have never experienced.",
    nodeId: "compassion",
  },
  {
    id: "coping-with-emotions",
    name: "Coping with emotions",
    area: "Self-regulation",
    value: 0.56,
    evidenceQuality: 0.34,
    impact: 0.52,
    summary: "Recognise emotions in yourself and others, and respond so they inform rather than drive action.",
    nodeId: "self-control",
  },
  {
    id: "coping-with-stress",
    name: "Coping with stress",
    area: "Self-regulation",
    value: 0.5,
    evidenceQuality: 0.5,
    impact: 0.48,
    summary: "Recognise sources of stress and their effects, then act to control their level and your response.",
    nodeId: "stoic-practice",
  },
];
