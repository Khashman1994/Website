'use client';
// components/employers/JobPostForm.tsx

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { postJob, updateJob } from '@/app/actions/employer';
import { useLang } from '@/lib/i18n/LanguageContext';
import type { Job } from '@/lib/types';

// ─── Localised data: 22 Arab League countries × major cities ────────────────
// `value` (English) is the canonical value sent to the DB; `ar` is display only.
type City = { en: string; ar: string };
type Country = { en: string; ar: string; cities: City[] };

const COUNTRIES: Country[] = [
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

const EMPLOYMENT_TYPES = [
  { en: 'Full-time',  ar: 'دوام كامل' },
  { en: 'Part-time',  ar: 'دوام جزئي' },
  { en: 'Contract',   ar: 'عقد' },
  { en: 'Freelance',  ar: 'عمل حر' },
  { en: 'Internship', ar: 'تدريب' },
];

const CURRENCIES = ['USD', 'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'EGP', 'JOD', 'EUR'];

// Parse "City, Country" back into selectable values for edit mode
function splitLocation(loc?: string) {
  if (!loc) return { country: '', city: '' };
  const parts = loc.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) return { country: '', city: parts[0] ?? '' };
  return { city: parts.slice(0, -1).join(', '), country: parts[parts.length - 1] };
}

interface Props {
  /** Pass an existing job to switch the form into edit mode. */
  initialJob?: Job;
}

export function JobPostForm({ initialJob }: Props) {
  const router = useRouter();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const isEdit = !!initialJob;

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Pre-fill from initialJob if editing
  const seed = useMemo(() => splitLocation(initialJob?.location), [initialJob?.location]);
  const seedCountryEn = COUNTRIES.find((c) => c.en === seed.country)?.en ?? '';
  const seedCityEn =
    seedCountryEn && COUNTRIES.find((c) => c.en === seedCountryEn)?.cities.some((ct) => ct.en === seed.city)
      ? seed.city
      : seedCountryEn && seed.city
      ? 'Other'
      : '';
  const seedCustomCity = seedCityEn === 'Other' ? seed.city : '';

  const [selectedCountry, setSelectedCountry] = useState(seedCountryEn);
  const [selectedCity, setSelectedCity]       = useState(seedCityEn);
  const [customCity, setCustomCity]           = useState(seedCustomCity);

  const T = isAr
    ? {
        title:           'المسمى الوظيفي',
        titlePh:         'مهندس واجهة أمامية أول',
        country:         'الدولة',
        countryPh:       'اختر الدولة…',
        city:            'المدينة',
        cityPh:          'اختر المدينة…',
        cityDisabled:    'اختر الدولة أولاً',
        cityOther:       'أخرى (اكتب أدناه)…',
        customCityLabel: 'اكتب اسم المدينة',
        customCityPh:    'مثلاً: شرم الشيخ',
        emp:             'نوع التوظيف',
        desc:            'الوصف',
        descPh:          'تعريف عن الدور، المسؤوليات اليومية، الفريق، الرسالة…',
        req:             'المتطلبات',
        reqHint:         'المهارات، مستوى الخبرة، الشهادات، اللغات، إلخ.',
        reqPh:           '• ٥+ سنوات في React\n• إتقان TypeScript\n• تفضّل اللغة العربية',
        salary:          'نطاق الراتب',
        salaryOpt:       '(اختياري)',
        min:             'الحد الأدنى',
        max:             'الحد الأقصى',
        url:             'رابط التقديم الخارجي',
        urlHint:         'إذا كان على المرشحين التقديم عبر موقعك',
        urlPh:           'https://acme.com/careers/123',
        remote:          'متاح عن بُعد',
        publish:         'نشر الوظيفة',
        save:            'حفظ التغييرات',
        cancel:          'إلغاء',
        successPost:     'تم نشر الوظيفة — جارٍ التحويل…',
        successUpdate:   'تم تحديث الوظيفة — جارٍ التحويل…',
        errCountry:      'يرجى اختيار الدولة.',
        errCity:         'يرجى اختيار المدينة.',
        errCustomCity:   'يرجى كتابة اسم المدينة.',
      }
    : {
        title:           'Job title',
        titlePh:         'Senior Frontend Engineer',
        country:         'Country',
        countryPh:       'Select a country…',
        city:            'City',
        cityPh:          'Select a city…',
        cityDisabled:    'Pick a country first',
        cityOther:       'Other (type below)…',
        customCityLabel: 'Type the city name',
        customCityPh:    'e.g. Sharm El Sheikh',
        emp:             'Employment type',
        desc:            'Description',
        descPh:          'What the role is about, day-to-day responsibilities, team, mission…',
        req:             'Requirements',
        reqHint:         'Skills, experience level, certifications, languages, etc.',
        reqPh:           '• 5+ years React\n• Strong TypeScript\n• Arabic preferred',
        salary:          'Salary range',
        salaryOpt:       '(optional)',
        min:             'Min',
        max:             'Max',
        url:             'External application URL',
        urlHint:         'If candidates should apply on your site',
        urlPh:           'https://acme.com/careers/123',
        remote:          'Remote-friendly',
        publish:         'Publish job',
        save:            'Save changes',
        cancel:          'Cancel',
        successPost:     'Job posted — redirecting…',
        successUpdate:   'Job updated — redirecting…',
        errCountry:      'Please select a country.',
        errCity:         'Please select a city.',
        errCustomCity:   'Please enter the city name.',
      };

  const cities = useMemo(
    () => COUNTRIES.find((c) => c.en === selectedCountry)?.cities ?? [],
    [selectedCountry],
  );
  const cityForLocation = selectedCity === 'Other' ? customCity.trim() : selectedCity;
  const combinedLocation =
    selectedCountry && cityForLocation ? `${cityForLocation}, ${selectedCountry}` : '';

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);

    if (!selectedCountry)                                      return setError(T.errCountry);
    if (!selectedCity)                                         return setError(T.errCity);
    if (selectedCity === 'Other' && !customCity.trim())        return setError(T.errCustomCity);

    formData.set('location', combinedLocation);

    startTransition(async () => {
      const res = isEdit
        ? await updateJob(initialJob!.id, formData)
        : await postJob(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        router.push('/employers/dashboard');
        router.refresh();
      }, 700);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      <Field label={T.title} required>
        <input
          name="title"
          required
          defaultValue={initialJob?.title ?? ''}
          placeholder={T.titlePh}
          className="input"
        />
      </Field>

      {/* Country / City — cascading */}
      <div className="grid md:grid-cols-2 gap-5">
        <Field label={T.country} required>
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setSelectedCity('');
              setCustomCity('');
            }}
            required
            className="input"
          >
            <option value="" disabled>{T.countryPh}</option>
            {COUNTRIES.map((c) => (
              <option key={c.en} value={c.en}>{isAr ? c.ar : c.en}</option>
            ))}
          </select>
        </Field>

        <Field label={T.city} required>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={!selectedCountry}
            required
            className="input disabled:bg-neutral-50 disabled:cursor-not-allowed"
          >
            <option value="" disabled>
              {selectedCountry ? T.cityPh : T.cityDisabled}
            </option>
            {cities.map((ct) => (
              <option key={ct.en} value={ct.en}>{isAr ? ct.ar : ct.en}</option>
            ))}
            {selectedCountry && (
              <option value="Other">{T.cityOther}</option>
            )}
          </select>
        </Field>
      </div>

      {selectedCity === 'Other' && (
        <Field label={T.customCityLabel} required>
          <input
            value={customCity}
            onChange={(e) => setCustomCity(e.target.value)}
            placeholder={T.customCityPh}
            className="input"
            required
          />
        </Field>
      )}

      {/* Hidden field — actual value sent to the Server Action */}
      <input type="hidden" name="location" value={combinedLocation} />

      <div className="grid md:grid-cols-2 gap-5">
        <Field label={T.emp}>
          <select
            name="employment_type"
            defaultValue={initialJob?.employmentType ?? 'Full-time'}
            className="input"
          >
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t.en} value={t.en}>{isAr ? t.ar : t.en}</option>
            ))}
          </select>
        </Field>

        <label className="inline-flex items-center gap-2 mt-7 select-none">
          <input
            type="checkbox"
            name="remote"
            defaultChecked={initialJob?.remote ?? false}
            className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-neutral-700">{T.remote}</span>
        </label>
      </div>

      <Field label={T.desc} required>
        <textarea
          name="description"
          required
          rows={6}
          defaultValue={initialJob?.description ?? ''}
          placeholder={T.descPh}
          className="input resize-y"
        />
      </Field>

      <Field label={T.req} hint={T.reqHint}>
        <textarea
          name="requirements"
          rows={4}
          defaultValue={initialJob?.requirements ?? ''}
          placeholder={T.reqPh}
          className="input resize-y"
        />
      </Field>

      <fieldset>
        <legend className="block text-sm font-medium text-neutral-700 mb-1.5">
          {T.salary} <span className="text-neutral-400 font-normal">{T.salaryOpt}</span>
        </legend>
        <div className="grid grid-cols-3 gap-3">
          <input
            name="salary_min"
            type="number"
            min={0}
            defaultValue={initialJob?.salary?.min ?? ''}
            placeholder={T.min}
            className="input"
          />
          <input
            name="salary_max"
            type="number"
            min={0}
            defaultValue={initialJob?.salary?.max ?? ''}
            placeholder={T.max}
            className="input"
          />
          <select
            name="salary_currency"
            defaultValue={initialJob?.salary?.currency ?? 'USD'}
            className="input"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </fieldset>

      <Field label={T.url} hint={T.urlHint}>
        <input
          name="url"
          type="url"
          defaultValue={initialJob?.url ?? ''}
          placeholder={T.urlPh}
          className="input"
        />
      </Field>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 inline-flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {isEdit ? T.successUpdate : T.successPost}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending || success}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
        >
          {pending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? T.save : T.publish}
        </button>
        <button
          type="button"
          onClick={() => router.push('/employers/dashboard')}
          className="px-6 py-3 text-neutral-700 hover:bg-neutral-100 font-medium rounded-lg transition-colors"
        >
          {T.cancel}
        </button>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid rgb(212 212 216);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        :global(.input:focus) {
          outline: none;
          border-color: transparent;
          box-shadow: 0 0 0 2px rgb(249 115 22 / 0.5);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-neutral-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="block mt-1 text-xs text-neutral-500">{hint}</span>}
    </label>
  );
}
