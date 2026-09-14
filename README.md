# Urbanmap.cz — frontend koncept

Mapově-datová discovery platforma pro nové developerské projekty v ČR.
High-fidelity frontend prototyp: kompletní design system, mapový explorer,
filtrační architektura, detailové stránky, dark mode a responzivní chování.

---

## Spuštění

```bash
node server.js
```

→ `http://localhost:4321`

Bez závislostí, bez build kroku. Stačí Node.
(Prototyp lze otevřít i přímo z disku, ale mapový podklad se načítá přes
`fetch`, takže lokální server je spolehlivější.)

Prototyp potřebuje připojení k síti pro mapový podklad (CARTO), písma
(Google Fonts) a knihovny (MapLibre, GSAP, Lenis). Bez sítě se vykreslí
zjednodušený obrys ČR a zbytek aplikace funguje beze změny.

---

## Stránky

| Soubor | Obsah |
|---|---|
| `index.html` | Domovská stránka — mapový explorer + editorial vrstva |
| `projekt.html?p=<slug>` | Detail projektu — přehled, galerie, jednotky, lokalita, developer, investice |
| `developer.html?d=<slug>` | Profil developera — mapa realizací, aktivní portfolio, reference |
| `lokality.html` | Rozcestník lokalit s datovou tabulkou |
| `lokalita.html?loc=<slug>` | SEO landing „Novostavby <město>" |
| `developeri.html` | Seznam developerů s filtry |
| `magazin.html` | Editorial vrstva + SEO rozcestník |
| `pro-developery.html` | Monetizace — Standard / Premium / Regionální dominance |
| `system.html` | **Design system** — tokeny, typografie, komponenty, mapový a motion model |

---

## Architektura

```
css/
  tokens.css       barvy, typografie, spacing, motion — jediný zdroj pravdy
  base.css         reset, typografická škála, layout primitiva, reveal třídy
  components.css   header, tlačítka, chipy, karty, tabulky, footer, drawer
  app.css          mapový shell, command bar, filtry, markery, panely
  pages.css        editorial sekce a detailové stránky

js/
  data.js          datový model + mock data (PROJECT · UNIT · DEVELOPER · LOCATION · ARTICLE)
  core.js          helpery, formátování, ikony, theme, chrome, command search
  cards.js         šablony karet (mapa · mřížka · seznam · náhled)
  motion.js        motion systém L1–L4, parallax, reveals, split text, countery
  map.js           mapový engine s vlastním API (obal nad MapLibre)
  explorer.js      stavový stroj domovské stránky (filtry → výsledky → mapa → náhled)
  home.js          skládá homepage
  project.js       detail projektu
  developer.js     profil developera
  lokality.js / lokalita.js / developeri.js / magazin.js / pro-developery.js / system.js
```

Sdílený kód je v `core.js`, `cards.js`, `motion.js` a `map.js`; stránkové
moduly jen skládají obsah. Žádná stránka nemá vlastní CSS.

---

## Datový model

Frontend s daty pracuje jako s API odpovědí. Při napojení backendu se mění
jediná věc — zdroj dat v `data.js`. Tvary zůstávají.

```
PROJECT    id · slug · name · status · locationId · developerId
           priceFrom · priceTo · pricePerM2 · unitsTotal · unitsAvailable
           type[] · layouts[] · sizeRange · floors · completion
           lifestyle[] · invest[] · investmentScore · coords · images[]
           featured · premium

UNIT       id · projectId · code · layout · area · terrace · floor
           orientation · price · status · plan

DEVELOPER  id · slug · name · logo · founded · size · hq · regions[]
           rating · verified · certifications[] · stats{built,active,units,sold}

LOCATION   id · slug · name · kind · region · district · coords
           avgM2 · yoy · investmentScore · infrastructureScore · lifestyleScore

ARTICLE    id · slug · title · category · date · readMin · img · perex
```

Přístup přes `UM_DATA`: `project()`, `developer()`, `location()`, `units()`,
`projectsByDeveloper()`, `projectsByLocation()`, `hydrate()`, `totals()`.

