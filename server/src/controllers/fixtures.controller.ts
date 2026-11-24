import { Request, Response } from 'express';
import { FootballProviderFactory } from '../services/providers/provider.factory.js';
import { SUPPORTED_LEAGUES } from '../config/leagues.js';
import { PredictionEngine } from '../engine/prediction-engine.js';
import { MatchFixture, MatchEvent } from '../types/index.js';

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

  /**
   * Returns active live matches
   */
  public static async getLiveFixtures(req: Request, res: Response) {
    try {
      const provider = FootballProviderFactory.getProvider();
      const ucl = await provider.getFixtures('CL', 1);
      const liveMatches = ucl.fixtures.filter((f) => ['LIVE', '1H', 'HT', '2H', 'ET', 'P', 'PEN'].includes(f.status));

      res.json({
        success: true,
        totalLive: liveMatches.length,
        lastUpdated: new Date().toISOString(),
        fixtures: liveMatches,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Server-Sent Events (SSE) live updates stream
   */
  public static async getLiveStream(req: Request, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send immediate initial sync
    const provider = FootballProviderFactory.getProvider();
    const ucl = await provider.getFixtures('CL', 1);
    const liveMatches = ucl.fixtures.filter((f) => ['LIVE', '1H', 'HT', '2H', 'ET', 'P', 'PEN'].includes(f.status));

    res.write(`event: initial-sync\ndata: ${JSON.stringify({ timestamp: new Date().toISOString(), fixtures: liveMatches })}\n\n`);

    const interval = setInterval(async () => {
      try {
        const pingData = {
          timestamp: new Date().toISOString(),
          activeCount: liveMatches.length,
        };
        res.write(`event: live-tick\ndata: ${JSON.stringify(pingData)}\n\n`);
      } catch (e) {
        clearInterval(interval);
      }
    }, 30000);

    req.on('close', () => {
      clearInterval(interval);
    });
  }
}
