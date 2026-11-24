import React from 'react';
import { X, Cpu, Activity, AlertTriangle, ShieldCheck, BarChart2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.js';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBacktest?: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onOpenBacktest,
}) => {
  const { t } = useSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-edge-card border border-edge-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-edge-border bg-edge-bg/50">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-edge-accent" />
            <h2 className="text-base font-semibold text-white">How Our Prediction Engine Works</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-edge-muted hover:text-white hover:bg-edge-border/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto text-xs leading-relaxed text-gray-300">
          {/* Section 1: Goals */}
          <div className="p-3.5 rounded-lg bg-edge-bg border border-edge-border space-y-1.5">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              1. Goals: Dixon-Coles Poisson Model
            </h3>
            <p>
              Expected goals (\(\lambda\) and \(\mu\)) are estimated using each team's recent matches with exponential time decay (\(\xi \approx 0.92\)), home advantage, and league scoring baselines.
              A full 11×11 scoreline matrix (0 to 10 goals) is built with low-score correlation adjustments (\(\tau\)) for 0-0, 1-0, 0-1, and 1-1 scorelines.
            </p>
          </div>

          {/* Section 2: Market Odds Blending */}
          <div className="p-3.5 rounded-lg bg-edge-bg border border-edge-border space-y-1.5">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              2. Market Odds Blending (Wisdom of the Crowd)
            </h3>
            <p>
              When bookmaker odds are available, bookmaker profit margins (overrounds) are stripped using the multiplicative method. The de-overrounded market probabilities are blended with the statistical model (default 70% model, 30% market).
            </p>
          </div>

          {/* Section 3: Corners & Cards */}
          <div className="p-3.5 rounded-lg bg-edge-bg border border-edge-border space-y-1.5">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              3. Corners & Cards: Negative Binomial Model
            </h3>
            <p>
              Corners and cards exhibit variance significantly higher than their mean (overdispersion). We utilize the <strong>Negative Binomial distribution</strong> with a dispersion factor (\(r\)), adjusted for attack/defense strength gap and match closeness factor.
            </p>
          </div>

          {/* Section 4: In-Play Live Model */}
          <div className="p-3.5 rounded-lg bg-edge-bg border border-edge-border space-y-1.5">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              4. In-Play Dynamic Model
            </h3>
            <p>
              During live matches, probabilities update in real-time based on the remaining match duration and current score. Goals scored are locked in, and remaining time Poisson distributions project the likelihood of further goals.
            </p>
          </div>

          {/* Section 5: Responsible Gambling & Calibration */}
          <div className="p-3.5 rounded-lg bg-red-950/20 border border-red-900/40 text-red-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Responsible Gambling & Probability Reality</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Every probability displayed is a mathematical expectation calculated from historical data. <strong>A "70%" prediction will still lose approximately 3 out of every 10 times.</strong>
              No model can predict injuries, red cards, referee mistakes, or random variance. Never bet money you cannot afford to lose.
            </p>
          </div>

          {/* Backtest Button */}
          {onOpenBacktest && (
            <button
              onClick={() => {
                onClose();
                onOpenBacktest();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-edge-accent hover:bg-edge-accent-hover text-white font-medium text-xs transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
              View 200-Match Backtest & Calibration Table
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
