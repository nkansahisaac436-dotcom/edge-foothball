import { BookmakerOdds, MatchFixture, TeamMatchStats, TeamStanding } from '../../types/index.js';
import { IFootballDataProvider } from './football-data.interface.js';
import { SUPPORTED_LEAGUES } from '../../config/leagues.js';

interface TeamSeed {
  id: number;
  name: string;
  shortName: string;
  attackRating: number; // 0.7 to 1.6
  defenseRating: number; // 0.7 to 1.6 (lower is better defense)
  cornersWonAvg: number; // 4 to 8
  cornersConcededAvg: number; // 3 to 6
  cardsAvg: number; // 1.2 to 3.5
}

const LEAGUE_TEAMS: Record<string, TeamSeed[]> = {
  PL: [
    { id: 101, name: 'Arsenal', shortName: 'ARS', attackRating: 1.35, defenseRating: 0.72, cornersWonAvg: 6.8, cornersConcededAvg: 3.4, cardsAvg: 1.8 },
    { id: 102, name: 'Manchester City', shortName: 'MCI', attackRating: 1.45, defenseRating: 0.78, cornersWonAvg: 7.5, cornersConcededAvg: 3.1, cardsAvg: 1.6 },
    { id: 103, name: 'Liverpool', shortName: 'LIV', attackRating: 1.40, defenseRating: 0.75, cornersWonAvg: 7.1, cornersConcededAvg: 3.6, cardsAvg: 1.9 },
    { id: 104, name: 'Chelsea', shortName: 'CHE', attackRating: 1.25, defenseRating: 0.95, cornersWonAvg: 5.8, cornersConcededAvg: 4.5, cardsAvg: 2.6 },
    { id: 105, name: 'Tottenham Hotspur', shortName: 'TOT', attackRating: 1.30, defenseRating: 1.10, cornersWonAvg: 6.2, cornersConcededAvg: 5.1, cardsAvg: 2.3 },
    { id: 106, name: 'Aston Villa', shortName: 'AVL', attackRating: 1.20, defenseRating: 0.98, cornersWonAvg: 5.4, cornersConcededAvg: 4.8, cardsAvg: 2.4 },
    { id: 107, name: 'Newcastle United', shortName: 'NEW', attackRating: 1.15, defenseRating: 1.02, cornersWonAvg: 5.2, cornersConcededAvg: 4.7, cardsAvg: 2.5 },
    { id: 108, name: 'Manchester United', shortName: 'MUN', attackRating: 1.10, defenseRating: 1.15, cornersWonAvg: 5.6, cornersConcededAvg: 5.5, cardsAvg: 2.7 },
  ],
  CL: [
    { id: 201, name: 'Real Madrid', shortName: 'RMA', attackRating: 1.48, defenseRating: 0.80, cornersWonAvg: 6.9, cornersConcededAvg: 3.9, cardsAvg: 2.1 },
    { id: 202, name: 'Bayern Munich', shortName: 'BAY', attackRating: 1.45, defenseRating: 0.82, cornersWonAvg: 7.3, cornersConcededAvg: 3.5, cardsAvg: 1.7 },
    { id: 203, name: 'Paris Saint-Germain', shortName: 'PSG', attackRating: 1.38, defenseRating: 0.85, cornersWonAvg: 6.5, cornersConcededAvg: 3.8, cardsAvg: 2.0 },
    { id: 204, name: 'Inter Milan', shortName: 'INT', attackRating: 1.32, defenseRating: 0.70, cornersWonAvg: 6.4, cornersConcededAvg: 3.7, cardsAvg: 2.2 },
    { id: 205, name: 'Barcelona', shortName: 'BAR', attackRating: 1.42, defenseRating: 0.88, cornersWonAvg: 6.7, cornersConcededAvg: 3.6, cardsAvg: 2.3 },
    { id: 206, name: 'Bayer Leverkusen', shortName: 'B04', attackRating: 1.34, defenseRating: 0.86, cornersWonAvg: 6.6, cornersConcededAvg: 3.9, cardsAvg: 1.9 },
  ],
  PD: [
    { id: 301, name: 'Barcelona', shortName: 'BAR', attackRating: 1.42, defenseRating: 0.82, cornersWonAvg: 6.8, cornersConcededAvg: 3.5, cardsAvg: 2.2 },
    { id: 302, name: 'Real Madrid', shortName: 'RMA', attackRating: 1.44, defenseRating: 0.84, cornersWonAvg: 6.9, cornersConcededAvg: 3.8, cardsAvg: 2.0 },
    { id: 303, name: 'Atletico Madrid', shortName: 'ATM', attackRating: 1.22, defenseRating: 0.76, cornersWonAvg: 5.5, cornersConcededAvg: 4.1, cardsAvg: 2.8 },
    { id: 304, name: 'Athletic Club', shortName: 'ATH', attackRating: 1.16, defenseRating: 0.90, cornersWonAvg: 5.7, cornersConcededAvg: 4.2, cardsAvg: 2.4 },
    { id: 305, name: 'Villarreal', shortName: 'VIL', attackRating: 1.20, defenseRating: 1.05, cornersWonAvg: 5.3, cornersConcededAvg: 5.0, cardsAvg: 2.6 },
    { id: 306, name: 'Real Sociedad', shortName: 'RSO', attackRating: 1.08, defenseRating: 0.88, cornersWonAvg: 5.1, cornersConcededAvg: 4.4, cardsAvg: 2.5 },
  ],
  BL1: [
    { id: 401, name: 'Bayern Munich', shortName: 'BAY', attackRating: 1.55, defenseRating: 0.80, cornersWonAvg: 7.8, cornersConcededAvg: 3.4, cardsAvg: 1.7 },
    { id: 402, name: 'Bayer Leverkusen', shortName: 'B04', attackRating: 1.38, defenseRating: 0.85, cornersWonAvg: 6.9, cornersConcededAvg: 3.8, cardsAvg: 1.8 },
    { id: 403, name: 'Borussia Dortmund', shortName: 'BVB', attackRating: 1.30, defenseRating: 1.02, cornersWonAvg: 6.2, cornersConcededAvg: 4.5, cardsAvg: 2.1 },
    { id: 404, name: 'RB Leipzig', shortName: 'RBL', attackRating: 1.25, defenseRating: 0.92, cornersWonAvg: 5.9, cornersConcededAvg: 4.3, cardsAvg: 2.2 },
    { id: 405, name: 'Eintracht Frankfurt', shortName: 'SGE', attackRating: 1.24, defenseRating: 1.10, cornersWonAvg: 5.5, cornersConcededAvg: 5.0, cardsAvg: 2.3 },
  ],
  SA: [
    { id: 501, name: 'Inter Milan', shortName: 'INT', attackRating: 1.36, defenseRating: 0.72, cornersWonAvg: 6.5, cornersConcededAvg: 3.6, cardsAvg: 2.1 },
    { id: 502, name: 'Napoli', shortName: 'NAP', attackRating: 1.26, defenseRating: 0.75, cornersWonAvg: 6.0, cornersConcededAvg: 3.9, cardsAvg: 2.2 },
    { id: 503, name: 'Atalanta', shortName: 'ATA', attackRating: 1.38, defenseRating: 0.95, cornersWonAvg: 6.4, cornersConcededAvg: 4.6, cardsAvg: 2.4 },
    { id: 504, name: 'Juventus', shortName: 'JUV', attackRating: 1.18, defenseRating: 0.68, cornersWonAvg: 5.4, cornersConcededAvg: 3.8, cardsAvg: 2.3 },
    { id: 505, name: 'AC Milan', shortName: 'MIL', attackRating: 1.24, defenseRating: 1.00, cornersWonAvg: 5.7, cornersConcededAvg: 4.5, cardsAvg: 2.5 },
    { id: 506, name: 'Lazio', shortName: 'LAZ', attackRating: 1.22, defenseRating: 1.02, cornersWonAvg: 5.5, cornersConcededAvg: 4.7, cardsAvg: 2.6 },
  ],
  FL1: [
    { id: 601, name: 'Paris Saint-Germain', shortName: 'PSG', attackRating: 1.48, defenseRating: 0.76, cornersWonAvg: 7.2, cornersConcededAvg: 3.4, cardsAvg: 1.9 },
    { id: 602, name: 'Monaco', shortName: 'ASM', attackRating: 1.30, defenseRating: 0.92, cornersWonAvg: 5.8, cornersConcededAvg: 4.2, cardsAvg: 2.4 },
    { id: 603, name: 'Marseille', shortName: 'OM', attackRating: 1.28, defenseRating: 0.98, cornersWonAvg: 5.9, cornersConcededAvg: 4.5, cardsAvg: 2.6 },
    { id: 604, name: 'Lille', shortName: 'LOSC', attackRating: 1.18, defenseRating: 0.88, cornersWonAvg: 5.4, cornersConcededAvg: 4.1, cardsAvg: 2.1 },
    { id: 605, name: 'Lyon', shortName: 'OL', attackRating: 1.20, defenseRating: 1.06, cornersWonAvg: 5.6, cornersConcededAvg: 4.8, cardsAvg: 2.5 },
  ],
};

