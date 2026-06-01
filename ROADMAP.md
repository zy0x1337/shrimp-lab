# 🦐 Shrimp Lab — Roadmap

Shrimp Lab is evolving into a **comprehensive, offline-first PWA** for freshwater shrimp keeping and breeding. Every feature runs 100% in the browser — no account required, no data leaves your device.

This roadmap is roughly ordered by priority. Items within a phase may ship in any order.

---

## ✅ v0.1 — Foundation *(shipped)*

- [x] Species reference (Neocaridina, Caridina)
- [x] Parameter Checker with color-coded feedback
- [x] TDS Water Change Calculator
- [x] Remineralization Planner with product presets
- [x] Breeding Timeline (berried → hatch estimator)
- [x] Logbook with category filters and edit support
- [x] Tank Profiles (multi-tank management)
- [x] Dashboard with stats and breeding alerts
- [x] JSON import/export + CSV log export
- [x] Dark/Light mode (SEAM UI Torque)
- [x] Offline-first localStorage persistence

---

## ✅ v0.2 — PWA & Core Polish *(shipped)*

- [x] **PWA manifest** — `manifest.json` with all required icon sizes, theme color, display mode
- [x] **Service Worker** — cache-first for assets, network-first for navigation, offline fallback
- [x] **SW registration** — automatic on page load
- [x] **Parameter trend charts** — per-tank SVG line charts for TDS, GH, KH, pH, Temp with target band overlays
- [x] **TDS Creep Analyzer** — per-measurement rise tracking, avg. rise/day, evaporation warnings
- [x] **Feeding log category** — food type, amount (g), integrated into Logbook
- [x] Apple PWA meta tags

---

## ✅ v0.3 — Breeding & Tracking *(shipped)*

- [x] **Breeding Pair Manager** — track male/female pairings with names, grades (S/SS/SSS/SSSS), tank, start/end dates; active vs. retired view
- [x] **Molt Tracker** — dedicated molt logging with status (Normal / Failed molt / White Ring of Death), per-tank summary stats and deficiency warnings
- [x] **Grade Log** — quality grade assessments (S–SSSS + custom), distribution view per tank, morph-aware notes
- [x] **Colony Estimator** — population estimate from tank volume × stocking density, plus observation-based estimates from berried % or shrimplet multiplier
- [x] `grade` log category + `moltStatus` field added to `LogEntry`
- [x] `BreedingPair` and `BreedingLine` types added to data model
- [x] Sidebar grouped into Overview / Water / Breeding / Data sections

---

## 🧬 v0.4 — Genetics Calculator

- [ ] **Genetics calculator** — Punnett Square logic for CRS × CBS, Mosura × Shadow Panda, Neo colour morphs
- [ ] **Breeding Line Tracker** — multi-generation lineage view, parent line linking, goal tracking

---

## 💧 v0.5 — Advanced Water Chemistry

- [ ] **Mineral ratio calculator** — GH:KH ratio analysis, Ca:Mg ratio for remineralization products
- [ ] **Water change scheduler** — track upcoming water changes per tank, PWA push reminders
- [ ] **Extended remineralizer database** — Salty Shrimp GH+, GH/KH+, Bee Shrimp Mineral GH+, community-contributed products
- [ ] **Nitrate/Nitrite/Ammonia tracking** — full nitrogen cycle logging with safe range indicators
- [ ] **Soil buffering estimator** — track KH-absorbing substrate lifespan (ADA Amazonia, Aquario Neo, etc.)
- [ ] **Osmosis calculator** — RO/tap blend ratios to hit target TDS

---

## 📸 v0.6 — Media & Documentation

- [ ] **Photo attachments** — attach images to log entries and tank profiles (stored as base64 in IndexedDB)
- [ ] **Tank gallery** — visual timeline of tank photos per profile
- [ ] **Shrimp registry** — catalog individual named/notable shrimp with photos, weight, grade

---

## 🌍 v0.7 — Species Database

- [ ] **Extended species database** — beyond Cherry/Crystal: Sulawesi, Caridina spinata, Neocaridina zhangjiajiensis, etc.
- [ ] **Compatibility checker** — can these two species share a tank?
- [ ] **Color morph reference** — visual guide to Neo and Caridina color grades with breeding notes
- [ ] **Plant compatibility** — which plants thrive in shrimp water parameters
- [ ] **Medication safety database** — flag copper, fenbendazole, and other shrimp-unsafe treatments

---

## 🔔 v0.8 — Notifications & Automation

- [ ] **PWA push notifications** — water change reminders, hatch window alerts, feeding schedule
- [ ] **Hatch window notifications** — alert when a berried female enters her hatch window
- [ ] **Parameter anomaly alerts** — flag unusual values in the logbook
- [ ] **Feeding schedule** — configure per-tank feeding days and times

---

## 🌐 v0.9 — Optional Sync

- [ ] **Manual cloud backup** — opt-in export to personal storage (pCloud, Backblaze) — no proprietary cloud
- [ ] **Cross-device sync via file** — QR-code-based data transfer (no server needed)
- [ ] **Multi-language support** — i18n framework (DE, EN, FR, NL, PL priority)
- [ ] **Community parameter presets** — shareable JSON configs

---

## 💡 Backlog / Under Consideration

- Planted tank mode (CO2, fertilizer dosing calculator)
- Disease symptom identifier
- Quarantine tank tracker
- Auction/sale log
- Shop / breeder directory
- Export to AquaStic / Aquarium Note compatible format
- Accessibility audit + screen reader support
- Tablet-optimized layout
- Printable parameter cards (PDF export)

---

## Contributing

Want to work on something? Open an issue and mention this roadmap item. PRs targeting `main` are welcome.

See [README.md](README.md) for setup instructions.

---

*Roadmap is subject to change. Community feedback shapes priorities.*
