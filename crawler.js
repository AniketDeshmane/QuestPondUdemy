/**
 * QuestPond Automated Full-Site Crawler & Downloader
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://questpond.teachable.com';
const PAGES_DIR = path.join(__dirname, 'pages');
const COOKIE_FILE = path.join(__dirname, 'cookie.txt');

// Ensure output directory exists
if (!fs.existsSync(PAGES_DIR)) {
  fs.mkdirSync(PAGES_DIR, { recursive: true });
}

// Load and Parse Cookie from any format (curl command, header, or raw text)
function getCookieString() {
  if (!fs.existsSync(COOKIE_FILE)) return '';
  const raw = fs.readFileSync(COOKIE_FILE, 'utf8').trim();

  // If curl format with -b or -H 'cookie: ...'
  const curlB = raw.match(/-b\s+['"]([^'"]+)['"]/);
  if (curlB) return curlB[1];

  const curlH = raw.match(/-H\s+['"]cookie:\s*([^'"]+)['"]/i);
  if (curlH) return curlH[1];

  // If 'cookie\nahoy_visitor=...' or 'Cookie: ahoy_visitor=...'
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('ahoy_visitor=') || (trimmed.includes('=') && trimmed.includes(';'))) {
      return trimmed;
    }
  }

  // Fallback: strip "cookie:" prefix
  return raw.replace(/^cookie:\s*/i, '').trim();
}

const cookieHeader = getCookieString();

if (!cookieHeader) {
  console.log('\n❌ [ERROR] No cookie found in `cookie.txt`!');
  process.exit(1);
}

console.log('🔑 Parsed Cookie string successfully (length:', cookieHeader.length, 'chars)');

// Queue of URLs to crawl
const seedUrls = [
  'https://questpond.teachable.com/l/dashboard',
  'https://questpond.teachable.com/l/products',
  'https://questpond.teachable.com/p/questvideos',
  'https://questpond.teachable.com/p/weekendtraining',
  'https://questpond.teachable.com/current_user/profile',
  'https://questpond.teachable.com/current_user/subscriptions'
];

const queue = [...seedUrls];
const visited = new Set();

function sanitizeFilename(urlStr) {
  try {
    const u = new URL(urlStr);
    let p = u.pathname.replace(/^\/+|\/+$/g, '').replace(/[\/\\?%*:|"<>]/g, '_');
    if (!p) p = 'home';
    if (u.search) {
      p += '_' + u.search.replace(/[\/\\?%*:|"<>]/g, '_').substring(0, 30);
    }
    return p + '.html';
  } catch (e) {
    return 'page_' + Date.now() + '.html';
  }
}

function extractLinks(html, currentUrl) {
  const links = new Set();
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match;

  while ((match = hrefRegex.exec(html)) !== null) {
    const rawHref = match[1];
    if (
      !rawHref ||
      rawHref.startsWith('#') ||
      rawHref.startsWith('javascript:') ||
      rawHref.startsWith('mailto:') ||
      rawHref.startsWith('tel:')
    ) {
      continue;
    }

    try {
      const resolved = new URL(rawHref, currentUrl).href;
      // Only crawl internal questpond.teachable.com pages
      if (resolved.startsWith(BASE_URL)) {
        // Ignore static assets, media, and logout URLs
        if (
          !resolved.match(/\.(png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|mp4|zip|pdf)(\?|$)/i) &&
          !resolved.includes('/sign_out') &&
          !resolved.includes('/logout')
        ) {
          // Clean hash
          const cleanUrl = resolved.split('#')[0];
          links.add(cleanUrl);
        }
      }
    } catch (e) {}
  }

  return Array.from(links);
}

async function fetchPage(url) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cookie': cookieHeader,
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Upgrade-Insecure-Requests': '1'
  };

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return await response.text();
}

async function startCrawler() {
  console.log('====================================================');
  console.log('🚀 QuestPond Automated Full-Site Crawler Started');
  console.log(`📁 Saving all pages to: ${PAGES_DIR}`);
  console.log('====================================================\n');

  let downloadedCount = 0;

  while (queue.length > 0) {
    const currentUrl = queue.shift();
    if (visited.has(currentUrl)) continue;

    visited.add(currentUrl);

    try {
      process.stdout.write(`⏳ [${visited.size}/${visited.size + queue.length}] Downloading: ${currentUrl} ... `);
      const html = await fetchPage(currentUrl);

      // Save file
      const filename = sanitizeFilename(currentUrl);
      const filepath = path.join(PAGES_DIR, filename);
      fs.writeFileSync(filepath, html, 'utf8');

      downloadedCount++;
      console.log(`✅ Saved (${(html.length / 1024).toFixed(1)} KB -> ${filename})`);

      // Extract new internal links
      const newLinks = extractLinks(html, currentUrl);
      for (const link of newLinks) {
        if (!visited.has(link) && !queue.includes(link)) {
          queue.push(link);
        }
      }

      // Polite delay between requests
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
    }
  }

  console.log('\n====================================================');
  console.log(`🎉 Crawl complete! Successfully downloaded ${downloadedCount} pages.`);
  console.log(`📂 Location: ${PAGES_DIR}`);
  console.log('====================================================\n');
}

startCrawler().catch(console.error);
