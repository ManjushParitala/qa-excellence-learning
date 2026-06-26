import { test as base } from '@playwright/test';
import { HomePage, CategoryPage, ProductPage, CartPage, CheckoutPage } from '../pages';

/**
 * Custom fixtures: each test receives ready-to-use page objects instead of
 * constructing them by hand. This keeps the specs declarative and is the
 * standard Page Object Model wiring for Playwright.
 */
type Pages = {
  homePage: HomePage;
  categoryPage: CategoryPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<Pages>({
  homePage: async ({ page }, use) => { await use(new HomePage(page)); },
  categoryPage: async ({ page }, use) => { await use(new CategoryPage(page)); },
  productPage: async ({ page }, use) => { await use(new ProductPage(page)); },
  cartPage: async ({ page }, use) => { await use(new CartPage(page)); },
  checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)); },
});

export { expect } from '@playwright/test';
