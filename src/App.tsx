import { useState } from 'react';
import { Check, Download, Loader2, RotateCcw } from 'lucide-react';
import {
  MOTION_PRESETS,
  PALETTE_ORDER,
  PASTEL_PALETTES,
  type MotionPace,
  type PaletteId,
} from './palettes';
import { IPhoneFrame } from './components/IPhoneFrame';
import { StartScreenFlow, type ScreenStep } from './components/StartScreenFlow';
import { unlockAudio } from './utils/soundCues';
import { downloadProjectForVercel } from './utils/exportVercelZip';

const SCREEN_TABS: { id: ScreenStep; label: string }[] = [
  { id: 'welcome', label: 'Старт' },
  { id: 'register', label: 'Регистрация' },
  { id: 'home', label: 'Главное' },
  { id: 'wudu', label: 'Омовение' },
  { id: 'prompter', label: 'Суфлёр' },
  { id: 'settings', label: 'Настройки' },
];

const PACE_ORDER: MotionPace[] = ['crisp', 'calm', 'meditative'];

export default function App() {
  const [paletteId, setPaletteId] = useState<PaletteId>('dawn');
  const [pace, setPace] = useState<MotionPace>('calm');
  const [screen, setScreen] = useState<ScreenStep>('home');
  const [wuduDone, setWuduDone] = useState(false);
  const [animationKey, setAnimationKey] = useState(1);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const activePalette = PASTEL_PALETTES[paletteId];
  const activeMotion = MOTION_PRESETS[pace];

  const handleReplay = () => {
    setScreen('welcome');
    setAnimationKey((prev) => prev + 1);
  };

  const handlePaletteSelect = (nextId: PaletteId) => {
    setPaletteId(nextId);
  };

  const handlePaceSelect = (nextPace: MotionPace) => {
    setPace(nextPace);
    setAnimationKey((prev) => prev + 1);
  };

  const handleCopyHex = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      window.setTimeout(() => {
        setCopiedHex((curr) => (curr === hex ? null : curr));
      }, 1400);
    } catch {
      setCopiedHex(hex);
      window.setTimeout(() => {
        setCopiedHex((curr) => (curr === hex ? null : curr));
      }, 1400);
    }
  };

  const handleQuickDownload = async () => {
    if (downloadingZip) return;
    setDownloadingZip(true);
    try {
      await downloadProjectForVercel();
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div
      data-palette={paletteId}
      className="min-h-[100dvh] w-full bg-[var(--p-studio)] text-[var(--p-ink)] transition-colors duration-500 flex items-center justify-center sm:px-8 sm:py-10"
    >
      <main className="w-full max-w-[1040px] flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
        {/* Dominant Focal Anchor: Live iPhone Screen */}
        <section
          aria-label="Интерфейс приложения Путь 30 для iPhone"
          className="w-full sm:w-auto shrink-0"
        >
          <IPhoneFrame>
            <StartScreenFlow
              paletteId={paletteId}
              onSelectPalette={handlePaletteSelect}
              palette={activePalette}
              motionPreset={activeMotion}
              animationKey={animationKey}
              screen={screen}
              onScreenChange={setScreen}
              wuduDone={wuduDone}
              onWuduDoneChange={setWuduDone}
            />
          </IPhoneFrame>
        </section>

        {/* Companion Minimalist Palette, Screen & Export Panel (visible on sm+) */}
        <aside className="hidden sm:flex flex-col w-full max-w-[430px] space-y-6 py-2">
          {/* Editorial Heading */}
          <div className="space-y-2 border-b border-[var(--p-border)] pb-5">
            <div className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--p-ink-muted)]">
              <span>iOS интерфейс</span>
              <span aria-hidden="true">·</span>
              <span>Путь Ислама</span>
              <span aria-hidden="true">·</span>
              <span>Минимализм</span>
            </div>
            <h1 className="font-display text-[44px] leading-[1.02] font-semibold tracking-[-0.015em] text-[var(--p-ink)]">
              Путь 30
            </h1>
            <p className="text-[14px] leading-[1.6] text-[var(--p-ink-secondary)]">
              Малое и полное омовение, 30-дневный календарь, объёмная визуализация, караоке-суфлёр
              с настройкой темпа и экспорт проекта на Vercel.
            </p>
          </div>

          {/* Interactive Screen Preview Switcher */}
          <div className="space-y-2.5">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-[14px] font-semibold text-[var(--p-ink)]">Экраны приложения</h2>
              <button
                type="button"
                onClick={() => setWuduDone((prev) => !prev)}
                className="text-[12px] font-medium text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)] underline underline-offset-4 decoration-[var(--p-accent-line)] cursor-pointer whitespace-nowrap"
              >
                {wuduDone ? 'Омовение: отмечено' : 'Омовение: не отмечено'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-[14px] bg-[var(--p-surface-muted)] border border-[var(--p-border)]">
              {SCREEN_TABS.map((tab) => {
                const isCurrent = screen === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      unlockAudio();
                      setScreen(tab.id);
                    }}
                    className={`min-h-[38px] px-2.5 rounded-[10px] text-[12.5px] font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                      isCurrent
                        ? 'bg-[var(--p-surface)] text-[var(--p-ink)] shadow-[0_2px_8px_-4px_rgba(36,33,31,0.18)]'
                        : 'text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pastel Palette Selector & Interactive Swatches */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-[14px] font-semibold text-[var(--p-ink)]">Пастельная палитра</h2>
              <span className="text-[12.5px] text-[var(--p-ink-muted)]">{activePalette.mood}</span>
            </div>

            <div
              role="tablist"
              aria-label="Выбор пастельной палитры"
              className="grid grid-cols-3 gap-1 p-1 rounded-[14px] bg-[var(--p-surface-muted)] border border-[var(--p-border)]"
            >
              {PALETTE_ORDER.map((id) => {
                const item = PASTEL_PALETTES[id];
                const isActive = paletteId === id;
                return (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={isActive}
                    type="button"
                    onClick={() => handlePaletteSelect(id)}
                    className={`min-h-[40px] px-3 rounded-[10px] text-[13px] font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[var(--p-surface)] text-[var(--p-ink)] shadow-[0_2px_8px_-4px_rgba(36,33,31,0.18)]'
                        : 'text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)]'
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>

            <div className="divide-y divide-[var(--p-border)] border-t border-b border-[var(--p-border)]">
              {activePalette.swatches.map((swatch, idx) => {
                const isCopied = copiedHex === swatch.hex;
                return (
                  <button
                    key={swatch.name}
                    type="button"
                    onClick={() => handleCopyHex(swatch.hex)}
                    className="w-full min-h-[42px] py-1.5 px-1 flex items-center justify-between gap-3 text-left hover:bg-[var(--p-surface)]/50 transition-colors duration-150 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-[8px] border border-[var(--p-border)] shrink-0 swatch-dot-${idx}`}
                      />
                      <div className="min-w-0">
                        <span className="text-[13px] font-medium text-[var(--p-ink)]">
                          {swatch.name}
                        </span>
                        <span className="mx-2 text-[var(--p-ink-muted)]" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-[12px] text-[var(--p-ink-muted)]">{swatch.role}</span>
                      </div>
                    </div>

                    <span className="font-mono-code text-[12px] text-[var(--p-ink-secondary)] group-hover:text-[var(--p-ink)] flex items-center gap-1.5 shrink-0">
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" strokeWidth={2} />
                          <span>Скопировано</span>
                        </>
                      ) : (
                        swatch.hex
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Animation Choreography & Direct Vercel Export */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 grid grid-cols-3 gap-1 p-1 rounded-[14px] bg-[var(--p-surface-muted)] border border-[var(--p-border)]">
                {PACE_ORDER.map((id) => {
                  const preset = MOTION_PRESETS[id];
                  const isActive = pace === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handlePaceSelect(id)}
                      className={`min-h-[38px] px-2 rounded-[10px] text-[12px] font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-[var(--p-surface)] text-[var(--p-ink)] shadow-[0_2px_8px_-4px_rgba(36,33,31,0.18)]'
                          : 'text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleReplay}
                className="min-h-[46px] px-3.5 rounded-[14px] bg-[var(--p-surface)] hover:bg-[var(--p-surface-muted)] border border-[var(--p-border)] text-[var(--p-ink)] text-[12.5px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.9} />
                <span>Старт</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleQuickDownload}
              disabled={downloadingZip}
              className="w-full min-h-[48px] px-4 rounded-[15px] bg-[var(--p-cta-bg)] hover:bg-[var(--p-cta-hover)] text-[var(--p-cta-text)] text-[13.5px] font-medium flex items-center justify-center gap-2 transition-colors active:scale-[0.985] disabled:opacity-70 cursor-pointer whitespace-nowrap"
            >
              {downloadingZip ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  <span>Собираем архив…</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" strokeWidth={1.9} />
                  <span>Скачать весь сайт для Vercel (.zip)</span>
                </>
              )}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
