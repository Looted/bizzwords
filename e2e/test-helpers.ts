import { Page, expect } from "@playwright/test";

/**
 * Helper function to dismiss round intro screen if it appears
 */
export async function dismissRoundIntro(page: Page) {
  try {
    await page.waitForSelector("button:has-text('Start Round')", { timeout: 2000 });
    await page.click("button:has-text('Start Round')");
    await page.waitForTimeout(500);
  } catch (e) {
    // Round intro might not be shown, continue
  }
}

/**
 * Helper function to play through a complete classic game (3 rounds)
 * @param page - Playwright page object
 * @param expectedAnswer - The English translation expected in Round 3
 */
export async function playCompleteClassicGame(page: Page, expectedAnswer: string = "greeting") {
  // Round 1: Recognition (English -> Translation)
  await dismissRoundIntro(page);

  await expect(page.locator("[class*='perspective-1000']")).toBeVisible();
  await page.click("[class*='perspective-1000']");
  await page.waitForTimeout(600);
  await page.click("text=Got It");
  await page.waitForTimeout(500);

  // Round 2: Recall (Translation -> English)
  await dismissRoundIntro(page);

  await expect(page.locator("[class*='perspective-1000']")).toBeVisible();
  await page.click("[class*='perspective-1000']");
  await page.waitForTimeout(600);
  await page.click("text=Got It");
  await page.waitForTimeout(500);

  // Round 3: Writing (Translation prompt -> Type English)
  await dismissRoundIntro(page);

  await expect(page.locator("text=/Translate to English/i")).toBeVisible();
  const input = page.locator("input[placeholder*='English']");
  await expect(input).toBeEnabled();
  await input.fill(expectedAnswer);
  await page.click("text=Check Answer");
  await page.waitForTimeout(1500);
}

/**
 * Helper function to start a game session
 */
export async function startGameSession(page: Page, category: string = "HR", mode: string = "Classic") {
  await page.click(`text=${category}`);
  await page.click(`text=${mode}`);
  await page.click("text=Start Session");
}
