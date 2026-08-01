import { useState, type ReactElement } from "react";
import { BlogAdminPanel } from "./BlogAdminPanel";
import { FIELD_NOTE_DIMENSIONS, fieldNotes, type FieldNote } from "../lib/field-notes";

interface FieldNotesSurfaceProps {
  readonly onExploreNode?: (nodeId: string) => void;
}

const labelForNodeId = (nodeId: string): string => nodeId
  .split("-")
  .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
  .join(" ");

const localAdminEnabled = import.meta.env.DEV;

export function FieldNotesSurface({ onExploreNode }: FieldNotesSurfaceProps): ReactElement {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedSlug, setSelectedSlug] = useState<string>();
  const [notes, setNotes] = useState<readonly FieldNote[]>(fieldNotes);
  const [adminOpen, setAdminOpen] = useState(false);
  const selectedNote = notes.find((note) => note.slug === selectedSlug);
  const subcategoryFilters = [...new Set(notes.map((note) => note.subcategory).filter((subcategory): subcategory is string => Boolean(subcategory)))].sort((left, right) => left.localeCompare(right));
  const filterOptions = ["all", ...FIELD_NOTE_DIMENSIONS, ...subcategoryFilters];
  const visibleNotes = notes.filter((note) => {
      if (activeFilter === "all") return true;
      return note.dimension === activeFilter || note.subcategory === activeFilter;
    });

  if (selectedNote) {
    return (
      <section className="content-surface" aria-labelledby="field-note-reader-title" data-content-surface="field-notes">
        <div className="content-surface__inner content-surface__reader">
          <button className="content-surface__back" type="button" onClick={() => setSelectedSlug(undefined)}>← Back to field notes</button>
          <article className="blog-reader" data-blog-reader={selectedNote.slug}>
            <header className="blog-reader__header">
              <div className="blog-card__meta">
                <span>{selectedNote.category}</span>
                {selectedNote.subcategory && <span>{selectedNote.subcategory}</span>}
                <span>{selectedNote.date}</span>
              </div>
              <h1 id="field-note-reader-title">{selectedNote.title}</h1>
              <p className="blog-reader__summary">{selectedNote.summary}</p>
            </header>
            <div className="blog-reader__body">
              {selectedNote.sections.map((section) => (
                <section key={section.heading}>
                  <h2>{section.heading}</h2>
                  <p>{section.body}</p>
                </section>
              ))}
            </div>
            <div className="content-surface__tags" aria-label="Field note topics">
              {selectedNote.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <button className="content-surface__action" type="button" onClick={() => onExploreNode?.(selectedNote.primaryNodeId)}>
              Explore {labelForNodeId(selectedNote.primaryNodeId)} in Reality Orbit <span aria-hidden="true">→</span>
            </button>
          </article>
        </div>
      </section>
    );
  }

  return (
    <section className="content-surface" aria-labelledby="field-notes-title" data-content-surface="field-notes">
      <div className="content-surface__inner">
        <header className="content-surface__header content-surface__header--split">
          <div>
            <p className="content-surface__eyebrow">A layer of understanding</p>
            <h1 id="field-notes-title">Field notes</h1>
            <p className="content-surface__lead">Read an idea in its own space, then return to the map with the context intact.</p>
          </div>
          {localAdminEnabled && (
            <button className="content-surface__quiet-action" type="button" onClick={() => setAdminOpen((open) => !open)} aria-expanded={adminOpen}>
              {adminOpen ? "Close authoring" : "Admin authoring"}
            </button>
          )}
        </header>

        {localAdminEnabled && adminOpen && (
          <BlogAdminPanel
            onCancel={() => setAdminOpen(false)}
            onCreated={(note) => {
              setNotes((current) => [note, ...current]);
              setAdminOpen(false);
              setSelectedSlug(note.slug);
            }}
          />
        )}

        <div className="blog-library-layout">
          <aside className="blog-library-sidebar" aria-label="Blog discovery">
            <label className="blog-filter">
              <span>Filter field notes</span>
              <select data-blog-filter value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)}>
                {filterOptions.map((option) => (
                  <option key={option} value={option}>{option === "all" ? "All field notes" : option}</option>
                ))}
              </select>
            </label>
          </aside>
          <div className="blog-library-results">
            <div className="blog-library-toolbar" aria-live="polite">
              <span>{visibleNotes.length} {visibleNotes.length === 1 ? "field note" : "field notes"}</span>
              {activeFilter !== "all" && <span>filtered by {activeFilter}</span>}
            </div>
            {visibleNotes.length > 0 ? (
              <div className="blog-card-grid" data-blog-card-grid>
                {visibleNotes.map((note) => (
                  <button className={`blog-card blog-card--${note.category.toLowerCase().replaceAll(" ", "-")}`} data-field-note={note.slug} key={note.slug} type="button" onClick={() => setSelectedSlug(note.slug)} aria-label={`Read ${note.title}`}>
                    <span className="blog-card__media" aria-hidden="true"><span>{note.category}</span></span>
                    <span className="blog-card__body">
                      <span className="blog-card__meta">
                        <span>{note.category} → {note.subcategory ?? "Field note"}</span>
                        <span>{note.date}</span>
                      </span>
                      <strong>{note.title}</strong>
                      <span className="blog-card__summary">{note.summary}</span>
                      <span className="blog-card__tags">{note.tags.map((tag) => `#${tag}`).join("  ")}</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="blog-library-empty">No field notes match this filter yet. Try another option.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
