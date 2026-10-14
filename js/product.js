import { mountChrome, fail, esc, $, $$, params, session, cart, compare, money, priceHTML, categoryOf, productById, keySpecText, here, icons, numDE, rowFormatter } from './core.js';
import { mountCompareBar, toggleCompare } from './compare-bar.js';

const data = await mountChrome('equipment.html');
if (!data) fail($('#main'), new Error('Catalog data unavailable'));
else init(data);

function credit(d, src) {
  const c = d.photoCredits.find((x) => x.file === src || (x.note ?? '').includes(src));
  return c ? `${c.author}, ${c.license}` : '';
}

function compareTable(d, p, items, caption) {
  const fields = d.compareFields[p.category];
  const best = (f) => {
    if (!f.better) return null;
    const vals = items.map((x) => x.compare[f.key]);
    return f.better === 'high' ? Math.max(...vals) : Math.min(...vals);
  };
  return `<div class="table-frame"><table class="spec-table">
    <caption class="visually-hidden">${esc(caption)}</caption>
    <thead><tr><th class="sticky" scope="col"><span class="visually-hidden">Specification</span></th>${items.map((x) => `<th scope="col">${x.id === p.id ? `<span class="this">${esc(x.name)} <span class="small muted">(this)</span></span>` : `<a href="product.html?id=${x.id}">${esc(x.name)}</a>`}</th>`).join('')}</tr></thead>
    <tbody>
      ${fields.map((f) => { const b = best(f); const fmt = rowFormatter(items.map((x) => x.compare[f.key])); return `<tr><th class="sticky" scope="row">${esc(f.label)}</th>${items.map((x) => `<td${b !== null && x.compare[f.key] === b && items.length > 1 ? ' class="best"' : ''}>${fmt(x.compare[f.key])}<span class="u">${esc(f.unit)}</span></td>`).join('')}</tr>`; }).join('')}
      <tr><th class="sticky" scope="row">Price</th>${items.map((x) => `<td>${priceHTML(x, { gateLabel: 'Sign in' })}</td>`).join('')}</tr>
    </tbody></table></div>`;
}

