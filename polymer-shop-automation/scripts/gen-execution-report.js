// Generates docs/test-execution-report.md from reports/results.json.
// Run after a test run:  node scripts/gen-execution-report.js
const { readFileSync, writeFileSync } = require('node:fs');

const data = JSON.parse(readFileSync('reports/results.json', 'utf8'));

const rows = [];
let passed = 0, failed = 0, skipped = 0;

function tagOf(title) {
  if (/@sanity/.test(title)) return 'Sanity';
  if (/@regression/.test(title)) return 'Regression';
  if (/@e2e/.test(title)) return 'E2E';
  return '—';
}

function walk(suite, trail = []) {
  for (const s of suite.suites ?? []) walk(s, [...trail, s.title]);
  for (const spec of suite.specs ?? []) {
    const result = spec.tests?.[0]?.results?.[0];
    const status = result?.status ?? 'unknown';
    if (spec.ok && status === 'passed') passed++;
    else if (status === 'skipped') skipped++;
    else failed++;
    const ms = result?.duration ?? 0;
    rows.push({
      suite: tagOf([...trail, spec.title].join(' ')),
      title: spec.title,
      status: spec.ok ? 'PASS' : status.toUpperCase(),
      duration: (ms / 1000).toFixed(1) + 's',
      file: spec.file ?? '',
    });
  }
}
for (const suite of data.suites ?? []) walk(suite);

const total = passed + failed + skipped;
const when = data.stats?.startTime ?? '';
const wall = ((data.stats?.duration ?? 0) / 1000).toFixed(1);

let md = `# Test Execution Report — Polymer Shop\n\n`;
md += `**Application:** https://shop.polymer-project.org/\n`;
md += `**Run started:** ${when}\n`;
md += `**Wall-clock duration:** ${wall}s\n`;
md += `**Browser:** Chromium (Playwright)\n\n`;
md += `## Summary\n\n`;
md += `| Total | Passed | Failed | Skipped |\n|------|--------|--------|--------|\n`;
md += `| ${total} | ${passed} | ${failed} | ${skipped} |\n\n`;

for (const grp of ['Sanity', 'Regression', 'E2E']) {
  const g = rows.filter(r => r.suite === grp);
  if (!g.length) continue;
  md += `## ${grp} (${g.length})\n\n`;
  md += `| # | Test | Status | Duration |\n|---|------|--------|----------|\n`;
  g.forEach((r, i) => { md += `| ${i + 1} | ${r.title} | ${r.status} | ${r.duration} |\n`; });
  md += `\n`;
}

md += `---\n_Generated from \`reports/results.json\` by \`scripts/gen-execution-report.js\`._\n`;

writeFileSync('docs/test-execution-report.md', md);
console.log(`Wrote docs/test-execution-report.md — ${passed}/${total} passed`);
