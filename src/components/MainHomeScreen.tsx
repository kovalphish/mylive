import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check, Droplets, MapPin, Play, Settings, Sparkles } from 'lucide-react';
import {
  buildJourneyCalendar,
  getActivePrayerStatus,
  getCityClock,
  type AblutionMode,
  type CityConfig,
  type PrayerId,
  type PrayerInfo,
} from '../data/prayerData';
import type { MotionPreset } from '../palettes';
import { unlockAudio } from '../utils/soundCues';
import { PathMark } from './PathMark';

interface MainHomeScreenProps {
  userName: string;
  city: CityConfig;
  registrationDate: Date;
  starterPrayers: PrayerId[];
  wuduDone: boolean;
  onToggleWudu: () => void;
  completedPrayers: PrayerId[];
  selectedPrayerId: PrayerId | null;
  onSelectPrayer: (id: PrayerId) => void;
  onStartAblution: (mode: AblutionMode) => void;
  onStartAutoNamaz: (prayer: PrayerInfo) => void;
  onOpenSettings: () => void;
  motionPreset: MotionPreset;
}

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function MainHomeScreen({
  userName,
  city,
  registrationDate,
  starterPrayers,
  wuduDone,
  onToggleWudu,
  completedPrayers,
  selectedPrayerId,
  onSelectPrayer,
  onStartAblution,
  onStartAutoNamaz,
  onOpenSettings,
  motionPreset,
}: MainHomeScreenProps) {
  const prefersReduced = useReducedMotion();
  const [selectedDay, setSelectedDay] = useState(1);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const calendarDays = useMemo(
    () => buildJourneyCalendar(registrationDate),
    [registrationDate],
  );

  const cityClock = useMemo(() => getCityClock(city.timeZone, now), [city.timeZone, now]);
  const liveStatus = useMemo(() => getActivePrayerStatus(city, now), [city, now]);
  const prayersForCity = liveStatus.prayers;

  const activePrayer =
    prayersForCity.find((p) => p.id === selectedPrayerId) ?? liveStatus.prayer;
  const isLivePrayerSelected = activePrayer.id === liveStatus.prayer.id;
  const isCurrentPrayerCompleted = completedPrayers.includes(activePrayer.id);

  const starterGoalCount = Math.max(1, starterPrayers.length);
  const completedStarterCount = starterPrayers.filter((id) =>
    completedPrayers.includes(id),
  ).length;
  const starterNames = prayersForCity
    .filter((p) => starterPrayers.includes(p.id))
    .map((p) => p.name)
    .join(' и ');

  const d = prefersReduced ? 0.01 : Math.min(motionPreset.duration, 0.55);
  const step = prefersReduced ? 0 : Math.min(motionPreset.stagger, 0.08);

  const selectedDayMeta = calendarDays[selectedDay - 1];

  return (
    <motion.div
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      className="relative z-10 flex-1 flex flex-col justify-between min-h-0"
    >
      {/* Scrollable Upper Content */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-3.5 pb-3 pr-0.5">
        {/* Top Greeting Header with City, Live Clock & Settings Button */}
        <motion.header
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: d, delay: step * 0.4, ease: EASE_OUT }}
          className="flex items-center justify-between pt-0.5 gap-2"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <PathMark size="sm" duration={0.65} delay={0.05} />
            <div className="min-w-0">
              <div className="text-[12px] text-[var(--p-ink-muted)] truncate">
                Ас-саляму алейкум, {userName}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-[12px] font-medium text-[var(--p-ink)] tabular-nums">
                <MapPin className="w-3 h-3 text-[var(--p-accent-line)] shrink-0" strokeWidth={2} />
                <span className="truncate">{city.name}</span>
                <span aria-hidden="true" className="text-[var(--p-ink-muted)]">
                  ·
                </span>
                <span className="font-mono-code text-[11.5px]">{cityClock.timeWithSeconds}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <span className="text-[11.5px] font-medium text-[var(--p-ink-muted)] tabular-nums mr-0.5">
              День {selectedDay}/30
            </span>
            <button
              type="button"
              onClick={onOpenSettings}
              aria-label="Открыть настройки"
              className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-full text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)] hover:bg-[var(--p-surface-muted)] transition-colors cursor-pointer"
            >
              <Settings className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>
          </div>
        </motion.header>

        {/* Mini-Calendar starting from Registration Day with Weekdays */}
        <motion.section
          aria-label="Миникалендарь пути на 30 дней"
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: d, delay: step * 1.1, ease: EASE_OUT }}
          className="space-y-2"
        >
          <div className="flex items-baseline justify-between gap-2 px-0.5">
            <span className="text-[12.5px] font-medium text-[var(--p-ink-secondary)]">
              {selectedDay === 1
                ? `${selectedDayMeta.weekdayFull} · старт пути`
                : `${selectedDayMeta.weekdayFull}, ${selectedDayMeta.dateNum} ${selectedDayMeta.monthShort}`}
            </span>
            <span className="text-[11.5px] text-[var(--p-ink-muted)] tabular-nums shrink-0">
              Цель: {completedStarterCount} из {starterGoalCount}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {calendarDays.map((day) => {
              const isSelected = day.dayNumber === selectedDay;
              const isStartDay = day.dayNumber === 1;
              return (
                <button
                  key={day.dayNumber}
                  type="button"
                  onClick={() => setSelectedDay(day.dayNumber)}
                  aria-label={`${day.weekdayFull}, ${day.dateNum} ${day.monthShort}`}
                  aria-pressed={isSelected}
                  className={`shrink-0 w-[48px] min-h-[60px] rounded-[16px] flex flex-col items-center justify-center gap-0.5 transition-colors duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--p-cta-bg)] text-[var(--p-cta-text)] shadow-[0_8px_18px_-12px_rgba(36,33,31,0.45)]'
                      : 'bg-[var(--p-surface)]/75 border border-[var(--p-border)] text-[var(--p-ink)] hover:bg-[var(--p-surface)]'
                  }`}
                >
                  <span
                    className={`text-[11px] font-medium ${
                      isSelected ? 'text-[var(--p-cta-text)]/80' : 'text-[var(--p-ink-muted)]'
                    }`}
                  >
                    {day.weekdayShort}
                  </span>
                  <span className="text-[16px] font-semibold tabular-nums leading-tight">
                    {day.dateNum}
                  </span>
                  {isStartDay && (
                    <span
                      aria-hidden="true"
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-[var(--p-cta-text)]/80' : 'bg-[var(--p-accent-line)]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* Block 1: What to do now (Active Prayer Window for City) */}
        <motion.section
          aria-label="Текущий намаз"
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: d, delay: step * 1.9, ease: EASE_OUT }}
          className="rounded-[24px] bg-[var(--p-surface)] border border-[var(--p-border)] p-4.5 shadow-[0_14px_34px_-26px_rgba(36,33,31,0.16)] space-y-3.5"
        >
          <div className="flex items-center justify-between gap-2 text-[12px] text-[var(--p-ink-muted)] tabular-nums">
            <span>{isLivePrayerSelected ? 'Сейчас время намаза' : 'Выбранный намаз'}</span>
            <span>
              {activePrayer.startTime} – {activePrayer.endTime}
            </span>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2.5">
                <h1 className="font-display text-[38px] leading-[0.98] font-semibold text-[var(--p-ink)]">
                  {activePrayer.name}
                </h1>
                <span
                  dir="rtl"
                  className="text-[19px] font-medium text-[var(--p-accent-line)] leading-none"
                >
                  {activePrayer.arabic}
                </span>
              </div>
              <p className="text-[13px] leading-[1.45] text-[var(--p-ink-secondary)]">
                {activePrayer.rakaats} ракаата фард ·{' '}
                {isLivePrayerSelected
                  ? `до ${liveStatus.nextPrayer.name} ${liveStatus.remainingLabel}`
                  : activePrayer.note}
              </p>
            </div>

            {isCurrentPrayerCompleted && (
              <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--p-ink)] shrink-0">
                <Check className="w-3.5 h-3.5" strokeWidth={2.2} />
                <span>Выполнен</span>
              </span>
            )}
          </div>

          {/* 5 Daily Prayers Selector Strip */}
          <div className="pt-2.5 border-t border-[var(--p-border)] space-y-1.5">
            <div className="grid grid-cols-5 gap-1">
              {prayersForCity.map((p) => {
                const isSelected = p.id === activePrayer.id;
                const isDone = completedPrayers.includes(p.id);
                const isStarter = starterPrayers.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectPrayer(p.id)}
                    className={`min-h-[44px] px-1 py-1.5 rounded-[12px] flex flex-col items-center justify-center transition-colors duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--p-surface-muted)] text-[var(--p-ink)]'
                        : 'text-[var(--p-ink-muted)] hover:text-[var(--p-ink)]'
                    }`}
                  >
                    <span
                      className={`text-[11px] leading-tight truncate max-w-full ${
                        isStarter || isSelected ? 'font-semibold text-[var(--p-ink)]' : 'font-medium'
                      }`}
                    >
                      {p.name}
                    </span>
                    <span className="text-[10.5px] tabular-nums mt-0.5 flex items-center gap-0.5">
                      {isDone && <Check className="w-2.5 h-2.5" strokeWidth={2.4} />}
                      <span>{p.startTime}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {starterNames && (
              <div className="text-[11.5px] text-[var(--p-ink-muted)] px-0.5">
                Ваш старт на сегодня:{' '}
                <span className="text-[var(--p-ink-secondary)]">{starterNames}</span>
              </div>
            )}
          </div>
        </motion.section>

        {/* Block 2: Spacious Wudu Status + Large Mark Button + Full Ghusl Launcher */}
        <motion.section
          aria-label="Статус омовения"
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: d, delay: step * 2.5, ease: EASE_OUT }}
          className="rounded-[24px] bg-[var(--p-surface)] border border-[var(--p-border)] p-4.5 space-y-3"
        >
          <div className="flex items-start gap-3">
            <span
              className={`w-10 h-10 rounded-[14px] shrink-0 flex items-center justify-center transition-colors ${
                wuduDone
                  ? 'bg-[var(--p-accent-soft)] text-[var(--p-ink)]'
                  : 'bg-[var(--p-surface-muted)] text-[var(--p-ink-secondary)]'
              }`}
            >
              {wuduDone ? (
                <Check className="w-5 h-5" strokeWidth={2} />
              ) : (
                <Droplets className="w-5 h-5" strokeWidth={1.75} />
              )}
            </span>

            <div className="space-y-1">
              <h2 className="text-[15px] font-semibold leading-snug text-[var(--p-ink)]">
                {wuduDone ? 'Омовение отмечено' : 'Омовение не отмечено'}
              </h2>
              <p className="text-[13px] leading-[1.5] text-[var(--p-ink-secondary)]">
                {wuduDone
                  ? 'Вы готовы к молитве. Можно запускать суфлёр на коврике для текущего намаза.'
                  : 'Перед намазом совершите малое или полное омовение, либо отметьте, если уже готовы.'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={onToggleWudu}
              className={`w-full min-h-[48px] px-4 rounded-[15px] text-[14px] font-medium flex items-center justify-center gap-2 transition-colors duration-150 active:scale-[0.985] cursor-pointer whitespace-nowrap ${
                wuduDone
                  ? 'bg-[var(--p-surface-muted)] text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)] border border-[var(--p-border)]'
                  : 'bg-[var(--p-accent-soft)] hover:brightness-95 text-[var(--p-ink)] border border-[var(--p-border)]'
              }`}
            >
              <Check className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span>{wuduDone ? 'Снять отметку омовения' : 'Отметить омовение'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                unlockAudio();
                onStartAblution('ghusl');
              }}
              className="w-full min-h-[44px] px-4 rounded-[14px] bg-[var(--p-surface-muted)]/80 hover:bg-[var(--p-surface-muted)] border border-[var(--p-border)] text-[13.5px] font-medium text-[var(--p-ink)] flex items-center justify-between gap-2 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--p-accent-line)] shrink-0" strokeWidth={1.8} />
                <span>Полное омовение (Гусль)</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--p-ink-muted)] shrink-0" strokeWidth={1.85} />
            </button>
          </div>
        </motion.section>
      </div>

      {/* Bottom Dynamic Primary CTA */}
      <motion.div
        initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: d, delay: step * 3.1, ease: EASE_OUT }}
        className="pt-2 border-t border-[var(--p-border)]/70 space-y-1.5 shrink-0"
      >
        <AnimatePresence mode="wait" initial={false}>
          {!wuduDone ? (
            <motion.button
              key="cta-wudu"
              type="button"
              onClick={() => {
                unlockAudio();
                onStartAblution('wudu');
              }}
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              whileTap={prefersReduced ? undefined : { scale: 0.985 }}
              className="group w-full min-h-[54px] px-5 rounded-[18px] bg-[var(--p-cta-bg)] hover:bg-[var(--p-cta-hover)] text-[var(--p-cta-text)] text-[14.5px] font-medium flex items-center justify-center gap-2.5 shadow-[0_12px_24px_-14px_rgba(36,33,31,0.4)] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Начать подготовку и омовение</span>
              <ArrowRight
                className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={1.85}
              />
            </motion.button>
          ) : (
            <motion.button
              key={`cta-namaz-${activePrayer.id}`}
              type="button"
              onClick={() => {
                unlockAudio();
                onStartAutoNamaz(activePrayer);
              }}
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              whileTap={prefersReduced ? undefined : { scale: 0.985 }}
              className="group w-full min-h-[54px] px-5 rounded-[18px] bg-[var(--p-cta-bg)] hover:bg-[var(--p-cta-hover)] text-[var(--p-cta-text)] text-[14.5px] font-medium flex items-center justify-center gap-2.5 shadow-[0_12px_24px_-14px_rgba(36,33,31,0.4)] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Play className="w-4 h-4 shrink-0 fill-current" strokeWidth={1.8} />
              <span>Запустить Авто-Намаз {activePrayer.name}</span>
            </motion.button>
          )}
        </AnimatePresence>

        <p className="text-center text-[11.5px] text-[var(--p-ink-muted)]">
          {!wuduDone
            ? 'Малое (Вуду) и полное (Гусль) с единым темпом и звуком'
            : 'Объёмная визуализация, караоке-суфлёр и звуковой сигнал'}
        </p>
      </motion.div>
    </motion.div>
  );
}
