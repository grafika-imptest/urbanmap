/* ==========================================================================
   URBANMAP — MAP ENGINE
   --------------------------------------------------------------------------
   Mapa je produkt, ne ilustrace. Tenhle modul je záměrně obalený vlastním
   API (UM_MAP.create → .setData / .flyTo / .select / .setLayer), aby se
   MapLibre dal vyměnit za Mapbox GL beze změny zbytku aplikace — API je
   kompatibilní, mění se pouze konstruktor a zdroj stylu.

   Podklad: CARTO vector basemap, který za běhu přebarvíme na brandové
   tokeny (restyle()). Mapa tak nevypadá jako screenshot z Map Google.
   Markery jsou HTML — plná kontrola nad typografií i stavy.
   ========================================================================== */
(function (global) {
  'use strict';

  var STYLE_URL = {
    light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    dark:  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
  };

  var CZ_BOUNDS = [[12.0, 48.5], [18.9, 51.1]];

  /* Zjednodušený obrys ČR pro offline fallback. */
  var CZ_OUTLINE = [
    [12.09,50.25],[12.20,50.32],[12.51,50.40],[13.03,50.50],[13.39,50.62],[14.31,51.05],
    [14.60,51.02],[14.82,50.87],[15.02,51.01],[15.37,50.78],[16.00,50.62],[16.23,50.42],
    [16.65,50.10],[16.90,50.45],[17.19,50.38],[17.72,50.32],[18.03,50.03],[18.57,49.91],
    [18.85,49.52],[18.57,49.51],[18.16,49.26],[17.91,48.99],[17.41,48.82],[16.95,48.62],
    [16.52,48.79],[16.10,48.75],[15.16,48.95],[14.98,49.01],[14.70,48.58],[14.06,48.60],
    [13.82,48.77],[13.39,48.98],[12.63,49.43],[12.40,49.76],[12.09,50.25]
  ];

  /* --------------------------------------------------------------- STYLE */
  function tok(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  /** Přebarví načtený basemap style na tokeny Urbanmap a odstraní vizuální
   *  šum (POI ikony, čísla popisná), který na produktové mapě nemá co dělat. */
  function restyle(style) {
    var C = {
      ground: tok('--map-ground'), water: tok('--map-water'), green: tok('--map-green'),
      built: tok('--map-built'), road: tok('--map-road'), road2: tok('--map-road-2'),
      boundary: tok('--map-boundary'), label: tok('--map-label'), halo: tok('--map-label-halo')
    };

    style.layers = style.layers.filter(function (l) {
      return !/poi|housenumber|airport_label|watername_ocean/.test(l.id);
    });

    style.layers.forEach(function (l) {
      var id = l.id;
      if (l.type === 'background') { l.paint = { 'background-color': C.ground }; return; }

      if (l.type === 'fill') {
        if (/water|ocean|river|lake/.test(id))      setPaint(l, 'fill-color', C.water);
        else if (/park|wood|grass|forest|landcover|golf|pitch|scrub/.test(id)) setPaint(l, 'fill-color', C.green);
        else if (/building/.test(id))                { setPaint(l, 'fill-color', C.built); setPaint(l, 'fill-opacity', 0.9); }
        else if (/landuse|residential|industrial/.test(id)) { setPaint(l, 'fill-color', C.ground); setPaint(l, 'fill-opacity', 0.6); }
        else                                          setPaint(l, 'fill-color', C.ground);
        return;
      }

      if (l.type === 'line') {
        if (/boundary/.test(id)) {
          // Hranice pouze naznačit. Původní dash z podkladu při oddálení
          // vytváří vizuální šum, který mapě bere klid.
          setPaint(l, 'line-color', C.boundary);
          setPaint(l, 'line-opacity', 0.5);
          setPaint(l, 'line-width', 0.8);
          if (l.paint) delete l.paint['line-dasharray'];
        } else if (/water|river|waterway/.test(id)) {
          setPaint(l, 'line-color', C.water);
        } else if (/motorway|trunk|primary/.test(id)) {
          setPaint(l, 'line-color', C.road);
        } else if (/rail|transit/.test(id)) {
          setPaint(l, 'line-color', C.boundary);
          setPaint(l, 'line-opacity', 0.45);
        } else {
          setPaint(l, 'line-color', C.road2);
        }
        return;
      }

      if (l.type === 'symbol') {
        setPaint(l, 'text-color', C.label);
        setPaint(l, 'text-halo-color', C.halo);
        setPaint(l, 'text-halo-width', 1.3);
        l.layout = l.layout || {};
        // Jediný typografický hlas na mapě: názvy sídel o stupeň výraznější,
        // ulice zůstávají potichu.
        if (/place|city|town|village|state|country/.test(id)) {
          l.layout['text-font'] = ['Open Sans Semibold'];
        } else {
          setPaint(l, 'text-opacity', 0.75);
        }
        if (l.layout['icon-image']) delete l.layout['icon-image'];
      }
    });
    return style;
  }

  function setPaint(l, key, val) { l.paint = l.paint || {}; l.paint[key] = val; }

  /* ---------------------------------------------------------- CLUSTERING */
  /** Shlukování v pixelovém prostoru — hladová varianta podle skutečné
   *  vzdálenosti, ne podle mřížky. Mřížka nechá dva blízké body v sousedních
   *  buňkách nespojené, což se na mapě projeví překrytými markery.
   *  Nezávislé na mapové knihovně, takže funguje i v offline fallbacku. */
  function clusterize(points, project, radius) {
    var pts = [], out = [], i, j;
    points.forEach(function (pt) {
      var xy = project(pt.coords);
      if (xy) pts.push({ pt: pt, xy: xy, used: false });
    });
    // Stabilní pořadí — stejný vstup dá vždy stejné shluky.
    pts.sort(function (a, b) { return a.xy.y - b.xy.y || a.xy.x - b.xy.x; });

    for (i = 0; i < pts.length; i++) {
      if (pts[i].used) continue;
      var group = [pts[i]];
      pts[i].used = true;
      for (j = i + 1; j < pts.length; j++) {
        if (pts[j].used) continue;
        var dx = pts[j].xy.x - pts[i].xy.x, dy = pts[j].xy.y - pts[i].xy.y;
        if (dx * dx + dy * dy <= radius * radius) { pts[j].used = true; group.push(pts[j]); }
      }
      if (group.length === 1) {
        out.push({ type: 'point', item: group[0].pt, coords: group[0].pt.coords });
      } else {
        var lon = 0, lat = 0;
        group.forEach(function (g) { lon += g.pt.coords[0]; lat += g.pt.coords[1]; });
        out.push({
          type: 'cluster', count: group.length,
          items: group.map(function (g) { return g.pt; }),
          coords: [lon / group.length, lat / group.length]
        });
      }
    }
    return out;
  }

  /* -------------------------------------------------------------- CREATE */
  function create(opts) {
    var container = opts.container;
    var api = {
      ready: false, map: null, fallback: false,
      data: [], selectedId: null, hoverId: null,
      markers: [], layerState: { projects: true, transport: false, nature: false, schools: false, investment: false, infra: false }
    };

    var markerLayer = document.createElement('div');
    markerLayer.style.cssText = 'position:absolute;inset:0;z-index:3;pointer-events:none';
    container.appendChild(markerLayer);

    var drawLayer = document.createElement('div');
    drawLayer.className = 'draw-layer';
    container.appendChild(drawLayer);

    /* --- MapLibre větev --------------------------------------------------- */
    function boot() {
      if (!global.maplibregl) { bootFallback(); return; }

      var theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';

      fetch(STYLE_URL[theme])
        .then(function (r) { return r.json(); })
        .then(function (style) { initMap(restyle(style)); })
        .catch(function () { bootFallback(); });
    }

    function initMap(style) {
      var map = new global.maplibregl.Map({
        container: container,
        style: style,
        bounds: CZ_BOUNDS,
        fitBoundsOptions: { padding: { top: 60, bottom: 60, left: 60, right: 60 } },
        attributionControl: { compact: true },
        scrollZoom: false,          // scroll patří stránce, dokud uživatel do mapy neklikne
        dragRotate: false,
        pitchWithRotate: false,
        touchZoomRotate: true
      });
      map.touchZoomRotate.disableRotation();
      api.map = map;

      map.on('load', function () {
        api.ready = true;
        // Výřez dopočítáme až po loadu — při konstrukci ještě nemusí být
        // známá finální velikost kontejneru a fit by vyšel nesmyslně.
        map.resize();
        map.fitBounds(opts.bounds || CZ_BOUNDS, { padding: fitPadding(), duration: 0 });
        render();
        if (opts.onReady) opts.onReady(api);
      });
      map.on('move', render);
      map.on('zoom', render);
      map.on('moveend', function () { if (opts.onMoveEnd) opts.onMoveEnd(api); });

      // Scroll-zoom gate: mapa nesmí ukrást scroll stránky.
      var gate = opts.gate;
      map.getContainer().addEventListener('click', enableZoom);
      map.getContainer().addEventListener('mouseleave', disableZoom);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') disableZoom(); });

      function enableZoom() {
        map.scrollZoom.enable();
        if (gate) gate.classList.remove('is-visible');
        container.dataset.zoom = 'on';
      }
      function disableZoom() {
        map.scrollZoom.disable();
        container.dataset.zoom = 'off';
      }
      // Hint se ukáže při pokusu o scroll nad neaktivní mapou.
      map.getContainer().addEventListener('wheel', function () {
        if (container.dataset.zoom !== 'on' && gate) {
          gate.classList.add('is-visible');
          clearTimeout(gate._t);
          gate._t = setTimeout(function () { gate.classList.remove('is-visible'); }, 1600);
        }
      }, { passive: true });
    }

    /* --- Fallback (bez sítě) --------------------------------------------- */
    function bootFallback() {
      api.fallback = true;
      api.ready = true;
      var fb = opts.fallbackEl;
      if (fb) {
        fb.classList.add('is-on');
        drawOutline(fb.querySelector('.map-fallback__svg'));
      }
      render();
      if (opts.onReady) opts.onReady(api);
    }

    function drawOutline(svg) {
      if (!svg) return;
      var r = container.getBoundingClientRect();
      var pts = CZ_OUTLINE.map(function (c) {
        var p = projFallback(c, r);
        return p.x + ',' + p.y;
      }).join(' ');
      svg.setAttribute('viewBox', '0 0 ' + r.width + ' ' + r.height);
      svg.innerHTML =
        '<polygon points="' + pts + '" fill="var(--map-built)" stroke="var(--map-boundary)" stroke-width="1"/>';
    }

    function projFallback(coords, rect) {
      var pad = 48;
      var x = (coords[0] - CZ_BOUNDS[0][0]) / (CZ_BOUNDS[1][0] - CZ_BOUNDS[0][0]);
      var y = 1 - (coords[1] - CZ_BOUNDS[0][1]) / (CZ_BOUNDS[1][1] - CZ_BOUNDS[0][1]);
      return { x: pad + x * (rect.width - pad * 2), y: pad + y * (rect.height - pad * 2) };
    }

    /** Odsazení výřezu podle skutečné velikosti plochy. Pevných 72 px je
     *  na nízké mapě v tabletovém layoutu polovina výšky — mapa by pak
     *  byla zbytečně oddálená. */
    function fitPadding() {
      var r = container.getBoundingClientRect();
      var p = Math.max(20, Math.min(72, Math.min(r.width, r.height) * 0.12));
      return { top: p, bottom: p, left: p, right: p };
    }

    /* --- Projekce -------------------------------------------------------- */
    function project(coords) {
      if (api.map) {
        var p = api.map.project(coords);
        return { x: p.x, y: p.y };
      }
      return projFallback(coords, container.getBoundingClientRect());
    }

    /* --- Vykreslení markerů ---------------------------------------------- */
    var peekTimer = null;

    function render() {
      if (!api.ready) return;
      markerLayer.innerHTML = '';
      api.markers = [];
      if (!api.layerState.projects) return;

      var rect = container.getBoundingClientRect();
      var zoom = api.map ? api.map.getZoom() : 7;
      var radius = zoom > 12 ? 46 : zoom > 9 ? 62 : 76;

      var groups = clusterize(api.data, project, radius);

      groups.forEach(function (g) {
        var xy = project(g.coords);
        if (xy.x < -160 || xy.y < -160 || xy.x > rect.width + 160 || xy.y > rect.height + 160) return;

        var node = document.createElement('div');
        node.className = 'mk';
        node.style.cssText = 'position:absolute;pointer-events:auto;transform:translate(-50%,-50%);' +
          'left:' + xy.x + 'px;top:' + xy.y + 'px;';

        if (g.type === 'cluster') {
          var size = Math.min(64, 36 + Math.log2(g.count + 1) * 7);
          node.innerHTML = '<div class="mk-cluster" style="--cs:' + Math.round(size) + 'px">' + g.count + '</div>';
          node.addEventListener('click', function () {
            if (api.map) {
              api.map.flyTo({ center: g.coords, zoom: Math.min(15, api.map.getZoom() + 2.2), duration: 900, essential: true });
            }
          });
          node.title = g.count + ' projektů v této oblasti';
        } else {
          var p = g.item;
          var active = api.selectedId === p.id;
          node.dataset.id = p.id;
          node.className = 'mk' + (active ? ' is-active' : '');
          node.innerHTML =
            '<div class="mk-pin' + (p.featured ? ' is-feature' : '') + '" data-status="' + p.status + '">' +
              (p.label || '') +
            '</div>' +
            '<div class="mk-peek"></div>';

          node.addEventListener('mouseenter', function () { showPeek(node, p); });
          node.addEventListener('mouseleave', function () { hidePeek(node); });
          node.addEventListener('click', function (e) {
            e.stopPropagation();
            if (opts.onSelect) opts.onSelect(p.id);
          });
        }
        markerLayer.appendChild(node);
        api.markers.push({ node: node, group: g });
      });
    }

    function showPeek(node, p) {
      clearTimeout(peekTimer);
      var peek = node.querySelector('.mk-peek');
      if (!peek) return;
      if (opts.onHover) opts.onHover(p.id);
      if (!peek.dataset.filled) {
        peek.innerHTML = (opts.peekHtml ? opts.peekHtml(p) : '');
        peek.dataset.filled = '1';
      }
      node.style.zIndex = 20;
      requestAnimationFrame(function () { peek.classList.add('is-on'); });
    }
    function hidePeek(node) {
      var peek = node.querySelector('.mk-peek');
      if (peek) peek.classList.remove('is-on');
      node.style.zIndex = '';
      if (opts.onHover) opts.onHover(null);
    }

    /* --- Veřejné API ----------------------------------------------------- */
    api.setData = function (points) { api.data = points; render(); };

    api.select = function (id, opt) {
      api.selectedId = id;
      render();
      if (!id || !api.map) return;
      var p = api.data.filter(function (x) { return x.id === id; })[0];
      if (!p) return;
      if (opt && opt.fly !== false) {
        api.map.flyTo({
          center: p.coords,
          zoom: Math.max(api.map.getZoom(), 12.5),
          offset: [opt && opt.offsetX ? opt.offsetX : 0, 0],
          duration: 1100, essential: true,
          curve: 1.3
        });
      }
    };

    api.highlight = function (id) {
      api.markers.forEach(function (m) {
        if (m.group.type !== 'point') return;
        m.node.classList.toggle('is-active', m.group.item.id === (id || api.selectedId));
        m.node.classList.toggle('is-dim', !!id && m.group.item.id !== id);
      });
    };

    api.flyTo = function (coords, zoom) {
      if (!api.map) return;
      api.map.flyTo({ center: coords, zoom: zoom || 12, duration: 1200, essential: true, curve: 1.35 });
    };

    api.fitAll = function () {
      if (!api.map) return;
      if (!api.data.length) { api.map.fitBounds(CZ_BOUNDS, { padding: fitPadding(), duration: 900 }); return; }
      var b = new global.maplibregl.LngLatBounds();
      api.data.forEach(function (p) { b.extend(p.coords); });
      api.map.fitBounds(b, { padding: fitPadding(), duration: 1100, maxZoom: 13 });
    };

    api.zoom = function (delta) {
      if (!api.map) return;
      api.map.easeTo({ zoom: api.map.getZoom() + delta, duration: 420 });
    };

    api.setLayer = function (key, on) {
      api.layerState[key] = on;
      if (!api.map) { render(); return; }
      // Vrstvy, které v prototypu existují jako přepínač nad podkladem.
      var groups = {
        transport: /rail|transit|aeroway|motorway|trunk/,
        nature:    /park|wood|grass|forest|landcover|scrub/,
        schools:   /school|education/
      };
      if (groups[key] && api.map.getStyle()) {
        api.map.getStyle().layers.forEach(function (l) {
          if (groups[key].test(l.id)) {
            try {
              api.map.setPaintProperty(l.id, l.type === 'line' ? 'line-opacity' : 'fill-opacity', on ? 1 : 0.25);
            } catch (e) {}
          }
        });
      }
      render();
    };

    /* --- Kreslení oblasti ------------------------------------------------
       Uživatel si v mapě vymezí obdélník a filtr se omezí na projekty uvnitř.
       Záměrně obdélník, ne lasso: je předvídatelný, dá se popsat souřadnicemi
       a jde ho poslat do dotazu na backend beze ztráty. */
    var drawing = null;

    api.setDrawMode = function (on) {
      drawLayer.classList.toggle('is-armed', !!on);
      if (api.map) {
        if (on) api.map.dragPan.disable(); else api.map.dragPan.enable();
      }
      if (!on) drawLayer.innerHTML = '';
    };

    function localPoint(e) {
      var r = container.getBoundingClientRect();
      var t = e.touches ? e.touches[0] : e;
      return { x: t.clientX - r.left, y: t.clientY - r.top };
    }

    drawLayer.addEventListener('pointerdown', function (e) {
      if (!drawLayer.classList.contains('is-armed')) return;
      e.preventDefault();
      drawLayer.setPointerCapture(e.pointerId);
      drawing = localPoint(e);
      drawLayer.innerHTML = '<div class="draw-rect"></div>';
    });

    drawLayer.addEventListener('pointermove', function (e) {
      if (!drawing) return;
      var p = localPoint(e), box = drawLayer.firstElementChild;
      if (!box) return;
      box.style.left = Math.min(drawing.x, p.x) + 'px';
      box.style.top = Math.min(drawing.y, p.y) + 'px';
      box.style.width = Math.abs(p.x - drawing.x) + 'px';
      box.style.height = Math.abs(p.y - drawing.y) + 'px';
    });

    drawLayer.addEventListener('pointerup', function (e) {
      if (!drawing) return;
      var p = localPoint(e), start = drawing;
      drawing = null;
      // Příliš malý tah bereme jako omyl, ne jako výběr.
      if (Math.abs(p.x - start.x) < 24 || Math.abs(p.y - start.y) < 24) {
        drawLayer.innerHTML = '';
        return;
      }
      var a = unproject({ x: Math.min(start.x, p.x), y: Math.min(start.y, p.y) });
      var b = unproject({ x: Math.max(start.x, p.x), y: Math.max(start.y, p.y) });
      if (opts.onDraw) {
        opts.onDraw([[Math.min(a[0], b[0]), Math.min(a[1], b[1])],
                     [Math.max(a[0], b[0]), Math.max(a[1], b[1])]]);
      }
    });

    function unproject(xy) {
      if (api.map) {
        var ll = api.map.unproject([xy.x, xy.y]);
        return [ll.lng, ll.lat];
      }
      var r = container.getBoundingClientRect(), pad = 48;
      return [
        CZ_BOUNDS[0][0] + ((xy.x - pad) / (r.width - pad * 2)) * (CZ_BOUNDS[1][0] - CZ_BOUNDS[0][0]),
        CZ_BOUNDS[0][1] + (1 - (xy.y - pad) / (r.height - pad * 2)) * (CZ_BOUNDS[1][1] - CZ_BOUNDS[0][1])
      ];
    }

    api.clearDraw = function () { drawLayer.innerHTML = ''; api.setDrawMode(false); };

    api.resize = function () {
      if (api.map) api.map.resize();
      if (api.fallback && opts.fallbackEl) drawOutline(opts.fallbackEl.querySelector('.map-fallback__svg'));
      render();
    };

    /** Přeladění mapy při přepnutí světlý/tmavý režim — nový podklad,
     *  zachovaná pozice. */
    api.setTheme = function (theme) {
      if (!api.map) { if (opts.fallbackEl) drawOutline(opts.fallbackEl.querySelector('.map-fallback__svg')); return; }
      var c = api.map.getCenter(), z = api.map.getZoom();
      fetch(STYLE_URL[theme === 'dark' ? 'dark' : 'light'])
        .then(function (r) { return r.json(); })
        .then(function (style) {
          api.map.setStyle(restyle(style));
          api.map.once('styledata', function () {
            api.map.jumpTo({ center: c, zoom: z });
            render();
          });
        }).catch(function () {});
    };

    boot();
    global.addEventListener('resize', function () { api.resize(); }, { passive: true });
    return api;
  }

  global.UM_MAP = { create: create, CZ_BOUNDS: CZ_BOUNDS, CZ_OUTLINE: CZ_OUTLINE };
})(window);