function init(d) {
  const p = productById(d, params().get('id'));
  if (!p) {
    $('#product').innerHTML = `<div class="wrap section"><div class="empty"><h2>That product isn't in the catalog</h2><p class="flush">The link may be out of date. Every current product is on the equipment page.</p><a class="btn" href="equipment.html">Browse equipment</a></div></div>`;
    return;
  }
  const cat = categoryOf(d, p.category);
  const signedIn = !!session.get();
  document.title = `${p.name}, ${cat.label.toLowerCase()} | SOLARFIELD`;
  $('#crumbs').innerHTML = `<nav class="crumbs" aria-label="Breadcrumb"><a href="equipment.html">Equipment</a><span aria-hidden="true">/</span><a href="equipment.html?cat=${cat.id}">${esc(cat.plural)}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.name)}</span></nav>`;

  const siblings = d.products.filter((x) => x.category === p.category);
  const pairs = p.compatibleWith.map((id) => productById(d, id)).filter(Boolean);
  const img0 = p.images[0];

  const buyBlock = signedIn ? `
      <div class="price-box">
        <div class="price-line"><span class="small muted">Price per unit</span><span class="price fresh">${money(p.price)}</span></div>
        <div class="buy-row">
          <div class="qty" role="group" aria-label="Quantity">
            <button type="button" data-step="-1" aria-label="One fewer">−</button>
            <input id="qty" type="number" inputmode="numeric" min="1" max="999" value="1" aria-label="Quantity">
            <button type="button" data-step="1" aria-label="One more">+</button>
          </div>
          <button class="btn" type="button" id="add">Add to cart</button>
        </div>
        <div class="price-line"><span class="small muted">Line total</span><span class="price" id="line-total">${money(p.price)}</span></div>
        <p class="status" id="status" role="status"></p>
        <a class="link small" href="contact.html?product=${p.id}">Request a quote for ${esc(p.name)} instead</a>
      </div>` : `
      <div class="price-box">
        <div class="price-line"><span class="small muted">Price</span><span class="lock">${icons.lock}Shown after sign-in</span></div>
        <a class="btn" href="sign-in.html?next=${encodeURIComponent(here())}">Sign in to see price</a>
        <a class="btn btn--line" href="contact.html?product=${p.id}">Request a quote</a>
        <p class="gate-note">Quotes don't need an account. Sign-in is simulated in this demo.</p>
      </div>`;

  $('#product').innerHTML = `
  <div class="wrap grid pdp">
    <div class="gallery">
      <figure class="fig">
        <div class="gallery-main"><img class="photo" id="main-img" src="${img0.src}" alt="${esc(img0.alt)}"></div>
        <figcaption class="fig-cap"><span id="main-cap">${esc(img0.caption)}${img0.illustrative ? ' Illustrative photograph, not the listed product.' : ''}</span><span id="main-credit">${esc(credit(d, img0.src))}</span></figcaption>
      </figure>
      ${p.images.length > 1 ? `<div class="thumbs" role="group" aria-label="Photographs">${p.images.map((im, i) => `<button type="button" data-img="${i}" aria-pressed="${i === 0}" aria-label="Show photograph ${i + 1}: ${esc(im.caption)}"><img src="${im.src}" alt=""></button>`).join('')}</div>` : ''}
    </div>
    <div class="buy">
      <span class="item-cat">${esc(cat.label)}</span>
      <h1>${esc(p.name)}</h1>
      <p class="flush">${esc(p.summary)}</p>
      <div class="keyspec"><span class="num">${typeof p.keySpec.value === 'number' ? numDE(p.keySpec.value) : ''}</span><span class="val">${esc(p.keySpec.unit || p.keySpec.value)}</span><span class="lbl">${esc(p.keySpec.label)}</span></div>
      ${buyBlock}
      <label class="cmp-toggle"><input type="checkbox" id="cmp"${compare.ids().includes(p.id) ? ' checked' : ''}> Add to comparison</label>
      <ul class="note-list"><li>${esc(d.meta.sourcingNote)}</li><li>${esc(d.meta.priceNote)}</li></ul>
    </div>
  </div>

  <section class="section--ruled rule" aria-labelledby="spec-h">
    <div class="wrap grid pdp">
      <div class="spec-groups">
        <div><h2 class="h2" id="spec-h">Specifications</h2><p class="body-copy muted">${esc(p.description)}</p></div>
        ${p.specs.map((g) => `<div class="table-frame"><table class="spec-table"><caption>${esc(g.group)}</caption><tbody>${g.items.map((s) => `<tr><th scope="row">${esc(s.label)}</th><td>${esc(s.value)}${s.unit ? `<span class="u">${esc(s.unit)}</span>` : ''}</td></tr>`).join('')}</tbody></table></div>`).join('')}
      </div>
      <div class="spec-side">
        <div>
          <h3 class="h3">Documents</h3>
          <ul class="doc-list">${p.documents.map((x) => `<li><span>${esc(x.label)} <span class="val muted">${esc(x.format)}</span></span><span class="val">${esc(x.status)}</span></li>`).join('')}</ul>
        </div>
        <div>
          <h3 class="h3">Suited to</h3>
          <ul class="doc-list">${p.suitableFor.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
        </div>
        <div>
          <h3 class="h3">Works with</h3>
          <ul class="doc-list">${pairs.map((x) => `<li><a class="link" href="product.html?id=${x.id}">${esc(x.name)}</a><span class="val">${esc(keySpecText(x))}</span></li>`).join('')}</ul>
        </div>
      </div>
    </div>
  </section>

  <section class="section--ruled rule section--bottom" aria-labelledby="cmp-h">
    <div class="wrap">
      <div class="grid sec-head">
        <h2 class="h2" id="cmp-h">${siblings.length > 1 ? `${esc(p.name)} against other ${esc(cat.plural.toLowerCase())}` : 'How it pairs'}</h2>
        <p class="muted">${siblings.length > 1 ? 'The best value in each row with a clear direction is marked in copper. Bigger isn\'t always better: weight and length decide what fits a roof.' : `There is one ${esc(cat.label.toLowerCase())} in the catalog. These are the products it is specified to work with.`}</p>
      </div>
      ${siblings.length > 1 ? compareTable(d, p, siblings, `${p.name} compared with other ${cat.plural}`) : `
        <div class="table-frame"><table class="spec-table"><caption class="visually-hidden">Compatible products</caption>
          <thead><tr><th scope="col">Product</th><th scope="col">Category</th><th scope="col">Key specification</th><th scope="col">Price</th></tr></thead>
          <tbody>${[p, ...pairs].map((x) => `<tr><th scope="row">${x.id === p.id ? `${esc(x.name)} <span class="small muted">(this)</span>` : `<a href="product.html?id=${x.id}">${esc(x.name)}</a>`}</th><td>${esc(categoryOf(d, x.category).label)}</td><td>${esc(keySpecText(x))}</td><td>${priceHTML(x, { gateLabel: 'Sign in' })}</td></tr>`).join('')}</tbody>
        </table></div>`}
    </div>
  </section>`;

  // gallery
  $$('[data-img]').forEach((b) => b.addEventListener('click', () => {
    const im = p.images[+b.dataset.img];
    $('#main-img').src = im.src; $('#main-img').alt = im.alt;
    $('#main-cap').textContent = im.caption + (im.illustrative ? ' Illustrative photograph, not the listed product.' : '');
    $('#main-credit').textContent = credit(d, im.src);
    $$('[data-img]').forEach((x) => x.setAttribute('aria-pressed', x === b));
  }));

  // comparison
  const bar = mountCompareBar(d);
  $('#cmp').addEventListener('change', (e) => {
    const r = toggleCompare(d, p.id, e.target.checked);
    if (!r.ok) { e.target.checked = false; bar.flash(r.msg); }
  });
  document.addEventListener('sf:compare', () => { $('#cmp').checked = compare.ids().includes(p.id); });

  // cart
  if (signedIn) {
    const qty = $('#qty');
    const clamp = () => Math.max(1, Math.min(999, parseInt(qty.value, 10) || 1));
    const total = () => { $('#line-total').textContent = money(p.price * clamp()); };
    $$('[data-step]').forEach((b) => b.addEventListener('click', () => { qty.value = clamp() + +b.dataset.step || 1; qty.value = clamp(); total(); }));
    qty.addEventListener('input', total);
    qty.addEventListener('blur', () => { qty.value = clamp(); total(); });
    $('#add').addEventListener('click', () => {
      const n = clamp();
      cart.add(p.id, n);
      const inCart = cart.items().find((i) => i.id === p.id).qty;
      $('#status').innerHTML = `Added ${n} × ${esc(p.name)}. ${inCart > n ? `${inCart} in your cart now. ` : ''}<a class="link" href="cart.html">View cart</a>`;
    });
  }
}
