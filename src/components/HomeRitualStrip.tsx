import { useEffect, useMemo, useState, type FormEvent, type ReactElement } from "react";
import {
  briefFromWeekly,
  buildConceptBriefMarkdown,
  buildTeachCardMarkdown,
  copyText,
  downloadTextFile,
} from "../lib/concept-export";
import {
  loadLastExploredNode,
  loadPersonalMap,
  loadWeekActivity,
  openThreads,
  practicedConcepts,
  touchWeekActivity,
  upsertPersonalConcept,
  type LastExploredNode,
  type PersonalConceptEntry,
  type PersonalRealityMap,
  type WeekActivity,
} from "../lib/progress-store";
import {
  getWeeklyConcept,
  noteBySlug,
  skillById,
} from "../lib/weekly-ritual";

interface AnatomyBrief {
  readonly definition?: string;
  readonly decisionRule?: string;
  readonly example?: string;
}

interface HomeRitualStripProps {
  readonly lastNode?: LastExploredNode;
  readonly anatomyBrief?: AnatomyBrief;
  readonly onExploreNode: (nodeId: string) => void;
  readonly onOpenSkills: (skillId?: string) => void;
  readonly onOpenFieldNote: (slug: string) => void;
  readonly onRequestBrief?: (nodeId: string) => void;
  readonly onPracticeMarked?: (activity: WeekActivity) => void;
}

