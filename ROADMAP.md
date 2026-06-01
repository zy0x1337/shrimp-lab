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
- [x] **SW registration** — automatic on page load via inline script in `index.html`
- [x] **Parameter trend charts** — per-tank SVG line charts for TDS, GH, KH, pH, Temp with target band overlays and 7/14/30/90-day range selector
- [x] **TDS Creep Analyzer** — per-measurement rise tracking, avg. rise/day, evaporation warnings
- [x] **Feeding log category** — food type, amount (g), fully integrated into Logbook filters and CSV export
- [x] App icons placeholder structure (`public/icons/`)
- [x] Apple PWA meta tags (`apple-mobile-web-app-capable`, status bar, touch icon)

---

## 🧬 v0.3 — Breeding & Genetics

- [ ] **Breeding line tracker** — family trees for breeding projects, parent/offspring linking
- [ ] **Genetics calculator** — predict offspring color grades (e.g. CRS × CBS, Mosura × Shadow Panda)
- [ ] **Colony population estimator** — estimate colony size from tank size, density rules, berried %, observed shrimplets
- [ ] **Molt tracker** — log molt events, detect molt issues (failed molts, white ring of death indicators)
- [ ] **Breeding pair manager** — track specific male/female pairings, litter history, hatch rates
- [ ] **Grade/quality logging** — log individual shrimp grades (S, SS, SSS for Caridina; color intensity for Neo)

---

## 💧 v0.4 — Advanced Water Chemistry

- [ ] **Mineral ratio calculator** — GH:KH ratio analysis, Ca:Mg ratio for remineralization products
- [ ] **Water change scheduler** — track upcoming water changes per tank, send reminder notifications (PWA push)
- [ ] **Extended remineralizer database** — Salty Shrimp GH+, GH/KH+, Bee Shrimp Mineral GH+, community-contributed products
- [ ] **Nitrate/Nitrite/Ammonia tracking** — full nitrogen cycle logging with safe range indicators
- [ ] **Soil buffering estimator** — track KH-absorbing substrate lifespan (ADA Amazonia, Aquario Neo, etc.)
- [ ] **Osmosis calculator** — RO/tap blend ratios to hit target TDS

---

## 📸 v0.5 — Media & Documentation

- [ ] **Photo attachments** — attach images to log entries and tank profiles (stored as base64 in IndexedDB)
- [ ] **Tank gallery** — visual timeline of tank photos per profile
- [ ] **Shrimp registry** — catalog individual named/notable shrimp with photos, weight, grade
- [ ] **Video log entries** — short clip attachments for breeding events, interesting behaviors

---

## 🌍 v0.6 — Species Database

- [ ] **Extended species database** — beyond Cherry/Crystal: Sulawesi, Caridina spinata, Neocaridina zhangjiajiensis, etc.
- [ ] **Compatibility checker** — can these two species share a tank? (water params, temperament, hybridization risk)
- [ ] **Color morph reference** — visual guide to Neo and Caridina color grades with breeding notes
- [ ] **Plant compatibility** — which plants thrive in shrimp water parameters, CO2 sensitivity
- [ ] **Medication safety database** — flag copper, fenbendazole, and other shrimp-unsafe treatments

---

## 🔔 v0.7 — Notifications & Automation

- [ ] **PWA push notifications** — water change reminders, hatch window alerts, feeding schedule
- [ ] **Hatch window notifications** — alert when a berried female enters her hatch window
- [ ] **Parameter anomaly alerts** — flag unusual values in the logbook (outside range = warning badge)
- [ ] **Feeding schedule** — configure per-tank feeding days and times, auto-log feeding events

---

## 🌐 v0.8 — Optional Sync (still offline-first)

- [ ] **Manual cloud backup** — opt-in export to a personal storage provider (e.g. pCloud, Backblaze) — no proprietary cloud
- [ ] **Cross-device sync via file** — QR-code-based data transfer between devices (no server needed)
- [ ] **Multi-language support** — i18n framework (DE, EN, FR, NL, PL priority)
- [ ] **Community parameter presets** — shareable JSON configs for popular breeding setups

---

## 💡 Backlog / Under Consideration

- Planted tank mode (CO2, fertilizer dosing calculator)
- Disease symptom identifier (visual symptom checklist → likely cause)
- Quarantine tank tracker
- Auction/sale log (track shrimp sold, prices, buyers)
- Shop / breeder directory (static community-maintained list)
- Export to AquaStic / Aquarium Note compatible format
- Accessibility audit + screen reader support
- Tablet-optimized layout
- Printable parameter cards (PDF export)

---

## Contributing

Want to work on something? Open an issue and mention this roadmap item. PRs targeting `main` are welcome — please include a short description of what was changed and why.

See [README.md](README.md) for setup instructions.

---

*Roadmap is subject to change. Community feedback shapes priorities.*
