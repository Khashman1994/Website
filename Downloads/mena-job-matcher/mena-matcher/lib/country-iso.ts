// lib/country-iso.ts
//
// Shared country/city → ISO 3166-1 alpha-2 lookup. Used by:
//   - scripts/sync-jobs.ts          (background scraper)
//   - app/actions/employer.ts       (employer-posted jobs)
//   - any future writer of jobs.country
//
// Keep in sync with ARAB_COUNTRIES_CITIES in components/ui/LocationSelector.tsx.
// "tripoli" is intentionally NOT a bare key — it's ambiguous between Lebanon
// and Libya; only the disambiguated "City, Country" form will resolve.
//
// This module has no React or Next.js dependencies so it's safe to import
// from a plain Node script.

export const COUNTRY_ISO_MAP: Record<string, string> = {
  // Saudi Arabia
  'saudi arabia':'sa','ksa':'sa','sau':'sa',
  'riyadh':'sa','jeddah':'sa','mecca':'sa','medina':'sa','dammam':'sa',
  'khobar':'sa','dhahran':'sa','tabuk':'sa','abha':'sa','taif':'sa',
  'neom':'sa','qassim':'sa','hail':'sa','najran':'sa','jizan':'sa',
  // United Arab Emirates
  'united arab emirates':'ae','uae':'ae','are':'ae','emirates':'ae',
  'dubai':'ae','abu dhabi':'ae','sharjah':'ae','ajman':'ae',
  'ras al khaimah':'ae','fujairah':'ae','umm al quwain':'ae','al ain':'ae',
  // Egypt
  'egypt':'eg','egy':'eg',
  'cairo':'eg','alexandria':'eg','giza':'eg','sharm el sheikh':'eg',
  'hurghada':'eg','luxor':'eg','aswan':'eg','mansoura':'eg','tanta':'eg',
  'suez':'eg','port said':'eg','new cairo':'eg',
  // Qatar
  'qatar':'qa','qat':'qa',
  'doha':'qa','al rayyan':'qa','al wakrah':'qa','al wakra':'qa',
  'al khor':'qa','lusail':'qa',
  // Kuwait
  'kuwait':'kw','kwt':'kw',
  'kuwait city':'kw','hawalli':'kw','salmiya':'kw','jahra':'kw',
  'farwaniya':'kw','ahmadi':'kw',
  // Bahrain
  'bahrain':'bh','bhr':'bh',
  'manama':'bh','riffa':'bh','muharraq':'bh','hamad town':'bh',
  'isa town':'bh','sitra':'bh',
  // Oman
  'oman':'om','omn':'om',
  'muscat':'om','salalah':'om','sohar':'om','nizwa':'om',
  'sur':'om','ibri':'om',
  // Jordan
  'jordan':'jo','jor':'jo',
  'amman':'jo','zarqa':'jo','irbid':'jo','aqaba':'jo',
  'madaba':'jo','salt':'jo',
  // Lebanon (no bare 'tripoli' — see file header)
  'lebanon':'lb','lbn':'lb',
  'beirut':'lb','sidon':'lb','tyre':'lb','zahle':'lb',
  'byblos':'lb','jounieh':'lb',
  // Iraq
  'iraq':'iq','irq':'iq',
  'baghdad':'iq','basra':'iq','mosul':'iq','erbil':'iq','najaf':'iq',
  'karbala':'iq','kirkuk':'iq','sulaymaniyah':'iq',
  // Libya (no bare 'tripoli' — see file header)
  'libya':'ly','lby':'ly',
  'benghazi':'ly','misrata':'ly','tobruk':'ly','sabha':'ly','zawiya':'ly',
  // Tunisia
  'tunisia':'tn','tun':'tn',
  'tunis':'tn','sfax':'tn','sousse':'tn','kairouan':'tn','bizerte':'tn','gabes':'tn',
  // Algeria
  'algeria':'dz','dza':'dz',
  'algiers':'dz','oran':'dz','constantine':'dz','annaba':'dz',
  'blida':'dz','sétif':'dz','setif':'dz','batna':'dz',
  // Morocco
  'morocco':'ma','mar':'ma',
  'casablanca':'ma','rabat':'ma','marrakech':'ma','fes':'ma','fez':'ma',
  'tangier':'ma','agadir':'ma','meknes':'ma','oujda':'ma',
  // Palestine
  'palestine':'ps','pse':'ps',
  'ramallah':'ps','gaza':'ps','bethlehem':'ps','hebron':'ps',
  'nablus':'ps','jericho':'ps','jerusalem':'ps',
  // Syria
  'syria':'sy','syr':'sy',
  'damascus':'sy','aleppo':'sy','homs':'sy','latakia':'sy','hama':'sy',
  'deir ez-zor':'sy','tartus':'sy','raqqa':'sy','idlib':'sy',
  // Yemen
  'yemen':'ye','yem':'ye',
  "sana'a":'ye','sanaa':'ye','aden':'ye','taiz':'ye',
  'hodeidah':'ye','mukalla':'ye','ibb':'ye',
  // Sudan
  'sudan':'sd','sdn':'sd',
  'khartoum':'sd','omdurman':'sd','port sudan':'sd','kassala':'sd',
  'nyala':'sd','el obeid':'sd',
  // Somalia
  'somalia':'so','som':'so',
  'mogadishu':'so','hargeisa':'so','bosaso':'so','kismayo':'so','berbera':'so',
  // Djibouti
  'djibouti':'dj','dji':'dj',
  'djibouti city':'dj','ali sabieh':'dj','tadjoura':'dj','obock':'dj','dikhil':'dj',
  // Comoros
  'comoros':'km','com':'km',
  'moroni':'km','mutsamudu':'km','fomboni':'km','domoni':'km',
  // Mauritania
  'mauritania':'mr','mrt':'mr',
  'nouakchott':'mr','nouadhibou':'mr','rosso':'mr','atar':'mr',
  'kaédi':'mr','kaedi':'mr',
  // Disambiguated Tripoli (only "City, Country" form resolves)
  'tripoli, lebanon':'lb','tripoli, libya':'ly',
};

/**
 * Resolve a country / city / "City, Country" string to an ISO 3166-1
 * alpha-2 code. Returns null when the input is unrecognised so we don't
 * poison the column with garbage.
 */
export function toIso(input: string | null | undefined): string | null {
  if (!input) return null;
  const t = input.trim();
  if (!t) return null;

  // Already a 2-letter ISO code? Just lowercase it.
  if (/^[a-z]{2}$/i.test(t)) return t.toLowerCase();

  const lower = t.toLowerCase();
  if (COUNTRY_ISO_MAP[lower]) return COUNTRY_ISO_MAP[lower];

  // Fall back to the country segment of "City, Country"
  const parts = t.split(',');
  if (parts.length > 1) {
    const last = parts[parts.length - 1].trim().toLowerCase();
    if (COUNTRY_ISO_MAP[last]) return COUNTRY_ISO_MAP[last];
  }

  return null;
}
