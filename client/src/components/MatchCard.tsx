import React, { useState } from 'react';
import { MatchFixture, MatchPrediction } from '../types/index.js';
import { getMatchPredictions } from '../services/api.js';
import { MarketGroupDrawer } from './MarketGroupDrawer.js';
import { MatchAnalysisSection } from './MatchAnalysisSection.js';
import { ChevronDown, ChevronUp, Shield, Sparkles, Clock, AlertCircle, Plus, Check } from 'lucide-react';
import { useAccumulator } from '../context/AccumulatorContext.js';

interface MatchCardProps {
  fixture: MatchFixture;
  timezone: string;
  initialPrediction?: MatchPrediction;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  fixture,
  timezone,
  initialPrediction,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [prediction, setPrediction] = useState<MatchPrediction | null>(initialPrediction || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addLeg, removeLeg, hasLeg } = useAccumulator();

  const handleToggleExpand = async () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);

    if (nextState && !prediction && !loading) {
      setLoading(true);
      setError(null);
      try {
        const pred = await getMatchPredictions(fixture.id, fixture.leagueId);
        setPrediction(pred);
      } catch (err: any) {
        setError(err.message || 'Failed to load predictions');
      } finally {
        setLoading(false);
      }
    }
  };

  // Format date & kickoff in Africa/Accra or selected timezone
  const formatKickoff = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: timezone,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  // Calculate 1X2 probabilities for the collapsed preview bar
  let pHome = 0.45;
  let pDraw = 0.28;
  let pAway = 0.27;

  if (prediction) {
    const h = prediction.markets.result1X2.selections.find((s) => s.outcome === '1')?.probability;
    const d = prediction.markets.result1X2.selections.find((s) => s.outcome === 'X')?.probability;
    const a = prediction.markets.result1X2.selections.find((s) => s.outcome === '2')?.probability;
    if (h && d && a) {
      pHome = h;
      pDraw = d;
      pAway = a;
    }
  } else if (fixture.odds) {
    const qH = 1 / fixture.odds.homeWin;
    const qD = 1 / fixture.odds.draw;
    const qA = 1 / fixture.odds.awayWin;
    const s = qH + qD + qA;
    pHome = qH / s;
    pDraw = qD / s;
    pAway = qA / s;
  }

  const confidence = prediction?.confidence || 'High';
  const confidenceBadgeColor =
    confidence === 'High'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      : confidence === 'Medium'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/40 hover:border-gray-700 transition">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-3 font-mono">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-sans font-bold text-[10px]">
            {fixture.round || fixture.leagueName}
          </span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-sporty-green" />
            <span>{formatKickoff(fixture.utcDate)}</span>
          </span>
        </div>

        {/* Confidence Badge */}
        <div
          title={prediction?.confidenceReason || 'Data confidence level'}
          className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 ${confidenceBadgeColor}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          <span>{confidence} Confidence</span>
        </div>
      </div>

      {/* Teams Row */}
      <div className="grid grid-cols-7 items-center gap-2 my-2">
        {/* Home Team */}
        <div className="col-span-3 flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center p-1 border border-gray-700 flex-shrink-0">
            {fixture.homeTeam.logo ? (
              <img
                src={fixture.homeTeam.logo}
                alt={fixture.homeTeam.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="font-bold text-xs text-gray-300">{fixture.homeTeam.name.slice(0, 3)}</span>
            )}
          </div>
          <span className="font-bold text-sm text-white truncate" title={fixture.homeTeam.name}>
            {fixture.homeTeam.name}
          </span>
        </div>

        {/* VS / Score */}
        <div className="col-span-1 text-center">
          {fixture.status === 'FINISHED' || fixture.status === 'LIVE' ? (
            <div className="flex flex-col items-center">
              <span className="font-black font-mono text-sm sm:text-base text-sporty-green">
                {fixture.score?.fullTime.home ?? 0} - {fixture.score?.fullTime.away ?? 0}
              </span>
              <span className="text-[9px] font-bold text-sporty-red animate-pulse">
                {fixture.status}
              </span>
            </div>
          ) : (
            <span className="text-xs font-bold font-mono text-gray-400 bg-gray-800/80 px-2 py-1 rounded-md border border-gray-700">
              VS
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="col-span-3 flex items-center justify-end space-x-2.5 text-right">
          <span className="font-bold text-sm text-white truncate" title={fixture.awayTeam.name}>
            {fixture.awayTeam.name}
          </span>
          <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center p-1 border border-gray-700 flex-shrink-0">
            {fixture.awayTeam.logo ? (
              <img
                src={fixture.awayTeam.logo}
                alt={fixture.awayTeam.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="font-bold text-xs text-gray-300">{fixture.awayTeam.name.slice(0, 3)}</span>
            )}
          </div>
        </div>
      </div>

      {/* 1X2 Probability Bar */}
      <div className="mt-3.5 mb-2">
        <div className="flex justify-between text-[11px] font-mono text-gray-400 mb-1">
          <span className="text-sporty-green font-bold">1: {(pHome * 100).toFixed(0)}%</span>
          <span className="text-amber-400 font-bold">X: {(pDraw * 100).toFixed(0)}%</span>
          <span className="text-sporty-blue font-bold">2: {(pAway * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-800 rounded-full flex overflow-hidden p-0.5 space-x-0.5">
          <div
            style={{ width: `${pHome * 100}%` }}
            className="h-full bg-sporty-green rounded-l-full transition-all duration-500"
            title={`Home Win: ${(pHome * 100).toFixed(1)}%`}
          />
          <div
            style={{ width: `${pDraw * 100}%` }}
            className="h-full bg-amber-400 transition-all duration-500"
            title={`Draw: ${(pDraw * 100).toFixed(1)}%`}
          />
          <div
            style={{ width: `${pAway * 100}%` }}
            className="h-full bg-sporty-blue rounded-r-full transition-all duration-500"
            title={`Away Win: ${(pAway * 100).toFixed(1)}%`}
          />
        </div>
      </div>

      {/* Top 3 Picks Preview Chips */}
      {prediction?.topPicks && prediction.topPicks.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center space-x-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Top Picks:</span>
          </span>
          {prediction.topPicks.map((pick) => {
            const legId = `${fixture.id}_top_${pick.outcome}`;
            const inSlip = hasLeg(legId);
            return (
              <button
                key={pick.outcome}
                onClick={() => {
                  if (inSlip) {
                    removeLeg(legId);
                  } else {
                    addLeg({
                      id: legId,
                      matchId: fixture.id,
                      matchTitle: `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`,
                      marketTitle: 'Top Model Pick',
                      outcome: pick.outcome,
                      name: pick.name,
                      probability: pick.probability,
                      fairOdds: pick.fairOdds,
                      isEstimate: pick.isEstimate,
                    });
                  }
                }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                  inSlip
                    ? 'bg-sporty-green text-black border-sporty-green'
                    : 'bg-gray-800/80 text-gray-200 border-gray-700 hover:border-sporty-green'
                }`}
              >
                <span>{pick.name}</span>
                <span className="font-mono text-sporty-green bg-black/30 px-1 py-0.2 rounded text-[10px]">
                  {(pick.probability * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  @{pick.fairOdds.toFixed(2)}
                </span>
                {inSlip ? <Check className="w-3 h-3 stroke-[3]" /> : <Plus className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Expand / Collapse Action */}
      <div className="mt-4 pt-2 border-t border-gray-800/80 flex items-center justify-between">
        <button
          onClick={handleToggleExpand}
          className="w-full flex items-center justify-center space-x-1.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-sporty-green transition"
        >
          <span>{isExpanded ? 'Hide All Markets & Analysis' : 'Expand All Markets (Corners, Cards, Goals, Halves)'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Content Drawer */}
      {isExpanded && (
        <div className="mt-2">
          {loading && (
            <div className="py-8 flex flex-col items-center justify-center space-y-2">
              <div className="w-6 h-6 border-2 border-sporty-green border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-gray-400 font-mono">Running Dixon-Coles Poisson matrix & NegBinomial engine...</span>
            </div>
          )}

          {error && (
            <div className="p-3 my-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {prediction && (
            <>
              {/* Statistical Match Analysis */}
              <MatchAnalysisSection analysis={prediction.analysis} fixture={fixture} />

              {/* Complete SportyBet-Style Market Groups */}
              <MarketGroupDrawer markets={prediction.markets} fixture={fixture} />
            </>
          )}
        </div>
      )}
    </div>
  );
};
