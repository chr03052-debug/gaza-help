import { readFile } from "node:fs/promises";

const records = JSON.parse(await readFile(new URL("../data.json", import.meta.url), "utf8"));
const signatures = new Map([
  ["https://www.ochaopt.org/", ["occupied palestinian territory"]],
  ["https://www.ochaopt.org/page/protection-cluster-service-directory-dashboard", ["service directory", "sawa hotline"]],
  ["https://www.ochaopt.org/page/humanitarian-presence-activities-and-service-points-gaza-strip", ["humanitarian presence", "service points"]],
  ["https://sawa.ps/en/program/9", ["how can you contact us", "contact us"]],
  ["https://www.who.int/publications/m/item/herams-opt-gaza-infographics-2026-06", ["herams", "30 june 2026"]],
  ["https://www.wfp.org/emergencies/palestine-emergency", ["state of palestine", "food assistance"]],
  ["https://www.unrwa.org/resources/reports/unrwa-situation-report-229-humanitarian-crisis-gaza-strip-and-occupied-west-bank", []]
]);

const urls = [...new Set(records.map(item => item.source_url))].sort();
const failures = [];
const warnings = [];

for (const url of urls) {
  const required = signatures.get(url);
  if (!required) {
    failures.push(`No content signature configured for ${url}`);
    continue;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90000);
  let response;
  try {
    response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "gaza-help-source-monitor/2.0" }
    });
  } catch (error) {
    failures.push(`${url}: ${error.message}`);
    clearTimeout(timer);
    continue;
  }
  clearTimeout(timer);

  if (url.includes("unrwa.org") && response.status === 403) {
    warnings.push(`${url}: UNRWA blocks automated review; manual review required`);
    continue;
  }
  if (!response.ok) {
    failures.push(`${url}: HTTP ${response.status}`);
    continue;
  }

  const html = (await response.text()).toLocaleLowerCase("en");
  const missing = required.filter(term => !html.includes(term.toLocaleLowerCase("en")));
  if (missing.length) {
    failures.push(`${url}: expected content marker(s) missing: ${missing.join(", ")}`);
  } else {
    console.log(`OK: ${url} — link and expected content markers found`);
  }
}

for (const warning of warnings) console.warn(`WARNING: ${warning}`);
if (failures.length) {
  for (const failure of failures) console.error(`ERROR: ${failure}`);
  process.exit(1);
}
console.log(`Checked ${urls.length} official source pages for reachability and expected content.`);
