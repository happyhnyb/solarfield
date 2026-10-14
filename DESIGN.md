# SOLARFIELD — design notes (remake, Oct 2026)

Good energy. No guesswork. SOLARFIELD is a German reseller of panels, hybrid inverters, storage and tile-roof mounting. It buys from vendors after an order, and third parties install. Customers are homeowners, installers and small commercial buyers. Prices stay hidden until a (mock) sign-in. All data is fictional demo data, and the footer says so.

**The page's one job:** get someone with a roof from "what do I need?" to an equipment list, either as a demo order or as a quote request.

## Why the remake
The first build (the "survey plate") had a chalk paper ground (#F4F1E9 / #FAF8F3), mono values everywhere, black hairline ledgers, square 1px buttons and a dark form band before the footer. The design-system MCP linter called it **"looks retro"**, and it matches the *Stark ledger* combination one for one. The remake keeps the brand and replaces that execution.

## Brand elements kept
- The **SOLARFIELD** wide wordmark in Archivo at width 125.
- The **ink #1C2220** and **copper #CD6541** pair. Copper stays the signal colour.
- The **dimension-line motif**: copper measurement lines over a roof. It used to be decoration on a photo; it is now the working signature.
- All copy, data, flows, the price gate and the demo labelling.

## Content inventory (home)
1. **Hero and roof planner.** "Your roof. A smarter use of space." / "Panels, storage and system essentials, selected for projects that need to work long after installation day." / [Explore equipment] [Tell us about your project]. Planner: "Fit panels to one roof face". Inputs: face length (m), eaves to ridge (m), and a choice of ARC 430, ARC 455 or GRID 585. Readout: modules, kWp, rows × columns. Action: [Send this roof with an enquiry]. Note: "Portrait layout with 0,2 m edge clearance. It ignores chimneys, vents and fire-code margins; your installer decides the real number."
2. **Aerial band.** "A flat roof in Dornbirn, measured from the air". The existing aerial photo with its copper dimension overlay (≈ 21 m, ≈ 24 m, 5 module rows, second face). Credit: Asurnipal, CC BY-SA 4.0.
3. **Categories.** "Four kinds of equipment". Solar panels 430–585 Wp, Hybrid inverters 6 kW, Storage 9,6 kWh, Mounting for tile roofs. Each has a photo, a summary and a product count, all from the JSON.
4. **Panel comparison.** "Three panels, compared on the numbers". Rated power, efficiency, size, weight and price (behind the lock).
5. **Product spread.** ROOF KIT / TILE on clay tiles, and CONVERT 6 + STORE 10 on a utility-room wall.
6. **Process.** "From order to roof". Four stages, each with its caveat.
7. **CTA band.** "Send us your roof's dimensions" / [Start an enquiry] [Use the roof planner].

## Direction
| Axis | Choice | Subject-world source |
|---|---|---|
| Layout grammar | **Tool-first** (the hero *is* the roof planner), then a plan view, then a mixed catalogue | an installer's roof layout sketch: face, edge margins, module grid |
| Ground | **White #FFFFFF**, a cool mist #F2F3EF panel for the table, one **ink** panel (planner), one full-bleed **copper** band | — |
| Type genre | **Wide grotesk** display (Archivo, wdth 112–125) + Instrument Sans text. **No mono**: numbers use Archivo tabular figures | datasheet headline numerals |
| Density | Medium; packed only inside the table | — |
| Imagery | Real Commons photography at full colour, plus a live SVG layout drawing | — |
| Signature | **The roof planner**: type the face size and a module grid tiles into it, with copper dimension lines that redraw to your numbers | the dimension-line motif made real |

Losing directions:
- **B. Poster fields**, a copper full-bleed field per section with huge numerals. It lost because Lido, the most recent taste-log entry, is already a poster/colour-field site, and it buries the catalog.
- **C. Night operations**, an ink ground with copper data like an energy monitor. It lost because a dark ground reads as a dashboard, not as a shop for homeowners, and it would turn the photography moody.

Taste-log check: the layout (tool-first) and ground (white with ink and copper planes) differ from Toolshed, Avara rev 2 and Lido. The type genre (wide grotesk) is kept for **brand retention**, which overrides the rotation rule.

## Palette
| Token | Hex | Role |
|---|---|---|
| `--ground` | #FFFFFF | page |
| `--ink` | #1C2220 | text, planner panel, primary buttons, footer |
| `--ink-2` | #4A524F | secondary text (8.2:1 on white, 7.2:1 on mist) |
| `--copper` | #CD6541 | signal: dimension lines, focus ring, active chip, CTA band fill |
| `--copper-ink` | #A94A28 | copper text on white (5.7:1) |
| `--copper-lite` | #E2855F | copper text on ink (6.0:1) |
| `--on-copper` | #121614 | text on the copper band (4.8:1) |
| `--mist` | #F2F3EF | recessed panels, table panel, image backdrops |
| `--line` | #DCDFD8 | rules and borders |
| `--ink-soft` | #A3AAA6 | secondary text on ink (6.8:1) |

## Type
- Display: **Archivo**, wdth 112, weight 800, −0.035em. H1 is clamp(44, 5.6vw, 84). H2 is wdth 108, weight 750, clamp(32, 3.4vw, 52). H3 is wdth 100, weight 650, 22.
- Numbers: Archivo wdth 100, weight 700, tabular. The readout is 56 and table values are 17.
- Text: **Instrument Sans**, 17/1.6. Small is 14. Labels are 14/600 in sentence case.

## Wireframes
```
1440
[demo strip — ink]
SOLARFIELD  Equipment Projects How it works About Contact        Sign in  Cart 0
──────────────────────────────────────────────────────────────────────────────
Your roof.                         ┌──────── ink planner, r20 ──────────────┐
A smarter use                      │ Fit panels to one roof face            │
of space.                          │  ridge                                 │
Panels, storage and …              │ ┌─[▮▮▮▮▮▮▮▮]──────┐ 5,7 m             │
[Explore equipment] [Tell us…]     │ │ [▮▮▮▮▮▮▮▮]      │                    │
                                   │ └─────────────────┘                    │
                                   │  ├──── 10,4 m ────┤  eaves             │
                                   │ [len m][height m]  (ARC430|455|GRID585)│
                                   │ 24 modules │ 10,3 kWp │ 3 rows of 8     │
                                   │ [Send this roof with an enquiry]       │
                                   └────────────────────────────────────────┘
┌──────────────────── aerial photo, full bleed, copper overlay ──────────────┐
└────────────────────────────────────────────────────────────────────────────┘
Four kinds of equipment
[photo 4:5][photo][photo][photo]   name / big range number / summary / count
┌── mist panel r20 ─────────────────────────────────────────────────────────┐
│ Three panels, compared      │  table: ARC 430 | ARC 455 | GRID 585         │
└───────────────────────────────────────────────────────────────────────────┘
[ tile-roof photo 7/12 + kit card ]      [ utility room 5/12 + 2 product cards ]
From order to roof:  ●────●────●────●   copper track, 4 stages
███████ copper band: Send us your roof's dimensions  [Start an enquiry] ██████
footer (ink)

390
Headline 44px, lede, two buttons stacked
Planner full width (16px gutter, r16): drawing, two inputs side by side,
chips scroll in one row, readout in three cells, full-width button
Aerial photo 4:3, overlay kept
Categories: 2 × 2 grid
Table scrolls inside its panel with a sticky first column
Process: vertical copper track on the left
```

## Radius, weight, spacing
- Radius follows a hierarchy: **6** for controls and buttons, **12** for photos and cards, **20** for big panels (planner, table, CTA). Chips are pills, because a pill means "one of these".
- Borders are 1px `--line`. Ink rules are never used for structure.
- Spacing is on a 4px base: 4 8 12 16 24 32 48 72 112.

## Motion
- **One orchestrated moment:** on load the planner's dimension lines draw in (500ms) and the modules tile in row by row (staggered 18ms each). The aerial overlay draws once, at the same time.
- Feedback: the readout updates on input, the module grid re-tiles without delay, and the cart count ticks. There are no scroll reveals. Reduced motion shows everything immediately.

## Signature move
The roof planner. The copper dimension lines that used to sit only on a photo now measure *your* roof: the face is drawn to scale, the module grid packs portrait with 0,2 m clearance (via `fit.js`, the same function the enquiry page uses), and one button carries length, height and panel choice to the enquiry form.

## Default-check
- **Autopilot** would be a centred hero over a sunny stock photo, a 3-card "why solar" grid, a stat counter and a green gradient. None of these are here.
- **The anti-slop autopilot** is what the first build was: a chalk paper ground, mono everywhere, black hairline ledgers and a dark form band. It is replaced by a white ground, tabular sans numerals, soft panels with a radius hierarchy and a copper CTA band.
- The closest saturated combination is still *Stark ledger*. Three things separate this build from it: the ground is white with colour planes, not flat grey; there is no mono and no hairline tables; and the tool-first hero has rounded panels instead of a giant headline over a table.

## Lint exceptions
- The H1 "Your roof. A smarter use of space." is the brand line from the original brief, kept verbatim for brand retention. Its full stops are deliberate.
