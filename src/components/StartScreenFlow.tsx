import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Eye,
  EyeOff,
  MapPin,
  Settings,
} from 'lucide-react';
import type { MotionPreset, PaletteId, PastelPalette } from '../palettes';
import {
  CITY_OPTIONS,
  READING_SPEED_ORDER,
  buildPrayersForCity,
  getActivePrayerStatus,
  getCityClock,
  type AblutionMode,
  type PrayerId,
  type PrayerInfo,
  type ReadingSpeedId,
} from '../data/prayerData';
import { playActionChangeChime, unlockAudio } from '../utils/soundCues';
import { PathMark } from './PathMark';
import { MainHomeScreen } from './MainHomeScreen';
import { WuduTrainerScreen } from './WuduTrainerScreen';
import { AutoNamazPrompter } from './AutoNamazPrompter';
import { SettingsScreen } from './SettingsScreen';

export type ScreenStep =
  | 'welcome'
  | 'register'
  | 'login'
  | 'home'
  | 'wudu'
  | 'prompter'
  | 'settings';

interface StartScreenFlowProps {
  paletteId: PaletteId;
  onSelectPalette: (id: PaletteId) => void;
  palette: PastelPalette;
  motionPreset: MotionPreset;
  animationKey: number;
  screen: ScreenStep;
  onScreenChange: (step: ScreenStep) => void;
  wuduDone: boolean;
  onWuduDoneChange: (done: boolean) => void;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function StartScreenFlow({
  paletteId,
  onSelectPalette,
  palette,
  motionPreset,
  animationKey,
  screen,
  onScreenChange,
  wuduDone,
  onWuduDoneChange,
}: StartScreenFlowProps) {
  const prefersReduced = useReducedMotion();
  const [failedArtworkSrc, setFailedArtworkSrc] = useState<string | null>(null);
  const previousScreenRef = useRef<ScreenStep>('home');

  // Registration & login form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cityId, setCityId] = useState<string>(CITY_OPTIONS[0].id);
  const [starterPrayers, setStarterPrayers] = useState<PrayerId[]>(['fajr', 'maghrib']);
  const [errorText, setErrorText] = useState('');
  const [activeUserName, setActiveUserName] = useState('Амина');
  const [registrationDate, setRegistrationDate] = useState<Date>(() => new Date());

  // Ablution trainer mode: Малое (Вуду) vs Полное (Гусль)
  const [ablutionMode, setAblutionMode] = useState<AblutionMode>('wudu');

  // Live clock for Registration city time preview
  const [clockNow, setClockNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setClockNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const selectedCity = useMemo(
    () => CITY_OPTIONS.find((c) => c.id === cityId) ?? CITY_OPTIONS[0],
    [cityId],
  );
  const cityPrayers = useMemo(() => buildPrayersForCity(selectedCity), [selectedCity]);
  const registerCityClock = useMemo(
    () => getCityClock(selectedCity.timeZone, clockNow),
    [selectedCity.timeZone, clockNow],
  );

  // Shared uniform reading speed & sound toggle across Wudu, Ghusl, Auto-Namaz & Settings
  const [readingSpeed, setReadingSpeed] = useState<ReadingSpeedId>('slow');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const cycleReadingSpeed = () => {
    setReadingSpeed((curr) => {
      const idx = READING_SPEED_ORDER.indexOf(curr);
      return READING_SPEED_ORDER[(idx + 1) % READING_SPEED_ORDER.length];
    });
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (next) {
        playActionChangeChime();
      }
      return next;
    });
  };

  const openSettings = () => {
    if (screen !== 'settings') {
      previousScreenRef.current = screen;
    }
    onScreenChange('settings');
  };

  // Main home prayer state
  const [selectedPrayerId, setSelectedPrayerId] = useState<PrayerId | null>(null);
  const [prompterPrayer, setPrompterPrayer] = useState<PrayerInfo>(
    () => getActivePrayerStatus(CITY_OPTIONS[0], new Date()).prayer,
  );
  const [completedPrayers, setCompletedPrayers] = useState<PrayerId[]>([]);

  const d = prefersReduced ? 0.01 : motionPreset.duration;
  const step = prefersReduced ? 0 : motionPreset.stagger;

  const resetErrors = () => setErrorText('');

