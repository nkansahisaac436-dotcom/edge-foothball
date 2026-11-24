import React, { useState, useEffect } from 'react';
import { getStrongestPicks } from '../services/api.js';
import { useAccumulator } from '../context/AccumulatorContext.js';
import { Sparkles, Plus, Check, ShieldCheck, Clock } from 'lucide-react';

interface StrongestPicksPanelProps {
  leagueId?: string;
  onSelectMatch?: (fixture: any) => void;
}

export const StrongestPicksPanel: React.FC<StrongestPicksPanelProps> = ({ leagueId = 'CL', onSelectMatch }) => {
  const [picks, setPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addLeg, removeLeg, hasLeg } = useAccumulator();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getStrongestPicks(leagueId)
      .then((data) => {
        if (isMounted) {
          setPicks(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch strongest picks');
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
        <div className="w-8 h-8 border-2 border-sporty-green border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gray-400 font-mono">Scanning markets for high-probability picks...</p>
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
      <div className="p-8 text-center text-gray-400 text-xs font-mono">
        No high-probability picks found matching criteria for this league.
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-1 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-sporty-green" />
          <h3 className="font-bold text-sm text-white">Strongest Model Picks (Ranked by Probability)</h3>
        </div>
        <span className="text-xs text-gray-400 font-mono">{picks.length} picks</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {picks.map((pick, idx) => {
          const legId = `${pick.matchId}_strong_${pick.outcome}`;
          const inSlip = hasLeg(legId);
          const probPct = pick.probability * 100;

          return (
            <div
              key={idx}
              className="p-3 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                  <span className="font-semibold text-white truncate max-w-[200px]">
                    {pick.match}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-gray-800 font-mono text-[10px]">
                    #{idx + 1}
                  </span>
                </div>

                <div className="text-xs font-bold text-sporty-green flex items-center space-x-1.5">
                  <span>{pick.market}</span>
                  {pick.isEstimate && (
                    <span className="text-[9px] text-amber-400 font-normal"> (est)</span>
                  )}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-gray-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase font-mono block">Probability</span>
                    <span className="text-xs font-bold font-mono text-white">{probPct.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase font-mono block">Fair Odds</span>
                    <span className="text-xs font-bold font-mono text-sporty-green">@{pick.fairOdds.toFixed(2)}</span>
                  </div>
                </div>

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
                        probability: pick.probability,
                        fairOdds: pick.fairOdds,
                        isEstimate: pick.isEstimate,
                      });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1 transition ${
                    inSlip
                      ? 'bg-sporty-green text-black border-sporty-green'
                      : 'bg-gray-800 text-gray-200 border-gray-700 hover:border-sporty-green hover:text-white'
                  }`}
                >
                  {inSlip ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{inSlip ? 'In Slip' : 'Add to Slip'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
