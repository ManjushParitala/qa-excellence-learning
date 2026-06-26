# Command Reference — Polymer Shop Automation

> Run all commands from the project root: `qa-excellence-learning/polymer-shop-automation/`

## One-time setup

```bash
npm install                          # install dependencies
npx playwright install chromium      # download the bundled browser
npx playwright install chrome        # (optional) ensure Google Chrome is usable
```

## Run tests (npm scripts)

```bash
npm test                 # run ALL tests (local Chrome, headed, 1 window)
npm run test:sanity      # only @sanity tests
npm run test:regression  # only @regression tests
npm run test:e2e         # only @e2e tests
npm run test:headed      # force a headed run
npm run demo             # guided step-by-step walkthrough, slowed down
npm run ui               # Playwright UI mode (interactive runner)
```

## Reports

```bash
npm run report                                  # open the HTML report
npx playwright show-report reports/html-report  # same thing, raw command
npm run report:md                               # regenerate docs/test-execution-report.md
node scripts/gen-execution-report.js            # same thing, raw command
```

Report files:
- HTML  → `reports/html-report/index.html`
- JSON  → `reports/results.json`
- Markdown → `docs/test-execution-report.md`

## Raw Playwright commands

```bash
npx playwright test                              # all tests
npx playwright test --grep @sanity               # by tag
npx playwright test tests/e2e/purchase-flow.e2e.spec.ts   # one file
npx playwright test --grep "a shopper can buy"   # by test title
npx playwright test --headed                     # visible browser
npx playwright test --workers=1                  # one window at a time
npx playwright test --list                       # list tests without running
npx playwright test --reporter=list              # console list reporter
npx playwright test --project=chrome             # pick the browser project
npx playwright test --debug                      # step debugger (Inspector)
npx playwright test --ui                         # interactive UI mode
```

## Environment-variable flags (combine with any command)

```bash
SLOWMO=1500 npm test     # slow each action by 1500ms (watch it)
HEADLESS=1 npm test      # background run (no visible window)
WORKERS=4 npm test       # run 4 tests in parallel (faster, multi-window)
PWDEBUG=1 npx playwright test --grep "a shopper can buy"   # pause & step through
```

Examples (mix and match):

```bash
SLOWMO=900 npx playwright test --grep "a shopper can buy" --workers=1   # one slow A-Z flow
HEADLESS=1 WORKERS=4 npm test                                           # fast full run, no window
SLOWMO=1200 npm run test:e2e                                            # watch the e2e flow
```

## Traces & debugging artifacts (created on failure)

```bash
npx playwright show-trace test-results/<folder>/trace.zip   # open a failure trace
```
