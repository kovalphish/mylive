import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Gauge, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import {
  GHUSL_STEPS,
  READING_SPEEDS,
  WUDU_STEPS,
  computeStepDurationMs,
  formatMmSs,
  type AblutionMode,
  type ReadingSpeedId,
} from '../data/prayerData';
import { playActionChangeChime, playCompleteChime, unlockAudio } from '../utils/soundCues';
import { WuduGlyph } from './PostureGlyph';
import { KaraokeText } from './KaraokeText';

interface WuduTrainerScreenProps {
  mode: AblutionMode;
  onModeChange: (mode: AblutionMode) => void;
  readingSpeed: ReadingSpeedId;
  onCycleSpeed: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onBack: () => void;
  onComplete: () => void;
}

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function WuduTrainerScreen({
  mode,
  onModeChange,
  readingSpeed,
  onCycleSpeed,
  soundEnabled,
  onToggleSound,
  onBack,
  onComplete,
}: WuduTrainerScreenProps) {
  const prefersReduced = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const [stepElapsedMs, setStepElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  const lastTickRef = useRef<number | null>(null);
  const prevStepRef = useRef(0);
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const steps = mode === 'ghusl' ? GHUSL_STEPS : WUDU_STEPS;

  // Reset step cleanly when toggling between Малое (Вуду) and Полное (Гусль)
  const handleSelectMode = (nextMode: AblutionMode) => {
    if (nextMode === mode) return;
    unlockAudio();
    prevStepRef.current = 0;
    setStepIndex(0);
    setStepElapsedMs(0);
    setIsRunning(true);
    onModeChange(nextMode);
  };

  // Every step uses the exact same uniform ms-per-syllable tempo
  const stepDurationsMs = useMemo(
    () =>
      steps.map((s) => computeStepDurationMs(s.syllables.length, s.repeats, readingSpeed)),
    [steps, readingSpeed],
  );

  const totalSessionMs = useMemo(
    () => stepDurationsMs.reduce((sum, ms) => sum + ms, 0),
    [stepDurationsMs],
  );

  const safeIndex = Math.min(stepIndex, steps.length - 1);
  const currentStep = steps[safeIndex];
  const stepDurationMs = stepDurationsMs[safeIndex];
  const isLastStep = safeIndex === steps.length - 1;

  // Acoustic transition chime whenever the action changes
  useEffect(() => {
    if (prevStepRef.current !== safeIndex) {
      prevStepRef.current = safeIndex;
      if (soundEnabledRef.current) {
        playActionChangeChime();
      }
    }
  }, [safeIndex]);

  // Smooth 60fps clock driving uniform syllable karaoke
  useEffect(() => {
    if (!isRunning) {
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

      setStepElapsedMs((prev) => {
        const next = prev + delta;
        if (next >= stepDurationMs) {
          if (safeIndex < steps.length - 1) {
            setStepIndex((idx) => idx + 1);
            return 0;
          }
          setIsRunning(false);
          if (soundEnabledRef.current) {
            playCompleteChime();
          }
          return stepDurationMs;
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
  }, [isRunning, safeIndex, steps.length, stepDurationMs]);

  const priorMs = stepDurationsMs.slice(0, safeIndex).reduce((sum, ms) => sum + ms, 0);
  const stepProgress = Math.min(1, stepElapsedMs / stepDurationMs);
  const remainingTotalSec = Math.max(
    0,
    Math.ceil((totalSessionMs - (priorMs + stepElapsedMs)) / 1000),
  );

  const goPrev = () => {
    unlockAudio();
    if (safeIndex > 0) {
      setStepIndex((idx) => idx - 1);
      setStepElapsedMs(0);
    }
  };

  const goNext = () => {
    unlockAudio();
    if (!isLastStep) {
      setStepIndex((idx) => idx + 1);
      setStepElapsedMs(0);
    } else {
      if (soundEnabled) playCompleteChime();
      onComplete();
    }
  };

  return (
    <motion.div
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
      className="relative z-10 flex-1 flex flex-col justify-between gap-2.5"
    >
      {/* Top Bar + Mode Switcher (Малое / Полное) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between -mx-2 gap-1">
          <button
            type="button"
            onClick={onBack}
            aria-label="Закрыть тренажёр омовения"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[var(--p-ink)] hover:bg-[var(--p-surface-muted)] transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-[19px] h-[19px]" strokeWidth={1.8} />
          </button>

          <div className="text-center min-w-0">
            <div className="text-[13px] font-semibold text-[var(--p-ink)] truncate">
              {mode === 'ghusl' ? 'Полное омовение' : 'Малое омовение'} ·{' '}
              {formatMmSs(remainingTotalSec)}
            </div>
            <div className="text-[11px] text-[var(--p-ink-muted)] tabular-nums">
              Шаг {safeIndex + 1} из {steps.length} · {currentStep.repeat}
            </div>
          </div>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                unlockAudio();
                setStepElapsedMs(0);
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

        {/* Segmented Switch: Малое (Вуду) / Полное (Гусль) */}
        <div
          role="tablist"
          aria-label="Вид омовения"
          className="grid grid-cols-2 gap-1 p-1 rounded-[13px] bg-[var(--p-surface-muted)] border border-[var(--p-border)]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'wudu'}
            onClick={() => handleSelectMode('wudu')}
            className={`min-h-[36px] rounded-[9px] text-[12.5px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'wudu'
                ? 'bg-[var(--p-surface)] text-[var(--p-ink)] shadow-sm'
                : 'text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)]'
            }`}
          >
            Малое (Вуду)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'ghusl'}
            onClick={() => handleSelectMode('ghusl')}
            className={`min-h-[36px] rounded-[9px] text-[12.5px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'ghusl'
                ? 'bg-[var(--p-surface)] text-[var(--p-ink)] shadow-sm'
                : 'text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)]'
            }`}
          >
            Полное (Гусль)
          </button>
        </div>

        {/* 8-Step Hairline Progress Segments */}
        <div className="grid grid-cols-8 gap-1.5" aria-hidden="true">
          {steps.map((s, idx) => {
            const ratio = idx < safeIndex ? 1 : idx === safeIndex ? stepProgress : 0;
            return (
              <div
                key={s.id}
                className="h-[3px] rounded-full bg-[var(--p-border)] overflow-hidden"
              >
                <motion.div
                  className="h-full w-full origin-left rounded-full bg-[var(--p-cta-bg)]"
                  initial={false}
                  animate={{ scaleX: ratio }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Stage: Action Card + Huge Uniform-Speed Karaoke */}
      <div className="flex-1 flex flex-col justify-between gap-3 py-0.5 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="flex-1 flex flex-col justify-between gap-3"
          >
            {/* Compact Top Action Visual */}
            <div className="rounded-[22px] bg-[var(--p-surface)]/85 border border-[var(--p-border)] px-4 py-3 flex items-center gap-3.5">
              <div className="w-[54px] h-[54px] rounded-[15px] bg-[var(--p-surface-muted)] flex items-center justify-center shrink-0">
                <WuduGlyph type={currentStep.glyph} />
              </div>
              <div className="min-w-0 space-y-0.5">
                <h2 className="font-display text-[22px] leading-[1.08] font-semibold text-[var(--p-ink)]">
                  {currentStep.title}
                </h2>
                <p className="text-[12px] leading-[1.42] text-[var(--p-ink-secondary)]">
                  {currentStep.instruction}
                </p>
              </div>
            </div>

            {/* Primary Focus: Huge Karaoke Words & Pronunciation */}
            <div className="flex-1 rounded-[26px] bg-[var(--p-surface)] border border-[var(--p-border)] px-5 py-4 flex flex-col items-center justify-center text-center gap-3 shadow-[0_14px_34px_-26px_rgba(36,33,31,0.18)]">
              <span className="text-[11.5px] font-medium text-[var(--p-ink-muted)]">
                Произношение · темп {READING_SPEEDS[readingSpeed].shortLabel}
              </span>

              {currentStep.arabic && (
                <div
                  dir="rtl"
                  className="text-[21px] leading-[1.48] font-medium text-[var(--p-accent-line)]"
                >
                  {currentStep.arabic}
                </div>
              )}

              <KaraokeText
                syllables={currentStep.syllables}
                elapsedMs={stepElapsedMs}
                speed={readingSpeed}
                repeats={currentStep.repeats}
                size="xl"
              />

              <p className="text-[12.5px] leading-[1.45] text-[var(--p-ink-secondary)] max-w-[28ch]">
                {currentStep.meaning}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="space-y-1 pt-0.5">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={goPrev}
            disabled={safeIndex === 0}
            aria-label="Предыдущий шаг"
            className="min-h-[50px] min-w-[50px] rounded-[16px] bg-[var(--p-surface)] border border-[var(--p-border)] flex items-center justify-center text-[var(--p-ink)] disabled:opacity-35 transition-opacity cursor-pointer disabled:cursor-default"
          >
            <ArrowLeft className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </button>

          <button
            type="button"
            onClick={() => {
              unlockAudio();
              setIsRunning((prev) => !prev);
            }}
            aria-label={isRunning ? 'Пауза' : 'Продолжить'}
            className="min-h-[50px] min-w-[50px] rounded-[16px] bg-[var(--p-surface)] border border-[var(--p-border)] flex items-center justify-center text-[var(--p-ink)] hover:bg-[var(--p-surface-muted)] transition-colors cursor-pointer"
          >
            {isRunning ? (
              <Pause className="w-[18px] h-[18px]" strokeWidth={1.8} />
            ) : (
              <Play className="w-[18px] h-[18px] ml-0.5" strokeWidth={1.8} />
            )}
          </button>

          <button
            type="button"
            onClick={goNext}
            className="flex-1 min-h-[50px] px-4 rounded-[16px] bg-[var(--p-cta-bg)] hover:bg-[var(--p-cta-hover)] text-[var(--p-cta-text)] text-[14px] font-medium flex items-center justify-center gap-2 transition-colors active:scale-[0.985] cursor-pointer whitespace-nowrap"
          >
            {isLastStep ? (
              <>
                <Check className="w-4 h-4" strokeWidth={2} />
                <span>Завершить омовение</span>
              </>
            ) : (
              <>
                <span>Следующий шаг</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.85} />
              </>
            )}
          </button>
        </div>

        {!isLastStep && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                unlockAudio();
                if (soundEnabled) playCompleteChime();
                onComplete();
              }}
              className="min-h-[36px] px-3 text-[12px] text-[var(--p-ink-muted)] hover:text-[var(--p-ink)] transition-colors cursor-pointer whitespace-nowrap"
            >
              Завершить и отметить омовение
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
