import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactElement } from "react";
import {
  evidenceQualityFromNotes,
  loadSkillEvidence,
  saveSkillEvidenceNote,
  type SkillEvidenceMap,
} from "../lib/progress-store";
import { relatedNotesForNode } from "../lib/weekly-ritual";
import { skillSignals, type SkillSignal } from "../lib/skills";

interface SkillsMatrixSurfaceProps {
  readonly onExploreNode?: (nodeId: string) => void;
  readonly requestedSkillId?: string;
  readonly focusSkillId?: string;
}

const areas = [...new Set(skillSignals.map((skill) => skill.area))];
const areaFilters = ["All areas", ...areas];

const fallbackAreaColor = "#9fc4d6";
const areaColors: Record<string, string> = {
  Cognition: "#7da9e8",
  Judgement: "#b18ae0",
  Communication: "#e0b075",
  "Self-awareness": "#e08aa8",
  "Self-regulation": "#72c7cf",
};

/** Plot coordinates are percentages of the plot box; keep a margin so nodes never touch the frame. */
const PLOT_MIN = 10;
const PLOT_MAX = 90;
/** Minimum distance (in percent points) between node centres before anti-collision pushes them apart. */
const MIN_GAP = 11;

interface AxisDomain {
  readonly min: number;
  readonly max: number;
}

interface PlottedSkill {
  skill: SkillSignal;
  evidenceQuality: number;
  x: number;
  y: number;
}

/** Fit the axis to the observed data range (plus padding) instead of a fixed 0–100% scale. */
const domainOf = (values: readonly number[]): AxisDomain => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max((max - min) * 0.12, 0.03);
  return { min: Math.max(0, min - pad), max: Math.min(1, max + pad) };
};

const scaleTo = (value: number, domain: AxisDomain): number =>
  PLOT_MIN + ((value - domain.min) / (domain.max - domain.min)) * (PLOT_MAX - PLOT_MIN);

/** Iteratively nudge overlapping points apart so every node stays visible and clickable. */
const spreadPoints = (points: readonly PlottedSkill[]): PlottedSkill[] => {
  const spread = points.map((point) => ({ ...point }));
  for (let iteration = 0; iteration < 24; iteration += 1) {
    let moved = false;
    for (let a = 0; a < spread.length; a += 1) {
      for (let b = a + 1; b < spread.length; b += 1) {
        const first = spread[a];
        const second = spread[b];
        if (!first || !second) continue;
        const dx = second.x - first.x;
        const dy = second.y - first.y;
        const distance = Math.hypot(dx, dy) || 0.01;
        if (distance >= MIN_GAP) continue;
        const push = (MIN_GAP - distance) / 2;
        const unitX = dx / distance;
        const unitY = dy / distance;
        first.x -= unitX * push;
        first.y -= unitY * push;
        second.x += unitX * push;
        second.y += unitY * push;
        moved = true;
      }
    }
    for (const point of spread) {
      point.x = Math.min(PLOT_MAX + 4, Math.max(PLOT_MIN - 4, point.x));
      point.y = Math.min(PLOT_MAX + 4, Math.max(PLOT_MIN - 4, point.y));
    }
    if (!moved) break;
  }
  return spread;
};

const pointStyle = (point: PlottedSkill): CSSProperties => ({
  "--skill-left": `${point.x}%`,
  "--skill-bottom": `${point.y}%`,
  "--skill-size": `${1.2 + point.skill.impact * 1.1}rem`,
  "--skill-color": areaColors[point.skill.area] ?? fallbackAreaColor,
} as CSSProperties);

