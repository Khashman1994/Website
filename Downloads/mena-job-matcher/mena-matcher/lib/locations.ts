// lib/locations.ts
export type CountryCode = 'SA' | 'AE' | 'EG' | 'QA' | 'KW' | 'BH' | 'OM' | 'JO' | 'LB' | 'IQ' | 'LY' | 'TN' | 'DZ' | 'MA';

export const COUNTRY_FLAGS: Record<CountryCode, string> = {
  SA: '🇸🇦', AE: '🇦🇪', EG: '🇪🇬', QA: '🇶🇦',
  KW: '🇰🇼', BH: '🇧🇭', OM: '🇴🇲', JO: '🇯🇴',
  LB: '🇱🇧', IQ: '🇮🇶', LY: '🇱🇾', TN: '🇹🇳',
  DZ: '🇩🇿', MA: '🇲🇦',
};

export interface MenaLocation {
  value: string;         // always English — sent to JSearch API
  en: string;            // English display label
  ar: string;            // Arabic display label
  country: CountryCode;
}

export type LangKey = 'en' | 'ar';

export const MENA_LOCATIONS: MenaLocation[] = [
  // ── Saudi Arabia ─────────────────────────────────────────────────────────
  { value: 'Saudi Arabia',              en: '🇸🇦 All Saudi Arabia',   ar: '🇸🇦 كل المملكة العربية السعودية', country: 'SA' },
  { value: 'Riyadh, Saudi Arabia',      en: 'Riyadh',                 ar: 'الرياض',                         country: 'SA' },
  { value: 'Jeddah, Saudi Arabia',      en: 'Jeddah',                 ar: 'جدة',                            country: 'SA' },
  { value: 'Dammam, Saudi Arabia',      en: 'Dammam',                 ar: 'الدمام',                         country: 'SA' },
  { value: 'Khobar, Saudi Arabia',      en: 'Khobar',                 ar: 'الخبر',                          country: 'SA' },
  { value: 'Mecca, Saudi Arabia',       en: 'Mecca',                  ar: 'مكة المكرمة',                    country: 'SA' },
  { value: 'Medina, Saudi Arabia',      en: 'Medina',                 ar: 'المدينة المنورة',                country: 'SA' },
  { value: 'Abha, Saudi Arabia',        en: 'Abha',                   ar: 'أبها',                           country: 'SA' },
  { value: 'Taif, Saudi Arabia',        en: 'Taif',                   ar: 'الطائف',                         country: 'SA' },
  { value: 'Tabuk, Saudi Arabia',       en: 'Tabuk',                  ar: 'تبوك',                           country: 'SA' },
  { value: 'Qassim, Saudi Arabia',      en: 'Qassim',                 ar: 'القصيم',                         country: 'SA' },
  { value: 'Hail, Saudi Arabia',        en: 'Hail',                   ar: 'حائل',                           country: 'SA' },
  { value: 'Najran, Saudi Arabia',      en: 'Najran',                 ar: 'نجران',                          country: 'SA' },
  { value: 'Jizan, Saudi Arabia',       en: 'Jizan',                  ar: 'جازان',                          country: 'SA' },
  { value: 'NEOM, Saudi Arabia',        en: 'NEOM',                   ar: 'نيوم',                           country: 'SA' },
  // ── UAE ──────────────────────────────────────────────────────────────────
  { value: 'UAE',                        en: '🇦🇪 All UAE',            ar: '🇦🇪 كل الإمارات',                country: 'AE' },
  { value: 'Dubai, UAE',                 en: 'Dubai',                 ar: 'دبي',                            country: 'AE' },
  { value: 'Abu Dhabi, UAE',             en: 'Abu Dhabi',             ar: 'أبوظبي',                         country: 'AE' },
  { value: 'Sharjah, UAE',               en: 'Sharjah',               ar: 'الشارقة',                        country: 'AE' },
  { value: 'Ajman, UAE',                 en: 'Ajman',                 ar: 'عجمان',                          country: 'AE' },
  { value: 'Ras Al Khaimah, UAE',        en: 'Ras Al Khaimah',        ar: 'رأس الخيمة',                     country: 'AE' },
  { value: 'Fujairah, UAE',              en: 'Fujairah',              ar: 'الفجيرة',                        country: 'AE' },
  { value: 'Umm Al Quwain, UAE',         en: 'Umm Al Quwain',         ar: 'أم القيوين',                     country: 'AE' },
  // ── Egypt ─────────────────────────────────────────────────────────────────
  { value: 'Egypt',                      en: '🇪🇬 All Egypt',          ar: '🇪🇬 كل مصر',                     country: 'EG' },
  { value: 'Cairo, Egypt',               en: 'Cairo',                 ar: 'القاهرة',                        country: 'EG' },
  { value: 'Alexandria, Egypt',          en: 'Alexandria',            ar: 'الإسكندرية',                     country: 'EG' },
  { value: 'Giza, Egypt',                en: 'Giza',                  ar: 'الجيزة',                         country: 'EG' },
  { value: 'New Cairo, Egypt',           en: 'New Cairo',             ar: 'القاهرة الجديدة',                country: 'EG' },
  { value: 'Sharm El Sheikh, Egypt',     en: 'Sharm El Sheikh',       ar: 'شرم الشيخ',                      country: 'EG' },
  { value: 'Hurghada, Egypt',            en: 'Hurghada',              ar: 'الغردقة',                        country: 'EG' },
  { value: 'Mansoura, Egypt',            en: 'Mansoura',              ar: 'المنصورة',                       country: 'EG' },
  { value: 'Tanta, Egypt',               en: 'Tanta',                 ar: 'طنطا',                           country: 'EG' },
  { value: 'Luxor, Egypt',               en: 'Luxor',                 ar: 'الأقصر',                         country: 'EG' },
  { value: 'Aswan, Egypt',               en: 'Aswan',                 ar: 'أسوان',                          country: 'EG' },
  // ── Qatar ─────────────────────────────────────────────────────────────────
  { value: 'Qatar',                      en: '🇶🇦 All Qatar',          ar: '🇶🇦 كل قطر',                     country: 'QA' },
  { value: 'Doha, Qatar',                en: 'Doha',                  ar: 'الدوحة',                         country: 'QA' },
  { value: 'Lusail, Qatar',              en: 'Lusail',                ar: 'لوسيل',                          country: 'QA' },
  { value: 'Al Wakra, Qatar',            en: 'Al Wakra',              ar: 'الوكرة',                         country: 'QA' },
  { value: 'Al Rayyan, Qatar',           en: 'Al Rayyan',             ar: 'الريان',                         country: 'QA' },
  // ── Kuwait ────────────────────────────────────────────────────────────────
  { value: 'Kuwait',                     en: '🇰🇼 All Kuwait',         ar: '🇰🇼 كل الكويت',                  country: 'KW' },
  { value: 'Kuwait City, Kuwait',        en: 'Kuwait City',           ar: 'مدينة الكويت',                   country: 'KW' },
  { value: 'Hawalli, Kuwait',            en: 'Hawalli',               ar: 'حولي',                           country: 'KW' },
  { value: 'Salmiya, Kuwait',            en: 'Salmiya',               ar: 'السالمية',                       country: 'KW' },
  { value: 'Farwaniya, Kuwait',          en: 'Farwaniya',             ar: 'الفروانية',                      country: 'KW' },
  { value: 'Ahmadi, Kuwait',             en: 'Ahmadi',                ar: 'الأحمدي',                        country: 'KW' },
  { value: 'Jahra, Kuwait',              en: 'Jahra',                 ar: 'الجهراء',                        country: 'KW' },
  // ── Bahrain ───────────────────────────────────────────────────────────────
  { value: 'Bahrain',                    en: '🇧🇭 All Bahrain',        ar: '🇧🇭 كل البحرين',                 country: 'BH' },
  { value: 'Manama, Bahrain',            en: 'Manama',                ar: 'المنامة',                        country: 'BH' },
  { value: 'Riffa, Bahrain',             en: 'Riffa',                 ar: 'الرفاع',                         country: 'BH' },
  { value: 'Muharraq, Bahrain',          en: 'Muharraq',              ar: 'المحرق',                         country: 'BH' },
  { value: 'Hamad Town, Bahrain',        en: 'Hamad Town',            ar: 'مدينة حمد',                      country: 'BH' },
  // ── Oman ──────────────────────────────────────────────────────────────────
  { value: 'Oman',                       en: '🇴🇲 All Oman',           ar: '🇴🇲 كل عُمان',                   country: 'OM' },
  { value: 'Muscat, Oman',               en: 'Muscat',                ar: 'مسقط',                           country: 'OM' },
  { value: 'Salalah, Oman',              en: 'Salalah',               ar: 'صلالة',                          country: 'OM' },
  { value: 'Sohar, Oman',                en: 'Sohar',                 ar: 'صحار',                           country: 'OM' },
  { value: 'Nizwa, Oman',                en: 'Nizwa',                 ar: 'نزوى',                           country: 'OM' },
  // ── Jordan ────────────────────────────────────────────────────────────────
  { value: 'Jordan',                     en: '🇯🇴 All Jordan',         ar: '🇯🇴 كل الأردن',                  country: 'JO' },
  { value: 'Amman, Jordan',              en: 'Amman',                 ar: 'عمّان',                          country: 'JO' },
  { value: 'Zarqa, Jordan',              en: 'Zarqa',                 ar: 'الزرقاء',                        country: 'JO' },
  { value: 'Irbid, Jordan',              en: 'Irbid',                 ar: 'إربد',                           country: 'JO' },
  { value: 'Aqaba, Jordan',              en: 'Aqaba',                 ar: 'العقبة',                         country: 'JO' },
  // ── Lebanon ───────────────────────────────────────────────────────────────
  { value: 'Lebanon',                    en: '🇱🇧 All Lebanon',        ar: '🇱🇧 كل لبنان',                   country: 'LB' },
  { value: 'Beirut, Lebanon',            en: 'Beirut',                ar: 'بيروت',                          country: 'LB' },
  { value: 'Tripoli, Lebanon',           en: 'Tripoli',               ar: 'طرابلس',                         country: 'LB' },
  // ── Iraq ──────────────────────────────────────────────────────────────────
  { value: 'Iraq',                       en: '🇮🇶 All Iraq',           ar: '🇮🇶 كل العراق',                  country: 'IQ' },
  { value: 'Baghdad, Iraq',              en: 'Baghdad',               ar: 'بغداد',                          country: 'IQ' },
  { value: 'Erbil, Iraq',                en: 'Erbil',                 ar: 'أربيل',                          country: 'IQ' },
  { value: 'Basra, Iraq',                en: 'Basra',                 ar: 'البصرة',                         country: 'IQ' },
  // ── Morocco ───────────────────────────────────────────────────────────────
  { value: 'Morocco',                    en: '🇲🇦 All Morocco',        ar: '🇲🇦 كل المغرب',                  country: 'MA' },
  { value: 'Casablanca, Morocco',        en: 'Casablanca',            ar: 'الدار البيضاء',                  country: 'MA' },
  { value: 'Rabat, Morocco',             en: 'Rabat',                 ar: 'الرباط',                         country: 'MA' },
  { value: 'Marrakech, Morocco',         en: 'Marrakech',             ar: 'مراكش',                          country: 'MA' },
  { value: 'Fes, Morocco',               en: 'Fes',                   ar: 'فاس',                            country: 'MA' },
  // ── Tunisia ───────────────────────────────────────────────────────────────
  { value: 'Tunisia',                    en: '🇹🇳 All Tunisia',        ar: '🇹🇳 كل تونس',                    country: 'TN' },
  { value: 'Tunis, Tunisia',             en: 'Tunis',                 ar: 'تونس',                           country: 'TN' },
  { value: 'Sfax, Tunisia',              en: 'Sfax',                  ar: 'صفاقس',                          country: 'TN' },
  // ── Algeria ───────────────────────────────────────────────────────────────
  { value: 'Algeria',                    en: '🇩🇿 All Algeria',        ar: '🇩🇿 كل الجزائر',                 country: 'DZ' },
  { value: 'Algiers, Algeria',           en: 'Algiers',               ar: 'الجزائر العاصمة',                country: 'DZ' },
  { value: 'Oran, Algeria',              en: 'Oran',                  ar: 'وهران',                          country: 'DZ' },
  // ── Libya ─────────────────────────────────────────────────────────────────
  { value: 'Libya',                      en: '🇱🇾 All Libya',          ar: '🇱🇾 كل ليبيا',                   country: 'LY' },
  { value: 'Tripoli, Libya',             en: 'Tripoli',               ar: 'طرابلس',                         country: 'LY' },
  { value: 'Benghazi, Libya',            en: 'Benghazi',              ar: 'بنغازي',                         country: 'LY' },
];

