# Reality Orbit JavaScript Visualization Runbook

## Purpose

Build and test a reusable spatial destination map for connected knowledge concepts. The root view places **Reality** at the centre and arranges its five canonical dimensions as stable destinations around it:

```text
                 Domain

      Category     ☀ Reality     Time

           Scale        Perspective
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

Four concepts from the earlier shortcut view resolve through Category:

```text
Knowledge     → Reality → Category → Knowledge
Resources     → Reality → Category → Resource
Processes     → Reality → Category → Process
Relationships → Reality → Category → Relationship
```

They remain fully explorable, but only after the user enters Category. This keeps every root node at the same abstraction level and makes the visual structure agree with the canonical ontology.

## Visual model

- **Centre:** Reality is the root reference point; the currently explored concept becomes the centre at deeper levels.
- **Root map:** Domain, Category, Time, Scale, and Perspective.
- **Field rings:** communicate shared context without claiming scientific coordinates.
- **Centre-to-node connections:** show that each dimension is a lens on Reality.
- **Active connection:** only the selected node and its relationship to Reality receive emphasis.
- **Selection explanation:** name, knowledge role, and definition stay in the permanent detail strip below the map; floating cards never cover destinations.
- **Expansion:** exploring a selected node moves it to the centre and reveals one level of immediate children.
- **Understand action:** every selected concept, including the current centre, exposes **Understand** and opens its Concept Anatomy.
- **Explore action:** a selected concept with curated children additionally exposes **Explore selected**, keeping learning and traversal as separate decisions.
- **Path and Back:** expose the canonical location and allow reversible traversal.
- **Typed relationship:** each connection retains a machine-readable relationship so type and instance edges do not blur together; this structural value is not shown in the learner panel.

The design parent is the abstract **spatial destination map** interaction pattern. Reality Orbit inherits full-canvas exploration, stable destinations, selection, travel, return, and contextual information. It does not copy Destiny artwork, assets, logos, icons, typography, names, or screen layouts.

Visual semantics are fixed:

- Size means navigation prominence.
- Position is stable map placement, not a scientific coordinate.
- Colour identifies the canonical dimension.
- The ring communicates selection.
- A connection carries a typed relationship.
- Brightness means availability or current focus.
- A diamond identifies an instance; containers remain circular.

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
  children: ["physical", "biological", "psychological", "social"],
  relationshipToParent: "DIMENSION_OF"
}
```

- `id` is the stable relationship key.
- `label` is the visible and accessible name.
- `summary` is the single-line selected-state explanation.
- `canonicalPath` states where the node sits in the authoritative ontology.
- `children` contains only immediate, curated children.
- `relationshipToParent` is optional when a node needs a more precise edge than the renderer's canonical default.
- `buildConceptAnatomy(node)` supplies a role-aware baseline anatomy for every concept.
- `anatomy` optionally overrides that baseline with authored concept-specific teaching content and never creates ontology descendants.
- The root and common sibling counts use deterministic asymmetric layouts; map locations do not move between selections.

Canonical relationship inference distinguishes dimensions, subdomains, category types, time values, scale levels, perspective lenses, domain concepts, subtypes, and concrete instances. `CHILD_OF` is only the conservative fallback; it must not replace a more precise known relationship.

### Rendering sequence

1. Read the current centre node from the ontology map.
2. Read only its immediate `children`.
3. Create one SVG connection and native button for every child.
4. Create the current node as the centre button.
5. Select a child to read its learner-facing definition.
6. Explore a curated child to push it into the history and rerender it as the centre.
7. **Understand** opens the selected concept's anatomy without expanding the ontology; **Explore selected** alone changes the map centre.

### State transition

`setSelectedNode(id)` performs five updates from one source of truth:

1. Sets `aria-current` and `data-selected` on the selected destination.
2. Sets `data-active` on the matching SVG connection.
3. Updates the live selected label and summary.
4. Always offers **Understand** and additionally offers **Explore selected** when curated children exist.
5. Keeps internal grounded-chat context separate while showing only the selected concept's name, type, and explanation in the permanent detail strip.

`history` stores the reversible centre path. Do not create separate view state for buttons, connections, text, and navigation; derive them from `selectedId`, the current history entry, and the ontology map.

## Ask Chat context boundary

The permanent detail strip is a learner-facing projection of the selected ontology node, not a second content source. It displays only the concept's name, type, and explanation. `buildChatContext(node)` separately produces a versioned internal context object containing:

```text
schemaVersion
id
name
role
canonicalPath
parent
relationshipToParent
explanation
immediateChildren
```

