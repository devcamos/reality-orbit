# Reality Orbit

Reality Orbit is an expandable spatial destination map. Reality begins at the centre with its five canonical dimensions. **Understand** teaches every selected concept through Concept Anatomy, while **Explore selected** focuses any non-root concept. Focusing a container reveals its curated children; focusing a terminal concept establishes the final exploration endpoint. Reality is the only node that offers **Understand** without **Explore**.

Selecting a node updates the permanent detail strip with its name, type, and explanation. Canonical paths, parents, typed relationships, and child IDs remain internal application context for traversal, validation, and a future grounded chat integration; they are not displayed as teaching content. Floating explanation cards are deliberately excluded because they can cover an unrelated destination and falsely imply that the explanation belongs to it.

The Understand view uses an editorial Concept Anatomy layout: the concept and definition establish the header, one dominant story card presents the governing idea and foundations, a context rail highlights scope, application, and limits, and specialised supporting fields remain available below. This presentation hierarchy is derived from each node's existing anatomy rather than introducing a second content model.

The app distinguishes its simple visual navigation from the canonical ontology:

- Reality's immediate children are Domain, Category, Time, Scale, and Perspective.
- Category contains Entity, Relationship, Process, Resource, Environment, and Knowledge.
- Knowledge, Resource, Process, and Relationship are never presented as top-level siblings of Category.
- Knowledge contains seven first-class artifact types: Law, Principle, Razor, Framework, Model, Theorem, and Pattern.
- Every canonical dimension exposes a third level, and the Knowledge → Law path continues through named-law instances.
- The ontology stops at level 4 when Reality is counted as level 0: Reality → Dimension → Value/type → Subtype → Instance.
- Every concept receives a baseline, role-aware Concept Anatomy covering purpose, governing question, first principles, mental model, scope, use, and common confusion.
- Relationship, process, resource, and domain concepts receive reasoning appropriate to their actual role rather than the former generic ontology-node fallback.
- Authored anatomy overrides the baseline when a concept needs a specialised teaching structure. Amdahl's Law provides the first law-specific anatomy; Ownership is the reference terminal relationship anatomy.
- Startup and production checks reject missing labels, definitions, paths, children, roles, and Concept Anatomy fields before incomplete knowledge can be presented.

The visual language has explicit meaning: size represents navigation prominence, position is a stable map location, colour identifies the canonical dimension, rings show selection, connections carry typed relationships, brightness shows availability or focus, and the diamond shape identifies an instance.

On mobile, the same map remains spatial rather than becoming a separate product experience. The current destination replaces the full visible breadcrumb, the actions become full-width touch targets, long node labels remain readable, and the same permanent detail strip carries the selection explanation.

## Product boundary

This prototype is independent from Law Explorer. Law Explorer remains a law-only product; Reality Orbit tests a reusable spatial interface for broader knowledge ontology.

## Files

- `index.html` — standalone production document served by Vercel.
- `src/reality-orbit.html` — readable visualization source fragment.
- `RUNBOOK.md` — architecture, interaction, testing, and release runbook.
- `scripts/verify.mjs` — dependency-free production validation.
- `vercel.json` — security headers and static deployment configuration.

The repository is the source of truth for the published interaction and its curated ontology data. Notion remains the research and governance workspace.

## Validate locally

Run the unit tests to traverse every selection and prove the root-aware action and data-completeness contracts.

```bash
npm test
```

Ontology levels are zero-based from Reality: Reality is level 0 and a named law such as Amdahl's Law is level 4. The test suite rejects any branch that terminates before level 4, any node beyond level 4, or any level-4 node with children.

Run the complete production gate—including the static safeguards and unit tests—with:

```bash
npm run check
```

Open `index.html` directly or serve this directory with a local static server.

```bash
npm run start
```

The local preview is then available at `http://127.0.0.1:4175/`.

## Release workflow

```text
Local source
    ↓ commit and push
GitHub main branch
    ↓ Vercel Git integration
Vercel production deployment
    ↓ public verification
Production URL
```

The first release creates the GitHub and Vercel projects and connects them. After that, a push to `main` becomes the normal production deployment trigger. The Vercel project must not be deployed separately from CI for routine releases because that would bypass the repository as the source of truth.

See [RUNBOOK.md](./RUNBOOK.md) for detailed checks and decision boundaries.