  const handleToggleStarterPrayer = (id: PrayerId) => {
    resetErrors();
    setStarterPrayers((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const completeOnboarding = (displayName: string) => {
    unlockAudio();
    setErrorText('');
    setActiveUserName(displayName);
    setRegistrationDate(new Date());
    onScreenChange('home');
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorText('Введите ваше имя, чтобы продолжить.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorText('Укажите корректную электронную почту.');
      return;
    }
    if (password.length < 6) {
      setErrorText('Пароль должен содержать не менее 6 символов.');
      return;
    }
    if (starterPrayers.length !== 2) {
      setErrorText('Выберите 2 намаза, с которых начнёте путь.');
      return;
    }

    completeOnboarding(trimmedName);
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorText('Укажите корректную электронную почту.');
      return;
    }
    if (password.length < 6) {
      setErrorText('Введите пароль (минимум 6 символов).');
      return;
    }

    const derivedName = name.trim() || trimmedEmail.split('@')[0];
    const formatted = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
    completeOnboarding(formatted);
  };

  const handleQuickAppleContinue = () => {
    if (starterPrayers.length !== 2) {
      setStarterPrayers(['fajr', 'maghrib']);
    }
    completeOnboarding(name.trim() || 'Амина');
  };

  const activePrayerForPrompter =
    cityPrayers.find((p) => p.id === selectedPrayerId) ??
    cityPrayers.find((p) => p.id === prompterPrayer.id) ??
    getActivePrayerStatus(selectedCity, clockNow).prayer;

  return (
    <div className="relative flex-1 flex flex-col px-6 pt-5 pb-6 sm:pt-3 sm:pb-4 overflow-hidden select-none">
      {/* Ambient pastel light washes */}
      <motion.div
        key={`bloom-${animationKey}-${palette.id}`}
        aria-hidden="true"
        initial={prefersReduced ? { opacity: 0.72 } : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 0.72, scale: 1 }}
        transition={{ duration: d * 1.25, ease: EASE_OUT_EXPO }}
        className="pointer-events-none absolute -top-24 -right-20 w-72 h-72 rounded-full bg-[var(--p-bloom-top)] blur-3xl transition-colors duration-700"
      />
      <motion.div
        key={`bloom-bottom-${animationKey}-${palette.id}`}
        aria-hidden="true"
        initial={prefersReduced ? { opacity: 0.65 } : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 0.65, scale: 1 }}
        transition={{ duration: d * 1.35, delay: step * 0.5, ease: EASE_OUT_EXPO }}
        className="pointer-events-none absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-[var(--p-bloom-bottom)] blur-3xl transition-colors duration-700"
      />

      <AnimatePresence mode="wait" initial={false}>
        {screen === 'welcome' && (
          <motion.div
            key={`welcome-${animationKey}`}
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: -18 }}
            transition={{ duration: 0.24, ease: EASE_OUT_EXPO }}
            className="relative z-10 flex-1 flex flex-col justify-between"
          >
            {/* Top Brand Row with Settings Button */}
            <motion.header
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: d, delay: step * 0.6, ease: EASE_OUT_EXPO }}
              className="flex items-center justify-between pt-1"
            >
              <div className="flex items-center gap-2.5">
                <PathMark duration={d * 1.1} delay={step * 0.8} />
                <span className="font-display text-[23px] font-semibold tracking-[-0.01em] text-[var(--p-ink)] leading-none">
                  Путь 30
                </span>
              </div>

              <button
                type="button"
                onClick={openSettings}
                aria-label="Открыть настройки"
                className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-full text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)] hover:bg-[var(--p-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-focus)] transition-colors cursor-pointer"
              >
                <Settings className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </button>
            </motion.header>

            {/* Centerpiece Artwork + Welcome Copy */}
            <div className="my-auto py-4 flex flex-col gap-6">
              <motion.div
                initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: d * 1.1, delay: step * 1.6, ease: EASE_OUT_EXPO }}
                className="relative w-full aspect-[4/3.15] rounded-[28px] overflow-hidden border border-[var(--p-border)] artwork-fallback shadow-[0_14px_34px_-22px_rgba(36,33,31,0.16)]"
              >
                {failedArtworkSrc !== palette.artworkSrc && (
                  <img
                    key={palette.artworkSrc}
                    src={palette.artworkSrc}
                    alt={palette.artworkAlt}
                    referrerPolicy="no-referrer"
                    onError={() => setFailedArtworkSrc(palette.artworkSrc)}
                    className="w-full h-full object-cover scale-[1.2] transition-transform duration-700"
                  />
                )}

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--p-canvas)]/35 via-transparent to-transparent"
                />

                <svg
                  viewBox="0 0 320 110"
                  fill="none"
                  className="pointer-events-none absolute bottom-3 left-4 right-4 w-[calc(100%-2rem)] h-12"
                  aria-hidden="true"
                >
                  <motion.path
                    d="M8 84C72 82 118 54 176 48C228 43 272 28 312 18"
                    stroke="var(--p-ink)"
                    strokeOpacity="0.22"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeDasharray="2 7"
                    initial={prefersReduced ? { pathLength: 1 } : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: d * 1.35, delay: step * 2.4, ease: EASE_OUT_EXPO }}
                  />
                  <motion.circle
                    cx="312"
                    cy="18"
                    r="3.2"
                    fill="var(--p-ink)"
                    fillOpacity="0.65"
                    initial={prefersReduced ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: step * 2.4 + d * 0.95, ease: EASE_OUT_EXPO }}
                  />
                </svg>
              </motion.div>

              <div className="space-y-3 text-left px-0.5">
                <motion.h1
                  initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: d, delay: step * 2.8, ease: EASE_OUT_EXPO }}
                  className="font-display text-[38px] leading-[1.06] font-semibold tracking-[-0.015em] text-[var(--p-ink)] text-balance"
                >
                  Тридцать дней на&nbsp;пути к&nbsp;намазу
                </motion.h1>

                <motion.p
                  initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: d, delay: step * 3.7, ease: EASE_OUT_EXPO }}
                  className="text-[14.5px] leading-[1.6] text-[var(--p-ink-secondary)] max-w-[30ch]"
                >
                  Спокойный ежедневный ритм: омовение, время намаза и суфлёр рядом — без спешки и
                  лишнего шума.
                </motion.p>

                <motion.div
                  initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: d, delay: step * 4.4, ease: EASE_OUT_EXPO }}
                  className="pt-1 flex items-center gap-2 text-[12px] font-medium text-[var(--p-ink-muted)] tabular-nums"
                >
                  <span>30 дней</span>
                  <span aria-hidden="true">·</span>
                  <span>5 намазов</span>
                  <span aria-hidden="true">·</span>
                  <span>Суфлёр на коврике</span>
                </motion.div>
              </div>
            </div>

            {/* Bottom Thumb-Zone Action Stack */}
            <div className="pt-2 space-y-2.5">
              <motion.button
                type="button"
                onClick={() => {
                  resetErrors();
                  onScreenChange('register');
                }}
                initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: d, delay: step * 5.2, ease: EASE_OUT_EXPO }}
                whileTap={prefersReduced ? undefined : { scale: 0.982 }}
                className="group w-full min-h-[54px] px-6 rounded-[18px] bg-[var(--p-cta-bg)] hover:bg-[var(--p-cta-hover)] text-[var(--p-cta-text)] text-[15px] font-medium tracking-[-0.005em] flex items-center justify-center gap-2.5 shadow-[0_12px_24px_-14px_rgba(36,33,31,0.4)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--p-focus)] cursor-pointer whitespace-nowrap"
              >
                <span>Зарегистрироваться</span>
                <ArrowRight
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  strokeWidth={1.85}
                />
              </motion.button>

              <motion.div
                initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: d, delay: step * 6.0, ease: EASE_OUT_EXPO }}
                className="flex items-center justify-center"
              >
                <button
                  type="button"
                  onClick={() => {
                    resetErrors();
                    onScreenChange('login');
                  }}
                  className="min-h-[44px] px-4 rounded-xl text-[13.5px] text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-focus)] cursor-pointer whitespace-nowrap"
                >
                  Уже есть аккаунт?{' '}
                  <span className="font-semibold text-[var(--p-ink)] underline underline-offset-4 decoration-[var(--p-accent-line)]">
                    Войти
                  </span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {screen === 'register' && (
          <motion.div
            key="register"
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
            className="relative z-10 flex-1 flex flex-col justify-between min-h-0"
          >
            <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-3">
              <div className="flex items-center justify-between -ml-2">
                <button
                  type="button"
                  onClick={() => {
                    resetErrors();
                    onScreenChange('welcome');
                  }}
                  aria-label="Вернуться назад"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[var(--p-ink)] hover:bg-[var(--p-surface-muted)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-focus)] cursor-pointer"
                >
                  <ArrowLeft className="w-[19px] h-[19px]" strokeWidth={1.8} />
                </button>
                <span className="text-[12px] font-medium text-[var(--p-ink-muted)]">Путь 30</span>
                <span className="w-[44px]" aria-hidden="true" />
              </div>

              <div className="mt-1.5 space-y-1">
                <h2 className="font-display text-[31px] leading-[1.06] font-semibold text-[var(--p-ink)] text-balance">
                  Создать аккаунт
                </h2>
                <p className="text-[13px] leading-[1.45] text-[var(--p-ink-secondary)]">
                  Укажите город для точного времени намаза и выберите 2 стартовых намаза.
                </p>
              </div>

              <form
                id="register-form"
                onSubmit={handleRegisterSubmit}
                noValidate
                className="mt-3.5 space-y-3"
              >
                {/* City Selector + Exact Live Time in City */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="reg-city"
                    className="block text-[12.5px] font-medium text-[var(--p-ink-secondary)]"
                  >
                    Ваш город
                  </label>

                  <div className="grid grid-cols-1 gap-2">
                    <div className="relative">
                      <MapPin
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--p-accent-line)]"
                        strokeWidth={1.9}
                      />
                      <select
                        id="reg-city"
                        value={cityId}
                        onChange={(e) => setCityId(e.target.value)}
                        className="w-full min-h-[46px] pl-10 pr-4 rounded-[14px] bg-[var(--p-surface)] border border-[var(--p-border)] text-[14px] font-medium text-[var(--p-ink)] focus:outline-none focus:border-[var(--p-focus)] focus:ring-2 focus:ring-[var(--p-focus)]/20 transition-colors cursor-pointer"
                      >
                        {CITY_OPTIONS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.country})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="rounded-[14px] bg-[var(--p-surface-muted)]/90 border border-[var(--p-border)] px-3.5 py-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Clock
                          className="w-4 h-4 text-[var(--p-ink-secondary)] shrink-0"
                          strokeWidth={1.8}
                        />
                        <span className="text-[12.5px] text-[var(--p-ink-secondary)] truncate">
                          Точное время · {selectedCity.name}
                        </span>
                      </div>
                      <span className="font-mono-code text-[15px] font-semibold text-[var(--p-ink)] tabular-nums shrink-0">
                        {registerCityClock.timeWithSeconds}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2 Starter Prayers Picker */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12.5px] font-medium text-[var(--p-ink-secondary)]">
                      Какие 2 намаза совершать на старте
                    </span>
                    <span className="text-[12px] font-medium text-[var(--p-ink-muted)] tabular-nums">
                      {starterPrayers.length} из 2
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5">
                    {cityPrayers.map((prayer) => {
                      const isChosen = starterPrayers.includes(prayer.id);
                      return (
                        <button
                          key={prayer.id}
                          type="button"
                          onClick={() => handleToggleStarterPrayer(prayer.id)}
                          aria-pressed={isChosen}
                          className={`min-h-[56px] px-1 py-1.5 rounded-[14px] border flex flex-col items-center justify-center gap-0.5 transition-colors duration-150 cursor-pointer ${
                            isChosen
                              ? 'bg-[var(--p-cta-bg)] text-[var(--p-cta-text)] border-transparent shadow-[0_8px_16px_-12px_rgba(36,33,31,0.45)]'
                              : 'bg-[var(--p-surface)] text-[var(--p-ink)] border-[var(--p-border)] hover:bg-[var(--p-surface-muted)]'
                          }`}
                        >
                          <span className="text-[11px] font-semibold leading-tight">
                            {prayer.name}
                          </span>
                          <span
                            className={`text-[10px] tabular-nums ${
                              isChosen ? 'text-[var(--p-cta-text)]/80' : 'text-[var(--p-ink-muted)]'
                            }`}
                          >
                            {prayer.startTime}
                          </span>
                          {isChosen && <Check className="w-3 h-3 mt-0.5" strokeWidth={2.4} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="reg-name"
                    className="block text-[12.5px] font-medium text-[var(--p-ink-secondary)]"
                  >
                    Имя
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Например, Амина"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorText) resetErrors();
                    }}
                    className="w-full min-h-[45px] px-4 rounded-[14px] bg-[var(--p-surface)] border border-[var(--p-border)] text-[14px] text-[var(--p-ink)] placeholder:text-[var(--p-ink-muted)]/70 focus:outline-none focus:border-[var(--p-focus)] focus:ring-2 focus:ring-[var(--p-focus)]/20 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="reg-email"
                    className="block text-[12.5px] font-medium text-[var(--p-ink-secondary)]"
                  >
                    Электронная почта
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorText) resetErrors();
                    }}
                    className="w-full min-h-[45px] px-4 rounded-[14px] bg-[var(--p-surface)] border border-[var(--p-border)] text-[14px] text-[var(--p-ink)] placeholder:text-[var(--p-ink-muted)]/70 focus:outline-none focus:border-[var(--p-focus)] focus:ring-2 focus:ring-[var(--p-focus)]/20 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="reg-password"
                    className="block text-[12.5px] font-medium text-[var(--p-ink-secondary)]"
                  >
                    Пароль
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Минимум 6 символов"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorText) resetErrors();
                      }}
                      className="w-full min-h-[45px] pl-4 pr-12 rounded-[14px] bg-[var(--p-surface)] border border-[var(--p-border)] text-[14px] text-[var(--p-ink)] placeholder:text-[var(--p-ink-muted)]/70 focus:outline-none focus:border-[var(--p-focus)] focus:ring-2 focus:ring-[var(--p-focus)]/20 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                      className="absolute right-1 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--p-ink-muted)] hover:text-[var(--p-ink)] cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" strokeWidth={1.75} />
                      ) : (
                        <Eye className="w-4 h-4" strokeWidth={1.75} />
                      )}
                    </button>
                  </div>
                </div>

                {errorText && (
                  <p role="alert" className="text-[12.5px] font-medium text-[#9F3D34] pt-0.5">
                    {errorText}
                  </p>
                )}
              </form>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--p-border)]/70 shrink-0">
              <button
                type="submit"
                form="register-form"
                className="w-full min-h-[50px] px-6 rounded-[18px] bg-[var(--p-cta-bg)] hover:bg-[var(--p-cta-hover)] text-[var(--p-cta-text)] text-[15px] font-medium transition-colors duration-200 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--p-focus)] cursor-pointer whitespace-nowrap"
              >
                Начать Путь 30
              </button>

              <button
                type="button"
                onClick={handleQuickAppleContinue}
                className="w-full min-h-[44px] px-5 rounded-[16px] bg-[var(--p-surface)] hover:bg-[var(--p-surface-muted)] border border-[var(--p-border)] text-[13.5px] font-medium text-[var(--p-ink)] flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer whitespace-nowrap"
              >
                <svg
                  width="14"
                  height="17"
                  viewBox="0 0 15 18"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12.37 9.48c-.02-2.02 1.65-2.99 1.72-3.04-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.43.73-3.06.73-.64 0-1.61-.71-2.66-.69-1.36.02-2.62.79-3.32 2.02-1.42 2.46-.36 6.1 1.01 8.09.68.98 1.48 2.07 2.53 2.03 1.02-.04 1.41-.66 2.64-.66 1.23 0 1.59.66 2.66.64 1.1-.02 1.8-.99 2.47-1.97.78-1.13 1.1-2.23 1.11-2.29-.03-.01-2.16-.83-2.18-3.28ZM10.37 3.55c.56-.68.94-1.62.83-2.55-.8.03-1.78.54-2.36 1.21-.51.59-.96 1.55-.84 2.46.9.07 1.81-.45 2.37-1.12Z" />
                </svg>
                <span>Продолжить с Apple</span>
              </button>
            </div>
          </motion.div>
        )}

        {screen === 'login' && (
          <motion.div
            key="login"
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
            className="relative z-10 flex-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between -ml-2">
                <button
                  type="button"
                  onClick={() => {
                    resetErrors();
                    onScreenChange('welcome');
                  }}
                  aria-label="Вернуться назад"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[var(--p-ink)] hover:bg-[var(--p-surface-muted)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-focus)] cursor-pointer"
                >
                  <ArrowLeft className="w-[19px] h-[19px]" strokeWidth={1.8} />
                </button>
                <span className="text-[12px] font-medium text-[var(--p-ink-muted)]">Путь 30</span>
                <span className="w-[44px]" aria-hidden="true" />
              </div>

              <div className="mt-5 space-y-2">
                <h2 className="font-display text-[34px] leading-[1.08] font-semibold text-[var(--p-ink)]">
                  С возвращением
                </h2>
                <p className="text-[14px] leading-[1.55] text-[var(--p-ink-secondary)]">
                  Войдите, чтобы продолжить ваш 30-дневный путь.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} noValidate className="mt-7 space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="login-email"
                    className="block text-[12.5px] font-medium text-[var(--p-ink-secondary)]"
                  >
                    Электронная почта
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorText) resetErrors();
                    }}
                    className="w-full min-h-[48px] px-4 rounded-[14px] bg-[var(--p-surface)] border border-[var(--p-border)] text-[14.5px] text-[var(--p-ink)] placeholder:text-[var(--p-ink-muted)]/70 focus:outline-none focus:border-[var(--p-focus)] focus:ring-2 focus:ring-[var(--p-focus)]/20 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-[12.5px] font-medium text-[var(--p-ink-secondary)]"
                  >
                    Пароль
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Ваш пароль"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorText) resetErrors();
                      }}
                      className="w-full min-h-[48px] pl-4 pr-12 rounded-[14px] bg-[var(--p-surface)] border border-[var(--p-border)] text-[14.5px] text-[var(--p-ink)] placeholder:text-[var(--p-ink-muted)]/70 focus:outline-none focus:border-[var(--p-focus)] focus:ring-2 focus:ring-[var(--p-focus)]/20 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                      className="absolute right-1 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--p-ink-muted)] hover:text-[var(--p-ink)] cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" strokeWidth={1.75} />
                      ) : (
                        <Eye className="w-4 h-4" strokeWidth={1.75} />
                      )}
                    </button>
                  </div>
                </div>

                {errorText && (
                  <p role="alert" className="text-[12.5px] font-medium text-[#9F3D34]">
                    {errorText}
                  </p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full min-h-[52px] px-6 rounded-[18px] bg-[var(--p-cta-bg)] hover:bg-[var(--p-cta-hover)] text-[var(--p-cta-text)] text-[15px] font-medium transition-colors duration-200 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--p-focus)] cursor-pointer whitespace-nowrap"
                  >
                    Войти
                  </button>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-center pt-4">
              <button
                type="button"
                onClick={() => {
                  resetErrors();
                  onScreenChange('register');
                }}
                className="min-h-[44px] px-4 text-[13.5px] text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)] transition-colors cursor-pointer whitespace-nowrap"
              >
                Нет аккаунта?{' '}
                <span className="font-semibold text-[var(--p-ink)] underline underline-offset-4 decoration-[var(--p-accent-line)]">
                  Зарегистрироваться
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {screen === 'home' && (
          <MainHomeScreen
            key="home"
            userName={activeUserName}
            city={selectedCity}
            registrationDate={registrationDate}
            starterPrayers={starterPrayers}
            wuduDone={wuduDone}
            onToggleWudu={() => onWuduDoneChange(!wuduDone)}
            completedPrayers={completedPrayers}
            selectedPrayerId={selectedPrayerId}
            onSelectPrayer={(id) => {
              setSelectedPrayerId(id);
              const found = cityPrayers.find((p) => p.id === id);
              if (found) setPrompterPrayer(found);
            }}
            onStartAblution={(mode) => {
              setAblutionMode(mode);
              onScreenChange('wudu');
            }}
            onStartAutoNamaz={(prayer) => {
              setPrompterPrayer(prayer);
              onScreenChange('prompter');
            }}
            onOpenSettings={openSettings}
            motionPreset={motionPreset}
          />
        )}

        {screen === 'wudu' && (
          <WuduTrainerScreen
            key="wudu"
            mode={ablutionMode}
            onModeChange={setAblutionMode}
            readingSpeed={readingSpeed}
            onCycleSpeed={cycleReadingSpeed}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            onBack={() => onScreenChange('home')}
            onComplete={() => {
              onWuduDoneChange(true);
              onScreenChange('home');
            }}
          />
        )}

        {screen === 'prompter' && (
          <AutoNamazPrompter
            key={`prompter-${activePrayerForPrompter.id}`}
            prayer={activePrayerForPrompter}
            readingSpeed={readingSpeed}
            onCycleSpeed={cycleReadingSpeed}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            onExit={() => onScreenChange('home')}
            onComplete={(doneId) => {
              setCompletedPrayers((prev) => (prev.includes(doneId) ? prev : [...prev, doneId]));
              onScreenChange('home');
            }}
          />
        )}

        {screen === 'settings' && (
          <SettingsScreen
            key="settings"
            paletteId={paletteId}
            onSelectPalette={onSelectPalette}
            city={selectedCity}
            onSelectCity={setCityId}
            readingSpeed={readingSpeed}
            onSelectSpeed={setReadingSpeed}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            onBack={() => onScreenChange(previousScreenRef.current)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
