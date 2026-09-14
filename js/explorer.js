/* ==========================================================================
   URBANMAP — EXPLORER
   --------------------------------------------------------------------------
   Stavový stroj domovské stránky: filtry → výsledky → mapa → náhled.
   Jediný zdroj pravdy je `state`; mapa i seznam jsou jeho projekce.
   Stav se zrcadlí do URL, takže filtrovaný pohled je sdílitelný odkaz.
   ========================================================================== */
(function (global) {
  'use strict';

  var UM = global.UM, D = global.UM_DATA, C = global.UM_CARDS, I = UM.I;
  var $ = UM.$, $$ = UM.$$, esc = UM.esc;

  var PRICE_MIN = 2500000, PRICE_MAX = 70000000;
  var SIZE_MIN = 28, SIZE_MAX = 300;

  var state = {
    q: '',
    locations: [],
    price: [PRICE_MIN, PRICE_MAX],
    layouts: [],
    size: [SIZE_MIN, SIZE_MAX],
    status: [],
    types: [],
    invest: [],
    lifestyle: [],
    area: null,          // [[minLon,minLat],[maxLon,maxLat]] z kreslení do mapy
    sort: 'relevance',
    view: 'map',
    selected: null,
    hover: null
  };

  var map = null, els = {}, morphNext = false;

  /* ======================================================= FILTER ENGINE */
  function match(p) {
    if (state.q) {
      var nq = UM.normalize(state.q);
      var hay = UM.normalize(p.name + ' ' + p.address + ' ' + D.location(p.locationId).name + ' ' + D.developer(p.developerId).name);
      if (hay.indexOf(nq) < 0) return false;
    }
    if (state.locations.length && state.locations.indexOf(p.locationId) < 0) {
      // Projekt patří i pod nadřazené město (Karlín → Praha).
      var parent = D.location(p.locationId).parent;
      if (!parent || state.locations.indexOf(parent) < 0) return false;
    }
    if (p.priceFrom > state.price[1] || p.priceTo < state.price[0]) return false;
    if (p.sizeRange[0] > state.size[1] || p.sizeRange[1] < state.size[0]) return false;
    if (state.layouts.length && !state.layouts.some(function (l) { return p.layouts.indexOf(l) > -1; })) return false;
    if (state.status.length && state.status.indexOf(p.status) < 0) return false;
    if (state.types.length && !state.types.some(function (t) { return p.type.indexOf(t) > -1; })) return false;
    if (state.invest.length && !state.invest.every(function (t) { return p.invest.indexOf(t) > -1; })) return false;
    if (state.lifestyle.length && !state.lifestyle.every(function (t) { return p.lifestyle.indexOf(t) > -1; })) return false;
    if (state.area) {
      var a = state.area;
      if (p.coords[0] < a[0][0] || p.coords[0] > a[1][0] ||
          p.coords[1] < a[0][1] || p.coords[1] > a[1][1]) return false;
    }
    return true;
  }

  var SORTS = {
    relevance:  function (a, b) { return (b.featured - a.featured) || (b.investmentScore - a.investmentScore); },
    priceAsc:   function (a, b) { return a.priceFrom - b.priceFrom; },
    priceDesc:  function (a, b) { return b.priceFrom - a.priceFrom; },
    available:  function (a, b) { return b.unitsAvailable - a.unitsAvailable; },
    investment: function (a, b) { return b.investmentScore - a.investmentScore; },
    newest:     function (a, b) { return D.STATUS[a.status].order - D.STATUS[b.status].order; }
  };

  function results() {
    return D.projects.filter(match).sort(SORTS[state.sort] || SORTS.relevance);
  }

  function activeCount() {
    var n = 0;
    if (state.locations.length) n++;
    if (state.price[0] > PRICE_MIN || state.price[1] < PRICE_MAX) n++;
    if (state.layouts.length) n++;
    if (state.size[0] > SIZE_MIN || state.size[1] < SIZE_MAX) n++;
    if (state.status.length) n++;
    if (state.types.length) n++;
    if (state.invest.length) n++;
    if (state.lifestyle.length) n++;
    if (state.area) n++;
    return n;
  }

  /* ============================================================ FILTER UI */
  var FILTERS = [
    { key: 'locations', label: 'Lokalita' },
    { key: 'price',     label: 'Cena' },
    { key: 'layouts',   label: 'Dispozice' },
    { key: 'size',      label: 'Velikost' },
    { key: 'status',    label: 'Stav' },
    { key: 'types',     label: 'Typ' },
    { key: 'invest',    label: 'Investice' },
    { key: 'lifestyle', label: 'Lifestyle' }
  ];

  function chips(list, selected, dataKey) {
    return list.map(function (o) {
      var on = selected.indexOf(o.key) > -1;
      return '<button class="chip' + (o.soon ? ' chip--soon' : '') + '" data-f="' + dataKey + '" ' +
        'data-v="' + o.key + '" aria-pressed="' + on + '"' + (o.soon ? ' disabled' : '') + '>' +
        esc(o.label) + (o.count != null ? '<span class="chip__count">' + o.count + '</span>' : '') + '</button>';
    }).join('');
  }

  function countFor(fn) {
    return D.projects.filter(fn).length;
  }

  function panelHtml(key) {
    if (key === 'locations') {
      var kinds = [
        ['Města', 'city'], ['Městské části', 'quarter'], ['Horské lokality', 'mountain'],
        ['U vody', 'water'], ['Obce', 'town']
      ];
      return kinds.map(function (k) {
        var list = D.locations.filter(function (l) { return l.kind === k[1]; }).map(function (l) {
          return { key: l.id, label: l.name, count: D.projectsInScope(l.id).length };
        });
        if (!list.length) return '';
        return '<div class="fgroup"><div class="fgroup__title"><span class="meta">' + k[0] + '</span>' +
          '<span class="meta">' + list.length + '</span></div>' +
          '<div class="fgroup__chips">' + chips(list, state.locations, 'locations') + '</div></div>';
      }).join('') +
      '<div class="fgroup"><div class="fgroup__title"><span class="meta">Kreslení do mapy</span></div>' +
        '<p class="fgroup__note">Vymezte oblast přímo v mapě a filtrujte projekty uvnitř ní. ' +
        'Výběr se propíše do filtru jako souřadnice, takže je přenositelný do dotazu na backend.</p>' +
        '<button class="btn btn--ghost btn--sm js-draw" style="align-self:flex-start">' + I.draw + ' Kreslit oblast</button>' +
      '</div>' +
      '<div class="fgroup"><div class="fgroup__title"><span class="meta">Vzdálenost od bodu</span></div>' +
        '<p class="fgroup__note">Zadejte adresu nebo bod v mapě a omezte výsledky poloměrem. ' +
        'Napojení na geokodér ve fázi 2.</p>' +
        '<div class="fgroup__chips">' +
          '<span class="chip chip--soon">do 5 km</span><span class="chip chip--soon">do 15 km</span>' +
          '<span class="chip chip--soon">do 30 km</span></div>' +
      '</div>';
    }

    if (key === 'price')  return rangeHtml('price', PRICE_MIN, PRICE_MAX, 100000, 'Cena od', function (v) { return UM.czk(v); }, 'priceFrom');
    if (key === 'size')   return rangeHtml('size', SIZE_MIN, SIZE_MAX, 2, 'Podlahová plocha', function (v) { return v + ' m²'; }, null);

    if (key === 'layouts') {
      var list = D.LAYOUTS.map(function (l) {
        return { key: l, label: l, count: countFor(function (p) { return p.layouts.indexOf(l) > -1; }) };
      });
      return '<div class="fgroup"><div class="fgroup__title"><span class="meta">Dispozice</span></div>' +
        '<div class="fgroup__chips">' + chips(list, state.layouts, 'layouts') + '</div>' +
        '<p class="fgroup__note">Filtr pracuje s nabídkou jednotek v projektu, ne s typem projektu.</p></div>';
    }

    if (key === 'status') {
      var act = ['planned', 'presale', 'selling'].map(function (k) {
        return { key: k, label: D.STATUS[k].label, count: countFor(function (p) { return p.status === k; }) };
      });
      var done = ['done', 'sold'].map(function (k) {
        return { key: k, label: D.STATUS[k].label, count: countFor(function (p) { return p.status === k; }) };
      });
      return '<div class="fgroup"><div class="fgroup__title"><span class="meta">Aktivní projekty</span></div>' +
          '<div class="fgroup__chips">' + chips(act, state.status, 'status') + '</div></div>' +
        '<div class="fgroup"><div class="fgroup__title"><span class="meta">Reference</span></div>' +
          '<div class="fgroup__chips">' + chips(done, state.status, 'status') + '</div>' +
          '<p class="fgroup__note">Dokončené a vyprodané projekty nejsou mrtvý obsah — ukazují, ' +
          'co developer skutečně postavil.</p></div>';
    }

    if (key === 'types') {
      var list2 = Object.keys(D.TYPES).map(function (k) {
        return { key: k, label: D.TYPES[k], count: countFor(function (p) { return p.type.indexOf(k) > -1; }) };
      });
      return '<div class="fgroup"><div class="fgroup__title"><span class="meta">Typ projektu</span></div>' +
        '<div class="fgroup__chips">' + chips(list2, state.types, 'types') + '</div></div>';
    }

    if (key === 'invest') {
      var list3 = Object.keys(D.INVEST).map(function (k) {
        return {
          key: k, label: D.INVEST[k].label, soon: D.INVEST[k].soon,
          count: D.INVEST[k].soon ? null : countFor(function (p) { return p.invest.indexOf(k) > -1; })
        };
      });
      return '<div class="fgroup" style="grid-column:1 / -1">' +
        '<div class="fgroup__title"><span class="meta">Investiční parametry</span>' +
          '<span class="meta">Fáze 2</span></div>' +
        '<div class="fgroup__chips">' + chips(list3, state.invest, 'invest') + '</div>' +
        '<p class="fgroup__note">Atributy označené „brzy" čekají na datový model investičního scoringu ' +
        '(růst lokality, yield, tempo prodeje). UI je připravené, data se dopočítají z transakcí a nájmů — ' +
        'do té doby zde nejsou žádné odhady.</p></div>';
    }

    if (key === 'lifestyle') {
      var list4 = Object.keys(D.LIFESTYLE).map(function (k) {
        return { key: k, label: D.LIFESTYLE[k], count: countFor(function (p) { return p.lifestyle.indexOf(k) > -1; }) };
      });
      return '<div class="fgroup" style="grid-column:1 / -1">' +
        '<div class="fgroup__title"><span class="meta">Lifestyle</span></div>' +
        '<div class="fgroup__chips">' + chips(list4, state.lifestyle, 'lifestyle') + '</div>' +
        '<p class="fgroup__note">Kombinace se sčítá — vybrané vlastnosti musí projekt splňovat všechny.</p></div>';
    }
    return '';
  }

  function rangeHtml(key, min, max, step, title, fmt, histField) {
    var v = state[key];
    var hist = '';
    if (histField) {
      var buckets = new Array(28).fill(0);
      D.projects.forEach(function (p) {
        var i = Math.min(27, Math.floor(((p[histField] - min) / (max - min)) * 28));
        if (i >= 0) buckets[i]++;
      });
      var top = Math.max.apply(null, buckets) || 1;
      hist = '<div class="range__hist">' + buckets.map(function (b, i) {
        var lo = min + (i / 28) * (max - min), hi = min + ((i + 1) / 28) * (max - min);
        var inRange = hi >= v[0] && lo <= v[1];
        return '<i class="' + (inRange ? 'in' : '') + '" style="height:' + Math.max(8, (b / top) * 100) + '%"></i>';
      }).join('') + '</div>';
    }
    return '<div class="fgroup" style="grid-column:span 2">' +
      '<div class="fgroup__title"><span class="meta">' + title + '</span>' +
        '<span class="meta">' + (histField ? 'rozložení nabídky' : '') + '</span></div>' +
      '<div class="range" data-range="' + key + '">' +
        hist +
        '<div class="range__track">' +
          '<div class="range__rail"></div><div class="range__fill"></div>' +
          '<input type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + v[0] + '" data-i="0" aria-label="Minimum">' +
          '<input type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + v[1] + '" data-i="1" aria-label="Maximum">' +
        '</div>' +
        '<div class="range__vals"><b data-out="0">' + fmt(v[0]) + '</b>' +
          '<span class="dim" style="font-size:var(--t-xs)">až</span>' +
          '<b data-out="1">' + fmt(v[1]) + '</b></div>' +
      '</div>' +
    '</div>' +
    (key === 'price' ? '<div class="fgroup"><div class="fgroup__title"><span class="meta">Rychlá volba</span></div>' +
      '<div class="fgroup__chips">' +
        '<button class="chip" data-preset="0,6000000">do 6 mil.</button>' +
        '<button class="chip" data-preset="6000000,10000000">6–10 mil.</button>' +
        '<button class="chip" data-preset="10000000,20000000">10–20 mil.</button>' +
        '<button class="chip" data-preset="20000000,70000000">nad 20 mil.</button>' +
      '</div></div>' : '');
  }

  var fmtFor = {
    price: function (v) { return UM.czk(v); },
    size: function (v) { return v + ' m²'; }
  };

  /** force = překreslit obsah bez přepínání. Bez toho by překreslení
   *  po změně hodnoty panel zavřelo, protože klik na stejný filtr toggluje. */
  function openPanel(key, force) {
    var panel = els.fpanel;
    if (!force && panel.dataset.key === key && panel.classList.contains('is-open')) { closePanel(); return; }
    panel.dataset.key = key;
    panel.innerHTML = '<div class="fpanel__inner">' + panelHtml(key) + '</div>' +
      '<div class="fpanel__foot">' +
        '<button class="btn btn--quiet btn--sm js-clear-one">Zrušit tento filtr</button>' +
        '<div class="spacer"></div>' +
        '<span class="meta js-panel-count"></span>' +
        '<button class="btn btn--primary btn--sm js-apply">Zobrazit výsledky</button>' +
      '</div>';
    panel.classList.add('is-open');
    $$('.fbtn', els.rail).forEach(function (b) { b.setAttribute('aria-expanded', String(b.dataset.f === key)); });
    bindRanges();
    updatePanelCount();
  }

  function closePanel() {
    els.fpanel.classList.remove('is-open');
    $$('.fbtn', els.rail).forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
  }

  function updatePanelCount() {
    var n = results().length;
    $$('.js-panel-count', els.fpanel).forEach(function (s) {
      s.textContent = n + ' ' + UM.projectsWord(n);
    });
  }

  function bindRanges() {
    $$('.range', els.fpanel).forEach(function (wrap) {
      var key = wrap.dataset.range;
      var inputs = $$('input[type=range]', wrap);
      var fill = $('.range__fill', wrap);
      var min = parseFloat(inputs[0].min), max = parseFloat(inputs[0].max);

      function paint() {
        var a = Math.min(+inputs[0].value, +inputs[1].value);
        var b = Math.max(+inputs[0].value, +inputs[1].value);
        state[key] = [a, b];
        fill.style.left = ((a - min) / (max - min) * 100) + '%';
        fill.style.width = ((b - a) / (max - min) * 100) + '%';
        $('[data-out="0"]', wrap).textContent = fmtFor[key](a);
        $('[data-out="1"]', wrap).textContent = fmtFor[key](b);
        $$('.range__hist i', wrap).forEach(function (bar, i) {
          var lo = min + (i / 28) * (max - min), hi = min + ((i + 1) / 28) * (max - min);
          bar.classList.toggle('in', hi >= a && lo <= b);
        });
      }
      inputs.forEach(function (inp) {
        inp.addEventListener('input', function () { paint(); updatePanelCount(); });
        inp.addEventListener('change', function () { paint(); apply(); });
      });
      paint();
    });
  }

  /* ============================================================== RENDER */
  function renderRail() {
    els.rail.innerHTML =
      FILTERS.map(function (f) {
        return '<button class="fbtn" data-f="' + f.key + '" aria-expanded="false">' +
          '<span class="fbtn__dot"></span>' + esc(f.label) + I.chev + '</button>';
      }).join('') +
      '<div class="rail__sep"></div>' +
      '<button class="fbtn js-save" title="Uložit toto hledání">' + I.plus + ' Uložit hledání</button>' +
      '<button class="fbtn has-value js-area js-clear-area" hidden>' +
        '<span class="fbtn__dot"></span>Vlastní oblast ' + I.close + '</button>' +
      '<div class="rail__reset"><button class="btn btn--quiet btn--sm js-reset" hidden>Zrušit filtry <span class="js-reset-n num"></span></button></div>';
    syncRail();
  }

  function syncRail() {
    var map2 = {
      locations: state.locations.length,
      price: (state.price[0] > PRICE_MIN || state.price[1] < PRICE_MAX) ? 1 : 0,
      layouts: state.layouts.length,
      size: (state.size[0] > SIZE_MIN || state.size[1] < SIZE_MAX) ? 1 : 0,
      status: state.status.length,
      types: state.types.length,
      invest: state.invest.length,
      lifestyle: state.lifestyle.length
    };
    $$('.fbtn[data-f]', els.rail).forEach(function (b) {
      b.classList.toggle('has-value', !!map2[b.dataset.f]);
    });
    var areaBtn = $('.js-area', els.rail);
    if (areaBtn) areaBtn.hidden = !state.area;

    var n = activeCount();
    var reset = $('.js-reset', els.rail);
    if (reset) {
      reset.hidden = !n;
      $('.js-reset-n', reset).textContent = n ? '(' + n + ')' : '';
    }
  }

  function renderResults() {
    var list = results();
    var featured = state.view === 'grid';

    els.count.innerHTML = '<b>' + list.length + '</b> ' + UM.projectsWord(list.length) +
      (state.q ? ' pro „' + esc(state.q) + '"' : '') +
      ' <span class="dim">·</span> <span class="dim">' +
      UM.num(list.reduce(function (a, p) { return a + p.unitsAvailable; }, 0)) + ' volných jednotek</span>';

    if (!list.length) {
      els.inner.innerHTML = '<div class="results__empty" style="grid-column:1/-1">' +
        '<p class="display-3">Žádný projekt neodpovídá</p>' +
        '<p class="lead" style="margin:12px auto 24px">Zkuste rozvolnit cenu nebo vybrat širší lokalitu.</p>' +
        '<button class="btn btn--ghost js-reset">Zrušit všechny filtry</button></div>';
    } else {
      els.inner.innerHTML = list.map(function (p, i) {
        return C.project(p, { feature: featured, depth: 0.85 + (i % 3) * 0.22 }) + C.row(p);
      }).join('');
    }

    $$('[data-reveal]', els.inner).forEach(function (n) { n.classList.add('is-in'); });
    global.UM_MOTION.rebind(els.inner);
    // Stagger jen při skutečné změně pohledu, ne při každém přefiltrování —
    // jinak by se karty při každém kliknutí do filtru znovu „nadechovaly".
    if (morphNext) { global.UM_MOTION.morphIn(els.inner); morphNext = false; }

    if (map) {
      map.setData(list.map(function (p) {
        return {
          id: p.id, coords: p.coords, status: p.status, featured: p.featured,
          label: p.unitsAvailable ? UM.czk(p.priceFrom, { short: true }) : 'Vyprodáno'
        };
      }));
    }
    syncRail();
  }

  /* ============================================================ PREVIEW */
  function openPreview(id) {
    var p = D.project(id);
    if (!p) return;
    state.selected = id;
    els.preview.innerHTML = C.preview(p);
    els.preview.classList.add('is-open');
    if (map) map.select(id, { fly: true, offsetX: window.innerWidth > 1024 ? 160 : 0 });
    highlightCard(id);
    cyclePreviewImages(p);
  }

  var cycleTimer = null;
  function cyclePreviewImages(p) {
    clearInterval(cycleTimer);
    if (global.UM_MOTION.reduced) return;
    var i = 0;
    var img = $('.preview__media img', els.preview);
    var dots = $$('.preview__nav i', els.preview);
    cycleTimer = setInterval(function () {
      if (!els.preview.classList.contains('is-open')) { clearInterval(cycleTimer); return; }
      i = (i + 1) % p.images.length;
      img.style.opacity = '0';
      setTimeout(function () {
        img.src = p.images[i];
        img.style.transition = 'opacity 420ms var(--e-out)';
        img.style.opacity = '1';
      }, 220);
      dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    }, 3600);
  }

  function closePreview() {
    els.preview.classList.remove('is-open');
    state.selected = null;
    clearInterval(cycleTimer);
    if (map) map.select(null);
    highlightCard(null);
  }

  function highlightCard(id) {
    $$('.pcard, .lrow', els.inner).forEach(function (c) {
      c.classList.toggle('is-hi', !!id && c.dataset.id === id);
    });
    var card = id ? $('.pcard[data-id="' + id + '"]', els.inner) : null;
    if (card && els.body.scrollHeight > els.body.clientHeight) {
      card.scrollIntoView({ block: 'nearest', behavior: global.UM_MOTION.reduced ? 'auto' : 'smooth' });
    }
  }

  /* =============================================================== VIEW */
  function setView(v) {
    state.view = v;
    morphNext = true;
    els.explorer.dataset.view = v;
    $$('.js-view .seg__btn').forEach(function (b) {
      b.setAttribute('aria-selected', String(b.dataset.view === v));
    });
    if (v !== 'map') closePreview();
    renderResults();
    if (v === 'map' && map) setTimeout(function () { map.resize(); }, 420);
    syncUrl();
  }

  /* ================================================================ URL */
  function syncUrl() {
    var q = new URLSearchParams();
    if (state.view !== 'map') q.set('view', state.view);
    if (state.q) q.set('q', state.q);
    if (state.status.length) q.set('status', state.status.join(','));
    if (state.types.length) q.set('type', state.types.join(','));
    if (state.locations.length) q.set('loc', state.locations.join(','));
    var s = q.toString();
    history.replaceState(null, '', s ? '?' + s : location.pathname);
  }

  function readUrl() {
    var q = new URLSearchParams(location.search);
    if (q.get('view')) state.view = q.get('view');
    if (q.get('q')) state.q = q.get('q');
    if (q.get('status')) state.status = q.get('status').split(',');
    if (q.get('type')) state.types = q.get('type').split(',');
    if (q.get('loc')) state.locations = q.get('loc').split(',');

    // Zkratky z navigace: index.html?view=grid&f=ski
    var f = q.get('f');
    if (f) {
      if (D.TYPES[f]) state.types = [f];
      else if (D.LIFESTYLE[f]) state.lifestyle = [f];
      else if (f === 'premium') state.invest = ['premium'];
      else if (f === 'invest') state.types = ['invest'];
    }
  }

  function apply() {
    renderResults();
    updatePanelCount();
    syncUrl();
  }

  function resetAll() {
    state.q = ''; state.locations = []; state.layouts = []; state.status = [];
    state.types = []; state.invest = []; state.lifestyle = [];
    state.price = [PRICE_MIN, PRICE_MAX];
    state.size = [SIZE_MIN, SIZE_MAX];
    state.area = null;
    if (map) map.clearDraw();
    closePanel();
    updateSearchTrigger();
    apply();
  }

  function updateSearchTrigger() {
    var t = $('.search-trigger span');
    if (t) t.textContent = state.q || 'Hledat město, lokalitu, projekt nebo developera';
    $$('.command__quick .chip').forEach(function (c) {
      var on = c.dataset.qstatus ? state.status.indexOf(c.dataset.qstatus) > -1
             : c.dataset.qtype ? state.types.indexOf(c.dataset.qtype) > -1
             : c.dataset.qinvest ? state.invest.indexOf(c.dataset.qinvest) > -1 : false;
      c.setAttribute('aria-pressed', String(on));
    });
  }

  /* =============================================================== INIT */
  function init() {
    els.explorer = $('.explorer');
    els.rail = $('.rail');
    els.fpanel = $('.fpanel');
    els.inner = $('.results__inner');
    els.body = $('.results__body');
    els.count = $('.results__count');
    els.preview = $('.preview');

    readUrl();
    renderRail();
    els.explorer.dataset.view = state.view;
    $$('.js-view .seg__btn').forEach(function (b) {
      b.setAttribute('aria-selected', String(b.dataset.view === state.view));
    });

    /* --- mapa ---------------------------------------------------------- */
    map = global.UM_MAP.create({
      container: $('.map'),
      gate: $('.map-gate'),
      fallbackEl: $('.map-fallback'),
      peekHtml: C.peek,
      onSelect: function (id) { openPreview(id); },
      onHover: function (id) { state.hover = id; highlightCard(id || state.selected); },
      onReady: function () { renderResults(); },
      onDraw: function (bounds) {
        state.area = bounds;
        var btn = $('.js-draw-map');
        if (btn) btn.classList.remove('is-on');
        var hint = $('.js-draw-hint');
        if (hint) hint.hidden = true;
        map.setDrawMode(false);
        apply();
      }
    });
    global.UM_MAP_INSTANCE = map;

    document.addEventListener('um:theme', function (e) {
      if (map) map.setTheme(e.detail.theme);
    });

    /* --- rail / panel --------------------------------------------------- */
    UM.on(els.rail, 'click', '.fbtn[data-f]', function (e, t) { openPanel(t.dataset.f); });
    UM.on(document, 'click', '.js-reset', function () { resetAll(); });
    UM.on(els.rail, 'click', '.js-save', function (e, t) {
      t.innerHTML = I.check + ' Hledání uloženo';
      t.classList.add('has-value');
      setTimeout(function () { t.innerHTML = I.plus + ' Uložit hledání'; t.classList.remove('has-value'); }, 2200);
    });

    UM.on(els.fpanel, 'click', '.chip[data-f]', function (e, t) {
      var key = t.dataset.f, v = t.dataset.v;
      var arr = state[key];
      var i = arr.indexOf(v);
      if (i > -1) arr.splice(i, 1); else arr.push(v);
      t.setAttribute('aria-pressed', String(i < 0));
      apply();
    });
    UM.on(els.fpanel, 'click', '[data-preset]', function (e, t) {
      var v = t.dataset.preset.split(',').map(Number);
      state.price = [Math.max(PRICE_MIN, v[0]), Math.min(PRICE_MAX, v[1])];
      openPanel('price', true);
      apply();
    });
    UM.on(els.fpanel, 'click', '.js-apply', function () { closePanel(); });
    UM.on(els.fpanel, 'click', '.js-clear-one', function () {
      var key = els.fpanel.dataset.key;
      if (key === 'price') state.price = [PRICE_MIN, PRICE_MAX];
      else if (key === 'size') state.size = [SIZE_MIN, SIZE_MAX];
      else state[key] = [];
      openPanel(key, true);
      apply();
    });
    UM.on(els.fpanel, 'click', '.js-draw', function (e, t) {
      closePanel();
      var btn = $('.js-draw-map');
      if (btn) btn.click();
    });

    document.addEventListener('click', function (e) {
      if (!els.fpanel.classList.contains('is-open')) return;
      // Klik uvnitř panelu mohl panel překreslit — cíl je pak už odpojený
      // z dokumentu a closest() by ho nesprávně vyhodnotil jako klik venku.
      if (!document.documentElement.contains(e.target)) return;
      if (!e.target.closest('.fpanel') && !e.target.closest('.rail')) closePanel();
    });

    /* --- hledání -------------------------------------------------------- */
    UM.search.onPick = function (item) {
      if (item.type === 'location') {
        var loc = D.locationBySlug(item.ref);
        state.locations = [loc.id];
        state.q = '';
        apply();
        if (map) map.flyTo(loc.coords, loc.kind === 'city' ? 11.5 : 13);
        setView('map');
      } else if (item.type === 'project') {
        location.href = 'projekt.html?p=' + item.ref;
      } else if (item.type === 'developer') {
        location.href = 'developer.html?d=' + item.ref;
      } else {
        if (D.TYPES[item.ref]) state.types = [item.ref];
        else if (D.LIFESTYLE[item.ref]) state.lifestyle = [item.ref];
        apply();
      }
      updateSearchTrigger();
    };

    UM.on(document, 'click', '.search-trigger', function () { UM.search.open(state.q); });

    UM.on(document, 'click', '.command__quick .chip', function (e, t) {
      var toggle = function (arr, v) {
        var i = arr.indexOf(v);
        if (i > -1) arr.splice(i, 1); else arr.push(v);
      };
      if (t.dataset.qstatus) toggle(state.status, t.dataset.qstatus);
      if (t.dataset.qtype) toggle(state.types, t.dataset.qtype);
      if (t.dataset.qinvest) toggle(state.invest, t.dataset.qinvest);
      updateSearchTrigger();
      apply();
    });

    /* --- view / sort ---------------------------------------------------- */
    UM.on(document, 'click', '.js-view .seg__btn', function (e, t) { setView(t.dataset.view); });
    UM.on(document, 'change', '.js-sort', function (e, t) { state.sort = t.value; renderResults(); });

    /* --- preview -------------------------------------------------------- */
    UM.on(document, 'click', '.js-preview-close', function () { closePreview(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closePreview(); closePanel(); }
    });

    /* --- karty ↔ mapa --------------------------------------------------- */
    UM.on(els.inner, 'mouseover', '.pcard, .lrow', function (e, t) {
      if (map) map.highlight(t.dataset.id);
    });
    els.inner.addEventListener('mouseleave', function () { if (map) map.highlight(null); });

    // V mapovém režimu karta otevře náhled místo navigace.
    els.inner.addEventListener('click', function (e) {
      var card = e.target.closest('.pcard');
      if (!card || state.view !== 'map' || window.innerWidth <= 1024) return;
      e.preventDefault();
      openPreview(card.dataset.id);
    });

    /* --- mapové nástroje ------------------------------------------------ */
    UM.on(document, 'click', '.js-zoom-in', function () { map.zoom(1); });
    UM.on(document, 'click', '.js-zoom-out', function () { map.zoom(-1); });
    UM.on(document, 'click', '.js-fit', function () { map.fitAll(); });
    UM.on(document, 'click', '.js-layers', function (e, t) {
      var panel = $('.layers');
      panel.classList.toggle('is-open');
      t.classList.toggle('is-on', panel.classList.contains('is-open'));
    });
    UM.on(document, 'change', '.layers input', function (e, t) {
      map.setLayer(t.dataset.layer, t.checked);
    });
    UM.on(document, 'click', '.js-draw-map', function (e, t) {
      t.classList.toggle('is-on');
      var on = t.classList.contains('is-on');
      var hint = $('.js-draw-hint');
      if (hint) hint.hidden = !on;
      map.setDrawMode(on);
      if (on && state.area) { state.area = null; apply(); }
    });
    UM.on(document, 'click', '.js-clear-area', function () {
      state.area = null;
      map.clearDraw();
      apply();
    });
    UM.on(document, 'click', '.js-fullscreen', function (e, t) {
      els.explorer.classList.toggle('is-fullscreen');
      document.body.classList.toggle('is-locked', els.explorer.classList.contains('is-fullscreen'));
      setTimeout(function () { if (map) map.resize(); }, 420);
    });

    updateSearchTrigger();
    renderResults();
  }

  global.UM_EXPLORER = { init: init, state: state, results: results };
})(window);