Canonical path, parent, typed relationship, and immediate children are application logic. They support navigation, validation, and future grounded model requests but are deliberately excluded from the visible panel.

This distinction prevents the visible teaching layer and the internal structural layer from drifting apart:

```text
Canonical ontology node
        ↓
        ├── Visible learner explanation
        └── Internal grounded-chat context
```

The local prototype uses the internal context for navigation but does not expose raw ontology metadata or generate an answer. A future model integration should accept this object as authoritative context, keep the canonical path unchanged, and clearly distinguish retrieved ontology facts from generated explanation.

## Knowledge artifact contract

Knowledge publishes seven first-class artifact types. The node labels remain singular because each destination represents a type rather than a collection:

```text
Knowledge
├── Law       — explains a regularity, relationship, or constraint within scope
├── Principle — guides behaviour, design, or action
├── Razor     — guides reasoning by preferring or eliminating explanations
├── Framework — organises analysis, decisions, or execution
├── Model     — represents something for explanation, prediction, or design
├── Theorem   — states a proposition established through formal proof
└── Pattern   — captures a reusable response to a recurring problem
```

A razor is therefore not stored as a synonym for a heuristic. A heuristic is the broader family of practical judgment shortcuts; a named razor is a first-class reasoning artifact with its own instances, such as Occam's Razor or Hanlon's Razor.

## Five-level depth contract

The published map now supports both forms of depth agreed for the prototype:

```text
Reality
└── Canonical dimension
    └── Third-level value or type

Reality
└── Category
    └── Knowledge
        └── Law
            └── Named law
```

Instance is the maximum ontology depth, not a depth that every branch must artificially reach. A branch can stop earlier when its terminal concept is already the most specific approved type. Concept Anatomy is a teaching projection, not another ontology level.

For example, `Reality → Category → Relationship → Ownership` currently stops at a terminal relationship type. Ownership is a complete learner-facing node, but it is not yet a concrete ownership instance. A true instance would bind a particular holder, object, bundle of rights, recognising authority, and context; the application must not invent one merely to fill level five.

The renderer enforces this boundary through `canExploreNode(node)`: a level-five node never exposes traversal even if malformed future data accidentally supplies children.

Before the first render, `validateOntology()` also rejects key/ID drift, missing or duplicate child references, excessive depth, and child paths that do not extend their parent's canonical path by exactly one level.

Every concept receives this baseline anatomy:

```text
Definition — the selected concept summary shown in the Understand header
Purpose
Governing question
First principles
Mental model
Scope
How to use it
Common confusion
```

The baseline language varies by concept role: root, dimension, domain, domain concept, category type, relationship type, process type, resource type, knowledge type, named law, perspective, scale, or time. Authored `anatomy` content replaces the baseline when the subject requires a more specific structure. Amdahl's Law uses a law-specific anatomy containing variables, mechanism, prediction, assumptions, derivation, limitations, applications, visual demonstration, and related laws. Ownership is the authored reference for a terminal relationship type.

```text
Ontology answers: Where does this concept belong?
Understand answers: What does it mean and how does it behave?
```

## Content completeness contract

Every reachable node must provide a non-empty stable ID, label, one-sentence definition, canonical path, classified concept role, and Concept Anatomy containing at least seven non-empty fields. Nodes with curated children must expose Explore; all nodes must expose Understand.

Both runtime and production checks traverse from Reality and reject unreachable nodes, missing child references, incomplete definitions, unclassified roles, or empty Concept Anatomy values. “Content exists” therefore means more than a node label: the learner can select it, understand its definition, inspect its reasoning anatomy, and return safely.

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

### Mobile adaptation decisions

- Preserve the destination map and its stable positions; mobile is the same mental model, not a separate list-only interface.
- Show only the current destination visually in the compact toolbar. The complete breadcrumb remains in the accessible DOM, while **Back** carries the visible ancestry interaction.
- Move the responsive action group onto its own full-width toolbar row. **Understand** and, where available, **Explore selected** share that row as separate 44 px touch targets.
- Use the permanent detail below the map at every width as the single source of visible name, type, and explanation, avoiding duplicated information and covered destinations.
- Reduce the mobile map to 500 px high while retaining safe space around the lowest destinations. This keeps the current action and selected explanation closer to the map.
- Allow destination labels to use their complete text. Wider mobile node labels and reduced horizontal padding prevent knowledge terms such as `Psychological`, `Informational`, and `Mathematical` from being shortened.
- Collapse Concept Anatomy to one column with tighter outer padding, while retaining the same content order and native document flow.

