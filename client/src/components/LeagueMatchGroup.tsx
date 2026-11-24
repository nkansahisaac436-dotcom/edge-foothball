import React, { useState } from 'react';
import { MatchFixture } from '../types/index.js';
import { MatchRow } from './MatchRow.js';
import { ChevronDown, ChevronUp, Pin } from 'lucide-react';

interface LeagueMatchGroupProps {
  leagueId: string;
  leagueName: string;
  country?: string;
  countryFlag?: string;
  leagueLogo?: string;
  fixtures: MatchFixture[];
  highlightedGoalMatchId?: string | number | null;
  onSelectMatch: (fixture: MatchFixture) => void;
  defaultCollapsed?: boolean;
}

export const LeagueMatchGroup: React.FC<LeagueMatchGroupProps> = ({
  leagueId,
  leagueName,
  country = 'International',
  countryFlag,
  leagueLogo,
  fixtures,
  highlightedGoalMatchId,
  onSelectMatch,
  defaultCollapsed = false,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (fixtures.length === 0) return null;

  return (
    <div className="bg-edge-card rounded-xl border border-edge-border overflow-hidden mb-3 shadow-sm">
      {/* Collapsible Header (Sofascore style) */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between px-3.5 py-2.5 bg-edge-bg/60 border-b border-edge-border cursor-pointer select-none hover:bg-edge-bg/90 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {leagueLogo ? (
            <img
              src={leagueLogo}
              alt={leagueName}
              className="w-4.5 h-4.5 object-contain shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="text-sm shrink-0">{countryFlag || '⚽'}</span>
          )}

          <div className="min-w-0 flex items-center gap-1.5">
            <h2 className="text-xs sm:text-sm font-semibold text-white truncate">
              {leagueName}
            </h2>
            <span className="text-[11px] text-edge-muted hidden xs:inline truncate">
              • {country}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-edge-muted">
          <span className="tabular-nums text-xs font-medium px-1.5 py-0.5 rounded bg-edge-card border border-edge-border">
            {fixtures.length}
          </span>
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {/* Fixtures List */}
      {!collapsed && (
        <div className="divide-y divide-edge-border/40">
          {fixtures.map((fixture) => (
            <MatchRow
              key={fixture.id}
              fixture={fixture}
              isGoalHighlighted={highlightedGoalMatchId === fixture.id}
              onSelectMatch={onSelectMatch}
            />
          ))}
        </div>
      )}
    </div>
  );
};
