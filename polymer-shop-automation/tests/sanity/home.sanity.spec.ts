import { test, expect } from '../fixtures';
import categories from '../../test-data/categories.json';

/**
 * SANITY: the home page is the front door of the app. If it does not load
 * with all categories, nothing downstream is worth running.
 */
test.describe('Home page @sanity', () => {
  test('home page loads with the app shell', { tag: '@sanity' }, async ({ homePage }) => {
    await homePage.goto();
    await homePage.expectLoaded();
    await expect(homePage.page).toHaveTitle(/SHOP/i);
  });

  test('all four shopping categories are linked', { tag: '@sanity' }, async ({ homePage }) => {
    await homePage.goto();
    const slugs = await homePage.categorySlugs();
    const expected = categories.categories.map(c => c.slug);
    expect(slugs.sort()).toEqual(expected.sort());
  });
});
