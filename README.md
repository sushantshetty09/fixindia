# 🇮🇳 FixIndia.org

### "Fixing India, one pothole at a time. Through code, community, and radical accountability."

Welcome to **FixIndia.org**, the high-performance civic accountability platform designed to bridge the gap between frustrated citizens and busy representatives. We use geospatial magic, AI-driven news analysis, and a transparent "Wall of Shame" to make municipal improvements inevitable.

![Ward Boundaries in Action](https://raw.githubusercontent.com/fixindia/fixindia/refs/heads/main/public/ward_boundary_verify_1776437965313.webp)

---

## 🚀 The Pulse (What’s Implemented)

We aren't just a map; we are a civic engine. Here is what is under the hood right now:

*   **📍 Precision Mapping**: Using MapLibre GL for 60fps vector map rendering. Zero lag, even with hundreds of markers.
*   **🗺️ Ward Consciousness**: Every square inch of Bengaluru is mapped to one of the 243 administrative wards. Hover (or tap on mobile) to see exactly who your MLA is and what their ward's budget looks like.
*   **📸 Verified Reporting**: Upload photos of potholes, broken footpaths, or lighting issues. We use **Storj DCS** (decentralized storage) for ultra-fast, encrypted media hosting.
*   **📰 Civic IQ (AI Scraper)**: Our background engine scrapes news snippets across the city and uses **Llama 3.3** (via Groq) to categorize them as "Government Success" or "Failure" in real-time.
*   **🏆 Citizen Fame & Wall of Shame**: A leaderboard system that ranks citizens by their contributions and puts inactive representatives in the spotlight.
*   **🔐 Secure Auth**: Powered by **Clerk** for seamless, secure user sessions.

---

## 🗺️ The Roadmap (What’s Coming Next)

We’re just getting started. Here’s the vision for the next few sprints:

- [ ] **👁️ AI Vision Auto-Verify**: Let the AI automatically confirm if a photo of a "pothole" is actually a pothole before it hits the map.
- [ ] **📧 Automated MLA Buzz**: When an issue gets 50+ upvotes, we automatically fire an email/notification to the regional representative's office.
- [ ] **💰 The Money Map**: Visual overlays showing where the city budget is actually being spent vs. where the most issues are reported.
- [ ] **📱 Native App Expansiion**: Moving from PWA to native iOS/Android for better background notifications and camera integration.

---

## 🤝 Support the Mission

FixIndia is a community-driven project. Running high-performance scrapers and spatial databases isn't free. If you want to help us maintain the infrastructure or scale to more cities, we'd love to chat!

📩 **Sponsors & Partners**: Mail us at [hi@fixindia.org](mailto:hi@fixindia.org). Let's build a better city together.

---

## 💻 Contribution Protocol: "The Vibe-Coding Rules"

We love contributors, but we have a very specific culture here:

1.  **Vibe Coding 🎸**: If you're a senior dev, you vibe, and you know exactly what you're doing—just go for it. Open a PR, show us the magic, and let's merge it.
2.  **Learning & Testing 🧪**: If you're still figuring out the stack or just want to help without touching the core engine, please **join our beta testing place**!
    -   **Beta Access**: [builder.fixindia.org](https://builder.fixindia.org/)
    -   Upload information about your area, report bugs, and help us refine the user experience before we hit the masses.

---

## ⚙️ Technical Setup

### Prerequisites
- [Bun](https://bun.sh) (Backend runtime)
- [Node.js](https://nodejs.org) (Frontend tools)
- [PostgreSQL](https://www.postgresql.org) + [PostGIS](https://postgis.net)

### Quick Start
1.  **Clone the repo**: `git clone https://github.com/fixindia/fixindia.git`
2.  **Install everything**:
    ```bash
    npm install          # Root/Frontend
    cd server && bun install  # Backend
    ```
3.  **Setup your environment**: Copy `.env.example` to `.env` in both the root and `server/` directories and fill in your keys.
4.  **Launch the engine**:
    ```bash
    npm run dev          # Frontend on :3000
    cd server && bun dev # Backend on :4000
    ```

---

*Made with ❤️ for a better India.*
