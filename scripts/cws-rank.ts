/**
 * Chrome Web Store Search Ranking Tracker
 *
 * Uses Playwright to search CWS and find our extension's position
 * for tracked keywords. Results are appended to a JSONL file for
 * historical tracking.
 *
 * Usage: npx tsx scripts/cws-rank.ts
 */

import { chromium, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const EXTENSION_ID = 'kgjldbijkcbbjbnfdaebkfbpgdoogfjo';
const EXTENSION_NAME = 'Conversation Titles for ChatGPT';
const KEYWORDS = [
  'Conversation',
  'Conversation Title',
  'Conversation Titles for ChatGPT',
];
const MAX_PAGES = 5; // Max pages to search before giving up
const RESULTS_PER_PAGE = 20; // Approximate results per page on CWS
const OUTPUT_FILE = path.join(__dirname, '..', 'store', 'metrics', 'rankings.jsonl');
const DEBUG = process.argv.includes('--debug');

interface RankingResult {
  timestamp: string;
  keyword: string;
  position: number | null;
  page: number | null;
  found: boolean;
  error?: string;
}

async function searchCWS(page: Page, keyword: string): Promise<RankingResult> {
  const timestamp = new Date().toISOString();
  const searchUrl = `https://chromewebstore.google.com/search/${encodeURIComponent(keyword)}?hl=en`;

  try {
    await page.goto(searchUrl, { waitUntil: 'networkidle' });

    // Wait for results to load
    await page.waitForTimeout(3000);

    if (DEBUG) {
      const screenshotPath = path.join(__dirname, '..', 'store', 'metrics', `debug-${keyword.replace(/\s+/g, '-')}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`  DEBUG: Screenshot saved to ${screenshotPath}`);

      // Print all hrefs found
      const allLinks = await page.locator('a[href*="/detail/"]').all();
      console.log(`  DEBUG: Found ${allLinks.length} /detail/ links`);
      for (let i = 0; i < Math.min(5, allLinks.length); i++) {
        const href = await allLinks[i].getAttribute('href');
        console.log(`    ${i + 1}. ${href}`);
      }
    }

    let currentPage = 1;
    let totalChecked = 0;

    while (currentPage <= MAX_PAGES) {
      // Get all extension cards - CWS uses various structures
      // Look for links that contain /detail/ which are the extension detail links
      const extensionLinks = await page.locator('a[href*="/detail/"]').all();

      // Track unique extensions by their href to avoid counting duplicates
      const seenHrefs = new Set<string>();
      let position = 0;

      for (const link of extensionLinks) {
        const href = await link.getAttribute('href');
        if (!href || seenHrefs.has(href)) continue;

        // Only count links that look like extension detail pages
        // Format: /detail/extension-name/extensionid or /detail/extensionid
        if (!href.match(/\/detail\/[^/]+/)) continue;

        seenHrefs.add(href);
        position++;
        totalChecked++;

        // Check if this is our extension (ID appears at end of URL)
        if (href.includes(EXTENSION_ID)) {
          console.log(`  Found at position #${position}`);
          return {
            timestamp,
            keyword,
            position,
            page: currentPage,
            found: true,
          };
        }
      }

      // Scroll to load more results
      const previousCount = seenHrefs.size;
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);

      // Check if new results loaded
      const newLinks = await page.locator('a[href*="/detail/"]').all();
      const newHrefs = new Set<string>();
      for (const link of newLinks) {
        const href = await link.getAttribute('href');
        if (href && href.match(/\/detail\/[^/]+/)) {
          newHrefs.add(href);
        }
      }

      if (newHrefs.size <= previousCount) {
        // No new results loaded, we've reached the end
        break;
      }

      currentPage++;
    }

    console.log(`  Not found in first ${totalChecked} results`);
    return {
      timestamp,
      keyword,
      position: null,
      page: null,
      found: false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`  Error searching for "${keyword}": ${errorMessage}`);
    return {
      timestamp,
      keyword,
      position: null,
      page: null,
      found: false,
      error: errorMessage,
    };
  }
}

async function appendResult(result: RankingResult): Promise<void> {
  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const line = JSON.stringify(result) + '\n';
  fs.appendFileSync(OUTPUT_FILE, line);
}

function printSummary(results: RankingResult[]): void {
  console.log('\n' + '='.repeat(60));
  console.log('CWS Search Ranking Summary');
  console.log('='.repeat(60));
  console.log(`Extension: ${EXTENSION_NAME}`);
  console.log(`Timestamp: ${results[0]?.timestamp || new Date().toISOString()}`);
  console.log('-'.repeat(60));

  const maxKeywordLength = Math.max(...results.map((r) => r.keyword.length));

  for (const result of results) {
    const keyword = result.keyword.padEnd(maxKeywordLength);
    if (result.found) {
      console.log(`${keyword}  #${result.position} (page ${result.page})`);
    } else if (result.error) {
      console.log(`${keyword}  ERROR: ${result.error}`);
    } else {
      console.log(`${keyword}  Not found in top ${MAX_PAGES * RESULTS_PER_PAGE} results`);
    }
  }

  console.log('-'.repeat(60));
  console.log(`Results saved to: ${OUTPUT_FILE}`);
  console.log('='.repeat(60));
}

async function main(): Promise<void> {
  console.log('Starting CWS Search Ranking Check...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results: RankingResult[] = [];

  for (const keyword of KEYWORDS) {
    console.log(`Searching for: "${keyword}"`);
    const result = await searchCWS(page, keyword);
    results.push(result);
    await appendResult(result);

    // Small delay between searches to be polite
    await page.waitForTimeout(1000);
  }

  await browser.close();

  printSummary(results);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
