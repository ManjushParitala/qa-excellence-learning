import { test, expect } from '../fixtures';
import products from '../../test-data/products.json';

/**
 * GUIDED DEMO: the same purchase journey, broken into named, narrated steps.
 * Run it slowly and headed to watch each click:
 *   SLOWMO=1200 npx playwright test guided-demo --headed --workers=1
 *
 * Every transition here is a real CLICK (not a URL jump), so you see the app
 * react like a shopper would drive it.
 */
test('guided: add to cart, then open cart @demo', { tag: '@demo' }, async ({ homePage, categoryPage, productPage, cartPage }) => {
  const p = products.products[0];

  await test.step('1. Open the store home page', async () => {
    await homePage.goto();
    await homePage.expectLoaded();
  });

  await test.step('2. Click a category tile', async () => {
    await homePage.openCategory(p.category);
    await categoryPage.expectLoaded();
  });

  await test.step('3. Click the first product', async () => {
    await categoryPage.openProductByIndex(0);
    await productPage.expectLoaded();
    console.log('   Product:', await productPage.productName());
  });

  await test.step('4. Choose size M and quantity 2', async () => {
    await productPage.selectSize('M');
    await productPage.selectQuantity(2);
  });

  await test.step('5. Click "Add to Cart"', async () => {
    expect(await productPage.cartCount()).toBe(0);
    await productPage.addToCartButton.click();
    await productPage.page.waitForTimeout(800);
    expect(await productPage.cartCount()).toBe(2);
    console.log('   Cart badge now:', await productPage.cartCount());
  });

  await test.step('6. Click the cart icon to open the cart', async () => {
    await productPage.goToCart();
    await cartPage.expectLoaded();
  });

  await test.step('7. Confirm the item is in the cart', async () => {
    expect(await cartPage.itemCount()).toBe(1);
    console.log('   Line items in cart:', await cartPage.itemCount());
  });
});
