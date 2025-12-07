import { Page } from '@playwright/test';

// Extend Window interface for Firebase
declare global {
  interface Window {
    firebase?: any;
    authService?: any;
  }
}

/**
 * Helper functions for E2E tests
 */

/**
 * Signs in a test user using Firebase Auth Emulator REST API
 * @param page Playwright page instance
 * @param email User email
 * @param password User password
 * @param displayName Optional display name
 * @returns Promise that resolves when user is signed in
 */
export async function signInTestUser(
  page: Page,
  email: string,
  password: string,
  displayName?: string
): Promise<void> {
  try {
    // First, create the user in the emulator (ignore if already exists)
    const createResponse = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        displayName: displayName || email.split('@')[0],
        photoUrl: 'https://lh3.googleusercontent.com/a/test-photo.jpg',
        returnSecureToken: true,
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.warn(`User creation failed (may already exist): ${error}`);
    }

    // Now sign in the user through the UI by clicking the sign-in button
    await page.click("[data-testid='user-menu-button']");
    // Wait for settings menu to be visible
    await page.waitForSelector("[data-testid='signin-button']", { timeout: 10000 });
    await page.click("[data-testid='signin-button']");
    await page.click("text=Continue with Email");

    await page.fill("[data-testid='email-input']", email);
    await page.fill("[data-testid='password-input']", password);
    await page.click("[data-testid='submit-button']");

    // Wait for auth state to be updated
    await page.waitForTimeout(2000);

  } catch (error) {
    console.error('Failed to sign in test user:', error);
    throw error;
  }
}

/**
 * Signs out the current user
 * @param page Playwright page instance
 */
export async function signOutUser(page: Page): Promise<void> {
  await page.evaluate(() => {
    if (window.firebase && window.firebase.auth) {
      return window.firebase.auth().signOut();
    }
    // Also try via authService if exposed
    if ((window as any).authService) {
      return (window as any).authService.signOut();
    }
  });
  await page.waitForTimeout(500);
}

/**
 * Clears browser storage safely
 * @param page Playwright page instance
 */
export async function clearBrowserStorage(page: Page): Promise<void> {
  // Clear cookies first
  const context = page.context();
  await context.clearCookies();

  // Only clear storage if page is already loaded and we can access it
  try {
    await page.evaluate(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
    });
  } catch (error) {
    // If we can't access storage, it's probably because the page hasn't loaded yet
    // This is fine - the page will initialize with empty storage
    console.warn('Could not clear browser storage - page may not be fully loaded yet');
  }
}

/**
 * Waits for the Angular app to be fully loaded and ready
 * @param page Playwright page instance
 */
export async function waitForAppReady(page: Page): Promise<void> {
  await page.waitForSelector('text=Master Business Lingo', { timeout: 30000 });
  // Wait a bit more for any async initialization
  await page.waitForTimeout(1000);
}

/**
 * Creates a test user via Firebase Auth Emulator REST API
 * This is useful for setting up test data without going through the UI
 * @param email User email
 * @param password User password
 * @param displayName Optional display name
 */
export async function createTestUser(
  email: string,
  password: string,
  displayName?: string
): Promise<void> {
  try {
    const response = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        displayName: displayName || email.split('@')[0],
        returnSecureToken: true,
      }),
    });

    if (!response.ok && !response.status.toString().startsWith('4')) {
      // 4xx errors might mean user already exists, which is fine
      throw new Error(`Failed to create test user: ${await response.text()}`);
    }
  } catch (error) {
    console.error('Failed to create test user:', error);
    throw error;
  }
}

/**
 * Authenticates a user via Firebase Auth Emulator REST API and sets the auth state in the browser
 * This creates a real authenticated session that persists across page reloads
 * @param page Playwright page instance
 * @param email User email
 * @param password User password (default: "password123")
 * @param displayName User display name
 */
