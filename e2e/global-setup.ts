import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('Global setup: Relying on Playwright webServer to start emulators.');
}

export default globalSetup;
