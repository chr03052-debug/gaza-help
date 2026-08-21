import { chromium } from "playwright";

const baseURL = process.env.SITE_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  locale: "ar",
  reducedMotion: "reduce"
});
const page = await context.newPage();
const problems = [];
page.on("pageerror", error => problems.push(`pageerror: ${error.message}`));
page.on("console", message => {
  if (message.type() === "error") problems.push(`console: ${message.text()}`);
});

try {
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.waitForSelector("#cards article");
  const cardCount = await page.locator("#cards article").count();
  if (cardCount !== 8) throw new Error(`Expected 8 cards, found ${cardCount}`);

  const urgentArabic = await page.locator("#urgentText").textContent();
  if (!urgentArabic?.includes("قد لا تكون")) throw new Error("Arabic safety notice is missing");

  await page.locator("#langBtn").click();
  if ((await page.locator("#urgentTitle").textContent()) !== "重要な注意") {
    throw new Error("Japanese language switch failed");
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  if (overflow) throw new Error("Mobile layout has horizontal overflow");

  await page.evaluate(() => document.activeElement?.blur());
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.classList.contains("skip-link"));
  if (!focused) throw new Error("Skip link is not first in keyboard order");

  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#cards article");
  if ((await page.locator("#cards article").count()) !== 8) {
    throw new Error("Offline cached cards did not render");
  }

  if (problems.length) throw new Error(problems.join("\n"));
  console.log("Browser smoke test passed: mobile, bilingual, keyboard, accessibility basics, and offline mode.");
} finally {
  await browser.close();
}
