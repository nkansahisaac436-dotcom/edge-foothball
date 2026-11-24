import React, { useState, useEffect, useMemo } from 'react';
import { getFixtures, getLeagues } from './services/api.js';
import { LeagueConfig, MatchFixture } from './types/index.js';
import { Navbar } from './components/Navbar.js';
import { DateStrip } from './components/DateStrip.js';
import { LeagueMatchGroup } from './components/LeagueMatchGroup.js';
import { MatchDetailsModal } from './components/MatchDetailsModal.js';
import { SettingsModal } from './components/SettingsModal.js';
import { HowItWorksModal } from './components/HowItWorksModal.js';
import { StrongestPicksPanel } from './components/StrongestPicksPanel.js';
import { ValuePicksPanel } from './components/ValuePicksPanel.js';
import { CustomMatchModal } from './components/CustomMatchModal.js';
import { BacktestModal } from './components/BacktestModal.js';
import { AccumulatorDrawer } from './components/AccumulatorDrawer.js';
import { FooterDisclaimer } from './components/FooterDisclaimer.js';
import { SettingsProvider, useSettings } from './context/SettingsContext.js';
import { AccumulatorProvider } from './context/AccumulatorContext.js';
import { useLiveScores, isLiveStatus } from './hooks/useLiveScores.js';
import { SUPPORTED_LEAGUES } from './config/leagues.js';
import { Search, AlertCircle, RefreshCw, Radio } from 'lucide-react';

