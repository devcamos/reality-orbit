# Reality Orbit Agent Charter

## Purpose

Reality Orbit is a calm spatial interface for understanding reality. Space is the interaction metaphor; understanding is the product. Preserve clarity, ontology integrity, accessibility, and maintainable delivery in every change.

## Sources of truth

- **Agent behaviour:** this file and the nearest applicable scoped `AGENTS.md`.
- **Product and business governance:** [Reality Orbit operating hub](https://app.notion.com/p/3aa7233a96ec810c9de1db94ba8b8796).
- **Actionable work:** [Reality Orbit Backlog](https://app.notion.com/p/b52c7cc96b124a43a8a1c0606e0cb187).
- **Feedback specification:** [Feedback System & Data Architecture](https://app.notion.com/p/3aa7233a96ec811fb708fc787cd174ee).
- **Code and releases:** this repository and its GitHub history.

Notion stores changing product knowledge, decisions, research synthesis, and work status. The repository stores implementation guidance and published code. Do not copy private or rapidly changing Notion content into this file.

## Scope router

Before editing, identify the target path and read the nearest scoped guidance:

- Business, requirements, research, or documentation → [`docs/AGENTS.md`](docs/AGENTS.md).
- Ontology, curation, node data, or canonical paths → [`data/AGENTS.md`](data/AGENTS.md).
- React, visualization, styling, interaction, or accessibility → [`src/AGENTS.md`](src/AGENTS.md).
- Tests, CI, generated artifacts, builds, or release verification → [`tests/AGENTS.md`](tests/AGENTS.md).

If a change crosses scopes, read every relevant scope file. Scoped files add constraints; they do not repeat this charter.

## Backlog workflow

1. Find or create the relevant item in the Reality Orbit Backlog before implementation.
2. Read its linked specification and plan.
3. Move the item to **In progress** only when work begins and when authorised to update Notion.
4. Link the pull request, verification evidence, and release outcome before marking it **Done**.
5. Do not create duplicate work items or turn raw user feedback into automatic ontology changes.

## Universal engineering rules

- Preserve existing canonical names, paths, relationships, and level boundaries unless explicitly approved.
- Prefer small, reversible, component-driven changes.
- Keep user-facing content specific to the selected node and useful for understanding.
- Protect keyboard access, screen readers, focus order, contrast, reduced motion, touch targets, and responsive layouts.
- Treat client input and external metadata as untrusted.
- Do not place secrets, credentials, or private feedback bodies in source, logs, or generated bundles.

## Definition of done

- Relevant tests and checks pass.
- Generated files are synchronised where applicable.
- The change is reviewed against the product vision and ontology rules.
- The backlog item and documentation are updated when authorised.
- The final handoff states what changed, what was verified, and any remaining risk.

## Instruction maintenance

Keep this root file short and stable. Put detailed, scoped guidance in the closest child file. Use `AGENTS.override.md` only for temporary local exceptions. Every guidance file should state its scope and remain free of secrets.
