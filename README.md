# Reality Orbit

Reality Orbit is an expandable spatial destination map. Reality begins at the centre with its five canonical dimensions. Selecting any concept automatically updates its adjacent **Concept Anatomy** view; no separate Understand action is required. The contextual **Explore {node}** action focuses any non-root concept and adopts that node's dimension colour. Focusing a container reveals its curated children; focusing a terminal concept establishes the final exploration endpoint.

## Operating runbook

**Checklist (live):** [Reality Orbit](https://app.notion.com/p/3be7233a96ec815f813bf14e529f1e3c)  
Tick boxes on Notion. Do not copy the checklist into git.

**Local:** http://localhost:4175  
**GitHub:** https://github.com/devcamos/reality-orbit  
**Pipeline:** PR [verify.yml](https://github.com/devcamos/reality-orbit/actions/workflows/verify.yml) · [playwright.yml](https://github.com/devcamos/reality-orbit/actions/workflows/playwright.yml) · Preview Health [preview-health.yml](https://github.com/devcamos/reality-orbit/actions/workflows/preview-health.yml). Preview ≠ Production.  
**Production:** https://reality-orbit.vercel.app  
**Surface:** local + Preview. Pipeline on Preview is not a new Production GO.

Selecting a node updates the permanent detail strip with its name, type, and explanation. Canonical paths, parents, typed relationships, and child IDs remain internal application context for traversal, validation, and a future grounded chat integration; they are not displayed as teaching content. Floating explanation cards are deliberately excluded because they can cover an unrelated destination and falsely imply that the explanation belongs to it.

On larger screens, the Concept Anatomy view remains alongside the orbit map so selection changes meaning without removing spatial context. It uses an editorial layout: the concept and definition establish the header, one dominant story card presents the governing idea and foundations, a context rail highlights scope, application, and limits, and specialised supporting fields remain available below. This presentation hierarchy is derived from each node's existing anatomy rather than introducing a second content model.

The app distinguishes its simple visual navigation from the canonical ontology:

- Reality's immediate children are Domain, Category, Time, Scale, and Perspective.
- Category contains Entity, Relationship, Process, Resource, Environment, and Knowledge.
- Knowledge, Resource, Process, and Relationship are never presented as top-level siblings of Category.
- Knowledge contains seven first-class artifact types: Law, Principle, Razor, Framework, Model, Theorem, and Pattern.
- Psychological covers Cognition, Emotion, Motivation, Behaviour, Development, and Individual differences, while retaining Evolutionary psychology as an explicitly cross-cutting approach. Within Individual differences, Personality, Temperament, Character, Values, and Abilities are peer concepts; Character is not modelled as a subtype of Personality.
- A curated concept may be terminal before level 4 when it is already meaningful and no next level has been approved. Emotion, Motivation, Behaviour, and Development deliberately stop at level 3; the Knowledge → Law path continues to named-law instances at level 4.
- Navigation is curated rather than quota-driven: a concept exposes only its approved next concepts, whether that is one or many. A small branch is valid when no additional relationship is ready to teach.
- [V1 curation data](data/v1-curation.json) explicitly records the scope, decision, and approved terminal paths for every published branch. The release tests fail if a path changes without that review being updated.
- The ontology never exceeds level 4 when Reality is counted as level 0. Level 4 is a maximum, not a required target.
- Every concept receives a baseline, role-aware Concept Anatomy covering purpose, governing question, first principles, mental model, scope, use, and common confusion.
- Relationship, process, resource, and domain concepts receive reasoning appropriate to their actual role rather than the former generic ontology-node fallback.
- Authored anatomy overrides the baseline when a concept needs a specialised teaching structure. Amdahl's Law provides the first law-specific anatomy; Environment provides the first context-system anatomy with boundaries, variables, mechanisms, feedback, and related concepts.
- Startup and production checks reject missing labels, definitions, paths, children, roles, and Concept Anatomy fields before incomplete knowledge can be presented.

The visual language has explicit meaning: size represents navigation prominence, position is a stable map location, colour identifies the canonical dimension, rings show selection, connections carry typed relationships, brightness shows availability or focus, and the diamond shape identifies an instance. The five root dimensions also use restrained semantic materials—rock, facets, rings, nested scales, and refraction—while Reality alone receives the stable warm-sun treatment. The original deep-space background creates a quiet-observatory setting but carries no ontology meaning.

On mobile, the same map remains spatial rather than becoming a separate product experience. The current destination replaces the full visible breadcrumb, the actions become full-width touch targets, long node labels remain readable, and the same permanent detail strip carries the selection explanation.

## Product boundary

This prototype is independent from Law Explorer. Law Explorer remains a law-only product; Reality Orbit tests a reusable spatial interface for broader knowledge ontology.

## Files

- `index.html` — Vite application entry for the production React shell.
- `src/App.tsx` — typed application composition and compatibility-frame boundary.
- `src/components/` — reusable lifecycle, loading, and error-recovery components.
- `legacy-index.html` — generated compatibility frame for the proven ontology engine during its incremental migration.
- `assets/observatory-deep-space.webp` — compact original background asset used by the standalone and source views.
- `src/reality-orbit.html` — readable visualization source fragment.
- `RUNBOOK.md` — architecture, interaction, testing, and release runbook.
- `scripts/verify.mjs` — dependency-free production validation.
- `data/v1-curation.json` — editorial approval record for the published V1 branches and terminal paths.
- `vercel.json` — security headers and static deployment configuration.

The repository is the source of truth for the published interaction and its curated ontology data. Notion remains the research and governance workspace.

The Skills matrix is an analytical view over `Psychological → Individual Differences → Abilities`. Its initial points are local seeded signals that compare outcome value with evidence quality; they are not additional canonical ontology nodes or objective rankings. Selecting a point can return to its related Reality Orbit concept.

Admin authoring is intentionally available only from the local Vite development server. Production builds do not render the authoring controls, and the connected Life World API remains responsible for enforcing admin authentication and authorization.

## Agent guidance tree

`AGENTS.md` is the repository source of truth for agent behaviour and routing. The root charter stays concise; scoped guidance is layered near the work it governs:

- [`docs/AGENTS.md`](docs/AGENTS.md) — business requirements, product documentation, research and decisions.
- [`data/AGENTS.md`](data/AGENTS.md) — canonical ontology, curation and level boundaries.
- [`src/AGENTS.md`](src/AGENTS.md) — application experience, frontend engineering and accessibility.
- [`tests/AGENTS.md`](tests/AGENTS.md) — tests, CI, generated artifacts and release verification.

The live product and business backlog remains in the [Reality Orbit Backlog](https://app.notion.com/p/b52c7cc96b124a43a8a1c0606e0cb187). Agents should read the relevant scope file and linked backlog specification before changing code.

## Validate locally

Run the unit tests to traverse every selection and prove the root-aware action and data-completeness contracts.

```bash
npm test
```

Ontology levels are zero-based from Reality: Reality is level 0 and a named law such as Amdahl's Law is level 4. The test suite permits editorially approved terminals at earlier levels, rejects any node beyond level 4, and rejects level-4 nodes with children.

Run the complete production gate—including the static safeguards and unit tests—with:

```bash
npm run check
```

Rebuild the committed compatibility frame and reject source/output drift with:

```bash
npm run check:generated
```

Create the optimised Vite deployment in `dist/` with:

```bash
npm run build
```

Exercise the same local server, document, headers, asset delivery, and failure responses used by browser testing with:

```bash
npm run test:smoke
```

Run the browser-level Reality Orbit journeys with:

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright starts the local preview automatically. CI runs the same journeys in Chromium with one worker, reduced motion, retries, traces, screenshots, videos, an HTML report, an accessibility-tree snapshot, and an automated accessibility scan.

Start the typed React/Vite application locally with:

```bash
npm run start
```

The local preview is available at `http://127.0.0.1:4175/` and on the host machine's LAN address at port `4175`. Vite prints the network URL when the server starts; open that URL on a phone or tablet connected to the same Wi-Fi. This is intended for trusted local networks only—the development server has no production authentication boundary.

When updating the visualization fragment, run `npm run frame:desktop` to rebuild `legacy-index.html`. The React shell reads that generated frame through an explicit compatibility adapter, preserving the existing ontology behaviour while allowing application lifecycle, delivery, and future interface work to migrate incrementally.

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
