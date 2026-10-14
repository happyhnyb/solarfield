# SOLARFIELD — design notes

Good energy. No guesswork. A German reseller of panels, hybrid inverters, storage and tile-roof mounting. It sources from vendors after an order, and third parties install. Customers are homeowners, installers and small commercial buyers. Prices stay locked until (mock) sign-in.

The page's one job: help someone with a roof get from "what do I need?" to an equipment list, either as a demo order or as a quote request.

## Fixed by the brief (not negotiable)

| Token | Value | Role |
|---|---|---|
| `--chalk` | `#F4F1E9` | page ground |
| `--ink` | `#1C2220` | text, rules, dark plates |
| `--copper` | `#CD6541` | signal only: measurement lines, focus, active state, prices once unlocked |
| `--stone` | `#C5C7BF` | secondary rules, swatch mats, disabled |
| `--ink-2` | `#4A524F` | secondary text (ink mixed toward stone; no new hue) |
| `--chalk-2` | `#EAE6DB` | recessed panels (chalk one step darker) |

Type: **Archivo** for display (its width axis is used: 112–125 for headlines, 75–87 for spec numerals); **Instrument Sans** for body; **IBM Plex Mono** for specification values *only*, never for decoration.

## Three art directions

### A. Survey plate (recommended)
The site behaves like a **surveyor's plate set**: every page opens with a photograph treated as a drawing, with copper dimension lines, angle marks and mono annotations laid over real roof photography. The catalog is a **ledger** (hairline-ruled index rows with a square material swatch), not a card grid. Products are "plates" with numbered spec tables.
- Type: Archivo 125-width black for headlines, set tight (−0.035em) and big (clamp 56→168px). Instrument Sans 17px body at 62ch. Plex Mono 13px for values and units.
- Composition: 12 columns. Headlines span 1–8 and body copy sits in 9–12 (asymmetric). Photography goes full-bleed or 7/12, never centred.
- Imagery: aerial plan views (a roof seen as a drawing), macro panel surfaces used as material swatches, documentary maintenance and utility-room shots. A single grade: −15% saturation and a slight lift toward chalk, so amateur Commons photos read as one set.
- The bold move: **the measurement overlay**. The hero aerial roof carries live SVG dimension lines and the end CTA asks for those same dimensions. "Your roof. A smarter use of space." and "Send us the dimensions" become one idea you can see.

### B. Datasheet
Swiss technical datasheet. Almost no photography above the fold. Huge Archivo condensed numerals (430 / 455 / 585 Wp) act as the hero, the whole site is tables, and photos are small 4:5 plates in the margin.
- Strong for installers, cold for homeowners. The brief asks for "substantial photography", so it fails that test.

### C. Monograph
An architecture monograph: full-bleed photo spreads alternating with narrow captioned text columns, slow scroll, page numbers, products as tipped-in plates.
- Beautiful, but it buries the catalog and turns pricing and cart into an afterthought. Too slow for a procurement tool.

**Chosen: A.** It is the only one where the art direction *is* the product promise (measure the roof, then choose equipment by specification) rather than a skin over it.

## Default-check (would I produce this for any solar brief?)
- Cream + copper is the #1 current AI default. The brief pins it, so it stays. Countermeasures: grotesque display (no serif), copper used only as a *signal* (lines, focus, unlocked price), and never as a decorative fill or button wash.
- Hairline rules and mono labels are also defaults. The brief asks for rules, so they carry structure (ledger rows, spec tables) and nothing else. Mono appears only on real values with units.
- Generic eco tells are banned: no leaves, suns, gradients, glass, badges or stat counters. There are no "3 cards" anywhere: categories are a ledger, panels are a comparison table, process is a ruled sequence, case studies are two different spreads.
- Eyebrows: only the one the brief supplies. Other headings stand alone.
- Buttons are named by their action ("Add to cart", "Sign in to see price", "Send enquiry"). No arrows appended.

## Layout sketches

Home, 1440:
```
SOLARFIELD   Equipment Projects How it works About Contact     Sign in  Cart (0)
───────────────────────────────────────────────────────────────────────────────
RESIDENTIAL + COMMERCIAL SOLAR EQUIPMENT
Your roof.                                         │ Panels, storage and …
A smarter use of space.                            │ [Explore equipment] Tell us…
┌──────────────────────── aerial roof, full bleed ───────────────────────────┐
│   ├──── 14.2 m ────┤  copper dimension lines + mono labels, 6 rows ↔        │
└────────────────────────────────────────────────────────────────────────────┘
caption, photo credit
───────────────────────────────────────────────────────────────────────────────
Solar panels      | text                         | 430–585 Wp    | [swatch]
Hybrid inverters  | text                         | 6 kW          | [swatch]
Storage           | …                                             (ledger)
Mounting          | …
───────────────────────────────────────────────────────────────────────────────
Less noise.        │  live spec table: ARC 430 / ARC 455 / GRID 585 (from JSON)
Better decisions.  │  Wp, η, size, weight, price or lock
[ macro surface photo 7/12 ]        [ CONVERT 6 + STORE 10 plate 5/12 ]
───────────────────────────────────────────────────────────────────────────────
1 Request ── 2 Confirm ── 3 Sourcing ── 4 Installer    (caveat under each)
───────────────────────────────────────────────────────────────────────────────
Have a roof in mind?        length [   ] m  width [   ] m  postcode [    ]
                            goal [   ] kWp      [Start an enquiry]
```

Mobile, 390: one column. The headline still dominates at 56px. The hero photo is cropped square with the overlay kept, ledger rows stack (name, then range and swatch on one line), and tables scroll horizontally inside a bordered frame with the first column sticky.

## Motion policy
- One orchestrated moment: on home load the dimension lines draw in (stroke-dashoffset, 900ms, staggered). With reduced motion they are drawn instantly.
- Feedback only otherwise: cart count ticks, the price lock "opens" (lock row swaps to price with a 160ms fade), the form success state replaces the form. No scroll-triggered fades.

## Radius, weight, spacing
- Radius 0 on plates, tables and photos; 2px on inputs and buttons. Pills are only for filter chips, where a pill means "toggle".
- Spacing scale (4px base): 4 8 12 16 24 32 48 72 112 160.
- Rules: 1px ink at 100% for section breaks, 1px stone for in-table rows.
