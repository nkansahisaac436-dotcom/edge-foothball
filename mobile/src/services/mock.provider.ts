import { BookmakerOdds, MatchFixture, TeamMatchStats, TeamStanding } from '../types';
import { SUPPORTED_LEAGUES } from '../config/leagues';

interface TeamSeed {
  id: number;
  name: string;
  shortName: string;
  attackRating: number;
  defenseRating: number;
  cornersWonAvg: number;
  cornersConcededAvg: number;
  cardsAvg: number;
}

const LEAGUE_TEAMS: Record<string, TeamSeed[]> = {
  PL: [
    { id: 101, name: 'Arsenal', shortName: 'ARS', attackRating: 1.35, defenseRating: 0.72, cornersWonAvg: 6.8, cornersConcededAvg: 3.4, cardsAvg: 1.8 },
    { id: 102, name: 'Manchester City', shortName: 'MCI', attackRating: 1.45, defenseRating: 0.78, cornersWonAvg: 7.5, cornersConcededAvg: 3.1, cardsAvg: 1.6 },
    { id: 103, name: 'Liverpool', shortName: 'LIV', attackRating: 1.40, defenseRating: 0.75, cornersWonAvg: 7.1, cornersConcededAvg: 3.6, cardsAvg: 1.9 },
    { id: 104, name: 'Chelsea', shortName: 'CHE', attackRating: 1.25, defenseRating: 0.95, cornersWonAvg: 5.8, cornersConcededAvg: 4.5, cardsAvg: 2.6 },
    { id: 105, name: 'Tottenham Hotspur', shortName: 'TOT', attackRating: 1.30, defenseRating: 1.10, cornersWonAvg: 6.2, cornersConcededAvg: 5.1, cardsAvg: 2.3 },
    { id: 106, name: 'Aston Villa', shortName: 'AVL', attackRating: 1.20, defenseRating: 0.98, cornersWonAvg: 5.4, cornersConcededAvg: 4.8, cardsAvg: 2.4 },
  ],
  CL: [
    { id: 201, name: 'Real Madrid', shortName: 'RMA', attackRating: 1.48, defenseRating: 0.80, cornersWonAvg: 6.9, cornersConcededAvg: 3.9, cardsAvg: 2.1 },
    { id: 202, name: 'Bayern Munich', shortName: 'BAY', attackRating: 1.45, defenseRating: 0.82, cornersWonAvg: 7.3, cornersConcededAvg: 3.5, cardsAvg: 1.7 },
    { id: 203, name: 'Paris Saint-Germain', shortName: 'PSG', attackRating: 1.38, defenseRating: 0.85, cornersWonAvg: 6.5, cornersConcededAvg: 3.8, cardsAvg: 2.0 },
    { id: 204, name: 'Inter Milan', shortName: 'INT', attackRating: 1.32, defenseRating: 0.70, cornersWonAvg: 6.4, cornersConcededAvg: 3.7, cardsAvg: 2.2 },
  ],
  PD: [
    { id: 301, name: 'Barcelona', shortName: 'BAR', attackRating: 1.42, defenseRating: 0.82, cornersWonAvg: 6.8, cornersConcededAvg: 3.5, cardsAvg: 2.2 },
    { id: 302, name: 'Real Madrid', shortName: 'RMA', attackRating: 1.44, defenseRating: 0.84, cornersWonAvg: 6.9, cornersConcededAvg: 3.8, cardsAvg: 2.0 },
    { id: 303, name: 'Atletico Madrid', shortName: 'ATM', attackRating: 1.22, defenseRating: 0.76, cornersWonAvg: 5.5, cornersConcededAvg: 4.1, cardsAvg: 2.8 },
  ],
  BL1: [
    { id: 401, name: 'Bayern Munich', shortName: 'BAY', attackRating: 1.55, defenseRating: 0.80, cornersWonAvg: 7.8, cornersConcededAvg: 3.4, cardsAvg: 1.7 },
    { id: 402, name: 'Bayer Leverkusen', shortName: 'B04', attackRating: 1.38, defenseRating: 0.85, cornersWonAvg: 6.9, cornersConcededAvg: 3.8, cardsAvg: 1.8 },
    { id: 403, name: 'Borussia Dortmund', shortName: 'BVB', attackRating: 1.30, defenseRating: 1.02, cornersWonAvg: 6.2, cornersConcededAvg: 4.5, cardsAvg: 2.1 },
  ],
  SA: [
    { id: 501, name: 'Inter Milan', shortName: 'INT', attackRating: 1.36, defenseRating: 0.72, cornersWonAvg: 6.5, cornersConcededAvg: 3.6, cardsAvg: 2.1 },
    { id: 502, name: 'Napoli', shortName: 'NAP', attackRating: 1.26, defenseRating: 0.75, cornersWonAvg: 6.0, cornersConcededAvg: 3.9, cardsAvg: 2.2 },
    { id: 503, name: 'Juventus', shortName: 'JUV', attackRating: 1.18, defenseRating: 0.68, cornersWonAvg: 5.4, cornersConcededAvg: 3.8, cardsAvg: 2.3 },
  ],
  FL1: [
    { id: 601, name: 'Paris Saint-Germain', shortName: 'PSG', attackRating: 1.48, defenseRating: 0.76, cornersWonAvg: 7.2, cornersConcededAvg: 3.4, cardsAvg: 1.9 },
    { id: 602, name: 'Monaco', shortName: 'ASM', attackRating: 1.30, defenseRating: 0.92, cornersWonAvg: 5.8, cornersConcededAvg: 4.2, cardsAvg: 2.4 },
    { id: 603, name: 'Marseille', shortName: 'OM', attackRating: 1.28, defenseRating: 0.98, cornersWonAvg: 5.9, cornersConcededAvg: 4.5, cardsAvg: 2.6 },
  ],
};

