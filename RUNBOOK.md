# Reality Orbit Application Runbook

## Purpose

Build and test a reusable spatial destination map for connected knowledge concepts. The root view places **Reality** at the centre and arranges its five canonical dimensions as stable destinations around it:

```text
                 Domain

      Category     ☀ Reality     Time

           Scale        Perspective
```

This is a separate visualization prototype. It must not be added to Law Explorer because Law Explorer has a law-only product boundary.

## Source files

- Editable ontology renderer and content source: `src/reality-orbit.html`.
- React/Vite application entry: `index.html` and `src/` in this directory.
- Generated ontology compatibility frame: `legacy-index.html` in this directory.
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
- **Relationship cue:** orbit position, stable hierarchy, hover feedback, the orbital cursor, and the canonical path communicate parent-child context without centre-to-node spokes.
- **Selection explanation:** name, knowledge role, and definition stay in the permanent detail strip below the map; the translucent preview moves opposite the highlighted destination.
- **Expansion:** exploring any selected non-root node moves it to the centre. Containers reveal one level of immediate children; terminal concepts become focused endpoints with no invented child level.
- **Selection and Concept Anatomy:** selecting any concept, including the current centre, automatically updates its adjacent Concept Anatomy view. The learner never needs a separate Understand action.
- **Explore action:** every selected concept except Reality exposes **Explore {node}** in the selected node's dimension colour. Explore changes the map centre; selection changes the adjacent teaching content. Once focused, the visible active state reads **Exploring {node}** rather than offering a redundant second traversal.
- **Path and Back:** expose the canonical location and allow reversible traversal.
- **Typed relationship:** every node retains a machine-readable relationship to its parent so type and instance edges do not blur together; this structural value is not drawn on the map or shown in the learner panel.

### First-contact experience

The React shell presents a short observatory introduction before it loads the map for the first time in a browser session. It answers what Reality Orbit is, teaches the three-part interaction—choose a lens, follow an orbit, build understanding—and offers one clear **Enter the observatory** action. It is a threshold, not a marketing carousel: there are no competing calls to action, account prompts, or decorative steps.

After entry, session storage prevents the introduction from interrupting refreshes during the same browser session. If storage is unavailable, entry still works. The screen shares the map's deep-space material language, stays usable at 320 px, and removes its slow ambient motion when reduced motion is requested.

### Reflective hover guidance

An original orbital reticle replaces the native mouse pointer throughout the observatory on fine-pointer devices. The segmented disk follows the user's actual pointer rather than snapping to a hovered planet, grows slightly over interactive controls, takes on a node's dimension colour when relevant, and turns its two rings slowly while active. Hovering or keyboard-focusing a node separately reveals a translucent pre-selection dossier immediately beside the highlighted destination. The dossier prefers the side with enough room, flips at an edge, and remains clamped inside the universe panel so its proximity communicates which planet it describes. It identifies the concept, explains it in one line, presents the question it helps answer, and signals whether further paths are available. Root dimensions are described as **Lens on reality**, keeping the underlying ontology role without repeating the implied word **Dimension**.

The dossier is a shared accessible tooltip associated with each node through `aria-describedby`. It is click-through and does not compete with the planets for input. Pointer exit and keyboard blur remove it, selection remains unchanged, and touch users continue to receive the permanent selected-concept detail rather than an invented mobile hover state. Touch input shows the disk only at the active contact point and removes it shortly after the gesture. Cursor travel, ring rotation, and dossier transitions stop when reduced motion is requested. The internal `Dimension` role remains available to accessibility and ontology logic, but it is not repeated as visible metadata beneath every root destination or beside a selected root lens.

The design parent is the abstract **spatial destination map** interaction pattern. Reality Orbit inherits full-canvas exploration, stable destinations, selection, travel, return, and contextual information. It does not copy Destiny artwork, assets, logos, icons, typography, names, or screen layouts.

Visual semantics are fixed:

