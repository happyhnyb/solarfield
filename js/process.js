import { mountChrome, fail, esc, $ } from './core.js';

const data = await mountChrome('how-it-works.html');
if (!data) fail($('#main'), new Error('Catalog data unavailable'));
else {
  const photos = { 1: 'img/roof-plan-street.jpg', 4: 'img/crew-cleaning.jpg' };
  $('#stages').innerHTML = data.process.map((s) => `
    <section class="stage" aria-labelledby="stage-${s.step}">
      <div class="grid">
        <span class="num" aria-hidden="true">${s.step}</span>
        <h2 class="h2" id="stage-${s.step}">${esc(s.title)}</h2>
        <p class="body">${esc(s.body)}</p>
        <div class="caveat"><strong>What this stage does not cover</strong>${esc(s.caveat)}</div>
        ${photos[s.step] ? `<div class="stage-photo img-frame"><img class="photo" src="${photos[s.step]}" alt="" loading="lazy"></div>` : ''}
      </div>
    </section>`).join('');
}
