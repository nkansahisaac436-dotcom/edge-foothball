import { TeamMatchStats } from '../types/index.js';
import {
  convolveDistributions,
  generateNegativeBinomialDistribution,
} from './negative-binomial.js';

export interface ExpectedCardsResult {
  homeCards: number;
  awayCards: number;
  totalCards: number;
  homeDist: number[];
  awayDist: number[];
  totalDist: number[];
}

/**
 * Calculates expected yellow/red cards using team card averages, league baselines,
 * and derby/rivalry closeness factors.
 * Negative Binomial distribution with dispersion r ~ 9.
 */
export function calculateCardsDistribution(
  homeMatches: TeamMatchStats[],
  awayMatches: TeamMatchStats[],
  closenessFactor: number = 1.0, // > 1.0 for close/rivalry games
  refereeCardAvg?: number,
  leagueAvgCards: number = 4.2
): ExpectedCardsResult {
  const halfLeagueCards = leagueAvgCards / 2;

  // Home team card average
  let homeCardsSum = 0;
  homeMatches.slice(0, 10).forEach((m) => {
    // Red cards count as 2 card points in SportyBet card booking markets
    homeCardsSum += m.yellowCards + m.redCards * 2;
  });
  const homeCardsAvg = homeMatches.length > 0 ? homeCardsSum / Math.min(10, homeMatches.length) : halfLeagueCards;

  // Away team card average
  let awayCardsSum = 0;
  awayMatches.slice(0, 10).forEach((m) => {
    awayCardsSum += m.yellowCards + m.redCards * 2;
  });
  const awayCardsAvg = awayMatches.length > 0 ? awayCardsSum / Math.min(10, awayMatches.length) : halfLeagueCards;

  // Base expected cards
  let expHome = (homeCardsAvg * 0.7 + halfLeagueCards * 0.3) * closenessFactor;
  let expAway = (awayCardsAvg * 0.7 + halfLeagueCards * 0.3) * closenessFactor;

  // Adjust for referee if provided
  if (refereeCardAvg && refereeCardAvg > 0) {
    const refFactor = refereeCardAvg / leagueAvgCards;
    expHome *= refFactor;
    expAway *= refFactor;
  }

  // Safety clamps
  expHome = Math.max(0.8, Math.min(5.5, expHome));
  expAway = Math.max(0.8, Math.min(5.5, expAway));

  const totalExp = expHome + expAway;

  // Cards are significantly overdispersed; r = 9
  const rCards = 9;
  const homeDist = generateNegativeBinomialDistribution(expHome, rCards, 15);
  const awayDist = generateNegativeBinomialDistribution(expAway, rCards, 15);
  const totalDist = convolveDistributions(homeDist, awayDist);

  return {
    homeCards: expHome,
    awayCards: expAway,
    totalCards: totalExp,
    homeDist,
    awayDist,
    totalDist,
  };
}
