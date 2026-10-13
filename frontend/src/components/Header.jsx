import { useState } from 'react';

export default function Header({ currentScreen, onNavigate, cabinetCount }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#ffffff] border-b border-[#d6d4cc] select-none">
      <div className="h-16 max-w-[1200px] mx-auto px-5 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="font-headline-md text-[24px] text-[#1c1f1d] tracking-normal font-semibold hover:opacity-80 transition-opacity flex items-center gap-2 cursor-pointer bg-transparent border-0 p-0 text-left"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          <span>MediSense</span>
        </button>

        <div className="flex items-center gap-3 sm:gap-5">
          <nav className="flex items-center gap-3 sm:gap-6 text-[14px] sm:text-[15px]">
            <button
              onClick={() => onNavigate('home')}
              className={`transition-colors cursor-pointer border-0 bg-transparent py-1 ${
                currentScreen === 'home'
                  ? 'text-[#1c1f1d] font-semibold border-b-2 border-[#1f5a46]'
                  : 'text-[#5a605c] hover:text-[#1c1f1d]'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onNavigate('upload')}
              className={`transition-colors cursor-pointer border-0 bg-transparent py-1 ${
                currentScreen === 'upload' || currentScreen === 'processing' || currentScreen === 'report'
                  ? 'text-[#1c1f1d] font-semibold border-b-2 border-[#1f5a46]'
                  : 'text-[#5a605c] hover:text-[#1c1f1d]'
              }`}
            >
              Verify Rx
            </button>

            <button
              onClick={() => onNavigate('cabinet')}
              className={`transition-colors cursor-pointer border-0 bg-transparent py-1 flex items-center gap-1.5 ${
                currentScreen === 'cabinet'
                  ? 'text-[#1c1f1d] font-semibold border-b-2 border-[#1f5a46]'
                  : 'text-[#5a605c] hover:text-[#1c1f1d]'
              }`}
            >
              <span>Cabinet</span>
              {cabinetCount > 0 && (
                <span className="text-[11px] font-semibold px-1.5 py-0.2 bg-[#f3f4f0] text-[#5a605c] rounded border border-[#d6d4cc]">
                  {cabinetCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('ask')}
              className={`transition-colors cursor-pointer border-0 bg-transparent py-1 ${
                currentScreen === 'ask'
                  ? 'text-[#1c1f1d] font-semibold border-b-2 border-[#1f5a46]'
                  : 'text-[#5a605c] hover:text-[#1c1f1d]'
              }`}
            >
              Ask
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
