import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Product detail page (/detail/<category>/<name>). */
export class ProductPage extends BasePage {
  readonly heading: Locator;
  readonly price: Locator;
  readonly sizeSelect: Locator;
  readonly quantitySelect: Locator;
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    super(page);
    // shop-detail renders the product title plus "you may also like" tiles,
    // so several h1/.price nodes exist; the product's own are the first.
    this.heading = page.locator('shop-detail h1').first();
    this.price = page.locator('shop-detail .price').first();
    this.sizeSelect = page.locator('shop-detail #sizeSelect');
    this.quantitySelect = page.locator('shop-detail #quantitySelect');
    this.addToCartButton = page.locator('shop-detail').getByText('Add to Cart').first();
  }

  async goto(category: string, name: string): Promise<void> {
    await this.open(`/detail/${category}/${name}`);
  }

  async productName(): Promise<string> {
    return (await this.heading.innerText()).trim();
  }

  async selectSize(size: string): Promise<void> {
    await this.sizeSelect.selectOption({ label: size });
  }

  async selectQuantity(qty: number): Promise<void> {
    await this.quantitySelect.selectOption({ label: String(qty) });
  }

  /** Add the product to the cart with optional size/quantity. */
  async addToCart(opts: { size?: string; quantity?: number } = {}): Promise<void> {
    if (opts.size) await this.selectSize(opts.size);
    if (opts.quantity) await this.selectQuantity(opts.quantity);
    await this.addToCartButton.click();
    // A confirmation toast is shown; give the cart state a moment to update.
    await this.page.waitForTimeout(800);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.addToCartButton).toBeVisible();
  }
}
