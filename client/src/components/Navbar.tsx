import React, { useState, useEffect } from 'react';
import { ShieldCheck, Moon, Sun, Sparkles, SlidersHorizontal, BarChart3, Download, Clock } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  timezone: string;
  setTimezone: (val: string) => void;
  onOpenCustomMatch: () => void;
  onOpenBacktest: () => void;
  activeView: 'matches' | 'strongest' | 'value';
  setActiveView: (view: 'matches' | 'strongest' | 'value') => void;
  lastUpdated?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  timezone,
  setTimezone,
  onOpenCustomMatch,
  onOpenBacktest,
  activeView,
  setActiveView,
  lastUpdated,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install Matchday Edge: tap your browser menu (or share button) and select "Add to Home Screen".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  };

  const toggleTimezone = () => {
    if (timezone === 'Africa/Accra') {
      const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      setTimezone(localTz);
    } else {
      setTimezone('Africa/Accra');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-sporty-green to-emerald-600 flex items-center justify-center shadow-lg shadow-sporty-green/20">
              <span className="text-black font-black text-lg tracking-tighter">ME</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="font-black text-base sm:text-lg tracking-wide uppercase bg-gradient-to-r from-white via-gray-200 to-sporty-green bg-clip-text text-transparent">
                  Matchday Edge
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sporty-green/20 text-sporty-green border border-sporty-green/30">
                  AI 2.0
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono hidden xs:block">
                Dixon-Coles & NegBinomial Engine
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Timezone pill */}
            <button
              onClick={toggleTimezone}
              title={`Switch Timezone (Currently: ${timezone})`}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-gray-800/80 hover:bg-gray-700 border border-gray-700 text-[11px] font-mono text-gray-300 transition"
            >
              <Clock className="w-3 h-3 text-sporty-green" />
              <span>{timezone === 'Africa/Accra' ? 'Accra (GMT)' : 'Local'}</span>
            </button>

            {/* Custom Match button */}
            <button
              onClick={onOpenCustomMatch}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-medium text-gray-200 transition"
              title="Simulate Custom Match"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-sporty-blue" />
              <span className="hidden sm:inline">Custom</span>
            </button>

            {/* Backtest modal button */}
            <button
              onClick={onOpenBacktest}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-medium text-gray-200 transition"
              title="View Backtest & Calibration Table"
            >
              <BarChart3 className="w-3.5 h-3.5 text-sporty-gold" />
              <span className="hidden sm:inline">Backtest</span>
            </button>

            {/* Install PWA Button */}
            <button
              onClick={handleInstallClick}
              className="p-1.5 sm:px-2 sm:py-1 rounded-lg bg-sporty-green/10 hover:bg-sporty-green/20 border border-sporty-green/30 text-sporty-green text-xs font-medium transition flex items-center space-x-1"
              title="Install App as PWA"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install</span>
            </button>

            {/* Dark/Light toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 transition"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
            </button>
          </div>
        </div>

        {/* Navigation View Sub-Bar */}
        <div className="flex items-center justify-between pb-2 text-xs border-t border-gray-800/60 pt-1.5">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveView('matches')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                activeView === 'matches'
                  ? 'bg-sporty-green text-black shadow-sm shadow-sporty-green/30'
                  : 'text-gray-400 hover:text-white bg-gray-800/40'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setActiveView('strongest')}
              className={`px-3 py-1 rounded-md font-semibold flex items-center space-x-1 transition ${
                activeView === 'strongest'
                  ? 'bg-sporty-green text-black shadow-sm shadow-sporty-green/30'
                  : 'text-gray-400 hover:text-white bg-gray-800/40'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300 inline" />
              <span>Strongest Picks</span>
            </button>
            <button
              onClick={() => setActiveView('value')}
              className={`px-3 py-1 rounded-md font-semibold flex items-center space-x-1 transition ${
                activeView === 'value'
                  ? 'bg-sporty-green text-black shadow-sm shadow-sporty-green/30'
                  : 'text-gray-400 hover:text-white bg-gray-800/40'
              }`}
            >
              <span className="text-sporty-gold font-bold">★</span>
              <span>Value Picks</span>
            </button>
          </div>

          {lastUpdated && (
            <div className="text-[11px] text-gray-400 font-mono hidden sm:flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sporty-green animate-pulse"></span>
              <span>Updated: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