export async function mockFirebaseAuth(
  page: Page,
  email: string,
  password: string = "password123",
  displayName?: string
): Promise<void> {
  console.log(`[TEST] Authenticating user via Firebase Emulator: ${email}`);

  try {
    // First, try to create the user (ignore if already exists)
    const signUpResponse = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        displayName: displayName || email.split('@')[0],
        returnSecureToken: true,
      }),
    });

    let idToken: string;
    let localId: string;
    let refreshToken: string;

    if (signUpResponse.ok) {
      const signUpData = await signUpResponse.json();
      idToken = signUpData.idToken;
      localId = signUpData.localId;
      refreshToken = signUpData.refreshToken;
      console.log('[TEST] ✓ User created successfully');
    } else {
      // User might already exist, try to sign in
      console.log('[TEST] User may already exist, attempting sign in...');
      const signInResponse = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      });

      if (!signInResponse.ok) {
        throw new Error(`Failed to sign in: ${await signInResponse.text()}`);
      }

      console.log('[TEST] ✓ User signed in successfully (verified existence)');
    }

    // Authenticate using the exposed AuthService in the browser
    await page.evaluate(async ({ email, password }) => {
      const authService = (window as any).authService;
      if (!authService) {
        throw new Error('AuthService not found on window. Ensure it is exposed in constructor.');
      }

      console.log(`[TEST-BROWSER] Signing in via AuthService: ${email}`);
      await authService.signInWithEmail(email, password);
      console.log('[TEST-BROWSER] minimal sign in complete');
    }, { email, password });

    console.log('[TEST] ✓ User signed in via AuthService');
    // We don't need to reload page now, as the auth state change will be picked up immediately
    // But we might need to wait for the UI to update
    await page.waitForTimeout(1000);

  } catch (error) {
    console.error('[TEST] ❌ Failed to mock Firebase auth:', error);
    throw error;
  }
}


/**
 * Helper function to dismiss round intro screen if it appears
 */
export async function dismissRoundIntro(page: Page): Promise<void> {
  console.log('[TEST] Attempting to dismiss round intro...');
  try {
    // Wait longer for the intro to appear (animations etc)
    const startButton = page.locator("button:has-text('Start Round')");
    await startButton.waitFor({ state: 'visible', timeout: 10000 });

    console.log('[TEST] ✓ Round intro found, clicking Start Round button');
    await startButton.click();

    // Wait for the intro to disappear
    await startButton.waitFor({ state: 'hidden', timeout: 5000 });
    console.log('[TEST] ✓ Round intro dismissed');
  } catch (e) {
    console.log('[TEST] ℹ Round intro not shown or timed out (might have been skipped or appeared late), continuing...');

    // Debug: Print what IS visible if we suspect it's stuck
    try {
      const dialog = page.locator('div[role="dialog"]');
      if (await dialog.isVisible()) {
        console.log('[TEST] Found a dialog visible:', await dialog.textContent());
      }
    } catch (err) { }
  }
}

/**
 * Helper function to play through a complete classic game (3 rounds)
 * @param page - Playwright page object
 * @param expectedAnswer - The English translation expected in Round 3
 */