- Size means navigation prominence.
- Position is stable map placement, not a scientific coordinate.
- Colour identifies the canonical dimension.
- Material reinforces the five root dimensions: Domain is rocky, Category is faceted, Time carries a slow ring, Scale uses nested circles, and Perspective refracts a restrained spectrum.
- Reality alone uses a warm, breathing solar treatment. At deeper levels, the focused concept retains its dimension colour without pretending to be the ontological root.
- The ring communicates selection.
- Typed parent relationships remain structural data rather than visual spokes.
- Brightness means availability or current focus.
- A diamond identifies an instance; containers remain circular.

### Quiet-observatory art direction

The original `assets/observatory-deep-space.webp` field establishes depth without carrying ontology meaning. It stays low contrast beneath a dark readability veil so labels, focus, paths, and Concept Anatomy remain the primary information. The production gate keeps this asset below 250 KB and requires both standalone content policies to permit the local file.

The map uses cinematic light sparingly: warm light anchors Reality, blue ambient light separates the surrounding field, and dimension accents remain muted. Background drift, the Reality glow, Time's ring, node arrival, and camera easing are intentionally slow and are removed when the user requests reduced motion.

The adjacent Concept Anatomy surface is the knowledge instrument rather than decorative “mission control.” Its dark glass, restrained borders, sticky definition, and generous spacing keep the selected concept readable while preserving a visual connection to the map.

## Application architecture

Vite owns local development and the optimised production build. React and TypeScript own the application shell, loading state, failure recovery, and the lifecycle of the embedded observatory. The mature ontology renderer remains dependency-free inside `src/reality-orbit.html` and is synchronised into `legacy-index.html`.

`src/lib/orbit-document.ts` is an intentional compatibility boundary: it extracts the proven observatory document and resolves its bundled background asset before React presents it. This avoids changing the framework, ontology model, navigation engine, and visual renderer in one risky rewrite. Future features can migrate across that boundary component by component while the browser journeys continue to protect learner behaviour.

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
3. Create one native button for every child at its stable orbit position.
4. Create the current node as the centre button.
5. Select a child to read its learner-facing definition.
6. Explore a curated child to push it into the history and rerender it as the centre.
7. Selecting a concept automatically updates the adjacent Concept Anatomy without expanding the ontology; the contextual **Explore {node}** action alone changes the map centre. Reality is the only concept without Explore.

### State transition

`setSelectedNode(id)` performs four updates from one source of truth:

1. Sets `aria-current` and `data-selected` on the selected destination.
2. Updates the live selected label and summary.
3. Always renders the selected concept's Concept Anatomy; every non-root selection also offers **Explore {node}**, including terminal concepts that form the final focused endpoint.
4. Keeps internal grounded-chat context separate while showing only the selected concept's name, type, and explanation in the permanent detail strip.

`history` stores the reversible centre path. Do not create separate view state for buttons, text, and navigation; derive them from `selectedId`, the current history entry, and the ontology map.

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
terminalConcept
namedLaw
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

## Maximum depth contract

The published map supports intentional terminal concepts at different depths:

```text
Reality
└── Domain
    └── Psychological
        └── Emotion
            └── Joy                 ← ordinary level-4 terminal

Reality
└── Domain
    └── Psychological
        └── Individual differences
            └── Character            ← explicitly approved level-4 container
                └── Courage          ← exceptional level-5 terminal

Reality
└── Category
    └── Knowledge
        └── Law
            └── Named law

Reality
└── Category
    └── Environment
        └── Environment type
            └── Terminal environmental setting
```

Level 4 is the default maximum, not a target every branch must reach. A node may remain terminal before level 4 until a meaningful one-level expansion is curated. A named law, emotion family, ecosystem, workplace, community setting, online platform, or regulatory setting can be a valid level-4 terminal when it is the smallest approved unit of teaching.

Level 5 is an explicit exception, never an automatic continuation. Only a level-4 node marked with `expansionPolicy: "curated-level-five"` may have level-5 children, and every such child must be terminal. Character is the first and currently only approved container because direct access to Courage and other foundational qualities materially improves learning. Personality, Temperament, Values, Abilities, and every other unmarked level-4 concept remain terminal. Concept Anatomy is a teaching projection, not another ontology level.

Environment was the first completed non-Knowledge category branch and remains the reference context-system branch:

