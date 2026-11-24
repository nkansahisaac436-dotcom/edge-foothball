import React, { useState } from 'react';
import { useAccumulator } from '../context/AccumulatorContext.js';
import { useSettings } from '../context/SettingsContext.js';
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

  const { t, displayOdds } = useSettings();
  const [copied, setCopied] = useState(false);

  if (legs.length === 0) return null;

  const hasHighRisk = legs.length > 3;

  const handleCopySlip = () => {
    const text = legs
      .map(
        (l, i) =>
          `${i + 1}. ${l.matchTitle} - ${l.name} (${(l.probability * 100).toFixed(0)}% @${displayOdds(l.fairOdds)})`
      )
      .join('\n');
    const fullText = `🎯 Matchday Edge Slip (${legs.length} Legs):\n${text}\n\nCombined Prob: ${(
      combinedProbability * 100
    ).toFixed(1)}%\nCombined Odds: @${displayOdds(combinedFairOdds)}\n\n⚠️ ${t.accumulatorWarning}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto px-3 pb-safe">
      <div className="bg-edge-card border border-edge-border rounded-t-xl shadow-2xl overflow-hidden transition-all">
        {/* Persistent Floating Bar / Toggle Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-edge-bg border-b border-edge-border flex items-center justify-between text-left hover:bg-edge-bg/80 transition"
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Layers className="w-5 h-5 text-edge-accent" />
              <span className="tabular-nums absolute -top-2 -right-2 px-1.5 py-0.2 rounded-full bg-edge-accent text-white font-bold text-[10px]">
                {legs.length}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs text-white uppercase tracking-wider">
                  {t.slip}
                </span>
                <span className="tabular-nums text-[10px] text-edge-muted font-mono">
                  ({legs.length} {legs.length === 1 ? 'Leg' : 'Legs'})
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] font-mono tabular-nums">
                <span className="text-edge-muted">
                  Prob: <strong className="text-white">{(combinedProbability * 100).toFixed(1)}%</strong>
                </span>
                <span className="text-edge-accent font-bold">
                  @{displayOdds(combinedFairOdds)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-edge-accent font-medium">
              {isOpen ? 'Minimize' : 'View Slip'}
            </span>
            {isOpen ? <ChevronDown className="w-4 h-4 text-edge-muted" /> : <ChevronUp className="w-4 h-4 text-edge-muted" />}
          </div>
        </button>

        {/* Expanded Slip Content */}
        {isOpen && (
          <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3 text-xs bg-edge-card">
            {/* >3 Legs High Risk Warning */}
            {hasHighRisk && (
              <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg text-amber-300 text-[11px] flex items-start space-x-2 leading-relaxed">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <strong className="block text-amber-200 mb-0.5">⚠️ {t.highRiskWarning}</strong>
                  Accumulators multiply risk rapidly. Each added selection significantly reduces winning probability. Consider singles or doubles instead.
                </div>
              </div>
            )}

            {/* List of Selections */}
            <div className="space-y-2">
              {legs.map((leg) => (
                <div
                  key={leg.id}
                  className="p-2.5 bg-edge-bg rounded-lg border border-edge-border flex items-center justify-between"
                >
                  <div className="truncate pr-2">
                    <span className="text-[10px] text-edge-muted block truncate">{leg.matchTitle}</span>
                    <span className="font-semibold text-xs text-white truncate block">{leg.name}</span>
                    <span className="text-[10px] text-edge-muted font-mono tabular-nums">
                      {Math.round(leg.probability * 100)}% • Fair: @{displayOdds(leg.fairOdds)}
                    </span>
                  </div>

                  <button
                    onClick={() => removeLeg(leg.id)}
                    className="p-1.5 text-edge-muted hover:text-red-400 transition"
                    title="Remove selection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary & Responsible Gambling Bar */}
            <div className="p-3 bg-edge-bg rounded-lg border border-edge-border space-y-2">
              <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                <span className="text-edge-muted">{t.combinedOdds}:</span>
                <span className="text-sm font-bold text-white">@{displayOdds(combinedFairOdds)}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                <span className="text-edge-muted">{t.combinedProb}:</span>
                <span className="text-sm font-bold text-white">{(combinedProbability * 100).toFixed(1)}%</span>
              </div>
              <p className="text-[10px] text-edge-muted italic pt-1 border-t border-edge-border">
                {t.accumulatorWarning}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={handleCopySlip}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-edge-bg hover:bg-edge-border border border-edge-border text-xs text-white font-medium transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Selections'}</span>
              </button>
              <button
                onClick={clearSlip}
                className="py-2 px-3 rounded-lg bg-edge-bg hover:bg-red-950/30 border border-edge-border text-xs text-red-400 font-medium transition"
              >
                {t.clearSlip}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
