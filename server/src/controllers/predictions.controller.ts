import { Request, Response } from 'express';
import { FootballProviderFactory } from '../services/providers/provider.factory.js';
import { PredictionEngine } from '../engine/prediction-engine.js';
import { SUPPORTED_LEAGUES } from '../config/leagues.js';
import { BookmakerOdds, MatchFixture, TeamMatchStats } from '../types/index.js';
import { runBacktest } from '../scripts/backtest.js';

export class PredictionsController {
  public static async getMatchPredictions(req: Request, res: Response) {
    try {
      const matchId = req.params.id;
      const leagueId = (req.query.league as string) || 'PL';
      const modelWeight = req.query.modelWeight ? parseFloat(req.query.modelWeight as string) : 0.70;

      const provider = FootballProviderFactory.getProvider();

      // Find fixture in the league's upcoming list
      const fixturesResult = await provider.getFixtures(leagueId, 14);
      let fixture = fixturesResult.fixtures.find((f) => String(f.id) === String(matchId));

      if (!fixture) {
        // Search across all leagues if not in specified league
        for (const l of SUPPORTED_LEAGUES) {
          if (l.id === leagueId) continue;
          const otherResult = await provider.getFixtures(l.id, 14);
          const found = otherResult.fixtures.find((f) => String(f.id) === String(matchId));
          if (found) {
            fixture = found;
            break;
          }
        }
      }

      if (!fixture) {
        return res.status(404).json({
          success: false,
          error: `Fixture with ID ${matchId} not found in upcoming matches.`,
        });
      }

      // Fetch recent matches for both teams
      let homeMatches: TeamMatchStats[] = [];
      let awayMatches: TeamMatchStats[] = [];
      let h2hMatches: MatchFixture[] = [];

      try {
        [homeMatches, awayMatches] = await Promise.all([
          provider.getTeamRecentMatches(fixture.homeTeam.id, fixture.leagueId, 15),
          provider.getTeamRecentMatches(fixture.awayTeam.id, fixture.leagueId, 15),
        ]);
        if (provider.getH2H) {
          h2hMatches = await provider.getH2H(fixture.homeTeam.id, fixture.awayTeam.id, 5);
        }
      } catch (err) {
        console.warn(`Warning fetching team stats for match ${matchId}, using league baselines:`, err);
      }

      const prediction = PredictionEngine.predict(
        fixture,
        homeMatches,
        awayMatches,
        h2hMatches,
        { modelWeight }
      );

      res.json({
        success: true,
        prediction,
      });
    } catch (err: any) {
      console.error('Prediction controller error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to generate predictions for match',
        details: err.message,
      });
    }
  }

  public static async getStrongestPicks(req: Request, res: Response) {
    try {
      const leagueId = (req.query.league as string) || 'PL';
      const provider = FootballProviderFactory.getProvider();
      const fixturesResult = await provider.getFixtures(leagueId, 7);

      const picksList: any[] = [];

      // Predict for each fixture
      for (const fixture of fixturesResult.fixtures.slice(0, 8)) {
        const [homeMatches, awayMatches] = await Promise.all([
          provider.getTeamRecentMatches(fixture.homeTeam.id, fixture.leagueId, 10),
          provider.getTeamRecentMatches(fixture.awayTeam.id, fixture.leagueId, 10),
        ]);

        const pred = PredictionEngine.predict(fixture, homeMatches, awayMatches);

        // Gather strong picks across key markets
        const allCandidates = [
          ...pred.markets.doubleChance.selections,
          ...pred.markets.totalGoals.selections.filter((s) => s.outcome === 'Over 1.5' || s.outcome === 'Under 3.5'),
          ...pred.markets.cornersTotal.selections.filter((s) => s.outcome === 'Over 7.5' || s.outcome === 'Over 8.5'),
          ...pred.markets.cardsTotal.selections.filter((s) => s.outcome === 'Over 2.5' || s.outcome === 'Under 5.5'),
          ...pred.markets.result1X2.selections,
        ];

        for (const pick of allCandidates) {
          if (pick.probability >= 0.65) {
            picksList.push({
              matchId: fixture.id,
              match: `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`,
              utcDate: fixture.utcDate,
              market: pick.name,
              outcome: pick.outcome,
              probability: pick.probability,
              fairOdds: pick.fairOdds,
              confidence: pred.confidence,
              isEstimate: pick.isEstimate,
            });
          }
        }
      }

      picksList.sort((a, b) => b.probability - a.probability);

      res.json({
        success: true,
        leagueId,
        totalPicks: picksList.length,
        picks: picksList.slice(0, 15),
      });
    } catch (err: any) {
      console.error('Error getting strongest picks:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getValuePicks(req: Request, res: Response) {
    try {
      const leagueId = (req.query.league as string) || 'PL';
      const provider = FootballProviderFactory.getProvider();
      const fixturesResult = await provider.getFixtures(leagueId, 7);

      const valuePicks: any[] = [];

      for (const fixture of fixturesResult.fixtures.slice(0, 8)) {
        if (!fixture.odds) continue;

        const [homeMatches, awayMatches] = await Promise.all([
          provider.getTeamRecentMatches(fixture.homeTeam.id, fixture.leagueId, 10),
          provider.getTeamRecentMatches(fixture.awayTeam.id, fixture.leagueId, 10),
        ]);

        const pred = PredictionEngine.predict(fixture, homeMatches, awayMatches);

        // Inspect selections with edge > 0
        const checkGroups = [
          pred.markets.result1X2,
          pred.markets.totalGoals,
          pred.markets.btts,
        ];

        for (const group of checkGroups) {
          for (const sel of group.selections) {
            if (sel.edge && sel.edge >= 0.02 && sel.marketOdds) {
              const impliedProb = 1 / sel.marketOdds;
              valuePicks.push({
                matchId: fixture.id,
                match: `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`,
                utcDate: fixture.utcDate,
                market: sel.name,
                outcome: sel.outcome,
                modelProbability: sel.probability,
                marketOdds: sel.marketOdds,
                impliedProbability: Number(impliedProb.toFixed(3)),
                fairOdds: sel.fairOdds,
                edge: Number((sel.edge * 100).toFixed(1)), // e.g. +7.4%
                confidence: pred.confidence,
              });
            }
          }
        }
      }

      valuePicks.sort((a, b) => (b.edge || 0) - (a.edge || 0));

      res.json({
        success: true,
        leagueId,
        totalValuePicks: valuePicks.length,
        picks: valuePicks.slice(0, 15),
      });
    } catch (err: any) {
      console.error('Error getting value picks:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async customMatch(req: Request, res: Response) {
    try {
      const {
        homeTeam = 'Custom Home FC',
        awayTeam = 'Custom Away FC',
        leagueId = 'PL',
        homeOdds,
        drawOdds,
        awayOdds,
        homeAttackRating = 1.25,
        awayAttackRating = 1.15,
        homeDefenseRating = 0.85,
        awayDefenseRating = 0.95,
        modelWeight = 0.70,
      } = req.body;

      let odds: BookmakerOdds | undefined = undefined;
      if (homeOdds && drawOdds && awayOdds) {
        odds = {
          homeWin: parseFloat(homeOdds),
          draw: parseFloat(drawOdds),
          awayWin: parseFloat(awayOdds),
          bookmaker: 'Custom Odds',
        };
      }

      const fixture: MatchFixture = {
        id: `custom_${Date.now()}`,
        leagueId,
        leagueName: 'Custom Match Analysis',
        utcDate: new Date().toISOString(),
        status: 'SCHEDULED',
        homeTeam: { id: 9991, name: homeTeam },
        awayTeam: { id: 9992, name: awayTeam },
        odds,
        venue: `${homeTeam} Stadium`,
      };

      // Create simulated recent matches based on user's ratings
      const homeStats: TeamMatchStats[] = Array.from({ length: 10 }, (_, i) => ({
        matchId: `custom_h_${i}`,
        date: new Date(Date.now() - (i + 1) * 7 * 86400000).toISOString(),
        isHome: i % 2 === 0,
        opponentId: 800 + i,
        opponentName: `Opponent ${i + 1}`,
        goalsFor: Math.max(0, Math.round(homeAttackRating * 1.5 + (i % 2))),
        goalsAgainst: Math.max(0, Math.round(homeDefenseRating * 1.2)),
        cornersFor: Math.round(6 + (i % 3)),
        cornersAgainst: 4,
        yellowCards: 2,
        redCards: 0,
      }));

      const awayStats: TeamMatchStats[] = Array.from({ length: 10 }, (_, i) => ({
        matchId: `custom_a_${i}`,
        date: new Date(Date.now() - (i + 1) * 7 * 86400000).toISOString(),
        isHome: i % 2 !== 0,
        opponentId: 900 + i,
        opponentName: `Opponent ${i + 1}`,
        goalsFor: Math.max(0, Math.round(awayAttackRating * 1.4)),
        goalsAgainst: Math.max(0, Math.round(awayDefenseRating * 1.3)),
        cornersFor: 5,
        cornersAgainst: Math.round(5 + (i % 2)),
        yellowCards: 2,
        redCards: 0,
      }));

      const prediction = PredictionEngine.predict(
        fixture,
        homeStats,
        awayStats,
        [],
        { modelWeight }
      );

      res.json({
        success: true,
        prediction,
      });
    } catch (err: any) {
      console.error('Custom match error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getBacktest(req: Request, res: Response) {
    try {
      const sampleSize = parseInt((req.query.sample as string) || '200', 10);
      const results = await runBacktest(sampleSize);
      res.json({
        success: true,
        results,
      });
    } catch (err: any) {
      console.error('Backtest error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
