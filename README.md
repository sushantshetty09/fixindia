# 🇮🇳 FixIndia.org: Technical Architecture & Logic Breakdown

**FixIndia.org** is a high-performance civic accountability platform. This document provide an exhaustive breakdown of the technical logic, implementation details, and the API communication layer that powers the system.

---

## 🏗 System Architecture

The application follows a modern **3-Tier Geospatial Architecture**:

1.  **Frontend (UI/UX)**: React + Vite + MapLibre GL. Focuses on "Situational Awareness" using 60fps vector map rendering and mobile-first gesture controls.
2.  **Backend (API & Logic)**: Bun + Elysia. A high-throughput TypeScript runtime and framework handling the heavy lifting of spatial analysis and AI orchestration.
3.  **Data & Intelligence (Persistence)**: Postgres + PostGIS. Stores structured civic data, spatial ward boundaries, and user reputation scores.

---

## 🧠 Logic Implementations

### **1. The Geospatial Ward-Detection Logic**
When a user submits a report, the system doesn't just store coordinates. It automatically identifies the responsible administrative ward and MLA using **PostGIS**.

*   **Logic**:
    1.  User clicks map -> Receives `{lat, lng}`.
    2.  API uses `ST_SetSRID(ST_MakePoint(lng, lat), 4326)` to create a geospatial point.
    3.  A spatial "Point-in-Polygon" query is run against the `wards` table:
        ```sql
        SELECT ward_name, mla_name, sanctioned_budget
        FROM wards
        WHERE ST_Contains(boundaries, point)
        LIMIT 1;
        ```
    4.  The report is enriched with the MLA's name and the ward's budget before being saved.

### **2. The Consensus Verification Machine**
To prevent spam, reports follow a state-transition logic:
-   **Step 1: Submission**: Report enters state `pending_verification`.
-   **Step 2: Verification**: Other nearby users can verify the report.
-   **Step 3: State Change**: Once `verification_count >= 3`, the status automatically changes to `open`.
-   **Logic**: If a user marks an issue as "Invalid," it is immediately moved to `resolved` (flagged as non-issue).

### **3. AI Scraper Intelligence (Civic IQ)**
The platform uses an LLM-driven ingestion loop for government data.
-   **Step 1**: RSS feeds and official portals are scraped for titles and snippets.
-   **Step 2**: The raw text is sent to **Llama 3.3** with a specialized System Prompt.
-   **Step 3**: The LLM performs "Sentiment & Impact Extraction," determining if the news is a "Gov Success" (Sanction/Completion) or "Gov Failure" (Scam/Delay).
-   **Step 4**: The system performs "Spatial Deduplication" by checking title similarity in a 30-day window within the same district coordinates.

---

## 📡 API Specifications & Calls

The frontend communicates with the backend via a RESTful API.

### **Issue & Context Management**

#### `GET /api/map/context`
-   **Implementation**: Triggered every time the map is panned/zoomed.
-   **Payload**: Query params `west, south, east, north` (Bounding Box).
-   **Logic**: Uses `ST_Intersects` to fetch everything visible in the current viewport, then "clusters" nearby news articles to specific markers to provide context.

#### `POST /api/reports`
-   **Payload**: `{ title, category, latitude, longitude, severity, creatorId }`
-   **Logic**: Performs HTML sanitization (stripping tags), runs the Ward-Detection query, and increments the user's "Reports Published" count.

#### `POST /api/reports/:id/upvote`
-   **Implementation**: Atomic counter increment.
-   **Constraint**: One upvote per user ID using a unique constraint in the `upvotes` table.

### **Reputation & Rankings**

#### `GET /api/leaderboard/citizens`
-   **Logic**: Calculates a "Civic Sense Score" on-the-fly:
    `Score = (Reports * 10) + (Verifications * 20) + (Integrations * 50)`

#### `GET /api/leaderboard/shame`
-   **Logic**: Aggregates reports by `mla_name` where `status = 'open'`. The MLA with the most UNRESOLVED issues rises to the top of the "Wall of Shame."

### **User Synchronization (Clerk)**

#### `POST /api/users/sync`
-   **Logic**: Triggered on first login. Maps the Clerk `externalId` to our local Postgres `clerk_id`. It performs an `UPSERT` to ensure user profiles are created automatically without blocking the UI.

---

## ⚡ Performance Optimization

### **Map Rehydration (0ms Lag)**
The Map is wrapped in `React.memo` and utilizes the `reuseMaps` prop from `react-map-gl`.
-   **Logic**: When a user navigates from the Map to their Profile and back, the map instance is **never destroyed**. It remains in memory, allowing for an instantaneous return to the exact previous coordinates without re-fetching tiles.

### **Backend Rate Limiting**
Implemented an in-memory sliding-window rate limiter to protect the API from scraper abuse or spam.
-   **Default**: 30 requests/min for write operations (Reports/Votes); 120 requests/min for read operations.

---

## 🔍 Audit & Current Limitations
Before deployment, a full codebase audit was performed. The following items represent features designated in original planning that are currently **not implemented** in this release version:

1. **Direct-to-MLA Messaging / Email Triggers**: The backend does *not* automatically dispatch emails to MLAs when reports reach a critical threshold. This requires a 3rd-party integration (e.g., SendGrid/AWS SES) mapped to a verified representative contact list.
2. **AI Vision (Image Analysis)**: Currently, user-submitted media is not processed by AI to automatically determine the issue type (e.g., verifying a "pothole" photo genuinely features a pothole).
3. **Automated Budget Viz**: While budget values are scraped and stored (e.g., ₹5.5 Crores), there is no frontend visualization or "Money Map" overlay to chart spending efficiency over time per ward.

