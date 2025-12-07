import { test, expect } from "@playwright/test";
import { waitForAppReady, clearBrowserStorage } from "../src/test-helpers";

test.describe("Settings and Language Switching User Stories", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    // Clear storage after page loads to avoid security errors
    await clearBrowserStorage(page);
  });

  test("User Changes Language Before Starting a Game", async ({ page }) => {
    // Verify initial language (Polski - default)
    await expect(page.locator("[data-testid='language-switcher'] span.md\\:block")).toHaveText("Polski");

    // Open the language switcher in the header
    await page.click("[data-testid='language-switcher'] button");
    await expect(page.locator(".dropdown-menu")).toBeVisible();

    // Change the language to Spanish
    await page.click("button:has-text(\"Español\")");
    await expect(page.locator("[data-testid='language-switcher'] span.md\\:block")).toHaveText("Español");

    // Mock vocabulary data for the game in Spanish
    await page.route("**/i18n/hr_es.json", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: "1", term_translation: "reunión", definition_translation: "Una reunión de personas", example_translation: "Tuvimos una reunión" },
        ]),
      });
    });
    await page.route("**/i18n/hr_en.json", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: "1", term: "meeting", definition: "A gathering", example: "We had a meeting" },
        ]),
      });
    });

    // Start a game - use data-testid for category and game mode selection
    await page.click("[data-testid='category-hr']");

    // Wait for config screen to appear and select Classic mode (click on the label containing the input)
    await page.waitForSelector("[data-testid='game-mode-classic']", { timeout: 5000 });
    await page.click("label:has([data-testid='game-mode-classic'])");

    // Click Start Session button
    await page.click("[data-testid='start-session']");

    // Wait for navigation to game page
    await page.waitForURL('**/game', { timeout: 10000 });

    // Dismiss round intro if shown
    try {
      await page.waitForSelector("button:has-text('Start Round')", { timeout: 5000 });
      await page.click("button:has-text('Start Round')");
      await page.waitForTimeout(500);
    } catch (e) {
      // Round intro might not be shown, continue
    }

    // Round 1: Recognition - Go through 3 cards (reading) -> actually it's just 1 card in the mock
    // WAITING FOR CARD VISIBILITY
    await page.waitForSelector("[data-testid='flashcard-container']", { timeout: 10000 });
    await expect(page.locator("[data-testid='flashcard-container']")).toBeVisible();

    // Click the card to flip it and verify Spanish translation appears
    await page.click("[data-testid='flashcard-container']");

    // Wait for flip animation
    await page.waitForTimeout(600);

    // Verify Spanish translation is shown on the card
    await expect(page.locator("text=reunión")).toBeVisible();

    // Click "Got It" button
    await page.click("text=Got It");

    // Wait for next card or summary
    await page.waitForTimeout(500);

    // Dismiss round intro for Round 2 if shown
    try {
      await page.waitForSelector("button:has-text('Start Round')", { timeout: 2000 });
      await page.click("button:has-text('Start Round')");
      await page.waitForTimeout(500);
    } catch (e) {
      // Round intro might not be shown, continue
    }

    // Round 2: Recall
    // WAITING FOR CARD VISIBILITY
    await page.waitForSelector("[data-testid='flashcard-container']", { timeout: 10000 });
    await expect(page.locator("[data-testid='flashcard-container']")).toBeVisible();

    // Click to flip
    await page.click("[data-testid='flashcard-container']");
    await page.waitForTimeout(600);

    // Click "Got It"
    await page.click("text=Got It");
    await page.waitForTimeout(500);

    // Dismiss round intro for Round 3 if shown
    try {
      await page.waitForSelector("button:has-text('Start Round')", { timeout: 2000 });
      await page.click("button:has-text('Start Round')");
      await page.waitForTimeout(500);
    } catch (e) {
      // Round intro might not be shown, continue
    }

    // Round 3: Writing
    // In Round 3, primary=spanish (prompt), secondary=english (expected answer)
    // So we see Spanish word "reunión" and type English "meeting"
    await expect(page.locator("text=/Translate to English/i")).toBeVisible();
    const input = page.locator("input[placeholder*='English']");
    await expect(input).toBeEnabled();

    // Fill correct answer (English translation of "reunión")
    await input.fill("meeting");
    await page.click("text=Check Answer");
    await page.waitForTimeout(1500);

    // Verify we're on the summary screen (assuming single card session)
    await expect(page.locator("text=Session Complete!")).toBeVisible();
  });

  test("User Interacts with the Settings Menu", async ({ page }) => {
    // Log in first to have an authenticated user
    await page.evaluate(() => {
      localStorage.setItem("firebase:authUser", JSON.stringify({
        uid: "mock-user-uid",
        email: "test-user@example.com",
        displayName: "Test User",
      }));
      localStorage.setItem("firebase:authCredential", JSON.stringify({
        accessToken: "mock-access-token",
        idToken: "mock-id-token",
      }));
    });
    await page.reload();
    await expect(page.locator("text=Master Business Lingo")).toBeVisible();

    // Open the hamburger menu (user menu)
    await page.click("[data-testid='user-menu-button']");
    await expect(page.locator("#settings-menu-title")).toBeVisible();

    // Change the theme and verify (theme button shows current theme mode)
    const themeButton = page.locator("[data-testid='theme-toggle-button']");
    await themeButton.waitFor({ state: 'visible' });
    const initialTheme = await themeButton.textContent();
    await themeButton.click();
    // Wait for the text to change (robust check)
    await expect(themeButton).not.toHaveText(initialTheme!, { timeout: 5000 });

    // Simulate navigation to "About" (we just verify the menu closes)
    await page.click("button:has-text('About')");
    await expect(page.locator("#settings-menu-title")).not.toBeVisible(); // Menu should close after clicking a link

    // Re-open menu to test Privacy Policy and Language
    await page.click("[data-testid='user-menu-button']");
    await expect(page.locator("#settings-menu-title")).toBeVisible();

    // Simulate navigation to "Privacy Policy"
    await page.click("button:has-text('Privacy Policy')");
    await expect(page.locator("#settings-menu-title")).not.toBeVisible(); // Menu should close

    // Re-open menu to test language change
    await page.click("[data-testid='user-menu-button']");
    await expect(page.locator("#settings-menu-title")).toBeVisible();

    // Change language using settings menu
    await page.click("[data-testid='language-button-pl']");

    // Verify the menu is still open and functional
    await expect(page.locator("#settings-menu-title")).toBeVisible();

    // Close the menu
    await page.click("[data-testid='settings-menu-close-button']");
    await expect(page.locator("#settings-menu-title")).not.toBeVisible();
  });
});
