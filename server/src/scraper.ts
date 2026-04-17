import * as cheerio from 'cheerio';
import { queryLLM } from './llm';
import sql from './db';

interface ScrapedArticle {
  headline: string;
  url: string;
  source: string;
  snippet: string;
  publishedAt?: string; // ISO date if extractable
}

const SCRAPE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

// ─── Deccan Herald Bengaluru ────────────────────
async function scrapeDeccanHerald(): Promise<ScrapedArticle[]> {
  const articles: ScrapedArticle[] = [];
  try {
    const res = await fetch('https://www.deccanherald.com/india/karnataka/bengaluru', {
      headers: SCRAPE_HEADERS,
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Try multiple selector patterns (DH redesigns their site occasionally)
    const selectors = [
      'a[href*="/india/karnataka/bengaluru/"]',
      '.story-card a',
      'article a[href*="bengaluru"]',
      '.news-card a',
    ];

    const seen = new Set<string>();
    for (const selector of selectors) {
      $(selector).each((_, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        const fullUrl = href?.startsWith('http') ? href : `https://www.deccanherald.com${href}`;

        if (text.length > 15 && href && !seen.has(fullUrl)) {
          seen.add(fullUrl);
          articles.push({
            headline: text.replace(/\s+/g, ' ').slice(0, 200),
            url: fullUrl,
            source: 'Deccan Herald',
            snippet: '',
          });
        }
      });
      if (articles.length >= 6) break;
    }
  } catch (e) {
    console.error('[Scraper] Deccan Herald failed:', (e as Error).message);
  }
  return articles.slice(0, 10);
}

// ─── The Hindu Bengaluru ────────────────────────
async function scrapeTheHindu(): Promise<ScrapedArticle[]> {
  const articles: ScrapedArticle[] = [];
  try {
    const res = await fetch('https://www.thehindu.com/news/cities/bangalore/', {
      headers: SCRAPE_HEADERS,
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const selectors = [
      'a.story-card-news-link',
      'a[href*="/news/cities/bangalore/"]',
      '.story-card a',
      'h3 a',
    ];

    const seen = new Set<string>();
    for (const selector of selectors) {
      $(selector).each((_, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        const fullUrl = href?.startsWith('http') ? href : `https://www.thehindu.com${href}`;

        if (text.length > 15 && href && href.includes('bangalore') && !seen.has(fullUrl)) {
          seen.add(fullUrl);
          articles.push({
            headline: text.replace(/\s+/g, ' ').slice(0, 200),
            url: fullUrl,
            source: 'The Hindu',
            snippet: '',
          });
        }
      });
      if (articles.length >= 6) break;
    }
  } catch (e) {
    console.error('[Scraper] The Hindu failed:', (e as Error).message);
  }
  return articles.slice(0, 10);
}

// ─── Times of India Bengaluru ───────────────────
async function scrapeTOI(): Promise<ScrapedArticle[]> {
  const articles: ScrapedArticle[] = [];
  try {
    const res = await fetch('https://timesofindia.indiatimes.com/city/bengaluru', {
      headers: SCRAPE_HEADERS,
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const selectors = [
      'a[href*="/city/bengaluru/"]',
      '.top-newslist a',
      '.listing8 a',
    ];

    const seen = new Set<string>();
    for (const selector of selectors) {
      $(selector).each((_, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        const fullUrl = href?.startsWith('http') ? href : `https://timesofindia.indiatimes.com${href}`;

        if (text.length > 15 && href && !seen.has(fullUrl)) {
          seen.add(fullUrl);
          articles.push({
            headline: text.replace(/\s+/g, ' ').slice(0, 200),
            url: fullUrl,
            source: 'Times of India',
            snippet: '',
          });
        }
      });
      if (articles.length >= 6) break;
    }
  } catch (e) {
    console.error('[Scraper] TOI failed:', (e as Error).message);
  }
  return articles.slice(0, 10);
}

// ─── Bangalore Mirror ──────────────────────────
async function scrapeBangaloreMirror(): Promise<ScrapedArticle[]> {
  const articles: ScrapedArticle[] = [];
  try {
    const res = await fetch('https://bangaloremirror.indiatimes.com/', {
      headers: SCRAPE_HEADERS,
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    $('a[href*="bangaloremirror"]').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (text.length > 15 && href && !articles.some(a => a.url === href)) {
        articles.push({
          headline: text.replace(/\s+/g, ' ').slice(0, 200),
          url: href.startsWith('http') ? href : `https://bangaloremirror.indiatimes.com${href}`,
          source: 'Bangalore Mirror',
          snippet: '',
        });
      }
    });
  } catch (e) {
    console.error('[Scraper] Bangalore Mirror failed:', (e as Error).message);
  }
  return articles.slice(0, 8);
}

// ─── LLM Geocoding System ──────────────────────
const GEOCODE_SYSTEM_PROMPT = `You are a Bangalore/Karnataka city geography expert. Given a news headline about city infrastructure, extract:
1. The specific neighborhood/area/road mentioned
2. Approximate latitude and longitude for that location
3. Whether this news involves a death, serious injury, or tragic event
4. A one-line summary (max 120 chars)
5. Whether this is genuinely about city infrastructure (roads, water, drainage, electricity, construction, etc.)

Respond ONLY in valid JSON:
{"neighborhood": "string", "lat": number, "lng": number, "is_tragic": boolean, "snippet": "string", "confidence": 0-100, "is_infrastructure": boolean}

Rules:
- Confidence 90+ = exact location mentioned (e.g. "MG Road", "Whitefield")
- Confidence 60-89 = area mentioned (e.g. "East Bengaluru")  
- Confidence 30-59 = city mentioned but vague
- Confidence 0-29 = not infrastructure or not Karnataka
- If not about Karnataka infrastructure, set is_infrastructure to false`;

interface GeocodedArticle {
  headline: string;
  url: string;
  source: string;
  snippet: string;
  lat: number;
  lng: number;
  is_tragic: boolean;
  confidence: number;
}

async function geocodeArticle(article: ScrapedArticle): Promise<GeocodedArticle | null> {
  try {
    const prompt = `Headline: "${article.headline}"\nSource: ${article.source}`;
    const response = await queryLLM(prompt, GEOCODE_SYSTEM_PROMPT);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    // Skip non-infrastructure stories
    if (parsed.is_infrastructure === false) return null;

    return {
      headline: article.headline,
      url: article.url,
      source: article.source,
      snippet: parsed.snippet || article.snippet || '',
      lat: typeof parsed.lat === 'number' ? parsed.lat : 12.9716,
      lng: typeof parsed.lng === 'number' ? parsed.lng : 77.5946,
      is_tragic: !!parsed.is_tragic,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
    };
  } catch (e) {
    console.error(`[Scraper] Geocoding failed for: ${article.headline}`, (e as Error).message);
    return null;
  }
}

// ─── Infrastructure keyword filter ─────────────
const INFRA_KEYWORDS = /pothole|road|drain|flood|sewer|footpath|traffic|bridge|water|pipe|metro|bus|accident|crater|construction|repair|bbmp|bwssb|bescom|civic|infrastructure|collapse|rain|storm|waterlog|flyover|highway|signal|street\s*light|garbage|waste|lake|tank|bund|erosion|landslide|nala|slum|smart\s*city|tender|contractor|bmtc|bmrcl/i;

export async function runNewsScraper(): Promise<number> {
  console.log('[Scraper] Starting news scrape cycle...');

  // Scrape all sources in parallel
  const [dh, hindu, toi, bm] = await Promise.allSettled([
    scrapeDeccanHerald(),
    scrapeTheHindu(),
    scrapeTOI(),
    scrapeBangaloreMirror(),
  ]);

  const allArticles = [
    ...(dh.status === 'fulfilled' ? dh.value : []),
    ...(hindu.status === 'fulfilled' ? hindu.value : []),
    ...(toi.status === 'fulfilled' ? toi.value : []),
    ...(bm.status === 'fulfilled' ? bm.value : []),
  ];

  console.log(`[Scraper] Found ${allArticles.length} raw articles across all sources`);

  // Filter by infrastructure relevance
  const filtered = allArticles.filter(a => INFRA_KEYWORDS.test(a.headline));
  console.log(`[Scraper] ${filtered.length} infrastructure-related articles after keyword filter`);

  if (filtered.length === 0) {
    console.log('[Scraper] No infrastructure articles found. Trying broader selection...');
    // Fall back to top 5 from any source
    filtered.push(...allArticles.slice(0, 5));
  }

  // Geocode through LLM (batch with delay to respect rate limits)
  let inserted = 0;
  for (const article of filtered.slice(0, 12)) {
    // Check if URL already exists (dedup)
    const existing = await sql`SELECT id FROM local_news WHERE url = ${article.url}`;
    if (existing.length > 0) continue;

    // Also check by headline similarity (avoid near-duplicates from different URLs)
    const similar = await sql`SELECT id FROM local_news WHERE headline = ${article.headline}`;
    if (similar.length > 0) continue;

    const geocoded = await geocodeArticle(article);
    if (!geocoded || geocoded.confidence < 25) continue;

    await sql`
      INSERT INTO local_news (headline, url, source, snippet, location, is_tragic, confidence_score, published_at)
      VALUES (
        ${geocoded.headline},
        ${geocoded.url},
        ${geocoded.source},
        ${geocoded.snippet},
        ST_SetSRID(ST_MakePoint(${geocoded.lng}, ${geocoded.lat}), 4326)::geography,
        ${geocoded.is_tragic},
        ${geocoded.confidence},
        NOW()
      )
    `;
    inserted++;
    console.log(`[Scraper] ✓ Inserted: "${geocoded.headline.slice(0, 60)}..." (confidence: ${geocoded.confidence})`);

    // Rate limit: 500ms between LLM calls for free tier safety
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`[Scraper] Cycle complete. Inserted ${inserted} new geocoded articles.`);
  return inserted;
}
