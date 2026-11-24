import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SUPPORTED_LEAGUES } from './src/config/leagues';
import { MobileDataProvider, REAL_TEAMS } from './src/services/mock.provider';
import { PredictionEngine } from './src/engine/prediction-engine';
import {
  MatchFixture,
  MatchPrediction,
  MarketSelection,
  AccumulatorLeg,
  TeamStanding,
  LeagueConfig,
} from './src/types';

const { width } = Dimensions.get('window');

export default function App() {
  // Navigation & View State
  const [activeBottomNav, setActiveBottomNav] = useState<'football' | 'favourites' | 'picks' | 'standings'>('football');
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<string>('ALL');
  const [dateIndex, setDateIndex] = useState<number>(0); // 0 = Today, 1 = Tomorrow, etc.
  const [showLiveOnly, setShowLiveOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favourites, setFavourites] = useState<Record<string, boolean>>({});

  // Match Details Modal
  const [selectedMatch, setSelectedMatch] = useState<MatchFixture | null>(null);
  const [detailMarketCategory, setDetailMarketCategory] = useState<string>('all');

  // Accumulator Slip State
  const [slip, setSlip] = useState<AccumulatorLeg[]>([]);
  const [isSlipOpen, setIsSlipOpen] = useState(false);

  // Custom Match Simulation Modal
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customHome, setCustomHome] = useState('Arsenal');
  const [customAway, setCustomAway] = useState('Chelsea');
  const [customOdds1, setCustomOdds1] = useState('1.95');
  const [customOddsX, setCustomOddsX] = useState('3.50');
  const [customOdds2, setCustomOdds2] = useState('3.90');
  const [customResult, setCustomResult] = useState<MatchPrediction | null>(null);

  // Standings League
  const [standingsLeague, setStandingsLeague] = useState<string>('CL');

  // All Fixtures
  const allFixtures = useMemo(() => {
    return MobileDataProvider.getFixtures();
  }, []);

  // Pre-computed predictions
  const predictionsMap = useMemo(() => {
    const map: Record<string, MatchPrediction> = {};
    allFixtures.forEach((f) => {
      const hStats = MobileDataProvider.getTeamRecentMatches(f.homeTeam.id, 10);
      const aStats = MobileDataProvider.getTeamRecentMatches(f.awayTeam.id, 10);
      map[f.id] = PredictionEngine.predict(f, hStats, aStats);
    });
    return map;
  }, [allFixtures]);

  // Live match count
  const liveCount = useMemo(() => {
    return allFixtures.filter((f) => f.status === 'LIVE').length;
  }, [allFixtures]);

  // Date Carousel items
  const dateOptions = useMemo(() => {
    const now = new Date();
    return [
      { index: 0, label: 'Today', key: now.toISOString().split('T')[0] },
      { index: 1, label: 'Tomorrow', key: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      { index: 2, label: new Date(now.getTime() + 48 * 60 * 60 * 1000).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }), key: 'day2' },
      { index: 3, label: new Date(now.getTime() + 72 * 60 * 60 * 1000).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }), key: 'day3' },
      { index: -1, label: 'All Dates', key: 'ALL' },
    ];
  }, []);

  // Filtered fixtures based on date, search, live filter, league filter
  const filteredFixtures = useMemo(() => {
    return allFixtures.filter((f) => {
      // Live filter
      if (showLiveOnly && f.status !== 'LIVE') return false;

      // League filter
      if (selectedLeagueFilter !== 'ALL' && f.leagueId.toUpperCase() !== selectedLeagueFilter.toUpperCase()) {
        return false;
      }

      // Date filter (if not live only and not "All Dates")
      if (!showLiveOnly && dateIndex !== -1) {
        const idStr = String(f.id);
        if (dateIndex === 0) {
          // Today matches: either LIVE or today's scheduled
          if (!idStr.includes('today') && f.status !== 'LIVE' && !idStr.includes('wk_1')) {
            // Keep today's
            if (!idStr.includes('today')) return false;
          }
        } else if (dateIndex === 1) {
          // Tomorrow matches
          if (!idStr.includes('tom')) return false;
        } else if (dateIndex === 2) {
          if (!idStr.includes('wk_1')) return false;
        } else if (dateIndex === 3) {
          if (!idStr.includes('wk_2') && !idStr.includes('wk_3')) return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchHome = f.homeTeam.name.toLowerCase().includes(q);
        const matchAway = f.awayTeam.name.toLowerCase().includes(q);
        const matchLeague = f.leagueName.toLowerCase().includes(q);
        if (!matchHome && !matchAway && !matchLeague) return false;
      }

      return true;
    });
  }, [allFixtures, showLiveOnly, selectedLeagueFilter, dateIndex, searchQuery]);

  // Group filtered fixtures by League
  const groupedFixtures = useMemo(() => {
    const map = new Map<string, MatchFixture[]>();

    filteredFixtures.forEach((f) => {
      if (!map.has(f.leagueId)) {
        map.set(f.leagueId, []);
      }
      map.get(f.leagueId)!.push(f);
    });

    const groups: { league: LeagueConfig; fixtures: MatchFixture[] }[] = [];

    // Order according to SUPPORTED_LEAGUES order
    SUPPORTED_LEAGUES.forEach((league) => {
      const fixtures = map.get(league.id);
      if (fixtures && fixtures.length > 0) {
        groups.push({ league, fixtures });
      }
    });

    // In case any league was not in supported leagues
    map.forEach((fixtures, leagueId) => {
      if (!SUPPORTED_LEAGUES.some((l) => l.id === leagueId)) {
        groups.push({
          league: {
            id: leagueId,
            name: fixtures[0].leagueName,
            country: fixtures[0].country || 'International',
            logo: fixtures[0].leagueLogo || 'https://media.api-sports.io/football/leagues/2.png',
            apiFootballId: 0,
            footballDataOrgCode: leagueId,
            defaultHomeAdvantage: 1.25,
            defaultLeagueAvgGoals: 2.8,
            defaultLeagueAvgCorners: 10.0,
            defaultLeagueAvgCards: 4.0,
            currentSeason: 2024,
          },
          fixtures,
        });
      }
    });

    return groups;
  }, [filteredFixtures]);

  // Strongest picks across all matches
  const strongestPicks = useMemo(() => {
    const list: any[] = [];
    allFixtures.forEach((f) => {
      const pred = predictionsMap[f.id];
      if (!pred) return;
      const candidates = [
        ...pred.markets.cornersTotal.selections.filter((s) => s.outcome === 'Over 7.5'),
        ...pred.markets.totalGoals.selections.filter((s) => s.outcome === 'Over 1.5' || s.outcome === 'Under 3.5'),
        ...pred.markets.doubleChance.selections,
        ...pred.markets.result1X2.selections,
      ];
      candidates.forEach((c) => {
        if (c.probability >= 0.70) {
          list.push({
            id: `${f.id}_strong_${c.outcome}`,
            matchId: f.id,
            matchTitle: `${f.homeTeam.name} vs ${f.awayTeam.name}`,
            name: c.name,
            outcome: c.outcome,
            probability: c.probability,
            fairOdds: c.fairOdds,
            isEstimate: c.isEstimate,
          });
        }
      });
    });
    return list.sort((a, b) => b.probability - a.probability);
  }, [allFixtures, predictionsMap]);

  // Value picks (+EV)
  const valuePicks = useMemo(() => {
    const list: any[] = [];
    allFixtures.forEach((f) => {
      const pred = predictionsMap[f.id];
      if (!pred) return;
      const candidates = [
        ...pred.markets.result1X2.selections,
        ...pred.markets.totalGoals.selections,
        ...pred.markets.btts.selections,
      ];
      candidates.forEach((c) => {
        if (c.edge && c.edge >= 0.02 && c.marketOdds) {
          list.push({
            id: `${f.id}_val_${c.outcome}`,
            matchId: f.id,
            matchTitle: `${f.homeTeam.name} vs ${f.awayTeam.name}`,
            name: c.name,
            outcome: c.outcome,
            probability: c.probability,
            marketOdds: c.marketOdds,
            fairOdds: c.fairOdds,
            edge: (c.edge * 100).toFixed(1),
          });
        }
      });
    });
    return list.sort((a, b) => (parseFloat(b.edge) || 0) - (parseFloat(a.edge) || 0));
  }, [allFixtures, predictionsMap]);

  // Accumulator Calculations
  const combinedProb = slip.length > 0 ? slip.reduce((acc, l) => acc * l.probability, 1.0) : 1.0;
  const combinedOdds = combinedProb > 0.0001 ? (1 / combinedProb).toFixed(2) : '999.00';

  const toggleLeg = (leg: AccumulatorLeg) => {
    setSlip((prev) => {
      if (prev.some((l) => l.id === leg.id)) {
        return prev.filter((l) => l.id !== leg.id);
      }
      return [...prev, leg];
    });
  };

  const toggleFavourite = (id: string | number) => {
    setFavourites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSimulateCustom = () => {
    const f: MatchFixture = {
      id: `custom_${Date.now()}`,
      leagueId: 'PL',
      leagueName: 'Custom Match',
      utcDate: new Date().toISOString(),
      status: 'SCHEDULED',
      homeTeam: { id: 901, name: customHome },
      awayTeam: { id: 902, name: customAway },
      odds: {
        homeWin: parseFloat(customOdds1) || 2.0,
        draw: parseFloat(customOddsX) || 3.4,
        awayWin: parseFloat(customOdds2) || 3.8,
        bookmaker: 'SportyBet',
      },
    };
    const hStats = MobileDataProvider.getTeamRecentMatches(901, 10);
    const aStats = MobileDataProvider.getTeamRecentMatches(902, 10);
    const pred = PredictionEngine.predict(f, hStats, aStats);
    setCustomResult(pred);
  };

  // Standings data
  const standingsData: TeamStanding[] = useMemo(() => {
    return MobileDataProvider.getStandings(standingsLeague);
  }, [standingsLeague]);

  // Date Navigation step
  const handleDatePrev = () => {
    if (dateIndex > 0) setDateIndex(dateIndex - 1);
  };
  const handleDateNext = () => {
    if (dateIndex < dateOptions.length - 2) setDateIndex(dateIndex + 1);
  };

  // Selected match prediction
  const currentPrediction = selectedMatch ? predictionsMap[selectedMatch.id] : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* SOFASCORE TOP BAR */}
      <View style={styles.topBar}>
        {/* Left Lightning / ME Icon */}
        <TouchableOpacity
          style={styles.logoBtn}
          onPress={() => setIsCustomModalOpen(true)}
        >
          <Ionicons name="flash" size={22} color="#00e676" />
        </TouchableOpacity>

        {/* Sofascore Search Box */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#8a99ad" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Sofascore / Teams"
            placeholderTextColor="#8a99ad"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#8a99ad" />
            </TouchableOpacity>
          )}
        </View>

        {/* Right Action Icons */}
        <View style={styles.topRightIcons}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => setIsCustomModalOpen(true)}>
            <MaterialCommunityIcons name="tune-vertical" size={20} color="#cbd5e1" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="person-circle-outline" size={24} color="#cbd5e1" />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>
      </View>

      {/* SOFASCORE CONTROLS BAR: Filter, Live Button, Date Navigator */}
      <View style={styles.controlsBar}>
        {/* Filter Button */}
        <TouchableOpacity
          style={[styles.filterBtn, selectedLeagueFilter !== 'ALL' && styles.filterBtnActive]}
          onPress={() => {
            const next = selectedLeagueFilter === 'ALL' ? 'CL' : selectedLeagueFilter === 'CL' ? 'ELC' : selectedLeagueFilter === 'ELC' ? 'PL' : 'ALL';
            setSelectedLeagueFilter(next);
          }}
        >
          <Ionicons name="options-outline" size={16} color={selectedLeagueFilter !== 'ALL' ? '#00e676' : '#cbd5e1'} style={{ marginRight: 4 }} />
          <Text style={[styles.filterBtnText, selectedLeagueFilter !== 'ALL' && { color: '#00e676' }]}>
            {selectedLeagueFilter === 'ALL' ? 'Filter' : selectedLeagueFilter}
          </Text>
        </TouchableOpacity>

        {/* Live Button (Pills red like Sofascore) */}
        <TouchableOpacity
          style={[styles.liveBtn, showLiveOnly && styles.liveBtnActive]}
          onPress={() => setShowLiveOnly(!showLiveOnly)}
        >
          <View style={[styles.liveDot, showLiveOnly && styles.liveDotActive]} />
          <Text style={[styles.liveBtnText, showLiveOnly && styles.liveBtnTextActive]}>
            Live {liveCount > 0 ? `(${liveCount})` : ''}
          </Text>
        </TouchableOpacity>

        {/* Date Selector Carousel */}
        <View style={styles.dateNavigator}>
          <TouchableOpacity
            style={styles.dateArrow}
            onPress={handleDatePrev}
            disabled={dateIndex === 0}
          >
            <Ionicons name="chevron-back" size={18} color={dateIndex === 0 ? '#475569' : '#cbd5e1'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateDisplay}
            onPress={() => setDateIndex(dateIndex === 0 ? 1 : 0)}
          >
            <Text style={styles.dateDisplayText}>
              {dateOptions.find((d) => d.index === dateIndex)?.label || 'Today'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateArrow}
            onPress={handleDateNext}
            disabled={dateIndex >= dateOptions.length - 2}
          >
            <Ionicons name="chevron-forward" size={18} color={dateIndex >= dateOptions.length - 2 ? '#475569' : '#cbd5e1'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* QUICK DATE CHIPS (Horizontal scroll) */}
      <View style={styles.dateChipsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
          {dateOptions.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.dateChip, dateIndex === opt.index && styles.dateChipActive]}
              onPress={() => setDateIndex(opt.index)}
            >
              <Text style={[styles.dateChipText, dateIndex === opt.index && styles.dateChipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* MAIN CONTENT AREA */}
      {activeBottomNav === 'football' && (
        <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: 100 }}>
          {groupedFixtures.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="football-outline" size={48} color="#475569" />
              <Text style={styles.emptyTitle}>No Matches Found</Text>
              <Text style={styles.emptySubtitle}>Try changing the date, clearing search, or toggling off Live.</Text>
            </View>
          ) : (
            groupedFixtures.map(({ league, fixtures }) => (
              <View key={league.id} style={styles.leagueCard}>
                {/* Sofascore League Header */}
                <View style={styles.leagueHeader}>
                  <View style={styles.leagueInfoRow}>
                    <View style={styles.leagueIconCircle}>
                      <Ionicons name="football" size={14} color="#00e676" />
                    </View>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.leagueName}>{league.name}</Text>
                        <Ionicons name="pin" size={11} color="#64748b" style={{ marginLeft: 4 }} />
                      </View>
                      <Text style={styles.leagueCountry}>
                        {league.country === 'Europe' ? '🇪🇺 Europe' : league.country === 'England' ? '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England' : league.country}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleFavourite(league.id)}
                    style={styles.leagueStarBtn}
                  >
                    <Ionicons
                      name={favourites[league.id] ? 'star' : 'star-outline'}
                      size={18}
                      color={favourites[league.id] ? '#ffb300' : '#64748b'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Match Rows */}
                {fixtures.map((fixture, idx) => {
                  const pred = predictionsMap[fixture.id];
                  const isLive = fixture.status === 'LIVE';
                  const topPick = pred?.topPicks?.[0];

                  const homeProb = pred?.markets?.result1X2?.selections?.find((s) => s.outcome === '1')?.probability || 0.45;
                  const drawProb = pred?.markets?.result1X2?.selections?.find((s) => s.outcome === 'X')?.probability || 0.25;
                  const awayProb = pred?.markets?.result1X2?.selections?.find((s) => s.outcome === '2')?.probability || 0.30;

                  return (
                    <TouchableOpacity
                      key={fixture.id}
                      style={[styles.matchRow, idx < fixtures.length - 1 && styles.matchRowBorder]}
                      activeOpacity={0.7}
                      onPress={() => setSelectedMatch(fixture)}
                    >
                      {/* Left Status / Time Column */}
                      <View style={styles.timeColumn}>
                        {isLive ? (
                          <View style={styles.liveTagContainer}>
                            <Text style={styles.liveMinuteText}>{fixture.minute || "68'"}</Text>
                            <View style={styles.livePulsingDot} />
                          </View>
                        ) : (
                          <Text style={styles.matchTimeText}>
                            {new Date(fixture.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        )}
                        <Text style={styles.timeSubtext}>{isLive ? 'LIVE' : '-'}</Text>
                      </View>

                      {/* Center Teams & Matchday Edge Predictions Column */}
                      <View style={styles.teamsColumn}>
                        {/* Home Team Row */}
                        <View style={styles.teamLine}>
                          <View style={styles.teamNameWithDot}>
                            <View style={styles.teamDot} />
                            <Text style={styles.teamNameText} numberOfLines={1}>
                              {fixture.homeTeam.name}
                            </Text>
                          </View>
                          {isLive && fixture.score?.fullTime?.home != null && (
                            <Text style={styles.liveScoreText}>{fixture.score.fullTime.home}</Text>
                          )}
                        </View>

                        {/* Away Team Row */}
                        <View style={styles.teamLine}>
                          <View style={styles.teamNameWithDot}>
                            <View style={[styles.teamDot, { backgroundColor: '#38bdf8' }]} />
                            <Text style={styles.teamNameText} numberOfLines={1}>
                              {fixture.awayTeam.name}
                            </Text>
                          </View>
                          {isLive && fixture.score?.fullTime?.away != null && (
                            <Text style={styles.liveScoreText}>{fixture.score.fullTime.away}</Text>
                          )}
                        </View>

                        {/* Matchday Edge Probability Bar */}
                        <View style={styles.edgeProbContainer}>
                          <View style={styles.edgeProbBar}>
                            <View style={[styles.probFillHome, { flex: homeProb }]} />
                            <View style={[styles.probFillDraw, { flex: drawProb }]} />
                            <View style={[styles.probFillAway, { flex: awayProb }]} />
                          </View>

                          <View style={styles.edgeProbLabels}>
                            <Text style={styles.edgeProbText}>
                              1: {(homeProb * 100).toFixed(0)}%  •  X: {(drawProb * 100).toFixed(0)}%  •  2: {(awayProb * 100).toFixed(0)}%
                            </Text>
                            {topPick && (
                              <View style={styles.topPickPill}>
                                <Text style={styles.topPickPillText}>
                                  ★ {topPick.name}: {(topPick.probability * 100).toFixed(0)}% @{topPick.fairOdds.toFixed(2)}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>

                      {/* Right Action Column */}
                      <View style={styles.rightActionColumn}>
                        <TouchableOpacity
                          style={styles.bellBtn}
                          onPress={() => toggleFavourite(fixture.id)}
                        >
                          <Ionicons
                            name={favourites[fixture.id] ? 'notifications' : 'notifications-outline'}
                            size={18}
                            color={favourites[fixture.id] ? '#00e676' : '#64748b'}
                          />
                        </TouchableOpacity>
                        <Ionicons name="chevron-forward" size={16} color="#475569" style={{ marginTop: 8 }} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* STRONGEST & VALUE PICKS VIEW */}
      {activeBottomNav === 'picks' && (
        <ScrollView style={styles.scrollContent} contentContainerStyle={{ padding: 12, paddingBottom: 100 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Strongest Predictions (70%+)</Text>
            <Text style={styles.sectionSubtitle}>Dixon-Coles Poisson & Negative Binomial verified</Text>
          </View>

          {strongestPicks.map((pick) => {
            const inSlip = slip.some((l) => l.id === pick.id);
            return (
              <View key={pick.id} style={styles.pickCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pickMatchTitle}>{pick.matchTitle}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Text style={styles.pickMarketName}>{pick.name}</Text>
                    {pick.outcome === 'Over 7.5' && (
                      <View style={styles.over75Tag}>
                        <Text style={styles.over75TagText}>⭐ OVER 7.5 CORNERS</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.pickProbText}>
                    Win Probability: {(pick.probability * 100).toFixed(0)}%  •  Fair Odds: @{pick.fairOdds.toFixed(2)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.addSlipBtn, inSlip && styles.addSlipBtnActive]}
                  onPress={() =>
                    toggleLeg({
                      id: pick.id,
                      matchId: pick.matchId,
                      matchTitle: pick.matchTitle,
                      marketTitle: 'Strong Pick',
                      outcome: pick.outcome,
                      name: pick.name,
                      probability: pick.probability,
                      fairOdds: pick.fairOdds,
                      isEstimate: pick.isEstimate,
                    })
                  }
                >
                  <Ionicons name={inSlip ? 'checkmark' : 'add'} size={18} color={inSlip ? '#fff' : '#00e676'} />
                  <Text style={[styles.addSlipBtnText, inSlip && { color: '#fff' }]}>
                    {inSlip ? 'Added' : 'Slip'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}

          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>⚡ Value Bets (+EV against Bookmaker)</Text>
            <Text style={styles.sectionSubtitle}>Model probability exceeds bookmaker implied margin</Text>
          </View>

          {valuePicks.map((pick) => {
            const inSlip = slip.some((l) => l.id === pick.id);
            return (
              <View key={pick.id} style={styles.pickCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pickMatchTitle}>{pick.matchTitle}</Text>
                  <Text style={styles.pickMarketName}>{pick.name}</Text>
                  <Text style={styles.pickProbText}>
                    Bookmaker: @{pick.marketOdds}  •  Fair: @{pick.fairOdds}  •  Edge: +{pick.edge}%
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.addSlipBtn, inSlip && styles.addSlipBtnActive]}
                  onPress={() =>
                    toggleLeg({
                      id: pick.id,
                      matchId: pick.matchId,
                      matchTitle: pick.matchTitle,
                      marketTitle: 'Value Pick',
                      outcome: pick.outcome,
                      name: pick.name,
                      probability: pick.probability,
                      fairOdds: pick.fairOdds,
                    })
                  }
                >
                  <Ionicons name={inSlip ? 'checkmark' : 'add'} size={18} color={inSlip ? '#fff' : '#00e676'} />
                  <Text style={[styles.addSlipBtnText, inSlip && { color: '#fff' }]}>
                    {inSlip ? 'Added' : 'Slip'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* STANDINGS VIEW */}
      {activeBottomNav === 'standings' && (
        <ScrollView style={styles.scrollContent} contentContainerStyle={{ padding: 12, paddingBottom: 100 }}>
          <View style={styles.standingsLeagueSwitcher}>
            <TouchableOpacity
              style={[styles.standingsTab, standingsLeague === 'CL' && styles.standingsTabActive]}
              onPress={() => setStandingsLeague('CL')}
            >
              <Text style={[styles.standingsTabText, standingsLeague === 'CL' && styles.standingsTabTextActive]}>
                Champions League
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.standingsTab, standingsLeague === 'ELC' && styles.standingsTabActive]}
              onPress={() => setStandingsLeague('ELC')}
            >
              <Text style={[styles.standingsTabText, standingsLeague === 'ELC' && styles.standingsTabTextActive]}>
                Championship
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.standingsTab, standingsLeague === 'PL' && styles.standingsTabActive]}
              onPress={() => setStandingsLeague('PL')}
            >
              <Text style={[styles.standingsTabText, standingsLeague === 'PL' && styles.standingsTabTextActive]}>
                Premier League
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tableCard}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeadCell, { width: 30 }]}>#</Text>
              <Text style={[styles.tableHeadCell, { flex: 1 }]}>Team</Text>
              <Text style={[styles.tableHeadCell, { width: 32, textAlign: 'center' }]}>P</Text>
              <Text style={[styles.tableHeadCell, { width: 32, textAlign: 'center' }]}>GD</Text>
              <Text style={[styles.tableHeadCell, { width: 36, textAlign: 'center', color: '#00e676' }]}>PTS</Text>
              <Text style={[styles.tableHeadCell, { width: 64, textAlign: 'center' }]}>Form</Text>
            </View>

            {standingsData.map((team, idx) => (
              <View key={team.teamId} style={[styles.tableRow, idx < standingsData.length - 1 && styles.tableRowBorder]}>
                <Text style={[styles.tableCell, { width: 30, color: idx < 4 ? '#00e676' : '#94a3b8', fontWeight: 'bold' }]}>
                  {team.position}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, fontWeight: '600' }]} numberOfLines={1}>
                  {team.teamName}
                </Text>
                <Text style={[styles.tableCell, { width: 32, textAlign: 'center' }]}>{team.playedGames}</Text>
                <Text style={[styles.tableCell, { width: 32, textAlign: 'center' }]}>
                  {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                </Text>
                <Text style={[styles.tableCell, { width: 36, textAlign: 'center', color: '#00e676', fontWeight: 'bold' }]}>
                  {team.points}
                </Text>
                <View style={styles.formPillsRow}>
                  {(team.form || 'WDW').slice(-4).split('').map((char, cIdx) => (
                    <View
                      key={cIdx}
                      style={[
                        styles.formDot,
                        char === 'W' ? styles.formDotW : char === 'D' ? styles.formDotD : styles.formDotL,
                      ]}
                    >
                      <Text style={styles.formDotText}>{char}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* FAVOURITES VIEW */}
      {activeBottomNav === 'favourites' && (
        <ScrollView style={styles.scrollContent} contentContainerStyle={{ padding: 12, paddingBottom: 100 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>★ Favourited Matches & Leagues</Text>
            <Text style={styles.sectionSubtitle}>Fast access to your tracked games</Text>
          </View>

          {allFixtures.filter((f) => favourites[f.id] || favourites[f.leagueId]).length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="star-outline" size={48} color="#475569" />
              <Text style={styles.emptyTitle}>No Favourites Yet</Text>
              <Text style={styles.emptySubtitle}>Tap the star or bell icon on any match or league to pin it here.</Text>
            </View>
          ) : (
            allFixtures
              .filter((f) => favourites[f.id] || favourites[f.leagueId])
              .map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={styles.favouriteMatchCard}
                  onPress={() => setSelectedMatch(f)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.favLeagueText}>{f.leagueName}</Text>
                    <Text style={styles.favMatchTeams}>{f.homeTeam.name} vs {f.awayTeam.name}</Text>
                    <Text style={styles.favTimeText}>{f.status === 'LIVE' ? `LIVE • ${f.minute}` : new Date(f.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#64748b" />
                </TouchableOpacity>
              ))
          )}
        </ScrollView>
      )}

      {/* FLOATING ACCUMULATOR SLIP PILL (Visible when slip has items) */}
      {slip.length > 0 && (
        <TouchableOpacity
          style={styles.floatingSlipBar}
          activeOpacity={0.85}
          onPress={() => setIsSlipOpen(true)}
        >
          <View style={styles.floatingSlipLeft}>
            <View style={styles.slipCountCircle}>
              <Text style={styles.slipCountText}>{slip.length}</Text>
            </View>
            <Text style={styles.floatingSlipLabel}>Betslip Accumulated</Text>
          </View>
          <View style={styles.floatingSlipRight}>
            <Text style={styles.floatingSlipOdds}>@{combinedOdds}</Text>
            <Ionicons name="chevron-up" size={18} color="#000" style={{ marginLeft: 4 }} />
          </View>
        </TouchableOpacity>
      )}

      {/* SOFASCORE BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveBottomNav('football')}
        >
          <Ionicons
            name="football"
            size={22}
            color={activeBottomNav === 'football' ? '#00e676' : '#64748b'}
          />
          <Text style={[styles.navItemText, activeBottomNav === 'football' && styles.navItemTextActive]}>
            Football
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveBottomNav('favourites')}
        >
          <Ionicons
            name="star"
            size={22}
            color={activeBottomNav === 'favourites' ? '#00e676' : '#64748b'}
          />
          <Text style={[styles.navItemText, activeBottomNav === 'favourites' && styles.navItemTextActive]}>
            Favourites
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveBottomNav('picks')}
        >
          <Ionicons
            name="flame"
            size={22}
            color={activeBottomNav === 'picks' ? '#00e676' : '#64748b'}
          />
          <Text style={[styles.navItemText, activeBottomNav === 'picks' && styles.navItemTextActive]}>
            Edge Picks
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveBottomNav('standings')}
        >
          <Ionicons
            name="trophy"
            size={22}
            color={activeBottomNav === 'standings' ? '#00e676' : '#64748b'}
          />
          <Text style={[styles.navItemText, activeBottomNav === 'standings' && styles.navItemTextActive]}>
            Standings
          </Text>
        </TouchableOpacity>
      </View>

      {/* MATCH DETAIL & MARKETS MODAL (Sofascore + Dixon-Coles Engine) */}
      <Modal visible={!!selectedMatch} animationType="slide" transparent>
        {selectedMatch && currentPrediction && (
          <View style={styles.modalBackdrop}>
            <SafeAreaView style={styles.modalContainer}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setSelectedMatch(null)} style={styles.closeModalBtn}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.modalLeagueTitle}>{selectedMatch.leagueName}</Text>
                  <Text style={styles.modalRoundSubtitle}>{selectedMatch.round || 'League Match'}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleFavourite(selectedMatch.id)}
                  style={styles.closeModalBtn}
                >
                  <Ionicons
                    name={favourites[selectedMatch.id] ? 'star' : 'star-outline'}
                    size={22}
                    color={favourites[selectedMatch.id] ? '#ffb300' : '#fff'}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} contentContainerStyle={{ paddingBottom: 60 }}>
                {/* Scoreboard Card */}
                <View style={styles.scoreboardCard}>
                  {selectedMatch.status === 'LIVE' ? (
                    <View style={styles.liveBadgeRow}>
                      <View style={styles.livePulseDot} />
                      <Text style={styles.liveScoreboardMinute}>{selectedMatch.minute || "68'"} LIVE IN-PLAY</Text>
                    </View>
                  ) : (
                    <Text style={styles.matchStatusScheduled}>
                      {new Date(selectedMatch.utcDate).toLocaleString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  )}

                  <View style={styles.scoreboardTeamsRow}>
                    <View style={styles.scoreboardTeam}>
                      <View style={styles.bigTeamLogoCircle}>
                        <Text style={styles.bigTeamLogoText}>{selectedMatch.homeTeam.name.slice(0, 3).toUpperCase()}</Text>
                      </View>
                      <Text style={styles.bigTeamNameText} numberOfLines={2}>{selectedMatch.homeTeam.name}</Text>
                    </View>

                    <View style={styles.scoreCenter}>
                      {selectedMatch.status === 'LIVE' && selectedMatch.score?.fullTime?.home != null ? (
                        <Text style={styles.bigScoreDigits}>
                          {selectedMatch.score.fullTime.home} - {selectedMatch.score.fullTime.away}
                        </Text>
                      ) : (
                        <Text style={styles.bigScoreVs}>VS</Text>
                      )}
                      <Text style={styles.confidenceText}>Confidence: {currentPrediction.confidence}</Text>
                    </View>

                    <View style={styles.scoreboardTeam}>
                      <View style={[styles.bigTeamLogoCircle, { borderColor: '#38bdf8' }]}>
                        <Text style={[styles.bigTeamLogoText, { color: '#38bdf8' }]}>
                          {selectedMatch.awayTeam.name.slice(0, 3).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.bigTeamNameText} numberOfLines={2}>{selectedMatch.awayTeam.name}</Text>
                    </View>
                  </View>

                  {/* Sofascore In-Play Match Stats Bar (if live) */}
                  {selectedMatch.status === 'LIVE' && selectedMatch.liveStats && (
                    <View style={styles.liveStatsContainer}>
                      <Text style={styles.liveStatsTitle}>⚡ IN-PLAY MATCH STATISTICS</Text>

                      {/* Possession Bar */}
                      <View style={styles.statRow}>
                        <Text style={styles.statNum}>{selectedMatch.liveStats.possession?.[0] || 55}%</Text>
                        <Text style={styles.statLabel}>Ball Possession</Text>
                        <Text style={styles.statNum}>{selectedMatch.liveStats.possession?.[1] || 45}%</Text>
                      </View>
                      <View style={styles.statBarTrack}>
                        <View style={[styles.statBarFillHome, { flex: selectedMatch.liveStats.possession?.[0] || 55 }]} />
                        <View style={[styles.statBarFillAway, { flex: selectedMatch.liveStats.possession?.[1] || 45 }]} />
                      </View>

                      {/* Shots on Target */}
                      <View style={[styles.statRow, { marginTop: 10 }]}>
                        <Text style={styles.statNum}>{selectedMatch.liveStats.shotsOnTarget?.[0] || 5}</Text>
                        <Text style={styles.statLabel}>Shots on Target</Text>
                        <Text style={styles.statNum}>{selectedMatch.liveStats.shotsOnTarget?.[1] || 3}</Text>
                      </View>

                      {/* Corners */}
                      <View style={[styles.statRow, { marginTop: 6 }]}>
                        <Text style={styles.statNum}>{selectedMatch.liveStats.corners?.[0] || 6}</Text>
                        <Text style={styles.statLabel}>Corners</Text>
                        <Text style={styles.statNum}>{selectedMatch.liveStats.corners?.[1] || 3}</Text>
                      </View>

                      {/* Yellow Cards */}
                      <View style={[styles.statRow, { marginTop: 6 }]}>
                        <Text style={styles.statNum}>{selectedMatch.liveStats.yellowCards?.[0] || 1}</Text>
                        <Text style={styles.statLabel}>Yellow Cards</Text>
                        <Text style={styles.statNum}>{selectedMatch.liveStats.yellowCards?.[1] || 2}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Matchday Edge AI Analysis Box */}
                <View style={styles.analysisCard}>
                  <View style={styles.analysisHeader}>
                    <Ionicons name="analytics" size={18} color="#00e676" style={{ marginRight: 6 }} />
                    <Text style={styles.analysisTitle}>Dixon-Coles Poisson Engine Analysis</Text>
                  </View>

                  <View style={styles.metricsGrid}>
                    <View style={styles.metricBox}>
                      <Text style={styles.metricVal}>
                        {currentPrediction.analysis.expectedGoalsHome.toFixed(2)} - {currentPrediction.analysis.expectedGoalsAway.toFixed(2)}
                      </Text>
                      <Text style={styles.metricLbl}>Expected Goals (xG)</Text>
                    </View>
                    <View style={styles.metricBox}>
                      <Text style={styles.metricVal}>
                        {currentPrediction.analysis.expectedCornersHome.toFixed(1)} - {currentPrediction.analysis.expectedCornersAway.toFixed(1)}
                      </Text>
                      <Text style={styles.metricLbl}>Expected Corners</Text>
                    </View>
                    <View style={styles.metricBox}>
                      <Text style={styles.metricVal}>
                        {currentPrediction.analysis.mostLikelyScore.home} - {currentPrediction.analysis.mostLikelyScore.away}
                      </Text>
                      <Text style={styles.metricLbl}>Most Likely Score</Text>
                    </View>
                  </View>

                  <Text style={styles.summaryText}>{currentPrediction.analysis.summaryText}</Text>
                </View>

                {/* SPORTYBET-STYLE MARKETS TABULATION */}
                <View style={styles.marketsContainer}>
                  <Text style={styles.marketsHeaderTitle}>SportyBet-Style Betting Markets</Text>

                  {/* Market Sub-tabs */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.marketPillsScroll}>
                    {['all', 'result', 'goals', 'corners', 'cards', 'btts', 'handicap', 'scores'].map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.marketCategoryPill, detailMarketCategory === cat && styles.marketCategoryPillActive]}
                        onPress={() => setDetailMarketCategory(cat)}
                      >
                        <Text style={[styles.marketCategoryText, detailMarketCategory === cat && styles.marketCategoryTextActive]}>
                          {cat === 'all' ? 'All Markets' : cat.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Over 7.5 Corners Spotlight Card */}
                  {(detailMarketCategory === 'all' || detailMarketCategory === 'corners') && (
                    <View style={styles.spotlightCard}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.spotlightBadge}>FEATURED MARKET</Text>
                          <Text style={styles.spotlightProb}>
                            {((currentPrediction.markets.cornersTotal.selections.find((s) => s.outcome === 'Over 7.5')?.probability || 0.82) * 100).toFixed(0)}%
                          </Text>
                        </View>
                        <Text style={styles.spotlightTitle}>Corners Total: Over 7.5</Text>
                        <Text style={styles.spotlightSubtitle}>Negative Binomial Overdispersed Model ($r=20$)</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.spotlightAddBtn}
                        onPress={() => {
                          const s = currentPrediction.markets.cornersTotal.selections.find((sel) => sel.outcome === 'Over 7.5');
                          if (s) {
                            toggleLeg({
                              id: `${selectedMatch.id}_corner_7.5`,
                              matchId: selectedMatch.id,
                              matchTitle: `${selectedMatch.homeTeam.name} vs ${selectedMatch.awayTeam.name}`,
                              marketTitle: 'Total Corners',
                              outcome: 'Over 7.5',
                              name: 'Over 7.5 Corners',
                              probability: s.probability,
                              fairOdds: s.fairOdds,
                              isEstimate: true,
                            });
                          }
                        }}
                      >
                        <Text style={styles.spotlightAddBtnText}>
                          + Add @{(currentPrediction.markets.cornersTotal.selections.find((s) => s.outcome === 'Over 7.5')?.fairOdds || 1.22).toFixed(2)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Render Market Sections */}
                  {renderMarketSection(
                    '1X2 Full Time Result',
                    currentPrediction.markets.result1X2.selections,
                    selectedMatch,
                    toggleLeg,
                    slip,
                    detailMarketCategory,
                    ['all', 'result']
                  )}

                  {renderMarketSection(
                    'Total Goals Over / Under',
                    currentPrediction.markets.totalGoals.selections,
                    selectedMatch,
                    toggleLeg,
                    slip,
                    detailMarketCategory,
                    ['all', 'goals']
                  )}

                  {renderMarketSection(
                    'Total Corners (Over / Under)',
                    currentPrediction.markets.cornersTotal.selections,
                    selectedMatch,
                    toggleLeg,
                    slip,
                    detailMarketCategory,
                    ['all', 'corners']
                  )}

                  {renderMarketSection(
                    'Total Cards (Over / Under)',
                    currentPrediction.markets.cardsTotal.selections,
                    selectedMatch,
                    toggleLeg,
                    slip,
                    detailMarketCategory,
                    ['all', 'cards']
                  )}

                  {renderMarketSection(
                    'Both Teams To Score (BTTS)',
                    currentPrediction.markets.btts.selections,
                    selectedMatch,
                    toggleLeg,
                    slip,
                    detailMarketCategory,
                    ['all', 'btts']
                  )}

                  {renderMarketSection(
                    'Double Chance & Draw No Bet',
                    [...currentPrediction.markets.doubleChance.selections, ...currentPrediction.markets.drawNoBet.selections],
                    selectedMatch,
                    toggleLeg,
                    slip,
                    detailMarketCategory,
                    ['all', 'result']
                  )}

                  {renderMarketSection(
                    'Asian & European Handicaps',
                    [...currentPrediction.markets.handicapAsian.selections, ...currentPrediction.markets.handicapEuropean.selections],
                    selectedMatch,
                    toggleLeg,
                    slip,
                    detailMarketCategory,
                    ['all', 'handicap']
                  )}

                  {renderMarketSection(
                    'Top 5 Correct Scores',
                    currentPrediction.markets.correctScores.selections,
                    selectedMatch,
                    toggleLeg,
                    slip,
                    detailMarketCategory,
                    ['all', 'scores']
                  )}
                </View>
              </ScrollView>
            </SafeAreaView>
          </View>
        )}
      </Modal>

      {/* ACCUMULATOR SLIP MODAL */}
      <Modal visible={isSlipOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsSlipOpen(false)} style={styles.closeModalBtn}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Accumulator Slip ({slip.length})</Text>
              <TouchableOpacity onPress={() => setSlip([])} style={styles.clearSlipBtn}>
                <Text style={styles.clearSlipBtnText}>Clear</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} contentContainerStyle={{ padding: 16 }}>
              {slip.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="receipt-outline" size={48} color="#475569" />
                  <Text style={styles.emptyTitle}>Your Slip is Empty</Text>
                  <Text style={styles.emptySubtitle}>Tap on any selection or pick to add it to your accumulator.</Text>
                </View>
              ) : (
                <>
                  {slip.map((leg) => (
                    <View key={leg.id} style={styles.slipLegCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.slipLegMatch}>{leg.matchTitle}</Text>
                        <Text style={styles.slipLegName}>{leg.name}</Text>
                        <Text style={styles.slipLegMeta}>
                          Prob: {(leg.probability * 100).toFixed(0)}%  •  Fair Odds: @{leg.fairOdds.toFixed(2)}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => toggleLeg(leg)} style={styles.removeLegBtn}>
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Summary Card */}
                  <View style={styles.slipSummaryCard}>
                    <View style={styles.slipSummaryRow}>
                      <Text style={styles.slipSummaryLbl}>Selections Count:</Text>
                      <Text style={styles.slipSummaryVal}>{slip.length} legs</Text>
                    </View>
                    <View style={styles.slipSummaryRow}>
                      <Text style={styles.slipSummaryLbl}>Combined Probability:</Text>
                      <Text style={styles.slipSummaryVal}>{(combinedProb * 100).toFixed(2)}%</Text>
                    </View>
                    <View style={styles.slipSummaryRow}>
                      <Text style={styles.slipSummaryLbl}>Combined Fair Odds:</Text>
                      <Text style={[styles.slipSummaryVal, { color: '#00e676', fontSize: 20 }]}>@{combinedOdds}</Text>
                    </View>

                    <View style={styles.disclaimerBox}>
                      <Ionicons name="alert-circle-outline" size={18} color="#f59e0b" style={{ marginRight: 6 }} />
                      <Text style={styles.disclaimerText}>
                        Accumulator bets multiply risk. Probabilities are mathematical estimates, not guarantees. 18+ only.
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      {/* CUSTOM MATCH SIMULATOR MODAL */}
      <Modal visible={isCustomModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsCustomModalOpen(false)} style={styles.closeModalBtn}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Custom Match Predictor</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.modalScroll} contentContainerStyle={{ padding: 16 }}>
              <Text style={styles.customSectionSubtitle}>
                Simulate any custom match with Dixon-Coles Poisson & calculate fair odds.
              </Text>

              <Text style={styles.inputLabel}>Home Team</Text>
              <TextInput style={styles.customInput} value={customHome} onChangeText={setCustomHome} />

              <Text style={styles.inputLabel}>Away Team</Text>
              <TextInput style={styles.customInput} value={customAway} onChangeText={setCustomAway} />

              <Text style={styles.inputLabel}>Bookmaker Odds (1 / X / 2)</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput style={[styles.customInput, { flex: 1 }]} value={customOdds1} onChangeText={setCustomOdds1} placeholder="1" keyboardType="numeric" />
                <TextInput style={[styles.customInput, { flex: 1 }]} value={customOddsX} onChangeText={setCustomOddsX} placeholder="X" keyboardType="numeric" />
                <TextInput style={[styles.customInput, { flex: 1 }]} value={customOdds2} onChangeText={setCustomOdds2} placeholder="2" keyboardType="numeric" />
              </View>

              <TouchableOpacity style={styles.simulateBtn} onPress={handleSimulateCustom}>
                <Text style={styles.simulateBtnText}>Run Poisson Prediction Engine</Text>
              </TouchableOpacity>

              {customResult && (
                <View style={[styles.scoreboardCard, { marginTop: 20 }]}>
                  <Text style={styles.sectionTitle}>Calculated Outcome</Text>
                  <Text style={styles.metricVal}>
                    xG: {customResult.analysis.expectedGoalsHome.toFixed(2)} - {customResult.analysis.expectedGoalsAway.toFixed(2)}
                  </Text>
                  <Text style={styles.summaryText}>{customResult.analysis.summaryText}</Text>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Helper function to render market tables
function renderMarketSection(
  title: string,
  selections: MarketSelection[],
  fixture: MatchFixture,
  toggleLeg: (leg: AccumulatorLeg) => void,
  slip: AccumulatorLeg[],
  activeCategory: string,
  allowedCategories: string[]
) {
  if (!allowedCategories.includes(activeCategory)) return null;
  if (!selections || selections.length === 0) return null;

  return (
    <View style={styles.marketSection}>
      <Text style={styles.marketSectionTitle}>{title}</Text>
      <View style={styles.marketGrid}>
        {selections.map((sel) => {
          const legId = `${fixture.id}_${sel.outcome}`;
          const isSelected = slip.some((l) => l.id === legId);
          const isOver75 = sel.outcome === 'Over 7.5' && title.includes('Corners');

          return (
            <TouchableOpacity
              key={sel.outcome}
              style={[
                styles.marketCell,
                isSelected && styles.marketCellSelected,
                isOver75 && styles.marketCellOver75,
              ]}
              onPress={() =>
                toggleLeg({
                  id: legId,
                  matchId: fixture.id,
                  matchTitle: `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`,
                  marketTitle: title,
                  outcome: sel.outcome,
                  name: `${sel.outcome} (${title})`,
                  probability: sel.probability,
                  fairOdds: sel.fairOdds,
                  isEstimate: sel.isEstimate,
                })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.marketOutcomeName, isSelected && { color: '#00e676' }]}>
                  {sel.outcome}
                </Text>
                <Text style={styles.marketProbSubtext}>
                  {(sel.probability * 100).toFixed(0)}%
                </Text>
              </View>
              <Text style={[styles.marketOddsText, isSelected && { color: '#00e676' }]}>
                @{sel.fairOdds.toFixed(2)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e121a', // Sofascore ultra-dark blue/gray
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#151b26',
    borderBottomWidth: 1,
    borderBottomColor: '#1e2638',
  },
  logoBtn: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2738',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    paddingVertical: 0,
  },
  topRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    gap: 12,
  },
  headerIconBtn: {
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },

  // Controls Bar
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#151b26',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a364f',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterBtnActive: {
    borderColor: '#00e676',
    backgroundColor: '#00e67615',
  },
  filterBtnText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  liveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ef4444',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 8,
  },
  liveBtnActive: {
    backgroundColor: '#ef4444',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
    marginRight: 6,
  },
  liveDotActive: {
    backgroundColor: '#fff',
  },
  liveBtnText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: 'bold',
  },
  liveBtnTextActive: {
    color: '#fff',
  },
  dateNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a364f',
    borderRadius: 18,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  dateArrow: {
    padding: 2,
  },
  dateDisplay: {
    paddingHorizontal: 8,
  },
  dateDisplayText: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: 'bold',
  },

  // Date Chips Bar
  dateChipsBar: {
    backgroundColor: '#151b26',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2638',
  },
  dateChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginRight: 6,
    backgroundColor: '#1e2738',
  },
  dateChipActive: {
    backgroundColor: '#00e676',
  },
  dateChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  dateChipTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },

  // Scroll Content
  scrollContent: {
    flex: 1,
    backgroundColor: '#0b0f17',
  },

  // Sofascore League Card
  leagueCard: {
    backgroundColor: '#151b26',
    marginHorizontal: 8,
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e2638',
  },
  leagueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#18202e',
    borderBottomWidth: 1,
    borderBottomColor: '#1e2638',
  },
  leagueInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leagueIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00e67620',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  leagueName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  leagueCountry: {
    color: '#8a99ad',
    fontSize: 11,
    marginTop: 1,
  },
  leagueStarBtn: {
    padding: 4,
  },

  // Match Row
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  matchRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#1c2434',
  },
  timeColumn: {
    width: 60,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  liveTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveMinuteText: {
    color: '#00e676',
    fontSize: 13,
    fontWeight: 'bold',
  },
  livePulsingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#00e676',
    marginLeft: 4,
  },
  matchTimeText: {
    color: '#8a99ad',
    fontSize: 12,
    fontWeight: '600',
  },
  timeSubtext: {
    color: '#475569',
    fontSize: 10,
    marginTop: 2,
  },
  teamsColumn: {
    flex: 1,
    paddingRight: 8,
  },
  teamLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  teamNameWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00e676',
    marginRight: 8,
  },
  teamNameText: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '600',
  },
  liveScoreText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Edge Prob Bar
  edgeProbContainer: {
    marginTop: 6,
    paddingTop: 4,
  },
  edgeProbBar: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
  },
  probFillHome: {
    backgroundColor: '#00e676',
  },
  probFillDraw: {
    backgroundColor: '#f59e0b',
  },
  probFillAway: {
    backgroundColor: '#38bdf8',
  },
  edgeProbLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  edgeProbText: {
    color: '#8a99ad',
    fontSize: 10,
    fontWeight: '500',
  },
  topPickPill: {
    backgroundColor: '#00e67618',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  topPickPillText: {
    color: '#00e676',
    fontSize: 10,
    fontWeight: 'bold',
  },

  rightActionColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  bellBtn: {
    padding: 4,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },

  // Bottom Navigation
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#151b26',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1e2638',
    paddingBottom: 6,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemText: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 3,
    fontWeight: '500',
  },
  navItemTextActive: {
    color: '#00e676',
    fontWeight: 'bold',
  },

  // Floating Slip Bar
  floatingSlipBar: {
    position: 'absolute',
    bottom: 74,
    left: 14,
    right: 14,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00e676',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingSlipLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slipCountCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  slipCountText: {
    color: '#00e676',
    fontSize: 12,
    fontWeight: 'bold',
  },
  floatingSlipLabel: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  floatingSlipRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  floatingSlipOdds: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
  },

  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0e131d',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2638',
  },
  closeModalBtn: {
    padding: 6,
  },
  modalLeagueTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalRoundSubtitle: {
    color: '#8a99ad',
    fontSize: 11,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearSlipBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  clearSlipBtnText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
  modalScroll: {
    flex: 1,
  },

  // Scoreboard Card
  scoreboardCard: {
    backgroundColor: '#151b26',
    margin: 12,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e2638',
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#00e676',
    marginRight: 6,
  },
  liveScoreboardMinute: {
    color: '#00e676',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  matchStatusScheduled: {
    color: '#8a99ad',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  scoreboardTeamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreboardTeam: {
    flex: 1,
    alignItems: 'center',
  },
  bigTeamLogoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#00e676',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    marginBottom: 8,
  },
  bigTeamLogoText: {
    color: '#00e676',
    fontSize: 15,
    fontWeight: 'bold',
  },
  bigTeamNameText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scoreCenter: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  bigScoreDigits: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  bigScoreVs: {
    color: '#64748b',
    fontSize: 20,
    fontWeight: 'bold',
  },
  confidenceText: {
    color: '#00e676',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },

  // Live Stats
  liveStatsContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e2638',
  },
  liveStatsTitle: {
    color: '#8a99ad',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statNum: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    width: 36,
    textAlign: 'center',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  statBarTrack: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1e293b',
    marginTop: 4,
    overflow: 'hidden',
  },
  statBarFillHome: {
    backgroundColor: '#00e676',
  },
  statBarFillAway: {
    backgroundColor: '#38bdf8',
  },

  // Analysis Card
  analysisCard: {
    backgroundColor: '#151b26',
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e2638',
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  analysisTitle: {
    color: '#00e676',
    fontSize: 13,
    fontWeight: 'bold',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#1e2738',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  metricVal: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  metricLbl: {
    color: '#8a99ad',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  summaryText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },

  // Markets Tabulation
  marketsContainer: {
    paddingHorizontal: 12,
  },
  marketsHeaderTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  marketPillsScroll: {
    marginBottom: 12,
  },
  marketCategoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1e2738',
    marginRight: 8,
  },
  marketCategoryPillActive: {
    backgroundColor: '#00e676',
  },
  marketCategoryText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  marketCategoryTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },

  // Spotlight Card for Over 7.5 Corners
  spotlightCard: {
    backgroundColor: '#00e67615',
    borderWidth: 1.5,
    borderColor: '#00e676',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  spotlightBadge: {
    color: '#000',
    backgroundColor: '#00e676',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  spotlightProb: {
    color: '#00e676',
    fontSize: 12,
    fontWeight: 'bold',
  },
  spotlightTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 4,
  },
  spotlightSubtitle: {
    color: '#8a99ad',
    fontSize: 11,
    marginTop: 2,
  },
  spotlightAddBtn: {
    backgroundColor: '#00e676',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  spotlightAddBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: 'bold',
  },

  // Market Section
  marketSection: {
    marginBottom: 16,
  },
  marketSectionTitle: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  marketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  marketCell: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#151b26',
    borderWidth: 1,
    borderColor: '#1e2638',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marketCellSelected: {
    borderColor: '#00e676',
    backgroundColor: '#00e67618',
  },
  marketCellOver75: {
    borderColor: '#00e676',
  },
  marketOutcomeName: {
    color: '#f1f5f9',
    fontSize: 13,
    fontWeight: '600',
  },
  marketProbSubtext: {
    color: '#8a99ad',
    fontSize: 11,
    marginTop: 2,
  },
  marketOddsText: {
    color: '#00e676',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Picks Tab
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    color: '#8a99ad',
    fontSize: 12,
    marginTop: 2,
  },
  pickCard: {
    backgroundColor: '#151b26',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e2638',
  },
  pickMatchTitle: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pickMarketName: {
    color: '#00e676',
    fontSize: 13,
    fontWeight: '600',
  },
  over75Tag: {
    backgroundColor: '#00e67620',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  over75TagText: {
    color: '#00e676',
    fontSize: 9,
    fontWeight: 'bold',
  },
  pickProbText: {
    color: '#8a99ad',
    fontSize: 11,
    marginTop: 4,
  },
  addSlipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00e676',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 10,
  },
  addSlipBtnActive: {
    backgroundColor: '#00e676',
  },
  addSlipBtnText: {
    color: '#00e676',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },

  // Standings Tab
  standingsLeagueSwitcher: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  standingsTab: {
    flex: 1,
    backgroundColor: '#151b26',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e2638',
  },
  standingsTabActive: {
    borderColor: '#00e676',
    backgroundColor: '#00e67615',
  },
  standingsTabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  standingsTabTextActive: {
    color: '#00e676',
    fontWeight: 'bold',
  },
  tableCard: {
    backgroundColor: '#151b26',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e2638',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#18202e',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2638',
  },
  tableHeadCell: {
    color: '#8a99ad',
    fontSize: 11,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#1c2434',
  },
  tableCell: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  formPillsRow: {
    width: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 3,
  },
  formDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formDotW: {
    backgroundColor: '#00e676',
  },
  formDotD: {
    backgroundColor: '#f59e0b',
  },
  formDotL: {
    backgroundColor: '#ef4444',
  },
  formDotText: {
    color: '#000',
    fontSize: 8,
    fontWeight: 'bold',
  },

  // Favourites Tab
  favouriteMatchCard: {
    backgroundColor: '#151b26',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e2638',
  },
  favLeagueText: {
    color: '#8a99ad',
    fontSize: 11,
    fontWeight: '600',
  },
  favMatchTeams: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  favTimeText: {
    color: '#00e676',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },

  // Slip Modal Details
  slipLegCard: {
    backgroundColor: '#151b26',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e2638',
  },
  slipLegMatch: {
    color: '#f1f5f9',
    fontSize: 13,
    fontWeight: 'bold',
  },
  slipLegName: {
    color: '#00e676',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  slipLegMeta: {
    color: '#8a99ad',
    fontSize: 11,
    marginTop: 2,
  },
  removeLegBtn: {
    padding: 6,
  },
  slipSummaryCard: {
    backgroundColor: '#151b26',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#1e2638',
  },
  slipSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slipSummaryLbl: {
    color: '#94a3b8',
    fontSize: 13,
  },
  slipSummaryVal: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b15',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  disclaimerText: {
    color: '#f59e0b',
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },

  // Custom Simulator
  customSectionSubtitle: {
    color: '#8a99ad',
    fontSize: 12,
    marginBottom: 16,
  },
  inputLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  customInput: {
    backgroundColor: '#151b26',
    borderWidth: 1,
    borderColor: '#1e2638',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
  },
  simulateBtn: {
    backgroundColor: '#00e676',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  simulateBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
