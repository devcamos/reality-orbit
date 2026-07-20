# Reality Orbit JavaScript Visualization Runbook

## Purpose

Build and test a reusable orbit-screen visualization for connected knowledge concepts. The root view places **Reality** at the centre and arranges eight high-value navigation shortcuts around it:

```text
                 Domain

      Knowledge         Category


 Scale      ☀ Reality      Time


     Resources      Processes

          Relationships
```

This is a separate visualization prototype. It must not be added to Law Explorer because Law Explorer has a law-only product boundary.

## Source files

- Editable visualization fragment: `reality-orbit.html` in the thread visualization directory.
- Standalone test app: `index.html` in this directory.
- Reusable process and decisions: this runbook.

## Canonical ontology model

The authoritative top-level dimensions are:

```text
Reality
├── Domain
├── Category
├── Time
├── Scale
└── Perspective
```

The original orbit remains useful as navigation, but four shortcuts resolve through Category:

```text
Knowledge     → Reality → Category → Knowledge
Resources     → Reality → Category → Resource
Processes     → Reality → Category → Process
Relationships → Reality → Category → Relationship
```

This gives the interface eight memorable entry points without asserting that all eight are canonical top-level dimensions. Perspective remains in the canonical model and can be introduced as a navigation view when its first curated expansion is approved.

## Visual model

- **Centre:** Reality is the root reference point; the currently explored concept becomes the centre at deeper levels.
- **Root orbit:** Domain, Knowledge, Category, Scale, Time, Resources, Processes, and Relationships.
- **Orbit rings:** communicate shared context without claiming a strict hierarchy.
- **Centre-to-node connections:** show that each dimension is a lens on Reality.
- **Active connection:** only the selected node and its relationship to Reality receive emphasis.
- **Expansion:** exploring a selected node moves it to the centre and reveals one level of immediate children.
- **Path and Back:** expose the canonical location and allow reversible traversal.

The visual language may feel like a restrained space-navigation screen, but it should not copy Destiny assets, logos, icons, or screen layouts.

## JavaScript architecture

The visualization is intentionally dependency-free.

### Data contract

Each ontology node is defined once:

```js
{
  id: "domain",
  label: "Domain",
  summary: "The broad area of reality being studied.",
  canonicalPath: ["Reality", "Domain"],
  children: ["physical", "biological", "psychological", "social"]
}
```

- `id` is the stable relationship key.
- `label` is the visible and accessible name.
- `summary` is the single-line selected-state explanation.
- `canonicalPath` states where the node sits in the authoritative ontology.
- `children` contains only immediate, curated children.
- The root retains explicit percentage positions; expanded orbits calculate even positions from child count.

### Rendering sequence

1. Read the current centre node from the ontology map.
2. Read only its immediate `children`.
3. Create one SVG connection and native button for every child.
4. Create the current node as the centre button.
5. Select a child to inspect its definition and canonical path.
6. Explore a curated child to push it into the history and rerender it as the centre.
7. For an uncurated child, copy the strict expansion brief instead of inventing descendants.

### State transition

`setSelectedNode(id)` performs four updates from one source of truth:

1. Sets `aria-pressed` on the selected button.
2. Sets `data-active` on the matching SVG connection.
3. Updates the live selected label and summary.
4. Offers either **Explore** or **Copy expansion brief** according to whether curated children exist.

`history` stores the reversible centre path. Do not create separate view state for buttons, connections, text, and navigation; derive them from `selectedId`, the current history entry, and the ontology map.

## Canonical Ontology Expansion Contract

Use this request whenever a selected node has not yet been curated:

```text
You are expanding the Canonical Reality Ontology.

This ontology is the source of truth. Do not redesign, rename, merge,
remove, or reorder existing canonical nodes unless explicitly instructed.

Expand: [canonical path]

Expansion Rules
1. Expand only the requested node.
2. Expand exactly one level deeper.
3. Return between 5 and 10 Pareto-essential children.
4. Children should collectively cover the parent.
5. Children should be mutually exclusive where practical.
6. Prefer timeless concepts over current implementations, tools, or technologies.
7. Give every child a name and one-line description.
8. Preserve the existing ontology naming conventions.
9. If multiple taxonomies exist, choose the most widely accepted and explain the rationale.
10. Never expand grandchildren unless explicitly requested.

Output Format
Parent
├── Child 1
│   One-line description
├── Child 2
│   One-line description
…

Validation Checklist
✓ One level only
✓ Pareto: 5–10 children
✓ Canonical terminology
✓ No duplicated concepts
✓ Covers the parent
✓ Suitable for long-term navigation
✓ Stable across industries and time

If the requested node exists, expand it. If it does not exist, explain why
and suggest the closest valid canonical node. Never modify the canonical
ontology while expanding it.
```

