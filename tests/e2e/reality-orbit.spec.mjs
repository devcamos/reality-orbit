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
  await expect(app(page).locator("[data-orbit-path]")).toHaveText("Choose a dimension");
  await expect(app(page).locator("[data-understand-title]")).toHaveText("Reality");
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

test("hover and keyboard focus reveal a concept-specific thought", async ({ page }) => {
  await openOrbit(page);

  await node(page, "domain").hover();
  await expect(app(page).locator("[data-orbit-thought]")).toBeVisible();
  await expect(app(page).locator("[data-orbit-thought-text]")).toHaveText(
    "What broad area of reality is being studied?",
  );

  await node(page, "perspective").focus();
  await expect(app(page).locator("[data-orbit-thought]")).toBeVisible();
  await expect(app(page).locator("[data-orbit-thought-text]")).toHaveText(
    "From which viewpoint or interpretive lens is it being understood?",
  );
});

test("mobile selection reveals the summary and uses the contextual explore control", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openOrbit(page);

  await node(page, "time").click();
  const detail = app(page).locator(".orbit-detail");
  await expect(detail).toBeInViewport();
  await expect(app(page).locator("[data-context-explore-action]")).toBeVisible();

  await app(page).locator("[data-context-explore-action]").click();
  await expect(app(page).locator("[data-orbit-path]")).toContainText("Time");
  await expect(node(page, "past")).toBeVisible();
});

test("reduced-motion mode removes ambient and navigational animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openOrbit(page);

  const animationState = await app(page).locator("#reality-orbit-prototype").evaluate((root) => {
    const starfield = root.querySelector(".orbit-starfield");
    const timeMarker = root.querySelector('[data-node-id="time"] .destination-marker');
    const canvas = root.querySelector(".orbit-canvas");
    return {
      canvasTransition: getComputedStyle(canvas).transitionDuration,
      nearStars: getComputedStyle(starfield, "::after").animationName,
      farStars: getComputedStyle(starfield, "::before").animationName,
      timeRing: getComputedStyle(timeMarker, "::before").animationName,
    };
  });

  expect(animationState).toEqual({
    canvasTransition: "0s",
    nearStars: "none",
    farStars: "none",
    timeRing: "none",
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
  await expect(app(page).locator("[data-orbit-nodes] [data-node-kind='destination']")).toHaveCount(8);

  await explore(page, "courage");

  await expect(node(page, "courage")).toHaveClass(/orbit-core/);
  await expect(app(page).locator("[data-selected-label]")).toHaveText("Courage");
  await expect(app(page).locator("[data-selected-role]")).toHaveText("Character quality");
  await expect(app(page).locator("[data-orbit-path]")).toContainText("Character");
  await expect(app(page).locator("[data-orbit-nodes] [data-node-kind='destination']")).toHaveCount(0);
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
  await expect(app(page).locator("[data-orbit-nodes] [data-node-kind='destination']")).toHaveCount(6);

  await explore(page, "joy");

  await expect(node(page, "joy")).toHaveClass(/orbit-core/);
  await expect(app(page).locator("[data-selected-label]")).toHaveText("Joy");
  await expect(app(page).locator("[data-orbit-nodes] [data-node-kind='destination']")).toHaveCount(0);
});

test("a terminal concept remains a focused endpoint without invented children", async ({ page }) => {
  await openOrbit(page);

  await explore(page, "scale");
  await explore(page, "individual");
  await explore(page, "person");
  await explore(page, "individual-actor");

  await expect(node(page, "individual-actor")).toHaveClass(/orbit-core/);
  await expect(app(page).locator("[data-selected-label]")).toHaveText("Individual actor");
  await expect(app(page).locator("[data-orbit-nodes] [data-node-kind='destination']")).toHaveCount(0);
});
