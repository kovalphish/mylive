export type PaletteId = 'dawn' | 'sage' | 'lavender';

export interface PaletteSwatch {
  name: string;
  role: string;
  hex: string;
}

export interface PastelPalette {
  id: PaletteId;
  name: string;
  mood: string;
  studioBg: string;
  screenCanvas: string;
  surface: string;
  surfaceMuted: string;
  bloomTop: string;
  bloomBottom: string;
  border: string;
  inkPrimary: string;
  inkSecondary: string;
  inkMuted: string;
  ctaBg: string;
  ctaHover: string;
  ctaText: string;
  accentSoft: string;
  accentLine: string;
  focusRing: string;
  artworkSrc: string;
  artworkAlt: string;
  fallbackGradient: string;
  swatches: PaletteSwatch[];
}

export const PASTEL_PALETTES: Record<PaletteId, PastelPalette> = {
  dawn: {
    id: 'dawn',
    name: 'Рассвет',
    mood: 'Тёплый шёлк и пудровый персик',
    studioBg: '#F4F1EC',
    screenCanvas: '#FBF9F6',
    surface: '#FFFFFF',
    surfaceMuted: '#F5EFE9',
    bloomTop: '#F4DFD0',
    bloomBottom: '#DFEAE2',
    border: 'rgba(46, 42, 39, 0.09)',
    inkPrimary: '#24211F',
    inkSecondary: '#5D5651',
    inkMuted: '#8B837D',
    ctaBg: '#2B2623',
    ctaHover: '#3D3632',
    ctaText: '#FBF9F6',
    accentSoft: '#F3DFD2',
    accentLine: '#C99C84',
    focusRing: '#C99C84',
    artworkSrc: '/src/assets/images/pastel_dawn_horizon_1795653444376.jpg',
    artworkAlt: 'Минималистичная акварельная тропа к рассветному горизонту в персиковых и шалфейных тонах',
    fallbackGradient: 'linear-gradient(155deg, #F5E1D3 0%, #FBF7F2 55%, #DFEAE2 100%)',
    swatches: [
      { name: 'Шёлк', role: 'Фон экрана', hex: '#FBF9F6' },
      { name: 'Персик', role: 'Мягкий свет', hex: '#F4DFD0' },
      { name: 'Шалфей', role: 'Баланс', hex: '#DFEAE2' },
      { name: 'Пудра', role: 'Акцент линии', hex: '#C99C84' },
      { name: 'Графит', role: 'Текст и кнопка', hex: '#2B2623' },
    ],
  },
  sage: {
    id: 'sage',
    name: 'Шалфей',
    mood: 'Утренний туман и эвкалипт',
    studioBg: '#EFF2EE',
    screenCanvas: '#F8FAF8',
    surface: '#FFFFFF',
    surfaceMuted: '#EDF2ED',
    bloomTop: '#D8E7DC',
    bloomBottom: '#E9E6DC',
    border: 'rgba(35, 48, 40, 0.09)',
    inkPrimary: '#1E2A23',
    inkSecondary: '#516158',
    inkMuted: '#7F8F85',
    ctaBg: '#24352C',
    ctaHover: '#32483C',
    ctaText: '#F8FAF8',
    accentSoft: '#DAE8DE',
    accentLine: '#84A38E',
    focusRing: '#84A38E',
    artworkSrc: '/src/assets/images/pastel_sage_mist_1795653444318.jpg',
    artworkAlt: 'Спокойные пастельные слои шалфейного тумана и тёплого камня в стиле минимализм',
    fallbackGradient: 'linear-gradient(155deg, #D8E7DC 0%, #F6F9F6 55%, #E9E6DC 100%)',
    swatches: [
      { name: 'Фарфор', role: 'Фон экрана', hex: '#F8FAF8' },
      { name: 'Эвкалипт', role: 'Мягкий свет', hex: '#D8E7DC' },
      { name: 'Лён', role: 'Баланс', hex: '#E9E6DC' },
      { name: 'Мох', role: 'Акцент линии', hex: '#84A38E' },
      { name: 'Хвоя', role: 'Текст и кнопка', hex: '#24352C' },
    ],
  },
  lavender: {
    id: 'lavender',
    name: 'Лаванда',
    mood: 'Тихий вечер и прохладный барвинок',
    studioBg: '#F1EFF4',
    screenCanvas: '#FAF9FC',
    surface: '#FFFFFF',
    surfaceMuted: '#F1EEF6',
    bloomTop: '#E5DFF0',
    bloomBottom: '#EFE4D8',
    border: 'rgba(42, 38, 54, 0.09)',
    inkPrimary: '#23202E',
    inkSecondary: '#5A5569',
    inkMuted: '#888396',
    ctaBg: '#2B273A',
    ctaHover: '#3C374F',
    ctaText: '#FAF9FC',
    accentSoft: '#E5DFF0',
    accentLine: '#9D91B8',
    focusRing: '#9D91B8',
    artworkSrc: '/src/assets/images/pastel_lavender_dusk_1795653445102.jpg',
    artworkAlt: 'Минималистичный вечерний горизонт в мягких пастельных оттенках лаванды и песка',
    fallbackGradient: 'linear-gradient(155deg, #E5DFF0 0%, #FAF9FC 55%, #EFE4D8 100%)',
    swatches: [
      { name: 'Облако', role: 'Фон экрана', hex: '#FAF9FC' },
      { name: 'Лаванда', role: 'Мягкий свет', hex: '#E5DFF0' },
      { name: 'Шампань', role: 'Баланс', hex: '#EFE4D8' },
      { name: 'Ирис', role: 'Акцент линии', hex: '#9D91B8' },
      { name: 'Слива', role: 'Текст и кнопка', hex: '#2B273A' },
    ],
  },
};

export const PALETTE_ORDER: PaletteId[] = ['dawn', 'sage', 'lavender'];

export type MotionPace = 'calm' | 'crisp' | 'meditative';

export interface MotionPreset {
  id: MotionPace;
  label: string;
  stagger: number;
  duration: number;
}

export const MOTION_PRESETS: Record<MotionPace, MotionPreset> = {
  crisp: {
    id: 'crisp',
    label: 'Быстрая',
    stagger: 0.07,
    duration: 0.45,
  },
  calm: {
    id: 'calm',
    label: 'Плавная',
    stagger: 0.12,
    duration: 0.72,
  },
  meditative: {
    id: 'meditative',
    label: 'Медитативная',
    stagger: 0.19,
    duration: 1.05,
  },
};
