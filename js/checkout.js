import { mountChrome, fail, esc, $, session, cart, money, records, productById, here } from './core.js';
import { fieldHTML, validate, ref } from './forms.js';

const data = await mountChrome('cart.html');
if (!data) fail($('#main'), new Error('Catalog data unavailable'));
else init(data);

function init(d) {
  const s = session.get();
  const lines = cart.items().map((i) => ({ ...i, p: productById(d, i.id) })).filter((l) => l.p);
  if (!s) {
    $('#checkout').innerHTML = `<div class="form-main empty"><h2>Sign in to check out</h2><p class="flush">Checkout needs prices, and prices need an account.</p><a class="btn" href="sign-in.html?next=${encodeURIComponent(here())}">Sign in</a></div>`;
    return;
  }
  if (!lines.length) {
    $('#checkout').innerHTML = `<div class="form-main empty"><h2>There's nothing to check out</h2><p class="flush">Your cart is empty.</p><a class="btn" href="equipment.html">Browse equipment</a></div>`;
    return;
  }
  const total = lines.reduce((n, l) => n + l.p.price * l.qty, 0);
  const F = (o, v) => fieldHTML(o, v);

  $('#checkout').innerHTML = `
    <div class="form-main">
      <form id="form" novalidate>
        <div class="form-error" id="summary" tabindex="-1" hidden></div>
        <div class="form-grid">
          <div class="form-section"><h2 class="h3">Contact</h2></div>
          ${F({ name: 'name', label: 'Name', type: 'text', required: true, autocomplete: 'name' }, s.name)}
          ${F({ name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email' }, s.email)}
          ${F({ name: 'company', label: 'Company', type: 'text', required: s.type !== 'Homeowner', autocomplete: 'organization' })}
          ${F({ name: 'phone', label: 'Phone for delivery', type: 'tel', required: true, autocomplete: 'tel', hint: 'The carrier calls ahead for pallet deliveries.' })}
          <div class="form-section"><h2 class="h3">Delivery</h2></div>
          ${F({ name: 'deliverTo', label: 'Deliver to', type: 'radio', required: true, options: ['My address', 'My installer'] }, 'My address')}
          ${F({ name: 'street', label: 'Street and number', type: 'text', required: true, autocomplete: 'street-address' })}
          ${F({ name: 'postcode', label: 'Postcode', type: 'text', required: true, pattern: '[0-9]{5}', autocomplete: 'postal-code' })}
          ${F({ name: 'city', label: 'Town or city', type: 'text', required: true, autocomplete: 'address-level2' })}
          ${F({ name: 'access', label: 'Access notes', type: 'text', required: false, hint: 'For example: narrow street, no forklift on site.' })}
          <div class="form-section"><h2 class="h3">Payment</h2></div>
          ${F({ name: 'payment', label: 'How you would pay', type: 'radio', required: true, options: ['Invoice after lead times are confirmed', 'Bank transfer in advance'] })}
          <p class="full small muted flush">No card or bank details are collected. In a real order, payment would only be requested once every vendor has confirmed a lead time.</p>
          <div class="form-section">${F({ name: 'consent', label: 'I understand this is a simulation: no order is placed and nothing is paid.', type: 'checkbox', required: true })}</div>
          <div class="full"><button class="btn" type="submit">Place demo order</button></div>
        </div>
      </form>
    </div>
    <aside class="form-aside" aria-label="Order summary">
      <div class="totals">
        ${lines.map((l) => `<div><span>${l.qty} × ${esc(l.p.name)}</span><span class="price">${money(l.p.price * l.qty)}</span></div>`).join('')}
        <div><span>Delivery</span><span class="small muted">Quoted with lead time</span></div>
        <div class="grand"><span>Demo total</span><span class="price">${money(total)}</span></div>
      </div>
      <p class="small muted flush">${esc(d.meta.sourcingNote)}</p>
      <a class="link small" href="cart.html">Change the cart</a>
    </aside>`;

  const form = $('#form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate(form, $('#summary'))) return;
    const fd = Object.fromEntries(new FormData(form));
    const order = records.add('orders', { ref: ref('SF-DEMO'), at: new Date().toISOString(), lines: lines.map(({ id, qty }) => ({ id, qty })), total, ...fd });
    cart.clear();
    $('#checkout').innerHTML = `
      <div class="form-main success" tabindex="-1" id="done">
        <h2 class="h2">Demo order placed</h2>
        <p class="flush body-copy">Nothing was charged and nothing was sent to a vendor. In the real process, you would now get an email listing each item's confirmed lead time before any payment is due.</p>
        <dl class="summary-dl">
          <dt>Reference</dt><dd>${order.ref}</dd>
          ${lines.map((l) => `<dt>${esc(l.p.name)}</dt><dd>${l.qty} × ${money(l.p.price)}</dd>`).join('')}
          <dt>Demo total</dt><dd>${money(total)}</dd>
          <dt>Deliver to</dt><dd>${esc(fd.street)}, ${esc(fd.postcode)} ${esc(fd.city)}${fd.deliverTo === 'My installer' ? ' (installer)' : ''}</dd>
          <dt>Payment</dt><dd>${esc(fd.payment)}</dd>
        </dl>
        <div class="cta-row"><a class="btn" href="how-it-works.html">See what happens next</a><a class="btn btn--line" href="equipment.html">Back to equipment</a></div>
      </div>`;
    $('#done').focus();
    window.scrollTo({ top: 0 });
  });
}
