import { mountChrome, fail, esc, $, priceHTML, session, numDE, productById, keySpecText } from './core.js';
import { fitModules } from './fit.js';

const data = await mountChrome('index.html');
const main = $('#main');
if (!data) fail(main, new Error('Catalog data unavailable'));
else render(data);

function render(d) {
  // Category cards
  $('#category-ledger').innerHTML = d.categories.map((c) => {
    const items = d.products.filter((p) => p.category === c.id);
    const vals = items.map((p) => p.keySpec.value);
    const unit = items[0].keySpec.unit;
    const range = unit
      ? (Math.min(...vals) === Math.max(...vals) ? numDE(vals[0]) : `${Math.min(...vals)}–${Math.max(...vals)}`)
      : items[0].keySpec.value;
    return `<li><a class="cat" href="equipment.html?cat=${c.id}">
      <span class="cat-img"><img class="photo" src="${c.image}" alt="" loading="lazy"></span>
      <span class="cat-name">${esc(c.plural)}</span>
      <span class="cat-range num">${esc(range)}${unit ? `<small>${esc(unit)}</small>` : ''}</span>
      <span class="cat-text">${esc(c.summary)}</span>
      <span class="cat-count">${items.length} ${items.length === 1 ? 'product' : 'products'}</span>
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
      <div class="kv"><span class="small muted">${esc(p.keySpec.label)}</span><span class="val">${esc(keySpecText(p))}</span></div>
      ${extra ?? ''}
      <div class="kv"><span class="small muted">Price</span>${priceHTML(p)}</div>
    </div>`;
  $('#duo').innerHTML = `
    <figure class="duo-wide">
      <div class="img-frame"><img class="photo" src="img/mount-tile-roof.jpg" alt="Solar modules fixed on rails above a clay tile roof" loading="lazy"></div>
      <figcaption class="fig-cap"><span>Rails above clay tiles. Illustrative photograph, not the listed kit.</span><span>Marta Victoria, CC BY-SA 4.0</span></figcaption>
      ${plate(kit, `<div class="kv"><span class="small muted">Modules per kit</span><span class="val">6, one row</span></div>`)}
    </figure>
    <figure class="duo-narrow">
      <div class="img-frame"><img class="photo" src="img/utility-room.jpg" alt="Wall-mounted inverter above a rack of batteries in a utility room" loading="lazy"></div>
      <figcaption class="fig-cap"><span>Inverter and storage share a wall. Illustrative photograph.</span><span>PowerAfricaSolar, CC BY-SA 4.0</span></figcaption>
      <div class="plate-pair">${plate(inv)}${plate(bat)}</div>
    </figure>`;

  // Process
  $('#steps').innerHTML = d.process.map((s) => `
    <li><span class="step-num" aria-hidden="true">${s.step}</span><h3 class="h3">${esc(s.title)}</h3><p>${esc(s.body)}</p><p class="caveat">${esc(s.caveat)}</p></li>`).join('');

  planner(panels);
  sizeTags();
  addEventListener('resize', sizeTags);
}

/* ---------- Roof planner: the signature ---------- */
function planner(panels) {
  const form = $('#planner');
  const svg = $('#roof-svg');
  $('#p-panels').innerHTML = panels.map((p, i) => `
    <input type="radio" name="product" id="pp-${p.id}" value="${p.id}"${i === 0 ? ' checked' : ''}><label for="pp-${p.id}">${esc(p.name)}</label>`).join('');

  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, text) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (text != null) n.textContent = text;
    return n;
  };
  const tag = (x, y, text, cls = '') => {
    const g = el('g', { class: `dim-tag ${cls}` });
    const t = el('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, text);
    g.append(el('rect', {}), t);
    return g;
  };

  let first = true;
  const draw = () => {
    const L = parseFloat(form.roofLength.value);
    const H = parseFloat(form.roofWidth.value);
    const p = panels.find((x) => x.id === form.product.value) ?? panels[0];
    const W = Math.round(svg.parentElement.getBoundingClientRect().width) || 640;
    const ok = L > 0 && H > 0 && L <= 60 && H <= 30;
    const padL = W < 480 ? 46 : 64, padR = 12, padT = 30, padB = W < 480 ? 46 : 54;
    // the drawing's height follows the roof's proportions, within limits
    const want = ok ? ((W - padL - padR) * H) / L + padT + padB : 220;
    const VH = Math.round(Math.max(170, Math.min(want, W * 0.5, 300)));
    svg.setAttribute('viewBox', `0 0 ${W} ${VH}`);
    svg.replaceChildren(svg.querySelector('desc'));

    if (!ok) {
      svg.append(el('text', { x: W / 2, y: VH / 2, class: 'empty-msg', 'text-anchor': 'middle' }, 'Enter a length up to 60 m and a height up to 30 m'));
      $('#r-count').textContent = '–'; $('#r-kwp').textContent = '–'; $('#r-layout').textContent = '–';
      return;
    }

    const s = Math.min((W - padL - padR) / L, (VH - padT - padB) / H);
    const fw = L * s, fh = H * s;
    const x0 = padL + (W - padL - padR - fw) / 2;
    const y0 = padT + (VH - padT - padB - fh) / 2;

    // face and edge clearance
    svg.append(el('rect', { class: 'face', x: x0, y: y0, width: fw, height: fh, rx: 3 }));
    const e = 0.2 * s;
    if (fw > 2 * e && fh > 2 * e) svg.append(el('rect', { class: 'clear', x: x0 + e, y: y0 + e, width: fw - 2 * e, height: fh - 2 * e }));
    svg.append(el('text', { class: 'edge-label', x: x0 + fw / 2, y: y0 - 10, 'text-anchor': 'middle' }, 'Ridge'));

    // modules, centred inside the clearance
    const f = fitModules(L, H, p);
    const mw = (p.compare.width_mm / 1000) * s, ml = (p.compare.length_mm / 1000) * s, g = 0.02 * s;
    const bw = f.cols * mw + Math.max(0, f.cols - 1) * g;
    const bh = f.rows * ml + Math.max(0, f.rows - 1) * g;
    const mx = x0 + (fw - bw) / 2, my = y0 + (fh - bh) / 2;
    const mods = el('g', { class: 'mods' });
    let i = 0;
    for (let r = f.rows - 1; r >= 0; r--) {
      for (let c = 0; c < f.cols; c++) {
        mods.append(el('rect', { class: 'mod', x: mx + c * (mw + g), y: my + r * (ml + g), width: mw, height: ml, rx: 1.5, style: `--i:${i++}` }));
      }
    }
    svg.append(mods);

    // dimension lines, drawn like a site sketch
    const dy = y0 + fh + (W < 480 ? 22 : 28);
    const dx = x0 - (W < 480 ? 22 : 30);
    const t = 6;
    svg.append(
      el('line', { class: 'ext', x1: x0, y1: y0 + fh + 4, x2: x0, y2: dy + 8 }),
      el('line', { class: 'ext', x1: x0 + fw, y1: y0 + fh + 4, x2: x0 + fw, y2: dy + 8 }),
      el('line', { class: 'dim', pathLength: 1, x1: x0, y1: dy, x2: x0 + fw, y2: dy }),
      el('path', { class: 'dim', pathLength: 1, d: `M${x0 - t} ${dy + t} L${x0 + t} ${dy - t} M${x0 + fw - t} ${dy + t} L${x0 + fw + t} ${dy - t}` }),
      el('line', { class: 'ext', x1: x0 - 4, y1: y0, x2: dx - 8, y2: y0 }),
      el('line', { class: 'ext', x1: x0 - 4, y1: y0 + fh, x2: dx - 8, y2: y0 + fh }),
      el('line', { class: 'dim', pathLength: 1, x1: dx, y1: y0, x2: dx, y2: y0 + fh }),
      el('path', { class: 'dim', pathLength: 1, d: `M${dx - t} ${y0 + t} L${dx + t} ${y0 - t} M${dx - t} ${y0 + fh + t} L${dx + t} ${y0 + fh - t}` }),
    );
    const tags = [tag(x0 + fw / 2, dy, `${numDE(L)} m`), tag(dx, y0 + fh / 2, `${numDE(H)} m`)];
    svg.append(...tags);
    for (const g2 of tags) {
      const b = g2.querySelector('text').getBBox();
      Object.entries({ x: b.x - 7, y: b.y - 3, width: b.width + 14, height: b.height + 6, rx: 4 }).forEach(([k, v]) => g2.querySelector('rect').setAttribute(k, v));
    }
    if (f.count === 0) svg.append(el('text', { class: 'empty-msg', x: x0 + fw / 2, y: y0 + fh / 2, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, `Too small for a full ${p.name}`));

    $('#r-count').textContent = f.count;
    $('#r-kwp').textContent = numDE(f.kwp.toFixed(1));
    $('#r-layout').textContent = f.count ? `${f.rows} × ${f.cols}` : 'None';

    if (first) {
      first = false;
      svg.classList.add('intro');
      setTimeout(() => svg.classList.remove('intro'), 2200);
    }
  };

  form.addEventListener('input', draw);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (form.roofLength.value.trim()) q.set('roofLength', form.roofLength.value.trim());
    if (form.roofWidth.value.trim()) q.set('roofWidth', form.roofWidth.value.trim());
    q.set('product', form.product.value);
    location.href = 'contact.html?' + q;
  });
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(draw, 80); });
  (document.fonts?.ready ?? Promise.resolve()).then(draw);
}

// Size the aerial annotation labels to their text so they read at ~13px on any screen.
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
    const b = t.getBBox(); const px = 8 * unitsPerPx; const py = 4 * unitsPerPx;
    r.setAttribute('x', b.x - px); r.setAttribute('y', b.y - py);
    r.setAttribute('width', b.width + px * 2); r.setAttribute('height', b.height + py * 2);
    r.setAttribute('rx', 4 * unitsPerPx);
  }
}
