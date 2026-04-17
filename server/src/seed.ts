import sql from './db';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

async function seed() {
  console.log('🌱 Seeding FixIndia.org database...');

  // ─── Real Bengaluru Ward + MLA Data ──────────
  let wards = [];
  const fullDataPath = path.join(__dirname, 'utils', 'bengaluru_wards_full.json');
  
  if (existsSync(fullDataPath)) {
    console.log('  📄 Loading full 243-ward dataset from NammaKasa mapping...');
    wards = JSON.parse(readFileSync(fullDataPath, 'utf8'));
  } else {
    console.warn('  ⚠️ Full ward dataset not found, using minimal sample.');
    wards = [
      { ward_number: 76, ward_name: 'Ward 76 - Richmond Town', mla_name: 'N.A. Haris', assembly: 'Shanti Nagar', budget: 1.5, city: 'Bengaluru' },
      { ward_number: 147, ward_name: 'Ward 147 - Koramangala', mla_name: 'Ramalinga Reddy', assembly: 'BTM Layout', budget: 4.0, city: 'Bengaluru' },
      // ... (keeping a few for fallback)
      { ward_number: 27, ward_name: 'Ward 27 - Yelahanka', mla_name: 'S.R. Vishwanath', assembly: 'Yelahanka', budget: 4.5, city: 'Bengaluru' },
    ];
  }

  for (const w of wards) {
    const budgetValue = w.budget || 0;
    const boundaryWkb = w.boundary_wkb;
    
    await sql`
      INSERT INTO wards (
        ward_number, ward_name, mla_name, constituency, 
        sanctioned_budget, city, zone, parliamentary_constituency, mp_name, boundaries
      )
      VALUES (
        ${w.ward_number}, ${w.ward_name}, ${w.mla_name}, ${w.assembly}, 
        ${budgetValue}, ${w.city}, ${w.zone || null}, ${w.parliament || null}, ${w.mp_name || null},
        ${boundaryWkb ? sql`ST_GeomFromWKB(decode(${boundaryWkb}, 'hex'), 4326)` : null}
      )
      ON CONFLICT (ward_number) DO UPDATE SET
        mla_name = EXCLUDED.mla_name,
        sanctioned_budget = EXCLUDED.sanctioned_budget,
        zone = EXCLUDED.zone,
        parliamentary_constituency = EXCLUDED.parliamentary_constituency,
        mp_name = EXCLUDED.mp_name,
        boundaries = COALESCE(EXCLUDED.boundaries, wards.boundaries)
    `;
  }

  console.log(`  ✓ ${wards.length} wards seeded`);

  // ─── Seed Citizens ──────────────────────────
  const citizens = [
    { name: 'Arjun M.', job: 'Urban Planner', published: 145, verified: 200, helped: 3, socials: { linkedin: '#', instagram: '#' } },
    { name: 'Priya K.', job: 'Architect', published: 98, verified: 154, helped: 1, socials: { linkedin: '#', facebook: '#' } },
    { name: 'Rohan D.', job: 'Local Activist', published: 112, verified: 105, helped: 2, socials: { facebook: '#' } },
    { name: 'Sneha P.', job: 'Civic Engineer', published: 45, verified: 88, helped: 8, socials: { linkedin: '#', instagram: '#' } },
    { name: 'Karthik R.', job: 'Software Engineer', published: 67, verified: 43, helped: 0, socials: { linkedin: '#' } },
    { name: 'Meera S.', job: 'Teacher', published: 34, verified: 78, helped: 1, socials: { instagram: '#' } },
    { name: 'Vikram J.', job: 'Auto Driver', published: 156, verified: 12, helped: 0, socials: {} },
    { name: 'Lakshmi N.', job: 'Homemaker', published: 89, verified: 67, helped: 0, socials: { facebook: '#' } },
  ];

  for (const c of citizens) {
    await sql`
      INSERT INTO users (display_name, job_title, reports_published, reports_verified, integrations_helped, socials, trust_score)
      VALUES (
        ${c.name}, ${c.job}, ${c.published}, ${c.verified}, ${c.helped}, 
        ${JSON.stringify(c.socials)},
        ${c.published * 10 + c.verified * 20 + c.helped * 50}
      )
    `;
  }
  console.log(`  ✓ ${citizens.length} citizens seeded`);

  // ─── Seed Real Reports ──────────────────────
  const reports = [
    { title: 'Massive Crater near Metro', cat: 'Pothole', lat: 12.9716, lng: 77.5946, status: 'open', severity: 'critical', agency: 'BBMP Major Roads', ward: 'Ward 76 - Richmond Town', mla: 'N.A. Haris', budget: '₹1.5 Crores', upvotes: 245 },
    { title: 'Shattered Pedestrian Walkway', cat: 'Broken Footpath', lat: 12.9316, lng: 77.6146, status: 'open', severity: 'high', agency: 'BBMP Ward Level', ward: 'Ward 147 - Koramangala', mla: 'Ramalinga Reddy', budget: '₹4 Crores', upvotes: 180 },
    { title: 'Overflowing Sewage', cat: 'Drainage', lat: 12.9816, lng: 77.6446, status: 'resolved', severity: 'medium', agency: 'BWSSB', ward: 'Ward 89 - Indiranagar', mla: 'S. Raghu', budget: '₹8.2 Crores', upvotes: 450 },
    { title: 'Missing Gutter Cover', cat: 'Drainage', lat: 12.9116, lng: 77.5846, status: 'open', severity: 'high', agency: 'BWSSB', ward: 'Ward 177 - JP Nagar', mla: 'Satish Reddy', budget: '₹2.1 Crores', upvotes: 89 },
    { title: 'Uneven Road Surface', cat: 'Pothole', lat: 13.0016, lng: 77.5646, status: 'resolved', severity: 'low', agency: 'BBMP Roadworks', ward: 'Ward 64 - Malleshwaram', mla: 'C.N. Ashwath Narayan', budget: '₹5.5 Crores', upvotes: 42 },
    { title: 'Coastal Erosion Collapse', cat: 'Broken Footpath', lat: 12.8700, lng: 74.8560, status: 'open', severity: 'critical', agency: 'MCC', ward: 'Ward 12 - Panambur', mla: 'Bharath Shetty', budget: '₹12 Crores', upvotes: 890 },
    { title: 'Flooded Underpass', cat: 'Drainage', lat: 12.8600, lng: 74.8450, status: 'open', severity: 'high', agency: 'MCC', ward: 'Ward 45 - Kankanady', mla: 'U.T. Khader', budget: '₹8 Crores', upvotes: 65 },
    { title: 'Extinguished Heritage Lights', cat: 'Streetlight', lat: 12.2958, lng: 76.6413, status: 'open', severity: 'low', agency: 'MCC (Mysuru)', ward: 'Ward 23 - Chamrajpura', mla: 'L. Nagendra', budget: '₹0.5 Crores', upvotes: 21 },
    { title: 'Deep Sinkhole', cat: 'Pothole', lat: 12.3000, lng: 76.6500, status: 'open', severity: 'critical', agency: 'MUDA', ward: 'Ward 41 - Kuvempunagar', mla: 'S.A. Ramadas', budget: '₹2.3 Crores', upvotes: 450 },
    { title: 'Collapsed Highway Divider', cat: 'Broken Footpath', lat: 15.3647, lng: 75.1316, status: 'resolved', severity: 'high', agency: 'NHAI', ward: 'Ward 11 - Vidyanagar', mla: 'Jagadish Shettar', budget: '₹40 Crores', upvotes: 110 },
    { title: 'Stagnant Disease Pool', cat: 'Drainage', lat: 15.3500, lng: 75.1400, status: 'open', severity: 'critical', agency: 'HDMC', ward: 'Ward 8 - Gokul Road', mla: 'Aravind Bellad', budget: '₹3.2 Crores', upvotes: 312 },
    { title: 'Blackout Intersection', cat: 'Streetlight', lat: 12.9616, lng: 77.5846, status: 'open', severity: 'medium', agency: 'BESCOM', ward: 'Ward 111 - Shantala Nagar', mla: 'N.A. Haris', budget: '₹1.1 Crores', upvotes: 56 },
    { title: 'Caved-in Bus Lane', cat: 'Pothole', lat: 12.9816, lng: 77.5746, status: 'open', severity: 'high', agency: 'BBMP Major Roads', ward: 'Ward 95 - Subhash Nagar', mla: 'R.V. Devaraj', budget: '₹6 Crores', upvotes: 210 },
    { title: 'Contaminated Water Main', cat: 'Drainage', lat: 15.8458, lng: 75.6416, status: 'open', severity: 'critical', agency: 'KWB', ward: 'Ward 4 - Hindwadi', mla: 'Abhay Patil', budget: '₹15 Crores', upvotes: 678 },
    { title: 'Broken Speed Breaker', cat: 'Pothole', lat: 12.9350, lng: 77.6200, status: 'open', severity: 'medium', agency: 'BBMP Ward Level', ward: 'Ward 150 - HSR Layout', mla: 'M. Satish Reddy', budget: '₹2.8 Crores', upvotes: 95 },
  ];

  for (const r of reports) {
    await sql`
      INSERT INTO reports (title, category, location, status, severity, agency, ward_name, mla_name, sanctioned_budget, upvotes, verification_count)
      VALUES (
        ${r.title}, ${r.cat},
        ST_SetSRID(ST_MakePoint(${r.lng}, ${r.lat}), 4326)::geography,
        ${r.status}, ${r.severity}, ${r.agency}, ${r.ward}, ${r.mla}, ${r.budget},
        ${r.upvotes}, ${r.status === 'open' ? 3 : 0}
      )
    `;
  }
  console.log(`  ✓ ${reports.length} reports seeded`);

  // ─── Seed Contextual News (with realistic staggered dates) ───
  const now = Date.now();
  const HOUR = 60 * 60 * 1000;
  const newsItems = [
    { headline: 'Pothole Claims Life of 22-Year-Old Biker on ORR', url: 'https://www.thenewsminute.com/karnataka/pothole-biker-orr', source: 'The News Minute', snippet: 'A young software engineer lost his life after his bike hit a deep pothole during early morning rain.', lat: 12.9500, lng: 77.6600, tragic: true, hoursAgo: 2 },
    { headline: 'Horror on Outer Ring Road: Auto Rickshaw Overturns in Unmarked Trench', url: 'https://www.deccanherald.com/india/karnataka/bengaluru/auto-trench-orr', source: 'Deccan Herald', snippet: 'A massive undocumented crater was left completely exposed leading to a severe collision.', lat: 12.9720, lng: 77.5950, tragic: true, hoursAgo: 5 },
    { headline: 'BBMP Faces Scrutiny Over Remaining 1,263 Potholes in Bengaluru', url: 'https://www.thehindu.com/news/cities/bangalore/bbmp-1263-potholes', source: 'The Hindu', snippet: 'Official data shows 39,887 potholes filled, yet citizens face immense danger on untreated stretches.', lat: 12.9750, lng: 77.5900, tragic: false, hoursAgo: 8 },
    { headline: 'Senior Citizen Suffers Deep Lacerations After Walkway Collapse', url: 'https://www.thenewsminute.com/karnataka/senior-walkway-collapse', source: 'The News Minute', snippet: 'A 68-year-old resident fell into an exposed drain cavity on the pedestrian walkway in Koramangala.', lat: 12.9320, lng: 77.6150, tragic: true, hoursAgo: 14 },
    { headline: 'Industry Leaders Warn Congestion and Bad Roads Sabotage Tech Expansion', url: 'https://www.deccanherald.com/india/karnataka/bengaluru/industry-road-congestion', source: 'Deccan Herald', snippet: 'Corporate chiefs cite extreme congestion and unscientific infrastructure execution as critical governance failures.', lat: 12.9600, lng: 77.6400, tragic: true, hoursAgo: 26 },
    { headline: 'New Civic Budget Focuses on Porous Footpaths for Groundwater Recharge', url: 'https://timesofindia.indiatimes.com/city/bengaluru/civic-budget-footpaths', source: 'Times of India', snippet: 'The new budget allocates ₹100 crore toward structural resilience and flood-prevention strategies.', lat: 12.9800, lng: 77.5700, tragic: false, hoursAgo: 36 },
    { headline: 'Rs 100 Crore Spent Daily, Yet Zero Relief on Bannerghatta Road', url: 'https://www.deccanherald.com/india/karnataka/bengaluru/100-crore-bannerghatta', source: 'Deccan Herald', snippet: 'Experts highlight chronic lack of integration between BWSSB, BESCOM, and BBMP.', lat: 12.8900, lng: 77.5950, tragic: true, hoursAgo: 52 },
    { headline: 'Flooding Crisis: Underpass Logjam Causes Multi-Hour Gridlock', url: 'https://timesofindia.indiatimes.com/city/bengaluru/underpass-flooding', source: 'Times of India', snippet: 'Poor systemic drainage resulted in massive flooding beneath the railway underpass.', lat: 12.8605, lng: 74.8455, tragic: true, hoursAgo: 72 },
  ];

  for (const n of newsItems) {
    const publishedAt = new Date(now - n.hoursAgo * HOUR).toISOString();
    await sql`
      INSERT INTO local_news (headline, url, source, snippet, location, is_tragic, confidence_score, published_at)
      VALUES (
        ${n.headline}, ${n.url}, ${n.source}, ${n.snippet},
        ST_SetSRID(ST_MakePoint(${n.lng}, ${n.lat}), 4326)::geography,
        ${n.tragic}, 90, ${publishedAt}
      )
    `;
  }
  console.log(`  ✓ ${newsItems.length} news articles seeded (with staggered dates)`);

  console.log('\n✅ Database seeded successfully!');
  await sql.end();
  process.exit(0);
}

seed().catch(e => {
  console.error('Seed failed:', e);
  process.exit(1);
});
