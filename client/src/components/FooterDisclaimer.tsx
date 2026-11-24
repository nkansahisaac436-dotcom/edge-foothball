import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export const FooterDisclaimer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-edge-border bg-edge-bg py-8 px-4 sm:px-6 text-center text-xs text-edge-muted">
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="flex items-center justify-center space-x-2 text-gray-200 font-bold uppercase tracking-wider text-[11px]">
          <span className="w-5 h-5 rounded-full bg-red-900/40 text-red-400 border border-red-800/60 flex items-center justify-center text-[10px]">
            18+
          </span>
          <span>Responsible Betting & Statistical Disclaimer</span>
        </div>

        <p className="leading-relaxed text-[11px]">
          Predictions presented on Matchday Edge represent mathematical probability distributions calculated using Dixon-Coles Poisson goals modeling and Negative Binomial corner & card distributions. They are statistical projections, <strong>not guaranteed outcomes</strong>. Football matches are inherently subject to unpredictable events, including red cards, referee decisions, weather conditions, and individual player errors.
        </p>

        <p className="text-[10px]">
          For analytical, statistical, and informational purposes only. Matchday Edge does not accept bets or operate a gambling service. Please gamble responsibly and only stake what you can afford to lose.
        </p>

        <div className="pt-2 text-[10px] font-mono text-edge-muted">
          &copy; {new Date().getFullYear()} Matchday Edge • Sofascore-Style Live Football Analytics
        </div>
      </div>
    </footer>
  );
};
