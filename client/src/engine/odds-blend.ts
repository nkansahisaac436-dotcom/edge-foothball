import { BookmakerOdds } from '../types';

export interface DeoverroundedOdds {
  homeProb: number;
  drawProb: number;
  awayProb: number;
  margin: number;
}

export function removeMargin(odds: BookmakerOdds): DeoverroundedOdds | null {
  if (!odds.homeWin || !odds.draw || !odds.awayWin) return null;
  if (odds.homeWin <= 1 || odds.draw <= 1 || odds.awayWin <= 1) return null;

  const qHome = 1 / odds.homeWin;
  const qDraw = 1 / odds.draw;
  const qAway = 1 / odds.awayWin;

  const sum = qHome + qDraw + qAway;
  if (sum <= 0) return null;

  return {
    homeProb: qHome / sum,
    drawProb: qDraw / sum,
    awayProb: qAway / sum,
    margin: sum - 1.0,
  };
}

export function blendProbabilities(
  modelProb: number,
  marketProb: number | undefined,
  modelWeight: number = 0.70
): number {
  if (marketProb === undefined || isNaN(marketProb)) {
    return modelProb;
  }
  const weight = Math.max(0, Math.min(1.0, modelWeight));
  return weight * modelProb + (1 - weight) * marketProb;
}

export function probToFairOdds(prob: number): number {
  if (prob <= 0.001) return 999.0;
  if (prob >= 0.999) return 1.01;
  return Number((1 / prob).toFixed(2));
}

export function calculateEdge(modelProb: number, bookmakerOdds?: number): number | undefined {
  if (!bookmakerOdds || bookmakerOdds <= 1.0) return undefined;
  const edge = (modelProb * bookmakerOdds) - 1.0;
  return Number(edge.toFixed(4));
}
