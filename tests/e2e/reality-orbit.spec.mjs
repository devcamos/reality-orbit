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
  await expect(page.getByText("Reality surrounded by the five complementary lenses:", { exact: false })).toBeAttached();
  await expect(page.getByRole("button", { name: "Explore Reality" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start with a teaching note" })).toBeVisible();
  await expect(page.getByText("See how it works", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Example route" })).toHaveCount(0);
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

test("keyboard users can skip directly to the app content", async ({ page }) => {
  await page.goto("/");

  const skipLink = page.getByRole("link", { name: "Skip to main content", exact: true });
  await expect(skipLink).toHaveCount(1);
  await skipLink.focus();
  await skipLink.press("Enter");

  await expect(page.locator("#app-content")).toBeFocused();
});

test("the welcome call to action feels alive without displacing text or ignoring reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1280, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const layout = await page.locator("[data-observatory-introduction]").evaluate((introduction) => {
      const shell = introduction.querySelector(".observatory-intro__shell");
      const selectors = [
        ".observatory-intro__opening",
        ".observatory-intro__map",
        ".observatory-intro__enter",
      ];
      const shellRect = shell.getBoundingClientRect();
      return {
        horizontalOverflow: shell.scrollWidth - shell.clientWidth,
        misplaced: selectors.filter((selector) => {
          const rect = introduction.querySelector(selector).getBoundingClientRect();
          return rect.left < shellRect.left - 1 || rect.right > shellRect.right + 1;
        }),
        clippedLensLabels: [...introduction.querySelectorAll(".observatory-intro__map-label")]
          .filter((label) => {
            const rect = label.getBoundingClientRect();
            return rect.left < 0 || rect.right > document.documentElement.clientWidth;
          })
          .map((label) => label.textContent),
      };
    });

    expect(layout.horizontalOverflow).toBeLessThanOrEqual(1);
    expect(layout.misplaced).toEqual([]);
    expect(layout.clippedLensLabels).toEqual([]);
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

test("app tabs expose content surfaces without losing the selected orbit node", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-enter-observatory]").click();
  await expect(page.locator("[data-primary-navigation]")).toBeVisible();
  await expect(page.locator("[data-primary-navigation] .app-navigation__tab").first()).toHaveText("About");
  await expect(page.getByRole("button", { name: "Home", exact: true })).toHaveAttribute("aria-current", "page");

  await node(page, "scale").click();
  await expect(app(page).locator("[data-understand-title]")).toHaveText("Scale");
  await expect(app(page).locator("[data-orbit-how-to] strong")).toHaveText("How to use");

  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await expect(page.getByRole("button", { name: "Notes", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.locator('[data-content-surface="field-notes"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "Notes", exact: true })).toBeVisible();
  await expect(page.locator('[data-field-note="paradoxes-where-simple-rules-stop-working"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Read Paradoxes: Where simple rules stop working" })).toBeVisible();
  await expect(page.locator('iframe[title="Reality Orbit"]')).toBeHidden();

  await page.reload();
  await expect(page.getByRole("button", { name: "Notes", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.locator('[data-content-surface="field-notes"]')).toBeVisible();

  await page.getByRole("button", { name: "Home", exact: true }).click();
  await expect(page.locator('iframe[title="Reality Orbit"]')).toBeVisible();
  await expect(app(page).locator("[data-understand-title]")).toHaveText("Scale");

  await app(page).locator("[data-explore-action]").click();
  await expect(app(page).locator("[data-orbit-path]")).toContainText("Scale");
  await page.reload();
  await expect(page.getByRole("button", { name: "Home", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(app(page).locator("[data-orbit-path]")).toContainText("Scale");
  await expect(app(page).locator("[data-understand-title]")).toHaveText("Scale");

  for (const tab of ["Library", "About"]) {
    await page.getByRole("button", { name: tab, exact: true }).click();
    await expect(page.locator(`[data-content-surface="${tab.toLowerCase()}"]`)).toBeVisible();
    await expect(page.locator('iframe[title="Reality Orbit"]')).toBeHidden();
  }

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1280, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    const layout = await page.locator("[data-primary-navigation]").evaluate((navigation) => {
      const navigationRect = navigation.getBoundingClientRect();
      return {
        horizontalOverflow: navigation.scrollWidth - navigation.clientWidth,
        misplacedTabs: [...navigation.querySelectorAll(".app-navigation__tab")]
          .filter((tab) => {
            const rect = tab.getBoundingClientRect();
            return rect.left < navigationRect.left - 1 || rect.right > navigationRect.right + 1;
          })
          .map((tab) => tab.textContent),
      };
    });
    expect(layout.horizontalOverflow).toBeLessThanOrEqual(1);
    expect(layout.misplacedTabs).toEqual([]);
  }
});

test("the Skills surface is not exposed in primary navigation", async ({ page }) => {
  await openOrbit(page);
  await expect(page.getByRole("button", { name: "Skills", exact: true })).toHaveCount(0);
  await expect(page.locator('[data-content-surface="skills"]')).toHaveCount(0);
});

test("Potential emergence is a terminal Framework destination with allegory anatomy", async ({ page }) => {
  await openOrbit(page);

  await explore(page, "category");
  await explore(page, "knowledge");
  await explore(page, "framework");

  await expect(node(page, "framework")).toHaveClass(/orbit-core/);
  await expect(node(page, "ooda-loop")).toBeVisible();
  await expect(node(page, "potential-emergence")).toBeVisible();
  await expect(node(page, "survival")).toBeVisible();
  await expect(app(page).locator("[data-orbit-nodes] .orbit-node:not(.orbit-core)")).toHaveCount(3);

  await node(page, "potential-emergence").click();
  await expect(app(page).locator("[data-understand-title]")).toHaveText("Potential emergence");
  await expect(app(page).locator("[data-understand-pareto-fields]")).toContainText("unused capacity as stone");
  await app(page).locator("[data-understand-more] summary").click();
  await expect(app(page).locator("[data-understand-more]")).toContainText("Immortality Stone");
  await expect(app(page).locator("[data-understand-more]")).toContainText("Stone Monkey");

  await explore(page, "potential-emergence");
  await expect(node(page, "potential-emergence")).toHaveClass(/orbit-core/);
  await expect(app(page).locator("[data-orbit-path]")).toContainText("Framework");
  await expect(app(page).locator("[data-orbit-nodes] .orbit-node:not(.orbit-core)")).toHaveCount(0);
});

test("Survival is a terminal Framework destination for fact versus choice", async ({ page }) => {
  await openOrbit(page);

  await explore(page, "category");
  await explore(page, "knowledge");
  await explore(page, "framework");

  await node(page, "survival").click();
  await expect(app(page).locator("[data-understand-title]")).toHaveText("Survival");
  await expect(app(page).locator("[data-understand-pareto-fields]")).toContainText("given, chosen");
  await app(page).locator("[data-understand-more] summary").click();
  await expect(app(page).locator("[data-understand-more]")).toContainText("Fact");
  await expect(app(page).locator("[data-understand-more]")).toContainText("Negotiable");
  await expect(app(page).locator("[data-understand-more]")).toContainText("Path");
  const related = app(page).locator('[data-anatomy-field="related-concepts"]');
  await expect(related.locator("[data-related-node-id]")).toHaveCount(9);
  await expect(related.locator('[data-related-node-id="organism"]')).toHaveText("Organism");

  await explore(page, "survival");
  await expect(node(page, "survival")).toHaveClass(/orbit-core/);
  await expect(app(page).locator("[data-orbit-path]")).toContainText("Framework");
  await expect(app(page).locator("[data-orbit-nodes] .orbit-node:not(.orbit-core)")).toHaveCount(0);

  await app(page).locator("[data-understand-more] summary").click();
  await related.locator('[data-related-node-id="organism"]').click();
  await expect(app(page).locator("[data-understand-title]")).toHaveText("Organism");
  await expect(node(page, "organism")).toHaveClass(/orbit-core/);
});

test("a teaching-note entry opens Potential emergence without hunting the map", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-enter-teaching-note]").click();
  await expect(page.getByRole("button", { name: "Notes", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.locator("[data-blog-reader='how-potential-becomes-consciousness']")).toBeVisible();
  await expect(page.getByRole("heading", { name: "How potential becomes consciousness" })).toBeVisible();
});

test("About states the free map and offers the current teaching example", async ({ page }) => {
  await openOrbit(page);
  await page.getByRole("button", { name: "About", exact: true }).click();
  await expect(page.locator('[data-content-surface="about"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "The public map stays free" })).toBeVisible();
  await page.getByRole("button", { name: /Explore Potential Emergence in Reality Orbit/ }).click();
  await expect(page.getByRole("button", { name: "Home", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(app(page).locator("[data-understand-title]")).toHaveText("Potential emergence");
});

test("Library sources return to their mapped concepts", async ({ page }) => {
  await openOrbit(page);
  await page.getByRole("button", { name: "Library", exact: true }).click();
  await expect(page.locator("[data-library-sources] [data-library-source]")).toHaveCount(3);
  await page.getByRole("button", { name: /Explore Potential Emergence in Reality Orbit/ }).click();
  await expect(page.getByRole("button", { name: "Home", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(app(page).locator("[data-understand-title]")).toHaveText("Potential emergence");
});

test("a Field Note can return to Survival", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-enter-observatory]").click();
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await page.getByRole("button", { name: "Read Given, chosen, and the path here" }).click();
  await expect(page.locator("[data-blog-reader='given-chosen-and-the-path-here']")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Keep Survival on the Knowledge shelf" })).toBeVisible();
  await page.getByRole("button", { name: /Explore Survival in Reality Orbit/ }).click();
  await expect(page.getByRole("button", { name: "Home", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(app(page).locator("[data-understand-title]")).toHaveText("Survival");
  await expect(app(page).locator("[data-orbit-path]")).toContainText("Survival");
});

test("a Field Note can return to Potential emergence", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-enter-observatory]").click();
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await page.getByRole("button", { name: "Read How potential becomes consciousness" }).click();
  await expect(page.locator("[data-blog-reader='how-potential-becomes-consciousness']")).toBeVisible();
  await expect(page.getByRole("heading", { name: "The immortality stone" })).toBeVisible();
  await page.getByRole("button", { name: /Explore Potential Emergence in Reality Orbit/ }).click();
  await expect(page.getByRole("button", { name: "Home", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(app(page).locator("[data-understand-title]")).toHaveText("Potential emergence");
  await expect(app(page).locator("[data-orbit-path]")).toContainText("Potential emergence");
});

test("a Field Note can return to its mapped Paradox node", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-enter-observatory]").click();
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await expect(page.locator("[data-blog-card-grid] .blog-card")).toHaveCount(7);
  await expect(page.locator('[data-field-note="how-potential-becomes-consciousness"]')).toHaveClass(/blog-card--featured/);
  await expect(page.locator('[data-field-note="probability-is-a-language-for-uncertainty"]')).toBeVisible();
  await expect(page.locator('[data-field-note="given-chosen-and-the-path-here"]')).toBeVisible();
  await expect(page.locator("[data-blog-taxonomy]")).toHaveCount(0);
  await expect(page.locator("[data-blog-filter]")).toBeVisible();
  await page.locator("[data-blog-filter]").selectOption("Resources");
  await expect(page.locator("[data-blog-card-grid] .blog-card")).toHaveCount(1);
  await page.locator("[data-blog-filter]").selectOption("all");
  await page.getByRole("button", { name: "Admin authoring", exact: true }).click();
  await expect(page.locator("[data-blog-admin]")).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Read Paradoxes: Where simple rules stop working" }).click();
  await expect(page.locator("[data-blog-reader='paradoxes-where-simple-rules-stop-working']")).toBeVisible();
  await page.getByRole("button", { name: /Explore Paradox in Reality Orbit/ }).click();
  await expect(page.getByRole("button", { name: "Home", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(app(page).locator("[data-understand-title]")).toHaveText("Paradox");
  await expect(app(page).locator("[data-orbit-path]")).toContainText("Paradox");
});

test("the probability Field Note teaches decision sequences and returns to Model", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-enter-observatory]").click();
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await expect(page.locator('[data-field-note="probability-is-a-language-for-uncertainty"]')).toBeVisible();
  await page.getByRole("button", { name: "Read Probability is a language for uncertainty" }).click();
  await expect(page.locator("[data-blog-reader='probability-is-a-language-for-uncertainty']")).toBeVisible();
  await expect(page.getByRole("heading", { name: "A decision sequence for uncertain situations" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Probability has a moral boundary" })).toBeVisible();
  await page.getByRole("button", { name: /Explore Model in Reality Orbit/ }).click();
  await expect(page.getByRole("button", { name: "Home", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(app(page).locator("[data-understand-title]")).toHaveText("Model");
  await expect(app(page).locator("[data-orbit-path]")).toContainText("Model");
});

test("a local admin can create and publish a Field Note", async ({ page }) => {
  await page.route("http://localhost:3000/api/**", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.pathname.endsWith("/categories")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ categories: ["Knowledge", "Systems"] }) });
      return;
    }
    if (requestUrl.pathname.endsWith("/profile")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ isAdmin: true }) });
      return;
    }
    if (requestUrl.pathname.endsWith("/posts")) {
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ post: { slug: "local-admin-field-note", date: "2026-08-01" } }) });
      return;
    }
    await route.continue();
  });

  await page.goto("/");
  await page.locator("[data-enter-observatory]").click();
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await page.getByRole("button", { name: "Admin authoring", exact: true }).click();
  await page.getByLabel("Admin bearer token").fill("local-test-token");
  await page.getByRole("button", { name: "Verify authoring access" }).click();
  await expect(page.getByText(/Authoring session verified/)).toBeVisible();
  await page.getByLabel("Title").fill("A local field note");
  await page.getByLabel("Primary node ID").fill("paradox");
  await page.getByLabel("Article content").fill("A local admin can publish a clear explanation and connect it to the map.");
  await page.getByRole("button", { name: "Publish field note" }).click();
  await expect(page.getByRole("heading", { name: "A local field note", exact: true })).toBeVisible();
});

test("loads the canonical Reality orbit without browser errors", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await openOrbit(page);

  await expect(node(page, "reality")).toBeVisible();
  const starfieldMotion = await app(page).locator(".orbit-starfield").evaluate((starfield) => {
    const far = getComputedStyle(starfield, "::before");
    const near = getComputedStyle(starfield, "::after");
    return {
      far: { name: far.animationName, duration: far.animationDuration },
      near: { name: near.animationName, duration: near.animationDuration },
    };
  });
  expect(starfieldMotion).toEqual({
    far: { name: "starfield-drift-far", duration: "44s" },
    near: { name: "starfield-drift-near", duration: "24s" },
  });
  await expect(app(page).locator("[data-shooting-stars] .orbit-shooting-star")).toHaveCount(8);
  for (const dimension of ["domain", "category", "time", "scale", "perspective"]) {
    await expect(node(page, dimension)).toBeVisible();
  }
  await expect(app(page).locator(".orbit-connection")).toHaveCount(0);
  await expect(app(page).locator("[data-orbit-path]")).toHaveText("Choose a dimension");
  await expect(app(page).locator("[data-understand-title]")).toHaveText("Reality");
  await expect(app(page).locator("[data-understand-eyebrow]")).toHaveText("The organising root");
  await expect(app(page).locator("[data-understand-pareto-fields] [data-anatomy-field]")).toHaveCount(7);
  await expect(app(page).locator("[data-understand-pareto-fields] .understand-section")).toHaveCount(4);
  await expect(app(page).locator('[data-anatomy-section="meaning"] .understand-section-title')).toHaveText("Meaning");
  await expect(app(page).locator("[data-understand-pareto-fields] .understand-verse-ref")).toHaveCount(0);
  await expect(app(page).locator('[data-anatomy-field="definition"] dt')).toHaveText("Definition");
  await expect(app(page).locator('[data-anatomy-field="definition"] dd')).toHaveText(
    "The organising reference point for exploring reality through five complementary dimensions.",
  );
  await expect(app(page).locator("[data-understand-more]")).toBeHidden();
  const conceptLayout = await app(page).locator("[data-understand-view]").evaluate((view) => {
    const viewRect = view.getBoundingClientRect();
    const regions = [...view.querySelectorAll(".understand-story, .understand-more, [data-anatomy-field]")];
    return {
      horizontalOverflow: view.scrollWidth - view.clientWidth,
        misplaced: regions
        .filter((region) => {
          if (region.hidden) return false;
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
  await expect(app(page).locator("#reality-orbit-prototype")).toHaveAttribute("data-cosmic-scene", "reality");
  await expect(app(page).locator("[data-selected-label]")).toHaveText("Scale");
  await expect(app(page).locator(".orbit-role[data-selected-role]")).toBeHidden();
  await expect(app(page).locator(".destination-meta")).toHaveCount(0);
  await expect(app(page).locator("[data-understand-title]")).toHaveText("Scale");
  await expect(app(page).locator("[data-understand-eyebrow]")).toHaveText("At what level");
  const exploreAction = app(page).locator("[data-explore-action]");
  await expect(exploreAction).toBeVisible();
  await expect(exploreAction).toHaveText("Explore Scale");
  await expect(exploreAction).toHaveCSS("--explore-color", "#78926f");

  await exploreAction.click();
  await expect(app(page).locator("#reality-orbit-prototype")).toHaveAttribute("data-cosmic-scene", "scale");
  await expect(app(page).locator("[data-orbit-path]")).toContainText("Reality");
  await expect(app(page).locator("[data-orbit-path]")).toContainText("Scale");
  await expect(exploreAction).toHaveText("Exploring Scale");
  await expect(node(page, "scale")).toHaveClass(/orbit-core/);
  await expect(node(page, "individual")).toBeVisible();

  await app(page).locator("[data-orbit-back]").click();
  await expect(app(page).locator("[data-orbit-path]")).toHaveText("Choose a dimension");
  await expect(app(page).locator("#reality-orbit-prototype")).toHaveAttribute("data-cosmic-scene", "reality");
  await expect(node(page, "scale")).toBeVisible();
});

test("Cognition keeps Decision process and Reasoning visible together", async ({ page }) => {
  await openOrbit(page);

  await explore(page, "domain");
  await explore(page, "psychological");
  await explore(page, "cognition");

  await expect(node(page, "decision-process")).toBeVisible();
  await expect(node(page, "reasoning")).toBeVisible();

  const stageBox = await app(page).locator(".orbit-stage").boundingBox();
  const childBoxes = await Promise.all([
    app(page).locator('[data-node-id="decision-process"]').boundingBox(),
    app(page).locator('[data-node-id="reasoning"]').boundingBox(),
  ]);
  expect(stageBox).not.toBeNull();
  for (const childBox of childBoxes) {
    expect(childBox).not.toBeNull();
    expect(childBox.x).toBeGreaterThanOrEqual(stageBox.x);
    expect(childBox.y).toBeGreaterThanOrEqual(stageBox.y);
    expect(childBox.x + childBox.width).toBeLessThanOrEqual(stageBox.x + stageBox.width);
    expect(childBox.y + childBox.height).toBeLessThanOrEqual(stageBox.y + stageBox.height);
  }
});

test("a learner can save a concept and return to it from the orbit", async ({ page }) => {
  await openOrbit(page);

  await node(page, "time").click();
  const saveButton = app(page).locator("[data-save-concept]");
  await expect(saveButton).toHaveAttribute("aria-pressed", "false");
  await saveButton.click();
  await expect(saveButton).toHaveAttribute("aria-pressed", "true");
  await expect(app(page).locator("[data-saved-concepts]")).toBeVisible();

  const savedTime = app(page).getByRole("button", { name: "Open saved concept Time", exact: true });
  await expect(savedTime).toBeVisible();
  await savedTime.click();

  await expect(app(page).locator("[data-orbit-path]")).toContainText("Time");
  await expect(app(page).locator("[data-understand-title]")).toHaveText("Time");
});

test("keyboard activation selects a dimension and exposes its action", async ({ page }) => {
  await openOrbit(page);

  await node(page, "perspective").focus();
  await page.keyboard.press("Enter");

  await expect(node(page, "perspective")).toBeFocused();
  await expect(node(page, "perspective")).toHaveAttribute("aria-current", "true");
  await expect(app(page).locator("[data-selected-label]")).toHaveText("Perspective");
  const exploreAction = app(page).locator("[data-explore-action]");
  await expect(exploreAction).toBeVisible();
  await exploreAction.focus();
  await exploreAction.press("Enter");
  await expect(node(page, "perspective")).toBeFocused();
});

test("hover and keyboard focus reveal a pre-selection concept preview", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openOrbit(page);

  await expect(node(page, "reality").locator(".destination-marker")).toHaveCSS("animation-name", "reality-breathe");
  await expect(node(page, "reality").locator(".destination-marker")).toHaveCSS("animation-duration", "3.6s");
  await expect
    .poll(() => node(page, "domain").locator(".destination-marker").evaluate((marker) => getComputedStyle(marker, "::before").animationName))
    .toBe("dimension-ring-drift");
  await expect
    .poll(() => node(page, "time").locator(".destination-marker").evaluate((marker) => getComputedStyle(marker, "::before").animationName))
    .toBe("time-ring-drift");

  await node(page, "domain").hover();
  await expect(app(page).locator("[data-orbit-preview]")).toBeVisible();
  await expect(app(page).locator("[data-orbit-hover-reticle]")).toBeVisible();
  await expect(app(page).locator("[data-orbit-preview-role]")).toHaveText("Lens on reality");
  await expect(app(page).locator("[data-orbit-preview-title]")).toHaveText("Domain");
  await expect(app(page).locator("[data-orbit-preview-summary]")).toHaveText(
    "The broad area of reality being studied.",
  );
  await expect(app(page).locator("[data-orbit-preview-question]")).toHaveText(
    "Name the phenomenon and question, select the domain carrying the main explanatory responsibility, then record any other domains needed to understand cross-domain effects.",
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
    "Name the observer or lens, state its assumptions and valued evidence, then compare another perspective and identify which facts remain invariant.",
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
  await expect(app(page).locator('[data-anatomy-field="definition"]')).toBeVisible();

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

test("Concept Anatomy sections remain readable across mobile, tablet, and desktop", async ({ page }) => {
  for (const viewport of [
    { name: "mobile", width: 390, height: 844 },
    { name: "iPad", width: 768, height: 1024 },
    { name: "desktop", width: 1280, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await openOrbit(page);
    await node(page, "time").click();

    const anatomyLayout = await app(page).locator("[data-understand-view]").evaluate((view) => {
      const viewRect = view.getBoundingClientRect();
      const sections = [...view.querySelectorAll(".understand-section")];
      const items = [...view.querySelectorAll(".understand-anatomy-item")];
      return {
        horizontalOverflow: view.scrollWidth - view.clientWidth,
        overflowY: getComputedStyle(view).overflowY,
        clientHeight: view.clientHeight,
        scrollHeight: view.scrollHeight,
        sections: sections.length,
        items: items.length,
        itemsAligned: items.every((item) => {
          const labelRect = item.querySelector("dt").getBoundingClientRect();
          const descriptionRect = item.querySelector("dd").getBoundingClientRect();
          return Math.abs(labelRect.left - descriptionRect.left) <= 1;
        }),
        misplaced: [...sections, ...items]
          .filter((region) => {
            const rect = region.getBoundingClientRect();
            return rect.left < viewRect.left - 1 || rect.right > viewRect.right + 1;
          })
          .map((region) => region.className),
      };
    });

    expect(anatomyLayout.horizontalOverflow, viewport.name).toBeLessThanOrEqual(1);
    expect(anatomyLayout.sections, viewport.name).toBe(4);
    expect(anatomyLayout.items, viewport.name).toBe(7);
    expect(anatomyLayout.itemsAligned, viewport.name).toBe(true);
    expect(anatomyLayout.misplaced, viewport.name).toEqual([]);
    if (viewport.name === "desktop") {
      expect(anatomyLayout.overflowY, viewport.name).toBe("auto");
      expect(anatomyLayout.scrollHeight, viewport.name).toBeGreaterThan(anatomyLayout.clientHeight);
    } else {
      expect(anatomyLayout.overflowY, viewport.name).toBe("visible");
    }
  }
});

test("desktop keeps the orbit visible while Concept Anatomy scrolls independently", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openOrbit(page);
  await node(page, "time").click();

  const layout = await app(page).locator("#reality-orbit-prototype").evaluate((root) => {
    const shell = root.querySelector(".orbit-shell").getBoundingClientRect();
    const stage = root.querySelector(".orbit-stage").getBoundingClientRect();
    const anatomy = root.querySelector("[data-understand-view]");
    const anatomyRect = anatomy.getBoundingClientRect();
    return {
      shellOverflow: root.scrollWidth - root.clientWidth,
      shellWithinViewport: shell.top >= -1 && shell.bottom <= document.documentElement.clientHeight + 1,
      stageWithinViewport: stage.top >= -1 && stage.bottom <= document.documentElement.clientHeight + 1,
      anatomyWithinViewport: anatomyRect.top >= -1 && anatomyRect.bottom <= document.documentElement.clientHeight + 1,
      anatomyOverflowY: getComputedStyle(anatomy).overflowY,
      anatomyCanScroll: anatomy.scrollHeight > anatomy.clientHeight,
    };
  });

  expect(layout.shellOverflow).toBeLessThanOrEqual(1);
  expect(layout.shellWithinViewport).toBe(true);
  expect(layout.stageWithinViewport).toBe(true);
  expect(layout.anatomyWithinViewport).toBe(true);
  expect(layout.anatomyOverflowY).toBe("auto");
  expect(layout.anatomyCanScroll).toBe(true);
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
      shootingStars: [...root.querySelectorAll(".orbit-shooting-star")].map((star) => getComputedStyle(star).animationName),
      timeRing: getComputedStyle(timeMarker, "::before").animationName,
      hoverReticle: getComputedStyle(root.querySelector(".orbit-hover-reticle-orbit")).animationName,
      hoverTransition: getComputedStyle(root.querySelector(".orbit-hover-reticle")).transitionDuration,
    };
  });

  expect(animationState).toEqual({
    canvasTransition: "0s",
    nearStars: "none",
    farStars: "none",
    shootingStars: Array(8).fill("none"),
    timeRing: "none",
    hoverReticle: "none",
    hoverTransition: "0s",
  });
});

test("the observatory exposes a stable accessible structure without serious violations", async ({ page }) => {
  await openOrbit(page);

  await page.addScriptTag({ path: axePath });
  const outerResults = await page.evaluate(async () => window.axe.run(document, {
    resultTypes: ["violations"],
    rules: {
      "color-contrast": { enabled: true },
    },
  }));
  const outerSeriousViolations = outerResults.violations.filter(({ impact }) => ["serious", "critical"].includes(impact));
  expect(outerSeriousViolations).toEqual([]);

  const orbit = app(page).locator("#reality-orbit-prototype");
  await expect(page.locator('iframe[title="Reality Orbit"]')).toHaveAttribute("aria-describedby", "orbit-frame-instructions");
  await expect(app(page).locator('[role="status"][aria-live="polite"]')).toHaveAttribute("aria-atomic", "true");
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
