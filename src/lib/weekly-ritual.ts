import { fieldNotes } from "./field-notes";
import { isoWeekKey } from "./progress-store";
import { skillSignals } from "./skills";

export interface WeeklyConcept {
  readonly nodeId: string;
  readonly label: string;
  readonly whyItMatters: string;
  readonly practicePrompt: string;
  readonly relatedSkillId?: string;
  readonly relatedNoteSlug?: string;
}

/**
 * Curated weekly destinations — each is deep enough for one focused practice,
 * and already present in the published ontology / field-note / skills graph.
 */
const weeklyConcepts: readonly WeeklyConcept[] = [
  {
    nodeId: "paradox",
    label: "Paradox",
    whyItMatters: "A paradox shows where a simple rule stops being trustworthy — useful before you force more complexity.",
    practicePrompt: "Name one rule you trust this week. Follow it until it breaks, then write the boundary in one sentence.",
    relatedSkillId: "critical-thinking",
    relatedNoteSlug: "paradoxes-where-simple-rules-stop-working",
  },
  {
    nodeId: "decision-process",
    label: "Decision process",
    whyItMatters: "Clear decisions are less about knowing more and more about sequencing options against a real constraint.",
    practicePrompt: "Before your next non-trivial choice, write the decision rule you will use — then follow only that rule.",
    relatedSkillId: "decision-making",
    relatedNoteSlug: "why-more-options-can-feel-like-less",
  },
  {
    nodeId: "first-principles-thinking",
    label: "First-principles thinking",
    whyItMatters: "Separating facts from inherited assumptions is how stuck problems become movable again.",
    practicePrompt: "Take one stuck problem. List three assumptions. Replace one with a fact you can verify this week.",
    relatedSkillId: "problem-solving",
  },
  {
    nodeId: "evidence-assessment",
    label: "Evidence assessment",
    whyItMatters: "Skill without evidence is storytelling. Evidence without a question is noise.",
    practicePrompt: "Pick one belief about your work. What would count as evidence for and against it this week?",
    relatedSkillId: "critical-thinking",
  },
  {
    nodeId: "sorites-paradox",
    label: "Sorites paradox",
    whyItMatters: "Gradual change can erase a category without a dramatic moment — so thresholds must be chosen, not assumed.",
    practicePrompt: "Find one fuzzy category in your week (done, enough, healthy). State an explicit threshold.",
    relatedSkillId: "critical-thinking",
    relatedNoteSlug: "when-definitions-start-to-blur",
  },
  {
    nodeId: "jevons-paradox",
    label: "Jevons paradox",
    whyItMatters: "Local efficiency can raise total demand. Measure the system, not only the unit.",
    practicePrompt: "Improve one efficient habit, then track total use for three days — did demand rebound?",
    relatedSkillId: "problem-solving",
    relatedNoteSlug: "when-efficiency-changes-demand",
  },
  {
    nodeId: "humility",
    label: "Humility",
    whyItMatters: "Self-awareness starts when you can name what you do not know without collapsing into self-attack.",
    practicePrompt: "After one meeting or decision, write what you were wrong or uncertain about — without fixing it yet.",
    relatedSkillId: "self-awareness",
  },
  {
    nodeId: "self-control",
    label: "Self-control",
    whyItMatters: "Emotions inform action best when they are recognised early enough to choose a response.",
    practicePrompt: "When a strong emotion appears, pause for one breath and name it before you act or speak.",
    relatedSkillId: "coping-with-emotions",
  },
  {
    nodeId: "stoic-practice",
    label: "Stoic practice",
    whyItMatters: "Stress shrinks when you separate what you control from what you only influence.",
    practicePrompt: "Tonight, list three stressors. Mark each control / influence / neither. Act only on control.",
    relatedSkillId: "coping-with-stress",
  },
  {
    nodeId: "communication-event",
    label: "Communication event",
    whyItMatters: "Communication fails when the message fits your intent but not the other person's situation.",
    practicePrompt: "Before one important message, rewrite it for the listener's constraint, not your urgency.",
    relatedSkillId: "effective-communication",
  },
  {
    nodeId: "compassion",
    label: "Compassion",
    whyItMatters: "Empathy without a next action stays abstract. Compassion asks what would reduce friction for someone else.",
    practicePrompt: "Choose one person you struggle with. Write one concrete help that would matter to them this week.",
    relatedSkillId: "empathy",
  },
  {
    nodeId: "working-agreement",
    label: "Working agreement",
    whyItMatters: "Relationships stay constructive when expectations are spoken before friction invents them.",
    practicePrompt: "With one collaborator, name one expectation you have been assuming. Confirm or revise it.",
    relatedSkillId: "interpersonal-relationships",
  },
];

const weekIndex = (weekKey: string): number => {
  let hash = 0;
  for (let index = 0; index < weekKey.length; index += 1) {
    hash = (hash * 31 + weekKey.charCodeAt(index)) >>> 0;
  }
  return hash % weeklyConcepts.length;
};

export const getWeeklyConcept = (date = new Date()): WeeklyConcept => {
  const concept = weeklyConcepts[weekIndex(isoWeekKey(date))];
  return concept ?? weeklyConcepts[0]!;
};

export const relatedSkillForNode = (nodeId: string) =>
  skillSignals.find((skill) => skill.nodeId === nodeId);

export const relatedNotesForNode = (nodeId: string) =>
  fieldNotes.filter((note) => note.primaryNodeId === nodeId);

export const relatedSkillForNote = (primaryNodeId: string) => {
  const direct = skillSignals.find((skill) => skill.nodeId === primaryNodeId);
  if (direct) return direct;
  const weeklySkillId = weeklyConcepts.find((concept) => concept.nodeId === primaryNodeId)?.relatedSkillId;
  return skillSignals.find((skill) => skill.id === weeklySkillId);
};

export const skillById = (skillId: string | undefined) =>
  skillSignals.find((skill) => skill.id === skillId);

export const noteBySlug = (slug: string | undefined) =>
  fieldNotes.find((note) => note.slug === slug);
