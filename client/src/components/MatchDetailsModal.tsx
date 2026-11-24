import React, { useState, useEffect } from 'react';
import {
  MatchFixture,
  MatchPrediction,
  MarketSelection,
  TeamStanding,
} from '../types/index.js';
import { getMatchPredictions } from '../services/api.js';
import { MobileDataProvider } from '../services/mock.provider.js';
import { useSettings } from '../context/SettingsContext.js';
import { useAccumulator } from '../context/AccumulatorContext.js';
import { isLiveStatus, isFinishedStatus } from '../hooks/useLiveScores.js';
import { formatKickoffTime } from '../utils/date.js';
import {
  X,
  Plus,
  Check,
  TrendingUp,
  Clock,
  Shield,
  Activity,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface MatchDetailsModalProps {
  fixture: MatchFixture | null;
  onClose: () => void;
}

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
  fixture,
  onClose,
}) => {
  const { t, timezone, displayOdds } = useSettings();
  const { addLeg, hasLeg } = useAccumulator();

  const [activeTab, setActiveTab] = useState<
    'predictions' | 'summary' | 'lineups' | 'stats' | 'h2h' | 'standings'
  >('predictions');

  const [prediction, setPrediction] = useState<MatchPrediction | null>(null);
  const [loadingPred, setLoadingPred] = useState(false);
  const [expandedMarkets, setExpandedMarkets] = useState<Record<string, boolean>>({
    result1X2: true,
    totalGoals: true,
    cornersTotal: true,
    btts: false,
    cardsTotal: false,
    doubleChance: false,
  });

  useEffect(() => {
    if (fixture) {
      setLoadingPred(true);
      getMatchPredictions(fixture.id, fixture.leagueId)
        .then((pred) => {
          setPrediction(pred);
          setLoadingPred(false);
        })
        .catch(() => {
          setLoadingPred(false);
        });
    }
  }, [fixture]);

  if (!fixture) return null;

  const isLive = isLiveStatus(fixture.status);
  const isFinished = isFinishedStatus(fixture.status);
  const homeScore = fixture.score?.fullTime?.home;
  const awayScore = fixture.score?.fullTime?.away;

  const toggleMarket = (key: string) => {
    setExpandedMarkets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddPickToSlip = (pick: MarketSelection, marketTitle: string) => {
    const legId = `${fixture.id}_${pick.outcome}_${marketTitle}`.replace(/\s+/g, '_');
    addLeg({
      id: legId,
      matchId: fixture.id,
      matchTitle: `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`,
      marketTitle,
      outcome: pick.outcome,
      name: pick.name,
      probability: pick.probability,
      fairOdds: pick.fairOdds,
      isEstimate: pick.isEstimate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-edge-card border border-edge-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Match Header (Sofascore style) */}
        <div className="relative bg-gradient-to-b from-edge-bg to-edge-card border-b border-edge-border px-4 py-4">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-edge-muted hover:text-white hover:bg-edge-border/50 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* League & Round & Status */}
          <div className="flex items-center justify-center gap-2 text-xs text-edge-muted mb-3">
            <span className="font-semibold text-white">{fixture.leagueName}</span>
            <span>•</span>
            <span>{fixture.round || 'League Phase'}</span>
            <span>•</span>
            <span className="tabular-nums font-mono text-gray-300">
              {formatKickoffTime(fixture.utcDate, timezone)}
            </span>
          </div>

          {/* Teams & Score Display */}
          <div className="grid grid-cols-3 items-center py-2">
            {/* Home Team */}
            <div className="flex flex-col items-center text-center pr-2">
              {fixture.homeTeam.logo ? (
                <img
                  src={fixture.homeTeam.logo}
                  alt={fixture.homeTeam.name}
                  className="w-12 h-12 object-contain mb-2 drop-shadow"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-edge-border flex items-center justify-center text-base font-bold text-white mb-2">
                  {fixture.homeTeam.name.substring(0, 1)}
                </div>
              )}
              <span className="text-xs sm:text-sm font-semibold text-white line-clamp-2">
                {fixture.homeTeam.name}
              </span>
            </div>

            {/* Score / Status Slot */}
            <div className="flex flex-col items-center justify-center">
              {isLive ? (
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 text-2xl sm:text-3xl font-bold font-mono text-edge-live tabular-nums">
                    <span>{homeScore ?? 0}</span>
                    <span>-</span>
                    <span>{awayScore ?? 0}</span>
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-edge-live/20 text-edge-live animate-pulse">
                    {fixture.minute ? `${fixture.minute}'` : fixture.status}
                  </span>
                </div>
              ) : isFinished ? (
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 text-2xl sm:text-3xl font-bold font-mono text-gray-200 tabular-nums">
                    <span>{homeScore ?? 0}</span>
                    <span>-</span>
                    <span>{awayScore ?? 0}</span>
                  </div>
                  <span className="mt-1 text-xs font-semibold text-gray-400">FT (Full Time)</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-edge-bg border border-edge-border text-edge-muted">
                    VS
                  </span>
                  <span className="mt-1 text-[11px] text-edge-muted tabular-nums">
                    {formatKickoffTime(fixture.utcDate, timezone)}
                  </span>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center text-center pl-2">
              {fixture.awayTeam.logo ? (
                <img
                  src={fixture.awayTeam.logo}
                  alt={fixture.awayTeam.name}
                  className="w-12 h-12 object-contain mb-2 drop-shadow"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-edge-border flex items-center justify-center text-base font-bold text-white mb-2">
                  {fixture.awayTeam.name.substring(0, 1)}
                </div>
              )}
              <span className="text-xs sm:text-sm font-semibold text-white line-clamp-2">
                {fixture.awayTeam.name}
              </span>
            </div>
          </div>

          {/* In-play live probability banner if live */}
          {isLive && fixture.inPlayProbabilities && (
            <div className="mt-3 p-2 bg-edge-bg rounded-lg border border-edge-border flex items-center justify-between text-xs">
              <span className="text-[11px] font-semibold text-edge-live flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-edge-live animate-ping"></span>
                {t.liveProbability}
              </span>
              <div className="flex items-center gap-3 tabular-nums font-mono text-gray-300">
                <span>1: {Math.round(fixture.inPlayProbabilities.homeProb * 100)}%</span>
                <span>X: {Math.round(fixture.inPlayProbabilities.drawProb * 100)}%</span>
                <span>2: {Math.round(fixture.inPlayProbabilities.awayProb * 100)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Navigation Tabs (Sofascore style) */}
        <div className="flex items-center border-b border-edge-border bg-edge-bg/50 px-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'predictions', label: t.predictions },
            { id: 'summary', label: t.summary },
            { id: 'lineups', label: t.lineups },
            { id: 'stats', label: t.stats },
            { id: 'h2h', label: t.h2h },
            { id: 'standings', label: t.standings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-edge-accent text-white font-semibold'
                  : 'border-transparent text-edge-muted hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* TAB 1: PREDICTIONS */}
          {activeTab === 'predictions' && (
            <div className="space-y-4">
              {loadingPred ? (
                <div className="py-8 text-center text-xs text-edge-muted">
                  Calculating Dixon-Coles and Negative Binomial markets...
                </div>
              ) : prediction ? (
                <>
                  {/* Top 3-4 Varied Picks Card */}
                  <div className="bg-edge-bg rounded-lg border border-edge-border p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-edge-accent" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                          Highlighted Varied Picks
                        </h3>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-edge-card border border-edge-border text-edge-muted">
                        Confidence: {prediction.confidence}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {prediction.topPicks.map((pick, idx) => {
                        const inSlip = hasLeg(`${fixture.id}_${pick.outcome}`);
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-edge-card border border-edge-border hover:border-edge-accent/50 transition-colors"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="text-[10px] text-edge-muted block truncate">
                                {pick.name}
                              </span>
                              <span className="text-xs font-semibold text-white block truncate">
                                {pick.outcome}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] tabular-nums font-mono">
                                <span className="text-emerald-400 font-bold">
                                  {Math.round(pick.probability * 100)}%
                                </span>
                                <span className="text-edge-muted">
                                  Fair: {displayOdds(pick.fairOdds)}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleAddPickToSlip(pick, pick.name)}
                              className={`p-2 rounded-lg text-xs font-medium transition-all ${
                                inSlip
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-edge-bg border border-edge-border text-edge-muted hover:text-white hover:border-edge-accent'
                              }`}
                            >
                              {inSlip ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Market Breakdown Collapsibles */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-edge-muted px-1">
                      Complete Market Breakdown
                    </h3>

                    {/* Result 1X2 */}
                    {prediction.markets.result1X2 && (
                      <div className="border border-edge-border rounded-lg overflow-hidden bg-edge-bg">
                        <button
                          onClick={() => toggleMarket('result1X2')}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium text-white hover:bg-edge-card transition"
                        >
                          <span>{prediction.markets.result1X2.title}</span>
                          {expandedMarkets.result1X2 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {expandedMarkets.result1X2 && (
                          <div className="grid grid-cols-3 gap-2 p-2.5 pt-0 border-t border-edge-border/50">
                            {prediction.markets.result1X2.selections.map((sel, i) => (
                              <button
                                key={i}
                                onClick={() => handleAddPickToSlip(sel, prediction.markets.result1X2.title)}
                                className="p-2 rounded bg-edge-card border border-edge-border text-center hover:border-edge-accent transition"
                              >
                                <span className="text-[11px] text-edge-muted block">{sel.outcome}</span>
                                <span className="text-xs font-bold text-white block">{Math.round(sel.probability * 100)}%</span>
                                <span className="text-[10px] text-edge-muted tabular-nums font-mono">@{displayOdds(sel.fairOdds)}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Total Goals */}
                    {prediction.markets.totalGoals && (
                      <div className="border border-edge-border rounded-lg overflow-hidden bg-edge-bg">
                        <button
                          onClick={() => toggleMarket('totalGoals')}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium text-white hover:bg-edge-card transition"
                        >
                          <span>{prediction.markets.totalGoals.title}</span>
                          {expandedMarkets.totalGoals ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {expandedMarkets.totalGoals && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 pt-0 border-t border-edge-border/50">
                            {prediction.markets.totalGoals.selections.slice(0, 8).map((sel, i) => (
                              <button
                                key={i}
                                onClick={() => handleAddPickToSlip(sel, prediction.markets.totalGoals.title)}
                                className="p-2 rounded bg-edge-card border border-edge-border text-center hover:border-edge-accent transition"
                              >
                                <span className="text-[11px] text-edge-muted block">{sel.outcome}</span>
                                <span className="text-xs font-bold text-white block">{Math.round(sel.probability * 100)}%</span>
                                <span className="text-[10px] text-edge-muted tabular-nums font-mono">@{displayOdds(sel.fairOdds)}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Corners Total (Over 7.5 clearly visible) */}
                    {prediction.markets.cornersTotal && (
                      <div className="border border-edge-border rounded-lg overflow-hidden bg-edge-bg">
                        <button
                          onClick={() => toggleMarket('cornersTotal')}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium text-white hover:bg-edge-card transition"
                        >
                          <span className="flex items-center gap-1.5">
                            <span>{prediction.markets.cornersTotal.title}</span>
                            <span className="text-[10px] text-edge-muted">(Negative Binomial)</span>
                          </span>
                          {expandedMarkets.cornersTotal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {expandedMarkets.cornersTotal && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 pt-0 border-t border-edge-border/50">
                            {prediction.markets.cornersTotal.selections.map((sel, i) => (
                              <button
                                key={i}
                                onClick={() => handleAddPickToSlip(sel, prediction.markets.cornersTotal.title)}
                                className={`p-2 rounded bg-edge-card border text-center transition ${
                                  sel.outcome === 'Over 7.5'
                                    ? 'border-edge-accent bg-edge-accent/10'
                                    : 'border-edge-border hover:border-gray-500'
                                }`}
                              >
                                <span className="text-[11px] text-edge-muted block">{sel.outcome}</span>
                                <span className="text-xs font-bold text-white block">{Math.round(sel.probability * 100)}%</span>
                                <span className="text-[10px] text-edge-muted tabular-nums font-mono">@{displayOdds(sel.fairOdds)}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cards Total */}
                    {prediction.markets.cardsTotal && (
                      <div className="border border-edge-border rounded-lg overflow-hidden bg-edge-bg">
                        <button
                          onClick={() => toggleMarket('cardsTotal')}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium text-white hover:bg-edge-card transition"
                        >
                          <span>{prediction.markets.cardsTotal.title}</span>
                          {expandedMarkets.cardsTotal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {expandedMarkets.cardsTotal && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 pt-0 border-t border-edge-border/50">
                            {prediction.markets.cardsTotal.selections.map((sel, i) => (
                              <button
                                key={i}
                                onClick={() => handleAddPickToSlip(sel, prediction.markets.cardsTotal.title)}
                                className="p-2 rounded bg-edge-card border border-edge-border text-center hover:border-edge-accent transition"
                              >
                                <span className="text-[11px] text-edge-muted block">{sel.outcome}</span>
                                <span className="text-xs font-bold text-white block">{Math.round(sel.probability * 100)}%</span>
                                <span className="text-[10px] text-edge-muted tabular-nums font-mono">@{displayOdds(sel.fairOdds)}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-6 text-center text-xs text-edge-muted">
                  No predictions generated for this fixture.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SUMMARY (EVENTS TIMELINE) */}
          {activeTab === 'summary' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-edge-muted px-1">
                Event Timeline
              </h3>
              {fixture.events && fixture.events.length > 0 ? (
                <div className="space-y-2 border-l-2 border-edge-border ml-2 pl-4">
                  {fixture.events.map((ev) => (
                    <div key={ev.id} className="relative flex items-center justify-between py-1 text-xs">
                      <span className="absolute -left-[23px] w-3 h-3 rounded-full bg-edge-border border-2 border-edge-card"></span>
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums font-bold text-edge-live w-7">
                          {ev.minute}'
                        </span>
                        <span className="text-sm">
                          {ev.type === 'GOAL' ? '⚽' : ev.type === 'CARD_YELLOW' ? '🟨' : ev.type === 'CARD_RED' ? '🟥' : '🔄'}
                        </span>
                        <span className="font-medium text-white">{ev.playerName}</span>
                        {ev.assistPlayerName && (
                          <span className="text-edge-muted text-[11px]">
                            (assist: {ev.assistPlayerName})
                          </span>
                        )}
                        {ev.subOutPlayerName && (
                          <span className="text-edge-muted text-[11px]">
                            (out: {ev.subOutPlayerName})
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] uppercase text-edge-muted">
                        {ev.teamSide === 'home' ? fixture.homeTeam.shortName : fixture.awayTeam.shortName}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-edge-muted bg-edge-bg rounded-lg border border-edge-border">
                  {isLive ? 'No major match events yet.' : 'Events timeline will be logged as the match kicks off.'}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LINEUPS */}
          {activeTab === 'lineups' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Home Lineup */}
                <div className="p-3 bg-edge-bg rounded-lg border border-edge-border space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center justify-between">
                    <span>{fixture.homeTeam.name}</span>
                    <span className="text-[10px] text-edge-muted">4-3-3</span>
                  </h4>
                  <ul className="text-xs space-y-1.5 text-gray-300">
                    <li className="flex items-center justify-between"><span>1. Raya (GK)</span></li>
                    <li className="flex items-center justify-between"><span>4. White (DF)</span></li>
                    <li className="flex items-center justify-between"><span>2. Saliba (DF)</span></li>
                    <li className="flex items-center justify-between"><span>6. Gabriel (DF)</span></li>
                    <li className="flex items-center justify-between"><span>12. Timber (DF)</span></li>
                    <li className="flex items-center justify-between"><span>5. Partey (MF)</span></li>
                    <li className="flex items-center justify-between"><span>41. Rice (MF)</span></li>
                    <li className="flex items-center justify-between"><span>8. Odegaard (MF)</span></li>
                    <li className="flex items-center justify-between"><span>7. Saka (FW)</span></li>
                    <li className="flex items-center justify-between"><span>29. Havertz (FW)</span></li>
                    <li className="flex items-center justify-between"><span>11. Martinelli (FW)</span></li>
                  </ul>
                </div>

                {/* Away Lineup */}
                <div className="p-3 bg-edge-bg rounded-lg border border-edge-border space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center justify-between">
                    <span>{fixture.awayTeam.name}</span>
                    <span className="text-[10px] text-edge-muted">4-2-3-1</span>
                  </h4>
                  <ul className="text-xs space-y-1.5 text-gray-300">
                    <li className="flex items-center justify-between"><span>1. Kobel (GK)</span></li>
                    <li className="flex items-center justify-between"><span>26. Ryerson (DF)</span></li>
                    <li className="flex items-center justify-between"><span>4. Schlotterbeck (DF)</span></li>
                    <li className="flex items-center justify-between"><span>3. Anton (DF)</span></li>
                    <li className="flex items-center justify-between"><span>5. Bensebaini (DF)</span></li>
                    <li className="flex items-center justify-between"><span>13. Gross (MF)</span></li>
                    <li className="flex items-center justify-between"><span>23. Can (MF)</span></li>
                    <li className="flex items-center justify-between"><span>20. Sabitzer (MF)</span></li>
                    <li className="flex items-center justify-between"><span>10. Brandt (MF)</span></li>
                    <li className="flex items-center justify-between"><span>27. Adeyemi (FW)</span></li>
                    <li className="flex items-center justify-between"><span>9. Guirassy (FW)</span></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-edge-muted px-1">
                Comparative Match Statistics
              </h3>
              {(() => {
                const s = fixture.liveStats || {
                  possession: [54, 46],
                  shotsTotal: [12, 9],
                  shotsOnTarget: [5, 3],
                  corners: [6, 4],
                  fouls: [9, 11],
                  yellowCards: [1, 2],
                };

                const statBars = [
                  { label: 'Ball Possession (%)', home: s.possession?.[0] ?? 50, away: s.possession?.[1] ?? 50 },
                  { label: 'Total Shots', home: s.shotsTotal?.[0] ?? 0, away: s.shotsTotal?.[1] ?? 0 },
                  { label: 'Shots on Target', home: s.shotsOnTarget?.[0] ?? 0, away: s.shotsOnTarget?.[1] ?? 0 },
                  { label: 'Corner Kicks', home: s.corners?.[0] ?? 0, away: s.corners?.[1] ?? 0 },
                  { label: 'Fouls Committed', home: s.fouls?.[0] ?? 0, away: s.fouls?.[1] ?? 0 },
                  { label: 'Yellow Cards', home: s.yellowCards?.[0] ?? 0, away: s.yellowCards?.[1] ?? 0 },
                ];

                return (
                  <div className="space-y-3 bg-edge-bg p-3.5 rounded-lg border border-edge-border">
                    {statBars.map((b, idx) => {
                      const total = b.home + b.away || 1;
                      const hPercent = Math.round((b.home / total) * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span className="tabular-nums text-white font-semibold">{b.home}</span>
                            <span className="text-[11px] text-edge-muted">{b.label}</span>
                            <span className="tabular-nums text-white font-semibold">{b.away}</span>
                          </div>
                          <div className="flex h-1.5 w-full bg-edge-border rounded-full overflow-hidden">
                            <div className="bg-edge-accent" style={{ width: `${hPercent}%` }}></div>
                            <div className="bg-gray-400" style={{ width: `${100 - hPercent}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 5: H2H */}
          {activeTab === 'h2h' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-edge-muted px-1">
                Head to Head (Previous Matches)
              </h3>
              <div className="space-y-2">
                {[
                  { date: '18 Apr 2024', home: fixture.homeTeam.name, away: fixture.awayTeam.name, score: '1 - 0' },
                  { date: '09 Jan 2023', home: fixture.awayTeam.name, away: fixture.homeTeam.name, score: '2 - 2' },
                  { date: '15 Oct 2022', home: fixture.homeTeam.name, away: fixture.awayTeam.name, score: '3 - 1' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-edge-bg border border-edge-border text-xs"
                  >
                    <span className="text-edge-muted tabular-nums">{item.date}</span>
                    <span className="text-white font-medium">
                      {item.home} vs {item.away}
                    </span>
                    <span className="font-bold tabular-nums font-mono text-gray-200">
                      {item.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: STANDINGS */}
          {activeTab === 'standings' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-edge-muted px-1">
                {fixture.leagueName} Standings
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-edge-bg text-[10px] uppercase text-edge-muted border-b border-edge-border">
                    <tr>
                      <th className="py-2 px-2">#</th>
                      <th className="py-2 px-2">Team</th>
                      <th className="py-2 px-1 text-center">P</th>
                      <th className="py-2 px-1 text-center">W</th>
                      <th className="py-2 px-1 text-center">D</th>
                      <th className="py-2 px-1 text-center">L</th>
                      <th className="py-2 px-2 text-center font-bold">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-edge-border/50 text-gray-200">
                    {[
                      { pos: 1, name: fixture.homeTeam.name, p: 12, w: 9, d: 2, l: 1, pts: 29 },
                      { pos: 2, name: 'Real Madrid', p: 12, w: 8, d: 3, l: 1, pts: 27 },
                      { pos: 3, name: fixture.awayTeam.name, p: 12, w: 7, d: 3, l: 2, pts: 24 },
                      { pos: 4, name: 'Bayern Munich', p: 12, w: 7, d: 2, l: 3, pts: 23 },
                      { pos: 5, name: 'PSG', p: 12, w: 6, d: 3, l: 3, pts: 21 },
                    ].map((row) => (
                      <tr key={row.pos} className="hover:bg-edge-bg/50">
                        <td className="py-2 px-2 font-mono tabular-nums">{row.pos}</td>
                        <td className="py-2 px-2 font-medium text-white">{row.name}</td>
                        <td className="py-2 px-1 text-center tabular-nums">{row.p}</td>
                        <td className="py-2 px-1 text-center tabular-nums">{row.w}</td>
                        <td className="py-2 px-1 text-center tabular-nums">{row.d}</td>
                        <td className="py-2 px-1 text-center tabular-nums">{row.l}</td>
                        <td className="py-2 px-2 text-center font-bold text-white tabular-nums">{row.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
