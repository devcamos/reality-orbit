import type { PersonalConceptEntry } from "./progress-store";
import type { WeeklyConcept } from "./weekly-ritual";

export interface ConceptBriefFields {
  readonly nodeId: string;
  readonly label: string;
  readonly definition?: string;
  readonly decisionRule?: string;
  readonly example?: string;
  readonly practicePrompt?: string;
  readonly whyItMatters?: string;
  readonly personal?: PersonalConceptEntry;
}

/** Build a short offline-ready markdown brief for the week’s (or selected) concept. */
export const buildConceptBriefMarkdown = (fields: ConceptBriefFields): string => {
  const definition = fields.definition
    ?? fields.whyItMatters
    ?? `${fields.label} — a concept from Reality Orbit.`;
  const decision = fields.decisionRule
    ?? fields.personal?.decisionRule
    ?? "State the situation, apply the concept’s boundary, then act on the smallest clear next step.";
  const example = fields.example
    ?? fields.personal?.example
    ?? fields.practicePrompt
    ?? "Use one real situation from this week as your working example.";
  const practice = fields.practicePrompt ?? "Practice once this week and write what changed.";
  const personalBits = [
    fields.personal?.example ? `- My example: ${fields.personal.example}` : null,
    fields.personal?.counterexample ? `- My counterexample: ${fields.personal.counterexample}` : null,
    fields.personal?.decisionRule ? `- My decision rule: ${fields.personal.decisionRule}` : null,
  ].filter(Boolean);

  return [
    `# ${fields.label}`,
    "",
    "## Definition",
    definition,
    "",
    "## Decision rule",
    decision,
    "",
    "## Example / practice",
    example,
    "",
    "## This week’s practice",
    practice,
    ...(personalBits.length > 0 ? ["", "## My notes", ...personalBits] : []),
    "",
    "---",
    "_Exported from Reality Orbit — teach this in about three minutes._",
    "",
  ].join("\n");
};

/** Compact “teach this in 3 minutes” card for quick verbal teaching. */
export const buildTeachCardMarkdown = (fields: ConceptBriefFields): string => {
  const definition = fields.definition ?? fields.whyItMatters ?? fields.label;
  const decision = fields.decisionRule ?? fields.personal?.decisionRule ?? "Name the boundary, then choose.";
  const example = fields.example ?? fields.personal?.example ?? fields.practicePrompt ?? "One live situation.";
  return [
    `## Teach ${fields.label} in 3 minutes`,
    "",
    `1. **What it is** — ${definition}`,
    `2. **How to use it** — ${decision}`,
    `3. **Show one case** — ${example}`,
    "",
  ].join("\n");
};

export const briefFromWeekly = (
  weekly: WeeklyConcept,
  personal?: PersonalConceptEntry,
  anatomy?: { definition?: string; decisionRule?: string; example?: string },
): ConceptBriefFields => ({
  nodeId: weekly.nodeId,
  label: weekly.label,
  definition: anatomy?.definition,
  decisionRule: anatomy?.decisionRule ?? personal?.decisionRule,
  example: anatomy?.example ?? personal?.example,
  practicePrompt: weekly.practicePrompt,
  whyItMatters: weekly.whyItMatters,
  personal,
});

export const copyText = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to legacy copy.
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
};

export const downloadTextFile = (filename: string, text: string): void => {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
