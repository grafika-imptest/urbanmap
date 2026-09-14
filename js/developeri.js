/* ==========================================================================
   URBANMAP — SEZNAM DEVELOPERŮ
   ========================================================================== */
(function (global) {
  'use strict';
  var UM = global.UM, D = global.UM_DATA, C = global.UM_CARDS, I = UM.I;
  var $ = UM.$, $$ = UM.$$, esc = UM.esc;

  document.getElementById('chrome-header').innerHTML = UM.chrome.header({ active: 'Developeři' });
  document.getElementById('chrome-footer').innerHTML = UM.chrome.footer();

  var regions = {};
  D.developers.forEach(function (d) { d.regions.forEach(function (r) { regions[r] = (regions[r] || 0) + 1; }); });

  var filter = { region: null, verified: false, sort: 'rating' };

  function list() {
    var out = D.developers.filter(function (d) {
      if (filter.verified && !d.verified) return false;
      if (filter.region && d.regions.indexOf(filter.region) < 0) return false;
      return true;
    });
    var s = {
      rating: function (a, b) { return b.rating - a.rating; },
      built:  function (a, b) { return b.stats.built - a.stats.built; },
      active: function (a, b) { return b.stats.active - a.stats.active; },
      name:   function (a, b) { return a.name.localeCompare(b.name, 'cs'); }
    };
    return out.sort(s[filter.sort]);
  }

  var totals = D.developers.reduce(function (a, d) {
    a.built += d.stats.built; a.units += d.stats.units; a.active += d.stats.active; return a;
  }, { built: 0, units: 0, active: 0 });

  $('#page-root').innerHTML =
    '<section class="page-hero bleed">' +
      '<div class="page-hero__grid">' +
        '<div>' +
          '<span class="section-index">Developeři</span>' +
          '<h1 class="display-1" data-split style="margin-top:20px">Kdo v Česku staví</h1>' +
        '</div>' +
        '<div class="section-head__aside">' +
          '<p class="lead">Developer není řádek pod fotkou projektu. Je to entita s historií, ' +
            'referencemi a měřitelnou spolehlivostí. Profil ukazuje nejen to, co firma prodává, ' +
            'ale hlavně to, co už postavila.</p>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<div id="obsah"></div>' +

    '<section class="section--tight bleed">' +
      '<div class="statline" data-stagger="70">' +
        '<div data-reveal="up"><span class="meta">Developerů</span><b data-count="' + D.developers.length + '">0</b><span class="sub">v databázi</span></div>' +
        '<div data-reveal="up"><span class="meta">Ověřených</span><b data-count="' + D.developers.filter(function (d) { return d.verified; }).length + '">0</b><span class="sub">s doloženými referencemi</span></div>' +
        '<div data-reveal="up"><span class="meta">Dokončených projektů</span><b data-count="' + totals.built + '">0</b><span class="sub">celkem</span></div>' +
        '<div data-reveal="up"><span class="meta">Postavených jednotek</span><b data-count="' + totals.units + '">0</b><span class="sub">celkem</span></div>' +
        '<div data-reveal="up"><span class="meta">Aktivních projektů</span><b data-count="' + totals.active + '">0</b><span class="sub">v přípravě a prodeji</span></div>' +
      '</div>' +
    '</section>' +

    '<section class="bleed" id="overeni">' +
      '<div class="filter-strip">' +
        '<button class="chip is-on" data-region="">Všechny kraje</button>' +
        Object.keys(regions).sort().map(function (r) {
          return '<button class="chip" data-region="' + esc(r) + '">' + esc(r) +
            '<span class="chip__count">' + regions[r] + '</span></button>';
        }).join('') +
        '<div class="rail__sep"></div>' +
        '<button class="chip" data-verified="1">Jen ověření</button>' +
        '<div class="spacer"></div>' +
        '<label class="sel"><span class="meta">Řadit</span>' +
          '<select class="js-dsort">' +
            '<option value="rating">Hodnocení</option>' +
            '<option value="built">Dokončené projekty</option>' +
            '<option value="active">Aktivní projekty</option>' +
            '<option value="name">Abecedně</option>' +
          '</select></label>' +
      '</div>' +
    '</section>' +

    '<section class="section bleed" id="top">' +
      '<div class="grid-auto grid-auto--tight" id="dev-list" data-stagger="60"></div>' +
    '</section>' +

    '<section class="section cta-band">' +
      '<div class="bleed">' +
        '<span class="section-index" style="opacity:.6">Pro developery</span>' +
        '<h2 class="display-1" data-split style="margin-top:20px;max-width:16ch">Máte projekt? Patří na mapu.</h2>' +
        '<a class="btn btn--lg btn--accent" href="pro-developery.html" style="margin-top:40px">Přidat projekt</a>' +
      '</div>' +
    '</section>';

  function paint() {
    var l = list();
    $('#dev-list').innerHTML = l.length
      ? l.map(C.developer).join('')
      : '<p class="dim" style="grid-column:1/-1">Žádný developer neodpovídá výběru.</p>';
    $$('#dev-list [data-reveal]').forEach(function (n) { n.classList.add('is-in'); });
    global.UM_MOTION.morphIn($('#dev-list'));
  }
  paint();

  UM.on(document, 'click', '[data-region]', function (e, t) {
    $$('[data-region]').forEach(function (b) { b.classList.toggle('is-on', b === t); });
    filter.region = t.dataset.region || null;
    paint();
  });
  UM.on(document, 'click', '[data-verified]', function (e, t) {
    filter.verified = !filter.verified;
    t.classList.toggle('is-on', filter.verified);
    paint();
  });
  UM.on(document, 'change', '.js-dsort', function (e, t) { filter.sort = t.value; paint(); });

  UM.chrome.bind();
  global.UM_MOTION.splitLines();
  global.UM_MOTION.rebind(document);
  global.UM_MOTION.reveals();
  global.UM_MOTION.counters();
})(window);