---

## Mapový engine

`UM_MAP.create(opts)` je záměrně tenká vrstva nad mapovou knihovnou:

```js
map.setData(points)          // [{id, coords, status, featured, label}]
map.select(id, {fly})        // výběr projektu + přelet
map.highlight(id)            // zvýraznění při hoveru nad kartou
map.flyTo(coords, zoom)
map.fitAll()
map.setLayer(key, on)        // datové vrstvy
map.setDrawMode(on)          // kreslení oblasti
map.setTheme('dark')         // přeladění podkladu
```

**Prototyp běží na MapLibre GL + CARTO vector basemap.** MapLibre je
API-kompatibilní fork Mapbox GL — přechod na Mapbox znamená změnit
konstruktor a zdroj stylu v `map.js`, nic víc.

Podklad se za běhu přebarvuje na brandové tokeny (`restyle()`) a odstraňují
se POI ikony a čísla popisná. Mapa proto nevypadá jako screenshot z Map Google.

Markery jsou HTML, ne canvas — plná kontrola nad typografií a stavy.
Shlukování je vzdálenostní v pixelovém prostoru, nezávislé na knihovně.

**Scroll:** zoom kolečkem je vypnutý, dokud uživatel do mapy neklikne.
Mapa nesmí ukrást scroll stránky.

---

## Filtrační architektura

Stav je jediný objekt, mapa i seznam jsou jeho projekce. Stav se zrcadlí do
URL, takže filtrovaný pohled je sdílitelný odkaz.

```js
{ q, locations[], price[min,max], layouts[], size[min,max],
  status[], types[], invest[], lifestyle[], area, sort, view }
```

Funkční: lokalita, cena (s histogramem nabídky), dispozice, velikost, stav,
typ, lifestyle, kreslení oblasti do mapy, řazení, fulltext.

**Investiční filtry** mají UI i datovou strukturu, ale atributy závislé na
transakčních datech (růst lokality, yield) jsou ve stavu „brzy" — v prototypu
pro ně záměrně nejsou vymyšlená čísla.

---

## Typografie

**Jedna rodina pro celý web: ITC Avant Garde Gothic Pro** (Adobe Fonts, kit
`pit3voh`). Hierarchii nese váha a velikost, ne střídání písem. Lokální
záložkou je Century Gothic — nejbližší geometrický grotesk, který bývá
na Windows i macOS. Žádný další webfont se nenačítá.

Kit nese váhy 300 / 500 / 600 / 700; žebřík stojí na třech z nich:

| Váha | Kde |
|---|---|
| **600 Demi** | nadpisy — vždy verzálkami |
| **500 Medium** | rozhraní: tabulky, popisky, čísla, ovládání, štítky |
| **300 Book** | souvislý text — lead a odstavce |

**Nadpisy jdou verzálkami.** Platí pro `h1`–`h6` i pro display třídy,
včetně názvů projektů na kartách a v seznamu. Geometrický grotesk je na caps
stavěný, proto sázíme natěsno (tracking −0,018 em u display, −0,01 em u nadpisů
karet) a s řádkováním 1,0 — verzálky nemají dolní dotažnice.

Výjimka: nadpisová značka použitá jako **drobný popisek** (`h4` v patičce,
`h5` u mapových vrstev, `h4.meta` v mobilním menu) verzálky nedostává.
Verzálky patří nadpisům, ne labelům.

Čeština je v kitu kompletní — háčky, čárky i kroužek. Číslice mají všechny
stejnou šířku, takže číselné sloupce v tabulkách sedí bez dalšího zásahu.

### Web projekt musí mít vypnuté OpenType features

ITC Avant Garde Gothic Pro nese jako **výchozí** Lubalinovy alternativní
verzálky z loga časopisu Avant Garde: `A` bez příčky, rozkročené `M`,
protínané `V` a `W`. Jako logotyp jsou ikonické, pro běžnou sazbu nečitelné
(„MAPA" se čte jako „⋀APA").

