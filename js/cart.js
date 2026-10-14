import { mountChrome, fail, esc, $, session, cart, money, priceHTML, productById, categoryOf, keySpecText, here, icons } from './core.js';

const data = await mountChrome('cart.html');
if (!data) fail($('#main'), new Error('Catalog data unavailable'));
else {
  render();
  document.addEventListener('sf:cart', render);
  $('#cart').addEventListener('click', (e) => {
    const b = e.target.closest('[data-id]');
    if (!b) return;
    const line = cart.items().find((i) => i.id === b.dataset.id);
    if (!line) return;
    if (b.dataset.act === 'remove') cart.set(line.id, 0);
    else cart.set(line.id, Math.max(1, line.qty + +b.dataset.act));
  });
  $('#cart').addEventListener('change', (e) => {
    const inp = e.target.closest('input[data-qty]');
    if (inp) cart.set(inp.dataset.qty, Math.max(1, parseInt(inp.value, 10) || 1));
  });
}

function render() {
  const d = data;
  const signedIn = !!session.get();
  const lines = cart.items().map((i) => ({ ...i, p: productById(d, i.id) })).filter((l) => l.p);
  if (!lines.length) {
    $('#cart').innerHTML = `<div class="form-main empty"><h2>Your cart is empty</h2><p class="flush">${signedIn ? 'Add products from the catalog, or load a whole equipment list from one of the example projects.' : 'Sign in to add products with prices, or request a quote without an account.'}</p><div class="cta-row"><a class="btn" href="equipment.html">Browse equipment</a><a class="btn btn--line" href="${signedIn ? 'projects.html' : 'contact.html'}">${signedIn ? 'See example projects' : 'Request a quote'}</a></div></div>`;
    return;
  }
  const subtotal = lines.reduce((n, l) => n + l.p.price * l.qty, 0);
  const focusId = document.activeElement?.dataset?.id ?? document.activeElement?.dataset?.qty;
  const focusAct = document.activeElement?.dataset?.act;
  $('#cart').innerHTML = `
    <div class="form-main">
      <ul class="cart-lines">${lines.map((l) => `
        <li class="cart-line">
          <a class="item-swatch" href="product.html?id=${l.id}" tabindex="-1" aria-hidden="true"><img class="photo" src="${l.p.images[0].src}" alt=""></a>
          <div class="item-main">
            <span class="item-cat">${esc(categoryOf(d, l.p.category).label)}</span>
            <a class="item-name" href="product.html?id=${l.id}">${esc(l.p.name)}</a>
            <span class="val muted">${esc(keySpecText(l.p))}${signedIn ? `, ${money(l.p.price)} each` : ''}</span>
            <button class="textbtn link small remove" type="button" data-id="${l.id}" data-act="remove">Remove</button>
          </div>
          <div class="qty" role="group" aria-label="Quantity of ${esc(l.p.name)}">
            <button type="button" data-id="${l.id}" data-act="-1" aria-label="One fewer ${esc(l.p.name)}"${l.qty <= 1 ? ' disabled' : ''}>−</button>
            <input type="number" min="1" max="999" inputmode="numeric" value="${l.qty}" data-qty="${l.id}" aria-label="Quantity of ${esc(l.p.name)}">
            <button type="button" data-id="${l.id}" data-act="1" aria-label="One more ${esc(l.p.name)}">+</button>
          </div>
          <span class="line-total">${priceHTML(l.p, { qty: l.qty, gateLabel: 'Sign in' })}</span>
        </li>`).join('')}
      </ul>
    </div>
    <aside class="form-aside" aria-label="Order summary">
      <div class="totals">
        <div><span>Subtotal, ${lines.reduce((n, l) => n + l.qty, 0)} items</span>${signedIn ? `<span class="price">${money(subtotal)}</span>` : `<span class="lock">${icons.lock}Hidden</span>`}</div>
        <div><span>Delivery</span><span class="small muted">Quoted with the lead time</span></div>
        <div class="grand"><span>Demo total</span>${signedIn ? `<span class="price">${money(subtotal)}</span>` : '<span class="small muted">After sign-in</span>'}</div>
      </div>
      ${signedIn ? '<a class="btn btn--block" href="checkout.html">Go to checkout</a>' : `<a class="btn btn--block" href="sign-in.html?next=${encodeURIComponent(here())}">Sign in to check out</a>`}
      <a class="btn btn--line btn--block" href="contact.html?products=${lines.map((l) => l.id).join(',')}">Request a quote for this cart</a>
      <p class="small muted flush">${esc(data.meta.sourcingNote)}</p>
      <p class="flush"><button class="textbtn link small" type="button" id="empty-cart">Empty the cart</button></p>
    </aside>`;
  $('#empty-cart').addEventListener('click', () => cart.clear());
  // keep keyboard focus on the control that was just used
  if (focusId) (document.querySelector(`[data-id="${focusId}"][data-act="${focusAct}"]:not([disabled])`) ?? document.querySelector(`[data-qty="${focusId}"]`))?.focus();
}
