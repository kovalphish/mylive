import type { ReactNode } from 'react';

interface IPhoneFrameProps {
  children: ReactNode;
}

export function IPhoneFrame({ children }: IPhoneFrameProps) {
  return (
    <div className="w-full sm:w-auto flex items-center justify-center">
      {/* Outer titanium shell on sm+, full-bleed native canvas on mobile */}
      <div className="relative w-full min-h-[100dvh] sm:min-h-0 sm:w-[378px] sm:h-[788px] sm:rounded-[54px] sm:p-[11px] sm:bg-gradient-to-b sm:from-[#D5D0C8] sm:via-[#B8B2A9] sm:to-[#CFCAC1] sm:shadow-[0_32px_70px_-24px_rgba(36,33,31,0.22),0_10px_24px_-12px_rgba(36,33,31,0.12)] transition-colors duration-500">
        {/* Subtle physical side buttons (desktop mockup only) */}
        <span
          aria-hidden="true"
          className="hidden sm:block absolute -left-[2.5px] top-[122px] w-[3px] h-[28px] rounded-l-sm bg-[#B9B3AA]"
        />
        <span
          aria-hidden="true"
          className="hidden sm:block absolute -left-[2.5px] top-[168px] w-[3px] h-[52px] rounded-l-sm bg-[#B9B3AA]"
        />
        <span
          aria-hidden="true"
          className="hidden sm:block absolute -left-[2.5px] top-[232px] w-[3px] h-[52px] rounded-l-sm bg-[#B9B3AA]"
        />
        <span
          aria-hidden="true"
          className="hidden sm:block absolute -right-[2.5px] top-[186px] w-[3px] h-[72px] rounded-r-sm bg-[#B9B3AA]"
        />

        {/* Inner black glass bezel */}
        <div className="relative w-full min-h-[100dvh] sm:min-h-0 sm:h-full sm:rounded-[44px] sm:bg-[#191817] sm:p-[2px] overflow-hidden">
          {/* Active iOS screen viewport */}
          <div className="relative w-full min-h-[100dvh] sm:min-h-0 sm:h-full sm:rounded-[42px] bg-[var(--p-canvas)] text-[var(--p-ink)] overflow-hidden flex flex-col transition-colors duration-500">
            {/* Authentic iOS Status Bar (visible inside iPhone frame on sm+) */}
            <div className="hidden sm:flex items-center justify-between px-7 pt-[14px] pb-2 z-30 select-none shrink-0">
              <span className="text-[13px] font-semibold tracking-tight tabular-nums text-[var(--p-ink)] w-12">
                9:41
              </span>

              {/* Dynamic Island */}
              <div
                aria-hidden="true"
                className="w-[104px] h-[28px] rounded-full bg-[#141312] flex items-center justify-end pr-2.5"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#1F2329] ring-1 ring-white/10" />
              </div>

              {/* Signal, Wi-Fi, Battery */}
              <div className="flex items-center justify-end gap-1.5 w-12 text-[var(--p-ink)]">
                <svg
                  width="15"
                  height="11"
                  viewBox="0 0 15 11"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <rect x="0.5" y="7" width="2.4" height="3.5" rx="0.8" />
                  <rect x="4.2" y="5" width="2.4" height="5.5" rx="0.8" />
                  <rect x="7.9" y="2.8" width="2.4" height="7.7" rx="0.8" />
                  <rect x="11.6" y="0.6" width="2.4" height="9.9" rx="0.8" />
                </svg>
                <svg
                  width="14"
                  height="11"
                  viewBox="0 0 16 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M8 9.6a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Zm-3.1-2.1a4.7 4.7 0 0 1 6.2 0 .75.75 0 0 0 1.04-1.08 6.2 6.2 0 0 0-8.28 0 .75.75 0 0 0 1.04 1.08Zm-2.5-2.6a8.3 8.3 0 0 1 11.2 0 .75.75 0 1 0 1.03-1.09 9.8 9.8 0 0 0-13.26 0 .75.75 0 1 0 1.03 1.09Z"
                    fill="currentColor"
                  />
                </svg>
                <div className="flex items-center gap-[1.5px]">
                  <div className="w-[20px] h-[10px] rounded-[3px] border border-current/45 p-[1.5px] flex items-center">
                    <div className="w-full h-full rounded-[1.5px] bg-current" />
                  </div>
                  <div className="w-[1.5px] h-[4px] rounded-r-full bg-current/50" />
                </div>
              </div>
            </div>

            {/* Screen Content Slot */}
            <div className="relative flex-1 flex flex-col overflow-hidden">
              {children}
            </div>

            {/* iOS Home Indicator */}
            <div className="hidden sm:flex justify-center pt-1 pb-[9px] shrink-0 z-30 pointer-events-none">
              <div className="w-[126px] h-[4.5px] rounded-full bg-[var(--p-ink)]/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
