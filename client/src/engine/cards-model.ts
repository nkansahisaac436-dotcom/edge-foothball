import { TeamMatchStats } from '../types';
import {
  convolveDistributions,
  generateNegativeBinomialDistribution,
} from './negative-binomial';

export interface ExpectedCardsResult {
  homeCards: number;
  awayCards: number;
  totalCards: number;
  homeDist: number[];
  awayDist: number[];
  totalDist: number[];
}

export function calculateCardsDistribution(
  homeMatches: TeamMatchStats[],
  awayMatches: TeamMatchStats[],
  closenessFactor: number = 1.0,
  refereeCardAvg?: number,
  leagueAvgCards: number = 4.2
): ExpectedCardsResult {
  const halfLeagueCards = leagueAvgCards / 2;

  let homeCardsSum = 0;
  homeMatches.slice(0, 10).forEach((m) => {
    homeCardsSum += m.yellowCards + m.redCards * 2;
  });
  const homeCardsAvg = homeMatches.length > 0 ? homeCardsSum / Math.min(10, homeMatches.length) : halfLeagueCards;

  let awayCardsSum = 0;
  awayMatches.slice(0, 10).forEach((m) => {
    awayCardsSum += m.yellowCards + m.redCards * 2;
  });
  const awayCardsAvg = awayMatches.length > 0 ? awayCardsSum / Math.min(10, awayMatches.length) : halfLeagueCards;

  let expHome = (homeCardsAvg * 0.7 + halfLeagueCards * 0.3) * closenessFactor;
  let expAway = (awayCardsAvg * 0.7 + halfLeagueCards * 0.3) * closenessFactor;

  if (refereeCardAvg && refereeCardAvg > 0) {
    const refFactor = refereeCardAvg / leagueAvgCards;
    expHome *= refFactor;
    expAway *= refFactor;
  }

  expHome = Math.max(0.8, Math.min(5.5, expHome));
  expAway = Math.max(0.8, Math.min(5.5, expAway));

  const totalExp = expHome + expAway;
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
