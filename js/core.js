// Shared runtime: data, local state, chrome, price gate.
// Every product, spec and price on the site comes from data/solarfield_demo_data.json.

document.documentElement.classList.add('js');

let dataPromise;
export function loadData() {
  dataPromise ??= fetch('data/solarfield_demo_data.json').then((r) => {
    if (!r.ok) throw new Error(`Could not load catalog data (${r.status})`);
    return r.json();
  });
  return dataPromise;
}

/* ---------- storage (local, per browser; every access guarded) ---------- */
const KEY = 'solarfield.v1.';
function read(name, fallback) {
  try { const v = localStorage.getItem(KEY + name); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function write(name, value) {
  try { localStorage.setItem(KEY + name, JSON.stringify(value)); } catch { /* storage blocked: state lives for this page only */ }
}

export const session = {
  get: () => read('session', null),
  signIn(user) { write('session', user); emit('session'); },
  signOut() { write('session', null); emit('session'); },
};

export const cart = {
  items: () => read('cart', []),
  count: () => cart.items().reduce((n, i) => n + i.qty, 0),
  add(id, qty = 1) {
    const items = cart.items();
    const line = items.find((i) => i.id === id);
    if (line) line.qty = Math.min(999, line.qty + qty); else items.push({ id, qty });
    write('cart', items); emit('cart');
  },
  set(id, qty) {
    let items = cart.items();
    items = qty > 0 ? items.map((i) => (i.id === id ? { ...i, qty: Math.min(999, qty) } : i)) : items.filter((i) => i.id !== id);
    write('cart', items); emit('cart');
  },
  clear() { write('cart', []); emit('cart'); },
};

export const compare = {
  ids: () => read('compare', []),
  set(ids) { write('compare', ids.slice(0, 3)); emit('compare'); },
};

export const records = {
  add(kind, rec) { const list = read(kind, []); list.push(rec); write(kind, list); return rec; },
};

function emit(what) { document.dispatchEvent(new CustomEvent('sf:' + what)); }

/* ---------- helpers ---------- */
const eur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
export const money = (n) => eur.format(n);
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const params = () => new URLSearchParams(location.search);
export const here = () => location.pathname.split('/').pop() + location.search;

export function categoryOf(data, id) { return data.categories.find((c) => c.id === id); }
export function productById(data, id) { return data.products.find((p) => p.id === id); }
export function keySpecText(p) {
  return p.keySpec.unit ? `${String(p.keySpec.value).replace('.', ',')} ${p.keySpec.unit}` : p.keySpec.value;
}
export function numDE(v) { return String(v).replace(/(\d)\.(\d)/g, '$1,$2'); }
/** Format a row of numbers to the same number of decimals, German style. */
export function rowFormatter(values) {
  const dp = Math.max(0, ...values.map((v) => (String(v).split('.')[1] ?? '').length));
  return (v) => (typeof v === 'number' ? v.toLocaleString('de-DE', { minimumFractionDigits: dp, maximumFractionDigits: dp, useGrouping: false }) : numDE(v));
}

export const icons = {
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg>',
};

/** Price, or the sign-in gate. The single place that decides whether a price is shown. */
export function priceHTML(p, { qty = 1, gateLabel = 'Sign in to see price' } = {}) {
  if (session.get()) return `<span class="price">${money(p.price * qty)}</span>`;
  return `<a class="lock" href="sign-in.html?next=${encodeURIComponent(here())}">${icons.lock}${esc(gateLabel)}</a>`;
}

/* ---------- chrome ---------- */
const NAV = [
  ['equipment.html', 'Equipment'],
  ['projects.html', 'Projects'],
  ['how-it-works.html', 'How it works'],
  ['about.html', 'About'],
  ['contact.html', 'Contact'],
];

function headerHTML(active) {
  const s = session.get();
  const n = cart.count();
  const acct = s
    ? `<span class="account-chip"><span class="dot" aria-hidden="true"></span>${esc(s.name.split(' ')[0])}</span> <button class="textbtn link" data-signout type="button">Sign out</button>`
    : `<a href="sign-in.html?next=${encodeURIComponent(here())}">Sign in</a>`;
  return `
  <a class="skip" href="#main">Skip to content</a>
  <div class="demo-strip"><div class="wrap"><span>Demo site. Products, prices and case studies are fictional; sign-in and checkout are simulated.</span><a href="about.html#demo">What this demo does</a></div></div>
  <header class="site-header">
    <div class="wrap">
      <a class="wordmark" href="index.html" aria-label="SOLARFIELD home">SOLARFIELD</a>
      <nav class="nav" id="site-nav" aria-label="Main">
        ${NAV.map(([href, label]) => `<a href="${href}"${href === active ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
        <a class="nav-account" href="${s ? 'cart.html' : `sign-in.html?next=${encodeURIComponent(here())}`}">${s ? `Signed in as ${esc(s.name)}` : 'Sign in'}</a>
      </nav>
      <div class="tools">
        <span class="account-link">${acct}</span>
        <a class="cart-link" href="cart.html">Cart <span class="cart-count${n ? ' has' : ''}" aria-label="${n} items">${n}</span></a>
        <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
      </div>
    </div>
  </header>`;
}

function footerHTML(data) {
  return `
  <footer class="site-footer">
    <div class="wrap grid">
      <div class="foot-brand">
        <span class="wordmark">SOLARFIELD</span>
        <p>Good energy, no guesswork</p>
        <p class="muted">Solar equipment for German homeowners, installers and small commercial buyers.</p>
      </div>
      <nav class="foot-nav" aria-label="Footer">
        ${NAV.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}
        <a href="cart.html">Cart</a>
      </nav>
      <div class="foot-note">
        <p>${esc(data?.meta.dataStatus ?? '')}</p>
        <p>Photographs are openly licensed from Wikimedia Commons and show other products and buildings. <a class="link" href="about.html#credits">Photo credits</a></p>
      </div>
    </div>
  </footer>`;
}

export async function mountChrome(active) {
  const top = document.createElement('div');
  top.innerHTML = headerHTML(active);
  document.body.prepend(...top.childNodes);
  const data = await loadData().catch(() => null);
  document.body.insertAdjacentHTML('beforeend', footerHTML(data));

  const btn = $('.menu-btn');
  btn.addEventListener('click', () => {
    const open = $('#site-nav').classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    btn.textContent = open ? 'Close' : 'Menu';
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-signout]')) { session.signOut(); location.reload(); }
  });
  document.addEventListener('sf:cart', () => {
    const el = $('.cart-count'); const n = cart.count();
    el.textContent = n; el.classList.toggle('has', n > 0); el.setAttribute('aria-label', `${n} items`);
    el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick');
  });
  return data;
}

export function fail(main, err) {
  main.innerHTML = `<div class="wrap section"><div class="empty"><h2>The catalog didn't load</h2><p>${esc(err.message)}. Serve the folder over HTTP (for example <code>python3 -m http.server</code>) rather than opening the file directly, then reload.</p></div></div>`;
}
