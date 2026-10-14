import { mountChrome, fail, esc, $, params, compare, priceHTML, categoryOf, productById, rowFormatter } from './core.js';

const data = await mountChrome('equipment.html');
if (!data) fail($('#main'), new Error('Catalog data unavailable'));
else init(data);

function init(d) {
  // URL wins (shareable); otherwise use the stored selection
  let ids = (params().get('ids') ?? '').split(',').filter((id) => productById(d, id));
  if (!ids.length) ids = compare.ids().filter((id) => productById(d, id));
  const cat0 = ids.length && productById(d, ids[0]).category;
  const dropped = ids.filter((id) => productById(d, id).category !== cat0);
  ids = ids.filter((id) => productById(d, id).category === cat0).slice(0, 3);
  compare.set(ids);

  const render = () => {
    const items = ids.map((id) => productById(d, id));
    history.replaceState(null, '', 'compare.html' + (ids.length ? `?ids=${ids.join(',')}` : ''));
    if (!items.length) {
      $('#compare').innerHTML = `<div class="empty"><h2>Nothing to compare yet</h2><p class="flush">Tick “Compare” on up to three products from one category in the catalog.</p><div class="cta-row"><a class="btn" href="equipment.html">Choose products</a><a class="btn btn--line" href="compare.html?ids=arc-430,arc-455,grid-585">Compare all three panels</a></div></div>`;
      return;
    }
    const cat = categoryOf(d, items[0].category);
    const fields = d.compareFields[cat.id];
    const others = d.products.filter((x) => x.category === cat.id && !ids.includes(x.id));
    const best = (f) => (f.better && items.length > 1 ? (f.better === 'high' ? Math.max : Math.min)(...items.map((x) => x.compare[f.key])) : null);
    $('#compare').innerHTML = `
      ${dropped.length ? `<p class="form-error">Only one category can be compared at a time, so ${dropped.map((id) => esc(productById(d, id).name)).join(', ')} ${dropped.length > 1 ? 'were' : 'was'} left out.</p>` : ''}
      <div class="results-bar"><p class="flush">${items.length} ${esc(cat.plural.toLowerCase())}${items.length === 1 ? '. Add another to see differences.' : ''}</p>
        ${others.length && items.length < 3 ? `<span class="cta-row small">Add: ${others.map((x) => `<button class="textbtn link" type="button" data-add="${x.id}">${esc(x.name)}</button>`).join(' ')}</span>` : ''}</div>
      <div class="table-frame"><table class="spec-table compare-table">
        <caption class="visually-hidden">${esc(cat.plural)} compared</caption>
        <thead><tr><th class="sticky" scope="col"><span class="visually-hidden">Specification</span></th>${items.map((x) => `<th scope="col"><a href="product.html?id=${x.id}">${esc(x.name)}</a><br><button class="textbtn link small" type="button" data-remove="${x.id}" aria-label="Remove ${esc(x.name)} from comparison">Remove</button></th>`).join('')}</tr></thead>
        <tbody>
          ${fields.map((f) => { const b = best(f); const fmt = rowFormatter(items.map((x) => x.compare[f.key])); return `<tr><th class="sticky" scope="row">${esc(f.label)}${f.better ? `<span class="small muted"> (${f.better === 'high' ? 'higher' : 'lower'} is better)</span>` : ''}</th>${items.map((x) => `<td${b !== null && x.compare[f.key] === b ? ' class="best"' : ''}>${fmt(x.compare[f.key])}<span class="u">${esc(f.unit)}</span></td>`).join('')}</tr>`; }).join('')}
          <tr><th class="sticky" scope="row">Price per unit</th>${items.map((x) => `<td>${priceHTML(x)}</td>`).join('')}</tr>
        </tbody>
      </table></div>
      <p class="small muted table-note">Values are copied from each product's data. Copper marks the best value where a direction is clear; it does not account for roof fit or budget.</p>`;
  };

  $('#compare').addEventListener('click', (e) => {
    const rm = e.target.closest('[data-remove]'); const add = e.target.closest('[data-add]');
    if (rm) ids = ids.filter((id) => id !== rm.dataset.remove);
    else if (add) ids = [...ids, add.dataset.add].slice(0, 3);
    else return;
    compare.set(ids); render();
  });
  render();
}