## Interaction and accessibility contract

- Every selectable node is a native `button`.
- Selection is exposed through `aria-current` and reinforced by the visible ring.
- The SVG has a title and description.
- The selected explanation uses `aria-live="polite"`.
- Keyboard focus order follows the conceptual reading order: Domain, Category, Time, Scale, Perspective, Reality.
- Motion is limited to state transitions and disabled when reduced motion is requested.

## Test procedure

### Functional checks

1. Confirm six buttons render at root: five canonical dimensions plus Reality.
2. Select every node once.
3. Confirm exactly one destination is current after each selection.
4. Confirm exactly one centre-to-node connection is active for an orbiting node.
5. Explore Category and confirm it becomes the centre with six canonical category types.
6. Explore Resource and confirm it becomes the centre with six immediate children.
7. Use Back twice and confirm the Reality orbit is restored.
8. Explore Perspective and confirm its five approved lenses render.
9. Confirm Reality and every selected child expose **Understand**.
10. Select a concept with children and confirm **Understand** and **Explore selected** are both available.
11. Confirm selecting a node updates the permanent detail title, role, and explanation.
12. Confirm canonical path, parent, typed relationship, and immediate children are absent from the visible panel but remain available in `buildChatContext(node)`.
13. Confirm the selected label and summary match the node data.
14. Open Reality, Domain, and Razor with **Understand** and confirm each renders the baseline Concept Anatomy fields.
15. Explore Category → Knowledge → Law, select Amdahl's Law, and confirm **Understand** opens its authored law anatomy.
16. Confirm the Amdahl breadcrumb stops at the fifth ontology level while its Concept Anatomy renders as content.
17. Explore Category → Relationship → Ownership and confirm Ownership is labelled **Relationship type**, exposes its authored Concept Anatomy, and does not pretend to be a concrete instance.
18. At mobile width, confirm the action group occupies its own full-width row and Back remains at least 44 px high.
19. At mobile width, confirm only the current destination is visually shown in the toolbar while the complete path remains accessible.
20. Confirm the mobile detail shows the selected name, knowledge type, and explanation without rendering a floating overlay.

### Responsive checks

Test at:

- 736 px wide: all destinations remain separated and the map dominates the composition.
- 390 px wide: no horizontal overflow, clipped destination labels, floating selection card, or squeezed action row.
- 320 px wide: controls remain at least 44 px high, buttons remain reachable, and selected text stacks below the visual.

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

## Test evidence — 21 July 2026

- Six buttons rendered at root: five canonical dimensions and Reality.
- Category expanded to six immediate category types and became the new centre.
- Resource expanded one level deeper to six immediate children.
- Perspective expanded to five approved interpretive lenses.
- Back navigation restored Category and then the canonical Reality orbit.
- Reality, containers, and terminal concepts opened Understand without creating additional ontology levels.
- Reality and Category produced the expected internal versioned chat-context objects, including typed parent relationships, without exposing structural metadata in the learner panel.
- Category → Knowledge → Law exposed eight named-law instances.
- Amdahl's Law opened its Concept Anatomy while remaining the fifth and terminal ontology level.
- Every selection updated `aria-current`, the active SVG connection, both eligible actions, and the live permanent detail from one selected ID.
- At 736 px, 390 px, and 320 px no floating selection content covered or visually attached itself to an unrelated destination.
- At 390 px and 320 px the action moved to its own 44 px-high row, the visible path condensed to the current destination, and full destination labels remained readable.
- The complete Amdahl's Law Concept Anatomy flowed in one column at 320 px without horizontal overflow.
- At all verified widths, no buttons overlapped and no horizontal overflow appeared.
- Browser console scan returned no warnings or errors.

## Decision record

- **Chosen:** a lightweight HTML, SVG, CSS, and JavaScript prototype.
- **Reason:** it tests spatial interaction and responsive behaviour without introducing a framework or graph library.
- **Design parent:** the abstract spatial destination-map interaction pattern, implemented with original visual assets and semantic rules.
- **Corrected root:** the five canonical dimensions replaced the earlier eight-shortcut root because mixing Category with its children represented two abstraction levels as peers.
- **Implemented:** deterministic asymmetric placement, dimension colour identity, container/instance shapes, typed parent relationships, five-level navigation, and Concept Anatomy Understand views.
- **Deferred:** physics simulation, dragging, persistence, route navigation, and external content loading.
- **Promotion condition:** add a framework or graph library only when node counts, authoring workflow, or edge routing becomes complex enough to justify it.
