import { mountChrome, esc, $, params, session } from './core.js';
import { fieldHTML, validate } from './forms.js';

await mountChrome('');
// only allow relative, same-site return paths
const raw = params().get('next') ?? '';
const next = /^[a-z0-9-]+\.html(\?[^#]*)?$/i.test(raw) && !raw.startsWith('sign-in') ? raw : 'equipment.html';
const s = session.get();

$('#signin').innerHTML = s ? `
  <div class="form-main success">
    <h2 class="h2">You're signed in as ${esc(s.name)}</h2>
    <p class="flush">Prices are visible across the catalog. Signing out hides them again.</p>
    <div class="cta-row"><a class="btn" href="${esc(next)}">Continue</a><button class="btn btn--line" type="button" data-signout>Sign out</button></div>
  </div>` : `
  <div class="form-main">
    <form id="form" novalidate>
      <div class="form-error" id="summary" tabindex="-1" hidden></div>
      <div class="form-grid">
        ${fieldHTML({ name: 'name', label: 'Name', type: 'text', required: true, autocomplete: 'name' })}
        ${fieldHTML({ name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email' })}
        ${fieldHTML({ name: 'type', label: 'You buy as', type: 'radio', required: true, options: ['Homeowner', 'Installer', 'Small commercial'] })}
        <div class="full cta-row"><button class="btn" type="submit">Sign in</button><button class="textbtn link" type="button" id="demo">Fill in a demo installer</button></div>
      </div>
    </form>
  </div>
  <aside class="form-aside">
    <div class="aside-plate">
      <h2 class="h3">Why prices are behind sign-in</h2>
      <p>Vendor prices change, and installers and homeowners are often quoted differently. Signing in is how the real site would show you the right price list.</p>
      <p class="small muted">Here it unlocks the demo prices from the catalog file. Nothing is checked or sent.</p>
    </div>
    <div class="aside-plate">
      <h2 class="h3">Don't want an account?</h2>
      <p>A quote request works without one, and the reply includes prices.</p>
      <p><a class="link" href="contact.html">Request a quote instead</a></p>
    </div>
  </aside>`;

const form = $('#form');
if (form) {
  $('#demo').addEventListener('click', () => {
    form.elements.namedItem('name').value = 'Anna Weber'; form.elements.namedItem('email').value = 'anna.weber@example.de';
    form.querySelector('input[value="Installer"]').checked = true;
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate(form, $('#summary'))) return;
    const fd = new FormData(form);
    session.signIn({ name: fd.get('name').trim(), email: fd.get('email').trim(), type: fd.get('type') });
    location.href = next;
  });
}
