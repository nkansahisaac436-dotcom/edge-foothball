import React, { useState, useEffect } from 'react';
import { getValuePicks } from '../services/api.js';
import { useAccumulator } from '../context/AccumulatorContext.js';
import { TrendingUp, Plus, Check, Percent, ArrowUpRight } from 'lucide-react';

interface ValuePicksPanelProps {
  leagueId: string;
}

export const ValuePicksPanel: React.FC<ValuePicksPanelProps> = ({ leagueId }) => {
  const [picks, setPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addLeg, removeLeg, hasLeg } = useAccumulator();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getValuePicks(leagueId)
      .then((data) => {
        if (isMounted) {
          setPicks(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch value picks');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [leagueId]);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-sporty-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gray-400 font-mono">Comparing model predictions against bookmaker implied odds...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 my-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
        {error}
      </div>
    );
  }

  if (picks.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-900 border border-gray-800 rounded-2xl max-w-xl mx-auto">
        <TrendingUp className="w-8 h-8 text-gray-500 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-gray-200">No Significant Positive Edges Found</h4>
        <p className="text-xs text-gray-400 mt-1">
          The bookmaker market is currently tightly priced or odds have not been issued yet for this league round.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-1 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-sporty-gold" />
          <h3 className="font-bold text-sm text-white">Value Bets (Positive Mathematical Edge)</h3>
        </div>
        <span className="text-xs text-gray-400 font-mono">{picks.length} value opportunities</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {picks.map((pick, idx) => {
          const legId = `${pick.matchId}_value_${pick.outcome}`;
          const inSlip = hasLeg(legId);

          return (
            <div
              key={idx}
              className="p-3 bg-gray-900 border border-amber-500/30 hover:border-amber-500/60 rounded-xl transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                  <span className="font-semibold text-white truncate max-w-[200px]">
                    {pick.match}
                  </span>
                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+{pick.edge}% Edge</span>
                  </span>
                </div>

                <div className="text-xs font-bold text-amber-400">
                  {pick.market}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-1 bg-gray-950/70 p-2 rounded-lg border border-gray-800 text-center font-mono">
                <div>
                  <span className="text-[9px] text-gray-400 uppercase block">Model Prob</span>
                  <span className="text-xs font-bold text-white">{(pick.modelProbability * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 uppercase block">Implied Prob</span>
                  <span className="text-xs font-bold text-gray-400">{(pick.impliedProbability * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 uppercase block">Bookie Odds</span>
                  <span className="text-xs font-bold text-sporty-green">@{pick.marketOdds.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-gray-800/80 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-mono">
                  Fair Odds: @{pick.fairOdds.toFixed(2)}
                </span>

                <button
                  onClick={() => {
                    if (inSlip) {
                      removeLeg(legId);
                    } else {
                      addLeg({
                        id: legId,
                        matchId: pick.matchId,
                        matchTitle: pick.match,
                        marketTitle: pick.market,
                        outcome: pick.outcome,
                        name: pick.market,
                        probability: pick.modelProbability,
                        fairOdds: pick.fairOdds,
                      });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1 transition ${
                    inSlip
                      ? 'bg-sporty-green text-black border-sporty-green'
                      : 'bg-gray-800 text-gray-200 border-gray-700 hover:border-amber-400 hover:text-white'
                  }`}
                >
                  {inSlip ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{inSlip ? 'In Slip' : 'Add Value Bet'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
