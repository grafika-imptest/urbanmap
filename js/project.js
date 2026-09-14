/* ==========================================================================
   URBANMAP — DETAIL PROJEKTU
   Struktura: HERO → PŘEHLED → GALERIE → JEDNOTKY → LOKALITA → DEVELOPER
              → INVESTICE → PODOBNÉ PROJEKTY
   ========================================================================== */
(function (global) {
  'use strict';
  var UM = global.UM, D = global.UM_DATA, C = global.UM_CARDS, I = UM.I;
  var $ = UM.$, $$ = UM.$$, esc = UM.esc;

  var p = D.projectBySlug(UM.slugParam('p', 'rezidence-mestanka')) || D.projects[0];
  var h = D.hydrate(p);
  var units = D.units(p.id);

  document.title = p.name + ' — ' + h.loc.name + ' | Urbanmap.cz';
  document.getElementById('chrome-header').innerHTML = UM.chrome.header({ active: 'Projekty' });
  document.getElementById('chrome-footer').innerHTML = UM.chrome.footer();

  var sold = p.unitsAvailable === 0;
  var freeUnits = units.filter(function (u) { return u.status === 'free'; });

  /* --------------------------------------------------------------- HERO */
  function hero() {
    return '<section class="dhero">' +
      '<div class="dhero__media" data-px data-reveal="fade">' +
        '<img data-px-img src="' + p.images[0] + '" alt="' + esc(p.name) + '">' +
        '<div class="dhero__over">' +
          '<nav class="dhero__crumbs" aria-label="Drobečková navigace">' +
            '<a href="index.html">Projekty</a><span>/</span>' +
            '<a href="lokalita.html?loc=' + h.loc.slug + '">' + esc(h.loc.name) + '</a><span>/</span>' +
            '<span>' + esc(p.name) + '</span>' +
          '</nav>' +
          '<h1 class="dhero__title" data-split>' + esc(p.name) + '</h1>' +
          '<div class="dhero__row">' +
            C.statusPill(p) +
            '<span class="meta">' + esc(p.address) + '</span>' +
            '<span class="meta">' + esc(h.dev.name) + '</span>' +
            '<span class="meta">Dokončení ' + esc(p.completion) + '</span>' +
            (p.premium ? '<span class="badge badge--accent">Premium listing</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  /* ------------------------------------------------------- STICKY DATA BAR */
  function bar() {
    return '<div class="dbar">' +
      '<nav class="dbar__nav">' +
        '<a href="#prehled" class="is-active">Přehled</a>' +
        '<a href="#galerie">Galerie</a>' +
        '<a href="#jednotky">Jednotky</a>' +
        '<a href="#lokalita">Lokalita</a>' +
        '<a href="#developer">Developer</a>' +
        '<a href="#investice">Investice</a>' +
      '</nav>' +
      '<div class="spacer"></div>' +
      '<div class="dbar__price">' +
        '<span class="meta">Cena od</span>' +
        '<b class="num">' + (sold ? 'Vyprodáno' : UM.czkFull(p.priceFrom)) + '</b>' +
      '</div>' +
      '<div class="dbar__price">' +
        '<span class="meta">Volné</span>' +
        '<b class="num">' + p.unitsAvailable + ' / ' + p.unitsTotal + '</b>' +
      '</div>' +
      '<a class="btn btn--primary btn--sm" href="#jednotky">Zobrazit jednotky</a>' +
    '</div>';
  }

  /* ------------------------------------------------------------ PŘEHLED */
  function overview() {
    return '<section class="section bleed" id="prehled">' +
      '<div class="section-head">' +
        '<div>' +
          '<span class="section-index">O projektu</span>' +
          '<h2 class="display-3" data-split style="margin-top:18px;max-width:22ch">' + esc(p.claim) + '</h2>' +
        '</div>' +
        '<div class="section-head__aside">' +
          '<div class="fgroup__chips">' +
            p.type.map(function (t) { return '<span class="chip" style="pointer-events:none">' + esc(D.TYPES[t]) + '</span>'; }).join('') +
            p.lifestyle.map(function (k) { return '<span class="chip" style="pointer-events:none">' + esc(D.LIFESTYLE[k]) + '</span>'; }).join('') +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="statline" data-stagger="70" style="margin-bottom:clamp(40px,5vw,88px)">' +
        '<div data-reveal="up"><span class="meta">Cena od</span><b>' + (sold ? '—' : UM.czk(p.priceFrom, { short: true })) + '</b><span class="sub">' + (sold ? 'projekt je vyprodán' : 'nejnižší jednotka v nabídce') + '</span></div>' +
        '<div data-reveal="up"><span class="meta">Cena / m²</span><b>' + UM.num(p.pricePerM2) + '</b><span class="sub">Kč průměrně</span></div>' +
        '<div data-reveal="up"><span class="meta">Jednotek</span><b>' + p.unitsTotal + '</b><span class="sub">' + p.unitsAvailable + ' volných</span></div>' +
        '<div data-reveal="up"><span class="meta">Plochy</span><b>' + p.sizeRange[0] + '–' + p.sizeRange[1] + '</b><span class="sub">m² podlahové plochy</span></div>' +
        '<div data-reveal="up"><span class="meta">Podlaží</span><b>' + p.floors + '</b><span class="sub">nadzemních</span></div>' +
        '<div data-reveal="up"><span class="meta">Dokončení</span><b style="font-size:clamp(1.2rem,1.6vw,1.7rem)">' + esc(p.completion) + '</b><span class="sub">dle developera</span></div>' +
      '</div>' +

      '<div class="dsplit">' +
        '<div class="prose" data-reveal="up">' +
          '<span class="meta">Koncept</span>' +
          '<p style="margin-top:20px">' + esc(p.about) + '</p>' +
          '<span class="meta" style="display:block;margin-top:36px">Architektura</span>' +
          '<p style="margin-top:20px">' + esc(p.architecture) + '</p>' +
        '</div>' +
        '<div data-reveal="up">' +
          '<span class="meta">Co projekt nabízí</span>' +
          '<ul class="feat-list" style="margin-top:20px">' +
            p.amenities.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') +
          '</ul>' +
          '<div class="row row--gap" style="margin-top:32px;gap:10px;flex-wrap:wrap">' +
            '<button class="btn btn--primary">' + I.doc + ' Stáhnout ceník (PDF)</button>' +
            '<button class="btn btn--ghost">Nezávazná poptávka</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  /* ------------------------------------------------------------ GALERIE */
  function gallery() {
    return '<section class="section section--rule bleed" id="galerie">' +
      '<div class="section-head">' +
        '<div><span class="section-index">Vizualizace</span>' +
          '<h2 class="display-3" data-split style="margin-top:18px">Jak bude projekt vypadat</h2></div>' +
        '<div class="section-head__aside">' +
          '<p class="lead" style="font-size:var(--t-body)">Vizualizace dodává developer. ' +
            'Urbanmap u prémiových profilů zobrazuje navíc video, půdorysy a 360° prohlídku.</p>' +
        '</div>' +
      '</div>' +
      '<div class="gallery" data-stagger="60">' +
        p.images.map(function (src, i) {
          return '<figure data-px="' + (0.7 + (i % 3) * 0.3) + '" data-reveal="clip">' +
            '<img data-px-img src="' + src + '" alt="' + esc(p.name) + ' — vizualizace ' + (i + 1) + '" loading="lazy">' +
          '</figure>';
        }).join('') +
      '</div>' +
    '</section>';
  }

  /* ----------------------------------------------------------- JEDNOTKY */
  function unitsSection() {
    var layouts = p.layouts;
    return '<section class="section section--rule bleed" id="jednotky">' +
      '<div class="section-head">' +
        '<div><span class="section-index">Jednotky</span>' +
          '<h2 class="display-3" data-split style="margin-top:18px">Přehled dostupnosti</h2></div>' +
        '<div class="section-head__aside">' +
          '<p class="lead" style="font-size:var(--t-body)">' +
            (sold ? 'Projekt je vyprodaný. Přehled zůstává dostupný jako reference cenové hladiny v lokalitě.'
                  : 'Ceny jsou uvedené včetně DPH, bez parkovacího stání a sklepa. ' +
                    'Rezervace probíhá u developera.') + '</p>' +
        '</div>' +
      '</div>' +

      '<div class="ufilter">' +
        '<button class="chip is-on" data-u="all">Vše <span class="chip__count">' + units.length + '</span></button>' +
        '<button class="chip" data-u="free">Volné <span class="chip__count">' + units.filter(function (u) { return u.status === 'free'; }).length + '</span></button>' +
        '<button class="chip" data-u="reserved">Rezervované <span class="chip__count">' + units.filter(function (u) { return u.status === 'reserved'; }).length + '</span></button>' +
        '<div class="rail__sep"></div>' +
        layouts.map(function (l) {
          return '<button class="chip" data-layout="' + l + '">' + l + '</button>';
        }).join('') +
      '</div>' +

      '<div class="uwrap scroller"><table class="utable" id="utable">' +
        '<thead><tr>' +
          '<th>Označení</th><th>Dispozice</th><th>Podlaží</th><th>Plocha</th>' +
          '<th>Terasa / balkon</th><th>Orientace</th><th>Stav</th><th>Cena</th>' +
        '</tr></thead><tbody></tbody>' +
      '</table></div>' +
    '</section>';
  }

  function unitRows(filter) {
    var rows = units.filter(function (u) {
      if (filter.status && filter.status !== 'all' && u.status !== filter.status) return false;
      if (filter.layout && u.layout !== filter.layout) return false;
      return true;
    });
    if (!rows.length) {
      return '<tr><td colspan="8" style="padding:48px 0;text-align:center" class="dim">' +
        'V tomto výběru nejsou žádné jednotky.</td></tr>';
    }
    var label = { free: 'Volné', reserved: 'Rezervováno', sold: 'Prodáno' };
    var stKey = { free: 'selling', reserved: 'presale', sold: 'sold' };
    return rows.map(function (u) {
      return '<tr>' +
        '<td class="num">' + u.code + '</td>' +
        '<td><b style="font-weight:500">' + u.layout + '</b></td>' +
        '<td class="num">' + u.floor + '. NP</td>' +
        '<td class="num">' + u.area + ' m²</td>' +
        '<td class="num dim">' + (u.terrace ? u.terrace + ' m²' : '—') + '</td>' +
        '<td class="dim">' + u.orientation + '</td>' +
        '<td><span class="status" data-status="' + stKey[u.status] + '">' + label[u.status] + '</span></td>' +
        '<td class="num">' + (u.status === 'sold' ? '<span class="dim">—</span>' : UM.czkFull(u.price)) + '</td>' +
      '</tr>';
    }).join('');
  }

  /* ----------------------------------------------------------- LOKALITA */
  function locationSection() {
    var l = h.loc;
    return '<section class="section section--rule bleed" id="lokalita">' +
      '<div class="section-head">' +
        '<div><span class="section-index">Lokalita</span>' +
          '<h2 class="display-3" data-split style="margin-top:18px">' + esc(l.name) + '</h2></div>' +
        '<div class="section-head__aside">' +
          '<p class="lead" style="font-size:var(--t-body)">' + esc(l.region) + ' · ' + esc(l.district) + '. ' +
            'Průměrná cena novostavby ' + UM.num(l.avgM2) + ' Kč/m², meziroční změna +' +
            String(l.yoy).replace('.', ',') + ' %.</p>' +
          '<a class="link-arrow" href="lokalita.html?loc=' + l.slug + '">Profil lokality ' + I.arrow + '</a>' +
        '</div>' +
      '</div>' +

      '<div class="dsplit--aside dsplit">' +
        '<div class="dmap" data-reveal="fade"><div class="map" id="detail-map"></div></div>' +
        '<div>' +
          '<span class="meta">Skóre lokality</span>' +
          '<div style="display:flex;flex-direction:column;gap:26px;margin-top:22px">' +
            scoreRow('Investiční potenciál', l.investmentScore) +
            scoreRow('Infrastruktura', l.infrastructureScore) +
            scoreRow('Lifestyle', l.lifestyleScore, 'score--clay') +
          '</div>' +
          '<span class="meta" style="display:block;margin-top:40px">V okolí</span>' +
          '<ul class="feat-list" style="margin-top:18px">' +
            p.amenities.slice(0, 4).map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') +
          '</ul>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function scoreRow(label, val, cls) {
    return '<div class="score ' + (cls || '') + '">' +
      '<div class="score__head"><span style="font-size:var(--t-sm)">' + label + '</span>' +
        '<span class="score__val">' + val + ' / 100</span></div>' +
      '<div class="score__track"><div class="score__fill" data-w="' + val + '"></div></div></div>';
  }

  /* ---------------------------------------------------------- DEVELOPER */
  function developerSection() {
    var d = h.dev;
    var others = D.projectsByDeveloper(d.id).filter(function (x) { return x.id !== p.id; }).slice(0, 3);
    return '<section class="section section--rule bleed" id="developer">' +
      '<div class="section-head">' +
        '<div><span class="section-index">Developer</span>' +
          '<h2 class="display-3" data-split style="margin-top:18px">Kdo projekt staví</h2></div>' +
      '</div>' +
      '<div class="dsplit--aside dsplit" style="margin-bottom:clamp(36px,4vw,72px)">' +
        '<div class="devbox" data-reveal="up">' +
          '<div class="devbox__top">' +
            '<div class="devbox__logo">' + C.devLogo(d) + '</div>' +
            '<div>' +
              '<div class="row" style="gap:8px"><h3 class="h1">' + esc(d.name) + '</h3>' +
                (d.verified ? '<span class="verified">' + I.verified + '</span>' : '') + '</div>' +
              '<div class="meta" style="margin-top:8px">' + esc(d.hq) + ' · od ' + d.founded + ' · ' + esc(d.size) + '</div>' +
            '</div>' +
          '</div>' +
          '<p class="lead" style="font-size:var(--t-body)">' + esc(d.description) + '</p>' +
          '<div class="dcard__stats" style="grid-template-columns:repeat(4,1fr)">' +
            '<div><span class="meta">Dokončeno</span><b>' + d.stats.built + '</b></div>' +
            '<div><span class="meta">Aktivní</span><b>' + d.stats.active + '</b></div>' +
            '<div><span class="meta">Jednotek</span><b>' + UM.num(d.stats.units) + '</b></div>' +
            '<div><span class="meta">Hodnocení</span><b>' + String(d.rating).replace('.', ',') + '</b></div>' +
          '</div>' +
          '<a class="btn btn--ghost" href="developer.html?d=' + d.slug + '" style="align-self:flex-start">Profil developera</a>' +
        '</div>' +
        '<div data-reveal="up">' +
          '<span class="meta">Certifikace a členství</span>' +
          '<ul class="feat-list" style="margin-top:18px">' +
            (d.certifications.length
              ? d.certifications.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('')
              : '<li class="dim">Developer zatím neuvedl žádné certifikace</li>') +
          '</ul>' +
          '<span class="meta" style="display:block;margin-top:32px">Působnost</span>' +
          '<div class="fgroup__chips" style="margin-top:16px">' +
            d.regions.map(function (r) { return '<span class="chip" style="pointer-events:none">' + esc(r) + '</span>'; }).join('') +
          '</div>' +
        '</div>' +
      '</div>' +
      (others.length ? '<span class="meta">Další projekty developera</span>' +
        '<div class="grid-auto" data-stagger="70" style="margin-top:22px">' +
          others.map(function (x) { return C.project(x, { depth: 1 }); }).join('') + '</div>' : '') +
    '</section>';
  }

  /* ---------------------------------------------------------- INVESTICE */
  function investSection() {
    return '<section class="section section--rule invest-band" id="investice">' +
      '<div class="bleed">' +
        '<div class="invest-band__grid">' +
          '<div>' +
            '<span class="section-index">Investiční pohled</span>' +
            '<h2 class="display-2" data-split style="margin-top:18px">Dává projekt smysl jako investice?</h2>' +
            '<p class="lead" style="margin-top:26px">Urbanmap nepočítá výnos za vás a nevydává odhad za fakt. ' +
              'Ukazuje vstupy, ze kterých se rozhodnutí skládá — cenovou hladinu lokality, ' +
              'její vývoj, charakter poptávky a typ projektu.</p>' +
            '<div class="fgroup__chips" style="margin-top:28px">' +
              p.invest.map(function (k) {
                return '<span class="chip is-on" style="pointer-events:none">' + esc(D.INVEST[k].label) + '</span>';
              }).join('') +
            '</div>' +
          '</div>' +
          '<div class="invest-band__panel" data-reveal="up">' +
            '<div class="row" style="justify-content:space-between">' +
              '<span class="meta">Vstupy do rozhodnutí</span>' +
              '<span class="badge badge--outline">Prototyp</span>' +
            '</div>' +
            '<dl class="kv" style="margin-top:26px">' +
              '<dt>Cena / m² projektu</dt><dd class="num">' + UM.num(p.pricePerM2) + ' Kč</dd>' +
              '<dt>Průměr lokality</dt><dd class="num">' + UM.num(h.loc.avgM2) + ' Kč</dd>' +
              '<dt>Rozdíl</dt><dd class="num">' + diffLabel() + '</dd>' +
              '<dt>Meziroční vývoj</dt><dd class="num">+' + String(h.loc.yoy).replace('.', ',') + ' %</dd>' +
              '<dt>Nejnižší vstup</dt><dd class="num">' + (sold ? '—' : UM.czkFull(p.priceFrom)) + '</dd>' +
              '<dt>Typ poptávky</dt><dd>' + demandLabel() + '</dd>' +
            '</dl>' +
            '<div style="margin-top:28px;padding-top:24px;border-top:1px solid var(--line)">' +
              scoreRow('Skóre lokality', p.investmentScore) +
            '</div>' +
            '<p class="fgroup__note" style="margin-top:24px">Nájemní yield, tempo prodeje a projekce růstu ' +
              'se doplní ve fázi 2 po napojení na transakční a nájemní data.</p>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function diffLabel() {
    var d = Math.round(((p.pricePerM2 - h.loc.avgM2) / h.loc.avgM2) * 1000) / 10;
    return (d > 0 ? '+' : '') + String(d).replace('.', ',') + ' % vůči lokalitě';
  }
  function demandLabel() {
    if (p.invest.indexOf('tourist') > -1) return 'Krátkodobý pronájem';
    if (p.invest.indexOf('student') > -1) return 'Dlouhodobý nájem, studenti';
    if (p.invest.indexOf('premium') > -1) return 'Vlastní bydlení, premium';
    return 'Dlouhodobý nájem';
  }

  /* ------------------------------------------------------------ PODOBNÉ */
  function similar() {
    var list = D.projects.filter(function (x) {
      return x.id !== p.id && (x.locationId === p.locationId ||
        x.type.some(function (t) { return p.type.indexOf(t) > -1; }));
    }).slice(0, 4);
    if (!list.length) return '';
    return '<section class="section section--rule bleed">' +
      '<div class="section-head">' +
        '<div><span class="section-index">Podobné projekty</span>' +
          '<h2 class="display-3" data-split style="margin-top:18px">Také vás může zajímat</h2></div>' +
        '<div class="section-head__aside">' +
          '<a class="link-arrow" href="index.html">Zpět na mapu ' + I.arrow + '</a></div>' +
      '</div>' +
      '<div class="grid-auto" data-stagger="70">' +
        list.map(function (x) { return C.project(x, { depth: 1 }); }).join('') + '</div>' +
    '</section>';
  }

  /* --------------------------------------------------------------- MOUNT */
  $('#project-root').innerHTML =
    hero() + bar() + '<div id="obsah"></div>' + overview() + gallery() + unitsSection() +
    locationSection() + developerSection() + investSection() + similar();

  /* jednotky — filtrování */
  var ufilter = { status: 'all', layout: null };
  function paintUnits() { $('#utable tbody').innerHTML = unitRows(ufilter); }
  paintUnits();

  UM.on(document, 'click', '.ufilter [data-u]', function (e, t) {
    ufilter.status = t.dataset.u;
    $$('.ufilter [data-u]').forEach(function (b) { b.classList.toggle('is-on', b === t); });
    paintUnits();
  });
  UM.on(document, 'click', '.ufilter [data-layout]', function (e, t) {
    var on = !t.classList.contains('is-on');
    $$('.ufilter [data-layout]').forEach(function (b) { b.classList.remove('is-on'); });
    t.classList.toggle('is-on', on);
    ufilter.layout = on ? t.dataset.layout : null;
    paintUnits();
  });

  /* mapa v detailu — okolní projekty jako kontext */
  var nearby = D.projects.filter(function (x) {
    return Math.abs(x.coords[0] - p.coords[0]) < 0.6 && Math.abs(x.coords[1] - p.coords[1]) < 0.4;
  });
  var dmap = global.UM_MAP.create({
    container: $('#detail-map'),
    bounds: [[p.coords[0] - 0.06, p.coords[1] - 0.035], [p.coords[0] + 0.06, p.coords[1] + 0.035]],
    peekHtml: C.peek,
    onSelect: function (id) { if (id !== p.id) location.href = 'projekt.html?p=' + D.project(id).slug; },
    onReady: function (api) {
      api.setData(nearby.map(function (x) {
        return {
          id: x.id, coords: x.coords, status: x.status, featured: x.id === p.id,
          label: x.id === p.id ? p.name : (x.unitsAvailable ? UM.czk(x.priceFrom, { short: true }) : 'Vyprodáno')
        };
      }));
      api.select(p.id, { fly: false });
    }
  });
  document.addEventListener('um:theme', function (e) { dmap.setTheme(e.detail.theme); });

  /* Score bary naplnit až ve chvíli, kdy je uživatel vidí — jinak by
     animace proběhla mimo obrazovku a hodnota by naskočila bez pohybu. */
  var scoreIO = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var f = e.target;
      f.style.width = f.dataset.w + '%';
      obs.unobserve(f);
    });
  }, { threshold: 0.6 });
  $$('.score__fill').forEach(function (f, i) {
    f.style.transitionDelay = (i % 4) * 120 + 'ms';
    scoreIO.observe(f);
  });

  /* aktivní položka ve sticky liště */
  var sections = ['prehled', 'galerie', 'jednotky', 'lokalita', 'developer', 'investice'];
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      $$('.dbar__nav a').forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id);
      });
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  sections.forEach(function (id) { var n = document.getElementById(id); if (n) spy.observe(n); });

  UM.chrome.bind();
  global.UM_MOTION.splitLines();
  global.UM_MOTION.rebind(document);
  global.UM_MOTION.reveals();
  global.UM_MOTION.counters();
})(window);
