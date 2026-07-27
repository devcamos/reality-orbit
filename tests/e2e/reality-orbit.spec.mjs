import { expect, test } from "@playwright/test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");

const app = (page) => page.frameLocator('iframe[title="Reality Orbit"]');
const node = (page, id) => app(page).locator(`[data-node-id="${id}"]`);

const openOrbit = async (page) => {
  await page.goto("/");
  const enter = page.locator("[data-enter-observatory]");
  if (await enter.isVisible()) await enter.click();
  await expect(app(page).locator("#reality-orbit-prototype")).toBeVisible();
};

const explore = async (page, id) => {
  await node(page, id).click();
  await app(page).locator("[data-explore-action]").click();
};

test("introduces the observatory before revealing the ontology map", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("[data-observatory-introduction]")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Begin with Reality." })).toBeVisible();
  await expect(page.getByRole("list", { name: "Five lenses on Reality" }).getByRole("listitem")).toHaveCount(5);
  await expect(page.getByRole("button", { name: "Explore Reality" })).toBeVisible();
  await page.getByText("See how it works", { exact: true }).click();
  await expect(page.getByRole("list", { name: "How to explore" }).getByRole("listitem")).toHaveCount(3);
  await expect(page.locator('iframe[title="Reality Orbit"]')).toHaveCount(0);

  await page.addScriptTag({ path: axePath });
  const results = await page.evaluate(async () => window.axe.run(document, { resultTypes: ["violations"] }));
  const seriousViolations = results.violations.filter(({ impact }) => ["serious", "critical"].includes(impact));
  expect(seriousViolations).toEqual([]);

  await page.locator("[data-enter-observatory]").click();
  await expect(app(page).locator("#reality-orbit-prototype")).toBeVisible();

  await page.reload();
  await expect(page.locator("[data-observatory-introduction]")).toHaveCount(0);
  await expect(app(page).locator("#reality-orbit-prototype")).toBeVisible();
});

test("the welcome call to action feels alive without displacing text or ignoring reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const layout = await page.locator("[data-observatory-introduction]").evaluate((introduction) => {
      const shell = introduction.querySelector(".observatory-intro__shell");
      const selectors = [
        ".observatory-intro__opening",
        ".observatory-intro__map",
        ".observatory-intro__lenses",
        ".observatory-intro__enter",
        ".observatory-intro__explanation",
        ".observatory-intro__example",
        ".observatory-intro__note",
      ];
      const shellRect = shell.getBoundingClientRect();
      return {
        horizontalOverflow: shell.scrollWidth - shell.clientWidth,
        misplaced: selectors.filter((selector) => {
          const rect = introduction.querySelector(selector).getBoundingClientRect();
          return rect.left < shellRect.left - 1 || rect.right > shellRect.right + 1;
        }),
      };
    });

    expect(layout.horizontalOverflow).toBeLessThanOrEqual(1);
    expect(layout.misplaced).toEqual([]);
  }

  const heartbeat = await page.locator("[data-enter-observatory]").evaluate((button) => ({
    name: getComputedStyle(button).animationName,
    duration: getComputedStyle(button).animationDuration,
  }));
  expect(heartbeat).toEqual({ name: "intro-heartbeat", duration: "1.9s" });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() => page.locator("[data-enter-observatory]").evaluate((button) => getComputedStyle(button).animationName))
    .toBe("none");
});

