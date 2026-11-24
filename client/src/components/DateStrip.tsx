import React from 'react';
import { Calendar } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.js';

interface DateStripProps {
  selectedDate: string; // 'TODAY' | 'TOMORROW' | 'YESTERDAY' | 'ALL' | YYYY-MM-DD
  onSelectDate: (dateKey: string) => void;
}

export const DateStrip: React.FC<DateStripProps> = ({ selectedDate, onSelectDate }) => {
  const { t } = useSettings();

  // Generate dynamic date items for the next 7 days
  const now = new Date();
  const dateItems: { key: string; label: string; sub?: string }[] = [
    { key: 'ALL', label: t.allDates },
    { key: 'YESTERDAY', label: t.yesterday },
    { key: 'TODAY', label: t.today },
    { key: 'TOMORROW', label: t.tomorrow },
  ];

  // Add the next 5 days
  for (let i = 2; i <= 6; i++) {
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
    const dayNum = d.getDate();
    const month = d.toLocaleDateString(undefined, { month: 'short' });
    const key = d.toISOString().split('T')[0];
    dateItems.push({
      key,
      label: `${dayName} ${dayNum} ${month}`,
    });
  }

  return (
    <div className="bg-edge-card/60 border-b border-edge-border py-2 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5">
          {dateItems.map((item) => {
            const isSelected = selectedDate === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectDate(item.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-edge-accent text-white font-semibold shadow-sm'
                    : 'bg-edge-bg border border-edge-border text-edge-muted hover:text-white hover:border-gray-600'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Calendar Picker Trigger */}
        <div className="flex items-center pl-2 border-l border-edge-border">
          <label className="p-1.5 rounded-lg bg-edge-bg border border-edge-border text-edge-muted hover:text-white cursor-pointer transition">
            <Calendar className="w-4 h-4" />
            <input
              type="date"
              className="sr-only"
              onChange={(e) => {
                if (e.target.value) {
                  onSelectDate(e.target.value);
                }
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
