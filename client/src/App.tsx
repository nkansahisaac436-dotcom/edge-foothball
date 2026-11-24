import React, { useState, useEffect, useMemo } from 'react';
import { getFixtures, getLeagues } from './services/api.js';
import { LeagueConfig, MatchFixture } from './types/index.js';
import { Navbar } from './components/Navbar.js';
import { LeagueTabs } from './components/LeagueTabs.js';
import { DateChips } from './components/DateChips.js';
import { SearchBar } from './components/SearchBar.js';
import { MatchCard } from './components/MatchCard.js';
import { StrongestPicksPanel } from './components/StrongestPicksPanel.js';
import { ValuePicksPanel } from './components/ValuePicksPanel.js';
import { CustomMatchModal } from './components/CustomMatchModal.js';
import { BacktestModal } from './components/BacktestModal.js';
import { AccumulatorDrawer } from './components/AccumulatorDrawer.js';
import { FooterDisclaimer } from './components/FooterDisclaimer.js';
import { AccumulatorProvider } from './context/AccumulatorContext.js';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { SUPPORTED_LEAGUES } from './config/leagues.js';
import { getAutoDetectedTimezone } from './utils/timezone.js';

export const AppContent: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [timezone, setTimezone] = useState(() => getAutoDetectedTimezone());
  const [leagues, setLeagues] = useState<LeagueConfig[]>(SUPPORTED_LEAGUES);
  const [selectedLeague, setSelectedLeague] = useState('PL');
  const [selectedDate, setSelectedDate] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'matches' | 'strongest' | 'value'>('matches');

  const [fixtures, setFixtures] = useState<MatchFixture[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [dataStatus, setDataStatus] = useState<'live' | 'delayed' | 'offline'>('delayed');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Monitor online / offline state
  useEffect(() => {
    const handleOnline = () => {
      setDataStatus('delayed');
    };
    const handleOffline = () => {
      setDataStatus('offline');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Modals
  const [isCustomMatchOpen, setIsCustomMatchOpen] = useState(false);
  const [isBacktestOpen, setIsBacktestOpen] = useState(false);

  // Sync dark class on body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load leagues once
  useEffect(() => {
    getLeagues()
      .then((data) => {
        if (data && data.length > 0) setLeagues(data);
      })
      .catch(() => {
        // Fallback leagues used
      });
  }, []);

  // Fetch fixtures when league changes
  const loadFixtures = () => {
    setLoading(true);
    setError(null);
    getFixtures(selectedLeague, 7)
      .then((res) => {
        setFixtures(res.fixtures);
        setLastUpdated(res.lastUpdated || new Date().toISOString());
        if (!navigator.onLine) {
          setDataStatus('offline');
        } else if (res.provider === 'Live API') {
          setDataStatus('live');
        } else {
          setDataStatus('delayed');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load fixtures');
        setDataStatus(navigator.onLine ? 'delayed' : 'offline');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadFixtures();
  }, [selectedLeague]);

  // Filter fixtures by date and search query
  const filteredFixtures = useMemo(() => {
    return fixtures.filter((f) => {
      // Date filter
      if (selectedDate !== 'ALL') {
        const fixtureDate = f.utcDate.split('T')[0];
        if (fixtureDate !== selectedDate) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const homeMatch = f.homeTeam.name.toLowerCase().includes(q);
        const awayMatch = f.awayTeam.name.toLowerCase().includes(q);
        if (!homeMatch && !awayMatch) return false;
      }
      return true;
    });
  }, [fixtures, selectedDate, searchQuery]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0f1d] text-gray-100' : 'bg-gray-100 text-gray-900'} flex flex-col`}>
      {/* Navbar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        timezone={timezone}
        setTimezone={setTimezone}
        onOpenCustomMatch={() => setIsCustomMatchOpen(true)}
        onOpenBacktest={() => setIsBacktestOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
        lastUpdated={lastUpdated}
        dataStatus={dataStatus}
        isLoading={loading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4">
        {/* League Selector Tabs */}
        <LeagueTabs
          leagues={leagues}
          selectedLeague={selectedLeague}
          onSelectLeague={(id) => {
            setSelectedLeague(id);
            setSelectedDate('ALL');
          }}
        />

        {/* View Conditionals */}
        {activeView === 'matches' && (
          <>
            {/* Date Filters & Team Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 my-2">
              <DateChips
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
              <SearchBar
                query={searchQuery}
                onChange={setSearchQuery}
              />
            </div>

            {/* Error Message with Retry */}
            {error && (
              <div className="p-4 my-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={loadFixtures}
                  className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold rounded-lg flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Loading Skeletons */}
            {loading && (
              <div className="space-y-4 mt-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 animate-pulse space-y-3"
                  >
                    <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                    <div className="flex justify-between items-center py-2">
                      <div className="h-6 bg-gray-800 rounded w-1/3"></div>
                      <div className="h-6 bg-gray-800 rounded w-1/3"></div>
                    </div>
                    <div className="h-3 bg-gray-800 rounded w-full"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Match Cards List */}
            {!loading && !error && (
              <div className="space-y-4 mt-3">
                {filteredFixtures.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 text-xs font-mono bg-gray-900/40 rounded-2xl border border-gray-800">
                    No fixtures scheduled for this filter selection.
                  </div>
                ) : (
                  filteredFixtures.map((fixture) => (
                    <MatchCard
                      key={fixture.id}
                      fixture={fixture}
                      timezone={timezone}
                    />
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* View: Strongest Picks */}
        {activeView === 'strongest' && (
          <div className="mt-4">
            <StrongestPicksPanel leagueId={selectedLeague} />
          </div>
        )}

        {/* View: Value Picks */}
        {activeView === 'value' && (
          <div className="mt-4">
            <ValuePicksPanel leagueId={selectedLeague} />
          </div>
        )}
      </main>

      {/* Accumulator Floating Drawer */}
      <AccumulatorDrawer />

      {/* Custom Match Simulator Modal */}
      <CustomMatchModal
        isOpen={isCustomMatchOpen}
        onClose={() => setIsCustomMatchOpen(false)}
        timezone={timezone}
      />

      {/* Model Backtest & Calibration Modal */}
      <BacktestModal
        isOpen={isBacktestOpen}
        onClose={() => setIsBacktestOpen(false)}
      />

      {/* Footer Disclaimer */}
      <FooterDisclaimer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AccumulatorProvider>
      <AppContent />
    </AccumulatorProvider>
  );
};