test("loads the canonical Reality orbit without browser errors", async ({ page }) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await openOrbit(page);

  await expect(node(page, "reality")).toBeVisible();
  for (const dimension of ["domain", "category", "time", "scale", "perspective"]) {
    await expect(node(page, dimension)).toBeVisible();
  }
  await expect(app(page).locator(".orbit-connection")).toHaveCount(0);
  await expect(app(page).locator("[data-orbit-path]")).toHaveText("Choose a dimension");
  await expect(app(page).locator("[data-understand-title]")).toHaveText("Reality");
  await expect(app(page).locator("[data-understand-lead-label]")).toHaveText("Governing question");
  await expect(app(page).locator("[data-understand-support-label]")).toHaveText("Purpose");
  await expect(app(page).locator("[data-understand-more]")).not.toHaveAttribute("open", "");
  await app(page).locator("[data-understand-more] summary").click();
  const firstPrinciples = app(page).locator('[data-anatomy-field="first-principles"] .understand-principles li');
  await expect(firstPrinciples).toHaveCount(2);
  await expect(firstPrinciples.nth(0)).toBeVisible();
  await expect(firstPrinciples.nth(0)).toHaveText("Every useful description selects boundaries and leaves detail out.");
  await expect(firstPrinciples.nth(1)).toHaveText("No single dimension provides a complete account.");
  const conceptLayout = await app(page).locator("[data-understand-view]").evaluate((view) => {
    const viewRect = view.getBoundingClientRect();
    const regions = [...view.querySelectorAll(".understand-story, .understand-more, [data-anatomy-field]")];
    return {
      horizontalOverflow: view.scrollWidth - view.clientWidth,
      misplaced: regions
        .filter((region) => {
          const rect = region.getBoundingClientRect();
          return rect.left < viewRect.left - 1 || rect.right > viewRect.right + 1;
        })
        .map((region) => region.className),
    };
  });
  expect(conceptLayout.horizontalOverflow).toBeLessThanOrEqual(1);
  expect(conceptLayout.misplaced).toEqual([]);
  expect(errors).toEqual([]);
});

test("selection and exploration keep the map, summary, and Concept Anatomy aligned", async ({ page }) => {
  await openOrbit(page);

  await node(page, "scale").click();
  await expect(node(page, "scale")).toHaveAttribute("aria-current", "true");
  await expect(app(page).locator("[data-selected-label]")).toHaveText("Scale");
  await expect(app(page).locator(".orbit-role[data-selected-role]")).toBeHidden();
  await expect(app(page).locator(".destination-meta")).toHaveCount(0);
  await expect(app(page).locator("[data-understand-title]")).toHaveText("Scale");
  await expect(app(page).locator("[data-explore-action]")).toBeVisible();

  await app(page).locator("[data-explore-action]").click();
  await expect(app(page).locator("[data-orbit-path]")).toContainText("Reality");
  await expect(app(page).locator("[data-orbit-path]")).toContainText("Scale");
  await expect(node(page, "scale")).toHaveClass(/orbit-core/);
  await expect(node(page, "individual")).toBeVisible();

  await app(page).locator("[data-orbit-back]").click();
  await expect(app(page).locator("[data-orbit-path]")).toHaveText("Choose a dimension");
  await expect(node(page, "scale")).toBeVisible();
});

test("keyboard activation selects a dimension and exposes its action", async ({ page }) => {
  await openOrbit(page);

  await node(page, "perspective").focus();
  await page.keyboard.press("Enter");

  await expect(node(page, "perspective")).toBeFocused();
  await expect(node(page, "perspective")).toHaveAttribute("aria-current", "true");
  await expect(app(page).locator("[data-selected-label]")).toHaveText("Perspective");
  await expect(app(page).locator("[data-explore-action]")).toBeVisible();
});

