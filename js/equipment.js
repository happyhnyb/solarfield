import { mountChrome, fail, esc, $, $$, params, session, compare, priceHTML, categoryOf, icons, numDE } from './core.js';
import { mountCompareBar, toggleCompare } from './compare-bar.js';

const data = await mountChrome('equipment.html');
if (!data) fail($('#main'), new Error('Catalog data unavailable'));
else init(data);

function init(d) {
  const signedIn = !!session.get();
  const p = params();
  const state = {
    q: p.get('q') ?? '',
    cat: d.categories.some((c) => c.id === p.get('cat')) ? p.get('cat') : 'all',
    sort: p.get('sort') ?? 'catalog',
  };
  if (state.sort.startsWith('price') && !signedIn) state.sort = 'catalog';

  const SORTS = [
    ['catalog', 'Catalog order'],
    ['name', 'Name, A to Z'],
    ['spec-desc', 'Key specification, high to low'],
    ['spec-asc', 'Key specification, low to high'],
    ['price-asc', 'Price, low to high'],
    ['price-desc', 'Price, high to low'],
  ];

  $('#catalog').innerHTML = `
    <aside class="filters" aria-label="Filter and sort">
      <div class="field search-block">
        <label for="q">Search the catalog</label>
        <div class="search">${icons.search}<input class="input" id="q" type="search" autocomplete="off" placeholder="Name, spec or use, e.g. tile" value="${esc(state.q)}"></div>
      </div>
      <fieldset class="field cat-block">
        <legend class="label">Category</legend>
        <div class="cat-list" id="cats"></div>
      </fieldset>
      <div class="field sort-block">
        <label for="sort">Sort by</label>
        <select class="select" id="sort">
          ${SORTS.map(([v, l]) => `<option value="${v}"${v === state.sort ? ' selected' : ''}${v.startsWith('price') && !signedIn ? ' disabled' : ''}>${l}${v.startsWith('price') && !signedIn ? ' (sign in)' : ''}</option>`).join('')}
        </select>
        ${signedIn ? '' : `<span class="hint"><a class="link" href="sign-in.html?next=equipment.html">Sign in</a> to sort by price.</span>`}
      </div>
    </aside>
    <section class="results" aria-labelledby="results-count">
      <div class="results-bar"><p class="flush" id="results-count" aria-live="polite"></p><button class="textbtn link clear" type="button" id="clear" hidden>Clear search and filters</button></div>
      <ul class="ledger" id="list"></ul>
    </section>`;

  const bar = mountCompareBar(d);
  const terms = () => state.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = (x) => [x.name, categoryOf(d, x.category).label, categoryOf(d, x.category).plural, x.summary, String(x.keySpec.value), x.keySpec.unit, x.suitableFor.join(' ')].join(' ').toLowerCase();
  const matches = (x) => terms().every((t) => haystack(x).includes(t));
  const mark = (text) => {
    // one pass over raw text so a later term can never match inside an earlier <mark>
    const ts = terms().sort((a, b) => b.length - a.length).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!ts.length) return esc(text);
    return String(text).split(new RegExp(`(${ts.join('|')})`, 'gi'))
      .map((part, i) => (i % 2 ? `<mark>${esc(part)}</mark>` : esc(part))).join('');
  };
  const catIndex = (x) => d.categories.findIndex((c) => c.id === x.category);
  const specNum = (x) => (typeof x.keySpec.value === 'number' ? x.keySpec.value : x.keyNumeric ?? 0);

  function render() {
    const searched = d.products.filter(matches);
    const counts = Object.fromEntries(d.categories.map((c) => [c.id, searched.filter((x) => x.category === c.id).length]));
    $('#cats').innerHTML = [['all', 'All equipment', searched.length], ...d.categories.map((c) => [c.id, c.plural, counts[c.id]])]
      .map(([id, label, n]) => `<input type="radio" name="cat" id="cat-${id}" value="${id}"${state.cat === id ? ' checked' : ''}><label for="cat-${id}">${label} <span class="count">${n}</span></label>`).join('');

    let list = searched.filter((x) => state.cat === 'all' || x.category === state.cat);
    const by = {
      catalog: () => 0,
      name: (a, b) => a.name.localeCompare(b.name),
      'spec-desc': (a, b) => catIndex(a) - catIndex(b) || specNum(b) - specNum(a),
      'spec-asc': (a, b) => catIndex(a) - catIndex(b) || specNum(a) - specNum(b),
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
    }[state.sort] ?? (() => 0);
    list = [...list].sort(by);

    const total = d.products.length;
    $('#results-count').textContent = list.length === total ? `${total} products` : `${list.length} of ${total} products`;
    $('#clear').hidden = !(state.q || state.cat !== 'all');

    const sel = compare.ids();
    $('#list').innerHTML = list.length ? list.map((x) => {
      const specs = (x.specs[0]?.items ?? []).slice(1, 3);
      return `<li class="item">
        <a class="item-swatch" href="product.html?id=${x.id}" tabindex="-1" aria-hidden="true"><img class="photo" src="${x.images[0].src}" alt="" loading="lazy"></a>
        <div class="item-main">
          <span class="item-cat">${mark(categoryOf(d, x.category).label)}</span>
          <a class="item-name" href="product.html?id=${x.id}">${mark(x.name)}</a>
          <p class="item-summary">${mark(x.summary)}</p>
          <ul class="item-specs">${specs.map((s) => `<li><span>${esc(s.label)}</span>${esc(s.value)} ${esc(s.unit)}</li>`).join('')}</ul>
        </div>
        <div class="item-side">
          <span class="num item-key">${typeof x.keySpec.value === 'number' ? numDE(x.keySpec.value) : ''}<small>${esc(x.keySpec.unit || x.keySpec.value)}</small></span>
          ${priceHTML(x)}
          <label class="cmp-toggle"><input type="checkbox" data-cmp="${x.id}"${sel.includes(x.id) ? ' checked' : ''}> Compare</label>
        </div>
      </li>`;
    }).join('') : `<li class="empty"><h2>Nothing matches “${esc(state.q)}”${state.cat !== 'all' ? ` in ${esc(categoryOf(d, state.cat).plural.toLowerCase())}` : ''}</h2><p class="flush">Try a product name like ARC, a unit like kWh, or a roof type like tile.</p><button class="btn btn--line" type="button" data-reset>Show all equipment</button></li>`;

    const q = new URLSearchParams();
    if (state.q) q.set('q', state.q);
    if (state.cat !== 'all') q.set('cat', state.cat);
    if (state.sort !== 'catalog') q.set('sort', state.sort);
    history.replaceState(null, '', 'equipment.html' + (q.toString() ? '?' + q : ''));
  }

  const reset = () => { state.q = ''; state.cat = 'all'; $('#q').value = ''; render(); $('#q').focus(); };
  $('#q').addEventListener('input', (e) => { state.q = e.target.value; render(); });
  $('#cats').addEventListener('change', (e) => { state.cat = e.target.value; render(); $(`#cat-${state.cat}`).focus(); });
  $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
  $('#clear').addEventListener('click', reset);
  $('#list').addEventListener('click', (e) => { if (e.target.closest('[data-reset]')) reset(); });
  $('#list').addEventListener('change', (e) => {
    const box = e.target.closest('[data-cmp]');
    if (!box) return;
    const r = toggleCompare(d, box.dataset.cmp, box.checked);
    if (!r.ok) { box.checked = false; bar.flash(r.msg); }
  });
  document.addEventListener('sf:compare', () => {
    const ids = compare.ids();
    $$('[data-cmp]').forEach((b) => { b.checked = ids.includes(b.dataset.cmp); });
  });
  render();
}
