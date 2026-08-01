import { useState, type FormEvent, type ReactElement } from "react";
import { FIELD_NOTE_DIMENSIONS, type FieldNote } from "../lib/field-notes";

interface BlogAdminPanelProps {
  readonly onCancel: () => void;
  readonly onCreated: (note: FieldNote) => void;
}

type AdminStatus =
  | { readonly kind: "idle"; readonly message: string }
  | { readonly kind: "pending"; readonly message: string }
  | { readonly kind: "error"; readonly message: string }
  | { readonly kind: "connected"; readonly message: string };

const apiPath = (baseUrl: string, path: string): string =>
  `${baseUrl.replace(/\/$/, "")}${path}`;

const slugify = (value: string): string => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const summaryFromContent = (content: string): string => {
  const firstParagraph = content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/^#+\s*/, "").trim())
    .find(Boolean);
  return firstParagraph ?? "A new field note connected to the Reality Orbit map.";
};

export function BlogAdminPanel({ onCancel, onCreated }: BlogAdminPanelProps): ReactElement {
  const [baseUrl, setBaseUrl] = useState(import.meta.env.VITE_LIFE_WORLD_BLOG_BASE_URL ?? "http://localhost:3000");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<AdminStatus>({ kind: "idle", message: "Connect an admin session to publish." });
  const [title, setTitle] = useState("");
  const [dimension, setDimension] = useState<(typeof FIELD_NOTE_DIMENSIONS)[number]>("Category");
  const [category, setCategory] = useState("Knowledge");
  const [subcategory, setSubcategory] = useState("Paradox");
  const [tags, setTags] = useState("Feynman technique, reasoning");
  const [primaryNodeId, setPrimaryNodeId] = useState("paradox");
  const [content, setContent] = useState("");

  const connectAdmin = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setStatus({ kind: "pending", message: "Verifying the authoring session…" });
    try {
      const response = await fetch(apiPath(baseUrl, "/api/blog/categories"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("The blog service did not verify this session.");
      const profileResponse = await fetch(apiPath(baseUrl, "/api/user/profile"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = await profileResponse.json() as { isAdmin?: boolean };
      if (!profileResponse.ok || profile.isAdmin !== true) throw new Error("This account is authenticated but is not an admin.");
      setStatus({ kind: "connected", message: "Authoring session verified. The token stays in memory only." });
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Could not verify the authoring session." });
    }
  };

  const publishPost = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setStatus({ kind: "pending", message: "Publishing the field note…" });
    const tagValues = tags.split(",").map((tag) => tag.trim()).filter(Boolean);
    const slug = slugify(title);
    try {
      const response = await fetch(apiPath(baseUrl, "/api/blog/posts"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, dimension, category, subcategory, tags: tagValues, content, slug }),
      });
      const result = await response.json() as { post?: { slug?: string; date?: string }; error?: string };
      if (!response.ok || !result.post) throw new Error(result.error ?? "The blog service could not publish this note.");
      const createdNote: FieldNote = {
        slug: result.post.slug ?? slug,
        title,
        dimension,
        category,
        subcategory,
        tags: tagValues,
        date: result.post.date ?? new Date().toISOString().slice(0, 10),
        summary: summaryFromContent(content),
        primaryNodeId,
        sections: [{ heading: "Field note", body: content }],
      };
      onCreated(createdNote);
      setStatus({ kind: "connected", message: "Published and added to the local reader." });
      setTitle("");
      setContent("");
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Could not publish the field note." });
    }
  };

  const connected = status.kind === "connected";

  return (
    <section className="blog-admin" aria-labelledby="blog-admin-title" data-blog-admin>
      <div className="blog-admin__header">
        <div>
          <p className="content-surface__eyebrow">Restricted authoring</p>
          <h2 id="blog-admin-title">Create a field note</h2>
          <p>Publishing uses the authenticated Life World blog API. This browser never stores the token.</p>
        </div>
        <button className="content-surface__quiet-action" type="button" onClick={onCancel}>Close</button>
      </div>

      {!connected ? (
        <form className="blog-admin__form" onSubmit={connectAdmin}>
          <label>
            Life World API base URL
            <input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} type="url" required />
          </label>
          <label>
            Admin bearer token
            <input value={token} onChange={(event) => setToken(event.target.value)} type="password" autoComplete="off" required />
          </label>
          <button className="content-surface__action" type="submit">Verify authoring access <span aria-hidden="true">→</span></button>
        </form>
      ) : (
        <form className="blog-admin__form" onSubmit={publishPost}>
          <div className="blog-admin__grid">
            <label>
              Title
              <input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={255} />
            </label>
            <label>
              Reality dimension
              <select value={dimension} onChange={(event) => setDimension(event.target.value as (typeof FIELD_NOTE_DIMENSIONS)[number])}>
                {FIELD_NOTE_DIMENSIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label>
              Primary node ID
              <input value={primaryNodeId} onChange={(event) => setPrimaryNodeId(event.target.value)} placeholder="paradox" required />
            </label>
            <label>
              Category
              <input value={category} onChange={(event) => setCategory(event.target.value)} required />
            </label>
            <label>
              Subcategory
              <input value={subcategory} onChange={(event) => setSubcategory(event.target.value)} />
            </label>
          </div>
          <label>
            Tags, separated by commas
            <input value={tags} onChange={(event) => setTags(event.target.value)} />
          </label>
          <label>
            Article content
            <textarea value={content} onChange={(event) => setContent(event.target.value)} required rows={12} placeholder="Explain the idea plainly, then connect it back to the map." />
          </label>
          <button className="content-surface__action" type="submit">Publish field note <span aria-hidden="true">→</span></button>
        </form>
      )}
      <p className={`blog-admin__status blog-admin__status--${status.kind}`} role={status.kind === "error" ? "alert" : "status"}>{status.message}</p>
    </section>
  );
}