Review and approve the returned concepts in Notion first. Only then add them to the application ontology. This preserves the boundary between research and published knowledge.

## Layout rules

- Use percentage coordinates so the topology survives resizing.
- Preserve the user-provided spatial order.
- Keep the current explored concept fixed at the centre.
- Use an SVG `viewBox="0 0 100 100"` so connections share the same coordinate system as the HTML buttons.
- At narrow widths, increase vertical space and allow the selected explanation to stack.
- Do not use viewport-height layouts, fixed positioning, or horizontal scrolling.

## Interaction and accessibility contract

- Every selectable node is a native `button`.
- Selection is exposed through `aria-pressed`.
- The SVG has a title and description.
- The selected explanation uses `aria-live="polite"`.
- Keyboard focus order follows the conceptual reading order: Domain, Knowledge, Category, Scale, Time, Resources, Processes, Relationships, Reality.
- Motion is limited to state transitions and disabled when reduced motion is requested.

## Test procedure

### Functional checks

1. Confirm nine buttons render at root: eight shortcuts plus Reality.
2. Select every node once.
3. Confirm exactly one button is pressed after each selection.
4. Confirm exactly one centre-to-node connection is active for an orbiting node.
5. Explore Domain and confirm it becomes the centre with seven domain children.
6. Explore Social and confirm it becomes the centre with eight immediate children.
7. Use Back twice and confirm the Reality orbit is restored.
8. Select an uncurated child and confirm the expansion brief can be copied.
9. Confirm the selected label and summary match the node data.

### Responsive checks

Test at:

- 736 px wide: all nodes remain separated and the map reads as an orbit.
- 390 px wide: no horizontal overflow, clipping, or overlapping labels.
- 320 px wide: buttons remain reachable and selected text stacks below the visual.

### Browser checks

- No JavaScript errors or warnings.
- Every button works with keyboard activation.
- The first render is meaningful before any interaction.
- Light and dark themes retain visible rings, labels, focus, and active connections.

## Local preview

From the visualization plugin directory, render the fragment as a standalone document:

```bash
python3 scripts/render.py /absolute/path/to/reality-orbit.html /absolute/path/to/reality-orbit-prototype/index.html
```

Serve the prototype directory with any local static server, then open `index.html`.

## Production release

### One-time bootstrap

1. Create the `reality-orbit` GitHub repository.
2. Push the complete local `main` branch.
3. Create the Vercel project from this directory.
4. Connect the Vercel project to `devcamos/reality-orbit`.
5. Confirm `main` is the production branch.
6. Deploy and record the production URL.

### Routine release

1. Run `npm run check`.
2. Review the complete diff and confirm it contains only Reality Orbit changes.
3. Commit the validated source.
4. Push `main` to GitHub.
5. Let the Vercel Git integration create the production deployment.
6. Verify the public page, all node interactions, responsive layout, and browser console.
7. Record the commit and production result in the release handoff.

### Rollback

Use Vercel’s deployment history to promote the last known-good deployment, then revert the faulty Git commit so the repository and production state agree again.

## Source-of-truth boundary

- **Notion:** research, proposals, discussion, approvals, and ontology governance.
- **Repository:** canonical published nodes, relationships, descriptions, interaction, and tests.
- **Vercel:** delivery of the repository's production build.

Published ontology changes require an intentional commit so they are versioned, reviewable, and reversible.

## Reuse checklist

When applying the orbit screen to another knowledge set:

1. Keep one explicit centre concept.
2. Limit the first orbit to roughly five to nine peers.
3. Replace only the node data before changing the renderer.
4. Write one precise relationship summary per node.
5. Add edges only when their meaning can be named.
6. Use a hierarchy view instead if parent-child ownership is the main relationship.
7. Use a dependency graph instead if prerequisite order is the main relationship.

## Test evidence — 20 July 2026

- Nine buttons rendered at root: eight navigation shortcuts and Reality.
- Domain expanded to seven immediate domains and became the new centre.
- Social expanded one level deeper to eight immediate children.
- Back navigation restored Domain and then the original Reality orbit.
- An uncurated Governance node produced and copied the strict canonical expansion brief.
- Every selection updated `aria-pressed`, the active SVG connection, the action, and the live explanation from one selected ID.
- At 390 px and 736 px, no buttons overlapped and no horizontal overflow appeared.
- Browser console scan returned no warnings or errors.

## Decision record

- **Chosen:** a lightweight HTML, SVG, CSS, and JavaScript prototype.
- **Reason:** it tests spatial interaction and responsive behaviour without introducing a framework or graph library.
- **Implemented:** deterministic one-level zooming, canonical paths, back navigation, and expansion-brief generation.
- **Deferred:** physics simulation, dragging, persistence, route navigation, and external content loading.
- **Promotion condition:** add a framework or graph library only when node counts, authoring workflow, or edge routing becomes complex enough to justify it.