export function HomeRitualStrip({
  lastNode: lastNodeProp,
  anatomyBrief,
  onExploreNode,
  onOpenSkills,
  onOpenFieldNote,
  onRequestBrief,
  onPracticeMarked,
}: HomeRitualStripProps): ReactElement {
  const weekly = useMemo(() => getWeeklyConcept(), []);
  const relatedSkill = skillById(weekly.relatedSkillId);
  const relatedNote = noteBySlug(weekly.relatedNoteSlug);
  const [activity, setActivity] = useState(loadWeekActivity);
  const [personalMap, setPersonalMap] = useState<PersonalRealityMap>(loadPersonalMap);
  const [personalDraft, setPersonalDraft] = useState("");
  const [exportStatus, setExportStatus] = useState<string>();
  const lastNode = lastNodeProp ?? loadLastExploredNode();
  const continuePath = lastNode?.path?.length
    ? lastNode.path.join(" → ")
    : lastNode?.label;
  const personalEntry = personalMap[weekly.nodeId];
  const practiced = practicedConcepts(personalMap).slice(0, 4);
  const threads = openThreads(personalMap).slice(0, 3);
  const focusSkill = skillById(activity.focusSkillId ?? weekly.relatedSkillId);

  useEffect(() => {
    setActivity(loadWeekActivity());
    setPersonalMap(loadPersonalMap());
  }, [lastNodeProp?.nodeId, lastNodeProp?.updatedAt]);

  useEffect(() => {
    // Ensure the week has a skill focus tied to this week’s concept when natural.
    if (weekly.relatedSkillId && activity.focusSkillId !== weekly.relatedSkillId && !activity.focusSkillId) {
      setActivity(touchWeekActivity({ focusSkillId: weekly.relatedSkillId }));
    }
  }, [weekly.relatedSkillId, activity.focusSkillId]);

  useEffect(() => {
    onRequestBrief?.(weekly.nodeId);
  }, [weekly.nodeId, onRequestBrief]);

  const markPractice = (): void => {
    const map = upsertPersonalConcept({
      nodeId: weekly.nodeId,
      label: weekly.label,
      practiced: true,
      openThread: false,
    });
    setPersonalMap(map);
    const next = touchWeekActivity({
      practiceCompleted: true,
      focusSkillId: weekly.relatedSkillId,
      nodeId: weekly.nodeId,
    });
    setActivity(next);
    onPracticeMarked?.(next);
  };

  const savePersonalNote = (event: FormEvent): void => {
    event.preventDefault();
    if (!personalDraft.trim()) return;
    const map = upsertPersonalConcept({
      nodeId: weekly.nodeId,
      label: weekly.label,
      example: personalDraft,
      openThread: true,
    });
    setPersonalMap(map);
    setPersonalDraft("");
  };

  const exportBrief = async (mode: "brief" | "teach" | "download"): Promise<void> => {
    const fields = briefFromWeekly(weekly, personalEntry, anatomyBrief);
    const markdown = mode === "teach"
      ? buildTeachCardMarkdown(fields)
      : buildConceptBriefMarkdown(fields);
    if (mode === "download") {
      downloadTextFile(`${weekly.nodeId}-brief.md`, buildConceptBriefMarkdown(fields));
      setExportStatus("Downloaded markdown brief");
      return;
    }
    const ok = await copyText(markdown);
    setExportStatus(ok
      ? (mode === "teach" ? "Teach card copied" : "Brief copied to clipboard")
      : "Copy failed — try Download instead");
  };

  const changedBits = [
    activity.exploredNodeIds.length > 0
      ? `${activity.exploredNodeIds.length} concept${activity.exploredNodeIds.length === 1 ? "" : "s"} explored`
      : null,
    activity.skillIdsWithNotes.length > 0
      ? `${activity.skillIdsWithNotes.length} skill${activity.skillIdsWithNotes.length === 1 ? "" : "s"} with new evidence`
      : null,
    activity.practiceCompleted ? "practice marked done" : null,
    practiced.length > 0 ? `${practiced.length} on your personal map` : null,
  ].filter(Boolean);

  return (
    <section className="home-ritual" aria-label="This week’s understanding ritual" data-home-ritual>
      <div className="home-ritual__inner">
        <article className="home-ritual__card home-ritual__card--focus">
          <p className="home-ritual__eyebrow">This week’s concept</p>
          <h2 className="home-ritual__title">{weekly.label}</h2>
          <p className="home-ritual__body">{weekly.whyItMatters}</p>
          <div className="home-ritual__actions">
            <button
              className="home-ritual__action home-ritual__action--primary"
              type="button"
              data-weekly-concept
              onClick={() => onExploreNode(weekly.nodeId)}
            >
              Open {weekly.label} <span aria-hidden="true">→</span>
            </button>
            {relatedNote && (
              <button
                className="home-ritual__action"
                type="button"
                onClick={() => onOpenFieldNote(relatedNote.slug)}
              >
                Read field note
              </button>
            )}
            {relatedSkill && (
              <button
                className="home-ritual__action"
                type="button"
                onClick={() => onOpenSkills(relatedSkill.id)}
              >
                Related skill
              </button>
            )}
          </div>
        </article>

        <article className="home-ritual__card">
          <p className="home-ritual__eyebrow">Continue</p>
          {lastNode ? (
            <>
              <h2 className="home-ritual__title home-ritual__title--compact">{lastNode.label}</h2>
              <p className="home-ritual__body home-ritual__path" title={continuePath}>{continuePath}</p>
              <button
                className="home-ritual__action home-ritual__action--primary"
                type="button"
                data-continue-path
                onClick={() => onExploreNode(lastNode.nodeId)}
              >
                Resume path <span aria-hidden="true">→</span>
              </button>
            </>
          ) : (
            <>
              <h2 className="home-ritual__title home-ritual__title--compact">No path yet</h2>
              <p className="home-ritual__body">Select any destination in the orbit. Your last path will wait here.</p>
            </>
          )}
          {focusSkill && (
            <p className="home-ritual__focus" data-skill-focus>
              <span className="home-ritual__eyebrow">Skill focus</span>
              <button className="home-ritual__action" type="button" onClick={() => onOpenSkills(focusSkill.id)}>
                {focusSkill.name}
              </button>
            </p>
          )}
        </article>

        <article className="home-ritual__card home-ritual__card--practice">
          <p className="home-ritual__eyebrow">Practice this week</p>
          <h2 className="home-ritual__title home-ritual__title--compact">One concrete move</h2>
          <p className="home-ritual__body">{weekly.practicePrompt}</p>
          <form className="home-ritual__personal-form" onSubmit={savePersonalNote}>
            <label>
              <span className="visually-hidden">Personal example or decision rule</span>
              <input
                value={personalDraft}
                maxLength={220}
                placeholder="My example or decision rule…"
                onChange={(event) => setPersonalDraft(event.target.value)}
                data-personal-note-input
              />
            </label>
            <button className="home-ritual__action" type="submit" disabled={!personalDraft.trim()}>
              Save to my map
            </button>
          </form>
          {personalEntry?.example && (
            <p className="home-ritual__body home-ritual__personal-saved" data-personal-example>
              Saved: {personalEntry.example}
            </p>
          )}
          <div className="home-ritual__actions">
            <button
              className={`home-ritual__action${activity.practiceCompleted ? " home-ritual__action--done" : " home-ritual__action--primary"}`}
              type="button"
              data-weekly-practice
              aria-pressed={activity.practiceCompleted}
              onClick={markPractice}
            >
              {activity.practiceCompleted ? "Practice marked" : "Mark practice done"}
            </button>
          </div>
        </article>

        <article className="home-ritual__card home-ritual__card--export" data-concept-export>
          <p className="home-ritual__eyebrow">Leave with something usable</p>
          <h2 className="home-ritual__title home-ritual__title--compact">Export {weekly.label}</h2>
          <p className="home-ritual__body">
            Copy a short brief (definition, decision rule, example/practice) or a three-minute teach card.
          </p>
          <div className="home-ritual__actions">
            <button className="home-ritual__action home-ritual__action--primary" type="button" data-export-brief onClick={() => void exportBrief("brief")}>
              Copy brief
            </button>
            <button className="home-ritual__action" type="button" data-export-teach onClick={() => void exportBrief("teach")}>
              Teach in 3 min
            </button>
            <button className="home-ritual__action" type="button" data-export-download onClick={() => void exportBrief("download")}>
              Download .md
            </button>
          </div>
          {exportStatus && <p className="home-ritual__export-status" aria-live="polite">{exportStatus}</p>}
        </article>

        {(practiced.length > 0 || threads.length > 0) && (
          <div className="home-ritual__map" data-personal-map aria-label="Personal Reality Map">
            <p className="home-ritual__eyebrow">Personal Reality Map</p>
            <div className="home-ritual__map-columns">
              {practiced.length > 0 && (
                <div>
                  <h3>Practiced</h3>
                  <ul>
                    {practiced.map((entry) => (
                      <PersonalChip key={entry.nodeId} entry={entry} onExploreNode={onExploreNode} />
                    ))}
                  </ul>
                </div>
              )}
              {threads.length > 0 && (
                <div>
                  <h3>Open threads</h3>
                  <ul>
                    {threads.map((entry) => (
                      <PersonalChip key={entry.nodeId} entry={entry} onExploreNode={onExploreNode} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {changedBits.length > 0 && (
          <p className="home-ritual__summary" data-weekly-summary aria-live="polite">
            <span className="home-ritual__eyebrow">What changed</span>
            <span>{changedBits.join(" · ")}</span>
          </p>
        )}
      </div>
    </section>
  );
}

function PersonalChip({
  entry,
  onExploreNode,
}: {
  readonly entry: PersonalConceptEntry;
  readonly onExploreNode: (nodeId: string) => void;
}): ReactElement {
  return (
    <li>
      <button className="home-ritual__chip" type="button" onClick={() => onExploreNode(entry.nodeId)}>
        {entry.label}
      </button>
    </li>
  );
}
