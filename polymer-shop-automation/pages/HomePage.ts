import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Landing page (/) showing the four shopping categories. */
export class HomePage extends BasePage {
  readonly categoryTiles: Locator;

  constructor(page: Page) {
    super(page);
    // Each "Shop Now" tile links to /list/<category>.
    this.categoryTiles = page.locator('shop-home a[href^="/list/"]');
  }

  async goto(): Promise<void> {
    await this.open('/');
  }

  /** Click a category by its slug, e.g. "mens_outerwear". */
  async openCategory(slug: string): Promise<void> {
    await this.page.locator(`shop-home a[href="/list/${slug}"]`).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  /** Distinct category slugs linked from the home page. */
  async categorySlugs(): Promise<string[]> {
    const hrefs = await this.categoryTiles.evaluateAll(els =>
      els.map(e => (e as HTMLAnchorElement).getAttribute('href') ?? ''));
    const slugs = hrefs.map(h => h.replace('/list/', '')).filter(Boolean);
    return [...new Set(slugs)];
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page.locator('shop-home')).toBeVisible();
  }
}