export class MockFootballDataProvider implements IFootballDataProvider {
  readonly name = 'MockDataProvider';

  public async getFixtures(leagueId: string, daysAhead: number = 7): Promise<{
    fixtures: MatchFixture[];
    lastUpdated: string;
  }> {
    const league = SUPPORTED_LEAGUES.find((l) => l.id.toUpperCase() === leagueId.toUpperCase()) || SUPPORTED_LEAGUES[0];
    const teams = LEAGUE_TEAMS[league.id] || LEAGUE_TEAMS.PL;
    const fixtures: MatchFixture[] = [];
    const now = new Date();

    // Create fixtures across the next daysAhead days
    let fixtureCounter = 1;
    for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
      const matchDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      
      // Schedule matches on this day
      // 2 matches per day to ensure dense upcoming calendar
      for (let m = 0; m < 2; m++) {
        const homeIdx = (dayOffset * 2 + m) % teams.length;
        let awayIdx = (homeIdx + 1 + m) % teams.length;
        if (homeIdx === awayIdx) awayIdx = (awayIdx + 1) % teams.length;

        const homeTeam = teams[homeIdx];
        const awayTeam = teams[awayIdx];

        // Specific kickoff times (12:30, 15:00, 17:30, 20:00 UTC)
        const hours = [12, 15, 17, 20][(dayOffset + m) % 4];
        matchDate.setUTCHours(hours, 0, 0, 0);

        const fixtureId = `mock_${league.id.toLowerCase()}_${dayOffset}_${m + 1}`;

        // Compute simulated market odds
        const homeStrength = (homeTeam.attackRating / awayTeam.defenseRating) * league.defaultHomeAdvantage;
        const awayStrength = awayTeam.attackRating / homeTeam.defenseRating;
        const total = homeStrength + awayStrength + 0.8;
        const pHome = homeStrength / total;
        const pAway = awayStrength / total;
        const pDraw = 0.8 / total;
        
        // Add realistic 5% bookmaker overround
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

        const isLive1 = dayOffset === 0 && m === 0;
        const isLive2 = dayOffset === 0 && m === 1;

        fixtures.push({
          id: fixtureId,
          leagueId: league.id,
          leagueName: league.name,
          leagueLogo: league.logo,
          round: `Matchday ${18 + dayOffset}`,
          utcDate: matchDate.toISOString(),
          status: isLive1 ? '1H' : isLive2 ? '2H' : 'SCHEDULED',
          minute: isLive1 ? 38 : isLive2 ? 67 : undefined,
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
          score: {
            fullTime: {
              home: isLive1 ? 1 : isLive2 ? 1 : null,
              away: isLive1 ? 0 : isLive2 ? 2 : null,
            },
          },
          odds,
          venue: `${homeTeam.name} Stadium`,
          events: isLive1
            ? [
                { id: `ev_${fixtureId}_1`, type: 'GOAL', minute: 24, teamSide: 'home', playerName: `${homeTeam.shortName} Striker` },
                { id: `ev_${fixtureId}_2`, type: 'CARD_YELLOW', minute: 31, teamSide: 'away', playerName: `${awayTeam.shortName} Defender` },
              ]
            : isLive2
            ? [
                { id: `ev_${fixtureId}_3`, type: 'GOAL', minute: 14, teamSide: 'home', playerName: `${homeTeam.shortName} Forward` },
                { id: `ev_${fixtureId}_4`, type: 'GOAL', minute: 49, teamSide: 'away', playerName: `${awayTeam.shortName} Midfielder` },
                { id: `ev_${fixtureId}_5`, type: 'GOAL', minute: 64, teamSide: 'away', playerName: `${awayTeam.shortName} Striker` },
              ]
            : undefined,
          liveStats: isLive1
            ? {
                minute: 38,
                homeScore: 1,
                awayScore: 0,
                period: '1H',
                possession: [58, 42],
                shotsTotal: [6, 2],
                shotsOnTarget: [3, 1],
                corners: [4, 1],
                fouls: [5, 7],
                yellowCards: [0, 1],
                redCards: [0, 0],
              }
            : isLive2
            ? {
                minute: 67,
                homeScore: 1,
                awayScore: 2,
                period: '2H',
                possession: [48, 52],
                shotsTotal: [7, 11],
                shotsOnTarget: [3, 6],
                corners: [4, 7],
                fouls: [10, 8],
                yellowCards: [1, 1],
                redCards: [0, 0],
              }
            : undefined,
        });
        fixtureCounter++;
      }
    }

