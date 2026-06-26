import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage holds behaviour shared by every page in the Polymer Shop app.
 *
 * The Shop app is a Polymer PWA: almost every element lives inside an open
 * shadow root. Playwright's CSS engine pierces open shadow DOM automatically,
 * so selectors like `shop-detail #sizeSelect` cross the shadow boundary for us.
 */
export abstract class BasePage {
  readonly page: Page;
  readonly cartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // Cart icon in the app toolbar; the clickable control is the icon button
    // (the wrapping <a> has zero size and is not directly clickable).
    this.cartLink = page.locator('a[href="/cart"] paper-icon-button');
  }

  /** Open a path relative to baseURL and wait for the SPA to settle. */
  async open(path = '/'): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Number of items in the cart, read from the toolbar icon's accessible
   * label, e.g. aria-label="Shopping cart: 2 items".
   */
  async cartCount(): Promise<number> {
    const icon = this.page.locator('a[href="/cart"] paper-icon-button').first();
    const text = (await icon.getAttribute('aria-label')) ?? '';
    const match = text.match(/(\d+)\s+item/);
    return match ? Number(match[1]) : 0;
  }

  async goToCart(): Promise<void> {
    // The parallax header can translate the toolbar above the fold; scroll the
    // page to the top so the cart icon is in view before clicking it.
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.cartLink.first().scrollIntoViewIfNeeded();
    await this.cartLink.first().click();
    await this.page.waitForLoadState('networkidle');
  }

  /** Page-level title rendered in the document <title>. */
  async title(): Promise<string> {
    return this.page.title();
  }

  protected async expectVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }
}
