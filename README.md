# SOLARFIELD — frontend prototype

Static site, no build step. It needs an HTTP server because the pages `fetch()` the catalog JSON:

    cd solarfield
    python3 -m http.server 4173
    # open http://127.0.0.1:4173/

- `data/solarfield_demo_data.json` is the single source for products, specs, prices, comparison fields, process stages, case studies, enquiry fields and photo credits. All of it is fictional demo data.
- State (mock session, cart, comparison, enquiries, demo orders) lives in `localStorage` under `solarfield.v1.*`.
- `DESIGN.md` has the three art directions, the chosen one, and the default-check.
- `screenshots/` holds the review renders at 1440, 768 and 390 px (`-in` = signed in).
- Photos are openly licensed from Wikimedia Commons; credits are on `about.html#credits`.
