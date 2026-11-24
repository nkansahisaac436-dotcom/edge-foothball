import React from 'react';
import { useSettings, SupportedLanguage, OddsFormat } from '../context/SettingsContext.js';
import { X, Globe, Clock, Percent, Moon, Sun, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHowItWorks: () => void;
}

const COMMON_TIMEZONES = [
  { value: 'Africa/Accra', label: 'Accra (GMT+0)' },
  { value: 'Europe/London', label: 'London (GMT+0 / BST)' },
  { value: 'Europe/Paris', label: 'Paris, Madrid, Berlin (CET)' },
  { value: 'America/New_York', label: 'New York (EST)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'UTC', label: 'UTC (Universal)' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenHowItWorks,
}) => {
  const {
    language,
    setLanguage,
    timezone,
    setTimezone,
    oddsFormat,
    setOddsFormat,
    darkMode,
    setDarkMode,
    t,
  } = useSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-edge-card border border-edge-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-edge-border bg-edge-bg/50">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">{t.settings}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-edge-muted hover:text-white hover:bg-edge-border/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-edge-muted">
              <Globe className="w-3.5 h-3.5" />
              {t.language}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { code: 'en', label: 'English' },
                { code: 'fr', label: 'Français' },
                { code: 'es', label: 'Español' },
                { code: 'pt', label: 'Português' },
                { code: 'ar', label: 'العربية (RTL)' },
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => setLanguage(item.code as SupportedLanguage)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                    language === item.code
                      ? 'bg-edge-accent/20 border-edge-accent text-white font-semibold'
                      : 'bg-edge-bg border-edge-border text-edge-muted hover:text-white hover:border-gray-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timezone Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-edge-muted">
              <Clock className="w-3.5 h-3.5" />
              {t.timezone}
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-edge-bg border border-edge-border text-xs rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-edge-accent"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {/* Odds Format */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-edge-muted">
              <Percent className="w-3.5 h-3.5" />
              {t.oddsFormat}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'decimal', label: 'Decimal (2.10)' },
                { code: 'fractional', label: 'Fractional (11/10)' },
                { code: 'american', label: 'American (+110)' },
              ].map((fmt) => (
                <button
                  key={fmt.code}
                  onClick={() => setOddsFormat(fmt.code as OddsFormat)}
                  className={`px-2.5 py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                    oddsFormat === fmt.code
                      ? 'bg-edge-accent/20 border-edge-accent text-white font-semibold'
                      : 'bg-edge-bg border-edge-border text-edge-muted hover:text-white hover:border-gray-600'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Mode Toggle */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-edge-muted">
              {darkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              {t.theme}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDarkMode(true)}
                className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                  darkMode
                    ? 'bg-edge-accent/20 border-edge-accent text-white font-semibold'
                    : 'bg-edge-bg border-edge-border text-edge-muted hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                {t.dark}
              </button>
              <button
                onClick={() => setDarkMode(false)}
                className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                  !darkMode
                    ? 'bg-edge-accent/20 border-edge-accent text-white font-semibold'
                    : 'bg-edge-bg border-edge-border text-edge-muted hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                {t.light}
              </button>
            </div>
          </div>

          {/* Methodology Link */}
          <div className="pt-2 border-t border-edge-border">
            <button
              onClick={() => {
                onClose();
                onOpenHowItWorks();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-edge-bg border border-edge-border text-xs text-edge-muted hover:text-white hover:border-gray-500 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-edge-accent" />
                {t.howItWorks}
              </span>
              <span className="text-[10px] bg-edge-border px-1.5 py-0.5 rounded text-gray-300">
                Poisson + NegBinomial
              </span>
            </button>
          </div>

          {/* Responsible Gambling Note in Settings */}
          <div className="p-3 bg-edge-bg rounded-lg border border-edge-border text-[11px] text-edge-muted space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-gray-300">
              <span className="px-1 py-0.5 bg-red-900/40 text-red-400 rounded text-[10px] font-bold">18+</span>
              <span>{t.responsibleGambling}</span>
            </div>
            <p className="leading-relaxed">
              {t.responsibleGamblingDisclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
