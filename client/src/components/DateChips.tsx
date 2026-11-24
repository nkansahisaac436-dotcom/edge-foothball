import React from 'react';

interface DateChipsProps {
  selectedDate: string; // 'ALL' or 'YYYY-MM-DD'
  onSelectDate: (dateKey: string) => void;
}

export const DateChips: React.FC<DateChipsProps> = ({ selectedDate, onSelectDate }) => {
  const dates: { key: string; label: string; sub?: string }[] = [{ key: 'ALL', label: 'All Dates' }];

  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split('T')[0];

    let label = '';
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Tomorrow';
    else {
      label = d.toLocaleDateString([], { weekday: 'short' });
    }

    const sub = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    dates.push({ key, label, sub });
  }

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1.5 px-3 sm:px-6">
      <div className="flex space-x-1.5 min-w-max">
        {dates.map((item) => {
          const isSelected = selectedDate === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelectDate(item.key)}
              className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg border text-xs transition ${
                isSelected
                  ? 'bg-sporty-green/15 text-sporty-green border-sporty-green font-bold shadow-xs'
                  : 'bg-gray-900/50 text-gray-400 border-gray-800/80 hover:text-gray-200 hover:border-gray-700'
              }`}
            >
              <span className="font-medium">{item.label}</span>
              {item.sub && <span className="text-[10px] text-gray-500 font-mono">{item.sub}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
