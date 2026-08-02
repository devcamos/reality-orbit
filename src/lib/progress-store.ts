/** Local progress for the weekly understanding loop. Browser-only; safe no-ops when storage is unavailable. */

export interface LastExploredNode {
  readonly nodeId: string;
  readonly label: string;
  readonly path: readonly string[];
  readonly updatedAt: string;
}

export interface SkillEvidenceNote {
  readonly id: string;
  readonly text: string;
  /** Optional outcome: what happened after using the skill. */
  readonly outcome?: string;
  readonly createdAt: string;
}

export type SkillEvidenceMap = Record<string, readonly SkillEvidenceNote[]>;

/** Thin personal layer on top of the shared ontology — never mutates canonical nodes. */
export interface PersonalConceptEntry {
  readonly nodeId: string;
  readonly label: string;
  readonly example?: string;
  readonly counterexample?: string;
  readonly decisionRule?: string;
  readonly practicedAt?: string;
  readonly openThread: boolean;
  readonly updatedAt: string;
}

export type PersonalRealityMap = Record<string, PersonalConceptEntry>;

export interface WeekActivity {
  readonly weekKey: string;
  readonly exploredNodeIds: readonly string[];
  readonly skillIdsWithNotes: readonly string[];
  readonly practiceCompleted: boolean;
  /** One active skill focus for the week (usually tied to this week’s concept). */
  readonly focusSkillId?: string;
  readonly lastVisitAt: string;
}

const LAST_NODE_KEY = "reality-orbit-last-node";
const SKILL_NOTES_KEY = "reality-orbit-skill-notes";
const WEEK_ACTIVITY_KEY = "reality-orbit-week-activity";
const PERSONAL_MAP_KEY = "reality-orbit-personal-map";

const canUseStorage = (): boolean => {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
};

const readJson = <T>(key: string): T | undefined => {
  if (!canUseStorage()) return undefined;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return undefined;
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
};

const writeJson = (key: string, value: unknown): void => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked — progress remains session-local.
  }
};

/** ISO week key like 2026-W31 for stable weekly rotation and activity buckets. */
export const isoWeekKey = (date = new Date()): string => {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
};

export const loadLastExploredNode = (): LastExploredNode | undefined =>
  readJson<LastExploredNode>(LAST_NODE_KEY);

export const saveLastExploredNode = (node: Omit<LastExploredNode, "updatedAt">): LastExploredNode => {
  const next: LastExploredNode = { ...node, updatedAt: new Date().toISOString() };
  writeJson(LAST_NODE_KEY, next);
  return next;
};

export const loadSkillEvidence = (): SkillEvidenceMap =>
  readJson<SkillEvidenceMap>(SKILL_NOTES_KEY) ?? {};

