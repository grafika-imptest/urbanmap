/* ==========================================================================
   URBANMAP — DATOVÝ MODEL + MOCK DATA
   --------------------------------------------------------------------------
   Entity: DEVELOPER · LOCATION · PROJECT · UNIT · ARTICLE
   Frontend s nimi pracuje jako s API odpovědí — jediné, co se při napojení
   na backend změní, je zdroj (fetch místo konstanty). Tvary zůstávají.

   Pozn.: vizualizace i loga jsou zástupné podklady ze složky /assets/img,
   sdílené napříč projekty. V produkci 1 projekt = vlastní galerie.
   ========================================================================== */
(function (global) {
  'use strict';

  var IMG = 'assets/img/';
  var SETS = {
    mestanka:  { dir: 'rezidence-mestanka', logo: 'logo_projektu.png' },
    zastavka:  { dir: 'byty-zastavka',      logo: 'logo_projekt.webp' },
    kosu:      { dir: 'kosu',               logo: 'logo_projektu.webp' },
    colonnade: { dir: 'villa-colonnade',    logo: 'logo_projektu.svg' },
    vrchlabi:  { dir: 'vrchlabi-apartmany', logo: 'logo_projektu.png' }
  };

  /** Galerie projektu z jedné sady, s volitelným pootočením pořadí,
   *  aby se opakující podklady neopakovaly na obrazovce vedle sebe. */
  function gallery(setKey, offset) {
    var s = SETS[setKey], out = [], i, n;
    offset = offset || 0;
    for (i = 0; i < 5; i++) {
      n = ((i + offset) % 5) + 1;
      out.push(IMG + s.dir + '/vizualizace-' + n + '.jpg');
    }
    return out;
  }
  function projectLogo(setKey) {
    return IMG + SETS[setKey].dir + '/' + SETS[setKey].logo;
  }

  /* ------------------------------------------------------------------------
     ČÍSELNÍKY
     ------------------------------------------------------------------------ */
  var STATUS = {
    planned: { key: 'planned', label: 'Připravuje se',  short: 'Příprava',   order: 1, group: 'active' },
    presale: { key: 'presale', label: 'V předprodeji',  short: 'Předprodej', order: 2, group: 'active' },
    selling: { key: 'selling', label: 'V prodeji',      short: 'V prodeji',  order: 3, group: 'active' },
    done:    { key: 'done',    label: 'Dokončeno',      short: 'Dokončeno',  order: 4, group: 'completed' },
    sold:    { key: 'sold',    label: 'Vyprodáno',      short: 'Vyprodáno',  order: 5, group: 'completed' }
  };

  var TYPES = {
    flats:   'Byty',
    houses:  'Rodinné domy',
    apart:   'Apartmány',
    leisure: 'Rekreační',
    mixed:   'Mixed-use',
    invest:  'Investiční'
  };

  var LAYOUTS = ['1+kk', '2+kk', '3+kk', '4+kk', '5+kk', 'RD'];

  var LIFESTYLE = {
    forest:    'U lesa',
    water:     'U vody',
    center:    'Centrum',
    quiet:     'Klidná lokalita',
    transit:   'MHD na dosah',
    schools:   'Školy',
    coworking: 'Coworking',
    ski:       'Ski areál',
    golf:      'Golf',
    wellness:  'Wellness'
  };

  /* Investiční atributy — UI je připravené, data dorazí ve fázi 2.
     `soon: true` = filtr se zobrazí, ale je neaktivní (žádná fake data). */
  var INVEST = {
    rental:   { label: 'Vhodné na pronájem',    soon: false },
    flip:     { label: 'Vhodné na flip',        soon: false },
    growth:   { label: 'Očekávaný růst lokality', soon: true },
    tourist:  { label: 'Turistická lokalita',   soon: false },
    student:  { label: 'Studentská lokalita',   soon: false },
    entry:    { label: 'Nízká vstupní cena',    soon: false },
    yield:    { label: 'Vysoký yield',          soon: true },
    premium:  { label: 'Premium segment',       soon: false }
  };

  /* ------------------------------------------------------------------------
     DEVELOPER
     ------------------------------------------------------------------------ */
  var developers = [
    {
      id: 'dev-dbest', slug: 'dbest-living', name: 'dbest living',
      logo: IMG + 'rezidence-mestanka/dbest_living_developer.webp', invertInDark: true,
      founded: 2008, size: '45 zaměstnanců', hq: 'Praha',
      regions: ['Praha', 'Středočeský kraj', 'Jihomoravský kraj'],
      rating: 4.7, verified: true,
      certifications: ['ČSN EN ISO 9001', 'Člen ARTN', 'BREEAM Very Good'],
      description: 'Rezidenční developer se zaměřením na dostavbu vnitroměstských brownfieldů a citlivou práci s existující zástavbou. Od roku 2008 dokončil 22 projektů, převážně v Praze a okolí.',
      stats: { built: 22, active: 4, units: 1840, sold: 1612 }
    },
    {
      id: 'dev-fichr', slug: 'fichr-development', name: 'FICHR Development',
      logo: IMG + 'byty-zastavka/fichr-developer.png', invertInDark: true,
      founded: 2014, size: '18 zaměstnanců', hq: 'Brno',
      regions: ['Jihomoravský kraj', 'Vysočina'],
      rating: 4.4, verified: true,
      certifications: ['Člen ARTN'],
      description: 'Regionální developer z jižní Moravy. Staví menší bytové domy v satelitních obcích v dojezdu Brna, s důrazem na cenovou dostupnost a rychlost výstavby.',
      stats: { built: 9, active: 3, units: 412, sold: 336 }
    },
    {
      id: 'dev-aid', slug: 'aid-development', name: 'All Inclusive Development',
      logo:     IMG + 'kosu/AID-logo-horizontalni-pozitivni-small-bez_pozadi.png',
      logoDark: IMG + 'kosu/AID-logo-horizontalni-negativni-small-bez_pozadi.png',
      founded: 2011, size: '32 zaměstnanců', hq: 'Brno',
      regions: ['Jihomoravský kraj', 'Zlínský kraj', 'Olomoucký kraj'],
      rating: 4.6, verified: true,
      certifications: ['ČSN EN ISO 9001', 'ČSN EN ISO 14001'],
      description: 'Developer a architektonická kancelář v jednom. Většinu projektů navrhuje vlastním studiem, což se projevuje na konzistentní architektonické úrovni portfolia.',
      stats: { built: 14, active: 5, units: 968, sold: 790 }
    },
    {
      id: 'dev-acreal', slug: 'acreal', name: 'ACREAL',
      logo: IMG + 'villa-colonnade/acreal_developer.png', invertInDark: true,
      founded: 2005, size: '60 zaměstnanců', hq: 'Praha',
      regions: ['Praha', 'Královéhradecký kraj', 'Liberecký kraj'],
      rating: 4.8, verified: true,
      certifications: ['ČSN EN ISO 9001', 'BREEAM Excellent', 'Člen ARTN'],
      description: 'Nejdéle působící z portfolia. Kombinuje prémiové městské rezidence s horskými apartmánovými projekty v Krkonoších. Silné zázemí pro správu dokončených projektů.',
      stats: { built: 31, active: 6, units: 2430, sold: 2104 }
    },
    {
      id: 'dev-brave', slug: 'brave-development', name: 'Brave Development',
      logo: null, founded: 2016, size: '24 zaměstnanců', hq: 'Brno',
      regions: ['Jihomoravský kraj'],
      rating: 4.3, verified: true,
      certifications: [],
      description: 'Mladý brněnský developer orientovaný na kompaktní městské bydlení a investiční jednotky v dosahu MHD.',
      stats: { built: 6, active: 2, units: 386, sold: 254 }
    },
    {
      id: 'dev-nordic', slug: 'nordic-estate', name: 'Nordic Estate',
      logo: null, founded: 2012, size: '38 zaměstnanců', hq: 'Ostrava',
      regions: ['Moravskoslezský kraj', 'Olomoucký kraj'],
      rating: 4.1, verified: false,
      certifications: ['ČSN EN ISO 9001'],
      description: 'Severomoravský developer se zaměřením na revitalizaci industriálních areálů a mixed-use projekty.',
      stats: { built: 11, active: 3, units: 720, sold: 596 }
    },
    {
      id: 'dev-terra', slug: 'terra-nova-group', name: 'Terra Nova Group',
      logo: null, founded: 2018, size: '15 zaměstnanců', hq: 'Plzeň',
      regions: ['Plzeňský kraj', 'Karlovarský kraj'],
      rating: 4.0, verified: false,
      certifications: [],
      description: 'Developer rodinného bydlení v Plzeňském kraji. Specializuje se na řadové a dvojdomy s vlastními pozemky.',
      stats: { built: 5, active: 2, units: 178, sold: 121 }
    },
    {
      id: 'dev-modrava', slug: 'modrava-living', name: 'Modrava Living',
      logo: null, founded: 2015, size: '21 zaměstnanců', hq: 'Liberec',
      regions: ['Liberecký kraj', 'Královéhradecký kraj'],
      rating: 4.5, verified: true,
      certifications: ['Člen ARTN'],
      description: 'Horské a rekreační apartmány s provozovanou správou pronájmu. Projekty cílí primárně na investory hledající kombinaci vlastního užívání a výnosu.',
      stats: { built: 8, active: 3, units: 340, sold: 288 }
    }
  ];

  /* ------------------------------------------------------------------------
     LOCATION — samostatná datová vrstva, ne jen štítek u projektu
     ------------------------------------------------------------------------ */
  var locations = [
    { id: 'loc-praha',    slug: 'praha',            name: 'Praha',            kind: 'city',     region: 'Hlavní město Praha',   district: 'Praha',        coords: [14.4378, 50.0755], investmentScore: 88, infrastructureScore: 96, lifestyleScore: 84, avgM2: 148500, yoy: 5.4, img: gallery('mestanka')[2] },
    { id: 'loc-karlin', parent: 'loc-praha',   slug: 'praha-karlin',     name: 'Karlín',           kind: 'quarter',  region: 'Hlavní město Praha',   district: 'Praha 8',      coords: [14.4500, 50.0930], investmentScore: 92, infrastructureScore: 94, lifestyleScore: 90, avgM2: 176000, yoy: 6.1, img: gallery('colonnade')[0] },
    { id: 'loc-vinohrady', parent: 'loc-praha',slug: 'praha-vinohrady',  name: 'Vinohrady',        kind: 'quarter',  region: 'Hlavní město Praha',   district: 'Praha 2',      coords: [14.4450, 50.0760], investmentScore: 86, infrastructureScore: 95, lifestyleScore: 93, avgM2: 182000, yoy: 4.2, img: gallery('mestanka')[1] },
    { id: 'loc-smichov', parent: 'loc-praha',  slug: 'praha-smichov',    name: 'Smíchov',          kind: 'quarter',  region: 'Hlavní město Praha',   district: 'Praha 5',      coords: [14.4045, 50.0705], investmentScore: 84, infrastructureScore: 92, lifestyleScore: 81, avgM2: 158000, yoy: 5.8, img: gallery('colonnade')[3] },
    { id: 'loc-zizkov', parent: 'loc-praha',   slug: 'praha-zizkov',     name: 'Žižkov',           kind: 'quarter',  region: 'Hlavní město Praha',   district: 'Praha 3',      coords: [14.4600, 50.0870], investmentScore: 83, infrastructureScore: 90, lifestyleScore: 86, avgM2: 151000, yoy: 6.4, img: gallery('kosu')[2] },
    { id: 'loc-holesovice', parent: 'loc-praha',slug:'praha-holesovice', name: 'Holešovice',       kind: 'quarter',  region: 'Hlavní město Praha',   district: 'Praha 7',      coords: [14.4390, 50.1020], investmentScore: 85, infrastructureScore: 89, lifestyleScore: 88, avgM2: 163000, yoy: 5.9, img: gallery('kosu')[4] },
    { id: 'loc-brno',     slug: 'brno',             name: 'Brno',             kind: 'city',     region: 'Jihomoravský kraj',    district: 'Brno-město',   coords: [16.6068, 49.1951], investmentScore: 81, infrastructureScore: 88, lifestyleScore: 83, avgM2: 112000, yoy: 6.8, img: gallery('zastavka')[0] },
    { id: 'loc-zidenice', parent: 'loc-brno', slug: 'brno-zidenice',    name: 'Židenice',         kind: 'quarter',  region: 'Jihomoravský kraj',    district: 'Brno-město',   coords: [16.6480, 49.2010], investmentScore: 78, infrastructureScore: 82, lifestyleScore: 76, avgM2: 103000, yoy: 7.9, img: gallery('zastavka')[2] },
    { id: 'loc-zabovresky', parent: 'loc-brno',slug:'brno-zabovresky',  name: 'Žabovřesky',       kind: 'quarter',  region: 'Jihomoravský kraj',    district: 'Brno-město',   coords: [16.5750, 49.2130], investmentScore: 80, infrastructureScore: 86, lifestyleScore: 85, avgM2: 121000, yoy: 5.6, img: gallery('mestanka')[3] },
    { id: 'loc-kralovopole', parent: 'loc-brno',slug:'brno-kralovo-pole',name:'Královo Pole',     kind: 'quarter',  region: 'Jihomoravský kraj',    district: 'Brno-město',   coords: [16.5930, 49.2260], investmentScore: 79, infrastructureScore: 87, lifestyleScore: 80, avgM2: 115000, yoy: 6.2, img: gallery('kosu')[1] },
    { id: 'loc-ostrava',  slug: 'ostrava',          name: 'Ostrava',          kind: 'city',     region: 'Moravskoslezský kraj', district: 'Ostrava-město',coords: [18.2625, 49.8209], investmentScore: 67, infrastructureScore: 79, lifestyleScore: 68, avgM2: 68000,  yoy: 8.4, img: gallery('kosu')[3] },
    { id: 'loc-plzen',    slug: 'plzen',            name: 'Plzeň',            kind: 'city',     region: 'Plzeňský kraj',        district: 'Plzeň-město',  coords: [13.3776, 49.7475], investmentScore: 72, infrastructureScore: 83, lifestyleScore: 74, avgM2: 86000,  yoy: 6.0, img: gallery('colonnade')[1] },
    { id: 'loc-olomouc',  slug: 'olomouc',          name: 'Olomouc',          kind: 'city',     region: 'Olomoucký kraj',       district: 'Olomouc',      coords: [17.2509, 49.5938], investmentScore: 74, infrastructureScore: 81, lifestyleScore: 79, avgM2: 92000,  yoy: 6.6, img: gallery('mestanka')[4] },
    { id: 'loc-liberec',  slug: 'liberec',          name: 'Liberec',          kind: 'city',     region: 'Liberecký kraj',       district: 'Liberec',      coords: [15.0562, 50.7663], investmentScore: 70, infrastructureScore: 77, lifestyleScore: 82, avgM2: 89000,  yoy: 5.1, img: gallery('vrchlabi')[2] },
    { id: 'loc-spindl',   slug: 'spindleruv-mlyn',  name: 'Špindlerův Mlýn',  kind: 'mountain', region: 'Královéhradecký kraj', district: 'Trutnov',      coords: [15.6098, 50.7258], investmentScore: 89, infrastructureScore: 64, lifestyleScore: 94, avgM2: 195000, yoy: 9.2, img: gallery('vrchlabi')[0] },
    { id: 'loc-vrchlabi', slug: 'vrchlabi',         name: 'Vrchlabí',         kind: 'mountain', region: 'Královéhradecký kraj', district: 'Trutnov',      coords: [15.6080, 50.6290], investmentScore: 77, infrastructureScore: 71, lifestyleScore: 86, avgM2: 118000, yoy: 7.4, img: gallery('vrchlabi')[1] },
    { id: 'loc-harrachov',slug: 'harrachov',        name: 'Harrachov',        kind: 'mountain', region: 'Liberecký kraj',       district: 'Jablonec n. N.',coords:[15.4331, 50.7730], investmentScore: 82, infrastructureScore: 62, lifestyleScore: 90, avgM2: 152000, yoy: 8.1, img: gallery('vrchlabi')[3] },
    { id: 'loc-lipno',    slug: 'lipno-nad-vltavou',name: 'Lipno nad Vltavou',kind: 'water',    region: 'Jihočeský kraj',       district: 'Český Krumlov',coords: [14.2280, 48.6400], investmentScore: 85, infrastructureScore: 58, lifestyleScore: 92, avgM2: 168000, yoy: 8.8, img: gallery('colonnade')[4] },
    { id: 'loc-strachotin',slug:'strachotin',       name: 'Strachotín',       kind: 'water',    region: 'Jihomoravský kraj',    district: 'Břeclav',      coords: [16.6480, 48.8930], investmentScore: 76, infrastructureScore: 52, lifestyleScore: 88, avgM2: 112000, yoy: 9.6, img: gallery('zastavka')[3] },
    { id: 'loc-zastavka', slug: 'zastavka-u-brna',  name: 'Zastávka u Brna',  kind: 'town',     region: 'Jihomoravský kraj',    district: 'Brno-venkov',  coords: [16.3630, 49.1870], investmentScore: 66, infrastructureScore: 68, lifestyleScore: 71, avgM2: 74000,  yoy: 7.1, img: gallery('zastavka')[1] },
    { id: 'loc-hk',       slug: 'hradec-kralove',   name: 'Hradec Králové',   kind: 'city',     region: 'Královéhradecký kraj', district: 'Hradec Králové',coords:[15.8327, 50.2092], investmentScore: 73, infrastructureScore: 84, lifestyleScore: 80, avgM2: 94000,  yoy: 5.7, img: gallery('mestanka')[0] },
    { id: 'loc-cb',       slug: 'ceske-budejovice', name: 'České Budějovice', kind: 'city',     region: 'Jihočeský kraj',       district: 'Č. Budějovice',coords: [14.4749, 48.9745], investmentScore: 71, infrastructureScore: 80, lifestyleScore: 81, avgM2: 91000,  yoy: 6.3, img: gallery('colonnade')[2] }
  ];

  /* ------------------------------------------------------------------------
     PROJECT
     ------------------------------------------------------------------------ */
  function P(o) { return o; }

  var projects = [
    P({
      id: 'prj-mestanka', slug: 'rezidence-mestanka', name: 'Rezidence Měšťanka',
      status: 'selling', featured: true, premium: true,
      locationId: 'loc-zabovresky', address: 'Sochorova, Brno-Žabovřesky',
      developerId: 'dev-dbest',
      priceFrom: 6_940_000, priceTo: 14_200_000, pricePerM2: 118_000,
      unitsTotal: 48, unitsAvailable: 32,
      type: ['flats'], layouts: ['1+kk', '2+kk', '3+kk', '4+kk'],
      sizeRange: [38, 118], floors: 6, completion: 'Q3 2027',
      lifestyle: ['center', 'transit', 'schools', 'quiet'],
      invest: ['rental', 'student', 'premium'],
      investmentScore: 84,
      coords: [16.5750, 49.2130],
      images: gallery('mestanka', 0), logo: projectLogo('mestanka'),
      claim: 'Šest podlaží nad zahradou, která tam byla dřív než dům.',
      about: 'Rezidence Měšťanka doplňuje blokovou strukturu Žabovřesk na místě bývalého skladového areálu. Šestipodlažní dům s ustupujícím posledním patrem uzavírá vnitroblok a otevírá ho zeleni, která zůstala po původní zahradě. Přízemí patří obchodnímu parteru a společné klubovně.',
      architecture: 'Fasáda kombinuje světlou omítku s cihelným soklem v odkazu na meziválečnou zástavbu okolí. Okna jsou francouzská, lodžie zapuštěné do objemu domu, takže hmota zůstává čistá.',
      amenities: ['Vnitroblokový park 1 200 m²', 'Klubovna pro rezidenty', 'Kolárna a dílna', 'Nabíjecí stanice v garážích', 'Retenční nádrž na dešťovou vodu']
    }),
    P({
      id: 'prj-kosu', slug: 'kosu-residence', name: 'KOŠU Residence',
      status: 'presale', featured: true, premium: true,
      locationId: 'loc-kralovopole', address: 'Kosmova, Brno-Královo Pole',
      developerId: 'dev-aid',
      priceFrom: 5_480_000, priceTo: 16_900_000, pricePerM2: 124_000,
      unitsTotal: 96, unitsAvailable: 71,
      type: ['flats', 'mixed'], layouts: ['1+kk', '2+kk', '3+kk', '4+kk', '5+kk'],
      sizeRange: [32, 142], floors: 8, completion: 'Q1 2028',
      lifestyle: ['transit', 'coworking', 'schools', 'center'],
      invest: ['rental', 'student', 'entry'],
      investmentScore: 81,
      coords: [16.5930, 49.2260],
      images: gallery('kosu', 0), logo: projectLogo('kosu'),
      claim: 'Městský blok, který v sobě drží vlastní ulici.',
      about: 'Dva domy propojené parterem s průchodem do vnitrobloku. KOŠU vzniká na okraji Králova Pole v dosahu tramvaje i univerzitních kampusů, což z něj dělá jeden z mála brněnských projektů se srozumitelným nájemním potenciálem.',
      architecture: 'Rastr předsazených betonových rámů dává fasádě hloubku a zároveň stíní jižní orientaci. Materiálově se projekt drží pohledového betonu, hliníku a dřeva v parteru.',
      amenities: ['Coworking pro rezidenty 180 m²', 'Střešní terasa', 'Bike hub se servisem', 'Balíkové boxy', 'Komerční parter 640 m²']
    }),
    P({
      id: 'prj-colonnade', slug: 'villa-colonnade', name: 'Villa Colonnade',
      status: 'selling', featured: true, premium: true,
      locationId: 'loc-vinohrady', address: 'Slezská, Praha 2 — Vinohrady',
      developerId: 'dev-acreal',
      priceFrom: 14_900_000, priceTo: 64_000_000, pricePerM2: 214_000,
      unitsTotal: 22, unitsAvailable: 9,
      type: ['flats'], layouts: ['2+kk', '3+kk', '4+kk', '5+kk'],
      sizeRange: [64, 286], floors: 7, completion: 'Q4 2026',
      lifestyle: ['center', 'transit', 'wellness', 'schools'],
      invest: ['premium', 'rental'],
      investmentScore: 87,
      coords: [14.4450, 50.0760],
      images: gallery('colonnade', 0), logo: projectLogo('colonnade'),
      claim: 'Dvaadvacet bytů v domě, který se nesnaží být větší, než je.',
      about: 'Rekonstrukce a nástavba činžovního domu z roku 1911 na Vinohradech. Původní schodiště, štuky a litinové zábradlí zůstávají, technologie jsou kompletně nové. Poslední dvě patra tvoří nová nástavba s terasami do vnitrobloku.',
      architecture: 'Nástavba je vědomě odlišená — ustupující, v tmavém falcovaném plechu, aby se neschovávala za historizující fasádu. Vnitřní dispozice se vracejí k původní velkorysosti místností.',
      amenities: ['Wellness a sauna v suterénu', 'Vinný sklep s boxy', 'Concierge 12/7', 'Podzemní garáže s výtahem', 'Zachované historické prvky']
    }),
    P({
      id: 'prj-zastavka', slug: 'byty-zastavka', name: 'Byty Zastávka',
      status: 'selling', featured: false, premium: false,
      locationId: 'loc-zastavka', address: 'Nádražní, Zastávka u Brna',
      developerId: 'dev-fichr',
      priceFrom: 3_290_000, priceTo: 6_800_000, pricePerM2: 74_000,
      unitsTotal: 34, unitsAvailable: 18,
      type: ['flats'], layouts: ['1+kk', '2+kk', '3+kk'],
      sizeRange: [34, 88], floors: 4, completion: 'Q2 2027',
      lifestyle: ['quiet', 'transit', 'schools', 'forest'],
      invest: ['entry', 'rental'],
      investmentScore: 68,
      coords: [16.3630, 49.1870],
      images: gallery('zastavka', 0), logo: projectLogo('zastavka'),
      claim: 'Dvacet minut vlakem do centra Brna. Za polovinu ceny.',
      about: 'Dva bytové domy v docházkové vzdálenosti od vlakového nádraží. Projekt cílí na kupující, kteří jsou z brněnského trhu vytlačeni cenou, ale potřebují každodenní dojezd do města.',
      architecture: 'Jednoduchý objem se sedlovou střechou, která reaguje na měřítko obce. Bez ambice být architektonickým gestem — a projekt je na tom lépe.',
      amenities: ['Vlak do Brna 21 min', 'Vlastní parkovací stání', 'Sklepní kóje ke každému bytu', 'Dětské hřiště', 'Předzahrádky v přízemí']
    }),
    P({
      id: 'prj-vrchlabi', slug: 'apartmany-vrchlabi', name: 'Apartmány Vrchlabí',
      status: 'selling', featured: false, premium: true,
      locationId: 'loc-vrchlabi', address: 'Krkonošská, Vrchlabí',
      developerId: 'dev-acreal',
      priceFrom: 4_850_000, priceTo: 11_200_000, pricePerM2: 138_000,
      unitsTotal: 41, unitsAvailable: 14,
      type: ['apart', 'leisure', 'invest'], layouts: ['1+kk', '2+kk', '3+kk'],
      sizeRange: [28, 96], floors: 4, completion: 'Q4 2026',
      lifestyle: ['ski', 'forest', 'wellness', 'quiet'],
      invest: ['tourist', 'rental', 'yield'],
      investmentScore: 83,
      coords: [15.6080, 50.6290],
      images: gallery('vrchlabi', 0), logo: projectLogo('vrchlabi'),
      claim: 'Brána do Krkonoš se správou pronájmu v ceně.',
      about: 'Apartmánový dům na vjezdu do Vrchlabí, 14 km od Špindlerova Mlýna. Součástí nabídky je provozní smlouva na krátkodobý pronájem — apartmán se dá užívat i vydělávat, bez vlastní správy.',
      architecture: 'Dřevěný obklad, kamenný sokl a hluboké přesahy střechy. Materiálově horský slovník bez folkloru.',
      amenities: ['Správa krátkodobého pronájmu', 'Ski room s vyhříváním', 'Wellness se saunou', 'Recepce', 'Kryté parkování']
    }),
    P({
      id: 'prj-vynosium', slug: 'vynosium-zidenice', name: 'VynoSium',
      status: 'selling', featured: true, premium: false,
      locationId: 'loc-zidenice', address: 'Gajdošova, Brno-Židenice',
      developerId: 'dev-brave',
      priceFrom: 6_900_000, priceTo: 12_400_000, pricePerM2: 109_000,
      unitsTotal: 54, unitsAvailable: 32,
      type: ['flats', 'invest'], layouts: ['1+kk', '2+kk', '3+kk'],
      sizeRange: [36, 104], floors: 5, completion: 'Q2 2027',
      lifestyle: ['transit', 'center', 'coworking'],
      invest: ['rental', 'entry', 'student'],
      investmentScore: 79,
      coords: [16.6480, 49.2010],
      images: gallery('zastavka', 2), logo: null,
      claim: 'Kompaktní dispozice pro nájemní trh, ne pro katalog.',
      about: 'Projekt postavený kolem jednoho čísla — nájemního výnosu. Dispozice jsou navržené tak, aby se dobře pronajímaly, ne aby dobře vypadaly v půdorysu. Pro vlastní bydlení to nemusí být ideál, pro investici ano.',
      architecture: 'Racionální deskový dům s ustupujícím posledním podlažím a předsazenými balkony po celé délce jižní fasády.',
      amenities: ['Tramvaj 120 m', 'Sdílená kola v parteru', 'Balíkové boxy', 'Sklepy v ceně', 'Předpřipravená vláknová konektivita']
    }),
    P({
      id: 'prj-marina', slug: 'marina-strachotin', name: 'Marina Strachotín',
      status: 'presale', featured: true, premium: true,
      locationId: 'loc-strachotin', address: 'Nové Mlýny, Strachotín',
      developerId: 'dev-aid',
      priceFrom: 7_200_000, priceTo: 22_800_000, pricePerM2: 126_000,
      unitsTotal: 62, unitsAvailable: 62,
      type: ['apart', 'leisure', 'invest'], layouts: ['2+kk', '3+kk', '4+kk'],
      sizeRange: [52, 168], floors: 3, completion: 'Q2 2028',
      lifestyle: ['water', 'quiet', 'wellness', 'golf'],
      invest: ['tourist', 'rental', 'premium', 'yield'],
      investmentScore: 86,
      coords: [16.6480, 48.8930],
      images: gallery('colonnade', 2), logo: null,
      claim: 'Přístaviště, vinice a 62 apartmánů mezi nimi.',
      about: 'Rekreační areál na břehu střední nádrže Nových Mlýnů s vlastním přístavištěm pro 80 lodí. Projekt propojuje apartmánové bydlení s vinařskou turistikou Pálavy — sezóna zde trvá od dubna do října.',
      architecture: 'Nízké třípodlažní objemy stupňovitě klesající k vodě, aby žádný z apartmánů neztratil výhled. Dřevo, bílá omítka, ploché střechy s terasami.',
      amenities: ['Vlastní přístaviště 80 stání', 'Wellness a bazén', 'Restaurace a vinotéka', 'Půjčovna lodí a kol', 'Správa pronájmu']
    }),
    P({
      id: 'prj-karlin', slug: 'karlin-works', name: 'Karlín Works',
      status: 'selling', featured: false, premium: true,
      locationId: 'loc-karlin', address: 'Rohanské nábřeží, Praha 8',
      developerId: 'dev-dbest',
      priceFrom: 11_400_000, priceTo: 38_000_000, pricePerM2: 189_000,
      unitsTotal: 118, unitsAvailable: 43,
      type: ['flats', 'mixed'], layouts: ['1+kk', '2+kk', '3+kk', '4+kk'],
      sizeRange: [42, 198], floors: 9, completion: 'Q3 2027',
      lifestyle: ['center', 'water', 'transit', 'coworking'],
      invest: ['premium', 'rental'],
      investmentScore: 90,
      coords: [14.4500, 50.0930],
      images: gallery('kosu', 1), logo: null,
      claim: 'Poslední volný blok mezi Rohanským ostrovem a Invalidovnou.',
      about: 'Konverze průmyslové haly na bytový blok s komerčním parterem. Původní ocelová konstrukce zůstává viditelná v atriu, které prochází celým domem od parteru po střešní světlík.',
      architecture: 'Cihelná fasáda navazuje na industriální charakter Karlína, okenní otvory kopírují rastr původní haly. Nástavba je odsazená a prosklená.',
      amenities: ['Atrium s původní konstrukcí', 'Střešní zahrada 900 m²', 'Fitness pro rezidenty', 'Parter s gastro provozy', 'Cyklostezka podél Vltavy']
    }),
    P({
      id: 'prj-smichov', slug: 'smichov-terraces', name: 'Smíchov Terraces',
      status: 'planned', featured: false, premium: false,
      locationId: 'loc-smichov', address: 'Nádražní, Praha 5',
      developerId: 'dev-acreal',
      priceFrom: 9_800_000, priceTo: 29_000_000, pricePerM2: 172_000,
      unitsTotal: 164, unitsAvailable: 164,
      type: ['flats', 'mixed'], layouts: ['1+kk', '2+kk', '3+kk', '4+kk'],
      sizeRange: [38, 176], floors: 12, completion: 'Q4 2029',
      lifestyle: ['center', 'transit', 'coworking', 'schools'],
      invest: ['rental', 'premium'],
      investmentScore: 82,
      coords: [14.4045, 50.0705],
      images: gallery('mestanka', 2), logo: null,
      claim: 'Dvanáct pater terasovitě ustupujících od kolejiště.',
      about: 'Součást přestavby smíchovského nádraží. Projekt je zatím ve fázi územního řízení, prodej se předpokládá od roku 2027. Uvádíme ho proto, že už teď určuje cenovou hladinu celé lokality.',
      architecture: 'Terasovité ustupování směrem k železnici funguje zároveň jako protihluková strategie. Nejvyšší patra mají terasy o velikosti malého bytu.',
      amenities: ['Přímé napojení na metro B', 'Komerční parter 3 200 m²', 'Mateřská škola v objektu', 'Zelené střechy', 'Sdílená mobilita']
    }),
    P({
      id: 'prj-zizkov', slug: 'novy-zizkov', name: 'Nový Žižkov',
      status: 'selling', featured: false, premium: false,
      locationId: 'loc-zizkov', address: 'Jeseniova, Praha 3',
      developerId: 'dev-dbest',
      priceFrom: 8_200_000, priceTo: 19_600_000, pricePerM2: 164_000,
      unitsTotal: 86, unitsAvailable: 27,
      type: ['flats'], layouts: ['1+kk', '2+kk', '3+kk', '4+kk'],
      sizeRange: [36, 128], floors: 7, completion: 'Q1 2027',
      lifestyle: ['center', 'transit', 'schools', 'quiet'],
      invest: ['rental', 'student'],
      investmentScore: 80,
      coords: [14.4600, 50.0870],
      images: gallery('vrchlabi', 3), logo: null,
      claim: 'Žižkovský blok bez žižkovských kompromisů v technice.',
      about: 'Novostavba doplňující proluku v ulici Jeseniova. Standardem jde nad běžnou pražskou novostavbu — trojskla, řízené větrání s rekuperací v každém bytě, fotovoltaika na střeše.',
      architecture: 'Hmota respektuje uliční čáru a výšku sousedních domů. Fasáda je členěná vertikálními lizénami, které opticky zúžují poměrně široký dům.',
      amenities: ['Rekuperace v každém bytě', 'Fotovoltaika 48 kWp', 'Vnitroblok bez aut', 'Kočárkárna a kolárna', 'Metro Jiřího z Poděbrad 9 min']
    }),
    P({
      id: 'prj-holesovice', slug: 'holesovice-docks', name: 'Holešovice Docks',
      status: 'presale', featured: false, premium: true,
      locationId: 'loc-holesovice', address: 'Jankovcova, Praha 7',
      developerId: 'dev-acreal',
      priceFrom: 10_600_000, priceTo: 34_000_000, pricePerM2: 181_000,
      unitsTotal: 92, unitsAvailable: 68,
      type: ['flats', 'mixed'], layouts: ['1+kk', '2+kk', '3+kk', '4+kk', '5+kk'],
      sizeRange: [40, 210], floors: 8, completion: 'Q2 2028',
      lifestyle: ['water', 'center', 'transit', 'coworking'],
      invest: ['premium', 'rental'],
      investmentScore: 88,
      coords: [14.4390, 50.1020],
      images: gallery('colonnade', 1), logo: null,
      claim: 'Nábřeží, které Praha používala k překládce uhlí.',
      about: 'Projekt na holešovickém přístavu, kde se poslední dekádu nic nestavělo kvůli protipovodňové ochraně. Ta je dnes hotová a s ní se otevírá jedno z posledních velkých vnitroměstských nábřeží.',
      architecture: 'Přiznaná konstrukce, velkoformátové zasklení a ocelové balkonové konzoly odkazují na přístavní jeřáby. Parter je zvednutý nad stoletou vodu.',
      amenities: ['Přímý přístup na nábřeží', 'Mariána pro malá plavidla', 'Střešní bar', 'Coworking 240 m²', 'Tramvaj 4 min']
    }),
    P({
      id: 'prj-spindl', slug: 'spindl-peak', name: 'Špindl Peak',
      status: 'presale', featured: true, premium: true,
      locationId: 'loc-spindl', address: 'Bedřichov, Špindlerův Mlýn',
      developerId: 'dev-modrava',
      priceFrom: 8_200_000, priceTo: 26_500_000, pricePerM2: 198_000,
      unitsTotal: 38, unitsAvailable: 29,
      type: ['apart', 'leisure', 'invest'], layouts: ['1+kk', '2+kk', '3+kk', '4+kk'],
      sizeRange: [34, 142], floors: 4, completion: 'Q4 2027',
      lifestyle: ['ski', 'forest', 'wellness', 'water'],
      invest: ['tourist', 'premium', 'yield', 'rental'],
      investmentScore: 91,
      coords: [15.6098, 50.7258],
      images: gallery('vrchlabi', 1), logo: null,
      claim: 'Ski-in / ski-out na Medvědíně. Tři sta metrů od lanovky.',
      about: 'Apartmánový dům v Bedřichově s přímým napojením na sjezdovku. Krátkodobý pronájem zajišťuje provozovatel, obsazenost v zimní sezóně se v lokalitě dlouhodobě pohybuje nad 80 %.',
      architecture: 'Kamenný sokl, modřínový obklad, sedlová střecha s velkým sklonem. Interiéry v přírodních materiálech od českého studia.',
      amenities: ['Ski-in / ski-out', 'Wellness 340 m²', 'Recepce 24/7', 'Restaurace v přízemí', 'Garáž s ohřevem']
    }),
    P({
      id: 'prj-harrachov', slug: 'harrachov-lodges', name: 'Harrachov Lodges',
      status: 'planned', featured: false, premium: false,
      locationId: 'loc-harrachov', address: 'Nový Svět, Harrachov',
      developerId: 'dev-modrava',
      priceFrom: 6_400_000, priceTo: 15_800_000, pricePerM2: 152_000,
      unitsTotal: 24, unitsAvailable: 24,
      type: ['leisure', 'houses', 'invest'], layouts: ['3+kk', '4+kk', 'RD'],
      sizeRange: [78, 164], floors: 2, completion: 'Q3 2028',
      lifestyle: ['ski', 'forest', 'quiet', 'wellness'],
      invest: ['tourist', 'yield'],
      investmentScore: 78,
      coords: [15.4331, 50.7730],
      images: gallery('vrchlabi', 2), logo: null,
      claim: 'Dvacet čtyři samostatných domků na svahu nad Harrachovem.',
      about: 'Rekreační osada tvořená samostatnými dřevostavbami s vlastním pozemkem. Projekt je v přípravě, územní rozhodnutí se očekává v roce 2027.',
      architecture: 'Archetypální tvar chaty, redukovaný na čistou hmotu bez říms a přesahů. Modřín, který časem zešediví do stříbrné.',
      amenities: ['Vlastní pozemek 400–800 m²', 'Sauna v každém domku', 'Sdílená wellness budova', 'Skiareál 1,8 km', 'Správa pronájmu volitelná']
    }),
    P({
      id: 'prj-lipno', slug: 'lipno-bay', name: 'Lipno Bay',
      status: 'selling', featured: false, premium: true,
      locationId: 'loc-lipno', address: 'Lipno nad Vltavou',
      developerId: 'dev-modrava',
      priceFrom: 7_600_000, priceTo: 19_400_000, pricePerM2: 174_000,
      unitsTotal: 46, unitsAvailable: 11,
      type: ['apart', 'leisure', 'invest'], layouts: ['2+kk', '3+kk', '4+kk'],
      sizeRange: [46, 128], floors: 3, completion: 'Q2 2027',
      lifestyle: ['water', 'ski', 'forest', 'golf'],
      invest: ['tourist', 'yield', 'rental'],
      investmentScore: 85,
      coords: [14.2280, 48.6400],
      images: gallery('colonnade', 4), logo: null,
      claim: 'Celoroční destinace — voda v létě, sjezdovka v zimě.',
      about: 'Lipno je jedna z mála českých rekreačních lokalit s vyrovnanou letní i zimní sezónou, což zásadně mění ekonomiku krátkodobého pronájmu. Projekt stojí 300 m od břehu.',
      architecture: 'Tři nízké objemy otevřené k jihu, mezi nimi průhledy na vodní hladinu. Dřevo, sklo, pozinkovaný plech.',
      amenities: ['Molo a půjčovna lodí', 'Bazén s ohřevem', 'Bike servis', 'Ski areál 1,2 km', 'Golf 6 km']
    }),
    P({
      id: 'prj-ostrava', slug: 'ostrava-forge', name: 'Ostrava Forge',
      status: 'selling', featured: false, premium: false,
      locationId: 'loc-ostrava', address: 'Nádražní, Moravská Ostrava',
      developerId: 'dev-nordic',
      priceFrom: 2_980_000, priceTo: 9_400_000, pricePerM2: 71_000,
      unitsTotal: 142, unitsAvailable: 64,
      type: ['flats', 'mixed', 'invest'], layouts: ['1+kk', '2+kk', '3+kk', '4+kk'],
      sizeRange: [32, 132], floors: 8, completion: 'Q4 2026',
      lifestyle: ['center', 'transit', 'coworking'],
      invest: ['entry', 'rental', 'yield', 'student'],
      investmentScore: 74,
      coords: [18.2760, 49.8360],
      images: gallery('kosu', 3), logo: null,
      claim: 'Nejnižší vstupní cena mezi krajskými městy.',
      about: 'Konverze administrativní budovy z 80. let na bydlení. Ostrava má dlouhodobě nejvyšší hrubý nájemní výnos mezi českými krajskými městy — a nejnižší vstupní cenu.',
      architecture: 'Původní železobetonový skelet umožnil volné dispozice. Nová fasáda je provětrávaná, s hliníkovým obkladem v grafitové a pískové.',
      amenities: ['Vysoké stropy 3,1 m', 'Komerční parter', 'Kolárna', 'Hlavní nádraží 6 min tramvají', 'Nabíjecí stanice']
    }),
    P({
      id: 'prj-plzen', slug: 'bory-gardens', name: 'Bory Gardens',
      status: 'selling', featured: false, premium: false,
      locationId: 'loc-plzen', address: 'Klatovská třída, Plzeň-Bory',
      developerId: 'dev-terra',
      priceFrom: 5_900_000, priceTo: 13_800_000, pricePerM2: 88_000,
      unitsTotal: 28, unitsAvailable: 12,
      type: ['houses', 'flats'], layouts: ['3+kk', '4+kk', '5+kk', 'RD'],
      sizeRange: [82, 186], floors: 3, completion: 'Q3 2027',
      lifestyle: ['quiet', 'schools', 'forest', 'transit'],
      invest: ['entry'],
      investmentScore: 69,
      coords: [13.3670, 49.7220],
      images: gallery('mestanka', 1), logo: null,
      claim: 'Řadové domy s pozemkem deset minut od centra Plzně.',
      about: 'Soubor řadových a dvojdomů na okraji Borů. Každý dům má vlastní zahradu a dvě parkovací stání. Cílová skupina jsou rodiny, které v Plzni nechtějí byt.',
      architecture: 'Dvoupodlažní hmoty s plochou střechou, členěné barevností omítek do menších celků, aby řada nepůsobila jako jeden dlouhý objekt.',
      amenities: ['Zahrada 180–340 m²', 'Dvě parkovací stání', 'Tepelné čerpadlo v ceně', 'Univerzita 4 min', 'Borský park 900 m']
    }),
    P({
      id: 'prj-olomouc', slug: 'olomouc-riverside', name: 'Olomouc Riverside',
      status: 'selling', featured: false, premium: false,
      locationId: 'loc-olomouc', address: 'Střední novosadská, Olomouc',
      developerId: 'dev-aid',
      priceFrom: 4_600_000, priceTo: 12_200_000, pricePerM2: 96_000,
      unitsTotal: 74, unitsAvailable: 38,
      type: ['flats'], layouts: ['1+kk', '2+kk', '3+kk', '4+kk'],
      sizeRange: [36, 118], floors: 6, completion: 'Q1 2028',
      lifestyle: ['water', 'center', 'schools', 'transit'],
      invest: ['rental', 'student', 'entry'],
      investmentScore: 75,
      coords: [17.2509, 49.5860],
      images: gallery('zastavka', 1), logo: null,
      claim: 'Na břehu Moravy, deset minut pěšky od Horního náměstí.',
      about: 'Projekt na nábřeží řeky Moravy navazuje na dokončenou protipovodňovou úpravu koryta. Olomouc má díky univerzitě stabilní nájemní poptávku po malých bytech.',
      architecture: 'Dům sleduje oblouk nábřeží, parter je otevřený do promenády. Cihelná fasáda s bílými parapetními pásy.',
      amenities: ['Nábřežní promenáda', 'Univerzita Palackého 12 min', 'Komerční parter', 'Kolárna', 'Retenční zeleň na střeše']
    }),
    P({
      id: 'prj-liberec', slug: 'liberec-heights', name: 'Liberec Heights',
      status: 'done', featured: false, premium: false,
      locationId: 'loc-liberec', address: 'Husova, Liberec',
      developerId: 'dev-modrava',
      priceFrom: 5_200_000, priceTo: 11_900_000, pricePerM2: 92_000,
      unitsTotal: 52, unitsAvailable: 0,
      type: ['flats'], layouts: ['2+kk', '3+kk', '4+kk'],
      sizeRange: [48, 122], floors: 5, completion: 'Dokončeno 2025',
      lifestyle: ['forest', 'quiet', 'schools', 'ski'],
      invest: ['rental'],
      investmentScore: 72,
      coords: [15.0562, 50.7663],
      images: gallery('vrchlabi', 4), logo: null,
      claim: 'Dokončeno 2025. Reference, ne nabídka.',
      about: 'Projekt je dokončený a plně obsazený. V platformě zůstává jako reference developera — ukazuje, co Modrava Living skutečně postavila, ne co plánuje.',
      architecture: 'Svažitý pozemek řešený stupňovitým osazením, každý byt má výhled na Ještěd.',
      amenities: ['Výhled na Ještěd', 'Lesopark v sousedství', 'Parkování v suterénu', 'Dětské hřiště', 'Tramvaj 6 min']
    }),
    P({
      id: 'prj-hk', slug: 'hradec-park-residence', name: 'Hradec Park Residence',
      status: 'sold', featured: false, premium: false,
      locationId: 'loc-hk', address: 'Brněnská, Hradec Králové',
      developerId: 'dev-dbest',
      priceFrom: 4_900_000, priceTo: 10_800_000, pricePerM2: 94_000,
      unitsTotal: 38, unitsAvailable: 0,
      type: ['flats'], layouts: ['2+kk', '3+kk', '4+kk'],
      sizeRange: [52, 116], floors: 5, completion: 'Dokončeno 2024',
      lifestyle: ['quiet', 'schools', 'transit', 'forest'],
      invest: ['rental'],
      investmentScore: 70,
      coords: [15.8327, 50.2092],
      images: gallery('mestanka', 3), logo: null,
      claim: 'Vyprodáno za 11 měsíců od zahájení prodeje.',
      about: 'Referenční projekt dbest living mimo Prahu. Rychlost prodeje je jedním z indikátorů, které platforma u developera sleduje.',
      architecture: 'Kompaktní bytový dům s předsazenými lodžiemi, orientovaný do vnitrobloku s vzrostlou zelení.',
      amenities: ['Vnitroblok se vzrostlou zelení', 'Sklepy v ceně', 'Nabíjecí stanice', 'Škola 350 m', 'MHD 200 m']
    }),
    P({
      id: 'prj-cb', slug: 'budejovice-mill', name: 'Budějovice Mill',
      status: 'presale', featured: false, premium: false,
      locationId: 'loc-cb', address: 'Mlýnská stoka, České Budějovice',
      developerId: 'dev-nordic',
      priceFrom: 4_800_000, priceTo: 13_600_000, pricePerM2: 93_000,
      unitsTotal: 58, unitsAvailable: 51,
      type: ['flats', 'mixed'], layouts: ['1+kk', '2+kk', '3+kk', '4+kk'],
      sizeRange: [34, 124], floors: 5, completion: 'Q3 2028',
      lifestyle: ['water', 'center', 'quiet', 'schools'],
      invest: ['rental', 'entry'],
      investmentScore: 73,
      coords: [14.4749, 48.9745],
      images: gallery('kosu', 2), logo: null,
      claim: 'Konverze mlýna na Mlýnské stoce, 700 m od náměstí.',
      about: 'Přestavba areálu bývalého mlýna s dochovanou vodní technologií. Část původního zařízení zůstane přístupná ve společných prostorech.',
      architecture: 'Zachované cihelné zdivo doplněné vloženými ocelovými konstrukcemi. Nová část je odsazená a obložená pozinkovaným plechem.',
      amenities: ['Dochovaná mlýnská technologie', 'Nábřeží Mlýnské stoky', 'Kavárna v parteru', 'Kolárna', 'Historické centrum 9 min']
    })
  ];

  /* ------------------------------------------------------------------------
     UNIT — generované z parametrů projektu, tvar odpovídá cílovému API
     ------------------------------------------------------------------------ */
  var FLOOR_MIX = { '1+kk': [30, 44], '2+kk': [45, 68], '3+kk': [69, 98], '4+kk': [99, 134], '5+kk': [135, 190], 'RD': [110, 186] };

  function mulberry(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function buildUnits(p) {
    var rnd = mulberry(p.id.length * 977 + p.unitsTotal * 31);
    var units = [], i, layout, range, area, floor, price, status;
    var soldRatio = 1 - (p.unitsAvailable / p.unitsTotal);
    var count = Math.min(p.unitsTotal, 28); // v prototypu zobrazujeme výřez
    for (i = 0; i < count; i++) {
      layout = p.layouts[Math.floor(rnd() * p.layouts.length)];
      range = FLOOR_MIX[layout] || [40, 90];
      area = Math.round(range[0] + rnd() * (range[1] - range[0]));
      area = Math.max(p.sizeRange[0], Math.min(p.sizeRange[1], area));
      floor = Math.floor(rnd() * p.floors) + 1;
      price = Math.round((area * p.pricePerM2 * (0.93 + rnd() * 0.22)) / 10000) * 10000;
      if (p.status === 'sold') status = 'sold';
      else if (p.status === 'done') status = rnd() < 0.9 ? 'sold' : 'free';
      else status = rnd() < soldRatio ? (rnd() < 0.6 ? 'sold' : 'reserved') : 'free';
      units.push({
        id: p.id + '-u' + (i + 1),
        projectId: p.id,
        code: String.fromCharCode(65 + (floor % 4)) + '.' + (floor) + String(i + 1).padStart(2, '0'),
        layout: layout,
        area: area,
        terrace: rnd() < 0.55 ? Math.round(4 + rnd() * 28) : 0,
        floor: floor,
        orientation: ['J', 'JZ', 'JV', 'Z', 'V', 'S'][Math.floor(rnd() * 6)],
        price: price,
        status: status,
        plan: null
      });
    }
    return units.sort(function (a, b) { return a.floor - b.floor || a.area - b.area; });
  }

  /* ------------------------------------------------------------------------
     ARTICLE — magazín jako SEO vrstva
     ------------------------------------------------------------------------ */
  var articles = [
    { id: 'a1', slug: 'kde-se-v-cesku-vyplati-investovat-2026', title: 'Kde se v Česku v roce 2026 vyplatí investovat do novostavby', category: 'Investice', date: '2026-09-02', readMin: 9, img: gallery('kosu')[0], perex: 'Srovnání hrubého výnosu, vstupní ceny a likvidity ve všech krajských městech. Ostrava vede výnosem, Praha likviditou — a mezi tím leží rozhodnutí.', featured: true },
    { id: 'a2', slug: 'horske-apartmany-ekonomika', title: 'Horský apartmán jako investice: co se nepíše v prospektu', category: 'Analýza', date: '2026-08-21', readMin: 12, img: gallery('vrchlabi')[0], perex: 'Obsazenost, provozní poplatky, sezónnost a daňový režim. Modelový výpočet na třech krkonošských projektech.' },
    { id: 'a3', slug: 'novostavby-brno-2026', title: 'Novostavby Brno 2026: přehled všech aktivních projektů', category: 'Lokality', date: '2026-08-14', readMin: 7, img: gallery('zastavka')[0], perex: 'Sedmnáct projektů v prodeji, čtyři v předprodeji. Kde se staví, za kolik a kdy se dokončuje.' },
    { id: 'a4', slug: 'jak-cist-cenu-za-m2', title: 'Proč je cena za m² nejpřeceňovanější číslo na trhu', category: 'Trendy', date: '2026-08-03', readMin: 6, img: gallery('colonnade')[0], perex: 'Započtená terasa, sklep, garážové stání a podíl na společných prostorách. Čtyři způsoby, jak se stejný byt spočítá o 18 % levněji.' },
    { id: 'a5', slug: 'brownfieldy-praha', title: 'Pražské brownfieldy: co se postaví do roku 2032', category: 'Lokality', date: '2026-07-24', readMin: 11, img: gallery('mestanka')[0], perex: 'Rohanský ostrov, Smíchov, Bubny-Zátory. Mapa ploch, kapacit a reálných termínů.' },
    { id: 'a6', slug: 'jak-hodnotit-developera', title: 'Jak si ověřit developera dřív, než podepíšete rezervaci', category: 'Inspirace', date: '2026-07-11', readMin: 8, img: gallery('colonnade')[2], perex: 'Šest veřejně dostupných zdrojů, které o developerovi řeknou víc než jeho vlastní web.' }
  ];

  /* ------------------------------------------------------------------------
     API VRSTVA — jediné místo, kde se později vymění zdroj dat
     ------------------------------------------------------------------------ */
  var byId = function (arr) {
    var m = {}; arr.forEach(function (x) { m[x.id] = x; }); return m;
  };
  var devMap = byId(developers), locMap = byId(locations), prjMap = byId(projects);
  var unitCache = {};

  var DB = {
    STATUS: STATUS, TYPES: TYPES, LAYOUTS: LAYOUTS,
    LIFESTYLE: LIFESTYLE, INVEST: INVEST,

    developers: developers,
    locations: locations,
    projects: projects,
    articles: articles,

    developer: function (id) { return devMap[id]; },
    location:  function (id) { return locMap[id]; },
    project:   function (id) { return prjMap[id]; },

    developerBySlug: function (s) { return developers.filter(function (d) { return d.slug === s; })[0]; },
    projectBySlug:   function (s) { return projects.filter(function (p) { return p.slug === s; })[0]; },
    locationBySlug:  function (s) { return locations.filter(function (l) { return l.slug === s; })[0]; },

    units: function (projectId) {
      if (!unitCache[projectId]) unitCache[projectId] = buildUnits(prjMap[projectId]);
      return unitCache[projectId];
    },

    projectsByDeveloper: function (devId) {
      return projects.filter(function (p) { return p.developerId === devId; });
    },
    projectsByLocation: function (locId) {
      return projects.filter(function (p) { return p.locationId === locId; });
    },

    /** Města nemají projekty přímo na sobě — visí na jejich čtvrtích.
     *  Rozsah lokality je proto ona sama plus vše, co ji má jako parent. */
    locationScope: function (locId) {
      return [locId].concat(
        locations.filter(function (l) { return l.parent === locId; })
                 .map(function (l) { return l.id; })
      );
    },
    childLocations: function (locId) {
      return locations.filter(function (l) { return l.parent === locId; });
    },
    projectsInScope: function (locId) {
      var scope = DB.locationScope(locId);
      return projects.filter(function (p) { return scope.indexOf(p.locationId) > -1; });
    },

    /** Denormalizovaný tvar pro UI — projekt + rozbalený developer a lokalita. */
    hydrate: function (p) {
      return {
        p: p,
        dev: devMap[p.developerId],
        loc: locMap[p.locationId],
        st: STATUS[p.status]
      };
    },

    totals: function () {
      var active = projects.filter(function (p) { return STATUS[p.status].group === 'active'; });
      return {
        projects: projects.length,
        active: active.length,
        units: projects.reduce(function (a, p) { return a + p.unitsTotal; }, 0),
        available: projects.reduce(function (a, p) { return a + p.unitsAvailable; }, 0),
        developers: developers.length,
        locations: locations.length
      };
    }
  };

  global.UM_DATA = DB;
})(window);
