/* ==========================================================================
   URBANMAP — CORE
   Helpery, formátování, ikonografie, theme, chrome (header/footer),
   command-search overlay. Načítá se na všech stránkách.
   ========================================================================== */
(function (global) {
  'use strict';

  var D = global.UM_DATA;

  /* ---------------------------------------------------------------- DOM -- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function on(node, evt, sel, fn) {
    if (typeof sel === 'function') { node.addEventListener(evt, sel); return; }
    node.addEventListener(evt, function (e) {
      var t = e.target.closest(sel);
      if (t && node.contains(t)) fn.call(t, e, t);
    });
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* -------------------------------------------------------------- FORMAT - */
  var nf = new Intl.NumberFormat('cs-CZ');

  /** 6 940 000 → „6,94 mil. Kč" — kompaktní tvar pro karty a markery. */
  function czk(v, opt) {
    opt = opt || {};
    if (v == null) return '—';
    if (v >= 1e6) {
      var m = v / 1e6;
      var s = (m >= 10 ? m.toFixed(1) : m.toFixed(2)).replace(/\.?0+$/, '').replace('.', ',');
      return s + (opt.short ? ' mil.' : ' mil. Kč');
    }
    return nf.format(v) + (opt.short ? '' : ' Kč');
  }
  function czkFull(v) { return nf.format(v) + ' Kč'; }
  function num(v) { return nf.format(v); }
  function m2(v) { return nf.format(v) + ' m²'; }
  function dateCz(iso) {
    var d = new Date(iso);
    return d.getDate() + '. ' + (d.getMonth() + 1) + '. ' + d.getFullYear();
  }
  function plural(n, one, few, many) {
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return few;
    return many;
  }
  function projectsWord(n) { return plural(n, 'projekt', 'projekty', 'projektů'); }
  function resultsWord(n) { return plural(n, 'výsledek', 'výsledky', 'výsledků'); }
  function unitsWord(n) { return plural(n, 'jednotka', 'jednotky', 'jednotek'); }
  function initials(name) {
    return name.split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
  }
  function slugParam(key, fallback) {
    return new URLSearchParams(location.search).get(key) || fallback;
  }

  /* --------------------------------------------------------------- ICONS - */
  var I = {
    search: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="7.2" cy="7.2" r="4.6"/><path d="M10.6 10.6 14 14"/></svg>',
    chev:   '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 3.8 5 6.8l3-3"/></svg>',
    arrow:  '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 6.5h9M7.4 2.8 11.1 6.5 7.4 10.2"/></svg>',
    close:  '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 3l8 8M11 3l-8 8"/></svg>',
    pin:    '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M7 12.6s4.3-4 4.3-7A4.3 4.3 0 0 0 2.7 5.6c0 3 4.3 7 4.3 7Z"/><circle cx="7" cy="5.5" r="1.5"/></svg>',
    map:    '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M1 3.4 5 1.8v8.8L1 12.2zM5 1.8l4 1.6v8.8l-4-1.6M9 3.4l4-1.6v8.8l-4 1.6"/></svg>',
    grid:   '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="1.5" y="1.5" width="4.4" height="4.4"/><rect x="8.1" y="1.5" width="4.4" height="4.4"/><rect x="1.5" y="8.1" width="4.4" height="4.4"/><rect x="8.1" y="8.1" width="4.4" height="4.4"/></svg>',
    list:   '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M1.6 3h10.8M1.6 7h10.8M1.6 11h10.8"/></svg>',
    layers: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M8 1.8 14.2 5 8 8.2 1.8 5zM2.4 8l5.6 2.9L13.6 8M2.4 11l5.6 2.9L13.6 11"/></svg>',
    draw:   '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2.6 9.8 10 2.4l3.1 3.1-7.4 7.4-3.6.5z"/><path d="M2.6 13.4h11"/></svg>',
    plus:   '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M7 2.6v8.8M2.6 7h8.8"/></svg>',
    minus:  '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2.6 7h8.8"/></svg>',
    expand: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M1.8 5.2V1.8h3.4M12.2 8.8v3.4H8.8M8.8 1.8h3.4v3.4M5.2 12.2H1.8V8.8"/></svg>',
    locate: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="7" cy="7" r="3.2"/><path d="M7 .9v2.1M7 11v2.1M.9 7h2.1M11 7h2.1"/></svg>',
    sun:    '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="8" r="3"/><path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1M12.9 12.9l-1.1-1.1M4.2 4.2 3.1 3.1"/></svg>',
    moon:   '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M13.4 9.6A5.8 5.8 0 0 1 6.4 2.6a5.8 5.8 0 1 0 7 7Z"/></svg>',
    check:  '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2.4 6.3 4.7 8.6 9.6 3.7"/></svg>',
    verified: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M7 1.3 8.6 3l2.3-.2.4 2.3 2 1.2-1.2 2 .6 2.2-2.2.7L9 13.1 7 12l-2 1.1-1.5-1.9-2.2-.7.6-2.2-1.2-2 2-1.2.4-2.3L5.4 3z"/><path d="M4.8 7.1 6.3 8.6 9.3 5.6" stroke-width="1.5"/></svg>',
    bldg:   '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2.2 12.4V2.6h5.2v9.8M7.4 12.4V6.2h4.4v6.2M.9 12.4h12.2M4 5h1.6M4 7.4h1.6M4 9.8h1.6M9.2 8.4h1.2M9.2 10.4h1.2"/></svg>',
    doc:    '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 1.6h5l3 3v7.8H3z"/><path d="M8 1.6v3h3M5 7.6h4M5 9.8h4"/></svg>',
    burger: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2.2 4.4h11.6M2.2 8h11.6M2.2 11.6h11.6"/></svg>',
    clock:  '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="7" cy="7" r="5.4"/><path d="M7 3.8V7l2.2 1.4"/></svg>'
  };

  /* --------------------------------------------------------------- THEME - */
  var THEME_KEY = 'um-theme';
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    document.dispatchEvent(new CustomEvent('um:theme', { detail: { theme: t } }));
  }
  function currentTheme() { return document.documentElement.getAttribute('data-theme') || 'light'; }
  function toggleTheme() { applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'); }

  /** Logo. Dvě varianty souborů místo filtru — značka je dvoubarevná,
   *  invertování by posunulo i hnědou. Výška se ladí přes --logo-h. */
  function wordmark(h) {
    return '<a class="wordmark" href="index.html" aria-label="Urbanmap.cz — domů"' +
        (h ? ' style="--logo-h:' + h + '"' : '') + '>' +
      '<img class="logo-l" src="assets/img/urbanmap_logo_na_svetle_pozadi.svg" alt="" width="120" height="20">' +
      '<img class="logo-d" src="assets/img/urbanmap_logo_na_tmave_pozadi.svg" alt="" width="120" height="20">' +
    '</a>';
  }

  /* --------------------------------------------------------------- CHROME */
  var NAV = [
    {
      label: 'Projekty', href: 'index.html',
      items: [
        ['Všechny projekty', 'index.html?view=grid', D.projects.length],
        ['Na mapě', 'index.html', null],
        ['Investiční příležitosti', 'index.html?view=grid&f=invest', 9],
        ['Horské apartmány', 'index.html?view=grid&f=ski', 4],
        ['Luxusní projekty', 'index.html?view=grid&f=premium', 8],
        ['Rodinné bydlení', 'index.html?view=grid&f=houses', 2],
        ['Rekreační bydlení', 'index.html?view=grid&f=leisure', 5]
      ]
    },
    {
      label: 'Lokality', href: 'lokality.html',
      items: [
        ['Kraje', 'lokality.html#kraje', 14],
        ['Města', 'lokality.html#mesta', 9],
        ['Čtvrti', 'lokality.html#ctvrti', 6],
        ['Horské lokality', 'lokality.html#hory', 3],
        ['U vody', 'lokality.html#voda', 2]
      ]
    },
    {
      label: 'Developeři', href: 'developeri.html',
      items: [
        ['Seznam developerů', 'developeri.html', D.developers.length],
        ['Top developeři', 'developeri.html#top', null],
        ['Ověření developeři', 'developeri.html#overeni', 6]
      ]
    },
    {
      label: 'Magazín', href: 'magazin.html',
      items: [
        ['Investice', 'magazin.html#investice', null],
        ['Analýzy', 'magazin.html#analyzy', null],
        ['Lokality', 'magazin.html#lokality', null],
        ['Trendy', 'magazin.html#trendy', null]
      ]
    }
  ];

  function renderHeader(opts) {
    opts = opts || {};
    var navHtml = NAV.map(function (g) {
      return '<div class="nav__item">' +
        '<a class="nav__link" href="' + g.href + '"' + (opts.active === g.label ? ' aria-current="page"' : '') + '>' +
          esc(g.label) + I.chev +
        '</a>' +
        '<div class="nav__panel">' +
          g.items.map(function (it) {
            return '<a href="' + it[1] + '">' + esc(it[0]) +
              (it[2] != null ? '<span class="num">' + it[2] + '</span>' : '') + '</a>';
          }).join('') +
        '</div></div>';
    }).join('');

    return '<header class="header' + (opts.solid ? ' header--solid' : '') + '">' +
      wordmark() +
      '<nav class="nav" aria-label="Hlavní navigace">' + navHtml + '</nav>' +
      '<div class="spacer"></div>' +
      (opts.compactSearch ? '' :
        '<button class="btn btn--quiet js-search" aria-label="Hledat">' + I.search + '</button>') +
      '<button class="btn btn--quiet btn--icon js-theme" aria-label="Přepnout světlý a tmavý režim">' + I.moon + '</button>' +
      '<a class="btn btn--ghost btn--sm" href="pro-developery.html">Pro developery</a>' +
      '<a class="btn btn--primary btn--sm" href="pro-developery.html#pridat">Přidat projekt</a>' +
      '<button class="btn btn--quiet btn--icon js-menu" aria-label="Otevřít menu" aria-expanded="false">' + I.burger + '</button>' +
    '</header>' + renderDrawer();
  }

  /** Mobilní navigace. Obsah sdílí s mega menu — jeden zdroj pravdy (NAV). */
  function renderDrawer() {
    return '<div class="drawer" id="um-drawer" hidden>' +
      '<div class="drawer__panel">' +
        '<div class="drawer__head">' +
          wordmark() +
          '<button class="btn btn--quiet btn--icon js-menu-close" aria-label="Zavřít menu">' + I.close + '</button>' +
        '</div>' +
        '<div class="drawer__body scroller">' +
          '<button class="search-trigger js-search" style="width:100%;margin-bottom:22px">' + I.search +
            '<span>Hledat město, projekt, developera</span></button>' +
          NAV.map(function (g) {
            return '<section class="drawer__group">' +
              '<h4 class="meta">' + esc(g.label) + '</h4>' +
              g.items.map(function (it) {
                return '<a href="' + it[1] + '">' + esc(it[0]) +
                  (it[2] != null ? '<span class="num">' + it[2] + '</span>' : '') + '</a>';
              }).join('') +
            '</section>';
          }).join('') +
        '</div>' +
        '<div class="drawer__foot">' +
          '<a class="btn btn--ghost btn--block" href="pro-developery.html">Pro developery</a>' +
          '<a class="btn btn--primary btn--block" href="pro-developery.html#pridat">Přidat projekt</a>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderFooter() {
    var t = D.totals();
    return '<footer class="footer">' +
      '<div class="bleed">' +
        '<div class="footer__grid">' +
          '<div class="footer__col">' +
            wordmark('42px') +
            '<p class="lead" style="margin-top:20px;max-width:38ch;font-size:var(--t-body)">' +
              'Mapově-datová platforma pro nové developerské projekty v České republice. ' +
              'Najděte nové bydlení nebo investiční příležitost podle lokality.</p>' +
            '<div class="row row--gap" style="margin-top:28px;gap:20px;flex-wrap:wrap">' +
              '<div><span class="meta" style="opacity:.5">Projektů</span><b class="num" style="display:block;font-size:1.25rem;margin-top:6px">' + t.projects + '</b></div>' +
              '<div><span class="meta" style="opacity:.5">Jednotek</span><b class="num" style="display:block;font-size:1.25rem;margin-top:6px">' + num(t.units) + '</b></div>' +
              '<div><span class="meta" style="opacity:.5">Developerů</span><b class="num" style="display:block;font-size:1.25rem;margin-top:6px">' + t.developers + '</b></div>' +
            '</div>' +
          '</div>' +
          '<div class="footer__col"><h4>Projekty</h4><ul>' +
            '<li><a href="index.html">Na mapě</a></li>' +
            '<li><a href="index.html?view=grid">Všechny projekty</a></li>' +
            '<li><a href="index.html?view=grid&f=invest">Investiční příležitosti</a></li>' +
            '<li><a href="index.html?view=grid&f=ski">Horské apartmány</a></li>' +
            '<li><a href="index.html?view=grid&f=premium">Luxusní projekty</a></li>' +
          '</ul></div>' +
          '<div class="footer__col"><h4>Lokality</h4><ul>' +
            '<li><a href="lokalita.html?loc=praha">Novostavby Praha</a></li>' +
            '<li><a href="lokalita.html?loc=brno">Novostavby Brno</a></li>' +
            '<li><a href="lokalita.html?loc=ostrava">Novostavby Ostrava</a></li>' +
            '<li><a href="lokalita.html?loc=spindleruv-mlyn">Špindlerův Mlýn</a></li>' +
            '<li><a href="lokality.html">Všechny lokality</a></li>' +
          '</ul></div>' +
          '<div class="footer__col"><h4>Developeři</h4><ul>' +
            '<li><a href="developeri.html">Seznam developerů</a></li>' +
            '<li><a href="developeri.html#overeni">Ověření developeři</a></li>' +
            '<li><a href="pro-developery.html">Pro developery</a></li>' +
            '<li><a href="pro-developery.html#pridat">Přidat projekt</a></li>' +
          '</ul></div>' +
          '<div class="footer__col"><h4>Platforma</h4><ul>' +
            '<li><a href="magazin.html">Magazín</a></li>' +
            '<li><a href="system.html">Design system</a></li>' +
            '<li><a href="#">O projektu</a></li>' +
            '<li><a href="#">Kontakt</a></li>' +
          '</ul></div>' +
        '</div>' +
        '<div class="footer__bar">' +
          '<span>© 2026 Urbanmap.cz — prototyp</span>' +
          '<span>Data © Urbanmap · Mapové podklady © OpenStreetMap, CARTO</span>' +
        '</div>' +
      '</div>' +
    '</footer>';
  }

  /* ------------------------------------------------------- SEARCH OVERLAY */
  var RECENT_KEY = 'um-recent';
  function recent() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch (e) { return []; }
  }
  function pushRecent(item) {
    try {
      var r = recent().filter(function (x) { return x.label !== item.label; });
      r.unshift(item);
      localStorage.setItem(RECENT_KEY, JSON.stringify(r.slice(0, 5)));
    } catch (e) {}
  }

  /** Diakritika pryč — „Židenice" musí najít i uživatel, který píše „zidenice". */
  function normalize(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  /** Zvýraznění shody. Normalizace nemění počet znaků po odstranění značek,
   *  proto lze index z normalizovaného řetězce použít na původní text. */
  function mark(text, q) {
    if (!q) return esc(text);
    var nt = normalize(text), nq = normalize(q);
    var i = nt.indexOf(nq);
    if (i < 0 || nt.length !== text.length) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + nq.length)) + '</mark>' +
           esc(text.slice(i + nq.length));
  }

  /** Jedno hledání napříč entitami — lokality, projekty, developeři, kategorie. */
  function searchAll(q) {
    var nq = normalize(q), out = { locations: [], projects: [], developers: [], categories: [] };
    if (!nq) return out;
    // Kdo napíše „brno", chce i Židenice a Královo Pole — proto hledáme
    // i v okrese a kraji, ne jen v názvu lokality.
    D.locations.forEach(function (l) {
      var hay = normalize(l.name + ' ' + l.region + ' ' + l.district);
      if (hay.indexOf(nq) > -1) out.locations.push(l);
    });
    D.projects.forEach(function (p) {
      if (normalize(p.name).indexOf(nq) > -1 || normalize(p.address).indexOf(nq) > -1) out.projects.push(p);
    });
    D.developers.forEach(function (d) {
      if (normalize(d.name).indexOf(nq) > -1) out.developers.push(d);
    });
    Object.keys(D.TYPES).forEach(function (k) {
      if (normalize(D.TYPES[k]).indexOf(nq) > -1) out.categories.push({ key: k, label: D.TYPES[k] });
    });
    Object.keys(D.LIFESTYLE).forEach(function (k) {
      if (normalize(D.LIFESTYLE[k]).indexOf(nq) > -1) out.categories.push({ key: k, label: D.LIFESTYLE[k], life: true });
    });
    // Přesná shoda v názvu má přednost před shodou v okrese.
    out.locations.sort(function (a, b) {
      return (normalize(b.name).indexOf(nq) === 0) - (normalize(a.name).indexOf(nq) === 0);
    });
    out.locations = out.locations.slice(0, 6);
    out.projects = out.projects.slice(0, 6);
    out.developers = out.developers.slice(0, 4);
    out.categories = out.categories.slice(0, 4);
    return out;
  }

  var POPULAR = ['praha', 'brno', 'spindleruv-mlyn', 'praha-karlin', 'brno-zidenice', 'lipno-nad-vltavou'];

  var Search = {
    node: null, input: null, body: null, cursor: -1, items: [], onPick: null,

    mount: function () {
      if (Search.node) return;
      Search.node = el(
        '<div class="sheet" role="dialog" aria-modal="true" aria-label="Hledání">' +
          '<div class="cmd">' +
            '<div class="cmd__field">' + I.search +
              '<input type="text" autocomplete="off" spellcheck="false" ' +
                'placeholder="Hledat město, lokalitu, projekt nebo developera">' +
              '<button class="btn btn--quiet btn--sm js-close">Zavřít <span class="kbd">esc</span></button>' +
            '</div>' +
            '<div class="cmd__body scroller"></div>' +
            '<div class="cmd__foot">' +
              '<span><span class="kbd">↑</span><span class="kbd">↓</span> pohyb</span>' +
              '<span><span class="kbd">↵</span> otevřít</span>' +
              '<span><span class="kbd">esc</span> zavřít</span>' +
              '<span style="margin-left:auto">Hledá napříč lokalitami, projekty i developery</span>' +
            '</div>' +
          '</div>' +
        '</div>');
      document.body.appendChild(Search.node);
      Search.input = $('input', Search.node);
      Search.body = $('.cmd__body', Search.node);

      on(Search.node, 'click', function (e) {
        if (e.target === Search.node) Search.close();
      });
      on(Search.node, 'click', '.js-close', function () { Search.close(); });
      Search.input.addEventListener('input', function () { Search.render(Search.input.value); });
      Search.input.addEventListener('keydown', Search.keys);
      on(Search.body, 'click', '.cmd__item', function (e, t) {
        Search.pick(parseInt(t.dataset.i, 10));
      });
      Search.render('');
    },

    open: function (prefill) {
      Search.mount();
      Search.node.classList.add('is-open');
      document.body.classList.add('is-locked');
      Search.input.value = prefill || '';
      Search.render(Search.input.value);
      setTimeout(function () { Search.input.focus(); Search.input.select(); }, 60);
    },

    close: function () {
      if (!Search.node) return;
      Search.node.classList.remove('is-open');
      document.body.classList.remove('is-locked');
    },

    keys: function (e) {
      if (e.key === 'Escape') { Search.close(); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        var dir = e.key === 'ArrowDown' ? 1 : -1;
        Search.cursor = Math.max(0, Math.min(Search.items.length - 1, Search.cursor + dir));
        Search.paintCursor();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        Search.pick(Search.cursor < 0 ? 0 : Search.cursor);
      }
    },

    paintCursor: function () {
      $$('.cmd__item', Search.body).forEach(function (n, i) {
        n.classList.toggle('is-cursor', i === Search.cursor);
        if (i === Search.cursor) n.scrollIntoView({ block: 'nearest' });
      });
    },

    pick: function (i) {
      var it = Search.items[i];
      if (!it) return;
      pushRecent({ label: it.label, type: it.type, ref: it.ref });
      Search.close();
      if (Search.onPick) { Search.onPick(it); return; }
      location.href = it.href;
    },

    render: function (q) {
      var html = '', idx = 0;
      Search.items = [];
      Search.cursor = q ? 0 : -1;

      function group(title, meta, rows) {
        if (!rows.length) return;
        html += '<div class="cmd__group"><div class="cmd__label"><span class="meta">' + title + '</span>' +
          (meta ? '<span class="meta">' + meta + '</span>' : '') + '</div>' + rows.join('') + '</div>';
      }
      function row(it) {
        Search.items.push(it);
        var ico = it.img
          ? '<span class="cmd__ico"><img src="' + it.img + '" alt=""></span>'
          : '<span class="cmd__ico">' + (it.icon || I.pin) + '</span>';
        return '<button class="cmd__item" data-i="' + (idx++) + '">' + ico +
          '<span class="cmd__txt"><span class="cmd__t">' + mark(it.label, q) + '</span>' +
          (it.sub ? '<span class="cmd__s">' + esc(it.sub) + '</span>' : '') + '</span>' +
          (it.meta ? '<span class="cmd__meta">' + esc(it.meta) + '</span>' : '') + '</button>';
      }

      if (!q) {
        var r = recent();
        if (r.length) {
          group('Nedávná hledání', null, r.map(function (x) {
            return row({ label: x.label, type: x.type, ref: x.ref, icon: I.clock, href: hrefFor(x.type, x.ref) });
          }));
        }
        group('Populární lokality', null, POPULAR.map(function (s) {
          var l = D.locationBySlug(s);
          var n = D.projectsInScope(l.id).length;
          return row({
            label: l.name, sub: l.region, type: 'location', ref: l.slug, img: l.img,
            meta: n + ' ' + projectsWord(n), href: 'lokalita.html?loc=' + l.slug
          });
        }));
        group('Vybrané projekty', null, D.projects.filter(function (p) { return p.featured; }).slice(0, 4).map(function (p) {
          var h = D.hydrate(p);
          return row({
            label: p.name, sub: h.loc.name + ' · ' + h.dev.name, type: 'project', ref: p.slug,
            img: p.images[0], meta: 'od ' + czk(p.priceFrom), href: 'projekt.html?p=' + p.slug
          });
        }));
      } else {
        var res = searchAll(q);
        group('Lokality', res.locations.length + ' ' + resultsWord(res.locations.length), res.locations.map(function (l) {
          var n = D.projectsInScope(l.id).length;
          return row({
            label: l.name, sub: l.region + (l.district !== l.name ? ' · ' + l.district : ''),
            type: 'location', ref: l.slug, img: l.img,
            meta: n + ' ' + projectsWord(n), href: 'lokalita.html?loc=' + l.slug
          });
        }));
        group('Projekty', res.projects.length + ' ' + resultsWord(res.projects.length), res.projects.map(function (p) {
          var h = D.hydrate(p);
          return row({
            label: p.name, sub: h.loc.name + ' · ' + h.st.label, type: 'project', ref: p.slug,
            img: p.images[0], meta: 'od ' + czk(p.priceFrom), href: 'projekt.html?p=' + p.slug
          });
        }));
        group('Developeři', null, res.developers.map(function (d) {
          return row({
            label: d.name, sub: d.hq + ' · založeno ' + d.founded, type: 'developer', ref: d.slug,
            icon: I.bldg, meta: d.stats.active + ' aktivních', href: 'developer.html?d=' + d.slug
          });
        }));
        group('Kategorie', null, res.categories.map(function (c) {
          return row({
            label: c.label, sub: c.life ? 'Lifestyle filtr' : 'Typ projektu', type: 'category', ref: c.key,
            icon: I.grid, href: 'index.html?view=grid&f=' + c.key
          });
        }));
        if (!Search.items.length) {
          html = '<div class="cmd__group" style="padding:48px 24px;text-align:center">' +
            '<p class="dim">Pro „' + esc(q) + '" jsme nic nenašli.</p>' +
            '<p class="dim" style="font-size:var(--t-xs);margin-top:8px">Zkuste název města, městské části nebo developera.</p></div>';
        }
      }

      Search.body.innerHTML = html;
      Search.paintCursor();
    }
  };

  function hrefFor(type, ref) {
    if (type === 'location') return 'lokalita.html?loc=' + ref;
    if (type === 'project') return 'projekt.html?p=' + ref;
    if (type === 'developer') return 'developer.html?d=' + ref;
    return 'index.html?view=grid&f=' + ref;
  }

  /* ------------------------------------------------------------ NAV BEHAV */
  function bindChrome(root) {
    root = root || document;

    // Mega menu: hover na desktopu, klik na dotyku
    $$('.nav__item', root).forEach(function (item) {
      var t;
      item.addEventListener('mouseenter', function () {
        clearTimeout(t);
        $$('.nav__item').forEach(function (o) { if (o !== item) o.classList.remove('is-open'); });
        item.classList.add('is-open');
      });
      item.addEventListener('mouseleave', function () {
        t = setTimeout(function () { item.classList.remove('is-open'); }, 140);
      });
      $('.nav__link', item).addEventListener('focus', function () { item.classList.add('is-open'); });
      item.addEventListener('focusout', function (e) {
        if (!item.contains(e.relatedTarget)) item.classList.remove('is-open');
      });
    });

    on(root, 'click', '.js-theme', function () {
      toggleTheme();
      syncThemeIcons();
    });
    on(root, 'click', '.js-search', function () { closeDrawer(); Search.open(); });
    on(document, 'click', '.js-menu', function () { toggleDrawer(); });
    on(document, 'click', '.js-menu-close', function () { closeDrawer(); });
    on(document, 'click', '#um-drawer', function (e) {
      if (e.target.id === 'um-drawer') closeDrawer();
    });
    syncThemeIcons();
  }

  function toggleDrawer() {
    var d = document.getElementById('um-drawer');
    if (!d) return;
    // Zdrojem pravdy je třída, ne atribut hidden — ten se nastavuje až po
    // doběhnutí zavírací animace a rychlé dvojí kliknutí by stav rozhodilo.
    if (d.classList.contains('is-open')) { closeDrawer(); return; }
    clearTimeout(d._hideT);
    d.removeAttribute('hidden');
    void d.offsetWidth;              // vynutí reflow, aby přechod odstartoval
    d.classList.add('is-open');
    document.body.classList.add('is-locked');
    $$('.js-menu').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
  }

  function closeDrawer() {
    var d = document.getElementById('um-drawer');
    if (!d || d.hasAttribute('hidden')) return;
    d.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    $$('.js-menu').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    setTimeout(function () { d.setAttribute('hidden', ''); }, 280);
  }

  function syncThemeIcons() {
    var dark = currentTheme() === 'dark';
    $$('.js-theme').forEach(function (b) { b.innerHTML = dark ? I.sun : I.moon; });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      e.preventDefault(); Search.open();
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault(); Search.open();
    }
    if (e.key === 'Escape') { Search.close(); closeDrawer(); }
  });

  /* ------------------------------------------------------------- EXPORT -- */
  global.UM = {
    $: $, $$: $$, el: el, on: on, esc: esc,
    czk: czk, czkFull: czkFull, num: num, m2: m2, dateCz: dateCz,
    plural: plural, projectsWord: projectsWord, unitsWord: unitsWord, resultsWord: resultsWord,
    initials: initials, slugParam: slugParam, normalize: normalize,
    I: I,
    theme: { apply: applyTheme, current: currentTheme, toggle: toggleTheme, sync: syncThemeIcons },
    chrome: { header: renderHeader, footer: renderFooter, bind: bindChrome },
    search: Search, searchAll: searchAll, hrefFor: hrefFor
  };
})(window);
