import { esc, $$ } from './core.js';

// Render one field from a { name, label, type, ... } description.
export function fieldHTML(f, value = '', extra = {}) {
  const id = `f-${f.name}`;
  const req = f.required ? ' required aria-required="true"' : '';
  const hint = f.hint ? `<span class="hint" id="${id}-hint">${esc(f.hint)}</span>` : '';
  const desc = f.hint ? ` aria-describedby="${id}-hint ${id}-err"` : ` aria-describedby="${id}-err"`;
  const err = `<span class="err" id="${id}-err"></span>`;
  const opt = f.required ? '' : ' <span class="muted small">(optional)</span>';
  const full = ['radio', 'textarea', 'checkbox', 'products'].includes(f.type) || extra.full ? ' full' : '';
  switch (f.type) {
    case 'radio':
      return `<fieldset class="field${full}" id="${id}"${desc}><legend>${esc(f.label)}${opt}</legend><div class="seg">${f.options.map((o, i) => `<input type="radio" name="${f.name}" id="${id}-${i}" value="${esc(o)}"${o === value ? ' checked' : ''}${i === 0 ? req : ''}><label for="${id}-${i}">${esc(o)}</label>`).join('')}</div>${hint}${err}</fieldset>`;
    case 'select':
      return `<div class="field${full}"><label for="${id}">${esc(f.label)}${opt}</label><select class="select" id="${id}" name="${f.name}"${req}${desc}><option value="">Choose one</option>${f.options.map((o) => `<option${o === value ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>${hint}${err}</div>`;
    case 'textarea':
      return `<div class="field${full}"><label for="${id}">${esc(f.label)}${opt}</label><textarea class="textarea" id="${id}" name="${f.name}"${req}${desc}>${esc(value)}</textarea>${hint}${err}</div>`;
    case 'checkbox':
      return `<div class="field${full}"><label class="choice" for="${id}"><input type="checkbox" id="${id}" name="${f.name}" value="yes"${value ? ' checked' : ''}${req}${desc}><span>${esc(f.label)}</span></label>${err}</div>`;
    case 'products':
      return `<fieldset class="field${full}" id="${id}"${desc}><legend>${esc(f.label)}${opt}</legend><div class="choices">${extra.products.map((p) => `<label class="choice"><input type="checkbox" name="${f.name}" value="${p.id}"${(value || []).includes(p.id) ? ' checked' : ''}><span>${esc(p.name)} <span class="muted small">${esc(p.label)}</span></span></label>`).join('')}</div>${hint}${err}</fieldset>`;
    default: {
      const attrs = [f.pattern && `pattern="${f.pattern}"`, f.step && `step="${f.step}"`, f.min && `min="${f.min}"`, f.autocomplete && `autocomplete="${f.autocomplete}"`, f.type === 'number' && 'inputmode="decimal"', f.name === 'postcode' && 'inputmode="numeric" maxlength="5"'].filter(Boolean).join(' ');
      const input = `<input class="input" id="${id}" name="${f.name}" type="${f.type}" value="${esc(value)}" ${attrs}${req}${desc}>`;
      return `<div class="field${full}"><label for="${id}">${esc(f.label)}${opt}</label>${f.unit ? `<div class="unit-input">${input}<span>${esc(f.unit)}</span></div>` : input}${hint}${err}</div>`;
    }
  }
}

const MESSAGES = {
  valueMissing: (l) => `Enter ${l.toLowerCase()}.`,
  typeMismatch: () => 'Enter an email address like name@example.de.',
  patternMismatch: (l, el) => (el.name === 'postcode' ? 'Enter a five-digit German postcode.' : `Check the format of ${l.toLowerCase()}.`),
  rangeUnderflow: (l, el) => `${l} must be at least ${el.min}.`,
  stepMismatch: () => 'Use at most one decimal place.',
  badInput: () => 'Enter a number.',
};

/** Validate with the browser's constraint API, render inline errors and a linked summary. Returns true when valid. */
export function validate(form, summaryEl) {
  const problems = [];
  const seen = new Set();
  for (const el of form.elements) {
    if (!el.name || seen.has(el.name) || el.type === 'submit') continue;
    seen.add(el.name);
    const group = el.type === 'radio' ? el.closest('fieldset') : null;
    const errEl = form.querySelector(`#f-${el.name}-err`);
    let msg = '';
    if (!el.validity.valid) {
      const label = (group ? group.querySelector('legend') : form.querySelector(`label[for="${el.id}"]`))?.textContent.replace('(optional)', '').trim() ?? el.name;
      const key = Object.keys(MESSAGES).find((k) => el.validity[k]);
      msg = el.type === 'checkbox' && el.validity.valueMissing ? 'Tick this box to send the enquiry.'
        : group && el.validity.valueMissing ? `Choose one option for “${label.toLowerCase()}”.`
        : key ? MESSAGES[key](label, el) : el.validationMessage;
      problems.push({ id: group ? group.querySelector('input').id : el.id, msg });
    }
    if (errEl) errEl.textContent = msg;
    (group ? $$('input', group) : [el]).forEach((x) => x.setAttribute('aria-invalid', msg ? 'true' : 'false'));
  }
  if (problems.length) {
    summaryEl.hidden = false;
    summaryEl.innerHTML = `<strong>${problems.length === 1 ? 'One thing needs fixing' : `${problems.length} things need fixing`} before this can be sent:</strong><ul>${problems.map((p) => `<li><a href="#${p.id}">${esc(p.msg)}</a></li>`).join('')}</ul>`;
    summaryEl.focus();
  } else summaryEl.hidden = true;
  return !problems.length;
}

export const ref = (prefix) => `${prefix}-${Date.now().toString(36).slice(-4).toUpperCase()}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;