export const saveSkillEvidenceNote = (
  skillId: string,
  text: string,
  outcome?: string,
): SkillEvidenceMap => {
  const trimmed = text.trim();
  if (!trimmed) return loadSkillEvidence();
  const current = loadSkillEvidence();
  const note: SkillEvidenceNote = {
    id: `note-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    text: trimmed.slice(0, 280),
    outcome: outcome?.trim() ? outcome.trim().slice(0, 280) : undefined,
    createdAt: new Date().toISOString(),
  };
  const next: SkillEvidenceMap = {
    ...current,
    [skillId]: [note, ...(current[skillId] ?? [])].slice(0, 12),
  };
  writeJson(SKILL_NOTES_KEY, next);
  touchWeekActivity({ skillId });
  return next;
};

export const loadPersonalMap = (): PersonalRealityMap =>
  readJson<PersonalRealityMap>(PERSONAL_MAP_KEY) ?? {};

export const upsertPersonalConcept = (
  input: {
    nodeId: string;
    label: string;
    example?: string;
    counterexample?: string;
    decisionRule?: string;
    practiced?: boolean;
    openThread?: boolean;
  },
): PersonalRealityMap => {
  const current = loadPersonalMap();
  const existing = current[input.nodeId];
  const nextEntry: PersonalConceptEntry = {
    nodeId: input.nodeId,
    label: input.label,
    example: input.example?.trim() || existing?.example,
    counterexample: input.counterexample?.trim() || existing?.counterexample,
    decisionRule: input.decisionRule?.trim() || existing?.decisionRule,
    practicedAt: input.practiced
      ? new Date().toISOString()
      : existing?.practicedAt,
    openThread: input.practiced
      ? false
      : (input.openThread ?? existing?.openThread ?? true),
    updatedAt: new Date().toISOString(),
  };
  const next = { ...current, [input.nodeId]: nextEntry };
  writeJson(PERSONAL_MAP_KEY, next);
  return next;
};

export const practicedConcepts = (map: PersonalRealityMap = loadPersonalMap()): PersonalConceptEntry[] =>
  Object.values(map)
    .filter((entry) => Boolean(entry.practicedAt))
    .sort((left, right) => (right.practicedAt ?? "").localeCompare(left.practicedAt ?? ""));

export const openThreads = (map: PersonalRealityMap = loadPersonalMap()): PersonalConceptEntry[] =>
  Object.values(map)
    .filter((entry) => entry.openThread && !entry.practicedAt)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

export const loadWeekActivity = (): WeekActivity => {
  const weekKey = isoWeekKey();
  const stored = readJson<WeekActivity>(WEEK_ACTIVITY_KEY);
  if (stored?.weekKey === weekKey) return stored;
  const fresh: WeekActivity = {
    weekKey,
    exploredNodeIds: [],
    skillIdsWithNotes: [],
    practiceCompleted: false,
    lastVisitAt: new Date().toISOString(),
  };
  writeJson(WEEK_ACTIVITY_KEY, fresh);
  return fresh;
};

export const touchWeekActivity = (opts?: {
  nodeId?: string;
  skillId?: string;
  practiceCompleted?: boolean;
  focusSkillId?: string;
}): WeekActivity => {
  const weekKey = isoWeekKey();
  const current = loadWeekActivity();
  const base = current.weekKey === weekKey
    ? current
    : {
        weekKey,
        exploredNodeIds: [] as string[],
        skillIdsWithNotes: [] as string[],
        practiceCompleted: false,
        focusSkillId: undefined as string | undefined,
        lastVisitAt: new Date().toISOString(),
      };

  const exploredNodeIds = opts?.nodeId && !base.exploredNodeIds.includes(opts.nodeId)
    ? [...base.exploredNodeIds, opts.nodeId].slice(-24)
    : [...base.exploredNodeIds];
  const skillIdsWithNotes = opts?.skillId && !base.skillIdsWithNotes.includes(opts.skillId)
    ? [...base.skillIdsWithNotes, opts.skillId].slice(-24)
    : [...base.skillIdsWithNotes];

  const next: WeekActivity = {
    weekKey,
    exploredNodeIds,
    skillIdsWithNotes,
    practiceCompleted: opts?.practiceCompleted === true ? true : base.practiceCompleted,
    focusSkillId: opts?.focusSkillId ?? base.focusSkillId,
    lastVisitAt: new Date().toISOString(),
  };
  writeJson(WEEK_ACTIVITY_KEY, next);
  return next;
};

/**
 * Blend seeded evidence with personal notes. Value stays sticky; evidence moves with
 * note count, optional outcomes, and whether the newest note is recent (within 14 days).
 */
export const evidenceQualityFromNotes = (
  seeded: number,
  notes: readonly SkillEvidenceNote[] | undefined,
): number => {
  if (!notes?.length) return seeded;
  const newest = notes[0];
  const ageMs = newest ? Date.now() - new Date(newest.createdAt).getTime() : Number.POSITIVE_INFINITY;
  const recentBoost = ageMs <= 14 * 86400000 ? 0.22 : 0.08;
  const outcomeBoost = notes.some((note) => note.outcome) ? 0.12 : 0;
  const countSignal = Math.min(0.7, notes.length * 0.16);
  const noteSignal = Math.min(1, countSignal + recentBoost + outcomeBoost);
  return Math.min(0.98, Math.max(0.08, seeded * 0.55 + noteSignal * 0.45));
};
