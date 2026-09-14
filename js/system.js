/* ==========================================================================
   URBANMAP — DESIGN SYSTEM
   Dokumentace systému, na kterém prototyp stojí. Slouží jako podklad
   pro vývoj i pro rozhodování o dalších obrazovkách.
   ========================================================================== */
(function (global) {
  'use strict';
  var UM = global.UM, D = global.UM_DATA, C = global.UM_CARDS, I = UM.I;
  var $ = UM.$, $$ = UM.$$, esc = UM.esc;

  document.getElementById('chrome-header').innerHTML = UM.chrome.header({});
  document.getElementById('chrome-footer').innerHTML = UM.chrome.footer();

  function swatch(token, label, note) {
    return '<div class="swatch" data-reveal="up">' +
      '<div class="swatch__chip" style="background:var(' + token + ')"></div>' +
      '<div class="swatch__body">' +
        '<div style="font-size:var(--t-sm);font-weight:500">' + esc(label) + '</div>' +
        '<div class="meta" style="margin-top:6px">' + token + '</div>' +
        (note ? '<div class="dim" style="font-size:var(--t-xs);margin-top:8px">' + esc(note) + '</div>' : '') +
      '</div></div>';
  }

  function spec(k, v) {
    return '<div class="spec"><div><div style="font-size:var(--t-sm);font-weight:500">' + esc(k) + '</div></div>' +
      '<div class="dim" style="font-size:var(--t-sm)">' + v + '</div></div>';
  }

  function section(idx, title, note, body, id) {
    return '<section class="section section--rule bleed"' + (id ? ' id="' + id + '"' : '') + '>' +
      '<div class="section-head">' +
        '<div><span class="section-index">' + idx + '</span>' +
          '<h2 class="display-3" data-split style="margin-top:18px">' + esc(title) + '</h2></div>' +
        '<div class="section-head__aside"><p class="lead" style="font-size:var(--t-body)">' + note + '</p></div>' +
      '</div>' + body + '</section>';
  }

  var html =
    '<section class="page-hero bleed">' +
      '<div class="page-hero__grid">' +
        '<div><span class="section-index">Design system</span>' +
          '<h1 class="display-1" data-split style="margin-top:20px">Systém před obrazovkami</h1></div>' +
        '<div class="section-head__aside">' +
          '<p class="lead">Tokeny, typografická škála, komponenty, mapový model a motion systém. ' +
            'Prototyp nevznikl skládáním sekcí — vznikl z těchto pravidel, a proto drží pohromadě.</p>' +
          '<button class="btn btn--ghost js-theme-demo">Přepnout režim a zkontrolovat</button>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<div id="obsah"></div>' +

    /* --- 01 principy ---------------------------------------------------- */
    section('Principy', 'Šest pravidel, ze kterých plyne zbytek',
      'Každé rozhodnutí v systému se dá odvodit od těchto principů. Když se objeví nový požadavek, ' +
      'rozhoduje se podle nich, ne podle vkusu.',
      '<div class="grid-auto grid-auto--tight" data-stagger="60">' +
        [
          ['Mapa je produkt', 'Ne ilustrace pod hero bannerem. Mapa zabírá první obrazovku a je primární plochou interakce.'],
          ['Informace před dekorací', 'KDE · CO · CENA · STAV · DOSTUPNOST · KDO musí být čitelné na první pohled. Fotka prodává, ale neschovává data.'],
          ['Full-bleed, ne container', 'Žádný max-width 1240 px uprostřed obrazovky. Layout reaguje na šířku viewportu, ne na breakpoint.'],
          ['Jeden akcent', 'Jediná sytá barva pro akci. Stav má vlastní paletu — jako barevné sklo u štítku nad fotkou, jako barva písma v tabulce.'],
          ['Motion má funkci', 'Každá animace něco vysvětluje: odkud přišel panel, co se změnilo, kde jsem. Jinak nepatří do systému.'],
          ['Žádná fake data', 'Co se ještě nepočítá, se neukazuje jako číslo. Investiční metriky mají UI, ale ne vymyšlené hodnoty.']
        ].map(function (p, i) {
          return '<div class="dcard" data-reveal="up">' +
            '<span class="section-index">' + String(i + 1).padStart(2, '0') + '</span>' +
            '<h3 class="h1">' + esc(p[0]) + '</h3>' +
            '<p class="dim" style="font-size:var(--t-sm);line-height:1.5">' + esc(p[1]) + '</p></div>';
        }).join('') +
      '</div>') +

    /* --- 02 barvy -------------------------------------------------------- */
    section('Barevný systém', 'Teplý papír, chladný akcent',
      'Neutrály nesou celý produkt, akcent se objevuje jen tam, kde má uživatel jednat nebo kde je aktivní stav. ' +
      'Tmavý režim není inverze — má vlastní hodnoty pro plochy, linky i mapu.',
      '<span class="meta">Plochy a text</span>' +
      '<div class="sys-grid" style="margin-top:20px;margin-bottom:44px" data-stagger="40">' +
        swatch('--paper', 'Papír', 'ground stránky') +
        swatch('--surface', 'Plocha', 'karty, panely') +
        swatch('--surface-2', 'Plocha 2', 'dialogy, dropdowny') +
        swatch('--ink', 'Ink', 'primární text, primární CTA') +
        swatch('--ink-70', 'Ink 70', 'sekundární text') +
        swatch('--ink-45', 'Ink 45', 'metadata, labely') +
      '</div>' +
      '<span class="meta">Akcent a status</span>' +
      '<div class="sys-grid" style="margin-top:20px" data-stagger="40">' +
        swatch('--accent', 'Akcent', 'aktivní stav, markery, odkazy') +
        swatch('--clay', 'Clay', 'editorial, lokality — nikdy CTA') +
        swatch('--st-planned', 'Připravuje se') +
        swatch('--st-presale', 'V předprodeji') +
        swatch('--st-selling', 'V prodeji') +
        swatch('--st-done', 'Dokončeno') +
        swatch('--st-sold', 'Vyprodáno') +
      '</div>') +

    /* --- 03 typografie --------------------------------------------------- */
    section('Typografie', 'Jedna rodina, tři váhy',
      'Jedna rodina pro celý web: ITC Avant Garde Gothic Pro. Hierarchii nese váha ' +
      'a velikost, ne střídání písem. Nadpisy jdou verzálkami — geometrický grotesk ' +
      'je na to stavěný. Drobné popisky verzálky nemají.',
      '<div data-reveal="up">' +
        '<div class="display-1" style="margin-bottom:12px">Display 1</div>' +
        '<div class="display-2" style="margin-bottom:12px">Display 2 — sekční nadpis</div>' +
        '<div class="display-3" style="margin-bottom:20px">Display 3 — podnadpis sekce</div>' +
        '<div class="h1" style="margin-bottom:8px">H1 — název projektu na kartě</div>' +
        '<div class="h2" style="margin-bottom:20px">H2 — nadpis bloku</div>' +
        '<p class="lead" style="margin-bottom:16px">Lead — úvodní odstavec sekce, maximálně 62 znaků na řádek, barva ink-70.</p>' +
        '<p style="margin-bottom:20px">Body — základní text rozhraní, 15 px, řádkování 1,55.</p>' +
        '<span class="meta">Meta — drobný popisek, Inter Tight, 12 px, váha 500</span>' +
        '<div class="num" style="margin-top:20px;font-size:1.5rem">1 367 · 6 940 000 Kč · 118 m²</div>' +
      '</div>' +
      '<div style="margin-top:44px">' +
        spec('Display', 'clamp(2.75rem, 6.2vw, 7.5rem) · 600 Demi · verzálky · tracking −0,018em') +
        spec('Nadpis karty', '1,35–1,85rem · 600 Demi · verzálky') +
        spec('Rozhraní', '0,9375rem · 500 Medium — tabulky, popisky, ovládání') +
        spec('Souvislý text', '1,0625rem · 300 Book · line-height 1,5 — lead a odstavce') +
        spec('Meta', '0,75rem · 500 Medium · bez verzálek a prostrkání') +
        spec('Váhy', 'Kit nese 300 / 500 / 600 / 700. Žebřík stojí na Book – Medium – Demi; 700 zůstává v rezervě.') +
      '</div>') +

    /* --- 04 layout ------------------------------------------------------- */
    section('Layout a spacing', 'Fluidní, bez centrálního containeru',
      'Na 1920 px nesmí web působit jako 1240px web uprostřed obrazovky. ' +
      'Gutter je jediná konstanta, zbytek se dopočítává.',
      '<div data-reveal="up">' +
        spec('Gutter', '<code>padding-inline: clamp(18px, 2.6vw, 56px)</code> — jediný vnitřní okraj, žádný max-width') +
        spec('Vertikální rytmus sekcí', '<code>clamp(72px, 9vh, 160px)</code>') +
        spec('Grid karet', '<code>repeat(auto-fit, minmax(min(320px, 100%), 1fr))</code> — počet sloupců určuje šířka, ne breakpoint') +
        spec('Spacing', '4px base · 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96') +
        spec('Radius', 'Konstrukce 0 px — karty, panely, tlačítka, pole, tabulky. Zaoblení má jen štítek ležící nad obsahem (stav, Premium, developer, cenový marker), aby tvar sám nesl význam „nálepka“.') +
        spec('Explorer', 'mapa 62 % / výsledky 38 % na desktopu · 100dvh − výška chrome') +
      '</div>') +

    /* --- 05 komponenty --------------------------------------------------- */
    section('Komponenty', 'Stavy jsou součást komponenty',
      'Každá komponenta má definované stavy: default, hover, aktivní, vybraný, tlumený, „brzy“. ' +
      'Stav „brzy“ existuje proto, aby šlo ukázat budoucí funkci bez vymýšlení dat.',
      '<div class="grid-auto" data-stagger="60">' +
        demo('Tlačítka',
          '<button class="btn btn--primary">Primární</button>' +
          '<button class="btn btn--accent">Akcent</button>' +
          '<button class="btn btn--ghost">Ghost</button>' +
          '<button class="btn btn--quiet">Quiet</button>' +
          '<button class="btn btn--ghost btn--sm">Malé</button>') +
        demo('Chipy a filtry',
          '<button class="chip">Neaktivní</button>' +
          '<button class="chip is-on">Aktivní</button>' +
          '<button class="chip">S počtem <span class="chip__count">12</span></button>' +
          '<span class="chip chip--soon">Připravuje se</span>') +
        demo('Stavy projektu',
          '<span class="status status--solid" data-status="planned">Připravuje se</span>' +
          '<span class="status status--solid" data-status="presale">V předprodeji</span>' +
          '<span class="status status--solid" data-status="selling">V prodeji</span>' +
          '<span class="status status--solid" data-status="done">Dokončeno</span>' +
          '<span class="status status--solid" data-status="sold">Vyprodáno</span>') +
        demo('Badge a označení',
          '<span class="badge">Standard</span>' +
          '<span class="badge badge--accent">Premium</span>' +
          '<span class="badge badge--outline">Prototyp</span>' +
          '<span class="verified">' + I.verified + '</span>' +
          '<span class="kbd">⌘K</span>') +
        demo('Mapové markery',
          '<div class="mk-pin" data-status="selling">6,94 mil.</div>' +
          '<div class="mk-pin is-feature" data-status="presale">8,2 mil.</div>' +
          '<div class="mk-cluster" style="--cs:44px;position:relative">12</div>') +
        demo('Segmentovaný přepínač',
          '<div class="seg"><button class="seg__btn" aria-selected="true">Mapa</button>' +
          '<button class="seg__btn">Mřížka</button><button class="seg__btn">Seznam</button></div>') +
      '</div>' +
      '<div style="margin-top:48px">' +
        '<span class="meta">Karta projektu — tři vrstvy s vlastní rychlostí při scrollu</span>' +
        '<div class="grid-auto" style="margin-top:22px" data-stagger="70">' +
          D.projects.slice(0, 3).map(function (p, i) { return C.project(p, { depth: 0.8 + i * 0.3 }); }).join('') +
        '</div>' +
      '</div>') +

    /* --- 06 mapa --------------------------------------------------------- */
    section('Mapový model', 'Mapa je obalená vlastním API',
      'Modul <code>UM_MAP</code> je záměrně tenká vrstva nad mapovou knihovnou. ' +
      'Prototyp běží na MapLibre s podkladem CARTO, produkce může běžet na Mapboxu — ' +
      'mění se konstruktor a zdroj stylu, ne aplikace.',
      '<div data-reveal="up">' +
        spec('Rozhraní', '<code>create() · setData() · select() · highlight() · flyTo() · fitAll() · setLayer() · setTheme()</code>') +
        spec('Podklad', 'Vektorový styl se za běhu přebarvuje na brandové tokeny (<code>restyle()</code>) a odstraňují se POI ikony a čísla popisná') +
        spec('Markery', 'HTML, ne canvas — plná kontrola nad typografií, stavy a přístupností') +
        spec('Shlukování', 'Vzdálenostní v pixelovém prostoru, nezávislé na knihovně — funguje i v offline fallbacku') +
        spec('Scroll', 'Zoom kolečkem je vypnutý, dokud uživatel do mapy neklikne — mapa nesmí ukrást scroll stránky') +
        spec('Vrstvy', 'projekty · doprava · příroda aktivní; školy, vybavenost, heatmapy cen a yieldu připravené jako stav „fáze 2“') +
        spec('Offline', 'Když se knihovna nenačte, vykreslí se zjednodušený obrys ČR a seznam zůstává plně funkční') +
      '</div>') +

    /* --- 07 motion ------------------------------------------------------- */
    section('Motion', 'Čtyři úrovně, jeden systém',
      'Čím významnější prvek, tím výraznější pohyb. Nikdy naopak. ' +
      'Vše respektuje <code>prefers-reduced-motion</code> a bez GSAP i Lenisu běží stejná choreografie v základní podobě.',
      '<div data-reveal="up">' +
        spec('L1 — Micro', 'hover, focus, toggle · 160 ms · čisté CSS transitions') +
        spec('L2 — Karta', 'parallax fotografie uvnitř rámu (max 22 px) a jemnější posun metadat (7 px) · rAF') +
        spec('L3 — Sekce', 'reveal, stagger, maskované řádky nadpisu · IntersectionObserver · 900 ms') +
        spec('L4 — Mapa a pohledy', 'flyTo, morph mapa ↔ mřížka ↔ seznam, vjezd panelu · 460–1100 ms') +
        spec('Easing', '<code>cubic-bezier(0.22, 1, 0.36, 1)</code> pro vstupy, <code>(0.65, 0, 0.35, 1)</code> pro změny stavu') +
        spec('Zakázáno', 'bouncing bez důvodu, excessive blur, cursor gimmicky, animace blokující interakci') +
      '</div>') +

    /* --- 08 datový model -------------------------------------------------- */
    section('Datový model', 'Pět entit',
      'Frontend s daty pracuje jako s API odpovědí. Při napojení backendu se mění jediná věc — ' +
      'zdroj dat. Tvary zůstávají.',
      '<div class="grid-auto grid-auto--tight" data-stagger="60">' +
        [
          ['PROJECT', 'id · slug · name · status · locationId · developerId · priceFrom · priceTo · pricePerM2 · unitsTotal · unitsAvailable · type[] · layouts[] · sizeRange · coords · images[] · lifestyle[] · invest[] · investmentScore'],
          ['UNIT', 'id · projectId · code · layout · area · terrace · floor · orientation · price · status · plan'],
          ['DEVELOPER', 'id · slug · name · logo · founded · size · hq · regions[] · rating · verified · certifications[] · stats{built, active, units, sold}'],
          ['LOCATION', 'id · slug · name · kind · region · district · coords · avgM2 · yoy · investmentScore · infrastructureScore · lifestyleScore'],
          ['ARTICLE', 'id · slug · title · category · date · readMin · img · perex · featured']
        ].map(function (e) {
          return '<div class="dcard" data-reveal="up">' +
            '<span class="meta meta--ink">' + e[0] + '</span>' +
            '<code style="font-family:var(--font-mono);font-size:var(--t-xs);line-height:1.7;color:var(--ink-70);' +
              'word-break:break-word">' + esc(e[1]) + '</code></div>';
        }).join('') +
      '</div>') +

    '<section class="section cta-band">' +
      '<div class="bleed">' +
        '<h2 class="display-1" data-split style="max-width:18ch">Systém je hotový. Obrazovky se z něj dají skládat.</h2>' +
        '<a class="btn btn--lg btn--accent" href="index.html" style="margin-top:40px">Zpět na mapu</a>' +
      '</div>' +
    '</section>';

  function demo(title, body) {
    return '<div data-reveal="up"><span class="meta">' + esc(title) + '</span>' +
      '<div class="demo-box" style="margin-top:14px">' + body + '</div></div>';
  }

  $('#page-root').innerHTML = html;

  UM.on(document, 'click', '.js-theme-demo', function () { UM.theme.toggle(); UM.theme.sync(); });

  UM.chrome.bind();
  global.UM_MOTION.splitLines();
  global.UM_MOTION.rebind(document);
  global.UM_MOTION.reveals();
})(window);
