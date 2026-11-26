import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import type { PrayerPostureType, WuduGlyphType } from '../data/prayerData';

export function WuduGlyph({ type }: { type: WuduGlyphType }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-11 h-11 text-[var(--p-ink)]"
      aria-hidden="true"
    >
      {type === 'intention' && (
        <>
          <path
            d="M32 12C32 12 20 26.5 20 35.5C20 42.1 25.4 47.5 32 47.5C38.6 47.5 44 42.1 44 35.5C44 26.5 32 12 32 12Z"
            stroke="var(--p-accent-line)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="36" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M26 53H38"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
      {type === 'hands' && (
        <>
          <path
            d="M22 36V21C22 19.6 23.1 18.5 24.5 18.5C25.9 18.5 27 19.6 27 21V31"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
          />
          <path
            d="M27 29V17.5C27 16.1 28.1 15 29.5 15C30.9 15 32 16.1 32 17.5V29"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
          />
          <path
            d="M32 29V19C32 17.6 33.1 16.5 34.5 16.5C35.9 16.5 37 17.6 37 19V31"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
          />
          <path
            d="M37 31V24.5C37 23.1 38.1 22 39.5 22C40.9 22 42 23.1 42 24.5V37C42 44.2 37.5 49 31.5 49C25.8 49 22 44.8 22 38.5V36"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
          />
          <path
            d="M15 26C17 24 18.5 24 20 26"
            stroke="var(--p-accent-line)"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M44 20C46 18 47.5 18 49 20"
            stroke="var(--p-accent-line)"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </>
      )}
      {type === 'mouth' && (
        <>
          <path
            d="M16 33C20.5 28.5 26 28.5 32 33C38 28.5 43.5 28.5 48 33"
            stroke="var(--p-accent-line)"
            strokeWidth="1.85"
            strokeLinecap="round"
          />
          <path
            d="M18 42C22 38 26.5 38 32 42C37.5 38 42 38 46 42"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
          />
          <circle cx="32" cy="19" r="3.5" stroke="currentColor" strokeWidth="1.65" />
          <path
            d="M32 12V13.5"
            stroke="var(--p-accent-line)"
            strokeWidth="1.65"
            strokeLinecap="round"
          />
        </>
      )}
      {type === 'face' && (
        <>
          <rect
            x="20"
            y="14"
            width="24"
            height="34"
            rx="12"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M15 24C12.5 28 12.5 34 15 38"
            stroke="var(--p-accent-line)"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M49 24C51.5 28 51.5 34 49 38"
            stroke="var(--p-accent-line)"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M27 36.5C29 38 35 38 37 36.5"
            stroke="currentColor"
            strokeOpacity="0.45"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
      {type === 'arms' && (
        <>
          <path
            d="M16 44L33 27L47 21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="33" cy="27" r="3" fill="var(--p-accent-line)" />
          <path
            d="M21 26C25 22 29 20 34 19"
            stroke="var(--p-accent-line)"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeDasharray="3 4"
          />
          <path
            d="M25 46C31 41 37 37 45 34"
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
      {type === 'head' && (
        <>
          <path
            d="M18 40C18 28.5 24.3 21 32 21C39.7 21 46 28.5 46 40"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M17 24C21.5 16.5 42.5 16.5 47 24"
            stroke="var(--p-accent-line)"
            strokeWidth="1.85"
            strokeLinecap="round"
          />
          <path
            d="M44 21L47.5 24.5L43 25.5"
            stroke="var(--p-accent-line)"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {type === 'feet' && (
        <>
          <path
            d="M24 16V36C24 41.5 28 44 35 44H44C46.2 44 48 42.2 48 40C48 38 46.5 36.5 44.5 36.2L35 34.5V16"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 49H48"
            stroke="var(--p-accent-line)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeDasharray="3 4"
          />
        </>
      )}
      {type === 'dua' && (
        <>
          <path
            d="M16 38C19 31 24 29 29 31L32 34L35 31C40 29 45 31 48 38"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24 45H40"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M32 14V21"
            stroke="var(--p-accent-line)"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M25 18L28 22"
            stroke="var(--p-accent-line)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M39 18L36 22"
            stroke="var(--p-accent-line)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
      {type === 'body' && (
        <>
          <circle cx="32" cy="17" r="5" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M21 31C21 26.5 25.5 24 32 24C38.5 24 43 26.5 43 31V47C43 49.2 41.2 51 39 51H25C22.8 51 21 49.2 21 47V31Z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M15 28C16.8 31 16.8 35 15 38"
            stroke="var(--p-accent-line)"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M49 28C47.2 31 47.2 35 49 38"
            stroke="var(--p-accent-line)"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </>
      )}
      {type === 'shower' && (
        <>
          <path
            d="M18 18C22 14 42 14 46 18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M22 25V34M22 40V46"
            stroke="var(--p-accent-line)"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M32 23V35M32 41V50"
            stroke="var(--p-accent-line)"
            strokeWidth="1.85"
            strokeLinecap="round"
          />
          <path
            d="M42 25V34M42 40V46"
            stroke="var(--p-accent-line)"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

interface PostureArtworkMeta {
  src: string;
  alt: string;
  scaleClass: string;
  directionHint?: 'up' | 'down' | 'turn';
}

const POSTURE_ARTWORKS: Record<PrayerPostureType, PostureArtworkMeta> = {
  takbir: {
    src: '/src/assets/images/namaz_takbir_1795659856825.jpg',
    alt: 'Объёмная визуализация: Такбират аль-ихрам — руки подняты к уровню ушей',
    scaleClass: 'scale-[1.04]',
    directionHint: 'up',
  },
  qiyam: {
    src: '/src/assets/images/namaz_qiyam_1795659855711.jpg',
    alt: 'Объёмная визуализация: Кыям — спокойное стояние со сложенными руками',
    scaleClass: 'scale-[1.04]',
  },
  ruku: {
    src: '/src/assets/images/namaz_ruku_1795659856460.jpg',
    alt: 'Объёмная визуализация: Руку — поясной поклон с ровной спиной и ладонями на коленях',
    scaleClass: 'scale-[1.04]',
    directionHint: 'down',
  },
  itidal: {
    src: '/src/assets/images/namaz_qiyam_1795659855711.jpg',
    alt: 'Объёмная визуализация: Итидаль — спокойное выпрямление в полный рост',
    scaleClass: 'scale-[1.04]',
    directionHint: 'up',
  },
  sujud: {
    src: '/src/assets/images/namaz_sujud_1795659862971.jpg',
    alt: 'Объёмная визуализация: Суджуд — земной поклон лбом и ладонями на коврике',
    scaleClass: 'scale-[1.34]',
    directionHint: 'down',
  },
  jalsa: {
    src: '/src/assets/images/namaz_jalsa_1795659863072.jpg',
    alt: 'Объёмная визуализация: Джальса — спокойное сидение на коврике',
    scaleClass: 'scale-[1.05]',
  },
  taslim: {
    src: '/src/assets/images/namaz_jalsa_1795659863072.jpg',
    alt: 'Объёмная визуализация: Таслим — поворот головы направо и налево',
    scaleClass: 'scale-[1.05]',
    directionHint: 'turn',
  },
};

/**
 * Rich volumetric fine-art prayer movement visualization with subtle animated directional cue.
 */
export function AnimatedPrayerVisual({
  posture,
  title,
  cue,
}: {
  posture: PrayerPostureType;
  title: string;
  cue: string;
}) {
  const prefersReduced = useReducedMotion();
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const meta = POSTURE_ARTWORKS[posture];

  return (
    <div className="relative w-full h-[186px] rounded-[24px] overflow-hidden border border-[var(--p-border)] artwork-fallback shadow-[0_14px_30px_-24px_rgba(36,33,31,0.28)]">
      {failedSrc !== meta.src && (
        <motion.img
          key={meta.src}
          src={meta.src}
          alt={meta.alt}
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(meta.src)}
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0.72, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full h-full object-cover object-center ${meta.scaleClass}`}
        />
      )}

      {/* Measured contrast scrim for crisp legibility over volumetric scene */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1F1C1A]/80 via-[#1F1C1A]/20 to-transparent"
      />

      {/* Subtle animated movement direction cue in top-right corner */}
      {meta.directionHint && (
        <motion.div
          aria-hidden="true"
          animate={
            prefersReduced
              ? undefined
              : meta.directionHint === 'up'
                ? { y: [2, -3, 2] }
                : meta.directionHint === 'down'
                  ? { y: [-2, 3, -2] }
                  : { x: [-3, 3, -3] }
          }
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm text-[#24211F] flex items-center justify-center shadow-sm"
        >
          {meta.directionHint === 'up' && <ArrowUp className="w-4 h-4" strokeWidth={2} />}
          {meta.directionHint === 'down' && <ArrowDown className="w-4 h-4" strokeWidth={2} />}
          {meta.directionHint === 'turn' && (
            <div className="flex items-center">
              <ArrowLeft className="w-3.5 h-3.5 -mr-0.5" strokeWidth={2} />
              <ArrowRight className="w-3.5 h-3.5 -ml-0.5" strokeWidth={2} />
            </div>
          )}
        </motion.div>
      )}

      {/* Posture Title & Concise Movement Instruction */}
      <div className="absolute inset-x-0 bottom-0 px-4 pb-3.5 pt-8 text-left">
        <h2 className="font-display text-[25px] leading-[1.04] font-semibold text-[#FAF8F5] tracking-[0.005em]">
          {title}
        </h2>
        <p className="mt-1 text-[12px] leading-[1.35] text-[#FAF8F5]/88 line-clamp-2">
          {cue}
        </p>
      </div>
    </div>
  );
}