test("hover and keyboard focus reveal a pre-selection concept preview", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openOrbit(page);

  await expect(node(page, "reality").locator(".destination-marker")).toHaveCSS("animation-name", "reality-breathe");
  await expect(node(page, "reality").locator(".destination-marker")).toHaveCSS("animation-duration", "3.6s");

  await node(page, "domain").hover();
  await expect(app(page).locator("[data-orbit-preview]")).toBeVisible();
  await expect(app(page).locator("[data-orbit-hover-reticle]")).toBeVisible();
  await expect(app(page).locator("[data-orbit-preview-role]")).toHaveText("Lens on reality");
  await expect(app(page).locator("[data-orbit-preview-title]")).toHaveText("Domain");
  await expect(app(page).locator("[data-orbit-preview-summary]")).toHaveText(
    "The broad area of reality being studied.",
  );
  await expect(app(page).locator("[data-orbit-preview-question]")).toHaveText(
    "What broad area of reality is being studied?",
  );
  await expect(app(page).locator("[data-orbit-preview-depth]")).toHaveText("7 paths available");
  await expect(app(page).locator("[data-selected-label]")).toHaveText("Reality");
  const domainPosition = await app(page).locator("[data-orbit-hover-reticle]").evaluate((reticle) => ({
    x: reticle.style.getPropertyValue("--reticle-x"),
    y: reticle.style.getPropertyValue("--reticle-y"),
    interactive: reticle.dataset.interactive,
    nativeCursor: getComputedStyle(reticle.closest("#reality-orbit-prototype")).cursor,
  }));
  expect(domainPosition.interactive).toBe("true");
  expect(domainPosition.nativeCursor).toBe("none");

  await node(page, "category").hover();
  await expect(app(page).locator("[data-orbit-preview]")).toHaveAttribute("data-placement", "right");
  await expect(app(page).locator("[data-orbit-preview-title]")).toHaveText("Category");
  const categoryPreviewPosition = await app(page).locator("[data-orbit-preview]").evaluate((preview) => {
    const destination = document.querySelector('[data-node-id="category"]');
    const stageRect = document.querySelector(".orbit-stage").getBoundingClientRect();
    const visualRight = Math.max(
      destination.querySelector(".destination-marker").getBoundingClientRect().right,
      destination.querySelector(".destination-label").getBoundingClientRect().right,
    );
    const previewRect = preview.getBoundingClientRect();
    return {
      gap: previewRect.left - visualRight,
      constrainedWidth: preview.style.getPropertyValue("--preview-width"),
      positionedLeft: preview.style.getPropertyValue("--preview-left"),
      previewLeft: previewRect.left,
      previewWidth: previewRect.width,
      stageLeft: stageRect.left,
      stageWidth: stageRect.width,
      visualRight,
    };
  });
  const categoryPreviewDiagnostics = JSON.stringify(categoryPreviewPosition);
  expect(categoryPreviewPosition.gap, categoryPreviewDiagnostics).toBeGreaterThan(0);
  expect(categoryPreviewPosition.gap).toBeLessThanOrEqual(12);
  expect(categoryPreviewPosition.constrainedWidth).not.toBe("");

  await node(page, "perspective").hover();
  await expect(app(page).locator("[data-orbit-preview]")).toBeVisible();
  await expect(app(page).locator("[data-orbit-preview]")).toHaveAttribute("data-placement", "left");
  await expect(app(page).locator("[data-orbit-hover-reticle]")).toBeVisible();
  await expect(app(page).locator("[data-orbit-preview-title]")).toHaveText("Perspective");
  await expect(app(page).locator("[data-orbit-preview-question]")).toHaveText(
    "From which viewpoint or interpretive lens is it being understood?",
  );
  const perspectivePreviewGap = await app(page).locator("[data-orbit-preview]").evaluate((preview) => {
    const destination = document.querySelector('[data-node-id="perspective"]');
    const visualLeft = Math.min(
      destination.querySelector(".destination-marker").getBoundingClientRect().left,
      destination.querySelector(".destination-label").getBoundingClientRect().left,
    );
    const previewRect = preview.getBoundingClientRect();
    return visualLeft - previewRect.right;
  });
  expect(perspectivePreviewGap).toBeGreaterThan(0);
  expect(perspectivePreviewGap).toBeLessThanOrEqual(12);
  const perspectiveState = await app(page).locator("[data-orbit-hover-reticle]").evaluate((reticle) => ({
    x: reticle.style.getPropertyValue("--reticle-x"),
    y: reticle.style.getPropertyValue("--reticle-y"),
    orbitAnimation: getComputedStyle(reticle.querySelector(".orbit-hover-reticle-orbit")).animationName,
  }));

  expect(perspectiveState).not.toMatchObject(domainPosition);
  expect(perspectiveState.orbitAnimation).toBe("hover-reticle-orbit-drift");

  await node(page, "perspective").focus();
  await expect(app(page).locator("[data-orbit-preview]")).toBeVisible();
  await expect(node(page, "perspective")).toHaveAttribute("aria-describedby", "orbit-preview");
  await expect(app(page).locator("[data-selected-label]")).toHaveText("Reality");
});