Nejde je vypnout z CSS — `liga`, `clig`, `calt`, `dlig` ani `salt` s nimi
nehnou, protože to nejsou volitelné alternativy, ale výchozí glyfy.
Řeší se to **v nastavení web projektu na Adobe Fonts vypnutím OpenType
features**. Pokud se alternativní tvary někdy vrátí, je to tahle volba.

## Barevný systém

Paleta je laděná do hnědé, reference **Silver Pinewood**: teplá krémová plocha,
hluboká hnědá pro interakci, taupe jako sekundární tón. Žádná modrá.

| Token | Světlý | Tmavý | Role |
|---|---|---|---|
| `--paper` | `#F2EDE6` | `#0F0C0A` | ground stránky |
| `--ink` | `#1A1613` | `#EFE9E1` | primární text |
| `--accent` | `#6B4A35` | `#C9A98F` | interakce, aktivní stav, CTA |
| `--clay` | `#A3897A` | `#BE9E8C` | editorial, lokality — nikdy pod text |

Akcent se mezi režimy **obrací**: na krémovém podkladu musí unést text
(kontrast 6,9:1), na uhlovém proto přechází do pískové (8,6:1). Světlý taupe
`--clay` na text nestačí (3,3:1) a je vyhrazený pro plochy.

Stavová paleta zůstává čitelná jako signál — zelená, okrová, červená — jen
„Dokončeno" a „Připravuje se" přešly z chladné šedomodré do teplé grafitové,
aby na stránce nezůstal cizí tón.

## Tvarosloví

Konstrukce je **hranatá** — karty, panely, tlačítka, pole, tabulky, mapa.
Zaoblení zůstává výhradně štítkům, které leží nad obsahem (stav, Premium,
developer, cenový marker v mapě). Tvar tak sám nese význam: co je zakulacené,
je nálepka.

## Motion systém

| Úroveň | Co | Jak |
|---|---|---|
| L1 Micro | hover, focus, toggle | CSS transitions, 160 ms |
| L2 Karta | parallax fotografie (±22 px) a metadat (±7 px) uvnitř karty | rAF, `--px` / `--py` |
| L3 Sekce | reveal, stagger, maskované řádky nadpisu | IntersectionObserver, 900 ms |
| L4 Mapa / pohledy | flyTo, morph mapa ↔ mřížka ↔ seznam, panely | 460–1100 ms |

GSAP a Lenis jsou volitelné — bez nich běží stejná choreografie v základní
podobě. Vše respektuje `prefers-reduced-motion`.

---

## Co je vědomě mimo rozsah prototypu

- **Backend a perzistence.** Data jsou v `data.js`, formuláře nic neodesílají.
- **Investiční scoring nad reálnými daty.** UI je připravené, model ne.
- **Heatmapy cen, yieldu a plánovaného rozvoje.** Přepínač vrstev je v mapě,
  označený jako fáze 2/3.
- **Geokodér** pro filtr „vzdálenost od bodu".
- **Vlastní vizuální obsah.** Použité vizualizace a loga jsou zástupné
  podklady ze složky `assets/img`, sdílené napříč projekty. V produkci má
  každý projekt vlastní galerii.

---

## Kontrolní otázky vizuálního auditu

- Je mapa první obrazovkou a dominantní plochou? **Ano** — explorer zabírá
  `100dvh − chrome`, mapa 62 % šířky na desktopu.
- Je desktop full-width? **Ano** — žádný `max-width` container, jen
  `padding-inline: clamp(18px, 2.6vw, 56px)`.
- Vidí uživatel na první pohled KDE · CO · CENA · STAV · DOSTUPNOST · KDO?
  **Ano** — na markeru, kartě i v náhledu.
- Je dark mode samostatný jazyk, ne inverze? **Ano** — vlastní hodnoty pro
  plochy, linky, markery i mapový podklad.
- Má každá animace důvod? Každá vysvětluje změnu stavu nebo prostor.