export function SkillsMatrixSurface({
  onExploreNode,
  requestedSkillId,
  focusSkillId,
}: SkillsMatrixSurfaceProps): ReactElement {
  const [activeArea, setActiveArea] = useState("All areas");
  const [selectedId, setSelectedId] = useState<string | undefined>(requestedSkillId ?? focusSkillId);
  const [evidenceMap, setEvidenceMap] = useState<SkillEvidenceMap>(loadSkillEvidence);
  const [draftNote, setDraftNote] = useState("");
  const [draftOutcome, setDraftOutcome] = useState("");
  const selectedSkill = skillSignals.find((skill) => skill.id === selectedId);
  const focusSkill = skillSignals.find((skill) => skill.id === focusSkillId);
  const selectedNotes = selectedId ? evidenceMap[selectedId] ?? [] : [];
  const selectedEvidence = selectedSkill
    ? evidenceQualityFromNotes(selectedSkill.evidenceQuality, selectedNotes)
    : 0;
  const relatedNotes = selectedSkill ? relatedNotesForNode(selectedSkill.nodeId) : [];

  useEffect(() => {
    if (requestedSkillId) setSelectedId(requestedSkillId);
    else if (focusSkillId) setSelectedId(focusSkillId);
  }, [requestedSkillId, focusSkillId]);

  const points = useMemo(() => {
    const visibleSkills = skillSignals.filter((skill) => activeArea === "All areas" || skill.area === activeArea);
    const withEvidence = visibleSkills.map((skill) => ({
      skill,
      evidenceQuality: evidenceQualityFromNotes(skill.evidenceQuality, evidenceMap[skill.id]),
    }));
    const valueDomain = domainOf(withEvidence.map((entry) => entry.skill.value));
    const evidenceDomain = domainOf(withEvidence.map((entry) => entry.evidenceQuality));
    return spreadPoints(withEvidence.map((entry) => ({
      skill: entry.skill,
      evidenceQuality: entry.evidenceQuality,
      x: scaleTo(entry.skill.value, valueDomain),
      y: scaleTo(entry.evidenceQuality, evidenceDomain),
    })));
  }, [activeArea, evidenceMap]);

  const submitNote = (event: FormEvent): void => {
    event.preventDefault();
    if (!selectedId || !draftNote.trim()) return;
    setEvidenceMap(saveSkillEvidenceNote(selectedId, draftNote, draftOutcome));
    setDraftNote("");
    setDraftOutcome("");
  };

  return (
    <section className="content-surface skills-surface content-surface--observatory" aria-labelledby="skills-title" data-content-surface="skills">
      <div className="content-surface__atmosphere" aria-hidden="true" />
      <div className="content-surface__inner">
        <header className="content-surface__header">
          <p className="content-surface__eyebrow">Abilities in practice</p>
          <h1 id="skills-title">Skills matrix</h1>
          <p className="content-surface__lead">
            Compare the value of a skill with the quality of the evidence behind its assessment.
            Log short personal notes — evidence moves with what you record; value stays mostly sticky.
          </p>
          {focusSkill && (
            <p className="skills-focus-banner" data-skills-week-focus>
              This week’s skill focus: <strong>{focusSkill.name}</strong>
              {selectedId !== focusSkill.id && (
                <button type="button" className="content-surface__quiet-action" onClick={() => setSelectedId(focusSkill.id)}>
                  Open focus
                </button>
              )}
            </p>
          )}
        </header>

        <div className="skills-toolbar">
          <label className="skills-filter">
            <span>Filter by area</span>
            <select value={activeArea} onChange={(event) => setActiveArea(event.target.value)}>
              {areaFilters.map((area) => <option key={area} value={area}>{area}</option>)}
            </select>
          </label>
          <div className="skills-legend" aria-label="Area colour legend">
            {areas.map((area) => (
              <span key={area}>
                <i className="skills-legend__dot" style={{ background: areaColors[area] ?? fallbackAreaColor }} aria-hidden="true" />
                {area}
              </span>
            ))}
          </div>
        </div>

        <div className="skills-layout">
          {/* A plain group rather than a fieldset: Chrome's anonymous fieldset content box
              collapses to zero height, which breaks the percentage-positioned plot points. */}
          <div className="skills-matrix" role="group" aria-label="Skills plotted by outcome value and evidence quality">
            <div className="skills-matrix__quadrant skills-matrix__quadrant--proven">Proven low priority<br />High evidence · Lower value</div>
            <div className="skills-matrix__quadrant skills-matrix__quadrant--validated">Validated strengths<br />High evidence · Higher value</div>
            <div className="skills-matrix__quadrant skills-matrix__quadrant--underdeveloped">Underdeveloped<br />Low evidence · Lower value</div>
            <div className="skills-matrix__quadrant skills-matrix__quadrant--speculative">Speculative opportunities<br />Low evidence · Higher value</div>
            <div className="skills-matrix__edge skills-matrix__edge--top" aria-hidden="true">High evidence</div>
            <div className="skills-matrix__edge skills-matrix__edge--bottom" aria-hidden="true">Low evidence</div>
            <div className="skills-matrix__edge skills-matrix__edge--left" aria-hidden="true">Lower value</div>
            <div className="skills-matrix__edge skills-matrix__edge--right" aria-hidden="true">Higher value</div>
            <div className="skills-matrix__plot">
              {points.map((point) => (
                <button
                  className={`skills-point${selectedId === point.skill.id ? " skills-point--selected" : ""}`}
                  key={point.skill.id}
                  style={pointStyle(point)}
                  type="button"
                  data-skill-id={point.skill.id}
                  aria-label={`${point.skill.name}. ${point.skill.area}. Evidence quality ${Math.round(point.evidenceQuality * 100)} percent. Outcome value ${Math.round(point.skill.value * 100)} percent.`}
                  aria-pressed={selectedId === point.skill.id}
                  onClick={() => setSelectedId(point.skill.id)}
                >
                  <span>{point.skill.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="skills-mobile-list" aria-label="Skills list">
            {points.map(({ skill }) => (
              <button className={`skills-mobile-list__item${selectedId === skill.id ? " skills-mobile-list__item--selected" : ""}`} key={skill.id} type="button" aria-pressed={selectedId === skill.id} onClick={() => setSelectedId(skill.id)}>
                <span>{skill.name}</span>
                <small>{skill.area} · {Math.round(skill.value * 100)}% value</small>
              </button>
            ))}
          </div>

          <aside className="skills-detail" aria-live="polite">
            {selectedSkill ? (
              <>
                <p className="content-surface__eyebrow">Selected skill</p>
                <h2>{selectedSkill.name}</h2>
                <p>{selectedSkill.summary}</p>
                <dl className="skills-detail__metrics">
                  <div><dt>Outcome value</dt><dd>{Math.round(selectedSkill.value * 100)}%</dd></div>
                  <div><dt>Evidence quality</dt><dd>{Math.round(selectedEvidence * 100)}%</dd></div>
                  <div><dt>Impact signal</dt><dd>{Math.round(selectedSkill.impact * 100)}%</dd></div>
                </dl>
                <span className="skills-detail__area">{selectedSkill.area}</span>

                <div className="skills-evidence" data-skill-evidence>
                  <p className="content-surface__eyebrow">Personal evidence</p>
                  <p className="skills-evidence__hint">
                    Short notes from real situations. Count and recency lift evidence quality; seeded value stays sticky.
                  </p>
                  {selectedNotes.length > 0 ? (
                    <ul className="skills-evidence__list">
                      {selectedNotes.map((note) => (
                        <li key={note.id}>
                          <time dateTime={note.createdAt}>
                            {new Date(note.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </time>
                          <span>{note.text}</span>
                          {note.outcome && <small className="skills-evidence__outcome">Result: {note.outcome}</small>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="skills-evidence__empty">No personal notes yet — add one observation from this week.</p>
                  )}
                  <form className="skills-evidence__form" onSubmit={submitNote}>
                    <label>
                      <span className="visually-hidden">Evidence note for {selectedSkill.name}</span>
                      <textarea
                        value={draftNote}
                        maxLength={280}
                        rows={3}
                        placeholder="I used this skill when…"
                        onChange={(event) => setDraftNote(event.target.value)}
                        data-skill-evidence-input
                      />
                    </label>
                    <label>
                      <span className="visually-hidden">Optional outcome for {selectedSkill.name}</span>
                      <textarea
                        value={draftOutcome}
                        maxLength={280}
                        rows={2}
                        placeholder="Optional outcome — result was…"
                        onChange={(event) => setDraftOutcome(event.target.value)}
                        data-skill-outcome-input
                      />
                    </label>
                    <button className="content-surface__action" type="submit" disabled={!draftNote.trim()}>
                      Log evidence <span aria-hidden="true">→</span>
                    </button>
                  </form>
                </div>

                {relatedNotes.length > 0 && (
                  <p className="skills-detail__related">
                    Related field note: {relatedNotes.map((note) => note.title).join(" · ")}
                  </p>
                )}

                <button className="content-surface__action" type="button" onClick={() => onExploreNode?.(selectedSkill.nodeId)}>
                  Explore {selectedSkill.name} context <span aria-hidden="true">→</span>
                </button>
              </>
            ) : (
              <div className="skills-detail__empty">
                <p className="content-surface__eyebrow">Read the matrix</p>
                <h2>Choose a skill</h2>
                <p>
                  Select a point to see its definition, score signals, personal evidence, and related Reality Orbit context.
                </p>
                <ul className="skills-detail__guide">
                  <li>Right / up = higher value with stronger evidence</li>
                  <li>Log notes to move evidence without inventing new skills</li>
                  <li>Explore jumps back to the mapped concept</li>
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
