# Test Cases & Test Data — Polymer Shop

**Application under test:** https://shop.polymer-project.org/
**Type:** Demo Progressive Web App (PWA) storefront built with Polymer web components.
**Note:** This is a demo store — checkout accepts any well-formed card and no real payment is processed.

## Test Classification

| Suite | Purpose | When to run | Tag |
|-------|---------|-------------|-----|
| **Sanity** | Fast smoke checks on the most critical paths. If these fail, stop. | Every build / PR | `@sanity` |
| **Regression** | Broader feature coverage across categories, product detail, cart and validation. | Before release | `@regression` |
| **E2E** | Full happy-path purchase journeys spanning every page. | Before release / nightly | `@e2e` |

## Test Data

Test data lives in [`test-data/`](../test-data) as JSON and is imported by the specs (data-driven).

| File | Contents |
|------|----------|
| `categories.json` | The four category slugs and display names. |
| `products.json` | One representative product per category (verified live URLs). |
| `checkout.json` | `valid`, `internationalCustomer`, and `invalidMissingRequired` checkout payloads. |

Sample valid checkout record:

| Field | Value |
|-------|-------|
| Email | qa.tester@example.com |
| Phone | 5551234567 |
| Ship Address | 123 Test Street, Testville, CA 90210 |
| Card Name | QA Tester |
| Card Number | 4111111111111111 |
| CVV | 123 |

---

## Test Cases

### Sanity

| TC ID | Title | Preconditions | Steps | Test Data | Expected Result | Automated By |
|-------|-------|---------------|-------|-----------|-----------------|--------------|
| TC-S01 | Home page loads | App reachable | 1. Open `/` | — | App shell renders; page title contains "SHOP" | `tests/sanity/home.sanity.spec.ts` |
| TC-S02 | All categories linked | On home page | 1. Read category tiles | categories.json | The 4 expected category slugs are linked | `tests/sanity/home.sanity.spec.ts` |
| TC-S03 | Home → Category → Product nav | App reachable | 1. Open home 2. Open a category 3. Open first product | mens_outerwear | Each page loads; product detail shows a title | `tests/sanity/navigation.sanity.spec.ts` |
| TC-S04 | Add product to cart | On a product page | 1. Note cart badge (0) 2. Add to cart | products[0] | Cart badge increments to 1 | `tests/sanity/add-to-cart.sanity.spec.ts` |

### Regression

| TC ID | Title | Preconditions | Steps | Test Data | Expected Result | Automated By |
|-------|-------|---------------|-------|-----------|-----------------|--------------|
| TC-R01 | Each category lists products | App reachable | 1. Open each `/list/<slug>` | categories.json (×4) | Every category renders ≥1 product | `tests/regression/category.regression.spec.ts` |
| TC-R02 | Open product by name | On a category page | 1. Open a named product | mens_outerwear | URL contains `/detail/` and detail loads | `tests/regression/category.regression.spec.ts` |
| TC-R03 | Detail shows controls | On a product page | 1. Inspect detail | products[0] | Title, price, size + quantity selects all visible | `tests/regression/product-detail.regression.spec.ts` |
| TC-R04 | Add with size + quantity | On a product page | 1. Pick size M, qty 2 2. Add to cart | size=M, qty=2 | Cart badge shows 2 | `tests/regression/product-detail.regression.spec.ts` |
| TC-R05 | Empty cart message | Cart empty | 1. Open `/cart` | — | "…is empty." shown; 0 line items | `tests/regression/cart.regression.spec.ts` |
| TC-R06 | Item appears in cart | 1 item added | 1. Add product 2. Open cart | products[0] | Cart shows 1 line item | `tests/regression/cart.regression.spec.ts` |
| TC-R07 | Two items → two lines | App reachable | 1. Add 2 different products 2. Open cart | products[0], products[1] | Cart shows 2 line items | `tests/regression/cart.regression.spec.ts` |
| TC-R08 | Empty checkout blocked | Cart has 1 item | 1. Open checkout 2. Submit blank form | invalidMissingRequired | Stays on `/checkout`; no success route | `tests/regression/checkout-validation.regression.spec.ts` |

### End-to-End

| TC ID | Title | Preconditions | Steps | Test Data | Expected Result | Automated By |
|-------|-------|---------------|-------|-----------|-----------------|--------------|
| TC-E01 | Full purchase (domestic) | App reachable | Home → category → product → add → cart → checkout → place order | products[0] + checkout.valid | Routes to `/checkout/success`; "Thank you" shown | `tests/e2e/purchase-flow.e2e.spec.ts` |
| TC-E02 | Full purchase (international) | App reachable | Add product → cart → checkout with intl data → place order | products[1] + checkout.internationalCustomer | Order succeeds; "Thank you" shown | `tests/e2e/purchase-flow.e2e.spec.ts` |

---

## Additional Manual / Exploratory Cases (not automated)

These document coverage worth checking manually; they are intentionally outside the automated scope (PWA/visual/offline concerns).

| TC ID | Title | Notes |
|-------|-------|-------|
| TC-M01 | Offline mode (PWA) | Load app, go offline, confirm cached shell still loads. |
| TC-M02 | Responsive layout | Verify category grid and checkout form on mobile viewport. |
| TC-M03 | Cart quantity edit | Change quantity in cart drawer; verify total recalculates. |
| TC-M04 | Remove item from cart | Remove a line item; verify badge and total update. |
| TC-M05 | Invalid card format | Enter a non-numeric card number; verify field-level validation. |