export class MobileDataProvider {
  public static getFixtures(leagueId: string, daysAhead: number = 7): MatchFixture[] {
    const league = SUPPORTED_LEAGUES.find((l) => l.id.toUpperCase() === leagueId.toUpperCase()) || SUPPORTED_LEAGUES[0];
    const teams = LEAGUE_TEAMS[league.id] || LEAGUE_TEAMS.PL;
    const fixtures: MatchFixture[] = [];
    const now = new Date();

    for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
      const matchDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      for (let m = 0; m < 2; m++) {
        const homeIdx = (dayOffset * 2 + m) % teams.length;
        let awayIdx = (homeIdx + 1 + m) % teams.length;
        if (homeIdx === awayIdx) awayIdx = (awayIdx + 1) % teams.length;

        const homeTeam = teams[homeIdx];
        const awayTeam = teams[awayIdx];

        const hours = [12, 15, 17, 20][(dayOffset + m) % 4];
        matchDate.setUTCHours(hours, 0, 0, 0);

        const homeStrength = (homeTeam.attackRating / awayTeam.defenseRating) * league.defaultHomeAdvantage;
        const awayStrength = awayTeam.attackRating / homeTeam.defenseRating;
        const total = homeStrength + awayStrength + 0.8;
        const pHome = homeStrength / total;
        const pAway = awayStrength / total;
        const pDraw = 0.8 / total;
        const margin = 1.05;

        const odds: BookmakerOdds = {
          homeWin: Number((margin / pHome).toFixed(2)),
          draw: Number((margin / pDraw).toFixed(2)),
          awayWin: Number((margin / pAway).toFixed(2)),
          bookmaker: 'SportyBet',
          over25: 1.85,
          under25: 1.95,
          bttsYes: 1.75,
          bttsNo: 2.05,
        };

        fixtures.push({
          id: `mob_${league.id.toLowerCase()}_${dayOffset}_${m + 1}`,
          leagueId: league.id,
          leagueName: league.name,
          leagueLogo: league.logo,
          round: `Matchday ${18 + dayOffset}`,
          utcDate: matchDate.toISOString(),
          status: 'SCHEDULED',
          homeTeam: {
            id: homeTeam.id,
            name: homeTeam.name,
            shortName: homeTeam.shortName,
            logo: `https://media.api-sports.io/football/teams/${homeTeam.id}.png`,
          },
          awayTeam: {
            id: awayTeam.id,
            name: awayTeam.name,
            shortName: awayTeam.shortName,
            logo: `https://media.api-sports.io/football/teams/${awayTeam.id}.png`,
          },
          odds,
          venue: `${homeTeam.name} Stadium`,
        });
      }
    }

    return fixtures;
  }

  public static getTeamRecentMatches(teamId: string | number, count: number = 10): TeamMatchStats[] {
    const numericId = Number(teamId);
    let allTeams: TeamSeed[] = [];
    Object.values(LEAGUE_TEAMS).forEach((tList) => allTeams.push(...tList));
    const targetTeam = allTeams.find((t) => t.id === numericId) || {
      id: numericId,
      name: 'Team ' + teamId,
      shortName: 'T' + teamId,
      attackRating: 1.1,
      defenseRating: 1.0,
      cornersWonAvg: 5.5,
      cornersConcededAvg: 4.5,
      cardsAvg: 2.1,
    };

    const opponentPool = allTeams.filter((t) => t.id !== numericId);
    const results: TeamMatchStats[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const matchDate = new Date(now - (i + 1) * 6 * 24 * 60 * 60 * 1000);
      const isHome = i % 2 === 0;
      const opponent = opponentPool[(i + numericId) % opponentPool.length] || {
        id: 999,
        name: 'Opponent FC',
        defenseRating: 1.0,
        attackRating: 1.0,
        cornersWonAvg: 5.0,
        cornersConcededAvg: 5.0,
        cardsAvg: 2.2,
      };

      const homeAdv = isHome ? 1.2 : 0.85;
      const expGoalsFor = (targetTeam.attackRating / opponent.defenseRating) * 1.3 * homeAdv;
      const expGoalsAgainst = (opponent.attackRating / targetTeam.defenseRating) * 1.3 / homeAdv;

      const goalsFor = Math.max(0, Math.round(expGoalsFor + (Math.sin(i * 1.7) * 1.1)));
      const goalsAgainst = Math.max(0, Math.round(expGoalsAgainst + (Math.cos(i * 1.3) * 1.1)));
      const cornersFor = Math.max(1, Math.round(targetTeam.cornersWonAvg + Math.sin(i * 2.1) * 2.2));
      const cornersAgainst = Math.max(1, Math.round(opponent.cornersWonAvg + Math.cos(i * 1.9) * 2.0));
      const yellowCards = Math.max(0, Math.round(targetTeam.cardsAvg + Math.sin(i * 0.9) * 1.2));

      results.push({
        matchId: `hist_${numericId}_${i}`,
        date: matchDate.toISOString(),
        isHome,
        opponentId: opponent.id,
        opponentName: opponent.name,
        goalsFor,
        goalsAgainst,
        cornersFor,
        cornersAgainst,
        yellowCards,
        redCards: 0,
      });
    }

    return results;
  }
}
