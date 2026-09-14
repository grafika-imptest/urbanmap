/* ==========================================================================
   URBANMAP — LOKALITY (rozcestník + datová tabulka)
   SEO vrstva: každá lokalita má vlastní URL a vlastní čísla.
   ========================================================================== */
(function (global) {
  'use strict';
  var UM = global.UM, D = global.UM_DATA, C = global.UM_CARDS, I = UM.I;
  var $ = UM.$, $$ = UM.$$, esc = UM.esc;

  document.getElementById('chrome-header').innerHTML = UM.chrome.header({ active: 'Lokality' });
  document.getElementById('chrome-footer').innerHTML = UM.chrome.footer();

  var GROUPS = [
    { id: 'mesta',  kind: 'city',     title: 'Města',            note: 'Krajská a statutární města s aktivní developerskou nabídkou.' },
    { id: 'ctvrti', kind: 'quarter',  title: 'Městské části',    note: 'Čtvrti Prahy a Brna, kde se dnes staví nejvíc.' },
    { id: 'hory',   kind: 'mountain', title: 'Horské lokality',  note: 'Apartmánové projekty se sezónním nájemním potenciálem.' },
    { id: 'voda',   kind: 'water',    title: 'U vody',           note: 'Rekreační lokality u přehrad a jezer.' },
    { id: 'obce',   kind: 'town',     title: 'Obce v dosahu měst', note: 'Nižší vstupní cena při zachovaném dojezdu do krajského města.' }
  ];

  var maxScore = Math.max.apply(null, D.locations.map(function (l) { return l.investmentScore; }));

  function table(list) {
    return '<div style="overflow-x:auto"><table class="loc-table">' +
      '<thead><tr><th>Lokalita</th><th>Kraj</th><th>Projekty</th><th>Volné jednotky</th>' +
      '<th>Cena / m²</th><th>Meziročně</th><th>Investiční skóre</th></tr></thead><tbody>' +
      list.map(function (l) {
        var ps = D.projectsInScope(l.id);
        var free = ps.reduce(function (a, p) { return a + p.unitsAvailable; }, 0);
        return '<tr onclick="location.href=\'lokalita.html?loc=' + l.slug + '\'">' +
          '<td><b style="font-weight:500">' + esc(l.name) + '</b>' +
            '<div class="lrow__sub">' + esc(l.district) + '</div></td>' +
          '<td class="dim">' + esc(l.region) + '</td>' +
          '<td class="num">' + ps.length + '</td>' +
          '<td class="num">' + free + '</td>' +
          '<td class="num">' + UM.num(l.avgM2) + '</td>' +
          '<td class="num" style="color:var(--st-selling)">+' + String(l.yoy).replace('.', ',') + ' %</td>' +
          '<td class="num">' + l.investmentScore +
            '<span class="bar"><i style="width:' + Math.round(l.investmentScore / maxScore * 100) + '%"></i></span></td>' +
        '</tr>';
      }).join('') +
      '</tbody></table></div>';
  }

  var featured = ['praha-karlin', 'brno-zidenice', 'spindleruv-mlyn', 'lipno-nad-vltavou',
                  'praha-vinohrady', 'ostrava', 'harrachov', 'brno-zabovresky'];

  $('#page-root').innerHTML =
    '<section class="page-hero bleed">' +
      '<div class="page-hero__grid">' +
        '<div>' +
          '<span class="section-index">Lokality</span>' +
          '<h1 class="display-1" data-split style="margin-top:20px">Kde se v Česku staví</h1>' +
        '</div>' +
        '<div class="section-head__aside">' +
          '<p class="lead">Lokalita je v Urbanmapu samostatná datová vrstva. Ke každé sledujeme ' +
            'cenovou hladinu, meziroční vývoj, infrastrukturu a lifestyle parametry — ' +
            'a teprve v tomto kontextu dává smysl číst jednotlivé projekty.</p>' +
          '<a class="link-arrow" href="index.html">Otevřít mapu ' + I.arrow + '</a>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<div id="obsah"></div>' +

    '<section class="section--tight bleed">' +
      '<div class="statline" data-stagger="70">' +
        '<div data-reveal="up"><span class="meta">Lokalit v databázi</span><b data-count="' + D.locations.length + '">0</b><span class="sub">měst, čtvrtí a obcí</span></div>' +
        '<div data-reveal="up"><span class="meta">Krajů</span><b data-count="10">0</b><span class="sub">z celkových 14</span></div>' +
        '<div data-reveal="up"><span class="meta">Nejvyšší skóre</span><b data-count="' + maxScore + '">0</b><span class="sub">Špindlerův Mlýn</span></div>' +
        '<div data-reveal="up"><span class="meta">Nejrychlejší růst</span><b data-count="9.6" data-count-dec="1" data-count-suffix=" %">0</b><span class="sub">Strachotín, meziročně</span></div>' +
      '</div>' +
    '</section>' +

    '<section class="section section--rule bleed">' +
      '<div class="section-head">' +
        '<div><span class="section-index">Výběr</span>' +
          '<h2 class="display-2" data-split style="margin-top:18px">Nejsledovanější lokality</h2></div>' +
      '</div>' +
      '<div class="grid-auto grid-auto--tight" data-stagger="70">' +
        featured.map(function (s) { return C.location(D.locationBySlug(s)); }).join('') +
      '</div>' +
    '</section>' +

    GROUPS.map(function (g, i) {
      var list = D.locations.filter(function (l) { return l.kind === g.kind; })
        .sort(function (a, b) { return b.investmentScore - a.investmentScore; });
      if (!list.length) return '';
      return '<section class="section section--rule bleed" id="' + g.id + '">' +
        '<div class="section-head">' +
          '<div><span class="section-index">' + g.title + '</span>' +
            '<h2 class="display-3" data-split style="margin-top:18px">' + g.title + '</h2></div>' +
          '<div class="section-head__aside"><p class="lead" style="font-size:var(--t-body)">' + g.note + '</p></div>' +
        '</div>' +
        table(list) +
      '</section>';
    }).join('') +

    '<section class="section cta-band">' +
      '<div class="bleed">' +
        '<h2 class="display-1" data-split style="max-width:16ch">Hledejte podle místa, ne podle seznamu</h2>' +
        '<a class="btn btn--lg btn--accent" href="index.html" style="margin-top:40px">Otevřít mapu</a>' +
      '</div>' +
    '</section>';

  UM.chrome.bind();
  global.UM_MOTION.splitLines();
  global.UM_MOTION.rebind(document);
  global.UM_MOTION.reveals();
  global.UM_MOTION.counters();
})(window);