```text
Environment
├── Natural environment       → Ecosystem
├── Built environment         → Workplace
├── Social environment        → Community setting
├── Digital environment       → Online platform
└── Institutional environment → Regulatory setting
```

The branch demonstrates one deep completion pattern: a category explains its boundary, conditions, variables, mechanism, feedback, limits, and related concepts; its environment types classify the context; its level-4 settings make the classification teachable.

Individual differences is the theory-neutral Psychological home for five peer concepts:

```text
Psychological
└── Individual differences
    ├── Personality
    ├── Temperament
    ├── Character
    │   ├── Practical wisdom
    │   ├── Courage
    │   ├── Integrity
    │   ├── Compassion
    │   ├── Justice
    │   ├── Humility
    │   ├── Self-control
    │   └── Responsibility
    ├── Values
    └── Abilities
```

The separation protects meaning. Personality describes relatively stable patterns of thought, feeling, and behaviour. Temperament concerns early-emerging reactivity and regulation. Character concerns moral and self-regulatory qualities expressed through repeated choices and conduct. Values organise priorities, while Abilities describe capacities for learning or performance. Character is therefore not nested beneath Personality, which would make one theoretical model appear canonical for the whole ontology. Its eight published qualities are a Pareto teaching set, not an exhaustive virtue theory.

For example, `Reality → Category → Relationship → Ownership → Ownership arrangement` reaches a terminal teaching concept. The final concept binds the holder, object, bundle of rights, recognition, and conditions that make an ownership relationship concrete enough to teach without pretending it represents a particular real-world case.

The renderer counts Reality as level 0, treats level 4 as the normal boundary, and enforces level 5 as the absolute terminal boundary. Any childless node can be focused as an intentional exploration endpoint. An unmarked level-4 node cannot introduce level 5, and a level-5 node can never introduce children. Malformed future data that bypasses either rule is rejected before render.

Before the first render, `validateOntology()` also rejects key/ID drift, missing or duplicate child references, invalid expansion policies, excessive depth, and child paths that do not extend their parent's canonical path by exactly one level.

Every concept receives this baseline anatomy:

```text
Definition — the selected concept summary shown in the Concept Anatomy header
Purpose
Governing question
First principles
Mental model
Scope
How to use it
Common confusion
```

The baseline language varies by concept role: root, dimension, domain, domain concept, Character quality, category type, entity type, entity instance, environment type, environmental setting, relationship type, process type, resource type, knowledge type, named knowledge artifact, named law, perspective, scale, or time. Authored `anatomy` content replaces the baseline when the subject requires a more specific structure. Amdahl's Law uses a law-specific anatomy containing variables, mechanism, prediction, assumptions, derivation, limitations, applications, visual demonstration, and related laws. Ownership is the authored reference for a relationship type; Ownership arrangement is its terminal teaching concept.

The Concept Anatomy presentation derives one responsive story from that anatomy:

```text
Header
└── Concept role, name, and definition

Primary story
├── Governing question or problem
├── Purpose or mechanism
├── First principles
└── Mental model

Context rail
├── Scope
├── Application or how to use it
└── Common confusion or limitations

Complete anatomy
└── Any specialised supporting fields not already presented
```

This is a projection of the existing Concept Anatomy, not a new schema. Baseline concepts usually fit entirely into the primary story and context rail. Richer law anatomy retains variables, predictions, assumptions, evidence, demonstrations, and related laws in the complete section.

Every **First principles** field renders as a semantic bullet list. Semicolon-separated or independently punctuated claims become separate bullets; a single foundational claim remains one bullet. This presentation rule applies through the shared renderer, so authored and role-generated anatomy cannot silently fall back to paragraph formatting.

```text
Ontology answers: Where does this concept belong?
Concept Anatomy answers: What does it mean and how does it behave?
```

## Content completeness contract

Every reachable node must provide a non-empty stable ID, label, one-sentence definition, canonical path, classified concept role, and Concept Anatomy containing at least seven non-empty fields. Selecting any node automatically renders its Concept Anatomy. Every non-root node exposes Explore; Reality exposes no explicit action.

Both runtime and production checks traverse from Reality and reject unreachable nodes, missing child references, incomplete definitions, unclassified roles, or empty Concept Anatomy values. “Content exists” therefore means more than a node label: the learner can select it, understand its definition, inspect its reasoning anatomy, and return safely.

