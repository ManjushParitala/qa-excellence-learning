import { test, expect } from '../fixtures';
import products from '../../test-data/products.json';

/**
 * REGRESSION: product detail page behaviour - title, price, size/quantity
 * selectors, and adding with a chosen size + quantity.
 */
test.describe('Product detail @regression', () => {
  const p = products.products[0];

  test('detail page shows title, price, size and quantity controls', { tag: '@regression' }, async ({ productPage }) => {
    await productPage.goto(p.category, p.name);
    await productPage.expectLoaded();
    await expect(productPage.heading).toHaveText(/\S+/);
    await expect(productPage.price).toBeVisible();
    await expect(productPage.sizeSelect).toBeVisible();
    await expect(productPage.quantitySelect).toBeVisible();
  });

  test('adding with explicit size and quantity updates the cart', { tag: '@regression' }, async ({ productPage }) => {
    await productPage.goto(p.category, p.name);
    await productPage.expectLoaded();
    await productPage.addToCart({ size: 'M', quantity: 2 });
    expect(await productPage.cartCount()).toBe(2);
  });
});
