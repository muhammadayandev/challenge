# OUTPOST 14: The Red Planet Mission

> **One Planet. Four Astronauts. Fourteen Sols. Can You Survive?**

OUTPOST 14 is an interactive Mars outpost survival strategy game designed for children aged 7–12. Players take command of a four-astronaut research base in Jezero Crater and navigate 14 Martian days (sols) of engineering trade-offs, delayed greenhouse farming, solar dust maintenance, radiation shielding, and 3–22 minute Mars–Earth radio delays—paired with real NASA open space-weather data.

---

## Features

- **Playable 14-Sol Strategy Campaign**: Briefing -> 2 Actions per Sol -> Daily Event -> Consequences & Science Lesson -> Next Sol.
- **Six Meaningful Engineering Actions**: Recycle Water, Operate Greenhouse (3-sol delayed harvest), Improve Radiation Shielding, Clean Solar Panels, Scientific Expedition, and Contact Earth.
- **Seeded Replayable Events**: Martian Dust Storms, Solar Particle Events, Life-Support Scrubber Glitches, Earth Communication Interruptions, Subsurface Water-Ice Discoveries, Dust Devils, and Clear Skies.
- **Earth Communication Delay**: Realistic 3–22 minute one-way light-time indicator with an accelerated on-screen transmission sequence and queued next-sol responses.
- **Real NASA Open Data Integration**:
  - **NASA DONKI API** (`SEP` & `FLR`) proxied securely server-side with 4-hour in-memory caching.
  - **NASA OSDR RadLab** archived International Space Station radiation dosimetry comparison card.
  - Strict separation between `LIVE NASA OBSERVATION`, `ARCHIVED NASA MEASUREMENT`, `SIMULATED MISSION EVENT`, and `GAMEPLAY VALUE`.
- **Browser Persistence & Mission Reports**: Saves active missions and archived reports in `localStorage` without requiring accounts or external databases.

---

## Installation & Running Locally

### Prerequisites
- Node.js `>= 18.0.0` (tested on Node 22)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional NASA API Key)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your free NASA API key from [https://api.nasa.gov/](https://api.nasa.gov/):
```env
NASA_API_KEY="your_real_nasa_api_key_here"
```
> **Security Note:** `NASA_API_KEY` is read strictly on the server in `server/nasaProxy.ts` and is never exposed to browser JavaScript. If you leave `NASA_API_KEY` unset or set to `DEMO_KEY`, the proxy still works using NASA's rate-limited `DEMO_KEY`, and the game continues to function offline or during API errors without inventing fake NASA observations.

### 3. Run in Development
```bash
npm run dev
```
This launches the Express server with Vite middleware on `http://localhost:3000`.

### 4. Run Automated Tests
```bash
npm test
```

### 5. Build & Run Production
```bash
npm run build
npm start
```

---

## Architecture Overview

- `server.ts` — Express server running on port 3000; mounts Vite in development and serves `dist/` in production.
- `server/nasaProxy.ts` & `server/cache.ts` — Secure server-side proxy for NASA DONKI (`SEP`, `FLR`) and OSDR RadLab with 10-second timeouts, 4-hour caching, and honest error/empty states.
- `src/game/balance.ts` — Central tunable game-balance constants.
- `src/game/engine.ts` — Pure TypeScript 14-sol state machine, resource clamping (`0–100`), greenhouse harvest queue, Earth comms queue, and automated Mission Report builder.
- `src/game/actions.ts`, `src/game/events.ts`, `src/game/education.ts`, `src/game/rng.ts` — Action rules, seeded event pool, Mulberry32 PRNG, and science explanations.
- `src/services/nasaService.ts` — Frontend client calling `/api/nasa/donki` and `/api/nasa/radlab`.
- `src/components/` — Landing, Tutorial, Mission Control, NASA Space Weather, Mission History, Mission Results, and Science Sources UI.
- `tests/engine.test.ts` — Vitest unit and full-campaign tests.

---

## Scientific Transparency & Disclaimer

OUTPOST 14 uses simplified `0–100` gameplay units for children's strategy gameplay. Real solar flare/SEP observations come from NASA CCMC DONKI and real LEO dosimetry comparisons come from NASA OSDR RadLab, clearly labeled separately from simulated game events. **NASA does not endorse or sponsor this project.**
