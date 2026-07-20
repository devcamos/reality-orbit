# Reality Orbit JavaScript Visualization Runbook

## Purpose

Build and test a reusable orbit-screen visualization for connected knowledge concepts. The first test places **Reality** at the centre and arranges eight knowledge dimensions around it:

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

## Visual model

- **Centre:** Reality is the stable reference point.
- **Orbiting nodes:** Domain, Knowledge, Category, Scale, Time, Resources, Processes, and Relationships.
- **Orbit rings:** communicate shared context without claiming a strict hierarchy.
- **Centre-to-node connections:** show that each dimension is a lens on Reality.
- **Active connection:** only the selected node and its relationship to Reality receive emphasis.

The visual language may feel like a restrained space-navigation screen, but it should not copy Destiny assets, logos, icons, or screen layouts.

## JavaScript architecture

The visualization is intentionally dependency-free.

### Data contract

Each orbiting node is defined once:

```js
{
  id: "domain",
  label: "Domain",
  x: 50,
  y: 9,
  summary: "The broad area of reality being studied."
}
```

- `id` is the stable relationship key.
- `label` is the visible and accessible name.
- `x` and `y` are percentage coordinates in the orbit field.
- `summary` is the single-line selected-state explanation.

### Rendering sequence

1. Read the node array.
2. Create one SVG connection from Reality to each node.
3. Create one native button for each orbiting node.
4. Create the Reality centre button.
5. Attach click handlers that call `setActiveNode(id)`.

### State transition

`setActiveNode(id)` performs three updates from one source of truth:

1. Sets `aria-pressed` on the selected button.
2. Sets `data-active` on the matching SVG connection.
3. Updates the live selected label and summary.

Do not create separate state variables for the button, connection, and explanation. Deriving all three from one selected ID prevents the UI from disagreeing with itself.

## Layout rules

- Use percentage coordinates so the topology survives resizing.
- Preserve the user-provided spatial order.
- Keep Reality fixed at the centre.
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

1. Confirm nine buttons render: eight dimensions plus Reality.
2. Select every node once.
3. Confirm exactly one button is pressed after each selection.
4. Confirm exactly one centre-to-node connection is active for an orbiting node.
5. Confirm selecting Reality clears all active connections.
6. Confirm the selected label and summary match the node data.

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

- Nine buttons rendered: eight orbiting dimensions and Reality.
- Every orbiting node was selected successfully.
- Every selection updated `aria-pressed`, the active SVG connection, and the live explanation from the same node ID.
- Selecting Reality cleared all active connections.
- Keyboard activation with Enter selected the expected node.
- At 390 px and 736 px, no buttons overlapped or clipped and no horizontal overflow appeared.
- Browser console scan returned no warnings or errors.

## Decision record

- **Chosen:** a lightweight HTML, SVG, CSS, and JavaScript prototype.
- **Reason:** it tests spatial interaction and responsive behaviour without introducing a framework or graph library.
- **Deferred:** physics simulation, dragging, zooming, persistence, route navigation, and content loading.
- **Promotion condition:** add a framework or graph library only when node counts, authoring workflow, or edge routing becomes complex enough to justify it.