### Automated selection contract

`scripts/selection-contract.test.mjs` reads the same ontology and policy declarations used by the application, then tests every reachable selection. The suite proves that:

- Reality is the only node without a contextual Explore action.
- Every non-root node exposes **Explore {node}** using its dimension theme.
- Terminal concepts remain explorable as final focused destinations.
- Every ontology record is reachable from Reality.
- Every selectable node has an ID, label, definition, canonical path, classified role, and at least seven non-empty Concept Anatomy fields.
- Every child reference exists, is unique within its parent, and extends the canonical path by exactly one level.
- The visible Concept Anatomy, Explore, and active Exploring states remain wired to the shared selection policy.
- Every terminal path is recorded in editorial curation, may stop before level 4, and reaches level 5 only through an explicitly approved level-4 container.

Run `npm test` while authoring. `npm run check` includes these unit tests and remains the complete release gate.

### Intentional terminal guardrail

The map renders children from the selected node's `children` array. A childless node at levels 0–3 is valid only when its terminal path is explicitly listed in `data/v1-curation.json`; an accidental deletion or unreviewed early stop changes the derived terminal paths and fails the release gate.

This separates an intentional endpoint from incomplete authoring. Emotion, Motivation, Behaviour, and Development now expose curated level-4 teaching concepts; their former level-3 endpoints were changed only after those children were reviewed. The contract still permits earlier endpoints when future branches are not ready. The validator rejects all unapproved level-5 content and every child attached to a level-5 node.

### Curated navigation, not forced breadth

The `children` array is an editorial statement: it contains only concepts that are approved, meaningful next steps for the selected concept. There is deliberately no minimum child count.

For example, `Reality → Time → Future` currently leads only to **Expected value**. It will gain Forecast, Scenario, Risk, or Plan only when each is independently curated, connected, and ready to teach—not because a layout or a test expects five cards.

Depth and breadth are separate contracts:

- **Depth:** every published path ends at an explicitly approved teaching concept at or before level 4, except for terminal level-5 concepts beneath a specifically approved level-4 container.
- **Breadth:** a branch may offer one or many children; every visible child must be an intentional, valid canonical relationship.

The unit suite protects this by verifying every visible child reference, its canonical path, and a one-child Future branch. It never creates content to satisfy a quota.

### V1 editorial curation gate

`data/v1-curation.json` is the editorial release record for this map. It distinguishes a structurally valid path from a path that has been intentionally chosen for V1.

Each level-2 branch records:

- Its bounded V1 scope.
- The decision explaining what is included and what remains out of scope.
- Every approved terminal path beneath that branch.

The test suite derives the live terminal paths from the ontology and compares them with this record. Adding, removing, renaming through an ID change, or rerouting published content fails the release gate until its curation decision is revised.

This is an editorial integrity control, not a claim that the map is an exhaustive or formally peer-reviewed account of every domain. Where a specialist source is required, that branch should remain unpublished or be reviewed by the appropriate domain expert.

## Canonical Ontology Expansion Contract

Use this request whenever a selected canonical node has not yet been curated with approved next concepts:

