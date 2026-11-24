import { describe, it, expect } from 'vitest';
import {
  blendProbabilities,
  probToFairOdds,
  removeMargin,
  calculateEdge,
} from '../src/engine/odds-blend.js';

describe('Odds Blending and De-overrounding', () => {
  it('strips bookmaker margin and normalizes implied probabilities to 1.0', () => {
    // 1X2 odds with ~5% margin: 2.00, 3.40, 3.80
    // qHome = 0.50, qDraw = 0.2941, qAway = 0.2631 -> sum = 1.057
    const odds = {
      homeWin: 2.00,
      draw: 3.40,
      awayWin: 3.80,
    };

    const deoverrounded = removeMargin(odds);
    expect(deoverrounded).not.toBeNull();
    expect(deoverrounded!.homeProb + deoverrounded!.drawProb + deoverrounded!.awayProb).toBeCloseTo(1.0, 5);
    expect(deoverrounded!.margin).toBeGreaterThan(0.04);
  });

  it('blends model probability with market probability using configurable weights', () => {
    const pModel = 0.60;
    const pMarket = 0.50;

    // Default 70% model, 30% market
    const blended7030 = blendProbabilities(pModel, pMarket, 0.70);
    expect(blended7030).toBeCloseTo(0.57, 4);

    // 100% model
    const blended100 = blendProbabilities(pModel, pMarket, 1.0);
    expect(blended100).toBe(0.60);

    // 0% model (100% market)
    const blended0 = blendProbabilities(pModel, pMarket, 0.0);
    expect(blended0).toBe(0.50);
  });

  it('converts probability to fair odds (100 / percentage)', () => {
    expect(probToFairOdds(0.50)).toBe(2.00);
    expect(probToFairOdds(0.25)).toBe(4.00);
    expect(probToFairOdds(0.80)).toBe(1.25);
  });

  it('calculates positive edge correctly', () => {
    // Model gives 60% probability on an outcome with odds 2.00
    // Edge = 0.60 * 2.00 - 1 = +0.20 (+20% value)
    const edge = calculateEdge(0.60, 2.00);
    expect(edge).toBe(0.20);
  });
});
