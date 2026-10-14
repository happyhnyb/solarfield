import { mountChrome, fail, esc, $, params, session, records, productById, categoryOf, numDE } from './core.js';
import { fieldHTML, validate, ref } from './forms.js';
import { fitModules } from './fit.js';

const data = await mountChrome('contact.html');
if (!data) fail($('#main'), new Error('Catalog data unavailable'));
else init(data);

function init(d) {
  const p = params();
  const s = session.get();
  const pre = {
    name: s?.name ?? '', email: s?.email ?? '', customerType: s?.type ?? '',
    roofLength: p.get('roofLength') ?? '', roofWidth: p.get('roofWidth') ?? '',
    postcode: p.get('postcode') ?? '', powerGoal: p.get('powerGoal') ?? '',
    message: p.get('message') ?? '',
    products: [...(p.get('products') ?? '').split(','), p.get('product')].filter((id) => id && productById(d, id)),
  };
  const sections = [
    ['About you', ['name', 'email', 'phone', 'customerType']],
    ['The roof', ['postcode', 'roofType', 'roofLength', 'roofWidth', 'orientation', 'powerGoal', 'storage']],
    ['Equipment', ['products', 'message']],
  ];
  const fields = Object.fromEntries(d.enquiry.fields.map((f) => [f.name, f]));
  const products = d.products.map((x) => ({ id: x.id, name: x.name, label: categoryOf(d, x.category).label }));

  $('#enquiry').innerHTML = `
    <div class="form-main">
      <form id="form" novalidate>
        <div class="form-error" id="summary" tabindex="-1" hidden></div>
        <div class="form-grid">
          ${sections.map(([title, names]) => `<div class="form-section"><h2 class="h3">${title}</h2></div>${names.map((n) => fieldHTML(fields[n], pre[n], { products })).join('')}`).join('')}
          <div class="form-section">${fieldHTML(fields.consent)}</div>
          <div class="full"><button class="btn" type="submit">Send enquiry</button> <span class="small muted">No account needed.</span></div>
        </div>
      </form>
    </div>
    <aside class="form-aside" aria-label="About this enquiry">
      <div class="aside-plate" id="fit" aria-live="polite"></div>
      <div class="aside-plate">
        <h2 class="h3">What happens next</h2>
        ${d.process.slice(0, 2).map((x) => `<p><strong>${esc(x.title)}.</strong> ${esc(x.body)}</p>`).join('')}
        <p class="small muted">${esc(d.process[0].caveat)}</p>
      </div>
    </aside>`;

  const form = $('#form');
  const arcs = ['arc-430', 'arc-455'].map((id) => productById(d, id));
  const fit = () => {
    const L = parseFloat(form.roofLength.value); const H = parseFloat(form.roofWidth.value);
    if (!(L > 0 && H > 0)) {
      $('#fit').innerHTML = '<h2 class="h3">Rough fit</h2><p class="small muted">Enter the roof face length and height to see roughly how many modules fit, using the dimensions in the catalog.</p>';
      return;
    }
    $('#fit').innerHTML = `<h2 class="h3">Rough fit on ${numDE(L)} × ${numDE(H)} m</h2>
      <div class="table-frame"><table class="spec-table"><thead><tr><th scope="col">Module</th><th scope="col">Layout</th><th scope="col">Power</th></tr></thead>
      <tbody>${arcs.map((a) => { const f = fitModules(L, H, a); return `<tr><th scope="row">${esc(a.name)}</th><td>${f.rows} × ${f.cols}</td><td>${numDE(f.kwp.toFixed(1))}<span class="u">kWp</span></td></tr>`; }).join('')}</tbody></table></div>
      <p class="small muted">Portrait, 0.2 m edge clearance, no chimneys or vents. Your installer's layout decides the real number.</p>`;
  };
  form.addEventListener('input', (e) => { if (['roofLength', 'roofWidth'].includes(e.target.name)) fit(); });
  fit();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate(form, $('#summary'))) return;
    const fd = new FormData(form);
    const rec = { ref: ref('SF-ENQ'), at: new Date().toISOString() };
    for (const f of d.enquiry.fields) rec[f.name] = f.type === 'products' ? fd.getAll(f.name) : fd.get(f.name) ?? '';
    records.add('enquiries', rec);
    const show = d.enquiry.fields.filter((f) => f.type !== 'checkbox' && (Array.isArray(rec[f.name]) ? rec[f.name].length : rec[f.name]));
    const val = (f) => (f.type === 'products' ? rec[f.name].map((id) => productById(d, id).name).join(', ') : `${rec[f.name]}${f.unit ? ` ${f.unit}` : ''}`);
    $('.form-main').innerHTML = `
      <div class="success" tabindex="-1" id="done">
        <h2 class="h2">${esc(d.enquiry.success.title)}</h2>
        <p class="flush body-copy">${esc(d.enquiry.success.body)}</p>
        <dl class="summary-dl"><dt>Reference</dt><dd>${rec.ref}</dd>${show.map((f) => `<dt>${esc(f.label)}</dt><dd>${esc(val(f))}</dd>`).join('')}</dl>
        <div class="cta-row"><a class="btn" href="equipment.html">Browse equipment</a><a class="btn btn--line" href="contact.html">Send another enquiry</a></div>
      </div>`;
    $('#done').focus();
    window.scrollTo({ top: 0 });
  });
}
