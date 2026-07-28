# Application and Experience Scope

## Purpose

This scope governs the React shell, compatibility frame, visualization, interaction design, styling, responsive behaviour, and accessibility of Reality Orbit.

## Product experience

- Keep Reality central and spatial memory stable.
- Use progressive disclosure: users should know where they are, what they are viewing, and what to do next.
- Treat space as a calm metaphor for navigating knowledge, never as decoration without meaning.
- Keep selection, exploration, Concept Anatomy, hover previews, and camera movement semantically aligned.
- Prefer existing design tokens and reusable components over one-off styles.

## Implementation rules

- Preserve the ontology data contract; do not duplicate canonical node data in UI components.
- Keep generated `legacy-index.html` synchronised from the readable source fragment.
- Keep user-facing labels contextual, accessible, and specific to the selected node.
- Use semantic HTML, accessible names, live regions only when needed, and visible focus states.
- Respect reduced-motion preferences and maintain 44px touch targets.
- Test desktop, mobile, keyboard, hover-capable, touch, and failure states.
- Avoid visual effects that reduce readability, obscure destinations, or imply false relationships.

## Review checklist

- Does the visual hierarchy teach the ontology?
- Does the interaction work without a mouse?
- Does mobile preserve context without clipping or trapping focus?
- Does the change maintain contrast and readable text over the space background?
- Does the implementation remain maintainable and component-driven?
