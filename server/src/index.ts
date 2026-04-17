import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import sql from './db';
import { runNewsScraper } from './scraper';
import { runProjectScraper } from './project_scraper';
import { runMlaScraper } from './mla_scraper';
import cron from 'node-cron';

// ─── Security: In-memory rate limiter ──────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string, maxReqs: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  if (entry.count > maxReqs) return true;
  return false;
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60 * 1000);

// Admin key for sensitive operations
const ADMIN_KEY = process.env.ADMIN_KEY || 'civicmap-admin-2026';

// Allowed frontend origins
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  /\.pages\.dev$/,
  /civicmap/i,
];

const app = new Elysia()
  .use(cors({
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key'],
    credentials: true,
  }))

  // ─── Global rate limiting guard ──────────────
  .onBeforeHandle(({ request, set }) => {
    const ip = request.headers.get('x-forwarded-for')
      || request.headers.get('cf-connecting-ip')
      || 'unknown';

    // POST endpoints: 30 req/min | GET: 120 req/min
    const isWrite = request.method === 'POST' || request.method === 'PUT';
    const limit = isWrite ? 30 : 120;

    if (isRateLimited(ip, limit, 60_000)) {
      set.status = 429;
      return { error: 'Too many requests. Slow down.', retryAfter: 60 };
    }
  })

  // ─── Health Check ────────────────────────────
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // ─── Map Context: Bounding Box Query ─────────
  .get('/api/map/context', async ({ query }) => {
    const { west, south, east, north } = query;

    const w = parseFloat(west as string);
    const s = parseFloat(south as string);
    const e = parseFloat(east as string);
    const n = parseFloat(north as string);

    if (isNaN(w) || isNaN(s) || isNaN(e) || isNaN(n)) {
      return { error: 'Invalid bounds. Provide west, south, east, north.' };
    }

    // Sanity check bounds (prevent absurdly large queries)
    if (Math.abs(e - w) > 5 || Math.abs(n - s) > 5) {
      return { error: 'Bounding box too large. Max 5 degrees.' };
    }

    const reports = await sql`
      SELECT 
        id, title, category, custom_category, status, severity,
        agency, ward_name, mla_name, sanctioned_budget,
        upvotes, verification_count,
        ST_Y(location::geometry) as latitude,
        ST_X(location::geometry) as longitude,
        created_at, creator_id,
        zone, parliamentary_constituency, mp_name
      FROM reports
      WHERE ST_Intersects(
        location,
        ST_MakeEnvelope(${w}, ${s}, ${e}, ${n}, 4326)::geography
      )
      ORDER BY created_at DESC
      LIMIT 200
    `;

    const news = await sql`
      SELECT
        id, headline, url, source, snippet, is_tragic,
        ST_Y(location::geometry) as latitude,
        ST_X(location::geometry) as longitude,
        published_at, confidence_score
      FROM local_news
      WHERE ST_Intersects(
        location,
        ST_MakeEnvelope(${w}, ${s}, ${e}, ${n}, 4326)::geography
      )
      AND confidence_score >= 50
      ORDER BY published_at DESC
      LIMIT 50
    `;

    const issuesWithNews = reports.map((r: any) => {
      const nearby = news.filter((n: any) => {
        const dlat = r.latitude - n.latitude;
        const dlng = r.longitude - n.longitude;
        return Math.sqrt(dlat * dlat + dlng * dlng) < 0.02;
      }).map((n: any) => ({
        id: n.id,
        source: n.source,
        title: n.headline,
        url: n.url,
        date: formatRelativeTime(n.published_at),
        snippet: n.snippet,
        isTragic: n.is_tragic,
      }));

      return {
        id: r.id,
        latitude: r.latitude,
        longitude: r.longitude,
        title: r.title,
        category: r.category,
        customCategory: r.custom_category,
        status: r.status,
        severity: r.severity,
        agency: r.agency,
        ward: r.ward_name,
        mla: r.mla_name,
        sanctionedBudget: r.sanctioned_budget,
        upvotes: r.upvotes,
        verificationCount: r.verification_count,
        timestamp: formatRelativeTime(r.created_at),
        newsContext: nearby.length > 0 ? nearby : undefined,
        zone: r.zone,
        parliament: r.parliamentary_constituency,
        mp: r.mp_name,
      };
    });

    return { issues: issuesWithNews };
  })

  // ─── All Reports (fallback) ──────────────────
  .get('/api/reports', async () => {
    const reports = await sql`
      SELECT 
        id, title, category, custom_category, status, severity,
        agency, ward_name, mla_name, sanctioned_budget,
        upvotes, verification_count,
        ST_Y(location::geometry) as latitude,
        ST_X(location::geometry) as longitude,
        created_at, creator_id,
        zone, parliamentary_constituency, mp_name
      FROM reports
      WHERE status != 'pending_verification'
      ORDER BY created_at DESC
      LIMIT 200
    `;

    return {
      issues: reports.map((r: any) => ({
        id: r.id,
        latitude: r.latitude,
        longitude: r.longitude,
        title: r.title,
        category: r.category,
        customCategory: r.custom_category,
        status: r.status,
        severity: r.severity,
        agency: r.agency,
        ward: r.ward_name,
        mla: r.mla_name,
        sanctionedBudget: r.sanctioned_budget,
        upvotes: r.upvotes,
        verificationCount: r.verification_count,
        timestamp: formatRelativeTime(r.created_at),
        zone: r.zone,
        parliament: r.parliamentary_constituency,
        mp: r.mp_name,
      })),
    };
  })

  // ─── Submit Report (validated) ────────────────
  .post('/api/reports', async ({ body, set }) => {
    const { title, category, customCategory, latitude, longitude, severity, creatorId } = body as any;

    // Input validation
    if (!title || typeof title !== 'string' || title.length < 3 || title.length > 200) {
      set.status = 400;
      return { error: 'Title must be 3-200 characters.' };
    }
    if (!category || typeof category !== 'string') {
      set.status = 400;
      return { error: 'Category is required.' };
    }
    if (typeof latitude !== 'number' || typeof longitude !== 'number'
      || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      set.status = 400;
      return { error: 'Invalid coordinates.' };
    }

    const validSeverity = ['low', 'medium', 'high', 'critical'];
    const safeSeverity = validSeverity.includes(severity) ? severity : 'medium';
    const safeTitle = title.replace(/<[^>]*>/g, '').trim(); // Strip HTML

    const wardMatch = await sql`
      SELECT ward_name, mla_name, sanctioned_budget::text
      FROM wards
      WHERE ST_Contains(
        boundaries::geometry,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      )
      LIMIT 1
    `;

    const ward = wardMatch[0] || { ward_name: 'Unknown Ward', mla_name: 'TBD', sanctioned_budget: 'Pending', zone: null, parliamentary_constituency: null, mp_name: null };

    const agencyMap: Record<string, string> = {
      'Pothole': 'BBMP Major Roads',
      'Broken Footpath': 'BBMP Ward Level',
      'Drainage': 'BWSSB',
      'Streetlight': 'BESCOM',
    };

    const [report] = await sql`
      INSERT INTO reports (
        title, category, custom_category, location, severity, agency, 
        ward_name, mla_name, sanctioned_budget, creator_id,
        zone, parliamentary_constituency, mp_name
      )
      VALUES (
        ${safeTitle},
        ${category.slice(0, 50)},
        ${customCategory ? customCategory.slice(0, 100) : null},
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        ${safeSeverity},
        ${agencyMap[category] || 'Municipal Corporation'},
        ${ward.ward_name},
        ${ward.mla_name},
        ${'₹' + (ward.sanctioned_budget || '0') + ' Crores'},
        ${creatorId || null},
        ${ward.zone},
        ${ward.parliamentary_constituency},
        ${ward.mp_name}
      )
      RETURNING id, title, status, created_at
    `;

    if (creatorId) {
      await sql`UPDATE users SET reports_published = reports_published + 1, trust_score = trust_score + 10 WHERE id = ${creatorId}`;
    }

    return { success: true, report };
  })

  // ─── Upvote (one per user) ───────────────────
  .post('/api/reports/:id/upvote', async ({ params, body, set }) => {
    const { userId } = body as any;
    if (!userId) { set.status = 400; return { error: 'userId required' }; }

    try {
      await sql`INSERT INTO upvotes (report_id, user_id) VALUES (${params.id}, ${userId})`;
      await sql`UPDATE reports SET upvotes = upvotes + 1 WHERE id = ${params.id}`;
      return { success: true };
    } catch {
      set.status = 409;
      return { success: false, error: 'Already upvoted' };
    }
  })

  // ─── Verify Report ───────────────────────────
  .post('/api/reports/:id/verify', async ({ params, body, set }) => {
    const { userId, isValid } = body as any;
    if (!userId || typeof isValid !== 'boolean') {
      set.status = 400;
      return { error: 'userId and isValid (boolean) required' };
    }

    try {
      await sql`INSERT INTO verifications (report_id, verifier_id, is_valid) VALUES (${params.id}, ${userId}, ${isValid})`;

      if (isValid) {
        await sql`UPDATE reports SET verification_count = verification_count + 1 WHERE id = ${params.id}`;
        const [report] = await sql`SELECT verification_count FROM reports WHERE id = ${params.id}`;
        if (report && report.verification_count >= 3) {
          await sql`UPDATE reports SET status = 'open' WHERE id = ${params.id} AND status = 'pending_verification'`;
        }
      } else {
        await sql`UPDATE reports SET status = 'resolved' WHERE id = ${params.id}`;
      }

      if (userId) {
        await sql`UPDATE users SET reports_verified = reports_verified + 1, trust_score = trust_score + 20 WHERE id = ${userId}`;
      }

      return { success: true };
    } catch {
      set.status = 409;
      return { success: false, error: 'Already verified' };
    }
  })

  // ─── Leaderboard: Citizens ───────────────────
  .get('/api/leaderboard/citizens', async () => {
    const users = await sql`
      SELECT 
        id, display_name, job_title, socials, avatar_url,
        reports_published, reports_verified, integrations_helped,
        (reports_published * 10 + reports_verified * 20 + integrations_helped * 50) AS civic_sense_score
      FROM users
      WHERE (reports_published * 10 + reports_verified * 20 + integrations_helped * 50) > 0
      ORDER BY civic_sense_score DESC
      LIMIT 50
    `;

    return {
      citizens: users.map((u: any, i: number) => ({
        id: u.id,
        name: u.display_name,
        jobTitle: u.job_title,
        socials: u.socials || {},
        reportsPublished: u.reports_published,
        reportsVerified: u.reports_verified,
        integrationsHelped: u.integrations_helped,
        civicSenseScore: u.civic_sense_score,
        rank: i + 1,
      })),
    };
  })

  // ─── Leaderboard: Wall of Shame ──────────────
  .get('/api/leaderboard/shame', async () => {
    const mlas = await sql`
      SELECT 
        mla_name AS name,
        ward_name AS ward,
        COUNT(*) FILTER (WHERE status = 'open') AS unresolved_count
      FROM reports
      WHERE mla_name IS NOT NULL AND mla_name != 'TBD'
      GROUP BY mla_name, ward_name
      HAVING COUNT(*) FILTER (WHERE status = 'open') > 0
      ORDER BY unresolved_count DESC
      LIMIT 20
    `;

    return {
      mlas: mlas.map((m: any, i: number) => ({
        id: `mla-${i + 1}`,
        name: m.name,
        ward: m.ward,
        unresolvedCount: parseInt(m.unresolved_count),
        rank: i + 1,
      })),
    };
  })

  // ─── Trending News ───────────────────────────
  .get('/api/news/trending', async () => {
    const news = await sql`
      SELECT 
        id, headline, url, source, snippet, is_tragic,
        ST_Y(location::geometry) as latitude,
        ST_X(location::geometry) as longitude,
        published_at
      FROM local_news
      WHERE confidence_score >= 40
      ORDER BY published_at DESC
      LIMIT 20
    `;

    return {
      news: news.map((n: any) => ({
        id: n.id,
        source: n.source,
        title: n.headline,
        url: n.url,
        date: formatRelativeTime(n.published_at),
        snippet: n.snippet,
        isTragic: n.is_tragic,
      })),
    };
  })

  // ─── Scraper Trigger (ADMIN ONLY) ────────────
  .post('/api/scraper/run', async ({ request, set }) => {
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== ADMIN_KEY) {
      set.status = 403;
      return { error: 'Forbidden. Admin key required.' };
    }
    const countNews = await runNewsScraper();
    return { success: true, newsArticlesInserted: countNews };
  })

  // ─── Project/MLA Scraper Trigger (ADMIN) ─────
  .post('/api/scraper/projects/run', async ({ request, set }) => {
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== ADMIN_KEY) {
      set.status = 403;
      return { error: 'Forbidden. Admin key required.' };
    }
    const countProjects = await runProjectScraper();
    return { success: true, projectsInserted: countProjects };
  })

  // ─── MLA Scraper Trigger (ADMIN) ─────────────
  .post('/api/scraper/mla/run', async ({ request, set }) => {
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== ADMIN_KEY) {
      set.status = 403;
      return { error: 'Forbidden. Admin key required.' };
    }
    const countMlas = await runMlaScraper();
    return { success: true, mlasUpdated: countMlas };
  })

  // ─── Clerk User Sync (auto-create on first login) ───
  .post('/api/users/sync', async ({ body, set }) => {
    const { clerkId, displayName, avatarUrl, email } = body as any;

    if (!clerkId || typeof clerkId !== 'string') {
      set.status = 400;
      return { error: 'clerkId is required.' };
    }

    const safeName = (displayName || 'Citizen Hero').replace(/<[^>]*>/g, '').slice(0, 50);

    // Upsert: create if not exists, update avatar/name if exists
    const [user] = await sql`
      INSERT INTO users (clerk_id, display_name, avatar_url, email)
      VALUES (${clerkId}, ${safeName}, ${avatarUrl || null}, ${email || null})
      ON CONFLICT (clerk_id) DO UPDATE SET
        display_name = COALESCE(EXCLUDED.display_name, users.display_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
        email = COALESCE(EXCLUDED.email, users.email)
      RETURNING id, display_name, trust_score, clerk_id
    `;

    return { success: true, user };
  })

  // ─── Get User by Clerk ID ────────────────────
  .get('/api/users/clerk/:clerkId', async ({ params, set }) => {
    const [user] = await sql`
      SELECT 
        id, clerk_id, display_name, job_title, socials, avatar_url, email,
        reports_published, reports_verified, integrations_helped,
        (reports_published * 10 + reports_verified * 20 + integrations_helped * 50) AS civic_sense_score,
        created_at
      FROM users WHERE clerk_id = ${params.clerkId}
    `;

    if (!user) { set.status = 404; return { error: 'User not found' }; }
    return { user };
  })

  // ─── Update User by Clerk ID ─────────────────
  .put('/api/users/clerk/:clerkId', async ({ params, body }) => {
    const { jobTitle, socials } = body as any;

    await sql`
      UPDATE users SET
        job_title = COALESCE(${jobTitle ? jobTitle.replace(/<[^>]*>/g, '').slice(0, 50) : null}, job_title),
        socials = COALESCE(${JSON.stringify(socials || null)}, socials)
      WHERE clerk_id = ${params.clerkId}
    `;

    return { success: true };
  })

  // ─── User Profile CRUD (legacy UUID-based) ──
  .post('/api/users', async ({ body, set }) => {
    const { displayName, jobTitle, socials } = body as any;

    const safeName = (displayName || 'Citizen Hero').replace(/<[^>]*>/g, '').slice(0, 50);
    const safeJob = jobTitle ? jobTitle.replace(/<[^>]*>/g, '').slice(0, 50) : null;

    const [user] = await sql`
      INSERT INTO users (display_name, job_title, socials)
      VALUES (${safeName}, ${safeJob}, ${JSON.stringify(socials || {})})
      RETURNING id, display_name, trust_score
    `;

    return { success: true, user };
  })

  .put('/api/users/:id', async ({ params, body, set }) => {
    const { displayName, jobTitle, socials, avatarUrl } = body as any;

    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id)) {
      set.status = 400;
      return { error: 'Invalid user ID format.' };
    }

    await sql`
      UPDATE users SET
        display_name = COALESCE(${displayName ? displayName.replace(/<[^>]*>/g, '').slice(0, 50) : null}, display_name),
        job_title = COALESCE(${jobTitle ? jobTitle.replace(/<[^>]*>/g, '').slice(0, 50) : null}, job_title),
        socials = COALESCE(${JSON.stringify(socials || null)}, socials),
        avatar_url = COALESCE(${avatarUrl || null}, avatar_url)
      WHERE id = ${params.id}
    `;

    return { success: true };
  })

  .get('/api/users/:id', async ({ params, set }) => {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id)) {
      set.status = 400;
      return { error: 'Invalid user ID format.' };
    }

    const [user] = await sql`
      SELECT 
        id, display_name, job_title, socials, avatar_url,
        reports_published, reports_verified, integrations_helped,
        (reports_published * 10 + reports_verified * 20 + integrations_helped * 50) AS civic_sense_score,
        created_at
      FROM users WHERE id = ${params.id}
    `;

    if (!user) { set.status = 404; return { error: 'User not found' }; }
    return { user };
  })

  // ─── Global error handler ────────────────────
  .onError(({ error, set }) => {
    console.error('[API Error]', error);
    set.status = 500;
    return { error: 'Internal server error' };
  })

  // ─── Start Server ────────────────────────────
  .listen({ port: 4000, hostname: '0.0.0.0' });

console.log(`🟢 FixIndia.org API running at http://0.0.0.0:${app.server?.port}`);

// ─── Cron: Run news scraper every 2 hours ───
setInterval(async () => {
  console.log('[Cron] Triggering news scrape...');
  try {
    await runNewsScraper();
  } catch (e) {
    console.error('[Cron] News Scraper failed:', e);
  }
}, 2 * 60 * 60 * 1000);

// ─── Cron: Run project/MLA scraper every 24 hours ───
setInterval(async () => {
  console.log('[Cron] Triggering project intelligence scrape...');
  try {
    await runProjectScraper();
  } catch (e) {
    console.error('[Cron] Project Scraper failed:', e);
  }
}, 24 * 60 * 60 * 1000);

// ─── Cron: Official MLA Wikipedia Scraper precisely at 3 AM daily ───
cron.schedule('0 3 * * *', async () => {
  console.log('[Cron] Executing 3 AM Bangalore civic MLA map sync...');
  try {
    await runMlaScraper();
  } catch (e) {
    console.error('[Cron] MLA Scraper failed:', e);
  }
});

// Helper: Smart relative time formatting
function formatRelativeTime(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;

  if (diff < 0) return 'Just now'; // Future date protection

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;

  // For older items, use actual date
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
