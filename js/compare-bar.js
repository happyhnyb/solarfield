import { compare, productById, categoryOf, esc, $ } from './core.js';

// Comparison selection, shared by the catalog and product pages.
// Rules: one category at a time, at most three products.
export function toggleCompare(data, id, on) {
  const ids = compare.ids();
  const p = productById(data, id);
  if (!on) { compare.set(ids.filter((x) => x !== id)); return { ok: true }; }
  if (ids.includes(id)) return { ok: true };
  const first = ids.length && productById(data, ids[0]);
  if (first && first.category !== p.category) {
    return { ok: false, msg: `Comparison works within one category. Clear your ${categoryOf(data, first.category).plural.toLowerCase()} first to compare ${categoryOf(data, p.category).plural.toLowerCase()}.` };
  }
  if (ids.length >= 3) return { ok: false, msg: 'You can compare up to three products. Remove one first.' };
  compare.set([...ids, id]);
  return { ok: true };
}

export function mountCompareBar(data) {
  const bar = $('#compare-bar');
  let msg = '';
  const render = () => {
    const ids = compare.ids().filter((id) => productById(data, id));
    bar.classList.toggle('show', ids.length > 0 || !!msg);
    const names = ids.map((id) => productById(data, id).name);
    bar.innerHTML = `<div class="wrap">
      <span>${ids.length ? `Comparing <strong>${names.map(esc).join(', ')}</strong>` : ''}${msg ? ` <span class="msg">${esc(msg)}</span>` : ''}</span>
      <span class="cta-row">
        ${ids.length ? '<button class="textbtn" type="button" data-clear-compare>Clear</button>' : ''}
        ${ids.length >= 2 ? `<a class="btn" href="compare.html?ids=${ids.join(',')}">Compare ${ids.length}</a>` : ids.length === 1 ? '<span class="small">Pick one more to compare</span>' : ''}
      </span></div>`;
  };
  bar.addEventListener('click', (e) => {
    if (e.target.closest('[data-clear-compare]')) { msg = ''; compare.set([]); }
  });
  document.addEventListener('sf:compare', () => { render(); });
  render();
  return { flash(m) { msg = m; render(); clearTimeout(this.t); this.t = setTimeout(() => { msg = ''; render(); }, 5000); } };
}
