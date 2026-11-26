import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Gauge,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  READING_SPEEDS,
  buildPrayerSequence,
  computeStepDurationMs,
  type PrayerInfo,
  type ReadingSpeedId,
} from '../data/prayerData';
import { playActionChangeChime, playCompleteChime, unlockAudio } from '../utils/soundCues';
import { AnimatedPrayerVisual } from './PostureGlyph';
import { KaraokeText } from './KaraokeText';

interface AutoNamazPrompterProps {
  prayer: PrayerInfo;
  readingSpeed: ReadingSpeedId;
  onCycleSpeed: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onExit: () => void;
  onComplete: (prayerId: PrayerInfo['id']) => void;
}

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function AutoNamazPrompter({
  prayer,
  readingSpeed,
  onCycleSpeed,
  soundEnabled,
  onToggleSound,
  onExit,
  onComplete,
}: AutoNamazPrompterProps) {
  const prefersReduced = useReducedMotion();
  const sequence = useMemo(() => buildPrayerSequence(prayer), [prayer]);

  const [index, setIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [finished, setFinished] = useState(false);

  const lastTickRef = useRef<number | null>(null);
  const prevIndexRef = useRef(0);
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const step = sequence[index];
  const nextStep = sequence[index + 1];

  // Uniform exact ms-per-syllable timing across every prayer step!
  const effectiveDurationMs = useMemo(
    () => computeStepDurationMs(step.syllables.length, step.repeats, readingSpeed),
    [step.syllables.length, step.repeats, readingSpeed],
  );

  // Acoustic chime on every step transition
  useEffect(() => {
    if (prevIndexRef.current !== index) {
      prevIndexRef.current = index;
      if (soundEnabledRef.current) {
        playActionChangeChime();
      }
    }
  }, [index]);

  // Smooth 60fps timer for uniform karaoke speed
  useEffect(() => {
    if (!isPlaying || finished) {
      lastTickRef.current = null;
      return;
    }

    let rafId = 0;

    const tick = (now: number) => {
      if (lastTickRef.current === null) {
        lastTickRef.current = now;
      }
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      setElapsedMs((prev) => {
        const next = prev + delta;
        if (next >= effectiveDurationMs) {
          if (index + 1 < sequence.length) {
            setIndex((curr) => curr + 1);
            return 0;
          }
          setFinished(true);
          setIsPlaying(false);
          if (soundEnabledRef.current) {
            playCompleteChime();
          }
          return effectiveDurationMs;
        }
        return next;
      });

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
      lastTickRef.current = null;
    };
  }, [isPlaying, finished, index, effectiveDurationMs, sequence.length]);

  const stepProgress = Math.min(1, elapsedMs / effectiveDurationMs);
  const overallProgress = finished
    ? 1
    : Math.min(1, (index + stepProgress) / sequence.length);
  const remainingSec = Math.max(1, Math.ceil((effectiveDurationMs - elapsedMs) / 1000));

  const handlePrev = () => {
    unlockAudio();
    if (finished) {
      setFinished(false);
      setElapsedMs(0);
      return;
    }
    if (index > 0) {
      setIndex((curr) => curr - 1);
      setElapsedMs(0);
    }
  };

  const handleNext = () => {
    unlockAudio();
    if (index + 1 < sequence.length) {
      setIndex((curr) => curr + 1);
      setElapsedMs(0);
    } else {
      setFinished(true);
      setIsPlaying(false);
      if (soundEnabled) playCompleteChime();
    }
  };

  return (
    <motion.div
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      className="absolute inset-0 z-20 bg-[var(--p-canvas)] text-[var(--p-ink)] flex flex-col justify-between px-5 pt-3 pb-5 sm:pt-2 sm:pb-3.5 gap-2.5"
    >
      {/* Top Bar: Exit · Prayer/Rakaat · Speed Button · Sound Toggle */}
      <div>
        <div className="flex items-center justify-between -mx-1.5 gap-1">
          <button
            type="button"
            onClick={onExit}
            aria-label="Выйти из суфлёра"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)] hover:bg-[var(--p-surface-muted)] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-[19px] h-[19px]" strokeWidth={1.8} />
          </button>

          <div className="text-center min-w-0">
            <div className="text-[13px] font-semibold text-[var(--p-ink)] truncate">
              Авто-Намаз · {prayer.name}
            </div>
            <div className="text-[11px] text-[var(--p-ink-muted)] tabular-nums">
              {finished
                ? 'Завершено'
                : `Ракаат ${step.rakaat} из ${step.totalRakaats} · ${remainingSec} сек`}
            </div>
          </div>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                unlockAudio();
                setElapsedMs(0);
                onCycleSpeed();
              }}
              aria-label={`Скорость чтения: ${READING_SPEEDS[readingSpeed].label}`}
              className="min-h-[44px] px-2 rounded-xl text-[12px] font-semibold text-[var(--p-ink)] hover:bg-[var(--p-surface-muted)] inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap tabular-nums"
            >
              <Gauge className="w-3.5 h-3.5 text-[var(--p-accent-line)]" strokeWidth={1.9} />
              <span>{READING_SPEEDS[readingSpeed].shortLabel}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                unlockAudio();
                onToggleSound();
              }}
              aria-label={soundEnabled ? 'Выключить звук перехода' : 'Включить звук перехода'}
              className="min-h-[44px] min-w-[40px] flex items-center justify-center rounded-full text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)] hover:bg-[var(--p-surface-muted)] transition-colors cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-[17px] h-[17px]" strokeWidth={1.8} />
              ) : (
                <VolumeX className="w-[17px] h-[17px] opacity-55" strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>

        {/* Continuous Mat Progress Hairline */}
        <div className="mt-1.5 h-[3px] w-full rounded-full bg-[var(--p-border)] overflow-hidden">
          <motion.div
            className="h-full w-full origin-left rounded-full bg-[var(--p-cta-bg)]"
            initial={false}
            animate={{ scaleX: overallProgress }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Two-Zone Split: TOP = Volumetric Movement Visual, BOTTOM = Huge Uniform Karaoke Prompter */}
      <div className="flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {!finished ? (
            <motion.div
              key={step.id}
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: EASE_OUT }}
              className="flex-1 flex flex-col gap-3 min-h-0"
            >
              {/* TOP BLOCK: Rich Volumetric Movement Illustration */}
              <section aria-label="Визуализация движения" className="shrink-0">
                <AnimatedPrayerVisual
                  posture={step.posture}
                  title={step.postureTitle}
                  cue={step.movementCue}
                />
              </section>

              {/* BOTTOM BLOCK: Huge Syllable-by-Syllable Karaoke Prompter */}
              <section
                aria-label="Суфлёр произношения"
                className="flex-1 rounded-[26px] bg-[var(--p-surface)] border border-[var(--p-border)] px-4 py-4 flex flex-col items-center justify-center text-center gap-2.5 shadow-[0_14px_32px_-26px_rgba(36,33,31,0.18)] overflow-y-auto"
              >
                <div
                  dir="rtl"
                  className="text-[19px] leading-[1.45] font-medium text-[var(--p-accent-line)]"
                >
                  {step.arabic}
                </div>

                <KaraokeText
                  syllables={step.syllables}
                  elapsedMs={elapsedMs}
                  speed={readingSpeed}
                  repeats={step.repeats}
                  size="xl"
                />

                <p className="text-[12px] leading-[1.4] text-[var(--p-ink-muted)] max-w-[30ch]">
                  {step.meaning}
                </p>

                {nextStep && (
                  <div className="pt-0.5 text-[11.5px] text-[var(--p-ink-muted)]">
                    Далее:{' '}
                    <span className="text-[var(--p-ink-secondary)]">{nextStep.postureTitle}</span>
                  </div>
                )}
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="prayer-finished"
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-5 px-2"
            >
              <div className="w-[82px] h-[82px] rounded-full bg-[var(--p-accent-soft)] flex items-center justify-center text-[var(--p-ink)]">
                <Check className="w-9 h-9" strokeWidth={1.7} />
              </div>
              <div className="space-y-2">
                <div className="text-[12.5px] font-medium text-[var(--p-ink-muted)]">
                  {prayer.name} · {prayer.rakaats} ракаата
                </div>
                <h2 className="font-display text-[36px] leading-[1.06] font-semibold text-[var(--p-ink)] text-balance">
                  Намаз завершён
                </h2>
                <p className="text-[14px] leading-[1.6] text-[var(--p-ink-secondary)] max-w-[28ch] mx-auto">
                  Пусть Всевышний примет ваш намаз. Шаг сегодняшнего дня отмечен в календаре.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div>
        {!finished ? (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrev}
              disabled={index === 0}
              aria-label="Предыдущее действие"
              className="min-h-[52px] min-w-[52px] rounded-[18px] bg-[var(--p-surface)] border border-[var(--p-border)] flex items-center justify-center text-[var(--p-ink)] disabled:opacity-35 transition-opacity cursor-pointer disabled:cursor-default"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.8} />
            </button>

            <button
              type="button"
              onClick={() => {
                unlockAudio();
                setIsPlaying((p) => !p);
              }}
              className="flex-1 min-h-[52px] px-5 rounded-[18px] bg-[var(--p-cta-bg)] hover:bg-[var(--p-cta-hover)] text-[var(--p-cta-text)] text-[15px] font-medium flex items-center justify-center gap-2 transition-colors active:scale-[0.985] cursor-pointer whitespace-nowrap"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" strokeWidth={1.9} />
                  <span>Пауза</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" strokeWidth={1.9} />
                  <span>Продолжить</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Следующее действие"
              className="min-h-[52px] min-w-[52px] rounded-[18px] bg-[var(--p-surface)] border border-[var(--p-border)] flex items-center justify-center text-[var(--p-ink)] hover:bg-[var(--p-surface-muted)] transition-colors cursor-pointer"
            >
              <ArrowRight className="w-5 h-5" strokeWidth={1.8} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onComplete(prayer.id)}
            className="w-full min-h-[54px] px-6 rounded-[18px] bg-[var(--p-cta-bg)] hover:bg-[var(--p-cta-hover)] text-[var(--p-cta-text)] text-[15px] font-medium flex items-center justify-center gap-2 transition-colors active:scale-[0.985] cursor-pointer whitespace-nowrap"
          >
            <span>Вернуться на главный экран</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
