import {
  BacktestResults,
  LeagueConfig,
  MatchFixture,
  MatchPrediction,
} from '../types/index.js';

const API_BASE = '/api';

export async function getLeagues(): Promise<LeagueConfig[]> {
  const res = await fetch(`${API_BASE}/leagues`);
  if (!res.ok) throw new Error(`Failed to fetch leagues (${res.status})`);
  const data = await res.json();
  return data.leagues;
}

export async function getFixtures(
  leagueId: string = 'PL',
  days: number = 7
): Promise<{ fixtures: MatchFixture[]; lastUpdated: string; provider: string }> {
  const res = await fetch(`${API_BASE}/fixtures?league=${leagueId}&days=${days}`);
  if (!res.ok) throw new Error(`Failed to fetch fixtures (${res.status})`);
  const data = await res.json();
  return {
    fixtures: data.fixtures,
    lastUpdated: data.lastUpdated,
    provider: data.provider,
  };
}

export async function getMatchPredictions(
  matchId: string | number,
  leagueId: string = 'PL',
  modelWeight?: number
): Promise<MatchPrediction> {
  const url = new URL(`${API_BASE}/match/${matchId}/predictions`, window.location.origin);
  url.searchParams.set('league', leagueId);
  if (modelWeight !== undefined) {
    url.searchParams.set('modelWeight', String(modelWeight));
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch prediction for match (${res.status})`);
  const data = await res.json();
  return data.prediction;
}

export async function getStrongestPicks(leagueId: string = 'PL'): Promise<any[]> {
  const res = await fetch(`${API_BASE}/picks/strongest?league=${leagueId}`);
  if (!res.ok) throw new Error(`Failed to fetch strongest picks (${res.status})`);
  const data = await res.json();
  return data.picks;
}

export async function getValuePicks(leagueId: string = 'PL'): Promise<any[]> {
  const res = await fetch(`${API_BASE}/picks/value?league=${leagueId}`);
  if (!res.ok) throw new Error(`Failed to fetch value picks (${res.status})`);
  const data = await res.json();
  return data.picks;
}

export async function simulateCustomMatch(payload: {
  homeTeam: string;
  awayTeam: string;
  leagueId?: string;
  homeOdds?: number;
  drawOdds?: number;
  awayOdds?: number;
  homeAttackRating?: number;
  awayAttackRating?: number;
  homeDefenseRating?: number;
  awayDefenseRating?: number;
}): Promise<MatchPrediction> {
  const res = await fetch(`${API_BASE}/custom-match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to simulate custom match (${res.status})`);
  const data = await res.json();
  return data.prediction;
}

export async function getBacktestResults(sampleSize: number = 200): Promise<BacktestResults> {
  const res = await fetch(`${API_BASE}/backtest?sample=${sampleSize}`);
  if (!res.ok) throw new Error(`Failed to fetch backtest (${res.status})`);
  const data = await res.json();
  return data.results;
}
