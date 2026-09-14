/* ==========================================================================
   URBANMAP — MAGAZÍN
   Editorial vrstva = SEO motor. Design vychází z architektonických publikací,
   ne z blogu realitní kanceláře.
   ========================================================================== */
(function (global) {
  'use strict';
  var UM = global.UM, D = global.UM_DATA, C = global.UM_CARDS, I = UM.I;
  var $ = UM.$, $$ = UM.$$, esc = UM.esc;

  document.getElementById('chrome-header').innerHTML = UM.chrome.header({ active: 'Magazín' });
  document.getElementById('chrome-footer').innerHTML = UM.chrome.footer();

  var lead = D.articles[0];
  var rest = D.articles.slice(1);
  var cats = {};
  D.articles.forEach(function (a) { cats[a.category] = (cats[a.category] || 0) + 1; });

  var SEO = [
    ['Novostavby Praha', 'lokalita.html?loc=praha'],
    ['Novostavby Brno', 'lokalita.html?loc=brno'],
    ['Novostavby Ostrava', 'lokalita.html?loc=ostrava'],
    ['Developerské projekty Krkonoše', 'lokalita.html?loc=spindleruv-mlyn'],
    ['Horské apartmány', 'index.html?view=grid&f=ski'],
    ['Investiční byty', 'index.html?view=grid&f=invest'],
    ['Luxusní rezidence', 'index.html?view=grid&f=premium'],
    ['Rekreační bydlení u vody', 'index.html?view=grid&f=water'],
    ['Novostavby Vinohrady', 'lokalita.html?loc=praha-vinohrady'],
    ['Novostavby Židenice', 'lokalita.html?loc=brno-zidenice'],
    ['Apartmány Lipno', 'lokalita.html?loc=lipno-nad-vltavou'],
    ['Rodinné domy Plzeň', 'lokalita.html?loc=plzen']
  ];

  $('#page-root').innerHTML =
    '<section class="page-hero bleed">' +
      '<div class="page-hero__grid">' +
        '<div>' +
          '<span class="section-index">Magazín</span>' +
          '<h1 class="display-1" data-split style="margin-top:20px">Analýzy, lokality, trendy</h1>' +
        '</div>' +
        '<div class="section-head__aside">' +
          '<p class="lead">Texty, které vznikají nad daty platformy. Bez PR developerů ' +
            'a bez „nejlepších investic roku" bez uvedeného výpočtu.</p>' +
          '<div class="fgroup__chips">' +
            Object.keys(cats).map(function (c) {
              return '<button class="chip" data-cat="' + esc(c) + '">' + esc(c) +
                '<span class="chip__count">' + cats[c] + '</span></button>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<div id="obsah"></div>' +

    '<section class="section bleed">' +
      '<a class="mag-lead" href="#" data-px="0.8" data-reveal="up">' +
        '<div class="mag-lead__frame"><img data-px-img src="' + lead.img + '" alt="" loading="lazy"></div>' +
        '<div>' +
          '<div class="row" style="gap:12px">' +
            '<span class="badge badge--accent">Hlavní téma</span>' +
            '<span class="meta">' + esc(lead.category) + '</span>' +
            '<span class="meta">' + UM.dateCz(lead.date) + '</span>' +
            '<span class="meta">' + lead.readMin + ' min čtení</span>' +
          '</div>' +
          '<h2 class="display-2" style="margin-top:22px">' + esc(lead.title) + '</h2>' +
          '<p class="lead" style="margin-top:22px">' + esc(lead.perex) + '</p>' +
          '<span class="link-arrow" style="margin-top:28px;display:inline-flex">Číst analýzu ' + I.arrow + '</span>' +
        '</div>' +
      '</a>' +
    '</section>' +

    '<section class="section section--rule bleed">' +
      '<div class="section-head">' +
        '<div><span class="section-index">Všechny články</span>' +
          '<h2 class="display-3" data-split style="margin-top:18px">Z redakce</h2></div>' +
      '</div>' +
      '<div class="grid-auto" id="mag-grid" data-stagger="80"></div>' +
    '</section>' +

    '<section class="section section--rule bleed">' +
      '<div class="section-head">' +
        '<div><span class="section-index">Rozcestník</span>' +
          '<h2 class="display-3" data-split style="margin-top:18px">Nejhledanější kombinace</h2></div>' +
        '<div class="section-head__aside">' +
          '<p class="lead" style="font-size:var(--t-body)">Každá kombinace lokality a kategorie má vlastní ' +
            'vstupní stránku s daty, mapou a nabídkou. To je páteř organického vyhledávání platformy.</p>' +
        '</div>' +
      '</div>' +
      '<div class="grid-auto grid-auto--tight" style="gap:0;border-top:1px solid var(--line)">' +
        SEO.map(function (s) {
          return '<a href="' + s[1] + '" style="display:flex;align-items:center;justify-content:space-between;' +
            'gap:16px;padding:20px 20px 20px 0;border-bottom:1px solid var(--line);font-size:var(--t-body)">' +
            esc(s[0]) + '<span style="color:var(--ink-25)">' + I.arrow + '</span></a>';
        }).join('') +
      '</div>' +
    '</section>';

  var catFilter = null;
  function paint() {
    var list = rest.filter(function (a) { return !catFilter || a.category === catFilter; });
    $('#mag-grid').innerHTML = list.length
      ? list.map(function (a) { return C.article(a); }).join('')
      : '<p class="dim" style="grid-column:1/-1">V této rubrice zatím není žádný článek.</p>';
    $$('#mag-grid [data-reveal]').forEach(function (n) { n.classList.add('is-in'); });
    global.UM_MOTION.rebind($('#mag-grid'));
    global.UM_MOTION.morphIn($('#mag-grid'));
  }
  paint();

  UM.on(document, 'click', '[data-cat]', function (e, t) {
    var on = !t.classList.contains('is-on');
    $$('[data-cat]').forEach(function (b) { b.classList.remove('is-on'); });
    t.classList.toggle('is-on', on);
    catFilter = on ? t.dataset.cat : null;
    paint();
  });

  UM.chrome.bind();
  global.UM_MOTION.splitLines();
  global.UM_MOTION.rebind(document);
  global.UM_MOTION.reveals();
})(window);
