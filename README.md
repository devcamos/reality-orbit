# Reality Orbit

Reality Orbit is an expandable knowledge map. Reality begins at the centre with eight useful navigation shortcuts; exploring a node moves it to the centre and reveals exactly one level of immediate children.

The app distinguishes its simple visual navigation from the canonical ontology:

- Canonical dimensions: Domain, Category, Time, Scale, and Perspective.
- Navigation shortcuts: Domain, Knowledge, Category, Scale, Time, Resources, Processes, and Relationships.
- Knowledge, Resource, Process, and Relationship are category paths, not additional top-level dimensions.

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
