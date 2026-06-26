import { test, expect } from '../fixtures';
import products from '../../test-data/products.json';

/**
 * REGRESSION: cart behaviour - empty state, single item, and multiple
 * distinct items accumulating in the cart.
 */
test.describe('Cart @regression', () => {
  test('empty cart shows the empty message', { tag: '@regression' }, async ({ cartPage }) => {
    await cartPage.goto();
    await cartPage.expectLoaded();
    expect(await cartPage.isEmpty()).toBe(true);
    expect(await cartPage.itemCount()).toBe(0);
  });

  test('added product appears as a line item in the cart', { tag: '@regression' }, async ({ productPage, cartPage }) => {
    const p = products.products[0];
    await productPage.goto(p.category, p.name);
    await productPage.addToCart();
    await productPage.goToCart();
    await cartPage.expectLoaded();
    expect(await cartPage.itemCount()).toBe(1);
  });

  test('two different products produce two line items', { tag: '@regression' }, async ({ productPage, cartPage }) => {
    const [a, b] = products.products;
    await productPage.goto(a.category, a.name);
    await productPage.addToCart();
    await productPage.goto(b.category, b.name);
    await productPage.addToCart();
    await cartPage.goto();
    expect(await cartPage.itemCount()).toBe(2);
  });
});