export async function playCompleteClassicGame(page: Page, expectedAnswer: string = "greeting"): Promise<void> {
  console.log('[TEST] Starting playCompleteClassicGame with expectedAnswer:', expectedAnswer);

  // Round 1: Recognition (English -> Translation)
  console.log('[TEST] === Round 1: Recognition ===');
  await dismissRoundIntro(page);

  console.log('[TEST] Waiting for flashcard...');
  // Use data-testid for more reliable selection and increased timeout for robustness
  const flashcard = page.locator("[data-testid='flashcard-container']");
  await flashcard.waitFor({ state: 'visible', timeout: 30000 });
  console.log('[TEST] ✓ Flashcard visible, clicking to flip');
  await flashcard.click();
  await page.waitForTimeout(600);
  console.log('[TEST] Clicking Got It button');
  await page.click("text=Got It");
  await page.waitForTimeout(500);
  console.log('[TEST] ✓ Round 1 complete');

  // Round 2: Recall (Translation -> English)
  console.log('[TEST] === Round 2: Recall ===');
  await dismissRoundIntro(page);

  console.log('[TEST] Waiting for flashcard...');
  const flashcard2 = page.locator("[data-testid='flashcard-container']");
  await flashcard2.waitFor({ state: 'visible', timeout: 30000 });
  console.log('[TEST] ✓ Flashcard visible, clicking to flip');
  await flashcard2.click();
  await page.waitForTimeout(600);
  console.log('[TEST] Clicking Got It button');
  await page.click("text=Got It");
  await page.waitForTimeout(500);
  console.log('[TEST] ✓ Round 2 complete');

  // Round 3: Writing (Translation -> English)
  console.log('[TEST] === Round 3: Writing ===');
  await dismissRoundIntro(page);

  console.log('[TEST] Checking input field inside card...');
  // Use generic selector to find ANY input in the card
  const input = page.locator("app-typing-card input");
  try {
    await input.waitFor({ state: 'visible', timeout: 5000 });
    const ph = await input.getAttribute('placeholder');
    console.log(`[TEST] ✓ Found input. Placeholder: "${ph}"`);

    if (!ph?.includes('English')) {
      console.warn(`[TEST] ⚠ Placeholder does not contain "English". Actual: "${ph}"`);
    }
  } catch (e) {
    console.log('[TEST] ❌ Input field not found in app-typing-card!');
    const html = await page.innerHTML('app-typing-card');
    console.log('[TEST] Card HTML:', html);
    throw e;
  }
  console.log('[TEST] ✓ Input field visible, filling with:', expectedAnswer);
  await input.fill(expectedAnswer);
  console.log('[TEST] Clicking Check Answer button');
  await page.click("text=Check Answer");
  await page.waitForTimeout(1500);

  // After checking answer, there might be feedback - click Continue/Next if present
  try {
    const continueButton = page.locator("button:has-text('Continue'), button:has-text('Next'), button:has-text('Finish')");
    await continueButton.waitFor({ state: 'visible', timeout: 2000 });
    console.log('[TEST] Found Continue/Next button, clicking...');
    await continueButton.click();
    await page.waitForTimeout(1000); // Wait for navigation
  } catch (e) {
    console.log('[TEST] No Continue button found, proceeding...');
  }

  // Wait for summary screen to appear
  try {
    console.log('[TEST] Waiting for summary screen...');
    await page.locator("text=Session Complete!").waitFor({ state: 'visible', timeout: 15000 });
    console.log('[TEST] ✓ Summary screen visible');
  } catch (e) {
    console.log('[TEST] ⚠ Summary screen not visible yet, may need manual navigation');
  }

  console.log('[TEST] ✓ Round 3 complete');
  console.log('[TEST] ✓ All 3 rounds completed successfully');
}

/**
 * Helper function to start a game session
 */
export async function startGameSession(page: Page, category: string = "HR", mode: string = "Classic"): Promise<void> {
  console.log(`[TEST] Starting game session: ${category} - ${mode}`);
  console.log('[TEST] Clicking category:', category);
  // Wait for the category to be visible and stable before clicking
  const categoryLocator = page.locator(`text=${category}`);
  await categoryLocator.waitFor({ state: 'visible' });
  await categoryLocator.click();
  console.log('[TEST] Clicking mode:', mode);
  await page.click(`text=${mode}`);
  console.log('[TEST] Clicking Start Session');
  await page.click("text=Start Session");
  console.log('[TEST] ✓ Game session started');
}

/**
 * Helper function to ensure the settings menu is closed
 * @param page Playwright page instance
 */
export async function ensureMenuClosed(page: Page): Promise<void> {
  const menuButton = page.locator("[data-testid='user-menu-button']");
  const closeButton = page.locator("[data-testid='settings-menu-close-button']");
  const backdrop = page.locator("[data-testid='settings-menu-backdrop']");
  const emailModalClose = page.locator("button[aria-label='Close modal']");

  // Check for email modal first (it might be on top of the menu)
  if (await emailModalClose.isVisible()) {
    console.log('[TEST] Email modal detected, closing...');
    try {
      await emailModalClose.click({ timeout: 2000 });
      await page.waitForTimeout(300);
    } catch (e) {
      console.log('[TEST] ℹ Email modal closed while attempting to click close button (race condition), continuing...');
    }
  }

  // Check if menu is visible (by checking close button or backdrop) or expanded
  const isMenuVisible = await closeButton.isVisible() || await backdrop.isVisible();
  const isExpanded = await menuButton.getAttribute('aria-expanded');

  if (isMenuVisible || isExpanded === 'true') {
    console.log('[TEST] Menu is open, closing it...');

    // 1. Try clicking the close button inside the menu (most reliable)
    try {
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(300); // Wait for animation
        return;
      }
    } catch (e) {
      // Ignore
    }

    // 2. Try clicking the backdrop
    try {
      if (await backdrop.isVisible()) {
        await backdrop.click();
        await page.waitForTimeout(300); // Wait for animation
        return;
      }
    } catch (e) {
      // Ignore
    }

    console.log('[TEST] ⚠ Could not find standard ways to close menu, but it reports as expanded or visible');
  }
}
