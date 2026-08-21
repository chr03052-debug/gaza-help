import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";

const root = new URL("../", import.meta.url);
const read = name => readFile(new URL(name, root), "utf8");
const fail = message => { throw new Error(message); };

const data = JSON.parse(await read("data.json"));
if (!Array.isArray(data) || data.length === 0) fail("data.json must contain records");

const ids = new Set();
const categories = new Set(["medical", "food", "aid", "important"]);
const statuses = new Set(["verified", "sample"]);
const now = Date.now();
const maxReviewAge = { medical: 14, important: 14, food: 30, aid: 30 };

for (const [index, item] of data.entries()) {
  const at = `data.json[${index}]`;
  if (!item || typeof item !== "object") fail(`${at} must be an object`);
  if (!item.id || ids.has(item.id)) fail(`${at}.id must be unique`);
  ids.add(item.id);
  if (!categories.has(item.category)) fail(`${at}.category is invalid`);
  if (!statuses.has(item.status)) fail(`${at}.status is invalid`);
  for (const key of ["title_ar", "title_ja", "body_ar", "body_ja", "source_name", "source_url", "verified_at"]) {
    if (typeof item[key] !== "string" || !item[key].trim()) fail(`${at}.${key} is required`);
  }
  const url = new URL(item.source_url);
  if (url.protocol !== "https:") fail(`${at}.source_url must use HTTPS`);
  const verified = Date.parse(item.verified_at);
  if (!Number.isFinite(verified) || verified > now + 3600000) fail(`${at}.verified_at is invalid`);
  const ageDays = (now - verified) / 86400000;
  if (ageDays > maxReviewAge[item.category]) fail(`${at} is overdue for human review (${Math.floor(ageDays)} days)`);
  if (item.content_date && !/^\d{4}-\d{2}-\d{2}$/.test(item.content_date)) fail(`${at}.content_date must be YYYY-MM-DD`);
}

const index = await read("index.html");
for (const required of ["Content-Security-Policy", "skip-link", "offlineNotice", "statusMessage", "aria-busy"]) {
  if (!index.includes(required)) fail(`index.html is missing ${required}`);
}
if (/<script(?![^>]*\bsrc=)/i.test(index)) fail("Inline scripts are not allowed");

const sw = await read("sw.js");
const match = sw.match(/STATIC_FILES=\[([^\]]+)\]/);
if (!match) fail("Could not read STATIC_FILES from sw.js");
const files = [...match[1].matchAll(/"([^"]+)"/g)].map(value => value[1].replace(/^\.\//, ""));
for (const file of files) {
  if (!file) continue;
  await access(new URL(file, root), constants.R_OK).catch(() => fail(`Service worker asset is missing: ${file}`));
}

console.log(`Validated ${data.length} records and ${files.length} offline assets.`);