test("mobile selection reveals the summary and uses the contextual explore control", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openOrbit(page);

  await node(page, "time").dispatchEvent("pointerdown", {
    pointerType: "touch",
    clientX: 210,
    clientY: 220,
  });
  await expect(app(page).locator("[data-orbit-hover-reticle]")).toBeVisible();
  await node(page, "time").dispatchEvent("pointerup", {
    pointerType: "touch",
    clientX: 210,
    clientY: 220,
  });
  await expect(app(page).locator("[data-orbit-hover-reticle]")).toBeHidden();

  await node(page, "time").click();
  await expect(app(page).locator("[data-orbit-hover-reticle]")).toBeHidden();
  const detail = app(page).locator(".orbit-detail");
  await expect(detail).toBeInViewport();
  await expect(app(page).locator("[data-context-explore-action]")).toBeVisible();
  await expect(app(page).locator("[data-understand-title]")).toBeHidden();
  await expect(app(page).locator("[data-understand-statement]")).toBeHidden();
  await expect(app(page).locator("[data-understand-lead]")).toBeVisible();

  await app(page).locator("[data-context-explore-action]").click();
  await expect(app(page).locator("[data-orbit-path]")).toContainText("Time");
  await expect(node(page, "past")).toBeVisible();
  const mobileToolbar = await app(page).locator(".orbit-toolbar").evaluate((toolbar) => {
    const path = toolbar.querySelector("[data-orbit-path]");
    const toolbarRect = toolbar.getBoundingClientRect();
    const pathRect = path.getBoundingClientRect();
    return {
      centerDelta: Math.abs(
        (pathRect.left + (pathRect.width / 2))
        - (toolbarRect.left + (toolbarRect.width / 2)),
      ),
      fontWeight: Number.parseInt(getComputedStyle(path).fontWeight, 10),
      text: path.textContent.trim(),
    };
  });
  expect(mobileToolbar.centerDelta).toBeLessThanOrEqual(1);
  expect(mobileToolbar.fontWeight).toBeGreaterThanOrEqual(700);
  expect(mobileToolbar.text).toContain("Time");
});

test("reduced-motion mode removes ambient and navigational animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openOrbit(page);
  await node(page, "time").hover();

  const animationState = await app(page).locator("#reality-orbit-prototype").evaluate((root) => {
    const starfield = root.querySelector(".orbit-starfield");
    const timeMarker = root.querySelector('[data-node-id="time"] .destination-marker');
    const canvas = root.querySelector(".orbit-canvas");
    return {
      canvasTransition: getComputedStyle(canvas).transitionDuration,
      nearStars: getComputedStyle(starfield, "::after").animationName,
      farStars: getComputedStyle(starfield, "::before").animationName,
      timeRing: getComputedStyle(timeMarker, "::before").animationName,
      hoverReticle: getComputedStyle(root.querySelector(".orbit-hover-reticle-orbit")).animationName,
      hoverTransition: getComputedStyle(root.querySelector(".orbit-hover-reticle")).transitionDuration,
    };
  });

  expect(animationState).toEqual({
    canvasTransition: "0s",
    nearStars: "none",
    farStars: "none",
    timeRing: "none",
    hoverReticle: "none",
    hoverTransition: "0s",
  });
});

