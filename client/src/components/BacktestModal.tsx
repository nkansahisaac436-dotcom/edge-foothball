import React, { useState, useEffect } from 'react';
import { getBacktestResults } from '../services/api.js';
import { BacktestResults } from '../types/index.js';
import { X, BarChart3, CheckCircle2, TrendingUp, Info } from 'lucide-react';

interface BacktestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BacktestModal: React.FC<BacktestModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<BacktestResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !data) {
      setLoading(true);
      setError(null);
      getBacktestResults(200)
        .then((res) => {
          setData(res);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Backtest error');
          setLoading(false);
        });
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6 my-8 max-h-[90vh] overflow-y-auto text-xs text-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-sporty-gold" />
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">Model Backtest & Probability Calibration</h3>
              <p className="text-[11px] text-gray-400 font-mono">Evaluation on historical finished matches</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading && (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-sporty-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400 font-mono">Running backtest across historical match database...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
            {error}
          </div>
        )}

        {data && (
          <div className="mt-4 space-y-5">
            {/* Top Scorecard Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-[10px] uppercase font-mono text-gray-400 block mb-1">Evaluated Matches</span>
                <span className="text-lg font-black font-mono text-white">{data.totalMatches}</span>
              </div>
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-[10px] uppercase font-mono text-gray-400 block mb-1">1X2 Brier Score</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-lg font-black font-mono text-sporty-green">{data.matchResult1X2.brierScore}</span>
                  <span className="text-[10px] text-gray-500">(&lt;0.667 benchmark)</span>
                </div>
              </div>
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-[10px] uppercase font-mono text-gray-400 block mb-1">Over/Under 2.5 Acc</span>
                <span className="text-lg font-black font-mono text-white">{(data.totalGoals25.accuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-[10px] uppercase font-mono text-gray-400 block mb-1">BTTS Accuracy</span>
                <span className="text-lg font-black font-mono text-white">{(data.btts.accuracy * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Calibration Explanation */}
            <div className="p-3 rounded-xl bg-sporty-blue/10 border border-sporty-blue/30 text-gray-300 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-sporty-blue flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong className="text-white">What is Probability Calibration?</strong> A reliable prediction model ensures that when it assigns a <strong>70% probability</strong> to an outcome, that outcome actually wins approximately <strong>70 out of 100 times</strong>. Review the empirical win rate table below:
              </p>
            </div>

            {/* Calibration Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/80 text-[10px] text-gray-400 uppercase font-mono">
                    <th className="py-2.5 px-3">Probability Bracket</th>
                    <th className="py-2.5 px-3">Predictions (N)</th>
                    <th className="py-2.5 px-3">Avg Model Predicted</th>
                    <th className="py-2.5 px-3">Empirical Win Rate</th>
                    <th className="py-2.5 px-3">Calibration Gap</th>
                    <th className="py-2.5 px-3">Visual Alignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-mono text-[11px]">
                  {data.calibrationTable.map((bin, idx) => {
                    const is70Bracket = bin.binRange === '70% - 80%';
                    const gapAbs = Math.abs(bin.diff);

                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-gray-900/40 transition ${
                          is70Bracket ? 'bg-sporty-green/10 font-bold' : ''
                        }`}
                      >
                        <td className="py-2 px-3 flex items-center space-x-1.5">
                          {is70Bracket && <span className="text-sporty-green">★</span>}
                          <span>{bin.binRange}</span>
                        </td>
                        <td className="py-2 px-3 text-gray-400">{bin.count}</td>
                        <td className="py-2 px-3 text-white">{(bin.avgPredictedProb * 100).toFixed(1)}%</td>
                        <td className="py-2 px-3 text-sporty-green font-bold">
                          {(bin.actualWinRate * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              gapAbs <= 0.08
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : gapAbs <= 0.18
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-gray-800 text-gray-400'
                            }`}
                          >
                            {bin.diff > 0 ? `+${(bin.diff * 100).toFixed(1)}%` : `${(bin.diff * 100).toFixed(1)}%`}
                          </span>
                        </td>
                        <td className="py-2 px-3 min-w-[120px]">
                          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden flex">
                            <div
                              style={{ width: `${bin.actualWinRate * 100}%` }}
                              className="bg-sporty-green h-full"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 text-gray-400 text-[11px] leading-relaxed">
              <p>{data.summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
