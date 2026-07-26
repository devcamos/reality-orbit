# Reality Orbit

Reality Orbit is an expandable spatial destination map. Reality begins at the centre with its five canonical dimensions. Selecting any concept automatically updates its adjacent **Concept Anatomy** view; no separate Understand action is required. **Explore selected** focuses any non-root concept. Focusing a container reveals its curated children; focusing a terminal concept establishes the final exploration endpoint.

Selecting a node updates the permanent detail strip with its name, type, and explanation. Canonical paths, parents, typed relationships, and child IDs remain internal application context for traversal, validation, and a future grounded chat integration; they are not displayed as teaching content. Floating explanation cards are deliberately excluded because they can cover an unrelated destination and falsely imply that the explanation belongs to it.

On larger screens, the Concept Anatomy view remains alongside the orbit map so selection changes meaning without removing spatial context. It uses an editorial layout: the concept and definition establish the header, one dominant story card presents the governing idea and foundations, a context rail highlights scope, application, and limits, and specialised supporting fields remain available below. This presentation hierarchy is derived from each node's existing anatomy rather than introducing a second content model.

The app distinguishes its simple visual navigation from the canonical ontology:

- Reality's immediate children are Domain, Category, Time, Scale, and Perspective.
- Category contains Entity, Relationship, Process, Resource, Environment, and Knowledge.
- Knowledge, Resource, Process, and Relationship are never presented as top-level siblings of Category.
- Knowledge contains seven first-class artifact types: Law, Principle, Razor, Framework, Model, Theorem, and Pattern.
- Every currently published branch reaches a level-4 terminal teaching concept. The Knowledge → Law path continues through named-law instances; the other dimensions and categories end in equally teachable concepts rather than empty navigation endpoints.
- Navigation is curated rather than quota-driven: a concept exposes only its approved next concepts, whether that is one or many. A small branch is valid when no additional relationship is ready to teach.
- [V1 curation data](data/v1-curation.json) explicitly records the scope, decision, and approved terminal paths for every published branch. The release tests fail if a path changes without that review being updated.
- The ontology stops at level 4 when Reality is counted as level 0: Reality → Dimension → Value/type → Subtype → terminal teachable concept.
- Every concept receives a baseline, role-aware Concept Anatomy covering purpose, governing question, first principles, mental model, scope, use, and common confusion.
- Relationship, process, resource, and domain concepts receive reasoning appropriate to their actual role rather than the former generic ontology-node fallback.
- Authored anatomy overrides the baseline when a concept needs a specialised teaching structure. Amdahl's Law provides the first law-specific anatomy; Environment provides the first context-system anatomy with boundaries, variables, mechanisms, feedback, and related concepts.
- Startup and production checks reject missing labels, definitions, paths, children, roles, and Concept Anatomy fields before incomplete knowledge can be presented.

The visual language has explicit meaning: size represents navigation prominence, position is a stable map location, colour identifies the canonical dimension, rings show selection, connections carry typed relationships, brightness shows availability or focus, and the diamond shape identifies an instance. The five root dimensions also use restrained semantic materials—rock, facets, rings, nested scales, and refraction—while Reality alone receives the stable warm-sun treatment. The original deep-space background creates a quiet-observatory setting but carries no ontology meaning.

On mobile, the same map remains spatial rather than becoming a separate product experience. The current destination replaces the full visible breadcrumb, the actions become full-width touch targets, long node labels remain readable, and the same permanent detail strip carries the selection explanation.

## Product boundary

This prototype is independent from Law Explorer. Law Explorer remains a law-only product; Reality Orbit tests a reusable spatial interface for broader knowledge ontology.

## Files

- `index.html` — standalone production document served by Vercel, with a desktop-width frame for the map and adjacent Concept Anatomy view.
- `assets/observatory-deep-space.webp` — compact original background asset used by the standalone and source views.
- `src/reality-orbit.html` — readable visualization source fragment.
- `RUNBOOK.md` — architecture, interaction, testing, and release runbook.
- `scripts/verify.mjs` — dependency-free production validation.
- `data/v1-curation.json` — editorial approval record for the published V1 branches and terminal paths.
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

Rebuild the committed standalone application and reject source/output drift with:

```bash
npm run check:generated
```

Exercise the same local server, document, headers, asset delivery, and failure responses used by browser testing with:

```bash
npm run test:smoke
```

Open `index.html` directly or serve this directory with a local static server.

```bash
npm run start
```

The local preview is then available at `http://127.0.0.1:4175/`.

When rebuilding `index.html` from the visualization fragment, run `npm run frame:desktop` after rendering. This preserves the desktop-width standalone shell required for the adjacent map and Concept Anatomy layout.

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
