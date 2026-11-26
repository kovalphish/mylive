import { motion, useReducedMotion } from 'motion/react';
import { READING_SPEEDS, type ReadingSpeedId } from '../data/prayerData';

interface KaraokeTextProps {
  syllables: string[];
  /** Elapsed milliseconds within the current step */
  elapsedMs: number;
  /** Uniform reading speed preset */
  speed: ReadingSpeedId;
  /** Number of spoken repetitions during this step */
  repeats?: number;
  size?: 'lg' | 'xl';
}

export function KaraokeText({
  syllables,
  elapsedMs,
  speed,
  repeats = 1,
  size = 'xl',
}: KaraokeTextProps) {
  const prefersReduced = useReducedMotion();
  const cfg = READING_SPEEDS[speed];
  const safeRepeats = Math.max(1, repeats);

  const speakMs = Math.max(1, syllables.length) * cfg.msPerSyllable;
  const cycleBlockMs = speakMs + cfg.repeatPauseMs;

  // Give a calm lead-in pause to take posture before the first syllable begins highlighting
  const speakingElapsedMs = Math.max(0, elapsedMs - cfg.leadInPauseMs);

  // Determine exact current repeat index and exact continuous syllable cursor
  const rawCycleIndex = Math.floor(speakingElapsedMs / cycleBlockMs);
  const currentRepeat = Math.min(safeRepeats, rawCycleIndex + 1);
  const timeInsideCycle = Math.max(0, speakingElapsedMs - (currentRepeat - 1) * cycleBlockMs);

  // Every syllable takes the EXACT same cfg.msPerSyllable across every step in the app
  const cursor = timeInsideCycle / cfg.msPerSyllable;

  const textSizeClass =
    size === 'xl'
      ? 'text-[26px] sm:text-[27px] leading-[1.36]'
      : 'text-[23px] sm:text-[24px] leading-[1.38]';

  return (
    <div className="w-full flex flex-col items-center gap-2.5">
      <div
        className={`font-semibold tracking-[-0.015em] text-center text-balance ${textSizeClass}`}
      >
        {syllables.map((part, idx) => {
          const fill = prefersReduced ? 1 : Math.max(0, Math.min(1, cursor - idx));
          const isActive = !prefersReduced && fill > 0.02 && fill < 0.99;
          const isSpoken = fill >= 0.99;

          const hasTrailingSpace = part.endsWith(' ');
          const displayPart = hasTrailingSpace ? part.slice(0, -1) : part;

          return (
            <span key={`${idx}-${part}`} className="inline">
              <span className="relative inline-block align-baseline px-[1px]">
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-[2px] h-[38%] rounded-[5px] bg-[var(--p-accent-soft)] origin-left"
                  initial={false}
                  animate={{
                    scaleX: fill,
                    opacity: isActive ? 0.95 : isSpoken ? 0.45 : 0,
                  }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                />

                <span className="relative text-[var(--p-ink)]/28">{displayPart}</span>

                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 px-[1px] text-[var(--p-ink)]"
                  initial={false}
                  animate={{
                    opacity: Math.max(0.05, fill),
                    y: isActive ? -1 : 0,
                  }}
                  transition={{ duration: 0.1, ease: 'easeOut' }}
                >
                  {displayPart}
                </motion.span>
              </span>
              {hasTrailingSpace && ' '}
            </span>
          );
        })}
      </div>

      {safeRepeats > 1 && (
        <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--p-ink-muted)] tabular-nums">
          <span>
            Повтор {currentRepeat} из {safeRepeats}
          </span>
          <span className="flex items-center gap-1" aria-hidden="true">
            {Array.from({ length: safeRepeats }).map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                  i < currentRepeat ? 'bg-[var(--p-cta-bg)]' : 'bg-[var(--p-border)]'
                }`}
              />
            ))}
          </span>
        </div>
      )}
    </div>
  );
}
