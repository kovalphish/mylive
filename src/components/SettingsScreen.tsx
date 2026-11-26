import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  Check,
  Clock,
  Download,
  Loader2,
  MapPin,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { PALETTE_ORDER, PASTEL_PALETTES, type PaletteId } from '../palettes';
import {
  CITY_OPTIONS,
  READING_SPEEDS,
  READING_SPEED_ORDER,
  getCityClock,
  type CityConfig,
  type ReadingSpeedId,
} from '../data/prayerData';
import { downloadProjectForVercel, type ExportResult } from '../utils/exportVercelZip';
import { unlockAudio } from '../utils/soundCues';

interface SettingsScreenProps {
  paletteId: PaletteId;
  onSelectPalette: (id: PaletteId) => void;
  city: CityConfig;
  onSelectCity: (cityId: string) => void;
  readingSpeed: ReadingSpeedId;
  onSelectSpeed: (speed: ReadingSpeedId) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onBack: () => void;
}

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const PALETTE_PREVIEW_SWATCHES: Record<PaletteId, [string, string, string]> = {
  dawn: ['bg-[#F4DFD0]', 'bg-[#DFEAE2]', 'bg-[#C99C84]'],
  sage: ['bg-[#D8E7DC]', 'bg-[#E9E6DC]', 'bg-[#84A38E]'],
  lavender: ['bg-[#E5DFF0]', 'bg-[#EFE4D8]', 'bg-[#9D91B8]'],
};

