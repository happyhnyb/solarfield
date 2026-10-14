import { mountChrome, fail, esc, $, $$, session, cart, money, priceHTML, productById, keySpecText } from './core.js';

const data = await mountChrome('projects.html');
if (!data) fail($('#main'), new Error('Catalog data unavailable'));
else init(data);

function init(d) {
  const signedIn = !!session.get();
  const credit = (src) => d.photoCredits.find((c) => c.file === src);

  $('#studies').innerHTML = d.caseStudies.map((s, i) => {
    const lines = s.equipment.map((e) => ({ ...e, p: productById(d, e.id) })).filter((l) => l.p);
    const total = lines.reduce((n, l) => n + l.p.price * l.qty, 0);
    const c = credit(s.image);
    return `
    <article class="study ${i % 2 ? 'study-b' : 'study-a'}" id="${s.id}" aria-labelledby="${s.id}-h">
      <div class="wrap grid">
        <figure class="study-photo">
          <div class="img-frame"><img class="photo" src="${s.image}" alt="" loading="${i ? 'lazy' : 'eager'}"></div>
          <figcaption class="fig-cap"><span>${esc(s.imageNote)}</span>${c ? `<span>${esc(c.author)}, ${esc(c.license)}</span>` : ''}</figcaption>
        </figure>
        <div class="study-head">
          <span class="fiction">Fictional case study</span>
          <h2 class="h2" id="${s.id}-h">${esc(s.title)}</h2>
          <p class="small muted flush">${esc(s.customerType)}. ${esc(s.place)}.</p>
          <p class="flush">${esc(s.brief)}</p>
        </div>
        <div class="study-roof">
          <dl>
            <dt>Roof face</dt><dd>${esc(s.roof.face)}</dd>
            <dt>Usable area</dt><dd>${esc(s.roof.usable)}</dd>
            <dt>Covering</dt><dd>${esc(s.roof.covering)}</dd>
            <dt>Goal</dt><dd class="goal">${esc(s.goal)}</dd>
          </dl>
        </div>
        <div class="study-detail">
          <div class="decisions">
            <h3 class="h3">How the list was narrowed</h3>
            <ol>${s.decisions.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
          </div>
          <div class="kit">
            <h3 class="h3">Equipment list</h3>
            <div class="table-frame kit-frame"><table class="spec-table">
              <caption class="visually-hidden">Equipment for ${esc(s.title)}</caption>
              <thead><tr><th scope="col">Product</th><th scope="col">Qty</th><th scope="col">Spec</th><th scope="col">Line</th></tr></thead>
              <tbody>${lines.map((l) => `<tr><th scope="row"><a href="product.html?id=${l.id}">${esc(l.p.name)}</a></th><td>${l.qty}</td><td>${esc(keySpecText(l.p))}</td><td>${priceHTML(l.p, { qty: l.qty, gateLabel: 'Sign in' })}</td></tr>`).join('')}
              ${signedIn ? `<tr class="sum"><th scope="row">Demo total</th><td></td><td></td><td><span class="price">${money(total)}</span></td></tr>` : ''}</tbody>
            </table></div>
            <div class="cta-row kit-actions">
              ${signedIn ? `<button class="btn" type="button" data-load="${s.id}">Add this list to cart</button>` : ''}
              <a class="btn ${signedIn ? 'btn--line' : ''}" href="contact.html?products=${lines.map((l) => l.id).join(',')}&message=${encodeURIComponent(`Similar to the "${s.title}" example.`)}">Request a quote for a similar list</a>
            </div>
            <p class="status" role="status" data-status="${s.id}"></p>
          </div>
          <div class="study-foot"><p>${esc(s.installerNote)}</p><p>${esc(s.notMeasured)}</p></div>
        </div>
      </div>
    </article>`;
  }).join('');

  $$('[data-load]').forEach((b) => b.addEventListener('click', () => {
    const s = d.caseStudies.find((x) => x.id === b.dataset.load);
    s.equipment.forEach((e) => cart.add(e.id, e.qty));
    const n = s.equipment.reduce((a, e) => a + e.qty, 0);
    $(`[data-status="${s.id}"]`).innerHTML = `Added ${n} items to your cart. <a class="link" href="cart.html">Review the cart</a>`;
  }));
}
