/* ==========================================================================
   URBANMAP — DETAIL LOKALITY
   SEO landing page typu „Novostavby Brno" — s mapou, daty a projekty.
   ========================================================================== */
(function (global) {
  'use strict';
  var UM = global.UM, D = global.UM_DATA, C = global.UM_CARDS, I = UM.I;
  var $ = UM.$, $$ = UM.$$, esc = UM.esc;

  var l = D.locationBySlug(UM.slugParam('loc', 'brno')) || D.locations[0];

  /* Do lokality patří i projekty z jejích částí — „Praha" musí ukázat
     i Karlín a Vinohrady, jinak by městská stránka zůstala prázdná. */
  var children = D.childLocations(l.id);
  var projects = D.projectsInScope(l.id);
  var active = projects.filter(function (p) { return D.STATUS[p.status].group === 'active'; });
  var free = projects.reduce(function (a, p) { return a + p.unitsAvailable; }, 0);
  var devs = {};
  projects.forEach(function (p) { devs[p.developerId] = 1; });

  document.title = 'Novostavby ' + l.name + ' — developerské projekty | Urbanmap.cz';
  document.getElementById('chrome-header').innerHTML = UM.chrome.header({ active: 'Lokality' });
  document.getElementById('chrome-footer').innerHTML = UM.chrome.footer();

  function scoreRow(label, val, cls) {
    return '<div class="score ' + (cls || '') + '">' +
      '<div class="score__head"><span style="font-size:var(--t-sm)">' + label + '</span>' +
        '<span class="score__val">' + val + ' / 100</span></div>' +
      '<div class="score__track"><div class="score__fill" data-w="' + val + '"></div></div></div>';
  }

  var cheapest = projects.slice().sort(function (a, b) { return a.priceFrom - b.priceFrom; })[0];

  $('#page-root').innerHTML =
    '<section class="dhero">' +
      '<div class="dhero__media" data-px data-reveal="fade" style="height:clamp(300px,46vh,520px)">' +
        '<img data-px-img src="' + l.img + '" alt="' + esc(l.name) + '">' +
        '<div class="dhero__over">' +
          '<nav class="dhero__crumbs">' +
            '<a href="index.html">Urbanmap</a><span>/</span>' +
            '<a href="lokality.html">Lokality</a><span>/</span><span>' + esc(l.name) + '</span>' +
          '</nav>' +
          '<h1 class="dhero__title" data-split>Novostavby ' + esc(l.name) + '</h1>' +
          '<div class="dhero__row">' +
            '<span class="meta">' + esc(l.region) + '</span>' +
            '<span class="meta">' + esc(l.district) + '</span>' +
            '<span class="meta">' + projects.length + ' ' + UM.projectsWord(projects.length) + '</span>' +
            '<span class="meta">' + UM.num(l.avgM2) + ' Kč/m²</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<div id="obsah"></div>' +

    '<section class="section--tight bleed">' +
      '<div class="statline" data-stagger="70">' +
        '<div data-reveal="up"><span class="meta">Projektů</span><b data-count="' + projects.length + '">0</b><span class="sub">' + active.length + ' aktivních</span></div>' +
        '<div data-reveal="up"><span class="meta">Volných jednotek</span><b data-count="' + free + '">0</b><span class="sub">napříč projekty</span></div>' +
        '<div data-reveal="up"><span class="meta">Cena / m²</span><b data-count="' + l.avgM2 + '">0</b><span class="sub">průměr novostaveb</span></div>' +
        '<div data-reveal="up"><span class="meta">Meziročně</span><b data-count="' + l.yoy + '" data-count-dec="1" data-count-suffix=" %">0</b><span class="sub">změna cenové hladiny</span></div>' +
        '<div data-reveal="up"><span class="meta">Developerů</span><b data-count="' + Object.keys(devs).length + '">0</b><span class="sub">aktivních v lokalitě</span></div>' +
        '<div data-reveal="up"><span class="meta">Nejnižší vstup</span><b>' + (cheapest ? UM.czk(cheapest.priceFrom, { short: true }) : '—') + '</b><span class="sub">' + (cheapest ? esc(cheapest.name) : '') + '</span></div>' +
      '</div>' +
    '</section>' +

    '<section class="section section--rule bleed" id="mapa">' +
      '<div class="section-head">' +
        '<div><span class="section-index">Mapa</span>' +
          '<h2 class="display-3" data-split style="margin-top:18px">Projekty v lokalitě</h2></div>' +
        '<div class="section-head__aside">' +
          '<div style="display:flex;flex-direction:column;gap:22px;width:100%">' +
            scoreRow('Investiční potenciál', l.investmentScore) +
            scoreRow('Infrastruktura', l.infrastructureScore) +
            scoreRow('Lifestyle', l.lifestyleScore, 'score--clay') +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="dmap" data-reveal="fade"><div class="map" id="loc-map"></div></div>' +
    '</section>' +

    '<section class="section section--rule bleed">' +
      '<div class="section-head">' +
        '<div><span class="section-index">Nabídka</span>' +
          '<h2 class="display-2" data-split style="margin-top:18px">' + projects.length + ' ' +
            UM.projectsWord(projects.length) + ' v lokalitě</h2></div>' +
        '<div class="section-head__aside">' +
          '<p class="lead" style="font-size:var(--t-body)">Aktivní projekty i dokončené reference. ' +
            'Filtrovat podle ceny, dispozice a stavu můžete na mapě.</p>' +
          '<a class="link-arrow" href="index.html?loc=' + l.id + '">Filtrovat na mapě ' + I.arrow + '</a>' +
        '</div>' +
      '</div>' +
      '<div class="grid-auto" data-stagger="70">' +
        (projects.length
          ? projects.map(function (p, i) { return C.project(p, { depth: 0.85 + (i % 3) * 0.25 }); }).join('')
          : '<p class="dim">V této lokalitě zatím nemáme žádný projekt.</p>') +
      '</div>' +
    '</section>' +

    (children.length ? '<section class="section section--rule bleed">' +
      '<div class="section-head"><div><span class="section-index">Části</span>' +
        '<h2 class="display-3" data-split style="margin-top:18px">Městské části</h2></div></div>' +
      '<div class="grid-auto grid-auto--tight" data-stagger="60">' +
        children.map(C.location).join('') + '</div></section>' : '') +

    '<section class="section cta-band">' +
      '<div class="bleed">' +
        '<span class="section-index" style="opacity:.6">Nezmeškejte nový projekt</span>' +
        '<h2 class="display-1" data-split style="margin-top:20px;max-width:18ch">Hlídat nové projekty v lokalitě ' + esc(l.name) + '</h2>' +
        '<div class="row row--gap" style="margin-top:40px;gap:12px;flex-wrap:wrap">' +
          '<a class="btn btn--lg btn--accent" href="#">Nastavit hlídacího psa</a>' +
          '<a class="btn btn--lg btn--ghost cta-band__ghost" href="index.html">Zpět na mapu</a>' +
        '</div>' +
      '</div>' +
    '</section>';

  /* --- mapa lokality ---------------------------------------------------- */
  var lons = projects.length ? projects.map(function (p) { return p.coords[0]; }) : [l.coords[0]];
  var lats = projects.length ? projects.map(function (p) { return p.coords[1]; }) : [l.coords[1]];
  var pad = l.kind === 'city' ? 0.06 : 0.04;
  var lmap = global.UM_MAP.create({
    container: $('#loc-map'),
    bounds: [
      [Math.min.apply(null, lons) - pad, Math.min.apply(null, lats) - pad],
      [Math.max.apply(null, lons) + pad, Math.max.apply(null, lats) + pad]
    ],
    peekHtml: C.peek,
    onSelect: function (id) { location.href = 'projekt.html?p=' + D.project(id).slug; },
    onReady: function (api) {
      api.setData(projects.map(function (p) {
        return {
          id: p.id, coords: p.coords, status: p.status, featured: p.featured,
          label: p.unitsAvailable ? UM.czk(p.priceFrom, { short: true }) : 'Vyprodáno'
        };
      }));
    }
  });
  document.addEventListener('um:theme', function (e) { lmap.setTheme(e.detail.theme); });

  var scoreIO = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.style.width = e.target.dataset.w + '%';
      obs.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  $$('.score__fill').forEach(function (f, i) {
    f.style.transitionDelay = (i % 3) * 130 + 'ms';
    scoreIO.observe(f);
  });

  UM.chrome.bind();
  global.UM_MOTION.splitLines();
  global.UM_MOTION.rebind(document);
  global.UM_MOTION.reveals();
  global.UM_MOTION.counters();
})(window);
