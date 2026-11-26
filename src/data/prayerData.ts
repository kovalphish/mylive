export type PrayerId = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerInfo {
  id: PrayerId;
  name: string;
  arabic: string;
  startMinutes: number;
  endMinutes: number;
  startTime: string;
  endTime: string;
  rakaats: number;
  note: string;
}

export interface CityConfig {
  id: string;
  name: string;
  country: string;
  timeZone: string;
  schedule: Record<PrayerId, string>;
}

export const CITY_OPTIONS: CityConfig[] = [
  {
    id: 'moscow',
    name: 'Москва',
    country: 'Россия',
    timeZone: 'Europe/Moscow',
    schedule: { fajr: '06:18', dhuhr: '12:24', asr: '14:12', maghrib: '16:04', isha: '17:58' },
  },
  {
    id: 'kazan',
    name: 'Казань',
    country: 'Россия',
    timeZone: 'Europe/Moscow',
    schedule: { fajr: '05:38', dhuhr: '11:38', asr: '13:24', maghrib: '15:18', isha: '17:12' },
  },
  {
    id: 'grozny',
    name: 'Грозный',
    country: 'Россия',
    timeZone: 'Europe/Moscow',
    schedule: { fajr: '05:32', dhuhr: '11:51', asr: '14:10', maghrib: '16:28', isha: '17:58' },
  },
  {
    id: 'makhachkala',
    name: 'Махачкала',
    country: 'Россия',
    timeZone: 'Europe/Moscow',
    schedule: { fajr: '05:24', dhuhr: '11:44', asr: '14:04', maghrib: '16:22', isha: '17:52' },
  },
  {
    id: 'ufa',
    name: 'Уфа',
    country: 'Россия',
    timeZone: 'Asia/Yekaterinburg',
    schedule: { fajr: '07:10', dhuhr: '13:08', asr: '14:58', maghrib: '16:52', isha: '18:45' },
  },
  {
    id: 'spb',
    name: 'Санкт-Петербург',
    country: 'Россия',
    timeZone: 'Europe/Moscow',
    schedule: { fajr: '06:54', dhuhr: '12:52', asr: '14:22', maghrib: '16:08', isha: '18:16' },
  },
  {
    id: 'almaty',
    name: 'Алматы',
    country: 'Казахстан',
    timeZone: 'Asia/Almaty',
    schedule: { fajr: '05:26', dhuhr: '11:46', asr: '14:08', maghrib: '16:28', isha: '17:58' },
  },
  {
    id: 'astana',
    name: 'Астана',
    country: 'Казахстан',
    timeZone: 'Asia/Almaty',
    schedule: { fajr: '06:04', dhuhr: '12:08', asr: '14:06', maghrib: '16:02', isha: '17:48' },
  },
  {
    id: 'tashkent',
    name: 'Ташкент',
    country: 'Узбекистан',
    timeZone: 'Asia/Tashkent',
    schedule: { fajr: '05:56', dhuhr: '12:14', asr: '14:42', maghrib: '17:02', isha: '18:28' },
  },
  {
    id: 'bishkek',
    name: 'Бишкек',
    country: 'Кыргызстан',
    timeZone: 'Asia/Bishkek',
    schedule: { fajr: '06:34', dhuhr: '12:56', asr: '15:18', maghrib: '17:38', isha: '19:08' },
  },
  {
    id: 'istanbul',
    name: 'Стамбул',
    country: 'Турция',
    timeZone: 'Europe/Istanbul',
    schedule: { fajr: '06:24', dhuhr: '12:56', asr: '15:24', maghrib: '17:44', isha: '19:08' },
  },
  {
    id: 'dubai',
    name: 'Дубай',
    country: 'ОАЭ',
    timeZone: 'Asia/Dubai',
    schedule: { fajr: '05:22', dhuhr: '12:08', asr: '15:12', maghrib: '17:32', isha: '18:48' },
  },
  {
    id: 'london',
    name: 'Лондон',
    country: 'Великобритания',
    timeZone: 'Europe/London',
    schedule: { fajr: '05:44', dhuhr: '11:52', asr: '13:46', maghrib: '15:58', isha: '17:44' },
  },
  {
    id: 'la',
    name: 'Лос-Анджелес',
    country: 'США',
    timeZone: 'America/Los_Angeles',
    schedule: { fajr: '05:24', dhuhr: '11:42', asr: '14:28', maghrib: '16:48', isha: '18:08' },
  },
];

