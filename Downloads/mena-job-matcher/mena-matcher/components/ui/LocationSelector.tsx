'use client';
// components/ui/LocationSelector.tsx
//
// Cascading Country → City selector for the 22 Arab League member states,
// with EN/AR labels and RTL-aware layout via useLang.
//
// `value` is a single combined string the parent owns:
//   "Riyadh, Saudi Arabia" — city + country
//   "Saudi Arabia"         — country only (when allowCountryOnly)
//   ""                     — nothing selected
//
// onChange fires with the new combined string whenever the selection changes.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '@/lib/i18n/LanguageContext';

// ─── Localised data: 22 Arab League countries × major cities ────────────────
type City = { en: string; ar: string };
export type Country = { en: string; ar: string; cities: City[] };

export const ARAB_COUNTRIES_CITIES: Country[] = [
  { en: 'Algeria',     ar: 'الجزائر',         cities: [
    { en: 'Algiers',     ar: 'الجزائر' }, { en: 'Oran',        ar: 'وهران' },
    { en: 'Constantine', ar: 'قسنطينة' }, { en: 'Annaba',     ar: 'عنابة' },
    { en: 'Blida',       ar: 'البليدة' }, { en: 'Sétif',       ar: 'سطيف' },
    { en: 'Batna',       ar: 'باتنة' },
  ]},
  { en: 'Bahrain',     ar: 'البحرين',          cities: [
    { en: 'Manama',     ar: 'المنامة' }, { en: 'Riffa',       ar: 'الرفاع' },
    { en: 'Muharraq',   ar: 'المحرق' },  { en: 'Hamad Town',  ar: 'مدينة حمد' },
    { en: 'Isa Town',   ar: 'مدينة عيسى' }, { en: 'Sitra',     ar: 'سترة' },
  ]},
  { en: 'Comoros',     ar: 'جزر القمر',        cities: [
    { en: 'Moroni',     ar: 'موروني' }, { en: 'Mutsamudu',   ar: 'موتسامودو' },
    { en: 'Fomboni',    ar: 'فومبوني' }, { en: 'Domoni',     ar: 'دوموني' },
  ]},
  { en: 'Djibouti',    ar: 'جيبوتي',           cities: [
    { en: 'Djibouti City', ar: 'مدينة جيبوتي' }, { en: 'Ali Sabieh', ar: 'علي صبيح' },
    { en: 'Tadjoura',     ar: 'تاجورة' }, { en: 'Obock',          ar: 'أوبوك' },
    { en: 'Dikhil',       ar: 'دخيل' },
  ]},
  { en: 'Egypt',       ar: 'مصر',             cities: [
    { en: 'Cairo',           ar: 'القاهرة' }, { en: 'Alexandria',     ar: 'الإسكندرية' },
    { en: 'Giza',            ar: 'الجيزة' },  { en: 'Sharm El Sheikh', ar: 'شرم الشيخ' },
    { en: 'Hurghada',        ar: 'الغردقة' }, { en: 'Luxor',          ar: 'الأقصر' },
    { en: 'Aswan',           ar: 'أسوان' },   { en: 'Mansoura',       ar: 'المنصورة' },
    { en: 'Tanta',           ar: 'طنطا' },    { en: 'Suez',           ar: 'السويس' },
    { en: 'Port Said',       ar: 'بورسعيد' },
  ]},
  { en: 'Iraq',        ar: 'العراق',           cities: [
    { en: 'Baghdad',     ar: 'بغداد' }, { en: 'Basra',     ar: 'البصرة' },
    { en: 'Mosul',       ar: 'الموصل' }, { en: 'Erbil',     ar: 'أربيل' },
    { en: 'Najaf',       ar: 'النجف' }, { en: 'Karbala',   ar: 'كربلاء' },
    { en: 'Kirkuk',      ar: 'كركوك' }, { en: 'Sulaymaniyah', ar: 'السليمانية' },
  ]},
  { en: 'Jordan',      ar: 'الأردن',           cities: [
    { en: 'Amman',  ar: 'عمّان' }, { en: 'Zarqa',  ar: 'الزرقاء' },
    { en: 'Irbid',  ar: 'إربد' },  { en: 'Aqaba',  ar: 'العقبة' },
    { en: 'Madaba', ar: 'مادبا' }, { en: 'Salt',   ar: 'السلط' },
  ]},
  { en: 'Kuwait',      ar: 'الكويت',           cities: [
    { en: 'Kuwait City', ar: 'مدينة الكويت' }, { en: 'Hawalli',  ar: 'حولي' },
    { en: 'Salmiya',     ar: 'السالمية' }, { en: 'Jahra',        ar: 'الجهراء' },
    { en: 'Farwaniya',   ar: 'الفروانية' },
  ]},
  { en: 'Lebanon',     ar: 'لبنان',            cities: [
    { en: 'Beirut',   ar: 'بيروت' }, { en: 'Tripoli', ar: 'طرابلس' },
    { en: 'Sidon',    ar: 'صيدا' },  { en: 'Tyre',    ar: 'صور' },
    { en: 'Zahle',    ar: 'زحلة' },  { en: 'Byblos',  ar: 'جبيل' },
    { en: 'Jounieh',  ar: 'جونية' },
  ]},
  { en: 'Libya',       ar: 'ليبيا',            cities: [
    { en: 'Tripoli', ar: 'طرابلس' }, { en: 'Benghazi', ar: 'بنغازي' },
    { en: 'Misrata', ar: 'مصراتة' }, { en: 'Tobruk',  ar: 'طبرق' },
    { en: 'Sabha',   ar: 'سبها' },   { en: 'Zawiya',  ar: 'الزاوية' },
  ]},
  { en: 'Mauritania',  ar: 'موريتانيا',         cities: [
    { en: 'Nouakchott', ar: 'نواكشوط' }, { en: 'Nouadhibou', ar: 'نواذيبو' },
    { en: 'Rosso',     ar: 'روصو' },     { en: 'Atar',     ar: 'أطار' },
    { en: 'Kaédi',     ar: 'كيهيدي' },
  ]},
  { en: 'Morocco',     ar: 'المغرب',           cities: [
    { en: 'Casablanca', ar: 'الدار البيضاء' }, { en: 'Rabat',    ar: 'الرباط' },
    { en: 'Marrakech',  ar: 'مراكش' }, { en: 'Fes',           ar: 'فاس' },
    { en: 'Tangier',    ar: 'طنجة' }, { en: 'Agadir',         ar: 'أكادير' },
    { en: 'Meknes',     ar: 'مكناس' }, { en: 'Oujda',         ar: 'وجدة' },
  ]},
  { en: 'Oman',        ar: 'عُمان',            cities: [
    { en: 'Muscat',  ar: 'مسقط' }, { en: 'Salalah', ar: 'صلالة' },
    { en: 'Sohar',   ar: 'صحار' }, { en: 'Nizwa',   ar: 'نزوى' },
    { en: 'Sur',     ar: 'صور' },  { en: 'Ibri',    ar: 'عبري' },
  ]},
  { en: 'Palestine',   ar: 'فلسطين',           cities: [
    { en: 'Ramallah', ar: 'رام الله' }, { en: 'Gaza',      ar: 'غزة' },
    { en: 'Bethlehem', ar: 'بيت لحم' }, { en: 'Hebron',    ar: 'الخليل' },
    { en: 'Nablus',    ar: 'نابلس' },   { en: 'Jericho',   ar: 'أريحا' },
    { en: 'Jerusalem', ar: 'القدس' },
  ]},
  { en: 'Qatar',       ar: 'قطر',              cities: [
    { en: 'Doha',     ar: 'الدوحة' }, { en: 'Al Rayyan', ar: 'الريان' },
    { en: 'Al Wakrah', ar: 'الوكرة' }, { en: 'Al Khor',  ar: 'الخور' },
    { en: 'Lusail',   ar: 'لوسيل' },
  ]},
  { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية', cities: [
    { en: 'Riyadh',   ar: 'الرياض' }, { en: 'Jeddah',   ar: 'جدة' },
    { en: 'Mecca',    ar: 'مكة المكرمة' }, { en: 'Medina', ar: 'المدينة المنورة' },
    { en: 'Dammam',   ar: 'الدمام' }, { en: 'Khobar',   ar: 'الخبر' },
    { en: 'Dhahran',  ar: 'الظهران' }, { en: 'Tabuk',    ar: 'تبوك' },
    { en: 'Abha',     ar: 'أبها' },   { en: 'Taif',     ar: 'الطائف' },
  ]},
  { en: 'Somalia',     ar: 'الصومال',          cities: [
    { en: 'Mogadishu', ar: 'مقديشو' }, { en: 'Hargeisa', ar: 'هرجيسا' },
    { en: 'Bosaso',    ar: 'بوصاصو' }, { en: 'Kismayo',  ar: 'كيسمايو' },
    { en: 'Berbera',   ar: 'بربرة' },
  ]},
  { en: 'Sudan',       ar: 'السودان',          cities: [
    { en: 'Khartoum',   ar: 'الخرطوم' }, { en: 'Omdurman',  ar: 'أم درمان' },
    { en: 'Port Sudan', ar: 'بورتسودان' }, { en: 'Kassala',  ar: 'كسلا' },
    { en: 'Nyala',      ar: 'نيالا' },     { en: 'El Obeid', ar: 'الأبيض' },
  ]},
  { en: 'Syria',       ar: 'سوريا',            cities: [
    { en: 'Damascus',    ar: 'دمشق' },   { en: 'Aleppo',   ar: 'حلب' },
    { en: 'Homs',        ar: 'حمص' },    { en: 'Latakia',  ar: 'اللاذقية' },
    { en: 'Hama',        ar: 'حماة' },   { en: 'Deir ez-Zor', ar: 'دير الزور' },
    { en: 'Tartus',      ar: 'طرطوس' },  { en: 'Raqqa',    ar: 'الرقة' },
    { en: 'Idlib',       ar: 'إدلب' },
  ]},
  { en: 'Tunisia',     ar: 'تونس',             cities: [
    { en: 'Tunis',    ar: 'تونس' }, { en: 'Sfax',     ar: 'صفاقس' },
    { en: 'Sousse',   ar: 'سوسة' }, { en: 'Kairouan', ar: 'القيروان' },
    { en: 'Bizerte',  ar: 'بنزرت' }, { en: 'Gabes',    ar: 'قابس' },
  ]},
  { en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة', cities: [
    { en: 'Dubai',          ar: 'دبي' },        { en: 'Abu Dhabi',     ar: 'أبوظبي' },
    { en: 'Sharjah',        ar: 'الشارقة' }, { en: 'Ajman',         ar: 'عجمان' },
    { en: 'Ras Al Khaimah', ar: 'رأس الخيمة' }, { en: 'Fujairah',      ar: 'الفجيرة' },
    { en: 'Umm Al Quwain',  ar: 'أم القيوين' }, { en: 'Al Ain',        ar: 'العين' },
  ]},
  { en: 'Yemen',       ar: 'اليمن',            cities: [
    { en: "Sana'a", ar: 'صنعاء' }, { en: 'Aden',     ar: 'عدن' },
    { en: 'Taiz',   ar: 'تعز' },   { en: 'Hodeidah', ar: 'الحديدة' },
    { en: 'Mukalla', ar: 'المكلا' }, { en: 'Ibb',     ar: 'إب' },
  ]},
];

