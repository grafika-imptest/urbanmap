/* ==========================================================================
   URBANMAP — PRO DEVELOPERY (monetizace)
   Standard vs. Premium listing. Premium znamená lepší prezentaci,
   ne přeplácaný katalog.
   ========================================================================== */
(function (global) {
  'use strict';
  var UM = global.UM, D = global.UM_DATA, I = UM.I;
  var $ = UM.$, esc = UM.esc;

  document.getElementById('chrome-header').innerHTML = UM.chrome.header({});
  document.getElementById('chrome-footer').innerHTML = UM.chrome.footer();

  var TIERS = [
    {
      name: 'Standard', price: 'Zdarma', note: 'Základní zápis projektu',
      feats: ['Profil projektu', 'Poloha na mapě', 'Až 5 vizualizací', 'Přehled jednotek',
              'Profil developera', 'Kontaktní formulář'],
      cta: 'Přidat projekt', primary: false
    },
    {
      name: 'Premium', price: 'od 9 900 Kč / měsíc', note: 'Prémiová prezentace projektu',
      feats: ['Vše ze Standardu', 'Větší karta ve výsledcích', 'Video a 360° prohlídka',
              'Půdorysy jednotek ke stažení', 'Přednostní pozice v lokalitě',
              'Badge Premium', 'Analytika poptávky'],
      cta: 'Chci Premium', primary: true, badge: 'Doporučeno'
    },
    {
      name: 'Regionální dominance', price: 'individuálně', note: 'Značka + data',
      feats: ['Vše z Premium', 'Branding v lokalitě', 'Vlastní landing page',
              'Pozice „Top developer kraje"', 'Měsíční report trhu',
              'Monitoring konkurence', 'Lead generation'],
      cta: 'Domluvit schůzku', primary: false
    }
  ];

  $('#page-root').innerHTML =
    '<section class="page-hero bleed">' +
      '<div class="page-hero__grid">' +
        '<div>' +
          '<span class="section-index">Pro developery</span>' +
          '<h1 class="display-1" data-split style="margin-top:20px">Dostaňte projekt na mapu</h1>' +
        '</div>' +
        '<div class="section-head__aside">' +
          '<p class="lead">Urbanmap není inzertní server. Uživatel sem přichází s otázkou ' +
            '„kde chci bydlet" nebo „kde má smysl investovat" — a projekt se mu ukáže ' +
            've chvíli, kdy odpovídá jeho filtru. Proto jsou poptávky kvalifikovanější.</p>' +
          '<div class="row row--gap" style="gap:10px;flex-wrap:wrap">' +
            '<a class="btn btn--primary" href="#pridat">Přidat projekt</a>' +
            '<a class="btn btn--ghost" href="#cenik">Ceník</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<div id="obsah"></div>' +

    '<section class="section--tight bleed">' +
      '<div class="statline" data-stagger="70">' +
        '<div data-reveal="up"><span class="meta">Projektů na platformě</span><b data-count="20">0</b><span class="sub">a roste</span></div>' +
        '<div data-reveal="up"><span class="meta">Developerů</span><b data-count="8">0</b><span class="sub">s profilem</span></div>' +
        '<div data-reveal="up"><span class="meta">Lokalit</span><b data-count="22">0</b><span class="sub">s vlastní vstupní stránkou</span></div>' +
        '<div data-reveal="up"><span class="meta">Pokrytí</span><b data-count="10">0</b><span class="sub">krajů ČR</span></div>' +
      '</div>' +
    '</section>' +

    '<section class="section section--rule bleed" id="cenik">' +
      '<div class="section-head">' +
        '<div><span class="section-index">Listing</span>' +
          '<h2 class="display-2" data-split style="margin-top:18px">Standard nebo Premium</h2></div>' +
        '<div class="section-head__aside">' +
          '<p class="lead" style="font-size:var(--t-body)">Prémiový listing nemění pořadí ve prospěch ' +
            'toho, kdo zaplatí víc — mění kvalitu prezentace. Uživatel musí platformě věřit, ' +
            'jinak nemá listing hodnotu pro nikoho.</p>' +
        '</div>' +
      '</div>' +
      '<div class="grid-auto" data-stagger="80">' +
        TIERS.map(function (t) {
          return '<div class="dcard" data-reveal="up" style="' +
            (t.primary ? 'border-color:var(--ink);box-shadow:var(--sh-2)' : '') + '">' +
            '<div class="row" style="justify-content:space-between;gap:12px">' +
              '<span class="meta meta--ink">' + esc(t.name) + '</span>' +
              (t.badge ? '<span class="badge badge--accent">' + esc(t.badge) + '</span>' : '') +
            '</div>' +
            '<div><div class="h1">' + esc(t.price) + '</div>' +
              '<div class="dim" style="font-size:var(--t-sm);margin-top:6px">' + esc(t.note) + '</div></div>' +
            '<ul class="feat-list" style="border-top:1px solid var(--line)">' +
              t.feats.map(function (f) { return '<li style="font-size:var(--t-sm)">' + esc(f) + '</li>'; }).join('') +
            '</ul>' +
            '<a class="btn ' + (t.primary ? 'btn--primary' : 'btn--ghost') + ' btn--block" href="#pridat">' +
              esc(t.cta) + '</a>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</section>' +

    '<section class="section section--rule bleed">' +
      '<div class="dsplit">' +
        '<div data-reveal="up">' +
          '<span class="section-index">Datové služby</span>' +
          '<h2 class="display-3" data-split style="margin-top:18px;margin-bottom:26px">Co přijde po listingu</h2>' +
          '<div class="prose">' +
            '<p>Platforma sbírá strukturovaná data o projektech, jednotkách, cenách a poptávce. ' +
            'To je základ pro služby, které dnes na českém trhu nikdo systematicky nenabízí: ' +
            'cenové benchmarky v lokalitě, monitoring konkurence a reporty tempa prodeje.</p>' +
            '<p>Tyto služby jsou ve <strong>fázi 3</strong>. Neprodáváme je dopředu a neuvádíme ' +
            'čísla, která zatím nemáme.</p>' +
          '</div>' +
        '</div>' +
        '<div data-reveal="up">' +
          '<ul class="feat-list">' +
            ['Cenový benchmark v lokalitě', 'Monitoring konkurenčních projektů',
             'Report tempa prodeje', 'Analýza poptávky podle filtrů',
             'Napojení na CRM developera', 'API pro export nabídky'].map(function (f) {
              return '<li>' + esc(f) + '<span class="badge badge--outline" style="margin-left:auto">fáze 3</span></li>';
            }).join('') +
          '</ul>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section cta-band" id="pridat">' +
      '<div class="bleed">' +
        '<div class="dsplit" style="align-items:center">' +
          '<div>' +
            '<span class="section-index" style="opacity:.6">Zápis projektu</span>' +
            '<h2 class="display-2" data-split style="margin-top:20px">Přidat projekt</h2>' +
            '<p class="lead" style="margin-top:26px;opacity:.72">Vyplňte základní údaje. ' +
              'Zbytek doplníme společně — včetně mapového zákresu, jednotek a vizualizací.</p>' +
          '</div>' +
          '<form class="stack" style="gap:14px" onsubmit="return false">' +
            field('Název projektu', 'text', 'např. Rezidence Měšťanka') +
            field('Developer', 'text', 'název společnosti') +
            field('Lokalita', 'text', 'město nebo městská část') +
            field('Kontaktní e-mail', 'email', 'jmeno@firma.cz') +
            '<button class="btn btn--lg btn--accent btn--block" style="margin-top:10px">Odeslat žádost</button>' +
            '<p style="font-size:var(--t-xs);opacity:.55;margin-top:4px">Prototyp — formulář nic neodesílá.</p>' +
          '</form>' +
        '</div>' +
      '</div>' +
    '</section>';

  function field(label, type, ph) {
    return '<label style="display:block">' +
      '<span class="meta" style="opacity:.6">' + esc(label) + '</span>' +
      '<input type="' + type + '" placeholder="' + esc(ph) + '" style="' +
        'width:100%;margin-top:8px;height:46px;padding-inline:14px;' +
        'background:transparent;border:1px solid rgba(244,242,238,.25);border-radius:var(--r-2);' +
        'color:inherit;font-size:var(--t-body)">' +
    '</label>';
  }

  UM.chrome.bind();
  global.UM_MOTION.splitLines();
  global.UM_MOTION.rebind(document);
  global.UM_MOTION.reveals();
  global.UM_MOTION.counters();
})(window);