function parseHhMm(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

const PRAYER_META: Omit<PrayerInfo, 'startMinutes' | 'endMinutes' | 'startTime' | 'endTime'>[] = [
  { id: 'fajr', name: 'Фаджр', arabic: 'الفجر', rakaats: 2, note: 'Утренний намаз до восхода солнца' },
  { id: 'dhuhr', name: 'Зухр', arabic: 'الظهر', rakaats: 4, note: 'Полуденный намаз после зенита' },
  { id: 'asr', name: 'Аср', arabic: 'العصر', rakaats: 4, note: 'Послеполуденный намаз до заката' },
  { id: 'maghrib', name: 'Магриб', arabic: 'المغرب', rakaats: 3, note: 'Вечерний намаз сразу после заката' },
  { id: 'isha', name: 'Иша', arabic: 'العشاء', rakaats: 4, note: 'Ночной намаз перед сном' },
];

export function buildPrayersForCity(city: CityConfig): PrayerInfo[] {
  return PRAYER_META.map((meta, idx) => {
    const startTime = city.schedule[meta.id];
    const nextMeta = PRAYER_META[(idx + 1) % PRAYER_META.length];
    const endTime = city.schedule[nextMeta.id];
    return {
      ...meta,
      startTime,
      endTime,
      startMinutes: parseHhMm(startTime),
      endMinutes: parseHhMm(endTime),
    };
  });
}

export const DAILY_PRAYERS: PrayerInfo[] = buildPrayersForCity(CITY_OPTIONS[0]);

export interface CityClockInfo {
  timeWithSeconds: string;
  timeShort: string;
  minutesFromMidnight: number;
}

export function getCityClock(timeZone: string, now: Date): CityClockInfo {
  try {
    const parts = new Intl.DateTimeFormat('ru-RU', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(now);

    const h = Number(parts.find((p) => p.type === 'hour')?.value ?? now.getHours()) % 24;
    const m = Number(parts.find((p) => p.type === 'minute')?.value ?? now.getMinutes());
    const s = Number(parts.find((p) => p.type === 'second')?.value ?? now.getSeconds());

    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');

    return {
      timeWithSeconds: `${hh}:${mm}:${ss}`,
      timeShort: `${hh}:${mm}`,
      minutesFromMidnight: h * 60 + m,
    };
  } catch {
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return {
      timeWithSeconds: `${hh}:${mm}:${ss}`,
      timeShort: `${hh}:${mm}`,
      minutesFromMidnight: now.getHours() * 60 + now.getMinutes(),
    };
  }
}

export interface ActivePrayerStatus {
  prayers: PrayerInfo[];
  prayer: PrayerInfo;
  nextPrayer: PrayerInfo;
  remainingLabel: string;
}

export function getActivePrayerStatus(city: CityConfig, now: Date): ActivePrayerStatus {
  const prayers = buildPrayersForCity(city);
  const { minutesFromMidnight: mins } = getCityClock(city.timeZone, now);

  let currentIdx = 4;
  let minutesUntilNext = 0;

  if (mins >= prayers[0].startMinutes && mins < prayers[1].startMinutes) {
    currentIdx = 0;
    minutesUntilNext = prayers[1].startMinutes - mins;
  } else if (mins >= prayers[1].startMinutes && mins < prayers[2].startMinutes) {
    currentIdx = 1;
    minutesUntilNext = prayers[2].startMinutes - mins;
  } else if (mins >= prayers[2].startMinutes && mins < prayers[3].startMinutes) {
    currentIdx = 2;
    minutesUntilNext = prayers[3].startMinutes - mins;
  } else if (mins >= prayers[3].startMinutes && mins < prayers[4].startMinutes) {
    currentIdx = 3;
    minutesUntilNext = prayers[4].startMinutes - mins;
  } else {
    currentIdx = 4;
    if (mins >= prayers[4].startMinutes) {
      minutesUntilNext = 24 * 60 - mins + prayers[0].startMinutes;
    } else {
      minutesUntilNext = prayers[0].startMinutes - mins;
    }
  }

  const nextIdx = (currentIdx + 1) % prayers.length;
  const hours = Math.floor(minutesUntilNext / 60);
  const remMins = minutesUntilNext % 60;
  const remainingLabel =
    hours > 0 ? `${hours} ч ${remMins} мин` : `${Math.max(1, remMins)} мин`;

  return {
    prayers,
    prayer: prayers[currentIdx],
    nextPrayer: prayers[nextIdx],
    remainingLabel,
  };
}

// Uniform syllable-based karaoke speed system calibrated for calm, unhurried prayer reading
export type ReadingSpeedId = 'ultraSlow' | 'slow' | 'normal' | 'fast';

export interface ReadingSpeedOption {
  id: ReadingSpeedId;
  shortLabel: string;
  label: string;
  msPerSyllable: number;
  leadInPauseMs: number;
  repeatPauseMs: number;
  tailPauseMs: number;
}

export const READING_SPEEDS: Record<ReadingSpeedId, ReadingSpeedOption> = {
  ultraSlow: {
    id: 'ultraSlow',
    shortLabel: '0.5×',
    label: 'Очень медленно',
    msPerSyllable: 1400,
    leadInPauseMs: 1500,
    repeatPauseMs: 1200,
    tailPauseMs: 1100,
  },
  slow: {
    id: 'slow',
    shortLabel: '0.75×',
    label: 'Медленно',
    msPerSyllable: 1050,
    leadInPauseMs: 1200,
    repeatPauseMs: 950,
    tailPauseMs: 900,
  },
  normal: {
    id: 'normal',
    shortLabel: '1×',
    label: 'Спокойно',
    msPerSyllable: 780,
    leadInPauseMs: 1000,
    repeatPauseMs: 750,
    tailPauseMs: 750,
  },
  fast: {
    id: 'fast',
    shortLabel: '1.25×',
    label: 'Уверенно',
    msPerSyllable: 580,
    leadInPauseMs: 800,
    repeatPauseMs: 550,
    tailPauseMs: 600,
  },
};

export const READING_SPEED_ORDER: ReadingSpeedId[] = ['ultraSlow', 'slow', 'normal', 'fast'];

export function computeStepDurationMs(
  syllableCount: number,
  repeats: number,
  speedId: ReadingSpeedId,
): number {
  const cfg = READING_SPEEDS[speedId];
  const safeRepeats = Math.max(1, repeats);
  const speakMs = Math.max(1, syllableCount) * cfg.msPerSyllable;
  const pausesMs = cfg.leadInPauseMs + (safeRepeats - 1) * cfg.repeatPauseMs + cfg.tailPauseMs;
  return safeRepeats * speakMs + pausesMs;
}

export type AblutionMode = 'wudu' | 'ghusl';

export type WuduGlyphType =
  | 'intention'
  | 'hands'
  | 'mouth'
  | 'face'
  | 'arms'
  | 'head'
  | 'feet'
  | 'dua'
  | 'body'
  | 'shower';

export interface WuduStep {
  id: string;
  title: string;
  repeat: string;
  instruction: string;
  arabic?: string;
  syllables: string[];
  meaning: string;
  repeats: number;
  glyph: WuduGlyphType;
}

export const WUDU_STEPS: WuduStep[] = [
  {
    id: 'niyyat',
    title: 'Намерение и начало',
    repeat: '1 раз',
    instruction: 'Сделайте намерение в сердце и произнесите перед водой:',
    arabic: 'بِسْمِ اللَّهِ',
    syllables: ['Бис', 'мил', 'ля́х'],
    meaning: 'С именем Аллаха',
    repeats: 1,
    glyph: 'intention',
  },
  {
    id: 'hands',
    title: 'Кисти рук до запястий',
    repeat: '3 раза',
    instruction: 'Промойте правую и левую кисть, включая промежутки между пальцами.',
    arabic: 'بِسْمِ اللَّهِ',
    syllables: ['Пра', 'ва', 'я ', 'кисть, ', 'ле', 'ва', 'я ', 'кисть'],
    meaning: 'Тщательно омываем обе кисти трижды',
    repeats: 3,
    glyph: 'hands',
  },
  {
    id: 'mouth-nose',
    title: 'Полоскание рта и носа',
    repeat: '3 раза',
    instruction: 'Правой рукой прополощите рот, затем очистите нос левой рукой.',
    syllables: ['Про', 'по', 'ло', 'щи', 'те ', 'рот ', 'и ', 'нос'],
    meaning: 'Спокойно и бережно, три раза подряд',
    repeats: 3,
    glyph: 'mouth',
  },
  {
    id: 'face',
    title: 'Омовение лица',
    repeat: '3 раза',
    instruction: 'Умойте лицо полностью — от линии волос до подбородка и от уха до уха.',
    syllables: ['О', 'мой', 'те ', 'всё ', 'ли', 'цо ', 'пол', 'нос', 'тью'],
    meaning: 'Вода касается всей поверхности лица',
    repeats: 3,
    glyph: 'face',
  },
  {
    id: 'arms',
    title: 'Руки до локтей',
    repeat: '3 раза каждую',
    instruction: 'От кончиков пальцев до локтя включительно — сначала правую, затем левую.',
    syllables: ['Пра', 'ва', 'я ', 'до ', 'лок', 'тя · ', 'Ле', 'ва', 'я ', 'до ', 'лок', 'тя'],
    meaning: 'Обязательно захватывая сам локоть',
    repeats: 3,
    glyph: 'arms',
  },
  {
    id: 'head',
    title: 'Голова и уши',
    repeat: '1 раз',
    instruction: 'Влажными ладонями проведите ото лба к затылку и обратно, протрите уши.',
    syllables: ['Про', 'ве', 'ди', 'те ', 'по ', 'го', 'ло', 'ве ', 'и ', 'у', 'шам'],
    meaning: 'Достаточно одного плавного движения',
    repeats: 1,
    glyph: 'head',
  },
  {
    id: 'feet',
    title: 'Стопы до щиколоток',
    repeat: '3 раза каждую',
    instruction: 'Вымойте правую стопу до щиколотки, затем левую, промывая между пальцами.',
    syllables: ['Пра', 'ва', 'я ', 'сто', 'па · ', 'Ле', 'ва', 'я ', 'сто', 'па'],
    meaning: 'Включая пятки и щиколотки',
    repeats: 3,
    glyph: 'feet',
  },
  {
    id: 'dua',
    title: 'Слова после омовения',
    repeat: '1 раз',
    instruction: 'Омовение завершено. Произнесите свидетельство:',
    arabic: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    syllables: [
      'Аш',
      'ха',
      'ду ',
      'ал',
      'ля́ ',
      'и',
      'ля́',
      'ха ',
      'ил',
      'ляЛ',
      'ла́',
      'ху ',
      'вах',
      'да',
      'ху́ ',
      'ля́ ',
      'ша',
      'ри́',
      'ка ',
      'лях',
    ],
    meaning: 'Свидетельствую, что нет божества, кроме одного Аллаха',
    repeats: 1,
    glyph: 'dua',
  },
];

export const GHUSL_STEPS: WuduStep[] = [
  {
    id: 'ghusl-niyyat',
    title: 'Намерение на полное омовение',
    repeat: '1 раз',
    instruction: 'Сделайте в сердце намерение совершить полное омовение (гусль) и произнесите:',
    arabic: 'بِسْمِ اللَّهِ',
    syllables: ['Бис', 'мил', 'ля́х'],
    meaning: 'С именем Аллаха',
    repeats: 1,
    glyph: 'intention',
  },
  {
    id: 'ghusl-hands',
    title: 'Мытьё кистей рук',
    repeat: '3 раза',
    instruction: 'Вымойте обе кисти рук до запястий, начиная с правой руки.',
    syllables: ['Пра', 'ва', 'я ', 'кисть, ', 'ле', 'ва', 'я ', 'кисть'],
    meaning: 'Чистота рук перед началом полного омовения',
    repeats: 3,
    glyph: 'hands',
  },
  {
    id: 'ghusl-cleanse',
    title: 'Очищение тела',
    repeat: '1 раз',
    instruction: 'Смойте любые загрязнения с тела водой, затем вновь вымойте руки.',
    syllables: ['О', 'чи', 'сти', 'те ', 'те', 'ло ', 'и ', 'вы', 'мой', 'те ', 'ру', 'ки'],
    meaning: 'Подготовка тела перед основным омовением',
    repeats: 1,
    glyph: 'body',
  },
  {
    id: 'ghusl-wudu',
    title: 'Малое омовение (Вуду)',
    repeat: 'По 3 раза',
    instruction:
      'Прополощите рот и нос, умойте лицо, вымойте руки до локтей и протрите голову.',
    syllables: ['Рот, ', 'нос, ', 'ли', 'цо ', 'и ', 'ру', 'ки ', 'до ', 'лок', 'тей'],
    meaning: 'Полное малое омовение (стопы можно вымыть в самом конце)',
    repeats: 1,
    glyph: 'face',
  },
  {
    id: 'ghusl-head',
    title: 'Обливание головы',
    repeat: '3 раза',
    instruction: 'Обильно полейте голову водой три раза так, чтобы вода дошла до корней волос.',
    syllables: ['Об', 'лей', 'те ', 'го', 'ло', 'ву ', 'до ', 'кор', 'ней ', 'во', 'лос'],
    meaning: 'Вода полностью пропитывает кожу головы',
    repeats: 3,
    glyph: 'head',
  },
  {
    id: 'ghusl-right',
    title: 'Правая сторона тела',
    repeat: 'Полностью',
    instruction:
      'Омойте всю правую половину тела сверху донизу, не оставляя сухих участков кожи.',
    syllables: ['Об', 'лей', 'те ', 'всю ', 'пра', 'ву', 'ю ', 'сто', 'ро', 'ну ', 'те', 'ла'],
    meaning: 'Начинаем обливание тела с правой стороны',
    repeats: 1,
    glyph: 'shower',
  },
  {
    id: 'ghusl-left',
    title: 'Левая сторона тела',
    repeat: 'Полностью',
    instruction:
      'Омойте всю левую половину тела сверху донизу, убедившись, что вода покрыла всё тело.',
    syllables: ['Об', 'лей', 'те ', 'всю ', 'ле', 'ву', 'ю ', 'сто', 'ро', 'ну ', 'те', 'ла'],
    meaning: 'Вода должна коснуться каждого участка тела',
    repeats: 1,
    glyph: 'shower',
  },
  {
    id: 'ghusl-finish',
    title: 'Стопы и слова завершения',
    repeat: 'Завершение',
    instruction: 'Вымойте обе стопы до щиколоток и произнесите свидетельство:',
    arabic: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    syllables: [
      'Аш',
      'ха',
      'ду ',
      'ал',
      'ля́ ',
      'и',
      'ля́',
      'ха ',
      'ил',
      'ляЛ',
      'ла́',
      'ху ',
      'вах',
      'да',
      'ху́ ',
      'ля́ ',
      'ша',
      'ри́',
      'ка ',
      'лях',
    ],
    meaning: 'Полное омовение (гусль) завершено, можно приступать к намазу',
    repeats: 1,
    glyph: 'dua',
  },
];

export type PrayerPostureType =
  | 'takbir'
  | 'qiyam'
  | 'ruku'
  | 'itidal'
  | 'sujud'
  | 'jalsa'
  | 'taslim';

export interface PrayerStep {
  id: string;
  rakaat: number;
  totalRakaats: number;
  postureTitle: string;
  movementCue: string;
  arabic: string;
  syllables: string[];
  meaning: string;
  repeats: number;
  posture: PrayerPostureType;
}

export function buildPrayerSequence(prayer: PrayerInfo): PrayerStep[] {
  const steps: PrayerStep[] = [];
  const total = prayer.rakaats;

  steps.push({
    id: 'takbir-start',
    rakaat: 1,
    totalRakaats: total,
    postureTitle: 'Такбират аль-ихрам',
    movementCue: 'Встаньте лицом к Кибле и поднимите ладони к уровню ушей',
    arabic: 'اللَّهُ أَكْبَرُ',
    syllables: ['Ал', 'ла́', 'ху ', 'А́к', 'бар'],
    meaning: 'Аллах Велик',
    repeats: 1,
    posture: 'takbir',
  });

  for (let r = 1; r <= total; r++) {
    const isShortRecitation = r <= 2;
    steps.push({
      id: `r${r}-qiyam`,
      rakaat: r,
      totalRakaats: total,
      postureTitle: 'Кыям · Стояние',
      movementCue: 'Правая кисть поверх левой на груди, взгляд на место земного поклона',
      arabic: isShortRecitation
        ? 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ'
        : 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ',
      syllables: isShortRecitation
        ? [
            'Бис',
            'мил',
            'ля́',
            'хир-',
            'Рах',
            'ма́',
            'нир-',
            'Ра',
            'хи́м. ',
            'Аль-',
            'хам',
            'ду ',
            'лиЛ',
            'ля́',
            'хи ',
            'Раб',
            'биль-',
            '‘а́',
            'ля',
            'ми́н',
          ]
        : [
            'Аль-',
            'хам',
            'ду ',
            'лиЛ',
            'ля́',
            'хи ',
            'Раб',
            'биль-',
            '‘а́',
            'ля',
            'ми́н. ',
            'Ар-',
            'Рах',
            'ма́',
            'нир-',
            'Ра',
            'хи́м',
          ],
      meaning: 'С именем Аллаха Милостивого, Милосердного. Хвала Аллаху, Господу миров',
      repeats: 1,
      posture: 'qiyam',
    });

    steps.push({
      id: `r${r}-ruku`,
      rakaat: r,
      totalRakaats: total,
      postureTitle: 'Руку · Поясной поклон',
      movementCue: 'Наклонитесь под прямым углом, спина ровная, ладони на коленях',
      arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
      syllables: ['Суб', 'ха́', 'на ', 'Раб', 'би', 'яль-', '‘А', 'зы́м'],
      meaning: 'Слава моему Великому Господу',
      repeats: 3,
      posture: 'ruku',
    });

    steps.push({
      id: `r${r}-itidal`,
      rakaat: r,
      totalRakaats: total,
      postureTitle: 'И‘тидаль · Выпрямление',
      movementCue: 'Спокойно выпрямитесь в полный рост, опустив руки вдоль тела',
      arabic: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ ۝ رَبَّنَا وَلَكَ الْحَمْدُ',
      syllables: [
        'Са',
        'ми‘',
        'аЛ',
        'ла́',
        'ху ',
        'ли',
        'ман ',
        'ха',
        'ми',
        'дах. ',
        'Раб',
        'ба',
        'на́ ',
        'ва ',
        'ля',
        'каль-',
        'хамд',
      ],
      meaning: 'Аллах слышит того, кто восхваляет Его. Господь наш, Тебе хвала',
      repeats: 1,
      posture: 'itidal',
    });

    steps.push({
      id: `r${r}-sujud1`,
      rakaat: r,
      totalRakaats: total,
      postureTitle: 'Суджуд · Земной поклон',
      movementCue: 'Опуститесь на коврик: лоб, нос, ладони и колени касаются пола',
      arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
      syllables: ['Суб', 'ха́', 'на ', 'Раб', 'би', 'яль-', 'А‘', 'ля́'],
      meaning: 'Слава моему Всевышнему Господу',
      repeats: 3,
      posture: 'sujud',
    });

    steps.push({
      id: `r${r}-jalsa`,
      rakaat: r,
      totalRakaats: total,
      postureTitle: 'Джальса · Сидение',
      movementCue: 'Присядьте спокойно между поклонами, ладони свободно на бёдрах',
      arabic: 'رَبِّ اغْفِرْ لِي',
      syllables: ['Раб', 'биг', 'фир ', 'ли́'],
      meaning: 'Господи, прости меня',
      repeats: 2,
      posture: 'jalsa',
    });

    steps.push({
      id: `r${r}-sujud2`,
      rakaat: r,
      totalRakaats: total,
      postureTitle: 'Суджуд · Второй поклон',
      movementCue: 'Вновь опуститесь в земной поклон со словами «Аллаху Акбар»',
      arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
      syllables: ['Суб', 'ха́', 'на ', 'Раб', 'би', 'яль-', 'А‘', 'ля́'],
      meaning: 'Слава моему Всевышнему Господу',
      repeats: 3,
      posture: 'sujud',
    });

    const isMiddleTashahhud = r === 2 && total > 2;
    const isFinalTashahhud = r === total;

    if (isMiddleTashahhud) {
      steps.push({
        id: `r${r}-tashahhud-mid`,
        rakaat: r,
        totalRakaats: total,
        postureTitle: 'Ташаххуд · Сидение',
        movementCue: 'Оставайтесь сидя после 2-го ракаата, правый указательный палец приподнят',
        arabic: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ',
        syllables: [
          'Ат-',
          'та',
          'хий',
          'я́',
          'ту ',
          'лиЛ',
          'ля́',
          'хи ',
          'вас-',
          'са',
          'ля',
          'ва́',
          'ту ',
          'ват-',
          'тай',
          'йи',
          'ба́т',
        ],
        meaning: 'Все приветствия, молитвы и благие дела принадлежат Аллаху',
        repeats: 1,
        posture: 'jalsa',
      });
    }

    if (isFinalTashahhud) {
      steps.push({
        id: `r${r}-tashahhud-final`,
        rakaat: r,
        totalRakaats: total,
        postureTitle: 'Заключительный ташаххуд',
        movementCue: 'Сидите спокойно и произнесите благословение Пророку ﷺ',
        arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
        syllables: [
          'Ал',
          'ла́',
          'хум',
          'ма ',
          'сал',
          'ли ',
          '‘а',
          'ля́ ',
          'Му',
          'хам',
          'ма',
          'дин ',
          'ва ',
          '‘а',
          'ля́ ',
          'а́',
          'ли ',
          'Му',
          'хам',
          'мад',
        ],
        meaning: 'О Аллах, благослови Мухаммада и семейство Мухаммада',
        repeats: 1,
        posture: 'jalsa',
      });
    }
  }

  steps.push({
    id: 'taslim-end',
    rakaat: total,
    totalRakaats: total,
    postureTitle: 'Таслим · Завершение',
    movementCue: 'Плавно поверните голову сначала направо, затем налево',
    arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',
    syllables: ['Ас-', 'са', 'ля́', 'му ', '‘а', 'ля́й', 'кум ', 'ва ', 'рах', 'ма', 'туЛ', 'ла́х'],
    meaning: 'Мир вам и милость Аллаха',
    repeats: 2,
    posture: 'taslim',
  });

  return steps;
}

export interface JourneyDay {
  dayNumber: number;
  date: Date;
  dateNum: number;
  weekdayShort: string;
  weekdayFull: string;
  monthShort: string;
}

const WEEKDAYS_SHORT_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const WEEKDAYS_FULL_RU = [
  'Воскресенье',
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
];
const MONTHS_RU = [
  'янв',
  'фев',
  'мар',
  'апр',
  'мая',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
];

export function buildJourneyCalendar(startDate: Date): JourneyDay[] {
  const days: JourneyDay[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push({
      dayNumber: i + 1,
      date: d,
      dateNum: d.getDate(),
      weekdayShort: WEEKDAYS_SHORT_RU[d.getDay()],
      weekdayFull: WEEKDAYS_FULL_RU[d.getDay()],
      monthShort: MONTHS_RU[d.getMonth()],
    });
  }
  return days;
}

export function formatMmSs(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
