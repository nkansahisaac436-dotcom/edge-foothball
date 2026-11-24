import { describe, it, expect } from 'vitest';
import { FootballProviderFactory } from '../src/services/providers/provider.factory.js';
import { PredictionEngine } from '../src/engine/prediction-engine.js';
import { SUPPORTED_LEAGUES } from '../src/config/leagues.js';

describe('End-to-End API Logic Verification', () => {
  const provider = FootballProviderFactory.getProvider();

  it('provides all supported leagues including the core 6 in v1', () => {
    expect(SUPPORTED_LEAGUES.length).toBeGreaterThanOrEqual(6);
    const leagueCodes = SUPPORTED_LEAGUES.map((l) => l.id);
    expect(leagueCodes).toContain('PL');  // Premier League
    expect(leagueCodes).toContain('CL');  // Champions League
    expect(leagueCodes).toContain('PD');  // La Liga
    expect(leagueCodes).toContain('BL1'); // Bundesliga
    expect(leagueCodes).toContain('SA');  // Serie A
    expect(leagueCodes).toContain('FL1'); // Ligue 1
  });

  it('fetches upcoming 7 days fixtures with odds for Premier League', async () => {
    const { fixtures, lastUpdated } = await provider.getFixtures('PL', 7);
    expect(fixtures.length).toBeGreaterThan(0);
    expect(lastUpdated).toBeDefined();

    const first = fixtures[0];
    expect(first.homeTeam.name).toBeDefined();
    expect(first.awayTeam.name).toBeDefined();
    expect(first.odds).toBeDefined();
    expect(first.odds?.homeWin).toBeGreaterThan(1.0);
  });

  it('generates complete prediction payload for a fixture with all SportyBet market groups', async () => {
    const { fixtures } = await provider.getFixtures('PL', 7);
    const fixture = fixtures[0];

    const [homeMatches, awayMatches] = await Promise.all([
      provider.getTeamRecentMatches(fixture.homeTeam.id, 'PL', 10),
      provider.getTeamRecentMatches(fixture.awayTeam.id, 'PL', 10),
    ]);

    const prediction = PredictionEngine.predict(fixture, homeMatches, awayMatches);

    // Confidence
    expect(['High', 'Medium', 'Low']).toContain(prediction.confidence);

    // Top picks
    expect(prediction.topPicks.length).toBeGreaterThanOrEqual(3);

    // Plain English analysis
    expect(prediction.analysis.summaryText).toContain(fixture.homeTeam.name);
    expect(prediction.analysis.mostLikelyScore.probability).toBeGreaterThan(0);

    // Goal markets
    expect(prediction.markets.result1X2.selections.length).toBe(3);
    expect(prediction.markets.doubleChance.selections.length).toBe(3);
    expect(prediction.markets.drawNoBet.selections.length).toBe(2);
    expect(prediction.markets.totalGoals.selections.length).toBe(12); // Over/under 0.5 to 5.5 = 6 lines * 2
    expect(prediction.markets.btts.selections.length).toBe(2);
    expect(prediction.markets.bttsCombos.selections.length).toBe(4);
    expect(prediction.markets.cleanSheetWinToNil.selections.length).toBe(4);
    expect(prediction.markets.teamTotals.selections.length).toBe(12); // 3 lines * 2 teams * 2 outcomes

    // Handicaps
    expect(prediction.markets.handicapEuropean.selections.length).toBe(12); // 4 lines * 3 outcomes
    expect(prediction.markets.handicapAsian.selections.length).toBe(4);

    // Halves & HT/FT
    expect(prediction.markets.firstHalfResult.selections.length).toBe(3);
    expect(prediction.markets.firstHalfGoals.selections.length).toBe(4);
    expect(prediction.markets.secondHalfGoals.selections.length).toBe(4);
    expect(prediction.markets.highestScoringHalf.selections.length).toBe(3);
    expect(prediction.markets.halfTimeFullTime.selections.length).toBe(9);

    // Scores
    expect(prediction.markets.correctScores.selections.length).toBe(5);
    expect(prediction.markets.exactTotalGoals.selections.length).toBe(7);

    // Corners (Over 7.5 highlighted)
    expect(prediction.markets.cornersTotal.selections.length).toBe(16); // 8 lines * 2
    const over75 = prediction.markets.cornersTotal.selections.find((s) => s.outcome === 'Over 7.5');
    expect(over75).toBeDefined();
    expect(over75!.isEstimate).toBe(true);

    // Cards
    expect(prediction.markets.cardsTotal.selections.length).toBe(8); // 4 lines * 2
    expect(prediction.markets.cardsTotal.selections[0].isEstimate).toBe(true);
  });
});
