# Polymer Shop — Playwright Test Automation

Automated UI test suite for **https://shop.polymer-project.org/** using
**Playwright + TypeScript** with the **Page Object Model (POM)** pattern.

## Why this app is interesting to automate

The Shop app is a Polymer PWA — nearly every element lives inside an **open
shadow DOM**. Playwright's CSS engine pierces open shadow roots automatically,
so selectors like `shop-detail #sizeSelect` cross the boundary without extra
work. Two quirks were handled explicitly:

- The cart count lives on a toolbar icon's `aria-label` ("Shopping cart: N items").
- A parallax header can translate the toolbar above the fold, so the cart icon
  is scrolled into view before clicking.

## Project structure

```
polymer-shop-automation/
├── pages/                  # Page Object Model
│   ├── BasePage.ts         # shared helpers (cart count, nav, cart link)
│   ├── HomePage.ts
│   ├── CategoryPage.ts
│   ├── ProductPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
├── test-data/              # JSON fixtures + shared types
│   ├── categories.json
│   ├── products.json
│   ├── checkout.json
│   └── types.ts
├── tests/
│   ├── fixtures.ts         # injects page objects into `test`
│   ├── sanity/             # @sanity
│   ├── regression/         # @regression
│   └── e2e/                # @e2e
├── docs/test-cases.md      # manual test cases + classification
├── playwright.config.ts
└── reports/                # generated HTML + JSON (gitignored)
```

## Setup

```bash
npm install
npx playwright install chromium
```

## Running tests

```bash
npm test                 # all suites
npm run test:sanity      # @sanity only
npm run test:regression  # @regression only
npm run test:e2e         # @e2e only
npm run test:headed      # watch in a real browser
npm run report           # open the last HTML report
```

## Test classification

| Suite | Tag | Count |
|-------|-----|-------|
| Sanity | `@sanity` | 4 |
| Regression | `@regression` | 11 |
| E2E | `@e2e` | 2 |
| **Total** | | **17** |

See [docs/test-cases.md](docs/test-cases.md) for the full case matrix and test data.

## Reports

Configured reporters (see `playwright.config.ts`):

- **HTML** → `reports/html-report/` (`npm run report` to open)
- **JSON** → `reports/results.json`
- **list** → console

On failure, screenshots, video, and a trace are captured under `test-results/`.
