# Quality and Release Scope

## Purpose

This scope governs automated tests, accessibility checks, generated-artifact integrity, CI expectations, and release verification.

## Required checks

For normal implementation changes, run the narrowest relevant checks and then the full gate before handoff:

- `npm run check` for type checks, static safeguards, ontology contracts, and unit tests.
- `npm run build` for the production bundle and generated frame.
- `npm run check:generated` when the readable visualization source changes.
- `npm run test:e2e` for user journeys, responsive behaviour, and accessibility coverage.
- `npm run test:smoke` for server, asset, header, and failure-response checks.

## Test design

- Test user outcomes and contracts, not implementation trivia.
- Add regression coverage for every new interaction or ontology rule.
- Cover desktop, mobile, keyboard, reduced motion, and accessible naming where relevant.
- Every UI change must include responsive acceptance at 390px mobile, 768px iPad/tablet, and 1280px desktop widths, including overflow and clipping checks for the changed surface.
- Keep Playwright journeys readable and focused on meaningful user paths.
- Treat console errors, page errors, serious accessibility violations, flaky results, and unexpected skips as failures requiring explanation.

## Generated files and CI

- Do not hand-edit generated `legacy-index.html`; update its readable source and regenerate it.
- Keep CI and local commands aligned.
- Never bypass a failing quality gate by weakening an assertion without documenting the product reason.
- Record verification evidence on the linked backlog item or pull request when authorised.

## Release handoff

Before marking work complete, report the exact commands run, pass/fail result, environment limitations, remaining risk, and whether the change is ready for review or release.
