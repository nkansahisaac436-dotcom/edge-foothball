import React, { useState } from 'react';
import { MarketGroup, MarketSelection, MatchFixture } from '../types/index.js';
import { useAccumulator } from '../context/AccumulatorContext.js';
import { Plus, Check, TrendingUp, AlertTriangle } from 'lucide-react';

interface MarketGroupDrawerProps {
  markets: {
    result1X2: MarketGroup;
    doubleChance: MarketGroup;
    drawNoBet: MarketGroup;
    totalGoals: MarketGroup;
    oddEven: MarketGroup;
    btts: MarketGroup;
    bttsCombos: MarketGroup;
    cleanSheetWinToNil: MarketGroup;
    teamTotals: MarketGroup;
    handicapEuropean: MarketGroup;
    handicapAsian: MarketGroup;
    firstHalfResult: MarketGroup;
    firstHalfGoals: MarketGroup;
    secondHalfGoals: MarketGroup;
    highestScoringHalf: MarketGroup;
    halfTimeFullTime: MarketGroup;
    correctScores: MarketGroup;
    exactTotalGoals: MarketGroup;
    cornersTotal: MarketGroup;
    cornersTeam: MarketGroup;
    cornersFirstHalf: MarketGroup;
    cornersHandicap: MarketGroup;
    cornersMost: MarketGroup;
    cardsTotal: MarketGroup;
    cardsTeam: MarketGroup;
  };
  fixture: MatchFixture;
}

type MarketTabKey = 'result' | 'goals' | 'btts' | 'handicap' | 'halves' | 'corners' | 'cards' | 'scores';