test("the observatory exposes a stable accessible structure without serious violations", async ({ page }) => {
  await openOrbit(page);

  const orbit = app(page).locator("#reality-orbit-prototype");
  await expect(orbit).toMatchAriaSnapshot(`
    - region "Reality ontology destination map":
      - region "Universe workspace":
        - button "Domain. Dimension. Select to update Concept Anatomy."
        - button "Category. Dimension. Select to update Concept Anatomy."
        - button "Time. Dimension. Select to update Concept Anatomy."
        - button "Scale. Dimension. Select to update Concept Anatomy."
        - button "Perspective. Dimension. Select to update Concept Anatomy."
        - button "Reality. Root concept. Select to update Concept Anatomy."
      - complementary "Reality":
        - heading "Reality" [level=2]
  `);

  const frame = page.frames().find((candidate) => candidate.parentFrame() === page.mainFrame());
  expect(frame, "Reality Orbit iframe should be available to accessibility testing").toBeTruthy();
  await frame.addScriptTag({ path: axePath });
  const results = await frame.evaluate(async () => window.axe.run(document, {
    resultTypes: ["violations"],
    rules: {
      "color-contrast": { enabled: true },
    },
  }));
  const seriousViolations = results.violations.filter(({ impact }) => ["serious", "critical"].includes(impact));
  expect(seriousViolations).toEqual([]);
});

test("Character exposes the approved terminal level-5 qualities", async ({ page }) => {
  await openOrbit(page);

  await explore(page, "domain");
  await explore(page, "psychological");
  await explore(page, "individual-differences");
  await explore(page, "character");

  await expect(node(page, "character")).toHaveClass(/orbit-core/);
  await expect(app(page).locator("[data-selected-label]")).toHaveText("Character");
  await expect(app(page).locator("[data-understand-title]")).toHaveText("Character");
  await expect(app(page).locator("[data-orbit-path]")).toContainText("Individual differences");
  await expect(node(page, "courage")).toBeVisible();
  await expect(app(page).locator("[data-orbit-nodes] .orbit-node:not(.orbit-core)")).toHaveCount(8);

  await explore(page, "courage");

  await expect(node(page, "courage")).toHaveClass(/orbit-core/);
  await expect(app(page).locator("[data-selected-label]")).toHaveText("Courage");
  await expect(app(page).locator(".orbit-role[data-selected-role]")).toHaveText("Character quality");
  await expect(app(page).locator("[data-orbit-path]")).toContainText("Character");
  await expect(app(page).locator("[data-orbit-nodes] .orbit-node:not(.orbit-core)")).toHaveCount(0);
});

test("Emotion exposes its curated level-4 families without deeper filler", async ({ page }) => {
  await openOrbit(page);

  await explore(page, "domain");
  await explore(page, "psychological");
  await explore(page, "emotion");

  await expect(node(page, "emotion")).toHaveClass(/orbit-core/);
  await expect(app(page).locator("[data-selected-label]")).toHaveText("Emotion");
  await expect(app(page).locator("[data-understand-title]")).toHaveText("Emotion");
  await expect(app(page).locator("[data-orbit-path]")).toContainText("Psychological");
  await expect(node(page, "joy")).toBeVisible();
  await expect(app(page).locator("[data-orbit-nodes] .orbit-node:not(.orbit-core)")).toHaveCount(6);

  await explore(page, "joy");

  await expect(node(page, "joy")).toHaveClass(/orbit-core/);
  await expect(app(page).locator("[data-selected-label]")).toHaveText("Joy");
  await expect(app(page).locator("[data-orbit-nodes] .orbit-node:not(.orbit-core)")).toHaveCount(0);
});

test("a terminal concept remains a focused endpoint without invented children", async ({ page }) => {
  await openOrbit(page);

  await explore(page, "scale");
  await explore(page, "individual");
  await explore(page, "person");
  await explore(page, "individual-actor");

  await expect(node(page, "individual-actor")).toHaveClass(/orbit-core/);
  await expect(app(page).locator("[data-selected-label]")).toHaveText("Individual actor");
  await expect(app(page).locator("[data-orbit-nodes] .orbit-node:not(.orbit-core)")).toHaveCount(0);
});
