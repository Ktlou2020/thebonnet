import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();
const DELAY_MS = 1500;

const CITIES = [
  { name: 'Cape Town', slug: 'cape-town', province: 'Western Cape' },
  { name: 'Johannesburg', slug: 'johannesburg', province: 'Gauteng' },
  { name: 'Pretoria', slug: 'pretoria', province: 'Gauteng' },
  { name: 'Durban', slug: 'durban', province: 'KwaZulu-Natal' },
  { name: 'Port Elizabeth', slug: 'port-elizabeth', province: 'Eastern Cape' },
  { name: 'Bloemfontein', slug: 'bloemfontein', province: 'Free State' },
  { name: 'Nelspruit', slug: 'nelspruit', province: 'Mpumalanga' },
  { name: 'Polokwane', slug: 'polokwane', province: 'Limpopo' },
  { name: 'East London', slug: 'east-london', province: 'Eastern Cape' },
  { name: 'Sandton', slug: 'sandton', province: 'Gauteng' },
  { name: 'Soweto', slug: 'soweto', province: 'Gauteng' },
  { name: 'Centurion', slug: 'centurion', province: 'Gauteng' },
  { name: 'Randburg', slug: 'randburg', province: 'Gauteng' },
  { name: 'Roodepoort', slug: 'roodepoort', province: 'Gauteng' },
  { name: 'Midrand', slug: 'midrand', province: 'Gauteng' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugify(name, city) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const citySlug = city
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${base}-${citySlug}`;
}

/**
 * Title-case a string if it is ALL CAPS, otherwise return as-is (trimmed).
 */
function normaliseName(name) {
  if (!name) return '';
  const trimmed = name.trim();
  if (trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
    return trimmed
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
  return trimmed;
}

/**
 * Normalise a South African phone number to +27 XX XXX XXXX format.
 * Accepts: 0XX XXX XXXX, +27XXXXXXXXX, 27XXXXXXXXX, etc.
 */
function normalisePhone(raw) {
  if (!raw) return null;
  // Strip everything except digits and leading +
  let digits = raw.replace(/[^\d]/g, '');
  if (!digits) return null;
  // Strip country prefix
  if (digits.startsWith('27') && digits.length >= 11) {
    digits = digits.slice(2);
  }
  if (digits.startsWith('0') && digits.length === 10) {
    digits = digits.slice(1);
  }
  if (digits.length !== 9) return raw.trim(); // Return original if can't parse
  return `+27 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

/**
 * Fetch a URL with retry logic and a browser-like User-Agent.
 * Returns the HTML text or null on failure.
 */
async function fetchPage(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-ZA,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          Connection: 'keep-alive',
        },
        timeout: 15000,
        redirect: 'follow',
      });

      if (res.status === 200) {
        return await res.text();
      }
      if (res.status === 429 || res.status === 503) {
        console.log(`    [rate-limit] ${res.status} on ${url}, waiting…`);
        await sleep(5000 * (i + 1));
        continue;
      }
      console.log(`    [http-${res.status}] ${url}`);
      return null;
    } catch (err) {
      if (i < retries - 1) {
        await sleep(2000);
      } else {
        console.log(`    [fetch-error] ${url} — ${err.message}`);
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Scraper: yellowpages.co.za
// ---------------------------------------------------------------------------

async function scrapeYellowPages(city) {
  const results = [];
  const queries = [
    `mechanic+workshop`,
    `auto+repair`,
    `car+service`,
  ];

  for (const q of queries) {
    const url = `https://www.yellowpages.co.za/search?q=${q}&l=${encodeURIComponent(city.name)}`;
    const html = await fetchPage(url);
    if (!html) continue;

    const $ = cheerio.load(html);

    // Try multiple listing container selectors
    const containers = [
      '.listing',
      '.result',
      '[data-listing]',
      '.business-listing',
      '.search-result',
      'article.listing',
      '.company-listing',
    ];

    let $items = $();
    for (const sel of containers) {
      $items = $(sel);
      if ($items.length > 0) break;
    }

    if ($items.length === 0) {
      // Fallback: look for h2/h3 links as business names
      $('h2 a, h3 a').each((_, el) => {
        const name = normaliseName($(el).text());
        if (name.length > 2) {
          results.push({
            name,
            address: null,
            phone: null,
            website: null,
            description: null,
            city: city.name,
            province: city.province,
            source: 'yellowpages.co.za',
          });
        }
      });
      continue;
    }

    $items.each((_, el) => {
      const $el = $(el);

      // Name
      const nameSelectors = ['.listing-name', 'h2 a', 'h3 a', '.name a', '.title a', 'h2', 'h3'];
      let name = '';
      for (const s of nameSelectors) {
        const t = $el.find(s).first().text().trim();
        if (t) { name = normaliseName(t); break; }
      }
      if (!name) return;

      // Address
      const addrSelectors = ['.address', '.location', '[itemprop="address"]', '.street-address'];
      let address = null;
      for (const s of addrSelectors) {
        const t = $el.find(s).first().text().trim();
        if (t) { address = t; break; }
      }

      // Phone
      const phoneSelectors = ['.phone', '.tel', '[itemprop="telephone"]', 'a[href^="tel:"]'];
      let phone = null;
      for (const s of phoneSelectors) {
        const t = $el.find(s).first().text().trim() || $el.find(s).first().attr('href')?.replace('tel:', '') || '';
        if (t) { phone = normalisePhone(t); break; }
      }

      // Website
      const website = $el.find('a.website, a[rel="nofollow"][href^="http"]').first().attr('href') || null;

      results.push({
        name,
        address,
        phone,
        website: website || null,
        description: null,
        city: city.name,
        province: city.province,
        source: 'yellowpages.co.za',
      });
    });

    await sleep(DELAY_MS);
  }

  return results;
}

// ---------------------------------------------------------------------------
// Scraper: brabys.com
// ---------------------------------------------------------------------------

async function scrapeBrabys(city) {
  const results = [];
  const url = `https://www.brabys.com/search/?q=mechanic&city=${encodeURIComponent(city.name)}`;
  const html = await fetchPage(url);
  if (!html) return results;

  const $ = cheerio.load(html);

  // Brabys listing containers
  const containers = ['.listing-item', '.result-item', '.business-card', '.company', 'article', '.result'];
  let $items = $();
  for (const sel of containers) {
    $items = $(sel);
    if ($items.length > 0) break;
  }

  if ($items.length === 0) {
    $('h3 a, h2 a').each((_, el) => {
      const name = normaliseName($(el).text());
      if (name.length > 2) {
        results.push({ name, address: null, phone: null, website: null, description: null, city: city.name, province: city.province, source: 'brabys.com' });
      }
    });
    return results;
  }

  $items.each((_, el) => {
    const $el = $(el);
    const nameSelectors = ['h3 a', 'h2 a', '.name', '.title', 'h3', 'h2'];
    let name = '';
    for (const s of nameSelectors) {
      const t = $el.find(s).first().text().trim();
      if (t) { name = normaliseName(t); break; }
    }
    if (!name) return;

    const addrSelectors = ['.address', '.location', 'address', '[itemprop="address"]'];
    let address = null;
    for (const s of addrSelectors) {
      const t = $el.find(s).first().text().trim();
      if (t) { address = t; break; }
    }

    const phoneSelectors = ['.phone', '.tel', '[itemprop="telephone"]', 'a[href^="tel:"]'];
    let phone = null;
    for (const s of phoneSelectors) {
      const $p = $el.find(s).first();
      const t = $p.text().trim() || $p.attr('href')?.replace('tel:', '') || '';
      if (t) { phone = normalisePhone(t); break; }
    }

    results.push({ name, address, phone, website: null, description: null, city: city.name, province: city.province, source: 'brabys.com' });
  });

  return results;
}

// ---------------------------------------------------------------------------
// Scraper: businesslist.co.za
// ---------------------------------------------------------------------------

async function scrapeBusinessList(city) {
  const results = [];
  const url = `https://www.businesslist.co.za/category/automotive/mechanics/${city.slug}`;
  const html = await fetchPage(url);
  if (!html) return results;

  const $ = cheerio.load(html);

  const containers = ['.listing', '.company', '.result', '.card', 'article', '.business'];
  let $items = $();
  for (const sel of containers) {
    $items = $(sel);
    if ($items.length > 0) break;
  }

  if ($items.length === 0) {
    $('h3 a, h2 a, .company-name a').each((_, el) => {
      const name = normaliseName($(el).text());
      if (name.length > 2) {
        results.push({ name, address: null, phone: null, website: null, description: null, city: city.name, province: city.province, source: 'businesslist.co.za' });
      }
    });
    return results;
  }

  $items.each((_, el) => {
    const $el = $(el);

    const nameSelectors = ['.company-name a', '.company-name', 'h2 a', 'h3 a', '.name a', 'h2', 'h3'];
    let name = '';
    for (const s of nameSelectors) {
      const t = $el.find(s).first().text().trim();
      if (t) { name = normaliseName(t); break; }
    }
    if (!name) return;

    const addrSelectors = ['.address', '.location', '[itemprop="address"]', '.street'];
    let address = null;
    for (const s of addrSelectors) {
      const t = $el.find(s).first().text().trim();
      if (t) { address = t; break; }
    }

    const phoneSelectors = ['.phone', '.tel', '[itemprop="telephone"]', 'a[href^="tel:"]'];
    let phone = null;
    for (const s of phoneSelectors) {
      const $p = $el.find(s).first();
      const t = $p.text().trim() || $p.attr('href')?.replace('tel:', '') || '';
      if (t) { phone = normalisePhone(t); break; }
    }

    const descSelectors = ['.description', '.snippet', '.excerpt', 'p'];
    let description = null;
    for (const s of descSelectors) {
      const t = $el.find(s).first().text().trim();
      if (t) { description = t.slice(0, 500); break; }
    }

    results.push({ name, address, phone, website: null, description, city: city.name, province: city.province, source: 'businesslist.co.za' });
  });

  return results;
}

// ---------------------------------------------------------------------------
// Scraper: cylex.co.za
// ---------------------------------------------------------------------------

async function scrapeCylex(city) {
  const results = [];
  const url = `https://www.cylex.co.za/south-africa/${encodeURIComponent(city.slug)}/car+repair.html`;
  const html = await fetchPage(url);
  if (!html) return results;

  const $ = cheerio.load(html);

  const containers = ['.result-item', '.company', '.listing', '.card', 'article', '.search-result'];
  let $items = $();
  for (const sel of containers) {
    $items = $(sel);
    if ($items.length > 0) break;
  }

  if ($items.length === 0) {
    $('h2 a, h3 a, .company-name a').each((_, el) => {
      const name = normaliseName($(el).text());
      if (name.length > 2) {
        results.push({ name, address: null, phone: null, website: null, description: null, city: city.name, province: city.province, source: 'cylex.co.za' });
      }
    });
    return results;
  }

  $items.each((_, el) => {
    const $el = $(el);

    const nameSelectors = ['h2 a', 'h3 a', '.company-name a', '.company-name', '.name a', '.title a', 'h2', 'h3'];
    let name = '';
    for (const s of nameSelectors) {
      const t = $el.find(s).first().text().trim();
      if (t) { name = normaliseName(t); break; }
    }
    if (!name) return;

    const addrSelectors = ['.address', '[itemprop="address"]', '.location', '.street-address'];
    let address = null;
    for (const s of addrSelectors) {
      const t = $el.find(s).first().text().trim();
      if (t) { address = t; break; }
    }

    const phoneSelectors = ['.phone', '[itemprop="telephone"]', '.tel', 'a[href^="tel:"]'];
    let phone = null;
    for (const s of phoneSelectors) {
      const $p = $el.find(s).first();
      const t = $p.text().trim() || $p.attr('href')?.replace('tel:', '') || '';
      if (t) { phone = normalisePhone(t); break; }
    }

    const descSelectors = ['.description', '.snippet', 'p', '.text'];
    let description = null;
    for (const s of descSelectors) {
      const t = $el.find(s).first().text().trim();
      if (t) { description = t.slice(0, 500); break; }
    }

    results.push({ name, address, phone, website: null, description, city: city.name, province: city.province, source: 'cylex.co.za' });
  });

  return results;
}

// ---------------------------------------------------------------------------
// Scraper: hotfrog.co.za
// ---------------------------------------------------------------------------

async function scrapeHotfrog(city) {
  const results = [];
  const url = `https://www.hotfrog.co.za/search/za/${encodeURIComponent(city.slug)}/auto-repair`;
  const html = await fetchPage(url);
  if (!html) return results;

  const $ = cheerio.load(html);

  const containers = ['.business-card', '.listing', '.result', '.card', 'article', '.search-result'];
  let $items = $();
  for (const sel of containers) {
    $items = $(sel);
    if ($items.length > 0) break;
  }

  if ($items.length === 0) {
    $('h2 a, h3 a, .business-name a').each((_, el) => {
      const name = normaliseName($(el).text());
      if (name.length > 2) {
        results.push({ name, address: null, phone: null, website: null, description: null, city: city.name, province: city.province, source: 'hotfrog.co.za' });
      }
    });
    return results;
  }

  $items.each((_, el) => {
    const $el = $(el);

    const nameSelectors = ['.business-name a', '.business-name', 'h2 a', 'h3 a', '.name a', '.title', 'h2', 'h3'];
    let name = '';
    for (const s of nameSelectors) {
      const t = $el.find(s).first().text().trim();
      if (t) { name = normaliseName(t); break; }
    }
    if (!name) return;

    const addrSelectors = ['.address', '.location', '[itemprop="address"]', '.suburb'];
    let address = null;
    for (const s of addrSelectors) {
      const t = $el.find(s).first().text().trim();
      if (t) { address = t; break; }
    }

    const phoneSelectors = ['.phone', '.tel', '[itemprop="telephone"]', 'a[href^="tel:"]'];
    let phone = null;
    for (const s of phoneSelectors) {
      const $p = $el.find(s).first();
      const t = $p.text().trim() || $p.attr('href')?.replace('tel:', '') || '';
      if (t) { phone = normalisePhone(t); break; }
    }

    const descSelectors = ['.description', '.snippet', 'p', '.text', '.summary'];
    let description = null;
    for (const s of descSelectors) {
      const t = $el.find(s).first().text().trim();
      if (t) { description = t.slice(0, 500); break; }
    }

    results.push({ name, address, phone, website: null, description, city: city.name, province: city.province, source: 'hotfrog.co.za' });
  });

  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function scrapeAll() {
  // Get or create system profile
  const systemProfile = await prisma.profile.upsert({
    where: { email: 'system@thebonnet.co.za' },
    update: {},
    create: {
      email: 'system@thebonnet.co.za',
      fullName: 'The Bonnet System',
      role: 'ADMIN',
    },
  });

  let totalImported = 0;
  let totalSkipped = 0;

  for (const city of CITIES) {
    console.log(`\n📍 Scraping ${city.name}...`);

    const results = [];

    for (const [scraperName, scraperFn] of [
      ['YellowPages', () => scrapeYellowPages(city)],
      ['Brabys', () => scrapeBrabys(city)],
      ['BusinessList', () => scrapeBusinessList(city)],
      ['Cylex', () => scrapeCylex(city)],
      ['Hotfrog', () => scrapeHotfrog(city)],
    ]) {
      try {
        const found = await scraperFn();
        console.log(`  ${scraperName}: ${found.length} results`);
        results.push(...found);
      } catch (err) {
        console.log(`  ${scraperName}: failed (${err.message})`);
      }
      await sleep(DELAY_MS);
    }

    // Deduplicate by normalised name
    const seen = new Set();
    const unique = results.filter((r) => {
      const key = r.name.toLowerCase().replace(/\s+/g, '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`  ${unique.length} unique workshops found`);

    for (const workshop of unique) {
      if (!workshop.name || workshop.name.length < 2) {
        totalSkipped++;
        continue;
      }
      try {
        const slug = slugify(workshop.name, city.name);
        await prisma.workshop.upsert({
          where: { slug },
          create: {
            ownerId: systemProfile.id,
            name: workshop.name,
            slug,
            description:
              workshop.description ||
              `${workshop.name} is a vehicle service and repair workshop in ${city.name}, South Africa.`,
            city: city.name,
            province: city.province,
            addressLine1: workshop.address || null,
            phone: workshop.phone || null,
            website: workshop.website || null,
            sourceName: workshop.source,
            listingTypes: ['Car Repair', 'General Service'],
            status: 'PENDING',
          },
          update: {
            phone: workshop.phone || undefined,
            website: workshop.website || undefined,
            addressLine1: workshop.address || undefined,
          },
        });
        totalImported++;
      } catch (err) {
        console.log(`    [upsert-error] ${workshop.name}: ${err.message}`);
        totalSkipped++;
      }
    }
  }

  console.log(`\n✅ Done! Imported: ${totalImported}, Skipped: ${totalSkipped}`);
  await prisma.$disconnect();
}

scrapeAll().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
