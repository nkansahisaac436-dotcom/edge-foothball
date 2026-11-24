import React from 'react';
import { MatchFixture } from '../types/index.js';
import { useSettings } from '../context/SettingsContext.js';
import { formatKickoffTime } from '../utils/date.js';
import { isLiveStatus, isFinishedStatus } from '../hooks/useLiveScores.js';
import { Star } from 'lucide-react';

interface MatchRowProps {
  fixture: MatchFixture;
  isGoalHighlighted?: boolean;
  onSelectMatch: (fixture: MatchFixture) => void;
}

export const MatchRow: React.FC<MatchRowProps> = ({
  fixture,
  isGoalHighlighted = false,
  onSelectMatch,
}) => {
  const { timezone, isFavourite, toggleFavourite } = useSettings();

  const isLive = isLiveStatus(fixture.status);
  const isFinished = isFinishedStatus(fixture.status);
  const isFav = isFavourite(fixture.id);

  const homeScore = fixture.score?.fullTime?.home;
  const awayScore = fixture.score?.fullTime?.away;

  // Derive compact prediction chip for scheduled matches
  const odds = fixture.odds;
  let predictionChip = '';
  if (!isLive && !isFinished && odds) {
    const rawHome = 1 / odds.homeWin;
    const rawDraw = 1 / odds.draw;
    const rawAway = 1 / odds.awayWin;
    const sum = rawHome + rawDraw + rawAway;
    const p1 = Math.round((rawHome / sum) * 100);
    const pX = Math.round((rawDraw / sum) * 100);
    const p2 = Math.round((rawAway / sum) * 100);
    predictionChip = `1 ${p1}% · X ${pX}% · 2 ${p2}%`;
  }

  return (
    <div
      onClick={() => onSelectMatch(fixture)}
      className={`group relative flex items-center justify-between px-3 sm:px-4 py-2.5 min-h-[58px] border-b border-edge-border/60 hover:bg-edge-card-hover/80 cursor-pointer transition-colors ${
        isGoalHighlighted ? 'animate-goal-flash' : ''
      }`}
    >
      {/* Left Column: Kickoff / Live Minute / FT */}
      <div className="w-16 sm:w-20 shrink-0 flex flex-col justify-center">
        {isLive ? (
          <div className="flex flex-col items-start">
            <span className="tabular-nums font-bold text-xs sm:text-sm text-edge-live flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-edge-live animate-ping"></span>
              {fixture.minute ? `${fixture.minute}'` : fixture.status}
            </span>
            <span className="text-[10px] text-edge-live uppercase tracking-wider font-semibold">
              Live
            </span>
          </div>
        ) : isFinished ? (
          <div className="flex flex-col items-start">
            <span className="text-xs font-semibold text-gray-400">FT</span>
            <span className="text-[10px] text-edge-muted">Ended</span>
          </div>
        ) : (
          <div className="flex flex-col items-start">
            <span className="tabular-nums text-xs font-semibold text-gray-200">
              {formatKickoffTime(fixture.utcDate, timezone)}
            </span>
            <span className="text-[10px] text-edge-muted truncate">
              {fixture.round || 'Kickoff'}
            </span>
          </div>
        )}
      </div>

      {/* Middle Column: Two Lines for Teams (Sofascore style) */}
      <div className="flex-1 min-w-0 px-2 sm:px-3 flex flex-col justify-center gap-1">
        {/* Home Team */}
        <div className="flex items-center gap-2">
          {fixture.homeTeam.logo ? (
            <img
              src={fixture.homeTeam.logo}
              alt={fixture.homeTeam.name}
              className="w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="w-4 h-4 rounded-full bg-edge-border flex items-center justify-center text-[9px] text-gray-300 shrink-0">
              {fixture.homeTeam.name.substring(0, 1)}
            </span>
          )}
          <span className="text-xs sm:text-sm font-medium text-gray-100 truncate group-hover:text-white">
            {fixture.homeTeam.name}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-2">
          {fixture.awayTeam.logo ? (
            <img
              src={fixture.awayTeam.logo}
              alt={fixture.awayTeam.name}
              className="w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="w-4 h-4 rounded-full bg-edge-border flex items-center justify-center text-[9px] text-gray-300 shrink-0">
              {fixture.awayTeam.name.substring(0, 1)}
            </span>
          )}
          <span className="text-xs sm:text-sm font-medium text-gray-100 truncate group-hover:text-white">
            {fixture.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Right Column: Score / Prediction Chip & Favorite Star */}
      <div className="shrink-0 flex items-center gap-3">
        {/* Score or Prediction */}
        <div className="text-right">
          {isLive ? (
            <div className="flex flex-col items-end gap-1">
              <span className="tabular-nums font-bold text-sm sm:text-base text-edge-live">
                {homeScore ?? 0}
              </span>
              <span className="tabular-nums font-bold text-sm sm:text-base text-edge-live">
                {awayScore ?? 0}
              </span>
            </div>
          ) : isFinished ? (
            <div className="flex flex-col items-end gap-1">
              <span className="tabular-nums font-semibold text-xs sm:text-sm text-gray-200">
                {homeScore ?? '-'}
              </span>
              <span className="tabular-nums font-semibold text-xs sm:text-sm text-gray-200">
                {awayScore ?? '-'}
              </span>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="tabular-nums text-[10px] sm:text-xs font-medium px-2 py-1 rounded bg-edge-bg border border-edge-border text-edge-muted group-hover:border-gray-500 transition-colors">
                {predictionChip || 'Predictions'}
              </span>
            </div>
          )}
        </div>

        {/* Favorite Star Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavourite(fixture.id);
          }}
          title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
          className={`p-1 rounded hover:bg-edge-border/50 transition-colors ${
            isFav ? 'text-amber-400' : 'text-edge-muted/40 hover:text-edge-muted'
          }`}
        >
          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
        </button>
      </div>
    </div>
  );
};
