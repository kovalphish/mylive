import { motion, useReducedMotion } from 'motion/react';

interface PathMarkProps {
  duration?: number;
  delay?: number;
  size?: 'sm' | 'md';
}

export function PathMark({ duration = 0.85, delay = 0.15, size = 'md' }: PathMarkProps) {
  const prefersReduced = useReducedMotion();
  const dimensions = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';

  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${dimensions} shrink-0`}
      aria-hidden="true"
    >
      <motion.circle
        cx="18"
        cy="18"
        r="15.5"
        stroke="currentColor"
        strokeOpacity="0.16"
        strokeWidth="1.2"
        strokeDasharray="2.5 4.2"
        initial={prefersReduced ? { opacity: 1 } : { opacity: 0, rotate: -18 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ duration: duration * 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M10.5 23.5C13.2 21.8 14.8 18.8 17.8 16.4C20.5 14.2 22.8 13.4 25.8 12.2"
        stroke="var(--p-accent-line)"
        strokeWidth="1.75"
        strokeLinecap="round"
        initial={prefersReduced ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration, delay: delay + 0.08, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.circle
        cx="25.8"
        cy="12.2"
        r="2.2"
        fill="currentColor"
        initial={prefersReduced ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: delay + duration * 0.72, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}
