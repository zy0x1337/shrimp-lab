# 🦐 Shrimp Lab

**A local-first toolkit for freshwater shrimp keepers and breeders.**

Shrimp Lab is an open-source, client-side web app built for Neocaridina and Caridina shrimp hobbyists. It includes water parameter references, calculators, breeding estimators, and simple local logs — with **no account, no API, and no cloud lock-in**.

## Features

- 📋 **Species Reference** — Target water parameters for Neocaridina and Caridina with stability notes
- 🧪 **Parameter Checker** — Compare your tank values against species target ranges with color-coded feedback
- 💧 **TDS Water Change Calculator** — Calculate optimal water change percentage to hit target TDS
- 🥚 **Breeding Timeline** — Estimate hatch windows from berried dates and tank temperature
- 📖 **Logbook** — Record water tests, molts, deaths, berried females, shrimplet sightings with filters
- 🐟 **Tank Profiles** — Manage multiple tanks (Neo, Caridina, cull, grow-out)
- 📦 **Import / Export** — JSON backup and restore for your entire dataset
- 🌙 **Dark + Light Mode** — Aquatic-themed color palette for both

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build for Production

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to GitHub Pages, Vercel, or any static host.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for builds and dev server
- **React Router** for client-side navigation
- **Lucide React** for icons
- **localStorage** for data persistence
- **No backend, no API keys, no cloud dependency**

## Project Structure

```
src/
├── components/
│   └── layout/
│       └── Sidebar.tsx       # Navigation sidebar
├── lib/
│   ├── types.ts              # TypeScript types
│   ├── species.ts            # Species reference data + helpers
│   ├── calculators.ts        # Calculation utilities (TDS, hatching, parameters)
│   ├── db.ts                 # localStorage persistence layer
│   └── DataContext.tsx        # React context for app state
├── pages/
│   ├── Dashboard.tsx         # Home page with stats and quick actions
│   ├── Reference.tsx         # Species parameter reference
│   ├── ParameterChecker.tsx  # Tank value vs target range checker
│   ├── TdsCalculator.tsx     # Water change calculator
│   ├── BreedingTimeline.tsx  # Berried → hatch timeline estimator
│   ├── Logbook.tsx           # Full logbook with category filters
│   └── Settings.tsx          # Tank profiles, theme, import/export
├── App.tsx                   # Router and layout
├── main.tsx                  # Entry point
└── index.css                 # Global styles and design tokens
```

## Default Parameter Targets

### Neocaridina (Cherry, Blue Dream, Yellow, etc.)
| Parameter | Range |
|-----------|-------|
| TDS | 150–250 ppm |
| GH | 6–8 °dGH |
| KH | 2–5 °dKH |
| pH | 6.5–7.8 |
| Temp | 20–24°C (68–75°F) |

### Caridina (Crystal Red, Bee, Taiwan Bee, etc.)
| Parameter | Range |
|-----------|-------|
| TDS | 100–180 ppm |
| GH | 4–6 °dGH |
| KH | 0–1 °dKH |
| pH | 5.8–6.8 |
| Temp | 20–24°C (68–75°F) |

> ⚠️ These are guidelines. **Stability is more important than hitting exact numbers.** Sudden parameter swings kill shrimp faster than slightly suboptimal but stable water.

## Design Philosophy

- **Calm, clean, aquatic-inspired UI** — no flashy dashboards, no gamification
- **Works offline** — all data stays in your browser
- **Fast and lightweight** — minimal dependencies
- **Open source** — MIT licensed, PRs welcome

## Future Ideas

- Remineralization planner (GH/KH target from RO/DI)
- Printable parameter cards
- Colony population estimator
- Breeding line tracker with genetics
- PWA / offline install support
- CSV export for logs
- Dashboard summary widgets with charts
- Photo attachments for log entries
- Multi-language support

## License

MIT — see [LICENSE](LICENSE) for details.

---

Built with 🦐 by shrimp keepers, for shrimp keepers.
