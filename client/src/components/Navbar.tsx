import React, { useState, useEffect } from 'react';
import { Settings, BarChart3, SlidersHorizontal, Download, Star } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.js';
import { formatRelativeTime } from '../utils/date.js';

interface NavbarProps {
  activeTab: 'matches' | 'live' | 'favourites' | 'strongest' | 'value';
  setActiveTab: (tab: 'matches' | 'live' | 'favourites' | 'strongest' | 'value') => void;
  liveCount: number;
  favouritesCount: number;
  onOpenSettings: () => void;
  onOpenCustomMatch: () => void;
  onOpenBacktest: () => void;
  dataStatus?: 'live' | 'delayed' | 'offline';
  lastUpdated?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  liveCount,
  favouritesCount,
  onOpenSettings,
  onOpenCustomMatch,
  onOpenBacktest,
  dataStatus = 'delayed',
  lastUpdated,
}) => {
  const { t, timezone } = useSettings();
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
      alert('To install Matchday Edge: tap your browser menu or share icon and tap "Add to Home Screen".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <header className="sticky top-0 z-40 bg-edge-bg border-b border-edge-border text-white shadow-sm">
      {/* Top Brand & Utility Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-13 sm:h-14 py-2">
          {/* Brand */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-edge-card border border-edge-border flex items-center justify-center text-white font-bold text-sm tracking-tight">
              ⚽
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                  Matchday Edge
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-edge-card border border-edge-border text-edge-muted">
                  Sofascore Style
                </span>
              </div>
              <p className="text-[10px] text-edge-muted hidden xs:block">
                Poisson & NegBinomial Live Edge
              </p>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Custom simulation button */}
            <button
              onClick={onOpenCustomMatch}
              title="Simulate custom match"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-edge-card hover:bg-edge-card-hover border border-edge-border text-xs text-gray-200 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-edge-muted" />
              <span className="hidden sm:inline">Custom</span>
            </button>

            {/* Backtest button */}
            <button
              onClick={onOpenBacktest}
              title="View 200-match backtest and calibration"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-edge-card hover:bg-edge-card-hover border border-edge-border text-xs text-gray-200 transition"
            >
              <BarChart3 className="w-3.5 h-3.5 text-edge-muted" />
              <span className="hidden sm:inline">Backtest</span>
            </button>

            {/* PWA Install */}
            {canInstall && (
              <button
                onClick={handleInstallClick}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-edge-card border border-edge-border text-xs text-white hover:bg-edge-card-hover transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install</span>
              </button>
            )}

            {/* Settings Gear */}
            <button
              onClick={onOpenSettings}
              title={t.settings}
              className="p-2 rounded-lg bg-edge-card hover:bg-edge-card-hover border border-edge-border text-edge-muted hover:text-white transition"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sofascore-style Tabs Row */}
        <div className="flex items-center justify-between border-t border-edge-border pt-1 pb-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Matches Tab */}
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'matches'
                  ? 'bg-edge-accent text-white font-semibold shadow-sm'
                  : 'text-edge-muted hover:text-white hover:bg-edge-card'
              }`}
            >
              {t.matches}
            </button>

            {/* Live Tab with RED badge */}
            <button
              onClick={() => setActiveTab('live')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'live'
                  ? 'bg-edge-live text-white font-semibold shadow-sm'
                  : 'text-edge-muted hover:text-white hover:bg-edge-card'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-edge-live animate-pulse"></span>
              <span>{t.live}</span>
              {liveCount > 0 && (
                <span className="tabular-nums px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/20 text-white">
                  {liveCount}
                </span>
              )}
            </button>

            {/* Favourites Tab */}
            <button
              onClick={() => setActiveTab('favourites')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'favourites'
                  ? 'bg-amber-600 text-white font-semibold shadow-sm'
                  : 'text-edge-muted hover:text-white hover:bg-edge-card'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>{t.favourites}</span>
              {favouritesCount > 0 && (
                <span className="tabular-nums px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/20 text-white">
                  {favouritesCount}
                </span>
              )}
            </button>

            {/* Strongest Picks Tab */}
            <button
              onClick={() => setActiveTab('strongest')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'strongest'
                  ? 'bg-edge-accent text-white font-semibold'
                  : 'text-edge-muted hover:text-white hover:bg-edge-card'
              }`}
            >
              Strongest
            </button>

            {/* Value Picks Tab */}
            <button
              onClick={() => setActiveTab('value')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'value'
                  ? 'bg-edge-accent text-white font-semibold'
                  : 'text-edge-muted hover:text-white hover:bg-edge-card'
              }`}
            >
              Value
            </button>
          </div>

          {/* Data Status Dot & Relative Time */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-edge-muted pl-3">
            <span
              className={`w-2 h-2 rounded-full ${
                dataStatus === 'live'
                  ? 'bg-emerald-500'
                  : dataStatus === 'delayed'
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
            />
            <span>
              {dataStatus === 'live'
                ? 'Live data'
                : dataStatus === 'delayed'
                ? 'Delayed data'
                : 'Offline'}
            </span>
            <span>•</span>
            <span className="tabular-nums">
              {formatRelativeTime(lastUpdated)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
