import { TeamMatchStats } from '../types';
import {
  convolveDistributions,
  generateNegativeBinomialDistribution,
} from './negative-binomial';

export interface ExpectedCornersResult {
  homeCorners: number;
  awayCorners: number;
  totalCorners: number;
  homeDist: number[];
  awayDist: number[];
  totalDist: number[];
  firstHalfDist: number[];
}

export function calculateCornersDistribution(
  homeMatches: TeamMatchStats[],
  awayMatches: TeamMatchStats[],
  homeStrengthGap: number = 0,
  leagueAvgCorners: number = 10.2
): ExpectedCornersResult {
  const halfLeagueCorners = leagueAvgCorners / 2;

  let homeWonSum = 0;
  let homeWonCount = 0;
  let homeConcededSum = 0;
  let homeConcededCount = 0;

  homeMatches.slice(0, 10).forEach((m) => {
    const w = m.isHome ? 1.2 : 0.8;
    homeWonSum += m.cornersFor * w;
    homeWonCount += w;
    homeConcededSum += m.cornersAgainst * w;
    homeConcededCount += w;
  });

  const homeAvgWon = homeWonCount > 0 ? homeWonSum / homeWonCount : halfLeagueCorners;
  const homeAvgConceded = homeConcededCount > 0 ? homeConcededSum / homeConcededCount : halfLeagueCorners;

  let awayWonSum = 0;
  let awayWonCount = 0;
  let awayConcededSum = 0;
  let awayConcededCount = 0;

  awayMatches.slice(0, 10).forEach((m) => {
    const w = !m.isHome ? 1.2 : 0.8;
    awayWonSum += m.cornersFor * w;
    awayWonCount += w;
    awayConcededSum += m.cornersAgainst * w;
    awayConcededCount += w;
  });

  const awayAvgWon = awayWonCount > 0 ? awayWonSum / awayWonCount : halfLeagueCorners;
  const awayAvgConceded = awayConcededCount > 0 ? awayConcededSum / awayConcededCount : halfLeagueCorners;

  let expHome = (0.55 * homeAvgWon + 0.45 * awayAvgConceded) + (homeStrengthGap * 0.4);
  let expAway = (0.55 * awayAvgWon + 0.45 * homeAvgConceded) - (homeStrengthGap * 0.4);

  expHome = Math.max(2.5, Math.min(10.5, expHome));
  expAway = Math.max(2.0, Math.min(9.5, expAway));

  const totalExp = expHome + expAway;
  const rCorners = 20;
  const homeDist = generateNegativeBinomialDistribution(expHome, rCorners, 25);
  const awayDist = generateNegativeBinomialDistribution(expAway, rCorners, 25);
  const totalDist = convolveDistributions(homeDist, awayDist);

  const expFirstHalf = totalExp * 0.46;
  const firstHalfDist = generateNegativeBinomialDistribution(expFirstHalf, rCorners * 0.8, 15);

  return {
    homeCorners: expHome,
    awayCorners: expAway,
    totalCorners: totalExp,
    homeDist,
    awayDist,
    totalDist,
    firstHalfDist,
  };
}