const MainContent: React.FC = () => {
  const { t, timezone, isFavourite, favourites } = useSettings();

  const [activeTab, setActiveTab] = useState<'matches' | 'live' | 'favourites' | 'strongest' | 'value'>('matches');
  const [selectedDate, setSelectedDate] = useState('TODAY');
  const [searchQuery, setSearchQuery] = useState('');

  const [rawFixtures, setRawFixtures] = useState<MatchFixture[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [dataStatus, setDataStatus] = useState<'live' | 'delayed' | 'offline'>('delayed');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Live Scores Hook with visibility state detection and subtle goal flash
  const {
    fixtures,
    liveFixtures,
    highlightedGoalMatchId,
    activeLiveCount,
  } = useLiveScores(rawFixtures);

  // Modals
  const [selectedMatch, setSelectedMatch] = useState<MatchFixture | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isCustomMatchOpen, setIsCustomMatchOpen] = useState(false);
  const [isBacktestOpen, setIsBacktestOpen] = useState(false);

  // Network online/offline monitor
  useEffect(() => {
    const handleOnline = () => setDataStatus('delayed');
    const handleOffline = () => setDataStatus('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch initial fixtures schedule across leagues
  const loadSchedule = () => {
    setLoading(true);
    setError(null);
    getFixtures('ALL', 7)
      .then((res) => {
        setRawFixtures(res.fixtures);
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
    loadSchedule();
  }, []);

  // Sofascore-style League Grouping
  const leagueGroups = useMemo(() => {
    const groups: Record<string, { leagueId: string; leagueName: string; country: string; countryFlag: string; logo: string; fixtures: MatchFixture[] }> = {};

    let source = fixtures;

    // Filter by Tab
    if (activeTab === 'live') {
      source = liveFixtures;
    } else if (activeTab === 'favourites') {
      source = source.filter((f) => isFavourite(f.id));
    } else if (activeTab === 'matches') {
      // Filter by Date Strip
      if (selectedDate === 'TODAY') {
        const todayIso = new Date().toISOString().split('T')[0];
        source = source.filter((f) => f.utcDate.startsWith(todayIso) || isLiveStatus(f.status));
      } else if (selectedDate === 'TOMORROW') {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        source = source.filter((f) => f.utcDate.startsWith(tomorrow));
      } else if (selectedDate === 'YESTERDAY') {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        source = source.filter((f) => f.utcDate.startsWith(yesterday));
      } else if (selectedDate !== 'ALL') {
        source = source.filter((f) => f.utcDate.startsWith(selectedDate));
      }
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      source = source.filter(
        (f) =>
          f.homeTeam.name.toLowerCase().includes(q) ||
          f.awayTeam.name.toLowerCase().includes(q) ||
          f.leagueName.toLowerCase().includes(q)
      );
    }

    // Group matches under their league
    source.forEach((f) => {
      const lid = f.leagueId.toUpperCase();
      if (!groups[lid]) {
        const cfg = SUPPORTED_LEAGUES.find((l) => l.id.toUpperCase() === lid);
        groups[lid] = {
          leagueId: f.leagueId,
          leagueName: f.leagueName,
          country: f.country || cfg?.country || 'International',
          countryFlag: f.countryFlag || '⚽',
          logo: f.leagueLogo || cfg?.logo || '',
          fixtures: [],
        };
      }
      groups[lid].fixtures.push(f);
    });

    // Pinned priority: CL and ELC first (as in screenshot), then PL, PD, BL1, SA, FL1
    const priority = ['CL', 'ELC', 'PL', 'PD', 'BL1', 'SA', 'FL1'];
    return Object.values(groups).sort((a, b) => {
      const idxA = priority.indexOf(a.leagueId.toUpperCase());
      const idxB = priority.indexOf(b.leagueId.toUpperCase());
      const ordA = idxA !== -1 ? idxA : 99;
      const ordB = idxB !== -1 ? idxB : 99;
      return ordA - ordB;
    });
  }, [fixtures, liveFixtures, activeTab, selectedDate, searchQuery, isFavourite]);

  return (
    <div className="min-h-screen bg-edge-bg text-gray-100 flex flex-col font-sans antialiased selection:bg-edge-accent selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        liveCount={activeLiveCount}
        favouritesCount={favourites.size}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCustomMatch={() => setIsCustomMatchOpen(true)}
        onOpenBacktest={() => setIsBacktestOpen(true)}
        dataStatus={dataStatus}
        lastUpdated={lastUpdated}
      />

      {/* Date Strip (Only shown on 'matches' tab) */}
      {activeTab === 'matches' && (
        <DateStrip
          selectedDate={selectedDate}
          onSelectDate={(date) => setSelectedDate(date)}
        />
      )}

      {/* Search Bar on Matches, Live, Favourites */}
      {['matches', 'live', 'favourites'].includes(activeTab) && (
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 pt-3 pb-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-edge-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-edge-card border border-edge-border rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-edge-muted focus:outline-none focus:border-edge-accent transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-edge-muted hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="w-7 h-7 text-edge-accent animate-spin" />
            <span className="text-xs text-edge-muted">Loading match fixtures and edge odds...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-xl text-xs text-red-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadSchedule}
              className="px-3 py-1 bg-edge-card rounded border border-edge-border hover:bg-edge-border text-white text-xs"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Matches & Live & Favourites Views */}
            {['matches', 'live', 'favourites'].includes(activeTab) && (
              <div className="space-y-3">
                {leagueGroups.length > 0 ? (
                  leagueGroups.map((group) => (
                    <LeagueMatchGroup
                      key={group.leagueId}
                      leagueId={group.leagueId}
                      leagueName={group.leagueName}
                      country={group.country}
                      countryFlag={group.countryFlag}
                      leagueLogo={group.logo}
                      fixtures={group.fixtures}
                      highlightedGoalMatchId={highlightedGoalMatchId}
                      onSelectMatch={(f) => setSelectedMatch(f)}
                    />
                  ))
                ) : (
                  <div className="py-16 text-center space-y-2 bg-edge-card/40 rounded-xl border border-edge-border/60 p-6">
                    <span className="text-3xl block">
                      {activeTab === 'live' ? '⏱️' : activeTab === 'favourites' ? '⭐' : '⚽'}
                    </span>
                    <h3 className="text-sm font-semibold text-white">
                      {activeTab === 'live'
                        ? 'No Live Matches In Play'
                        : activeTab === 'favourites'
                        ? 'No Favourite Matches Added'
                        : 'No Matches Scheduled'}
                    </h3>
                    <p className="text-xs text-edge-muted max-w-md mx-auto">
                      {activeTab === 'live'
                        ? 'When matches start, live minute, scores, and in-play probabilities will track here automatically.'
                        : activeTab === 'favourites'
                        ? 'Tap the star icon on any match to pin it to your favourites tab.'
                        : 'Try selecting a different date from the date strip or clearing your search filter.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Strongest Picks Panel */}
            {activeTab === 'strongest' && (
              <StrongestPicksPanel onSelectMatch={(f) => setSelectedMatch(f)} />
            )}

            {/* Value Picks Panel */}
            {activeTab === 'value' && (
              <ValuePicksPanel onSelectMatch={(f) => setSelectedMatch(f)} />
            )}
          </>
        )}
      </main>

      {/* Betslip Floating Drawer */}
      <AccumulatorDrawer />

      {/* Footer */}
      <FooterDisclaimer />

      {/* Modals */}
      <MatchDetailsModal
        fixture={selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onOpenBacktest={() => setIsBacktestOpen(true)}
      />

      <CustomMatchModal
        isOpen={isCustomMatchOpen}
        onClose={() => setIsCustomMatchOpen(false)}
        timezone={timezone}
      />

      <BacktestModal
        isOpen={isBacktestOpen}
        onClose={() => setIsBacktestOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AccumulatorProvider>
        <MainContent />
      </AccumulatorProvider>
    </SettingsProvider>
  );
};

export default App;
