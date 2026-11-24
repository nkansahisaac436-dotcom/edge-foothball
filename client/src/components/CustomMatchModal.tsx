import React, { useState } from 'react';
import { simulateCustomMatch } from '../services/api.js';
import { MatchPrediction } from '../types/index.js';
import { MatchCard } from './MatchCard.js';
import { X, SlidersHorizontal, Play, Sparkles } from 'lucide-react';

interface CustomMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  timezone: string;
}

export const CustomMatchModal: React.FC<CustomMatchModalProps> = ({
  isOpen,
  onClose,
  timezone,
}) => {
  const [homeTeam, setHomeTeam] = useState('Arsenal');
  const [awayTeam, setAwayTeam] = useState('Chelsea');
  const [inputMode, setInputMode] = useState<'odds' | 'ratings'>('odds');

  // Odds inputs
  const [homeOdds, setHomeOdds] = useState('1.95');
  const [drawOdds, setDrawOdds] = useState('3.50');
  const [awayOdds, setAwayOdds] = useState('3.90');

  // Ratings inputs
  const [homeAttack, setHomeAttack] = useState(1.35);
  const [awayAttack, setAwayAttack] = useState(1.15);
  const [homeDefense, setHomeDefense] = useState(0.85);
  const [awayDefense, setAwayDefense] = useState(1.05);

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<MatchPrediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const pred = await simulateCustomMatch({
        homeTeam,
        awayTeam,
        homeOdds: inputMode === 'odds' ? parseFloat(homeOdds) : undefined,
        drawOdds: inputMode === 'odds' ? parseFloat(drawOdds) : undefined,
        awayOdds: inputMode === 'odds' ? parseFloat(awayOdds) : undefined,
        homeAttackRating: homeAttack,
        awayAttackRating: awayAttack,
        homeDefenseRating: homeDefense,
        awayDefenseRating: awayDefense,
      });
      setPrediction(pred);
    } catch (err: any) {
      setError(err.message || 'Simulation error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-sporty-blue" />
            <h3 className="font-bold text-base sm:text-lg text-white">Custom Match Simulator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSimulate} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Home Team</label>
              <input
                type="text"
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-sporty-green"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Away Team</label>
              <input
                type="text"
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-sporty-green"
              />
            </div>
          </div>

          {/* Toggle Input Mode */}
          <div className="flex space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setInputMode('odds')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                inputMode === 'odds'
                  ? 'bg-sporty-green text-black'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              1X2 Odds Input
            </button>
            <button
              type="button"
              onClick={() => setInputMode('ratings')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                inputMode === 'ratings'
                  ? 'bg-sporty-green text-black'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Attack / Defense Ratings
            </button>
          </div>

          {/* Mode 1: 1X2 Odds */}
          {inputMode === 'odds' ? (
            <div className="grid grid-cols-3 gap-2 bg-gray-950/60 p-3 rounded-xl border border-gray-800">
              <div>
                <label className="text-[11px] text-gray-400 block font-mono mb-1">Home (1) Odds</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  max="50"
                  value={homeOdds}
                  onChange={(e) => setHomeOdds(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block font-mono mb-1">Draw (X) Odds</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  max="50"
                  value={drawOdds}
                  onChange={(e) => setDrawOdds(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block font-mono mb-1">Away (2) Odds</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  max="50"
                  value={awayOdds}
                  onChange={(e) => setAwayOdds(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white font-mono"
                />
              </div>
            </div>
          ) : (
            /* Mode 2: Attack/Defense Sliders */
            <div className="space-y-3 bg-gray-950/60 p-3 rounded-xl border border-gray-800 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">{homeTeam} Attack:</span>
                    <span className="font-mono text-sporty-green font-bold">{homeAttack.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="2.0"
                    step="0.05"
                    value={homeAttack}
                    onChange={(e) => setHomeAttack(parseFloat(e.target.value))}
                    className="w-full accent-sporty-green"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">{homeTeam} Defense:</span>
                    <span className="font-mono text-blue-400 font-bold">{homeDefense.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.05"
                    value={homeDefense}
                    onChange={(e) => setHomeDefense(parseFloat(e.target.value))}
                    className="w-full accent-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">{awayTeam} Attack:</span>
                    <span className="font-mono text-sporty-green font-bold">{awayAttack.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="2.0"
                    step="0.05"
                    value={awayAttack}
                    onChange={(e) => setAwayAttack(parseFloat(e.target.value))}
                    className="w-full accent-sporty-green"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">{awayTeam} Defense:</span>
                    <span className="font-mono text-blue-400 font-bold">{awayDefense.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.05"
                    value={awayDefense}
                    onChange={(e) => setAwayDefense(parseFloat(e.target.value))}
                    className="w-full accent-blue-400"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-sporty-green hover:bg-sporty-green-dark text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Simulate All Markets</span>
              </>
            )}
          </button>
        </form>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
            {error}
          </div>
        )}

        {/* Generated Match Results */}
        {prediction && (
          <div className="mt-6 pt-4 border-t border-gray-800">
            <h4 className="text-xs font-bold text-sporty-green uppercase tracking-wider mb-2 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulated Predictions & Markets</span>
            </h4>
            <MatchCard
              fixture={prediction.fixture}
              timezone={timezone}
              initialPrediction={prediction}
            />
          </div>
        )}
      </div>
    </div>
  );
};