```text
You are expanding the Canonical Reality Ontology.

This ontology is the source of truth. Do not redesign, rename, merge,
remove, or reorder existing canonical nodes unless explicitly instructed.

Expand: [canonical path]

Expansion Rules
1. Expand only the requested node.
2. Expand exactly one level deeper.
3. Return only the smallest set of Pareto-essential children needed for the stated scope; there is no target count.
4. Do not add a child merely to make the map feel balanced or complete.
5. Children should be mutually exclusive where practical and collectively meaningful for the requested scope.
6. Prefer timeless concepts over current implementations, tools, or technologies.
7. Give every child a name and one-line description.
8. Preserve the existing ontology naming conventions.
9. If multiple taxonomies exist, choose the most widely accepted and explain the rationale.
10. Never expand grandchildren unless explicitly requested.
11. Level 4 is the default maximum, not a target. A node at levels 0–3 may remain terminal when no meaningful child has been approved.
12. Do not expand an ordinary level-4 terminal teaching concept. Level 5 is allowed only when that exact level-4 parent has received an explicit `curated-level-five` policy because the deeper concepts materially improve navigation.
13. Expand an approved level-4 container exactly one level to terminal level-5 children. Never expand a level-5 node.
14. Update `data/v1-curation.json` with the branch scope, decision, expansion exception, and exact approved terminal paths before publishing.

Output Format
Parent
├── Child 1
│   One-line description
├── Child 2
│   One-line description
…

Validation Checklist
✓ One level only
✓ Pareto: smallest necessary set; no target count
✓ Canonical terminology
✓ No duplicated concepts
✓ Covers the parent
✓ Suitable for long-term navigation
✓ Stable across industries and time
✓ Default level-4 boundary respected
✓ Any level-5 exception is explicit, necessary, and terminal

If the requested node exists at levels 0–3, expand it. If it is an ordinary
level-4 terminal, explain that it cannot be expanded further. If it is an
explicitly approved level-4 container, expand exactly one level. If it is level
5, state that it is terminal. If it does not exist, explain why and suggest the
closest valid canonical node. Never modify the canonical ontology while
expanding it.
```

Review and approve the returned concepts in Notion first. Only then add them to the application ontology. This preserves the boundary between research and published knowledge.

## Layout rules

- Use percentage coordinates so the topology survives resizing.
- Preserve the user-provided spatial order.
- Keep the current explored concept fixed at the centre.
- Use an SVG `viewBox="0 0 100 100"` for stable concentric field rings behind the HTML buttons.
- At narrow widths, increase vertical space and allow the selected explanation to stack.
- Do not use viewport-height layouts, fixed positioning, or horizontal scrolling.

### Mobile adaptation decisions

- Preserve the destination map and its stable positions; mobile is the same mental model, not a separate list-only interface.
- Show only the current destination visually in the compact toolbar. The complete breadcrumb remains in the accessible DOM, while **Back** carries the visible ancestry interaction.
- Move the responsive action group onto its own full-width toolbar row. **Explore {node}**, when relevant, remains a 44 px touch target; Concept Anatomy updates automatically below the map.
- Use the permanent detail below the map at every width as the single source of visible name, type, and explanation, avoiding duplicated information and covered destinations.
- After a user selects a destination at mobile width, scroll to the permanent detail so the selected name, role, and definition lead directly into its Concept Anatomy. Initial rendering, Explore, and Back retain the map position for spatial orientation.
- Reduce the mobile map to a responsive 430–480 px range while retaining safe space around the lowest destinations. This keeps the current action and selected explanation closer to the map without crowding narrow screens.
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

Before testing the map:

- Confirm a new browser session opens on **Begin with Reality**, with one **Enter the observatory** action and three concise orientation cues.
- Enter the observatory, refresh, and confirm the introduction does not interrupt the same session again.
- Hover Domain and keyboard-focus Perspective; confirm each reveals its own pre-selection dossier without changing selection. Confirm the visible `Dimension` badges and centre-to-node spokes are absent.

1. Confirm six buttons render at root: five canonical dimensions plus Reality.
2. Select every node once.
3. Confirm exactly one destination is current after each selection.
4. Confirm no centre-to-node spokes render at root or deeper levels.
5. Explore Category and confirm it becomes the centre with six canonical category types.
6. Explore Resource and confirm it becomes the centre with six immediate children.
7. Use Back twice and confirm the Reality orbit is restored.
8. Explore Perspective and confirm its five approved lenses render.
9. Confirm Reality renders Concept Anatomy automatically and does not expose an Explore action.
10. Select any non-root concept and confirm its Concept Anatomy updates automatically, **Explore {node}** is present, and the action uses the node's dimension colour.
11. Explore a terminal concept and confirm it becomes a focused endpoint, keeps its Concept Anatomy visible, shows **Exploring {node}**, and invents no child nodes.
12. Confirm selecting a node updates the permanent detail title, role, and explanation.
13. Confirm canonical path, parent, typed relationship, and immediate children are absent from the visible panel but remain available in `buildChatContext(node)`.
14. Confirm the selected label and summary match the node data.
15. Select Reality, Domain, and Razor and confirm each automatically renders the baseline Concept Anatomy fields alongside the map.
16. Explore Category → Knowledge → Law, select Amdahl's Law, and confirm its authored law anatomy updates automatically.
17. Confirm the Amdahl breadcrumb stops at level 4—five path entries including Reality—while its Concept Anatomy renders as content.
18. Explore Domain → Psychological → Individual differences → Character and confirm its eight approved qualities render.
19. Explore Courage and confirm it is labelled **Character quality**, its breadcrumb reaches level 5, and it exposes no child destinations.
20. Explore Category → Relationship → Ownership → Ownership arrangement and confirm Ownership is labelled **Relationship type**, its authored Concept Anatomy remains visible, and Ownership arrangement is the final teaching concept.
21. At mobile width, confirm the Explore action occupies its own full-width row when relevant and Back remains at least 44 px high.
22. At mobile width, confirm only the current destination is visually shown in the toolbar while the complete path remains accessible.
23. Confirm the mobile Concept Anatomy follows the map, updates on selection, and shows no floating overlay.

