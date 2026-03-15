# Scorito F1 2026 Scoring

This app uses the official Scorito points system (not FIA 25–18–15) for both Qualifying and Race results, with per-category tables (A..E) and a multiplier system for team selection slots (P1..P8).

## Scoring Rules
- **Qualifying Points**: Each driver receives points based on their qualifying position and category (see table below).
- **Race Points**: Each driver receives points based on their race finish position and category.
- **DNF**: Drivers who do not finish (DNF) receive 0 points.
- **Multiplier**: By default, the multiplier applies to Race points only (toggleable to "total").
- **Selection Slots**: 8 drivers are selected, each assigned a slot (P1..P8) with multipliers ×8..×1.

## Scoring Table (from /config/scoring.json)
See `/config/scoring.json` for the exact tables used in computation.

## Computation Reference
- `qual_points = qualifying_points[category][qual_position-1]` (or 0 for DNF/missing)
- `race_points = race_points[category][race_position-1]` (or 0 for DNF/missing)
- `mult = selection_multiplier(slot)` (8..1)
- `total = (apply_multiplier_to == 'race') ? qual_points + race_points * mult : (qual_points + race_points) * mult`

## Scorito vs FIA
- **Scorito**: Custom points per position/category, as above.
- **FIA**: Standard 25–18–15–12–10–8–6–4–2–1 (not used here).
- **This app always uses Scorito points.**

## Example
- A@Q11=20, C@R10=80, DNF→0, multiplier default on race: A(Q1=240) + A(R1=120)*8 = 1200.
- Switch mode to "total" → (240+120)*8.

## Refresh Flow
1. Select year/meeting.
2. Fetch results from OpenF1.
3. Compute points per driver.
4. Update database and UI.

## See Also
- `/config/scoring.json` (source of truth)
- `/f1-2026` page for live results and selection
