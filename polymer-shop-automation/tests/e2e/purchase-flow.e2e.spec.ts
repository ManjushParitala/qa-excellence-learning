import { test, expect } from '../fixtures';
import products from '../../test-data/products.json';
import checkout from '../../test-data/checkout.json';

/**
 * E2E: the complete happy-path purchase journey, exercising every page object:
 * Home -> Category -> Product -> Add to Cart -> Cart -> Checkout -> Success.
 */
test.describe('Purchase flow @e2e', () => {
  test('a shopper can buy a product end to end', { tag: '@e2e' }, async ({ homePage, categoryPage, productPage, cartPage, checkoutPage }) => {
    await homePage.goto();
    await homePage.openCategory(products.products[0].category);

    await categoryPage.expectLoaded();
    await categoryPage.openProductByIndex(0);

    await productPage.expectLoaded();
    await productPage.addToCart({ quantity: 1 });
    expect(await productPage.cartCount()).toBe(1);

    await productPage.goToCart();
    await cartPage.expectLoaded();
    expect(await cartPage.itemCount()).toBe(1);
    await cartPage.proceedToCheckout();

    await checkoutPage.expectLoaded();
    await checkoutPage.completeCheckout(checkout.valid);
    await checkoutPage.expectOrderSuccess();
  });

  test('checkout succeeds for an international customer', { tag: '@e2e' }, async ({ productPage, cartPage, checkoutPage }) => {
    const p = products.products[1];
    await productPage.goto(p.category, p.name);
    await productPage.addToCart();
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await checkoutPage.completeCheckout(checkout.internationalCustomer);
    await checkoutPage.expectOrderSuccess();
  });
});