    return {
      fixtures,
      lastUpdated: new Date().toISOString(),
    };
  }

  public async getTeamRecentMatches(
    teamId: string | number,
    leagueId: string,
    count: number = 15
  ): Promise<TeamMatchStats[]> {
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

      // Generate realistic stats based on team ratings with random variance
      const homeAdv = isHome ? 1.2 : 0.85;
      const expGoalsFor = (targetTeam.attackRating / opponent.defenseRating) * 1.3 * homeAdv;
      const expGoalsAgainst = (opponent.attackRating / targetTeam.defenseRating) * 1.3 / homeAdv;

      const goalsFor = Math.max(0, Math.round(expGoalsFor + (Math.sin(i * 1.7) * 1.1)));
      const goalsAgainst = Math.max(0, Math.round(expGoalsAgainst + (Math.cos(i * 1.3) * 1.1)));

      const cornersFor = Math.max(1, Math.round(targetTeam.cornersWonAvg + Math.sin(i * 2.1) * 2.2));
      const cornersAgainst = Math.max(1, Math.round(opponent.cornersWonAvg + Math.cos(i * 1.9) * 2.0));

      const yellowCards = Math.max(0, Math.round(targetTeam.cardsAvg + Math.sin(i * 0.9) * 1.2));
      const redCards = Math.random() < 0.08 ? 1 : 0;

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
        redCards,
        shotsTotal: Math.round(cornersFor * 2.2 + goalsFor * 3),
        shotsOnTarget: Math.round(goalsFor + cornersFor * 0.7),
      });
    }

    return results;
  }

  public async getStandings(leagueId: string): Promise<TeamStanding[]> {
    const league = SUPPORTED_LEAGUES.find((l) => l.id.toUpperCase() === leagueId.toUpperCase()) || SUPPORTED_LEAGUES[0];
    const teams = LEAGUE_TEAMS[league.id] || LEAGUE_TEAMS.PL;

    // Rank teams roughly by attack/defense ratio
    const sorted = [...teams].sort((a, b) => {
      const scoreA = a.attackRating / a.defenseRating;
      const scoreB = b.attackRating / b.defenseRating;
      return scoreB - scoreA;
    });

    return sorted.map((team, idx) => {
      const played = 24;
      const won = Math.max(4, Math.round(18 - idx * 1.8));
      const draw = Math.round(3 + (idx % 3));
      const lost = played - won - draw;
      const gf = Math.round(55 - idx * 3.5);
      const ga = Math.round(18 + idx * 3);
      const pts = won * 3 + draw;

      const forms = ['WWWDW', 'WWDWL', 'WLWWD', 'LWWDL', 'DLDWW', 'LLDLW'];

      return {
        position: idx + 1,
        teamId: team.id,
        teamName: team.name,
        playedGames: played,
        won,
        draw,
        lost,
        points: pts,
        goalsFor: gf,
        goalsAgainst: ga,
        goalDifference: gf - ga,
        form: forms[idx % forms.length],
      };
    });
  }

  public async getOdds(fixtureId: string | number): Promise<BookmakerOdds | undefined> {
    return {
      homeWin: 1.95,
      draw: 3.50,
      awayWin: 3.90,
      bookmaker: 'SportyBet',
      over25: 1.85,
      under25: 1.95,
      bttsYes: 1.72,
      bttsNo: 2.10,
    };
  }

  public async getH2H(teamAId: string | number, teamBId: string | number, count: number = 5): Promise<MatchFixture[]> {
    const results: MatchFixture[] = [];
    const now = Date.now();
    for (let i = 0; i < count; i++) {
      const matchDate = new Date(now - (i + 1) * 90 * 24 * 60 * 60 * 1000);
      const isTeamAHome = i % 2 === 0;
      results.push({
        id: `h2h_${teamAId}_${teamBId}_${i}`,
        leagueId: 'PL',
        leagueName: 'Premier League',
        utcDate: matchDate.toISOString(),
        status: 'FINISHED',
        homeTeam: { id: isTeamAHome ? teamAId : teamBId, name: isTeamAHome ? `Team ${teamAId}` : `Team ${teamBId}` },
        awayTeam: { id: isTeamAHome ? teamBId : teamAId, name: isTeamAHome ? `Team ${teamBId}` : `Team ${teamAId}` },
        score: {
          fullTime: {
            home: (i + 1) % 3,
            away: i % 2,
          },
        },
      });
    }
    return results;
  }
}
