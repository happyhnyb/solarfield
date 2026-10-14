import { mountChrome, fail, esc, $, icons } from './core.js';

const data = await mountChrome('about.html');
if (!data) fail($('#main'), new Error('Catalog data unavailable'));
else {
  $('#about').innerHTML = `
  <section class="wrap section--bottom">
    <div class="grid about-intro">
      <figure class="about-photo">
        <div class="img-frame"><img class="photo" src="img/roof-plan-street.jpg" alt="Aerial view of a suburban street, many roofs carrying solar arrays of different sizes" loading="lazy"></div>
        <figcaption class="fig-cap"><span>Every roof on a street ends up with a different array. Canberra, Australia.</span><span>Benlisquare, CC BY-SA 4.0</span></figcaption>
      </figure>
      <div class="body-copy about-copy">
        <p>SOLARFIELD is a reseller. We list a short catalog of panels, hybrid inverters, storage and tile-roof mounting, and sell it to homeowners, installers and small commercial buyers in Germany.</p>
        <p>We keep the catalog short on purpose, so every product can be listed with its full specifications and compared against the products it competes with or works with.</p>
        <p>We don't hold stock. When you confirm an order, we buy each item from its vendor and arrange delivery. Installation is done by a qualified installer you appoint, not by us.</p>
      </div>
    </div>
  </section>

  <section class="section--ruled rule section--bottom" aria-labelledby="model-h">
    <div class="wrap">
      <div class="grid sec-head"><h2 class="h2" id="model-h">How an order moves</h2><p class="muted">Three parties, with one responsibility each.</p></div>
      <ol class="model">
        <li><h3 class="h3">You</h3><p>Send roof details or build a cart, then confirm a written equipment list.</p></li>
        <li class="arrow" aria-hidden="true">${icons.arrow}</li>
        <li class="us"><h3 class="h3">SOLARFIELD</h3><p>Suggests equipment, quotes prices and lead times, buys from vendors after you confirm, and arranges delivery.</p></li>
        <li class="arrow" aria-hidden="true">${icons.arrow}</li>
        <li><h3 class="h3">Your installer</h3><p>Checks the roof, designs the strings, fits and commissions the system, and handles grid registration.</p></li>
      </ol>
    </div>
  </section>

  <section class="section--bottom" aria-label="What we do and don't do">
    <div class="wrap grid">
      <div class="dodont">
        <div><h3 class="h3">We do</h3><ul>
          <li>List every product with full specifications</li>
          <li>Suggest equipment for a roof you describe</li>
          <li>Quote a price and lead time for each item, in writing</li>
          <li>Order from vendors after you confirm</li>
          <li>Send datasheets and manuals to you and your installer</li>
        </ul></div>
        <div><h3 class="h3">We don't</h3><ul>
          <li>Keep a warehouse or promise stock</li>
          <li>Install, commission or register systems</li>
          <li>Design string layouts or check roof load</li>
          <li>Publish yield or savings figures we haven't measured</li>
        </ul></div>
      </div>
    </div>
  </section>

  <section class="section--ruled rule section--bottom" id="demo" aria-labelledby="demo-h">
    <div class="wrap grid">
      <div class="sec-head grid-span"><h2 class="h2" id="demo-h">What this demo does</h2><p class="muted">${esc(data.meta.dataStatus)}</p></div>
      <div class="dodont">
        <div><h3 class="h3">Works</h3><ul>
          <li>Catalog search, category filter and sorting</li>
          <li>Comparison of up to three products in one category</li>
          <li>Simulated sign-in that unlocks prices</li>
          <li>Cart with quantities, and a simulated checkout</li>
          <li>Quote requests, with or without signing in</li>
        </ul></div>
        <div><h3 class="h3">Simulated or absent</h3><ul>
          <li>Sign-in accepts any name and email; there are no passwords</li>
          <li>No payment is taken and no payment details are asked for</li>
          <li>Orders and enquiries are stored in this browser only</li>
          <li>Product data, prices and case studies are invented</li>
          <li>Documents are listed but not downloadable</li>
        </ul></div>
      </div>
    </div>
  </section>

  <section class="section--ruled rule section--bottom" id="credits" aria-labelledby="credits-h">
    <div class="wrap">
      <div class="grid sec-head"><h2 class="h2" id="credits-h">Photo credits</h2><p class="muted">All photographs are from Wikimedia Commons. They show other buildings and other manufacturers' equipment, never the listed products.</p></div>
      <ul class="credits">${data.photoCredits.map((c) => `<li><a class="link" href="${esc(c.source)}" rel="noopener">${esc(c.title)}</a><span>${esc(c.author)}</span><span class="mono">${esc(c.license)}</span></li>`).join('')}</ul>
    </div>
  </section>`;
}
