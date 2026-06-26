import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  // One retry recovers the occasional headed-mode transport hiccup.
  retries: 1,
  // Single worker => one Chrome window to watch (set WORKERS to override).
  workers: Number(process.env.WORKERS) || 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
  ],
  use: {
    baseURL: 'https://shop.polymer-project.org',
    // Run in a visible browser window by default; set HEADLESS=1 for a
    // background run (e.g. CI / quick checks).
    headless: process.env.HEADLESS === '1',
    // Set SLOWMO=<ms> to slow each action down when watching a headed run.
    launchOptions: { slowMo: Number(process.env.SLOWMO) || 0 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    // channel: 'chrome' uses the locally installed Google Chrome (not the
    // bundled Chromium), so tests run in your real browser.
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
  ],
});
