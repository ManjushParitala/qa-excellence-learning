import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { CheckoutInfo } from '../test-data/types';

/**
 * Checkout page (/checkout).
 *
 * On a successful order the app routes to /checkout/success and renders a
 * "Thank you" header with a Finish button. This is a demo: no real payment
 * is processed and any well-formed card is accepted.
 */
export class CheckoutPage extends BasePage {
  readonly form: Locator;
  readonly accountEmail: Locator;
  readonly accountPhone: Locator;
  readonly shipAddress: Locator;
  readonly shipCity: Locator;
  readonly shipState: Locator;
  readonly shipZip: Locator;
  readonly shipCountry: Locator;
  readonly ccName: Locator;
  readonly ccNumber: Locator;
  readonly ccExpMonth: Locator;
  readonly ccExpYear: Locator;
  readonly ccCVV: Locator;
  readonly placeOrderButton: Locator;
  readonly successHeader: Locator;

  constructor(page: Page) {
    super(page);
    const co = page.locator('shop-checkout');
    this.form = co;
    this.accountEmail = co.locator('input[name="accountEmail"]');
    this.accountPhone = co.locator('input[name="accountPhone"]');
    this.shipAddress = co.locator('input[name="shipAddress"]');
    this.shipCity = co.locator('input[name="shipCity"]');
    this.shipState = co.locator('input[name="shipState"]');
    this.shipZip = co.locator('input[name="shipZip"]');
    this.shipCountry = co.locator('select[name="shipCountry"]');
    this.ccName = co.locator('input[name="ccName"]');
    this.ccNumber = co.locator('input[name="ccNumber"]');
    this.ccExpMonth = co.locator('select[name="ccExpMonth"]');
    this.ccExpYear = co.locator('select[name="ccExpYear"]');
    this.ccCVV = co.locator('input[name="ccCVV"]');
    this.placeOrderButton = co.getByText('Place Order');
    this.successHeader = co.getByText('Thank you', { exact: false });
  }

  async goto(): Promise<void> {
    await this.open('/checkout');
  }

  /** Fill every required field from a CheckoutInfo fixture. */
  async fillForm(info: CheckoutInfo): Promise<void> {
    await this.accountEmail.fill(info.accountEmail);
    await this.accountPhone.fill(info.accountPhone);
    await this.shipAddress.fill(info.shipAddress);
    await this.shipCity.fill(info.shipCity);
    await this.shipState.fill(info.shipState);
    await this.shipZip.fill(info.shipZip);
    if (info.shipCountry) await this.shipCountry.selectOption({ label: info.shipCountry });
    else await this.shipCountry.selectOption({ index: 1 });
    await this.ccName.fill(info.ccName);
    await this.ccNumber.fill(info.ccNumber);
    if (info.ccExpMonth) await this.ccExpMonth.selectOption({ label: info.ccExpMonth });
    else await this.ccExpMonth.selectOption({ index: 1 });
    if (info.ccExpYear) await this.ccExpYear.selectOption({ label: info.ccExpYear });
    else await this.ccExpYear.selectOption({ index: 1 });
    await this.ccCVV.fill(info.ccCVV);
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
  }

  /** Fill the form and submit in one call. */
  async completeCheckout(info: CheckoutInfo): Promise<void> {
    await this.fillForm(info);
    await this.placeOrder();
  }

  /** Assert the order completed: URL flips to /checkout/success. */
  async expectOrderSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout\/success/);
    await expect(this.successHeader.first()).toBeVisible();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.accountEmail).toBeVisible();
  }
}