export const MarketGroupDrawer: React.FC<MarketGroupDrawerProps> = ({ markets, fixture }) => {
  const [activeTab, setActiveTab] = useState<MarketTabKey>('result');
  const { addLeg, removeLeg, hasLeg } = useAccumulator();

  const tabs: { key: MarketTabKey; label: string; icon: string }[] = [
    { key: 'result', label: 'Result & DC', icon: '🎯' },
    { key: 'goals', label: 'Goals', icon: '⚽' },
    { key: 'btts', label: 'BTTS', icon: '🤝' },
    { key: 'handicap', label: 'Handicap', icon: '⚖️' },
    { key: 'halves', label: 'Halves & HT/FT', icon: '⏱️' },
    { key: 'corners', label: 'Corners', icon: '🚩' },
    { key: 'cards', label: 'Cards', icon: '🟨' },
    { key: 'scores', label: 'Exact Scores', icon: '🔢' },
  ];

  // Helper to render market rows
  const renderMarketSection = (group: MarketGroup) => {
    return (
      <div key={group.id} className="mb-4 last:mb-0">
        <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-800">
          <div className="flex items-center space-x-1.5">
            <h5 className="font-bold text-xs text-gray-200">{group.title}</h5>
            {group.isEstimate && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Estimate
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-500 font-mono">
            Confidence: {group.confidence}
          </span>
        </div>

        <div className="space-y-1.5">
          {group.selections.map((sel) => {
            const legId = `${fixture.id}_${group.id}_${sel.outcome}`;
            const inSlip = hasLeg(legId);
            const probPct = sel.probability * 100;
            const isHighlightCorner = sel.outcome === 'Over 7.5' && group.id.includes('corners');

            return (
              <div
                key={sel.outcome}
                className={`relative flex items-center justify-between p-2 rounded-lg border transition ${
                  isHighlightCorner
                    ? 'bg-sporty-green/10 border-sporty-green shadow-xs'
                    : inSlip
                    ? 'bg-gray-800/90 border-sporty-green/80'
                    : 'bg-gray-950/60 border-gray-800/80 hover:border-gray-700'
                }`}
              >
                {/* Background Progress Fill Bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 rounded-lg pointer-events-none transition-all ${
                    isHighlightCorner
                      ? 'bg-sporty-green/20'
                      : probPct >= 70
                      ? 'bg-emerald-500/15'
                      : probPct >= 50
                      ? 'bg-blue-500/15'
                      : 'bg-gray-700/15'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(4, probPct))}%` }}
                />

                {/* Left Side: Outcome Name & Tags */}
                <div className="relative z-10 flex items-center space-x-2 truncate pr-2">
                  <span className={`text-xs font-semibold ${isHighlightCorner ? 'text-sporty-green font-bold' : 'text-gray-100'}`}>
                    {sel.name}
                  </span>
                  {isHighlightCorner && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sporty-green text-black uppercase tracking-wider">
                      ★ Featured
                    </span>
                  )}
                  {sel.edge && sel.edge > 0.02 && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      Value +{(sel.edge * 100).toFixed(0)}%
                    </span>
                  )}
                </div>

                {/* Right Side: Probability, Fair Odds, Add to Slip Button */}
                <div className="relative z-10 flex items-center space-x-2.5 flex-shrink-0">
                  {/* Probability */}
                  <span className="text-xs font-mono font-bold text-gray-200">
                    {probPct.toFixed(1)}%
                  </span>

                  {/* Fair Odds */}
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-gray-400 uppercase font-mono">Fair</span>
                    <span className="text-xs font-mono font-bold text-sporty-green">
                      @{sel.fairOdds.toFixed(2)}
                    </span>
                  </div>

                  {/* Market Odds if present */}
                  {sel.marketOdds && (
                    <div className="hidden xs:flex flex-col items-end">
                      <span className="text-[9px] text-gray-400 uppercase font-mono">Bookie</span>
                      <span className="text-xs font-mono text-gray-300">
                        @{sel.marketOdds.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Add to Accumulator Button */}
                  <button
                    onClick={() => {
                      if (inSlip) {
                        removeLeg(legId);
                      } else {
                        addLeg({
                          id: legId,
                          matchId: fixture.id,
                          matchTitle: `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`,
                          marketTitle: group.title,
                          outcome: sel.outcome,
                          name: sel.name,
                          probability: sel.probability,
                          fairOdds: sel.fairOdds,
                          isEstimate: sel.isEstimate,
                        });
                      }
                    }}
                    className={`p-1.5 rounded-lg border transition ${
                      inSlip
                        ? 'bg-sporty-green text-black border-sporty-green'
                        : 'bg-gray-800 text-gray-300 border-gray-700 hover:text-white hover:border-sporty-green'
                    }`}
                    title={inSlip ? 'Remove from Slip' : 'Add to Accumulator'}
                  >
                    {inSlip ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 pt-3 border-t border-gray-800">
      {/* Category Tabs */}
      <div className="flex space-x-1 overflow-x-auto no-scrollbar pb-3 border-b border-gray-800/80">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === tab.key
                ? 'bg-sporty-green text-black shadow-xs font-bold'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Render Active Tab Markets */}
      <div className="mt-3">
        {activeTab === 'result' && (
          <div>
            {renderMarketSection(markets.result1X2)}
            {renderMarketSection(markets.doubleChance)}
            {renderMarketSection(markets.drawNoBet)}
          </div>
        )}

        {activeTab === 'goals' && (
          <div>
            {renderMarketSection(markets.totalGoals)}
            {renderMarketSection(markets.teamTotals)}
            {renderMarketSection(markets.oddEven)}
          </div>
        )}

        {activeTab === 'btts' && (
          <div>
            {renderMarketSection(markets.btts)}
            {renderMarketSection(markets.bttsCombos)}
            {renderMarketSection(markets.cleanSheetWinToNil)}
          </div>
        )}

        {activeTab === 'handicap' && (
          <div>
            {renderMarketSection(markets.handicapAsian)}
            {renderMarketSection(markets.handicapEuropean)}
          </div>
        )}

        {activeTab === 'halves' && (
          <div>
            {renderMarketSection(markets.firstHalfResult)}
            {renderMarketSection(markets.firstHalfGoals)}
            {renderMarketSection(markets.secondHalfGoals)}
            {renderMarketSection(markets.highestScoringHalf)}
            {renderMarketSection(markets.halfTimeFullTime)}
          </div>
        )}

        {activeTab === 'corners' && (
          <div>
            {renderMarketSection(markets.cornersTotal)}
            {renderMarketSection(markets.cornersTeam)}
            {renderMarketSection(markets.cornersFirstHalf)}
            {renderMarketSection(markets.cornersMost)}
            {renderMarketSection(markets.cornersHandicap)}
          </div>
        )}

        {activeTab === 'cards' && (
          <div>
            {renderMarketSection(markets.cardsTotal)}
            {renderMarketSection(markets.cardsTeam)}
          </div>
        )}

        {activeTab === 'scores' && (
          <div>
            {renderMarketSection(markets.correctScores)}
            {renderMarketSection(markets.exactTotalGoals)}
          </div>
        )}
      </div>
    </div>
  );
};
