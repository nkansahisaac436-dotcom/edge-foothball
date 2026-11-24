import React, { useState } from 'react';
import { useAccumulator } from '../context/AccumulatorContext.js';
import { ChevronUp, ChevronDown, Trash2, AlertTriangle, Layers, Copy, Check } from 'lucide-react';

export const AccumulatorDrawer: React.FC = () => {
  const {
    legs,
    isOpen,
    setIsOpen,
    removeLeg,
    clearSlip,
    combinedProbability,
    combinedFairOdds,
  } = useAccumulator();

  const [copied, setCopied] = useState(false);

  if (legs.length === 0) return null;

  const handleCopySlip = () => {
    const text = legs
      .map(
        (l, i) =>
          `${i + 1}. ${l.matchTitle} - ${l.name} (${(l.probability * 100).toFixed(0)}% @${l.fairOdds.toFixed(2)})`
      )
      .join('\n');
    const fullText = `🎯 Matchday Edge Accumulator (${legs.length} Legs):\n${text}\n\nCombined Probability: ${(
      combinedProbability * 100
    ).toFixed(1)}%\nCombined Fair Odds: @${combinedFairOdds.toFixed(2)}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto px-3 pb-safe">
      <div className="bg-gray-900/95 backdrop-blur-md border border-gray-800 rounded-t-2xl shadow-2xl overflow-hidden transition-all">
        {/* Top Header Bar / Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 flex items-center justify-between text-left hover:brightness-110 transition border-b border-gray-800"
        >
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <Layers className="w-5 h-5 text-sporty-green" />
              <span className="absolute -top-2 -right-2 px-1.5 py-0.2 rounded-full bg-sporty-green text-black font-black text-[10px]">
                {legs.length}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs text-white uppercase tracking-wider">
                  Accumulator Slip
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  ({legs.length} {legs.length === 1 ? 'Leg' : 'Legs'})
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] font-mono">
                <span className="text-gray-300">
                  Combined Prob: <strong className="text-white">{(combinedProbability * 100).toFixed(1)}%</strong>
                </span>
                <span className="text-sporty-green font-bold">
                  @{combinedFairOdds.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-sporty-green font-semibold">
              {isOpen ? 'Minimize' : 'View Bets'}
            </span>
            {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
          </div>
        </button>

        {/* Expanded Slip Details */}
        {isOpen && (
          <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3 text-xs">
            {/* Accumulator Risk Warning */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[11px] flex items-start space-x-2 leading-relaxed">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="block text-amber-200 mb-0.5">⚠️ Accumulator Variance Warning:</strong>
                Combined bets lose exponentially more often than singles. For example, 3 independent selections each with a 70% probability result in only a <strong>34.3% combined win chance</strong> (0.70 × 0.70 × 0.70). Manage stake size carefully.
              </div>
            </div>

            {/* List of Legs */}
            <div className="space-y-2">
              {legs.map((leg) => (
                <div
                  key={leg.id}
                  className="p-2.5 bg-gray-950 rounded-xl border border-gray-800 flex items-center justify-between"
                >
                  <div className="truncate pr-2">
                    <span className="text-[10px] text-gray-400 block truncate">{leg.matchTitle}</span>
                    <span className="font-bold text-xs text-white truncate block">{leg.name}</span>
                    <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-mono mt-0.5">
                      <span>Prob: {(leg.probability * 100).toFixed(0)}%</span>
                      <span className="text-sporty-green">Fair: @{leg.fairOdds.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeLeg(leg.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-gray-800 rounded-lg transition"
                    title="Remove from accumulator"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center space-x-2 border-t border-gray-800">
              <button
                onClick={clearSlip}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold transition"
              >
                Clear Slip
              </button>

              <button
                onClick={handleCopySlip}
                className="flex-1 py-2 bg-sporty-green hover:bg-sporty-green-dark text-black rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition"
              >
                {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Slip!' : 'Copy Accumulator'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
