import { test, expect } from '../fixtures';
import products from '../../test-data/products.json';

/**
 * REGRESSION (visual state): the "Add to Cart" button is an outline button at
 * rest (white background) and flips to a solid black background while pressed
 * (:active). This verifies that interactive styling and captures both states
 * as screenshots attached to the report.
 */
test.describe('Add to Cart button state @regression', () => {
  test('button background turns black while pressed', { tag: '@regression' }, async ({ productPage }, testInfo) => {
    const p = products.products[0];
    await productPage.goto(p.category, p.name);
    await productPage.expectLoaded();

    const btn = productPage.addToCartButton;
    const bg = () => btn.evaluate(el => getComputedStyle(el as Element).backgroundColor);

    // Rest state: white background.
    await expect.poll(bg).toBe('rgb(255, 255, 255)');
    testInfo.attach('button-rest', { body: await btn.screenshot(), contentType: 'image/png' });

    // Press and hold the button without releasing.
    const box = (await btn.boundingBox())!;
    await productPage.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await productPage.page.mouse.down();
    try {
      await expect.poll(bg).toBe('rgb(0, 0, 0)'); // black while active
      testInfo.attach('button-pressed', { body: await btn.screenshot(), contentType: 'image/png' });
    } finally {
      await productPage.page.mouse.up();
    }
  });
});
