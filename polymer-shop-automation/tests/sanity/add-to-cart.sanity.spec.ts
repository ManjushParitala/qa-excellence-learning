import { test, expect } from '../fixtures';
import products from '../../test-data/products.json';

/**
 * SANITY: adding a product to the cart is the revenue-critical action.
 */
test.describe('Add to cart @sanity', () => {
  test('adding a product updates the cart badge', { tag: '@sanity' }, async ({ productPage }) => {
    const p = products.products[0];
    await productPage.goto(p.category, p.name);
    await productPage.expectLoaded();

    expect(await productPage.cartCount()).toBe(0);
    await productPage.addToCart();
    expect(await productPage.cartCount()).toBe(1);
  });
});
