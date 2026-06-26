import { test, expect } from '../fixtures';
import categories from '../../test-data/categories.json';

/**
 * REGRESSION: data-driven coverage across every category. Each category must
 * load its listing and render at least one product.
 */
test.describe('Category listings @regression', () => {
  for (const cat of categories.categories) {
    test(`category "${cat.slug}" lists products`, { tag: '@regression' }, async ({ categoryPage }) => {
      await categoryPage.goto(cat.slug);
      await categoryPage.expectLoaded();
      expect(await categoryPage.productCount()).toBeGreaterThan(0);
    });
  }

  test('opening a product by name lands on its detail page', { tag: '@regression' }, async ({ categoryPage, productPage }) => {
    await categoryPage.goto('mens_outerwear');
    const names = await categoryPage.productNames();
    // Fall back to index when titles are rendered as images only.
    if (names.filter(Boolean).length) {
      await categoryPage.openProductByName(names.find(Boolean)!);
    } else {
      await categoryPage.openProductByIndex(0);
    }
    await productPage.expectLoaded();
    await expect(productPage.page).toHaveURL(/\/detail\//);
  });
});
