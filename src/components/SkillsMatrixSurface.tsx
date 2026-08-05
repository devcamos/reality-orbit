import { useState, type CSSProperties, type ReactElement } from "react";
import { skillSignals, type SkillSignal } from "../lib/skills";

interface SkillsMatrixSurfaceProps {
  readonly onExploreNode?: (nodeId: string) => void;
}

const areas = ["All areas", ...new Set(skillSignals.map((skill) => skill.area))];

const pointOffsets: Record<string, readonly [number, number]> = {
  "systems-thinking": [4, 8],
  "first-principles": [-10, 4],
  "decision-making": [8, -8],
  "clear-communication": [-8, -10],
  "learning-loops": [12, 8],
  "ethical-judgement": [-6, -4],
  "attention-allocation": [2, -10],
  "operating-systems": [10, -4],
};

const clampPercent = (value: number, high: boolean): number => high
  ? Math.min(94, Math.max(56, value))
  : Math.min(44, Math.max(6, value));

const pointPosition = (skill: SkillSignal): { left: number; bottom: number; quadrant: string } => {
  const highValue = skill.value >= 0.5;
  const highEvidence = skill.evidenceQuality >= 0.5;
  const [xOffset, yOffset] = pointOffsets[skill.id] ?? [0, 0];

  return {
    left: clampPercent(skill.value * 100 + xOffset, highValue),
    bottom: clampPercent(skill.evidenceQuality * 100 + yOffset, highEvidence),
    quadrant: `${highEvidence ? "high" : "low"}-evidence-${highValue ? "high" : "low"}-value`,
  };
};

const pointStyle = (skill: SkillSignal): CSSProperties => ({
  "--skill-left": `${pointPosition(skill).left}%`,
  "--skill-bottom": `${pointPosition(skill).bottom}%`,
  "--skill-size": `${2.1 + skill.impact * 1.1}rem`,
} as CSSProperties);

export function SkillsMatrixSurface({ onExploreNode }: SkillsMatrixSurfaceProps): ReactElement {
  const [activeArea, setActiveArea] = useState("All areas");
  const [selectedId, setSelectedId] = useState<string>();
  const visibleSkills = skillSignals.filter((skill) => activeArea === "All areas" || skill.area === activeArea);
  const selectedSkill = skillSignals.find((skill) => skill.id === selectedId);

  return (
    <section className="content-surface skills-surface" aria-labelledby="skills-title" data-content-surface="skills">
      <div className="content-surface__inner">
        <header className="content-surface__header">
          <p className="content-surface__eyebrow">Abilities in practice</p>
          <h1 id="skills-title">Skills matrix</h1>
          <p className="content-surface__lead">Compare the value of a skill with the quality of the evidence behind its assessment. These are seeded signals for discussion, not fixed labels.</p>
        </header>

        <div className="skills-toolbar">
          <label className="skills-filter">
            <span>Filter by area</span>
            <select value={activeArea} onChange={(event) => setActiveArea(event.target.value)}>
              {areas.map((area) => <option key={area} value={area}>{area}</option>)}
            </select>
          </label>
          <div className="skills-legend" aria-label="Matrix legend">
            <span><i className="skills-legend__dot skills-legend__dot--quality" aria-hidden="true" />Evidence quality</span>
            <span><i className="skills-legend__dot skills-legend__dot--value" aria-hidden="true" />Outcome value</span>
          </div>
        </div>

        <div className="skills-layout">
          <div className="skills-matrix" role="group" aria-label="Skills plotted by outcome value and evidence quality">
            <div className="skills-matrix__quadrant skills-matrix__quadrant--high">High evidence<br />High value</div>
            <div className="skills-matrix__quadrant skills-matrix__quadrant--low">Low evidence<br />Low value</div>
            <div className="skills-matrix__mobile-axis" aria-hidden="true">Evidence quality ↑</div>
            <div className="skills-matrix__axis skills-matrix__axis--y" aria-hidden="true"><span>Strong evidence</span><span>Weak evidence</span></div>
            <div className="skills-matrix__axis skills-matrix__axis--x" aria-hidden="true"><span>Lower value</span><span>Higher value</span></div>
            <div className="skills-matrix__plot">
              {visibleSkills.map((skill) => (
                <button
                  className={`skills-point${selectedId === skill.id ? " skills-point--selected" : ""}`}
                  key={skill.id}
                  style={pointStyle(skill)}
                  type="button"
                  data-skill-id={skill.id}
                  data-quadrant={pointPosition(skill).quadrant}
                  aria-label={`${skill.name}. ${skill.area}. Evidence quality ${Math.round(skill.evidenceQuality * 100)} percent. Outcome value ${Math.round(skill.value * 100)} percent.`}
                  aria-pressed={selectedId === skill.id}
                  onClick={() => setSelectedId(skill.id)}
                >
                  <span>{skill.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="skills-mobile-list" aria-label="Skills list">
            {visibleSkills.map((skill) => (
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
                  <div><dt>Evidence quality</dt><dd>{Math.round(selectedSkill.evidenceQuality * 100)}%</dd></div>
                  <div><dt>Impact signal</dt><dd>{Math.round(selectedSkill.impact * 100)}%</dd></div>
                </dl>
                <span className="skills-detail__area">{selectedSkill.area}</span>
                <button className="content-surface__action" type="button" onClick={() => onExploreNode?.(selectedSkill.nodeId)}>Explore {selectedSkill.name} context <span aria-hidden="true">→</span></button>
              </>
            ) : (
              <>
                <p className="content-surface__eyebrow">Read the matrix</p>
                <h2>Choose a skill</h2>
                <p>Select a point to see its definition, score signals, and related Reality Orbit context.</p>
              </>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
