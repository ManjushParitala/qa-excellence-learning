import { test, expect } from '../fixtures';

/**
 * SANITY: core client-side navigation Home -> Category -> Product.
 * Verifies the Polymer SPA router wires the primary journey together.
 */
test.describe('Navigation @sanity', () => {
  test('navigate from home to a category to a product', { tag: '@sanity' }, async ({ homePage, categoryPage, productPage }) => {
    await homePage.goto();
    await homePage.openCategory('mens_outerwear');

    await categoryPage.expectLoaded();
    expect(await categoryPage.productCount()).toBeGreaterThan(0);

    await categoryPage.openProductByIndex(0);
    await productPage.expectLoaded();
    expect((await productPage.productName()).length).toBeGreaterThan(0);
  });
});