// ─── Helpers ────────────────────────────────────────────────────────────────
/**
 * Parse a "City, Country" string back into structured pieces.
 * Falls back to country-only when no city is present.
 * Unknown cities under a known country resolve to ("Other", customCity=<name>).
 */
export function parseLocation(value: string): {
  country: string;
  city: string;
  customCity: string;
} {
  if (!value) return { country: '', city: '', customCity: '' };

  // Match country at the end (longest match wins, e.g. "United Arab Emirates")
  const matched = [...ARAB_COUNTRIES_CITIES]
    .sort((a, b) => b.en.length - a.en.length)
    .find((c) => value === c.en || value.endsWith(`, ${c.en}`));

  if (!matched) return { country: '', city: value, customCity: '' };

  if (value === matched.en) return { country: matched.en, city: '', customCity: '' };

  const city = value.slice(0, value.length - matched.en.length - 2).trim();
  const known = matched.cities.some((ct) => ct.en === city);
  return known
    ? { country: matched.en, city, customCity: '' }
    : { country: matched.en, city: 'Other', customCity: city };
}

/** Combine selections back into "City, Country" / "Country" / "". */
function joinLocation(country: string, city: string, customCity: string): string {
  if (!country) return '';
  const cityValue = city === 'Other' ? customCity.trim() : city;
  return cityValue ? `${cityValue}, ${country}` : country;
}

