import { mountChrome, fail, esc, $, priceHTML, session, numDE, productById, keySpecText } from './core.js';
import { fitModules } from './fit.js';

const data = await mountChrome('index.html');
const main = $('#main');
if (!data) fail(main, new Error('Catalog data unavailable'));
else render(data);

function render(d) {
  // Category ledger
  $('#category-ledger').innerHTML = d.categories.map((c) => {
    const items = d.products.filter((p) => p.category === c.id);
    const vals = items.map((p) => p.keySpec.value);
    const unit = items[0].keySpec.unit;
    const range = unit
      ? (Math.min(...vals) === Math.max(...vals) ? `${numDE(vals[0])} ${unit}` : `${Math.min(...vals)}–${Math.max(...vals)} ${unit}`)
      : items[0].keySpec.value;
    return `<li><a class="ledger-row" href="equipment.html?cat=${c.id}">
      <span class="ledger-name">${esc(c.plural)}</span>
      <p class="ledger-text">${esc(c.summary)}</p>
      <span class="ledger-range"><span class="mono big">${esc(range)}</span><span class="mono muted">${items.length} ${items.length === 1 ? 'product' : 'products'}</span></span>
      <span class="ledger-swatch"><img class="photo" src="${c.image}" alt="" loading="lazy"></span>
    </a></li>`;
  }).join('');

  // Panel comparison table
  const panels = d.products.filter((p) => p.category === 'panel');
  const rows = [
    ['Rated power', (p) => `${p.compare.power_w}<span class="u">Wp</span>`],
    ['Efficiency', (p) => `${numDE(p.compare.efficiency_pct.toFixed(1))}<span class="u">%</span>`],
    ['Size', (p) => `${p.compare.length_mm} × ${p.compare.width_mm}<span class="u">mm</span>`],
    ['Weight', (p) => `${numDE(p.compare.weight_kg.toFixed(1))}<span class="u">kg</span>`],
    ['Price per module', (p) => priceHTML(p, { gateLabel: 'Sign in' })],
  ];
  $('#panel-table').insertAdjacentHTML('beforeend', `
    <thead><tr><th scope="col" class="sticky"><span class="visually-hidden">Specification</span></th>${panels.map((p) => `<th scope="col"><a href="product.html?id=${p.id}">${esc(p.name)}</a></th>`).join('')}</tr></thead>
    <tbody>${rows.map(([label, f]) => `<tr><th scope="row" class="sticky">${label}</th>${panels.map((p) => `<td>${f(p)}</td>`).join('')}</tr>`).join('')}</tbody>`);
  $('#panel-note').textContent = session.get()
    ? d.meta.priceNote
    : 'Prices appear after you sign in. In this demo, sign-in is simulated and any details work.';

  // Product previews: mounting + system pair
  const kit = productById(d, 'roof-kit-tile');
  const inv = productById(d, 'convert-6');
  const bat = productById(d, 'store-10');
  const plate = (p, extra) => `
    <div class="product-plate">
      <h3 class="h3"><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
      <p class="small muted flush">${esc(p.summary)}</p>
      <div class="kv"><span class="small">${esc(p.keySpec.label)}</span><span class="mono">${esc(keySpecText(p))}</span></div>
      ${extra ?? ''}
      <div class="kv"><span class="small">Price</span>${priceHTML(p)}</div>
    </div>`;
  $('#duo').innerHTML = `
    <figure class="duo-wide">
      <div class="img-frame"><img class="photo" src="img/mount-tile-roof.jpg" alt="Solar modules fixed on rails above a clay tile roof" loading="lazy"></div>
      <figcaption class="fig-cap"><span>Rails above clay tiles. Illustrative photograph, not the listed kit.</span><span>Marta Victoria, CC BY-SA 4.0</span></figcaption>
      ${plate(kit, `<div class="kv"><span class="small">Modules per kit</span><span class="mono">6, one row</span></div>`)}
    </figure>
    <figure class="duo-narrow">
      <div class="img-frame"><img class="photo" src="img/utility-room.jpg" alt="Wall-mounted inverter above a rack of batteries in a utility room" loading="lazy"></div>
      <figcaption class="fig-cap"><span>Inverter and storage share a wall. Illustrative photograph.</span><span>PowerAfricaSolar, CC BY-SA 4.0</span></figcaption>
      ${plate(inv)}
      ${plate(bat)}
    </figure>`;

  // Process
  $('#steps').innerHTML = d.process.map((s) => `
    <li><span class="num" aria-hidden="true">${s.step}</span><h3 class="h3">${esc(s.title)}</h3><p>${esc(s.body)}</p><p class="caveat">${esc(s.caveat)}</p></li>`).join('');

  // Live fit estimate in the end CTA, from ARC 430 dimensions in the JSON
  const arc = productById(d, 'arc-430');
  const hint = $('#q-hint');
  const form = $('#quick-enquiry');
  const update = () => {
    const L = parseFloat(form.roofLength.value); const H = parseFloat(form.roofWidth.value);
    if (!(L > 0 && H > 0)) { hint.innerHTML = "Leave any field blank if you don't know it yet."; return; }
    const f = fitModules(L, H, arc);
    hint.innerHTML = f.count
      ? `A ${numDE(L)} × ${numDE(H)} m face takes roughly <b>${f.count} × ${esc(arc.name)}</b> in portrait (${f.rows} rows of ${f.cols}), about <b>${numDE(f.kwp.toFixed(1))} kWp</b>, before chimneys, vents and edge-distance rules.`
      : `A ${numDE(L)} × ${numDE(H)} m face is too small for a full row of ${esc(arc.name)} in portrait. Send it anyway; we'll check smaller layouts.`;
  };
  form.addEventListener('input', update);
  form.addEventListener('submit', (e) => {
    // pass only filled fields to the enquiry form
    e.preventDefault();
    const q = new URLSearchParams();
    for (const el of form.elements) if (el.name && el.value.trim()) q.set(el.name, el.value.trim());
    location.href = 'contact.html' + (q.toString() ? '?' + q : '');
  });

  sizeTags();
  addEventListener('resize', sizeTags);
}

// Size the hero's annotation labels to their text so they read at ~13px on any screen.
// Under preserveAspectRatio "slice", one CSS px = 1 / max(w/2000, h/1125) user units.
function sizeTags() {
  const svg = $('.measure');
  if (!svg) return;
  const { width: w, height: h } = svg.getBoundingClientRect();
  const unitsPerPx = 1 / Math.max(w / 2000, h / 1125);
  for (const g of svg.querySelectorAll('.tag')) {
    const t = g.querySelector('text'); const r = g.querySelector('rect');
    t.style.fontSize = `${(w < 700 ? 12 : 15) * unitsPerPx}px`;
    const bb = t.getBBox();
    t.setAttribute('x', +g.dataset.x - bb.width / 2);
    t.setAttribute('y', +g.dataset.y + bb.height * 0.32);
    const b = t.getBBox(); const px = 7 * unitsPerPx; const py = 3 * unitsPerPx;
    r.setAttribute('x', b.x - px); r.setAttribute('y', b.y - py);
    r.setAttribute('width', b.width + px * 2); r.setAttribute('height', b.height + py * 2);
  }
}
