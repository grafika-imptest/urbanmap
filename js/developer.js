/* ==========================================================================
   URBANMAP — PROFIL DEVELOPERA
   Developer je samostatná entita: historie, regiony, aktivní portfolio,
   dokončené reference a mapa realizací. Ne řádek pod fotkou projektu.
   ========================================================================== */
(function (global) {
  'use strict';
  var UM = global.UM, D = global.UM_DATA, C = global.UM_CARDS, I = UM.I;
  var $ = UM.$, $$ = UM.$$, esc = UM.esc;

  var d = D.developerBySlug(UM.slugParam('d', 'dbest-living')) || D.developers[0];
  var all = D.projectsByDeveloper(d.id);
  var active = all.filter(function (p) { return D.STATUS[p.status].group === 'active'; });
  var completed = all.filter(function (p) { return D.STATUS[p.status].group === 'completed'; });

  document.title = d.name + ' — profil developera | Urbanmap.cz';
  document.getElementById('chrome-header').innerHTML = UM.chrome.header({ active: 'Developeři' });
  document.getElementById('chrome-footer').innerHTML = UM.chrome.footer();

  var regionsCovered = {};
  all.forEach(function (p) { regionsCovered[D.location(p.locationId).region] = 1; });

  function logo() { return C.devLogo(d); }

  /* Hodnocení jako spojitý pruh — pět zaokrouhlených dílků by z 4,8 udělalo
     pětku, což by hodnotu nadhodnotilo. */
  function stars(r) {
    return '<div class="rating">' +
      '<div class="rating__stars"><i style="width:' + (r / 5 * 100) + '%"></i></div>' +
      '<span class="num" style="font-size:var(--t-sm)">' + String(r).replace('.', ',') + '</span>' +
      '<span class="meta">z 5</span></div>';
  }

  /* ------------------------------------------------------------------ */
  var html =
    '<section class="dev-hero bleed">' +
      '<nav class="dhero__crumbs" style="margin-bottom:32px">' +
        '<a href="index.html" style="color:var(--ink-45)">Urbanmap</a><span style="color:var(--ink-25)">/</span>' +
        '<a href="developeri.html" style="color:var(--ink-45)">Developeři</a><span style="color:var(--ink-25)">/</span>' +
        '<span style="color:var(--ink-70)">' + esc(d.name) + '</span>' +
      '</nav>' +
      '<div class="dev-hero__grid">' +
        '<div>' +
          '<div class="dev-hero__logo">' + logo() + '</div>' +
          '<h1 class="display-2" data-split>' + esc(d.name) + '</h1>' +
          '<div class="row row--gap" style="margin-top:24px;gap:16px;flex-wrap:wrap">' +
            (d.verified ? '<span class="badge badge--accent">' + I.check + ' Ověřený developer</span>' : '<span class="badge badge--outline">Neověřeno</span>') +
            '<span class="meta">' + esc(d.hq) + '</span>' +
            '<span class="meta">Založeno ' + d.founded + '</span>' +
            '<span class="meta">' + esc(d.size) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="section-head__aside">' +
          '<p class="lead">' + esc(d.description) + '</p>' +
          stars(d.rating) +
          '<div class="certs">' +
            (d.certifications.length
              ? d.certifications.map(function (c) { return '<span class="chip" style="pointer-events:none">' + esc(c) + '</span>'; }).join('')
              : '<span class="dim" style="font-size:var(--t-sm)">Bez uvedených certifikací</span>') +
          '</div>' +
          '<a class="btn btn--primary" href="#portfolio">Portfolio projektů</a>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<div id="obsah"></div>' +

    '<section class="section--tight bleed">' +
      '<div class="statline" data-stagger="70">' +
        '<div data-reveal="up"><span class="meta">Dokončené projekty</span><b data-count="' + d.stats.built + '">0</b><span class="sub">od roku ' + d.founded + '</span></div>' +
        '<div data-reveal="up"><span class="meta">Aktivní projekty</span><b data-count="' + d.stats.active + '">0</b><span class="sub">v přípravě a prodeji</span></div>' +
        '<div data-reveal="up"><span class="meta">Postavených jednotek</span><b data-count="' + d.stats.units + '">0</b><span class="sub">bytů, domů, apartmánů</span></div>' +
        '<div data-reveal="up"><span class="meta">Prodáno</span><b data-count="' + d.stats.sold + '">0</b><span class="sub">' + Math.round(d.stats.sold / d.stats.units * 100) + ' % portfolia</span></div>' +
        '<div data-reveal="up"><span class="meta">Krajů působnosti</span><b data-count="' + d.regions.length + '">0</b><span class="sub">' + esc(d.regions[0]) + ' a další</span></div>' +
        '<div data-reveal="up"><span class="meta">Na Urbanmapu</span><b data-count="' + all.length + '">0</b><span class="sub">projektů v databázi</span></div>' +
      '</div>' +
    '</section>' +

    /* --- MAPA REALIZACÍ ------------------------------------------------- */
    '<section class="section section--rule bleed" id="mapa">' +
      '<div class="section-head">' +
        '<div><span class="section-index">Mapa realizací</span>' +
          '<h2 class="display-3" data-split style="margin-top:18px">Kde developer staví</h2></div>' +
        '<div class="section-head__aside">' +
          '<p class="lead" style="font-size:var(--t-body)">Aktivní projekty i dokončené reference na jedné mapě. ' +
            'Rozsah působnosti je jedním z parametrů, podle kterých se dá developer posuzovat.</p>' +
          '<div class="fgroup__chips">' +
            Object.keys(regionsCovered).map(function (r) {
              return '<span class="chip" style="pointer-events:none">' + esc(r) + '</span>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="dmap" data-reveal="fade"><div class="map" id="dev-map"></div></div>' +
    '</section>' +

    /* --- PORTFOLIO ------------------------------------------------------ */
    '<section class="section section--rule bleed" id="portfolio">' +
      '<div class="section-head">' +
        '<div><span class="section-index">Portfolio</span>' +
          '<h2 class="display-3" data-split style="margin-top:18px">Co prodává a co už postavil</h2></div>' +
        '<div class="section-head__aside">' +
          '<p class="lead" style="font-size:var(--t-body)">Dokončené projekty nejsou archiv. ' +
            'Jsou to reference, podle kterých se pozná, jestli developer dodržuje, co slibuje v prospektu.</p>' +
        '</div>' +
      '</div>' +

      '<div class="dev-tabs" role="tablist">' +
        '<button role="tab" aria-selected="true" data-tab="active">Aktivní<span class="num">' + active.length + '</span></button>' +
        '<button role="tab" aria-selected="false" data-tab="completed">Reference<span class="num">' + completed.length + '</span></button>' +
        '<button role="tab" aria-selected="false" data-tab="all">Vše<span class="num">' + all.length + '</span></button>' +
      '</div>' +
      '<div class="grid-auto" id="dev-portfolio" data-stagger="70"></div>' +
    '</section>' +

    /* --- HISTORIE ------------------------------------------------------- */
    '<section class="section section--rule bleed">' +
      '<div class="dsplit">' +
        '<div data-reveal="up">' +
          '<span class="section-index">Profil firmy</span>' +
          '<h2 class="display-3" data-split style="margin-top:18px;margin-bottom:28px">Historie a zázemí</h2>' +
          '<div class="prose"><p>' + esc(d.description) + '</p>' +
            '<p>Firma sídlí v ' + esc(d.hq) + ', působí od roku ' + d.founded +
            ' a má ' + esc(d.size) + '. ' +
            'Za tu dobu dokončila ' + d.stats.built + ' projektů o celkovém objemu ' +
            UM.num(d.stats.units) + ' jednotek.</p></div>' +
        '</div>' +
        '<div data-reveal="up">' +
          '<dl class="kv" style="gap:0">' +
            kv('Sídlo', d.hq) + kv('Založeno', String(d.founded)) + kv('Velikost', d.size) +
            kv('Regiony', d.regions.join(', ')) +
            kv('Hodnocení', String(d.rating).replace('.', ',') + ' / 5') +
            kv('Ověření', d.verified ? 'Ověřený developer' : 'Neověřeno') +
            kv('Certifikace', d.certifications.length ? d.certifications.join(', ') : '—') +
          '</dl>' +
          '<div class="row row--gap" style="margin-top:32px;gap:10px;flex-wrap:wrap">' +
            '<button class="btn btn--primary">Kontaktovat developera</button>' +
            '<button class="btn btn--ghost">Sledovat nové projekty</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    /* --- DALŠÍ DEVELOPEŘI ---------------------------------------------- */
    '<section class="section section--rule bleed">' +
      '<div class="section-head">' +
        '<div><span class="section-index">Další developeři</span>' +
          '<h2 class="display-3" data-split style="margin-top:18px">Srovnatelné firmy</h2></div>' +
        '<div class="section-head__aside">' +
          '<a class="link-arrow" href="developeri.html">Všichni developeři ' + I.arrow + '</a></div>' +
      '</div>' +
      '<div class="grid-auto grid-auto--tight" data-stagger="60">' +
        D.developers.filter(function (x) { return x.id !== d.id; }).slice(0, 4).map(C.developer).join('') +
      '</div>' +
    '</section>';

  function kv(k, v) {
    return '<dt style="padding:14px 0;border-bottom:1px solid var(--line)">' + esc(k) + '</dt>' +
           '<dd style="padding:14px 0;border-bottom:1px solid var(--line)">' + esc(v) + '</dd>';
  }

  $('#developer-root').innerHTML = html;

  /* --- portfolio taby -------------------------------------------------- */
  var sets = { active: active, completed: completed, all: all };
  function paint(key) {
    var list = sets[key];
    $('#dev-portfolio').innerHTML = list.length
      ? list.map(function (p, i) { return C.project(p, { depth: 0.85 + (i % 3) * 0.25 }); }).join('')
      : '<p class="dim" style="grid-column:1/-1;padding:48px 0">V této kategorii zatím nemá developer žádný projekt.</p>';
    $$('#dev-portfolio [data-reveal]').forEach(function (n) { n.classList.add('is-in'); });
    global.UM_MOTION.rebind($('#dev-portfolio'));
    global.UM_MOTION.morphIn($('#dev-portfolio'));
  }
  paint('active');

  UM.on(document, 'click', '.dev-tabs button', function (e, t) {
    $$('.dev-tabs button').forEach(function (b) { b.setAttribute('aria-selected', String(b === t)); });
    paint(t.dataset.tab);
  });

  /* --- mapa realizací --------------------------------------------------- */
  var lons = all.map(function (p) { return p.coords[0]; });
  var lats = all.map(function (p) { return p.coords[1]; });
  var pad = 0.25;
  var bounds = [
    [Math.min.apply(null, lons) - pad, Math.min.apply(null, lats) - pad],
    [Math.max.apply(null, lons) + pad, Math.max.apply(null, lats) + pad]
  ];
  var dmap = global.UM_MAP.create({
    container: $('#dev-map'),
    bounds: bounds,
    peekHtml: C.peek,
    onSelect: function (id) { location.href = 'projekt.html?p=' + D.project(id).slug; },
    onReady: function (api) {
      api.setData(all.map(function (p) {
        return {
          id: p.id, coords: p.coords, status: p.status,
          featured: D.STATUS[p.status].group === 'active',
          label: p.name
        };
      }));
    }
  });
  document.addEventListener('um:theme', function (e) { dmap.setTheme(e.detail.theme); });

  UM.chrome.bind();
  global.UM_MOTION.splitLines();
  global.UM_MOTION.rebind(document);
  global.UM_MOTION.reveals();
  global.UM_MOTION.counters();
})(window);
