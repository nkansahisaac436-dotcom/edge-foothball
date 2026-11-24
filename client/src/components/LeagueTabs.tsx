import React from 'react';
import { LeagueConfig } from '../types/index.js';

interface LeagueTabsProps {
  leagues: LeagueConfig[];
  selectedLeague: string;
  onSelectLeague: (leagueId: string) => void;
}

export const LeagueTabs: React.FC<LeagueTabsProps> = ({
  leagues,
  selectedLeague,
  onSelectLeague,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2.5">
      <div className="flex space-x-2 min-w-max px-3 sm:px-6">
        {leagues.map((league) => {
          const isSelected = selectedLeague.toUpperCase() === league.id.toUpperCase();
          return (
            <button
              key={league.id}
              onClick={() => onSelectLeague(league.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-gray-800 to-gray-800/90 text-white border-sporty-green shadow-sm shadow-sporty-green/20'
                  : 'bg-gray-900/60 text-gray-400 border-gray-800 hover:text-gray-200 hover:border-gray-700'
              }`}
            >
              <img
                src={league.logo}
                alt={league.name}
                className="w-4 h-4 object-contain rounded-full bg-white/10 p-0.5"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="whitespace-nowrap">{league.name}</span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-sporty-green"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
