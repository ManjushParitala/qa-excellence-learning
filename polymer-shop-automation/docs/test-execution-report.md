# Test Execution Report — Polymer Shop

**Application:** https://shop.polymer-project.org/
**Run started:** 2026-06-26T07:11:50.952Z
**Wall-clock duration:** 330.3s
**Browser:** Chromium (Playwright)

## Summary

| Total | Passed | Failed | Skipped |
|------|--------|--------|--------|
| 19 | 19 | 0 | 0 |

## Sanity (4)

| # | Test | Status | Duration |
|---|------|--------|----------|
| 1 | adding a product updates the cart badge | PASS | 4.4s |
| 2 | home page loads with the app shell | PASS | 3.2s |
| 3 | all four shopping categories are linked | PASS | 4.7s |
| 4 | navigate from home to a category to a product | PASS | 4.3s |

## Regression (12)

| # | Test | Status | Duration |
|---|------|--------|----------|
| 1 | button background turns black while pressed | PASS | 6.6s |
| 2 | empty cart shows the empty message | PASS | 2.8s |
| 3 | added product appears as a line item in the cart | PASS | 4.7s |
| 4 | two different products produce two line items | PASS | 7.7s |
| 5 | category "mens_outerwear" lists products | PASS | 3.1s |
| 6 | category "ladies_outerwear" lists products | PASS | 3.6s |
| 7 | category "mens_tshirts" lists products | PASS | 3.2s |
| 8 | category "ladies_tshirts" lists products | PASS | 3.1s |
| 9 | opening a product by name lands on its detail page | PASS | 3.4s |
| 10 | submitting an empty form does not place the order | PASS | 5.8s |
| 11 | detail page shows title, price, size and quantity controls | PASS | 3.3s |
| 12 | adding with explicit size and quantity updates the cart | PASS | 4.6s |

## E2E (2)

| # | Test | Status | Duration |
|---|------|--------|----------|
| 1 | a shopper can buy a product end to end | PASS | 10.6s |
| 2 | checkout succeeds for an international customer | PASS | 9.7s |

---
_Generated from `reports/results.json` by `scripts/gen-execution-report.js`._
