/* ==========================================================================
   URBANMAP — HOMEPAGE
   Složí chrome, nastartuje explorer a vykreslí editorial sekce pod mapou.
   ========================================================================== */
(function (global) {
  'use strict';
  var UM = global.UM, D = global.UM_DATA, C = global.UM_CARDS, $ = UM.$;

  document.getElementById('chrome-header').innerHTML = UM.chrome.header({ active: 'Projekty', compactSearch: true });
  document.getElementById('chrome-footer').innerHTML = UM.chrome.footer();
  UM.chrome.bind();

  global.UM_EXPLORER.init();

  /* --- 02 · vybrané projekty ------------------------------------------- */
  var featured = D.projects.filter(function (p) { return p.featured; }).slice(0, 6);
  $('#featured-grid').innerHTML = featured.map(function (p, i) {
    return C.project(p, { feature: i === 0, depth: 0.8 + (i % 3) * 0.3 });
  }).join('');

  /* --- 03 · lokality ---------------------------------------------------- */
  var locSlugs = ['praha-karlin', 'brno-zidenice', 'spindleruv-mlyn', 'lipno-nad-vltavou', 'praha-vinohrady', 'ostrava'];
  $('#locations-grid').innerHTML = locSlugs.map(function (s) {
    return C.location(D.locationBySlug(s));
  }).join('');

  /* --- 04 · ukázka skóringu -------------------------------------------- */
  var demoLoc = D.locationBySlug('praha-karlin');
  var scores = [
    ['Investiční potenciál', demoLoc.investmentScore, ''],
    ['Infrastruktura', demoLoc.infrastructureScore, ''],
    ['Lifestyle', demoLoc.lifestyleScore, 'score--clay'],
    ['Meziroční růst cen', Math.round(demoLoc.yoy * 10), 'score--clay']
  ];
  $('#score-demo').innerHTML =
    '<div class="row" style="justify-content:space-between;align-items:baseline">' +
      '<span class="h1">' + UM.esc(demoLoc.name) + '</span>' +
      '<span class="num dim" style="font-size:var(--t-sm)">' + UM.num(demoLoc.avgM2) + ' Kč/m²</span>' +
    '</div>' +
    scores.map(function (s) {
      return '<div class="score ' + s[2] + '">' +
        '<div class="score__head"><span style="font-size:var(--t-sm)">' + s[0] + '</span>' +
          '<span class="score__val">' + (s[0].indexOf('růst') > -1 ? '+' + String(demoLoc.yoy).replace('.', ',') + ' %' : s[1] + ' / 100') + '</span></div>' +
        '<div class="score__track"><div class="score__fill" data-w="' + s[1] + '"></div></div>' +
      '</div>';
    }).join('');

  // Pruhy naplníme až při vstupu do viewportu — jinak animace proběhne naslepo.
  var band = $('#score-demo');
  new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      UM.$$('.score__fill', band).forEach(function (f, i) {
        setTimeout(function () { f.style.width = f.dataset.w + '%'; }, i * 140);
      });
      obs.disconnect();
    });
  }, { threshold: 0.35 }).observe(band);

  /* --- 05 · developeři -------------------------------------------------- */
  $('#developers-grid').innerHTML = D.developers.slice(0, 6).map(C.developer).join('');

  /* --- 06 · magazín ----------------------------------------------------- */
  $('#articles-grid').innerHTML = D.articles.slice(0, 3).map(function (a) {
    return C.article(a);
  }).join('');

  /* Nové uzly musí do motion systému (parallax + reveal). */
  global.UM_MOTION.splitLines();
  global.UM_MOTION.rebind(document);
  global.UM_MOTION.reveals();
})(window);