### Responsive checks

Test at:

- 736 px wide: all destinations remain separated and the map dominates the composition.
- 390 px wide: no horizontal overflow, clipped destination labels, floating selection card, or squeezed action row.
- 320 px wide: controls remain at least 44 px high, buttons remain reachable, and selected text stacks below the visual.

### Browser checks

- No JavaScript errors or warnings.
- Every button works with keyboard activation.
- The first render is meaningful before any interaction.
- Light and dark themes retain visible rings, labels, focus, and selection feedback without relying on connecting spokes.

## Local preview

Synchronise the visualization fragment, validate the typed shell, and start the local application:

```bash
npm run frame:desktop
npm run check
npm run start
```

Open `http://127.0.0.1:4175/`. The React shell fills the viewport, while the observatory preserves its 1440 px desktop composition and collapses to one column below 980 px.

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
- Reality, containers, and terminal concepts updated Concept Anatomy without creating additional ontology levels.
- Reality and Category produced the expected internal versioned chat-context objects, including typed parent relationships, without exposing structural metadata in the learner panel.
- Category → Knowledge → Law exposed eight named-law instances.
- Amdahl's Law updated its Concept Anatomy while remaining terminal at level 4.
- Psychological areas expose their curated level-4 vocabularies, while Character alone exposes terminal level-5 qualities including Courage.
- Every selection updated `aria-current`, the eligible Explore action, the live permanent detail, and Concept Anatomy from one selected ID.
- At 736 px, 390 px, and 320 px no floating selection content covered or visually attached itself to an unrelated destination.
- At 390 px and 320 px the action moved to its own 44 px-high row, the visible path condensed to the current destination, and full destination labels remained readable.
- The complete Amdahl's Law Concept Anatomy flowed in one column at 320 px without horizontal overflow.
- At all verified widths, no buttons overlapped and no horizontal overflow appeared.
- Browser console scan returned no warnings or errors.

## Decision record

- **Chosen:** a strict React and TypeScript application shell built by Vite, with the mature HTML, SVG, CSS, and JavaScript ontology renderer isolated behind an explicit compatibility adapter.
- **Reason:** React now owns application lifecycle, loading, recovery, composition, and future component migration; the compatibility boundary preserves the proven spatial interaction while Playwright protects behaviour during incremental change.
- **Design parent:** the abstract spatial destination-map interaction pattern, implemented with original visual assets and semantic rules.
- **Corrected root:** the five canonical dimensions replaced the earlier eight-shortcut root because mixing Category with its children represented two abstraction levels as peers.
- **Implemented:** deterministic asymmetric placement, dimension colour identity, container/instance shapes, typed parent relationships, navigation from Reality at level 0 through the default level-4 boundary and explicitly curated terminal level-5 exceptions, and automatically synchronised Concept Anatomy views.
- **Deferred:** migrating the renderer across the React boundary component by component, physics simulation, dragging, persistence, route navigation, external content loading, and a dedicated graph library.
- **Graph-library condition:** introduce a graph library only when node counts, authoring workflow, or edge routing complexity demonstrably exceed the deterministic renderer's maintainable limits.
