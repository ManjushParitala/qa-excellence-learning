import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Product listing page (/list/<category>). */
export class CategoryPage extends BasePage {
  readonly productLinks: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.productLinks = page.locator('shop-list a[href^="/detail/"]');
    this.title = page.locator('shop-list .title');
  }

  async goto(slug: string): Promise<void> {
    await this.open(`/list/${slug}`);
  }

  /** How many products are displayed in this category. */
  async productCount(): Promise<number> {
    await this.productLinks.first().waitFor({ state: 'visible' });
    return this.productLinks.count();
  }

  /** Product names rendered in the grid. */
  async productNames(): Promise<string[]> {
    return this.productLinks.locator('h2').allInnerTexts();
  }

  /** Open a product by its zero-based position in the grid. */
  async openProductByIndex(index = 0): Promise<void> {
    await this.productLinks.nth(index).click();
    await this.page.waitForLoadState('networkidle');
  }

  /** Open a product by visible name. */
  async openProductByName(name: string): Promise<void> {
    await this.productLinks.filter({ hasText: name }).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.productLinks.first()).toBeVisible();
  }
}
