import { useState, useEffect, useRef, useCallback } from 'react';
import { MatchFixture, MatchStatus } from '../types/index.js';
import { PredictionEngine } from '../engine/prediction-engine.js';

export function isLiveStatus(status: MatchStatus | string): boolean {
  return ['LIVE', '1H', 'HT', '2H', 'ET', 'P', 'PEN'].includes(status);
}

export function isFinishedStatus(status: MatchStatus | string): boolean {
  return ['FINISHED', 'FT', 'AET', 'PEN'].includes(status);
}

export function useLiveScores(
  initialFixtures: MatchFixture[],
  onUpdate?: (updated: MatchFixture[]) => void
) {
  const [fixtures, setFixtures] = useState<MatchFixture[]>(initialFixtures);
  const [highlightedGoalMatchId, setHighlightedGoalMatchId] = useState<string | number | null>(null);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const prevScoresRef = useRef<Record<string | number, { home: number | null; away: number | null }>>({});

  // Synchronize with parent fixtures changes
  useEffect(() => {
    setFixtures(initialFixtures);
  }, [initialFixtures]);

  // Track score changes for subtle goal highlight animation
  const checkScoreChanges = useCallback((currentFixtures: MatchFixture[]) => {
    for (const f of currentFixtures) {
      if (!isLiveStatus(f.status)) continue;
      const prev = prevScoresRef.current[f.id];
      const curHome = f.score?.fullTime?.home ?? null;
      const curAway = f.score?.fullTime?.away ?? null;

      if (prev && curHome !== null && curAway !== null) {
        if ((prev.home !== null && curHome > prev.home) || (prev.away !== null && curAway > prev.away)) {
          // Subtle goal alert triggered
          setHighlightedGoalMatchId(f.id);
          setTimeout(() => {
            setHighlightedGoalMatchId((current) => (current === f.id ? null : current));
          }, 2500);
        }
      }

      prevScoresRef.current[f.id] = { home: curHome, away: curAway };
    }
  }, []);

  // Periodic smart polling & live ticking (only when tab is visible and there are live matches)
  useEffect(() => {
    let intervalId: any = null;

    const tickLiveMatches = () => {
      // Check visibility state: pause if tab is hidden
      if (document.visibilityState !== 'visible') return;

      setFixtures((prevFixtures) => {
        const hasLive = prevFixtures.some((f) => isLiveStatus(f.status));
        if (!hasLive) return prevFixtures;

        const updated = prevFixtures.map((match) => {
          if (!isLiveStatus(match.status)) return match;

          let currentMin = typeof match.minute === 'number' ? match.minute : parseInt(String(match.minute || '1'), 10);
          if (isNaN(currentMin)) currentMin = 45;

          let nextMin = currentMin + 1;
          let nextStatus: MatchStatus = match.status;

          if (match.status === '1H') {
            if (nextMin >= 45) {
              nextMin = 45;
              nextStatus = 'HT';
            }
          } else if (match.status === 'HT') {
            nextMin = 46;
            nextStatus = '2H';
          } else if (match.status === '2H') {
            if (nextMin >= 90) {
              nextMin = 90;
              nextStatus = 'FT';
            }
          }

          const curHome = match.score?.fullTime?.home ?? 0;
          const curAway = match.score?.fullTime?.away ?? 0;

          // Recalculate in-play probabilities on every tick
          const inPlayProb = PredictionEngine.calculateInPlayProbabilities(
            curHome,
            curAway,
            nextMin,
            1.40,
            1.15
          );

          return {
            ...match,
            minute: nextMin,
            status: nextStatus,
            inPlayProbabilities: inPlayProb,
          };
        });

        checkScoreChanges(updated);
        setLastSync(new Date());
        if (onUpdate) onUpdate(updated);
        return updated;
      });
    };

    // Run every 30 seconds
    intervalId = setInterval(tickLiveMatches, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tickLiveMatches();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkScoreChanges, onUpdate]);

  const liveFixtures = fixtures.filter((f) => isLiveStatus(f.status));

  return {
    fixtures,
    liveFixtures,
    highlightedGoalMatchId,
    lastSync,
    activeLiveCount: liveFixtures.length,
  };
}
