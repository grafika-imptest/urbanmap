/* ==========================================================================
   URBANMAP — MOTION SYSTEM
   --------------------------------------------------------------------------
   Čtyři úrovně, jeden systém:
     L1 MICRO    hover, focus, toggle          → čisté CSS (components.css)
     L2 CARD     parallax vrstev uvnitř karty  → Motion.parallax()
     L3 SECTION  reveal, stagger, maskovaný text → Motion.reveals()
     L4 HERO/MAP zoom, view morph, přechody     → volají moduly map/explorer

   GSAP + Lenis jsou volitelné. Když se nenačtou (offline), běží
   IntersectionObserver + rAF fallback se stejnou choreografií.
   Vše respektuje prefers-reduced-motion.
   ========================================================================== */
(function (global) {
  'use strict';

  var reduced = global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = false, lenis = null, rafItems = [], rafId = null;

  /* ---------------------------------------------------------------- INIT */
  function init() {
    document.documentElement.classList.add('js');
    if (reduced) { revealAllNow(); return; }

    hasGSAP = !!(global.gsap && global.ScrollTrigger);
    if (hasGSAP) global.gsap.registerPlugin(global.ScrollTrigger);

    smoothScroll();
    splitLines();
    reveals();
    parallax();
    counters();
    startRaf();
  }

  function revealAllNow() {
    document.querySelectorAll('[data-reveal], .line-mask').forEach(function (n) {
      n.classList.add('is-in');
    });
  }

  /* ------------------------------------------------------- SMOOTH SCROLL
     Lenis nescrolluje transformem, ale doopravdy — mění scrollTop. Díky
     tomu zůstávají getBoundingClientRect, sticky i IntersectionObserver
     přesné a zbytek motion systému o něm nemusí vědět.

     Plochy s vlastním rolováním (výsledky, náhled projektu, paleta,
     zásuvka, mapa) musí zůstat nativní. Řeší to `prevent`, ne atribut
     v markupu — panely se překreslují a atribut by se ztrácel.          */
  var NATIVNI_ROLOVANI = [
    '[data-lenis-prevent]',
    '.results__body', '.preview__body', '.cmd__body',
    '.drawer__body', '.fpanel', '.maplibregl-map'
  ].join(',');

  function smoothScroll() {
    if (!global.Lenis) return;

    lenis = new global.Lenis({
      // lerp místo duration: dojezd je plynulý a nemá pevnou délku, takže
      // rychlé otočení kolečka nečeká na dokončení předchozí animace.
      lerp: 0.085,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
      smoothWheel: true,
      prevent: function (node) {
        return !!(node && node.closest && node.closest(NATIVNI_ROLOVANI));
      }
    });

    if (hasGSAP) {
      // Jeden takt pro obojí. Dva nezávislé rAF cykly by si předávaly
      // hodnoty o snímek pozdě a parallax by se za scrollem opožďoval.
      lenis.on('scroll', global.ScrollTrigger.update);
      global.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      global.gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })();
    }

    // Overlaye zamykají rolování třídou na <body>. Samotné overflow:hidden
    // Lenis nezastaví — musí dostat vlastní pokyn, jinak se pod otevřeným
    // vyhledáváním stránka dál posouvá.
    var mo = new MutationObserver(function () {
      if (document.body.classList.contains('is-locked')) lenis.stop(); else lenis.start();
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    global.UM_LENIS = lenis;
  }

  /* ------------------------------------------------- L3 · MASKED HEADLINE
     Rozdělí text nadpisu na řádky a každý obalí maskou. Řádky pak vjíždějí
     zdola se stagger odstupem — hlavní typografický moment stránky.       */
  var splitOriginals = new WeakMap();

  function splitLines(force) {
    document.querySelectorAll('[data-split]').forEach(function (node) {
      if (node.dataset.splitDone && !force) return;

      // Původní text si pamatujeme, aby šlo po změně šířky rozdělit znovu —
      // jinak by se řádky po resize zalomily jinak, než jak jsme je změřili,
      // a maska by text ořízla.
      if (!splitOriginals.has(node)) splitOriginals.set(node, node.textContent.trim());
      var wasIn = node.querySelector('.line-mask.is-in') !== null;
      var words = splitOriginals.get(node).split(/\s+/);
      node.textContent = '';

      /* Slova musí zůstat inline a mezery mezi nimi skutečnými textovými uzly.
         Dřív tu byly inline-block spany s mezerou uvnitř — mezi sousedními
         inline-blocky pak nevznikne místo ke zlomu a měření vždy vyšlo
         na jeden řádek, i když se text ve skutečnosti lámal. */
      var holder = document.createElement('span');
      holder.style.display = 'block';
      words.forEach(function (w, i) {
        var s = document.createElement('span');
        s.textContent = w;
        holder.appendChild(s);
        if (i < words.length - 1) holder.appendChild(document.createTextNode(' '));
      });
      node.appendChild(holder);

      var spans = Array.prototype.slice.call(holder.children);
      var lines = [], cur = [], top = null;
      spans.forEach(function (s) {
        var t = Math.round(s.offsetTop);
        if (top === null) top = t;
        if (t !== top) { lines.push(cur); cur = []; top = t; }
        cur.push(s.textContent);
      });
      if (cur.length) lines.push(cur);

      node.innerHTML = lines.map(function (l, i) {
        // Mezera na konci řádku se vizuálně sbalí, ale drží textContent celistvý —
        // bez ní by čtečka i schránka slepily poslední a první slovo sousedních řádků.
        var txt = l.join(' ') + (i < lines.length - 1 ? ' ' : '');
        return '<span class="line-mask' + (wasIn ? ' is-in' : '') + '"><span>' + txt + '</span></span>';
      }).join('');
      node.dataset.splitDone = '1';
    });
  }

  /* Zalomení se měří v tom písmu, které je zrovna vykreslené. Když split
     proběhne dřív, než dorazí webfont, vyjdou body zlomu podle záložního
     řezu — a řádky pak v masce nesedí. Po načtení písem proto měříme znovu. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      if (reduced) return;
      splitLines(true);
      reveals();
    });
  }

  // Po změně šířky přeměříme zalomení a znovu navážeme reveal.
  var resplitT;
  global.addEventListener('resize', function () {
    if (reduced) return;
    clearTimeout(resplitT);
    resplitT = setTimeout(function () { splitLines(true); reveals(); }, 260);
  }, { passive: true });

  /* ----------------------------------------------------- L3 · REVEALS --- */
  function reveals() {
    var nodes = document.querySelectorAll('[data-reveal], .line-mask');
    if (!nodes.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var n = e.target;
        // Stagger uvnitř skupiny: rodič s data-stagger rozdá zpoždění dětem.
        var parent = n.parentElement && n.parentElement.closest('[data-stagger]');
        if (parent) {
          var sibs = Array.prototype.slice.call(parent.querySelectorAll('[data-reveal], .line-mask'));
          var i = sibs.indexOf(n);
          var step = parseInt(parent.dataset.stagger, 10) || 70;
          n.style.setProperty('--reveal-delay', (i * step) + 'ms');
          n.style.setProperty('--line-delay', (i * step) + 'ms');
        }
        n.classList.add('is-in');
        io.unobserve(n);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    nodes.forEach(function (n) { io.observe(n); });
    sweepSoon();
  }

  /** Pojistka. IntersectionObserver nedoručí callback, když prohlížeč mezi
   *  dvěma stavy nevykresluje snímek (skrytý tab, rychlý skok ve scrollu).
   *  Obsah by pak zůstal trvale neviditelný — což je horší selhání než
   *  vynechaná animace. Proto vše nad spodní hranou viewportu dorovnáme. */
  function sweep() {
    var stuck = document.querySelectorAll('[data-reveal]:not(.is-in), .line-mask:not(.is-in)');
    for (var i = 0; i < stuck.length; i++) {
      if (stuck[i].getBoundingClientRect().top < global.innerHeight * 0.95) {
        stuck[i].classList.add('is-in');
      }
    }
  }

  var sweepT;
  function sweepSoon() { clearTimeout(sweepT); sweepT = setTimeout(sweep, 400); }

  global.addEventListener('scroll', sweepSoon, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) sweepSoon();
  });

  /* ------------------------------------------------- L2 · CARD PARALLAX --
     Tři vrstvy karty se pohybují různou rychlostí. Rozdíl je záměrně malý
     (max ~22 px) — cílem je hloubka, ne pohyb.                            */
  function parallax() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-px]'));
    if (!items.length) return;

    items.forEach(function (node) {
      var depth = parseFloat(node.dataset.px) || 1;
      var img = node.querySelector('.pcard__img, .acard__frame img, .lcard img, [data-px-img]');
      var body = node.querySelector('.pcard__body, .lcard__body, [data-px-body]');
      // Volné vrstvy s vlastní amplitudou v px — pro kompozice, kde se text
      // a popředí míjejí výrazněji než u karty (data-px-layer="-120").
      var layers = Array.prototype.slice.call(node.querySelectorAll('[data-px-layer]'));
      if (!img && !body && !layers.length) return;
      rafItems.push({ node: node, img: img, body: body, layers: layers, depth: depth, vis: false });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var item = rafItems.filter(function (i) { return i.node === e.target; })[0];
        if (item) item.vis = e.isIntersecting;
      });
    }, { rootMargin: '20% 0px' });
    rafItems.forEach(function (i) { io.observe(i.node); });
  }

  function startRaf() {
    if (rafId || !rafItems.length) return;
    var vh = global.innerHeight;
    global.addEventListener('resize', function () { vh = global.innerHeight; }, { passive: true });

    function tick() {
      for (var i = 0; i < rafItems.length; i++) {
        var it = rafItems[i];
        if (!it.vis) continue;
        var r = it.node.getBoundingClientRect();
        // progress -1 (pod viewportem) … 1 (nad viewportem)
        var p = ((r.top + r.height / 2) / (vh + r.height)) * 2 - 1;
        p = Math.max(-1, Math.min(1, p));
        if (it.img) it.img.style.setProperty('--px', (p * 22 * it.depth).toFixed(2) + 'px');
        if (it.body) it.body.style.setProperty('--py', (p * 7 * it.depth).toFixed(2) + 'px');
        if (it.layers) {
          for (var j = 0; j < it.layers.length; j++) {
            var lay = it.layers[j];
            lay.style.setProperty('--px', (p * (parseFloat(lay.dataset.pxLayer) || 0)).toFixed(2) + 'px');
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
  }

  /* --------------------------------------------------- L3 · COUNTERS ---- */
  function counters() {
    var nodes = document.querySelectorAll('[data-count]');
    if (!nodes.length) return;
    var fmt = new Intl.NumberFormat('cs-CZ');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var n = e.target;
        var to = parseFloat(n.dataset.count);
        var dec = parseInt(n.dataset.countDec || '0', 10);
        var suffix = n.dataset.countSuffix || '';
        var t0 = performance.now(), dur = 1400, done = false;
        function paint(v) {
          n.textContent = (dec ? v.toFixed(dec).replace('.', ',') : fmt.format(Math.round(v))) + suffix;
        }
        (function step(t) {
          if (done) return;
          var k = Math.min(1, (t - t0) / dur);
          paint(to * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step); else done = true;
        })(t0);
        // Když se snímky nekreslí (skrytý tab), rAF se nespustí a číslo by
        // zůstalo na nule. Po uplynutí doby ho proto dorovnáme napevno.
        setTimeout(function () { if (!done) { done = true; paint(to); } }, dur + 400);
        io.unobserve(n);
      });
    }, { threshold: 0.4 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* --------------------------------------------- L4 · PUBLIC TRANSITIONS */

  /** Stagger vstup karet po přepnutí view (MAPA → MŘÍŽKA → SEZNAM). */
  function morphIn(container) {
    if (reduced || !container) return;
    var kids = Array.prototype.slice.call(container.children);
    kids.forEach(function (c, i) { c.style.setProperty('--i', Math.min(i, 14)); });
    container.classList.remove('is-morphing');
    void container.offsetWidth;   // vynutí restart animace
    container.classList.add('is-morphing');
    // Po doběhnutí třídu sundáme — jinak by při dalším renderu (nebo v tabu
    // na pozadí, kde se animace neplní) karty zůstaly na počátečním stavu.
    clearTimeout(container._morphT);
    container._morphT = setTimeout(function () {
      container.classList.remove('is-morphing');
    }, 520 + 15 * 26);
  }

  /** Znovu prováže nově vložené karty s parallaxem (po filtrování). */
  function rebind(root) {
    if (reduced) { revealAllNow(); return; }
    rafItems = rafItems.filter(function (i) { return document.body.contains(i.node); });
    var added = Array.prototype.slice.call((root || document).querySelectorAll('[data-px]'));
    added.forEach(function (node) {
      if (rafItems.some(function (i) { return i.node === node; })) return;
      var img = node.querySelector('.pcard__img, .acard__frame img, .lcard img, [data-px-img]');
      var body = node.querySelector('.pcard__body, .lcard__body, [data-px-body]');
      var layers = Array.prototype.slice.call(node.querySelectorAll('[data-px-layer]'));
      if (!img && !body && !layers.length) return;
      rafItems.push({ node: node, img: img, body: body, layers: layers, depth: parseFloat(node.dataset.px) || 1, vis: true });
    });
    startRaf();
  }

  global.UM_MOTION = {
    init: init, reduced: reduced,
    morphIn: morphIn, rebind: rebind,
    reveals: reveals, splitLines: splitLines, counters: counters
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})(window);
