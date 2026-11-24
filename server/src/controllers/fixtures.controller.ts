import { Request, Response } from 'express';
import { FootballProviderFactory } from '../services/providers/provider.factory.js';
import { SUPPORTED_LEAGUES } from '../config/leagues.js';

export class FixturesController {
  public static async getLeagues(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        leagues: SUPPORTED_LEAGUES,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getFixtures(req: Request, res: Response) {
    try {
      const leagueId = (req.query.league as string) || 'PL';
      const daysAhead = parseInt((req.query.days as string) || '7', 10);

      const provider = FootballProviderFactory.getProvider();
      const result = await provider.getFixtures(leagueId, daysAhead);

      res.json({
        success: true,
        leagueId,
        daysAhead,
        total: result.fixtures.length,
        lastUpdated: result.lastUpdated,
        provider: provider.name,
        fixtures: result.fixtures,
      });
    } catch (err: any) {
      console.error('Error fetching fixtures:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch fixtures',
        details: err.message,
      });
    }
  }

  public static async getStandings(req: Request, res: Response) {
    try {
      const leagueId = (req.query.league as string) || 'PL';
      const provider = FootballProviderFactory.getProvider();
      const standings = await provider.getStandings(leagueId);

      res.json({
        success: true,
        leagueId,
        standings,
      });
    } catch (err: any) {
      console.error('Error fetching standings:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
