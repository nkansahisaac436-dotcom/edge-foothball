import React from 'react';
import { MatchAnalysis, MatchFixture } from '../types/index.js';
import { TrendingUp, Shield, Activity, Target, Flag, AlertCircle } from 'lucide-react';

interface MatchAnalysisSectionProps {
  analysis: MatchAnalysis;
  fixture: MatchFixture;
}

export const MatchAnalysisSection: React.FC<MatchAnalysisSectionProps> = ({
  analysis,
  fixture,
}) => {
  return (
    <div className="mt-4 p-4 rounded-xl bg-gray-900/90 border border-gray-800 text-xs text-gray-200 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-sporty-green" />
          <h4 className="font-bold text-sm text-white uppercase tracking-wider">
            Match Statistical Analysis
          </h4>
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-sporty-green/10 border border-sporty-green/30 text-sporty-green">
          <span className="text-[10px] uppercase font-bold">Most Likely:</span>
          <span className="font-mono font-bold text-white">
            {analysis.mostLikelyScore.home} - {analysis.mostLikelyScore.away}
          </span>
          <span className="text-[10px] text-gray-400">
            ({(analysis.mostLikelyScore.probability * 100).toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Form Comparison (Last 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Home Form */}
        <div className="p-2.5 rounded-lg bg-gray-950/60 border border-gray-800/80">
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-semibold text-gray-300 truncate">{fixture.homeTeam.name} Form</span>
            <span className="text-[10px] text-gray-500">Last 5</span>
          </div>
          <div className="flex space-x-1.5">
            {analysis.homeForm.map((rec, i) => (
              <span
                key={i}
                title={`${rec.result} vs ${rec.opponent} (${rec.score})`}
                className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] ${
                  rec.result === 'W'
                    ? 'bg-emerald-500 text-black'
                    : rec.result === 'D'
                    ? 'bg-amber-500 text-black'
                    : 'bg-red-500 text-white'
                }`}
              >
                {rec.result}
              </span>
            ))}
          </div>
        </div>

        {/* Away Form */}
        <div className="p-2.5 rounded-lg bg-gray-950/60 border border-gray-800/80">
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-semibold text-gray-300 truncate">{fixture.awayTeam.name} Form</span>
            <span className="text-[10px] text-gray-500">Last 5</span>
          </div>
          <div className="flex space-x-1.5">
            {analysis.awayForm.map((rec, i) => (
              <span
                key={i}
                title={`${rec.result} vs ${rec.opponent} (${rec.score})`}
                className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] ${
                  rec.result === 'W'
                    ? 'bg-emerald-500 text-black'
                    : rec.result === 'D'
                    ? 'bg-amber-500 text-black'
                    : 'bg-red-500 text-white'
                }`}
              >
                {rec.result}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Attack vs Defense Comparison & Expectations */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2.5 rounded-lg bg-gray-950/70 border border-gray-800">
          <div className="flex items-center justify-center space-x-1 text-gray-400 mb-1">
            <Target className="w-3.5 h-3.5 text-sporty-green" />
            <span className="text-[10px] font-bold uppercase">Expected Goals (xG)</span>
          </div>
          <div className="text-base font-black font-mono text-white">
            {analysis.expectedGoalsHome.toFixed(2)} - {analysis.expectedGoalsAway.toFixed(2)}
          </div>
          <div className="text-[10px] text-gray-400">Total: {(analysis.expectedGoalsHome + analysis.expectedGoalsAway).toFixed(2)}</div>
        </div>

        <div className="p-2.5 rounded-lg bg-gray-950/70 border border-gray-800">
          <div className="flex items-center justify-center space-x-1 text-gray-400 mb-1">
            <Flag className="w-3.5 h-3.5 text-sporty-blue" />
            <span className="text-[10px] font-bold uppercase">Expected Corners</span>
          </div>
          <div className="text-base font-black font-mono text-white">
            {analysis.expectedCornersHome.toFixed(1)} - {analysis.expectedCornersAway.toFixed(1)}
          </div>
          <div className="text-[10px] text-gray-400">Total: {(analysis.expectedCornersHome + analysis.expectedCornersAway).toFixed(1)}</div>
        </div>

        <div className="p-2.5 rounded-lg bg-gray-950/70 border border-gray-800">
          <div className="flex items-center justify-center space-x-1 text-gray-400 mb-1">
            <Shield className="w-3.5 h-3.5 text-sporty-gold" />
            <span className="text-[10px] font-bold uppercase">Expected Cards</span>
          </div>
          <div className="text-base font-black font-mono text-white">
            {analysis.expectedCardsHome.toFixed(1)} - {analysis.expectedCardsAway.toFixed(1)}
          </div>
          <div className="text-[10px] text-gray-400">Total: {(analysis.expectedCardsHome + analysis.expectedCardsAway).toFixed(1)}</div>
        </div>
      </div>

      {/* Plain Words Narrative Summary */}
      <div className="p-3 rounded-lg bg-gray-950/40 border border-gray-800/80 leading-relaxed text-gray-300">
        <p>{analysis.summaryText}</p>
      </div>

      {/* Key Statistical Insights */}
      {analysis.keyInsights.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Key Model Insights</span>
          <ul className="space-y-1">
            {analysis.keyInsights.map((insight, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-[11px] text-gray-300">
                <span className="text-sporty-green font-bold">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
