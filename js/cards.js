/* ==========================================================================
   URBANMAP — CARD TEMPLATES
   Jedna sada šablon pro mapu, mřížku, seznam i detailové stránky.
   Informace má přednost před dekorací: KDE · CO · CENA · STAV · DOSTUPNOST · KDO
   ========================================================================== */
(function (global) {
  'use strict';
  var UM = global.UM, D = global.UM_DATA, I = UM.I, esc = UM.esc;

  /** Logo developera na plochu, která se mění s režimem.
   *  Když má developer dodanou tmavou variantu, přepínáme mezi dvěma soubory —
   *  je to vždy lepší než invertovat světlou verzi filtrem.
   *  Bez tmavé varianty zůstává fallback přes invert (viz --invert v CSS). */
  function devLogo(d) {
    if (!d.logo) return '<span class="mono-mark">' + esc(UM.initials(d.name)) + '</span>';
    var alt = esc(d.name);
    if (!d.logoDark) {
      return '<img src="' + d.logo + '" alt="' + alt + '"' +
             (d.invertInDark ? ' data-invert="1"' : '') + '>';
    }
    return '<img class="logo-l" src="' + d.logo + '" alt="' + alt + '">' +
           '<img class="logo-d" src="' + d.logoDark + '" alt="' + alt + '">';
  }

  function devMark(dev, cls) {
    if (!dev) return '';
    if (dev.logo) {
      return '<img src="' + dev.logo + '" alt="' + esc(dev.name) + '"' +
             (dev.invertInDark ? ' data-invert="1"' : '') + '>';
    }
    return '<span class="mono-mark' + (cls ? ' ' + cls : '') + '">' + esc(UM.initials(dev.name)) + '</span>';
  }

  function statusPill(p, solid) {
    var st = D.STATUS[p.status];
    return '<span class="status' + (solid ? ' status--solid' : '') + '" data-status="' + p.status + '">' +
           esc(st.label) + '</span>';
  }

  /* -------------------------------------------------------- PROJECT CARD */
  function project(p, opt) {
    opt = opt || {};
    var h = D.hydrate(p);
    var href = 'projekt.html?p=' + p.slug;
    var sold = p.unitsAvailable === 0;

    return '<a class="pcard' + (opt.feature && p.featured ? ' pcard--feature' : '') + '" ' +
              'href="' + href + '" data-px="' + (opt.depth || 1) + '" data-id="' + p.id + '" data-reveal="up">' +
      '<div class="pcard__frame">' +
        '<img class="pcard__img" src="' + p.images[0] + '" alt="' + esc(p.name) + '" loading="lazy" decoding="async">' +
        '<div class="pcard__over">' +
          '<div class="pcard__topline">' +
            statusPill(p, true) +
            (p.premium ? '<span class="badge badge--accent">Premium</span>' : '') +
          '</div>' +
          '<div class="pcard__botline">' +
            '<span class="pcard__dev">' + devMark(h.dev) + esc(h.dev.name) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="pcard__body">' +
        '<div class="pcard__loc">' + I.pin + '<span>' + esc(h.loc.name) + ' · ' + esc(h.loc.district) + '</span></div>' +
        '<h3 class="pcard__name">' + esc(p.name) + '</h3>' +
        '<div class="pcard__data">' +
          '<span class="pcard__price">' + (sold ? 'Vyprodáno' : 'od ' + UM.czk(p.priceFrom)) +
            (sold ? '' : '<small> / ' + UM.num(p.pricePerM2) + ' Kč/m²</small>') + '</span>' +
          '<span class="pcard__units">' + (sold ? p.unitsTotal + ' jednotek' : p.unitsAvailable + ' volných') + '</span>' +
        '</div>' +
      '</div>' +
    '</a>';
  }

  /* ------------------------------------------------------------ LIST ROW */
  function row(p) {
    var h = D.hydrate(p);
    var sold = p.unitsAvailable === 0;
    return '<a class="lrow" href="projekt.html?p=' + p.slug + '" data-id="' + p.id + '">' +
      '<div class="lrow__thumb"><img src="' + p.images[0] + '" alt="" loading="lazy"></div>' +
      '<div>' +
        '<div class="lrow__name">' + esc(p.name) +
          (p.premium ? ' <span class="badge badge--accent" style="vertical-align:2px">Premium</span>' : '') + '</div>' +
        '<div class="lrow__sub">' + esc(h.loc.name) + ' · ' + esc(p.address) + '</div>' +
      '</div>' +
      '<div class="lrow__hide">' +
        '<div class="meta">Developer</div>' +
        '<div style="margin-top:5px;font-size:var(--t-sm)">' + esc(h.dev.name) + '</div>' +
      '</div>' +
      '<div class="lrow__hide">' +
        '<div class="meta">Stav</div>' +
        '<div style="margin-top:5px">' + statusPill(p) + '</div>' +
      '</div>' +
      '<div class="lrow__hide">' +
        '<div class="meta">Dostupnost</div>' +
        '<div class="num" style="margin-top:5px;font-size:var(--t-sm)">' +
          (sold ? '—' : p.unitsAvailable + ' / ' + p.unitsTotal) + '</div>' +
      '</div>' +
      '<div style="text-align:right">' +
        '<div class="meta">Cena od</div>' +
        '<div class="num" style="margin-top:5px;font-size:var(--t-body-l);letter-spacing:-.02em">' +
          (sold ? 'Vyprodáno' : UM.czk(p.priceFrom)) + '</div>' +
      '</div>' +
    '</a>';
  }

  /* ------------------------------------------------------- MAP PEEK CARD */
  function peek(p) {
    var full = D.project(p.id);
    var h = D.hydrate(full);
    return '<div class="mk-peek__img"><img src="' + full.images[0] + '" alt=""></div>' +
      '<div class="mk-peek__body">' +
        '<div class="mk-peek__name">' + esc(full.name) + '</div>' +
        '<div class="cmd__s" style="margin-top:4px">' + esc(h.loc.name) + ' · ' + esc(h.dev.name) + '</div>' +
        '<div class="mk-peek__row">' +
          statusPill(full) +
          '<span class="num" style="font-size:var(--t-sm)">' +
            (full.unitsAvailable ? 'od ' + UM.czk(full.priceFrom) : 'Vyprodáno') + '</span>' +
        '</div>' +
      '</div>';
  }

  /* ------------------------------------------------------- PREVIEW PANEL */
  function preview(p) {
    var h = D.hydrate(p);
    var sold = p.unitsAvailable === 0;
    return '<div class="preview__media">' +
        '<img src="' + p.images[0] + '" alt="' + esc(p.name) + '">' +
        '<button class="preview__close js-preview-close" aria-label="Zavřít náhled">' + I.close + '</button>' +
        '<div class="preview__nav">' + p.images.map(function (_, i) {
          return '<i class="' + (i === 0 ? 'on' : '') + '"></i>';
        }).join('') + '</div>' +
      '</div>' +
      '<div class="preview__body scroller">' +
        '<div class="row" style="justify-content:space-between;gap:12px">' +
          statusPill(p, true) +
          (p.premium ? '<span class="badge badge--accent">Premium</span>' : '') +
        '</div>' +
        '<h2 class="h1" style="margin-top:16px">' + esc(p.name) + '</h2>' +
        '<div class="pcard__loc" style="margin-top:8px">' + I.pin +
          '<span>' + esc(p.address) + '</span></div>' +
        '<p class="lead" style="font-size:var(--t-sm);margin-top:16px">' + esc(p.claim) + '</p>' +
        '<dl class="kv" style="margin-top:24px;padding-top:20px;border-top:1px solid var(--line)">' +
          '<dt>Developer</dt><dd>' + esc(h.dev.name) + (h.dev.verified ? ' <span class="verified">' + I.verified + '</span>' : '') + '</dd>' +
          '<dt>Cena od</dt><dd class="num">' + (sold ? '—' : UM.czkFull(p.priceFrom)) + '</dd>' +
          '<dt>Cena / m²</dt><dd class="num">' + UM.num(p.pricePerM2) + ' Kč</dd>' +
          '<dt>Dispozice</dt><dd>' + p.layouts.join(' · ') + '</dd>' +
          '<dt>Plochy</dt><dd class="num">' + p.sizeRange[0] + '–' + p.sizeRange[1] + ' m²</dd>' +
          '<dt>Dostupnost</dt><dd class="num">' + (sold ? 'Vyprodáno' : p.unitsAvailable + ' z ' + p.unitsTotal) + '</dd>' +
          '<dt>Dokončení</dt><dd>' + esc(p.completion) + '</dd>' +
        '</dl>' +
        '<div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--line)">' +
          '<span class="meta">Investiční skóre lokality</span>' +
          '<div class="score" style="margin-top:12px">' +
            '<div class="score__head"><span style="font-size:var(--t-sm)">' + esc(h.loc.name) + '</span>' +
              '<span class="score__val">' + p.investmentScore + ' / 100</span></div>' +
            '<div class="score__track"><div class="score__fill" style="width:' + p.investmentScore + '%"></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="fgroup__chips" style="margin-top:24px">' +
          p.lifestyle.map(function (k) {
            return '<span class="chip" style="pointer-events:none">' + esc(D.LIFESTYLE[k]) + '</span>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div class="preview__foot">' +
        '<a class="btn btn--primary" style="flex:1" href="projekt.html?p=' + p.slug + '">Zobrazit projekt</a>' +
        '<a class="btn btn--ghost" href="developer.html?d=' + h.dev.slug + '">Developer</a>' +
      '</div>';
  }

  /* --------------------------------------------------------- OTHER CARDS */
  function location(l) {
    var n = D.projectsInScope(l.id).length;
    return '<a class="lcard" href="lokalita.html?loc=' + l.slug + '" data-px="1.1" data-reveal="up">' +
      '<img src="' + l.img + '" alt="" loading="lazy">' +
      '<div class="lcard__body">' +
        '<span class="meta" style="color:rgba(255,255,255,.7)">' + esc(l.region) + '</span>' +
        '<h3 class="lcard__name" style="margin-top:10px">' + esc(l.name) + '</h3>' +
        '<div class="lcard__meta">' +
          '<div>Projekty<b>' + n + '</b></div>' +
          '<div>Cena / m²<b>' + UM.num(l.avgM2) + '</b></div>' +
          '<div>Meziročně<b>+' + String(l.yoy).replace('.', ',') + ' %</b></div>' +
        '</div>' +
      '</div>' +
    '</a>';
  }

  function developer(d) {
    return '<a class="dcard" href="developer.html?d=' + d.slug + '" data-reveal="up">' +
      '<div class="dcard__logo">' + devLogo(d) + '</div>' +
      '<div>' +
        '<div class="row" style="gap:8px">' +
          '<h3 class="h2">' + esc(d.name) + '</h3>' +
          (d.verified ? '<span class="verified" title="Ověřený developer">' + I.verified + '</span>' : '') +
        '</div>' +
        '<div class="meta" style="margin-top:7px">' + esc(d.hq) + ' · od ' + d.founded + '</div>' +
      '</div>' +
      '<div class="dcard__stats">' +
        '<div><span class="meta">Dokončeno</span><b>' + d.stats.built + '</b></div>' +
        '<div><span class="meta">Aktivní</span><b>' + d.stats.active + '</b></div>' +
        '<div><span class="meta">Hodnocení</span><b>' + String(d.rating).replace('.', ',') + '</b></div>' +
      '</div>' +
    '</a>';
  }

  function article(a, opt) {
    opt = opt || {};
    return '<a class="acard" href="#" data-px="0.8" data-reveal="up">' +
      '<div class="acard__frame"><img src="' + a.img + '" alt="" loading="lazy"></div>' +
      '<div>' +
        '<div class="row" style="gap:12px">' +
          '<span class="meta meta--accent">' + esc(a.category) + '</span>' +
          '<span class="meta">' + UM.dateCz(a.date) + '</span>' +
          '<span class="meta">' + a.readMin + ' min</span>' +
        '</div>' +
        '<h3 class="acard__title" style="margin-top:12px">' + esc(a.title) + '</h3>' +
        (opt.perex !== false ? '<p class="lead" style="font-size:var(--t-sm);margin-top:10px">' + esc(a.perex) + '</p>' : '') +
      '</div>' +
    '</a>';
  }

  global.UM_CARDS = {
    project: project, row: row, peek: peek, preview: preview,
    location: location, developer: developer, article: article,
    devMark: devMark, devLogo: devLogo, statusPill: statusPill
  };
})(window);
