import React, { useState, useEffect } from 'react';
import { Moon, Sun, Sparkles, SlidersHorizontal, BarChart3, Download, Clock, Globe } from 'lucide-react';
import { formatRelativeTime } from '../utils/date.js';

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
  dataStatus?: 'live' | 'delayed' | 'offline';
  isLoading?: boolean;
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
  dataStatus = 'delayed',
  isLoading = false,
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
    <header className="sticky top-0 z-40 bg-gray-900 border-b border-gray-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Logo & Professional Identity */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
              <span className="text-white font-bold text-base tracking-tight">ME</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-white">
                  Matchday Edge
                </h1>
              </div>
              <p className="text-[11px] text-gray-400">
                Football Analysis & Fair Odds
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Timezone pill with accurate indicator */}
            <button
              onClick={toggleTimezone}
              title={`Active Timezone: ${timezone}. Click to switch between Accra (GMT) and Local.`}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-gray-800 hover:bg-gray-700/80 border border-gray-700 text-xs text-gray-200 transition"
            >
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{timezone === 'Africa/Accra' ? 'Accra (GMT+0)' : timezone.split('/').pop()?.replace('_', ' ')}</span>
            </button>

            {/* Custom Match button */}
            <button
              onClick={onOpenCustomMatch}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-gray-800 hover:bg-gray-700/80 border border-gray-700 text-xs font-medium text-gray-200 transition"
              title="Simulate Custom Match"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
              <span className="hidden sm:inline">Custom</span>
            </button>

            {/* Backtest modal button */}
            <button
              onClick={onOpenBacktest}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-gray-800 hover:bg-gray-700/80 border border-gray-700 text-xs font-medium text-gray-200 transition"
              title="View Backtest & Calibration Table"
            >
              <BarChart3 className="w-3.5 h-3.5 text-gray-400" />
              <span className="hidden sm:inline">Backtest</span>
            </button>

            {/* Install PWA Button */}
            <button
              onClick={handleInstallClick}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-md bg-gray-800 hover:bg-gray-700/80 border border-gray-700 text-gray-200 text-xs font-medium transition flex items-center space-x-1"
              title="Install App as PWA"
            >
              <Download className="w-3.5 h-3.5 text-gray-400" />
              <span className="hidden sm:inline">Install</span>
            </button>

            {/* Dark/Light toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 transition"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
            </button>
          </div>
        </div>

        {/* Navigation View Sub-Bar with Data Status & Safe Relative Timestamp */}
        <div className="flex items-center justify-between pb-2 text-xs border-t border-gray-800 pt-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveView('matches')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                activeView === 'matches'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white bg-gray-800/60'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setActiveView('strongest')}
              className={`px-3 py-1 rounded-md font-medium flex items-center space-x-1 transition ${
                activeView === 'strongest'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white bg-gray-800/60'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300 inline" />
              <span>Strongest Picks</span>
            </button>
            <button
              onClick={() => setActiveView('value')}
              className={`px-3 py-1 rounded-md font-medium flex items-center space-x-1 transition ${
                activeView === 'value'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white bg-gray-800/60'
              }`}
            >
              <span>★ Value Picks</span>
            </button>
          </div>

          {/* Right Data Status Indicator & Relative Updated Time */}
          <div className="flex items-center space-x-2 text-[11px]">
            {/* Live Data / Delayed Data / Offline Status Pill */}
            <div
              className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium ${
                dataStatus === 'live'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : dataStatus === 'delayed'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
              title={
                dataStatus === 'live'
                  ? 'Real-time connected feed'
                  : dataStatus === 'delayed'
                  ? 'Simulated / delayed data feed'
                  : 'No internet connection; showing cached offline data'
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  dataStatus === 'live'
                    ? 'bg-emerald-400 animate-pulse'
                    : dataStatus === 'delayed'
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
              />
              <span>
                {dataStatus === 'live'
                  ? 'Live data'
                  : dataStatus === 'delayed'
                  ? 'Delayed data'
                  : 'Offline (showing saved data)'}
              </span>
            </div>

            {/* Relative Timestamp: NEVER renders "Invalid Date" */}
            <span className="text-gray-400 hidden sm:inline">
              {isLoading ? 'Updating…' : formatRelativeTime(lastUpdated)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