export function SettingsScreen({
  paletteId,
  onSelectPalette,
  city,
  onSelectCity,
  readingSpeed,
  onSelectSpeed,
  soundEnabled,
  onToggleSound,
  onBack,
}: SettingsScreenProps) {
  const prefersReduced = useReducedMotion();
  const [now, setNow] = useState<Date>(() => new Date());
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [exportInfo, setExportInfo] = useState<ExportResult | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const cityClock = useMemo(() => getCityClock(city.timeZone, now), [city.timeZone, now]);

  const handleDownloadVercel = async () => {
    if (exportStatus === 'loading') return;
    setExportStatus('loading');
    try {
      const result = await downloadProjectForVercel();
      setExportInfo(result);
      setExportStatus('done');
    } catch {
      setExportStatus('error');
    }
  };

  return (
    <motion.div
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: 16 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      className="relative z-10 flex-1 flex flex-col min-h-0"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between -mx-2 pb-2 shrink-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="Вернуться назад"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[var(--p-ink)] hover:bg-[var(--p-surface-muted)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-[19px] h-[19px]" strokeWidth={1.8} />
        </button>

        <h1 className="font-display text-[25px] leading-none font-semibold text-[var(--p-ink)]">
          Настройки
        </h1>

        <span className="w-[44px]" aria-hidden="true" />
      </div>

      {/* Scrollable Settings Sections */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-5 pt-2 pb-4 pr-0.5">
        {/* Section 1: Theme Switcher */}
        <section aria-label="Тема оформления" className="space-y-2.5">
          <div className="text-[12.5px] font-semibold text-[var(--p-ink-secondary)] px-0.5">
            Пастельная тема
          </div>

          <div className="space-y-2">
            {PALETTE_ORDER.map((id) => {
              const item = PASTEL_PALETTES[id];
              const isSelected = paletteId === id;
              const dots = PALETTE_PREVIEW_SWATCHES[id];

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectPalette(id)}
                  aria-pressed={isSelected}
                  className={`w-full min-h-[60px] px-4 py-3 rounded-[18px] border text-left flex items-center justify-between gap-3 transition-colors duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--p-surface)] border-[var(--p-accent-line)] shadow-[0_8px_20px_-16px_rgba(36,33,31,0.22)]'
                      : 'bg-[var(--p-surface)]/65 border-[var(--p-border)] hover:bg-[var(--p-surface)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center -space-x-1.5 shrink-0" aria-hidden="true">
                      <span className={`w-5 h-5 rounded-full border border-white/80 ${dots[0]}`} />
                      <span className={`w-5 h-5 rounded-full border border-white/80 ${dots[1]}`} />
                      <span className={`w-5 h-5 rounded-full border border-white/80 ${dots[2]}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold text-[var(--p-ink)]">
                        {item.name}
                      </div>
                      <div className="text-[12px] text-[var(--p-ink-muted)] truncate">
                        {item.mood}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[var(--p-cta-bg)] text-[var(--p-cta-text)]'
                        : 'border border-[var(--p-border)]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={2.3} />}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 2: City & Live Time */}
        <section aria-label="Город и точное время" className="space-y-2.5">
          <div className="text-[12.5px] font-semibold text-[var(--p-ink-secondary)] px-0.5">
            Город и расписание намазов
          </div>

          <div className="rounded-[20px] bg-[var(--p-surface)] border border-[var(--p-border)] p-3.5 space-y-2.5">
            <div className="relative">
              <MapPin
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--p-accent-line)]"
                strokeWidth={1.9}
              />
              <select
                aria-label="Выбор города"
                value={city.id}
                onChange={(e) => onSelectCity(e.target.value)}
                className="w-full min-h-[44px] pl-9 pr-3 rounded-[13px] bg-[var(--p-surface-muted)]/75 border border-[var(--p-border)] text-[14px] font-medium text-[var(--p-ink)] focus:outline-none focus:border-[var(--p-focus)] cursor-pointer"
              >
                {CITY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.country})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between px-1 text-[12.5px]">
              <span className="flex items-center gap-1.5 text-[var(--p-ink-muted)]">
                <Clock className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span>Точное время</span>
              </span>
              <span className="font-mono-code font-semibold text-[var(--p-ink)] tabular-nums">
                {cityClock.timeWithSeconds}
              </span>
            </div>
          </div>
        </section>

        {/* Section 3: Prompter Speed & Transition Sound */}
        <section aria-label="Суфлёр и звук" className="space-y-2.5">
          <div className="text-[12.5px] font-semibold text-[var(--p-ink-secondary)] px-0.5">
            Суфлёр и звуковой сигнал
          </div>

          <div className="rounded-[20px] bg-[var(--p-surface)] border border-[var(--p-border)] p-3.5 space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between text-[12.5px] px-0.5">
                <span className="text-[var(--p-ink-secondary)]">Скорость подсветки</span>
                <span className="text-[var(--p-ink-muted)]">
                  {READING_SPEEDS[readingSpeed].label}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1 p-1 rounded-[13px] bg-[var(--p-surface-muted)] border border-[var(--p-border)]">
                {READING_SPEED_ORDER.map((id) => {
                  const preset = READING_SPEEDS[id];
                  const isActive = readingSpeed === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onSelectSpeed(id)}
                      className={`min-h-[38px] rounded-[9px] text-[12.5px] font-semibold tabular-nums transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[var(--p-surface)] text-[var(--p-ink)] shadow-sm'
                          : 'text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)]'
                      }`}
                    >
                      {preset.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2.5 border-t border-[var(--p-border)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[var(--p-ink)] shrink-0" strokeWidth={1.85} />
                ) : (
                  <VolumeX
                    className="w-4 h-4 text-[var(--p-ink-muted)] shrink-0"
                    strokeWidth={1.85}
                  />
                )}
                <span className="text-[13.5px] font-medium text-[var(--p-ink)]">
                  Звук при смене действия
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  unlockAudio();
                  onToggleSound();
                }}
                aria-pressed={soundEnabled}
                className={`min-h-[36px] px-3.5 rounded-[11px] text-[12.5px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  soundEnabled
                    ? 'bg-[var(--p-cta-bg)] text-[var(--p-cta-text)]'
                    : 'bg-[var(--p-surface-muted)] text-[var(--p-ink-secondary)] border border-[var(--p-border)]'
                }`}
              >
                {soundEnabled ? 'Включён' : 'Выключен'}
              </button>
            </div>
          </div>
        </section>

        {/* Section 4: Export Complete Site for Vercel */}
        <section aria-label="Экспорт сайта для Vercel" className="space-y-2.5">
          <div className="text-[12.5px] font-semibold text-[var(--p-ink-secondary)] px-0.5">
            Публикация на Vercel
          </div>

          <div className="rounded-[22px] bg-[var(--p-surface)] border border-[var(--p-border)] p-4 space-y-3">
            <div className="space-y-1">
              <h2 className="text-[14.5px] font-semibold text-[var(--p-ink)]">
                Скачать весь сайт для Vercel
              </h2>
              <p className="text-[12.5px] leading-[1.5] text-[var(--p-ink-secondary)]">
                Полный архив проекта (код, иллюстрации, <span className="font-mono-code">vercel.json</span> и
                инструкция). Распакуйте и загрузите в GitHub → Vercel или выполните{' '}
                <span className="font-mono-code">npx vercel</span>.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadVercel}
              disabled={exportStatus === 'loading'}
              className="w-full min-h-[50px] px-4 rounded-[15px] bg-[var(--p-cta-bg)] hover:bg-[var(--p-cta-hover)] text-[var(--p-cta-text)] text-[14px] font-medium flex items-center justify-center gap-2 transition-colors active:scale-[0.985] disabled:opacity-70 cursor-pointer whitespace-nowrap"
            >
              {exportStatus === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  <span>Собираем архив…</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" strokeWidth={1.9} />
                  <span>Скачать архив для Vercel (.zip)</span>
                </>
              )}
            </button>

            {exportStatus === 'done' && exportInfo && (
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--p-ink)]">
                <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />
                <span>
                  Скачано: put30-vercel.zip ({exportInfo.fileCount} файлов · {exportInfo.sizeKb}{' '}
                  КБ)
                </span>
              </div>
            )}

            {exportStatus === 'error' && (
              <p role="alert" className="text-[12px] font-medium text-[#9F3D34]">
                Не удалось собрать архив. Попробуйте ещё раз.
              </p>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