export const COUNTRY_LABELS: Record<CountryCode, { en: string; ar: string }> = {
  SA: { en: '🇸🇦 Saudi Arabia',  ar: '🇸🇦 المملكة العربية السعودية' },
  AE: { en: '🇦🇪 UAE',           ar: '🇦🇪 الإمارات العربية المتحدة'  },
  EG: { en: '🇪🇬 Egypt',         ar: '🇪🇬 مصر'                       },
  QA: { en: '🇶🇦 Qatar',         ar: '🇶🇦 قطر'                       },
  KW: { en: '🇰🇼 Kuwait',        ar: '🇰🇼 الكويت'                    },
  BH: { en: '🇧🇭 Bahrain',       ar: '🇧🇭 البحرين'                   },
  OM: { en: '🇴🇲 Oman',          ar: '🇴🇲 عُمان'                     },
  JO: { en: '🇯🇴 Jordan',        ar: '🇯🇴 الأردن'                    },
  LB: { en: '🇱🇧 Lebanon',       ar: '🇱🇧 لبنان'                     },
  IQ: { en: '🇮🇶 Iraq',          ar: '🇮🇶 العراق'                    },
  MA: { en: '🇲🇦 Morocco',       ar: '🇲🇦 المغرب'                    },
  TN: { en: '🇹🇳 Tunisia',       ar: '🇹🇳 تونس'                      },
  DZ: { en: '🇩🇿 Algeria',       ar: '🇩🇿 الجزائر'                   },
  LY: { en: '🇱🇾 Libya',         ar: '🇱🇾 ليبيا'                     },
 
};