// ─── Component ──────────────────────────────────────────────────────────────
export interface LocationSelectorProps {
  /** Combined "City, Country" (or "Country", or empty). */
  value: string;
  /** Receives the new combined string whenever any select changes. */
  onChange: (value: string) => void;
  /** Permit country-only selections. Adds an "All cities" option. Default false. */
  allowCountryOnly?: boolean;
  /** Show the "Other" fallback in the city dropdown. Default true. */
  allowOther?: boolean;
  /** Mark both selects as required (form validation). Default true. */
  required?: boolean;
  /** Disable everything. */
  disabled?: boolean;
  /** className on the wrapper grid. */
  className?: string;
}

export function LocationSelector({
  value,
  onChange,
  allowCountryOnly = false,
  allowOther = true,
  required = true,
  disabled = false,
  className = 'grid md:grid-cols-2 gap-5',
}: LocationSelectorProps) {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  // Seed internal state once from `value`. We do NOT re-sync on every change of
  // `value` because that would clobber the in-progress "Other" custom city
  // typing. Use a `key` prop on the parent to force-remount on form reset.
  const seed = useMemo(() => parseLocation(value), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [country, setCountry]       = useState(seed.country);
  const [city, setCity]             = useState(seed.city);
  const [customCity, setCustomCity] = useState(seed.customCity);

  const initialized = useRef(false);
  useEffect(() => {
    // Skip the first run — parent gets onChange notifications only on user input
    if (!initialized.current) { initialized.current = true; return; }
    onChange(joinLocation(country, city, customCity));
  }, [country, city, customCity, onChange]);

  const cities = useMemo(
    () => ARAB_COUNTRIES_CITIES.find((c) => c.en === country)?.cities ?? [],
    [country],
  );

  const T = isAr
    ? {
        country:         'الدولة',
        countryPh:       'اختر الدولة…',
        city:            'المدينة',
        cityPh:          'اختر المدينة…',
        cityDisabled:    'اختر الدولة أولاً',
        cityAll:         'كل المدن',
        cityOther:       'أخرى (اكتب أدناه)…',
        customCityLabel: 'اكتب اسم المدينة',
        customCityPh:    'مثلاً: شرم الشيخ',
      }
    : {
        country:         'Country',
        countryPh:       'Select a country…',
        city:            'City',
        cityPh:          'Select a city…',
        cityDisabled:    'Pick a country first',
        cityAll:         'All cities',
        cityOther:       'Other (type below)…',
        customCityLabel: 'Type the city name',
        customCityPh:    'e.g. Sharm El Sheikh',
      };

  return (
    <div className={className} dir={isAr ? 'rtl' : 'ltr'}>
      <Field label={T.country} required={required}>
        <select
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setCity('');
            setCustomCity('');
          }}
          required={required}
          disabled={disabled}
          className="ls-input"
        >
          <option value="" disabled={required}>{T.countryPh}</option>
          {ARAB_COUNTRIES_CITIES.map((c) => (
            <option key={c.en} value={c.en}>{isAr ? c.ar : c.en}</option>
          ))}
        </select>
      </Field>

      <Field label={T.city} required={required && !allowCountryOnly}>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={disabled || !country}
          required={required && !allowCountryOnly}
          className="ls-input disabled:bg-neutral-50 disabled:cursor-not-allowed"
        >
          <option value="" disabled={required && !allowCountryOnly}>
            {country ? (allowCountryOnly ? T.cityAll : T.cityPh) : T.cityDisabled}
          </option>
          {cities.map((ct) => (
            <option key={ct.en} value={ct.en}>{isAr ? ct.ar : ct.en}</option>
          ))}
          {country && allowOther && (
            <option value="Other">{T.cityOther}</option>
          )}
        </select>
      </Field>

      {city === 'Other' && (
        <div className="md:col-span-2">
          <Field label={T.customCityLabel} required>
            <input
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              placeholder={T.customCityPh}
              className="ls-input"
              required
              disabled={disabled}
            />
          </Field>
        </div>
      )}

      <style jsx>{`
        :global(.ls-input) {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid rgb(212 212 216);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        :global(.ls-input:focus) {
          outline: none;
          border-color: transparent;
          box-shadow: 0 0 0 2px rgb(249 115 22 / 0.5);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-neutral-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
