# 🦐 Shrimp Lab

**The open-source, offline-first PWA for freshwater shrimp keepers and breeders.**

Shrimp Lab is a free, open-source Progressive Web App built for Neocaridina and Caridina hobbyists. It runs entirely in your browser — no account, no API keys, no cloud lock-in. Install it on any device and use it fully offline.

> 🚧 **Actively developed.** See [ROADMAP.md](ROADMAP.md) for what's coming.

---

## Features

### 🧪 Water Chemistry
- **Parameter Checker** — Compare tank values against species target ranges with color-coded feedback
- **TDS Water Change Calculator** — Calculate optimal water change percentage to hit target TDS
- **Remineralization Planner** — Calculate remineralizer dosage for RO/DI water with product presets
- **Species Reference** — Target water parameters for Neocaridina and Caridina with stability notes

### 🥚 Breeding
- **Breeding Timeline** — Estimate hatch windows from berried dates and tank temperature
- **Active Breeding Tracker** — Track all berried females with progress and alerts
- **Breeding Pair Manager** — Track pairings, grades (S–SSSS), active/retired state
- **Molt Tracker** — Log molts with status (Normal / Failed / White Ring of Death), per-tank stats
- **Grade Log** — Quality grade assessments with distribution view per tank
- **Colony Estimator** — Population estimate from tank volume and stocking density

### 📖 Logging & Tracking
- **Logbook** — Record water tests, molts, deaths, berried females, shrimplet sightings, feeding
- **Dashboard** — At-a-glance stats, breeding alerts, parameter snapshots, recent activity
- **Tank Profiles** — Manage multiple tanks (Neo, Caridina, cull, grow-out) with inline editing
- **Parameter Charts** — Per-tank SVG line charts for TDS, GH, KH, pH, Temp with target band overlays

### 💾 Data & Settings
- **Import / Export** — JSON backup/restore + CSV export for log entries
- **Dark + Light Mode** — Torque design system (SEAM UI)
- **Offline-first** — All data stored locally in your browser via `localStorage`
- **PWA** — Installable, cache-first service worker, offline fallback

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for Production

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to Vercel, GitHub Pages, or any static host.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Routing | React Router v6 |
| Styling | SEAM UI — Torque Style |
| Icons | Lucide React |
| Storage | `localStorage` (offline-first, no external DB) |
| PWA | Service Worker (cache-first) + Web App Manifest |
| Backend | None — fully client-side |

---

## Project Structure

```
shrimp-lab/
├── public/
└── src/
    ├── components/
    │   └── layout/
    │       └── Sidebar.tsx
    ├── lib/
    │   ├── types.ts              # TypeScript types for all data models
    │   ├── species.ts            # Species reference data & parameter ranges
    │   ├── calculators.ts        # TDS, hatching, remineralization, CSV export
    │   ├── db.ts                 # localStorage persistence layer (load/save/CRUD)
    │   └── DataContext.tsx       # App-wide React context (state + actions)
    ├── pages/
    │   ├── Dashboard.tsx
    │   ├── Reference.tsx
    │   ├── ParameterChecker.tsx
    │   ├── TdsCalculator.tsx
    │   ├── RemineralizationPlanner.tsx
    │   ├── BreedingTimeline.tsx
    │   ├── Breeding.tsx
    │   ├── MoltTracker.tsx
    │   ├── GradeLog.tsx
    │   ├── Colony.tsx
    │   ├── Charts.tsx
    │   ├── Logbook.tsx
    │   └── Settings.tsx
    ├── styles/
    │   └── seam-ui/              # SEAM UI Torque style (local copy)
    ├── App.tsx
    ├── main.tsx
    └── index.css
├── index.html
├── ROADMAP.md
└── vercel.json
```

---

## Water Parameter Reference

### Neocaridina
| Parameter | Range |
|---|---|
| TDS | 150–250 ppm |
| GH | 6–8 °dGH |
| KH | 2–5 °dKH |
| pH | 6.5–7.8 |
| Temperature | 20–24 °C |

### Caridina
| Parameter | Range |
|---|---|
| TDS | 100–180 ppm |
| GH | 4–6 °dGH |
| KH | 0–1 °dKH |
| pH | 5.8–6.8 |
| Temperature | 20–24 °C |

> **Stability beats perfection.** Sudden swings kill shrimp faster than slightly off-target but stable parameters.

---

## Design

Shrimp Lab uses the **Torque** style from [SEAM UI](https://github.com/zy0x1337/seam-ui) — a cold, editorial design system with Electric Blue accents, JetBrains Mono display, and IBM Plex Sans body type. Restrained, precise, and readable in dark rooms.

---

## Contributing

PRs and issues are welcome. See [ROADMAP.md](ROADMAP.md) for planned features — pick one and open an issue to claim it.

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with a clear message
4. Open a PR against `main`

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

*Built with 🦐 by shrimp keepers, for shrimp keepers.*
