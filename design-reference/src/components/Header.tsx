import React, { useState } from 'react';
import { Screen } from '../types';

interface HeaderProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  cabinetCount: number;
}

export const Header: React.FC<HeaderProps> = ({ currentScreen, onNavigate, cabinetCount }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#ffffff] border-b border-[#d6d4cc] select-none">
      <div className="h-16 max-w-[1200px] mx-auto px-5 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onNavigate('home')}
          className="font-headline-md text-[24px] text-[#1c1f1d] tracking-normal font-semibold hover:opacity-80 transition-opacity flex items-center gap-2 cursor-pointer bg-transparent border-0 p-0 text-left"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          <span>MediSense</span>
        </button>

        {/* Navigation & Profile */}
        <div className="flex items-center gap-5 sm:gap-7">
          <nav className="flex items-center gap-4 sm:gap-6 text-[15px]">
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

            <button
              onClick={() => onNavigate('styleguide')}
              className={`hidden sm:inline-block transition-colors cursor-pointer border-0 bg-transparent py-1 ${
                currentScreen === 'styleguide'
                  ? 'text-[#1c1f1d] font-semibold border-b-2 border-[#1f5a46]'
                  : 'text-[#5a605c] hover:text-[#1c1f1d]'
              }`}
              title="Design System & Style Guide"
            >
              Style Guide
            </button>
          </nav>

          {/* Profile Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 rounded-full bg-[#004230] hover:bg-[#1f5a46] flex items-center justify-center transition-colors cursor-pointer border-0"
              aria-label="User Profile"
              title="Session details"
            >
              <span className="material-symbols-outlined text-white text-[18px]">person</span>
            </button>

            {showProfileMenu && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white border border-[#d6d4cc] rounded p-4 z-50 text-[13px] text-[#1c1f1d]"
                style={{ borderRadius: '4px' }}
              >
                <div className="pb-2 mb-2 border-b border-[#d6d4cc]">
                  <div className="font-semibold text-[14px]">Guest Clinical Session</div>
                  <div className="text-[#5a605c] text-[12px]">Ephemeral In-Browser Profile</div>
                </div>
                <div className="space-y-1.5 text-[12px] text-[#5a605c]">
                  <div className="flex justify-between">
                    <span>Privacy mode:</span>
                    <span className="text-[#1f5a46] font-medium">Local memory only</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monograph cache:</span>
                    <span className="text-[#1c1f1d]">BNF / FDA 2024.3</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-[#d6d4cc]">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onNavigate('styleguide');
                    }}
                    className="w-full text-left text-[#1f5a46] hover:underline text-[12px] py-1 cursor-pointer bg-transparent border-0"
                  >
                    View UI Components & Style Guide
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
