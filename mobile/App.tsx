import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SUPPORTED_LEAGUES } from './src/config/leagues';
import { MobileDataProvider } from './src/services/mock.provider';
import { PredictionEngine } from './src/engine/prediction-engine';
import { MatchFixture, MatchPrediction, MarketSelection, AccumulatorLeg } from './src/types';

const { width } = Dimensions.get('window');

export default function App() {
  const [selectedLeague, setSelectedLeague] = useState('PL');
  const [selectedDate, setSelectedDate] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'matches' | 'strongest' | 'value'>('matches');

  // Accumulator Slip State
  const [slip, setSlip] = useState<AccumulatorLeg[]>([]);
  const [isSlipOpen, setIsSlipOpen] = useState(false);

  // Custom Match Modal
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customHome, setCustomHome] = useState('Arsenal');
  const [customAway, setCustomAway] = useState('Chelsea');
  const [customOdds1, setCustomOdds1] = useState('1.95');
  const [customOddsX, setCustomOddsX] = useState('3.50');
  const [customOdds2, setCustomOdds2] = useState('3.90');
  const [customResult, setCustomResult] = useState<MatchPrediction | null>(null);

  // Expanded Match IDs
  const [expandedMatches, setExpandedMatches] = useState<Record<string, boolean>>({});

  // Fetch fixtures for the active league
  const fixtures = useMemo(() => {
    return MobileDataProvider.getFixtures(selectedLeague, 7);
  }, [selectedLeague]);

  // Pre-computed predictions for fixtures
  const predictionsMap = useMemo(() => {
    const map: Record<string, MatchPrediction> = {};
    fixtures.forEach((f) => {
      const hStats = MobileDataProvider.getTeamRecentMatches(f.homeTeam.id, 10);
      const aStats = MobileDataProvider.getTeamRecentMatches(f.awayTeam.id, 10);
      map[f.id] = PredictionEngine.predict(f, hStats, aStats);
    });
    return map;
  }, [fixtures]);

  // Filtered fixtures
  const filteredFixtures = useMemo(() => {
    return fixtures.filter((f) => {
      if (selectedDate !== 'ALL' && f.utcDate.split('T')[0] !== selectedDate) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!f.homeTeam.name.toLowerCase().includes(q) && !f.awayTeam.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [fixtures, selectedDate, searchQuery]);

  // Strongest picks across the current league
  const strongestPicks = useMemo(() => {
    const list: any[] = [];
    fixtures.forEach((f) => {
      const pred = predictionsMap[f.id];
      if (!pred) return;
      const candidates = [
        ...pred.markets.doubleChance.selections,
        ...pred.markets.totalGoals.selections.filter((s) => s.outcome === 'Over 1.5' || s.outcome === 'Under 3.5'),
        ...pred.markets.cornersTotal.selections.filter((s) => s.outcome === 'Over 7.5'),
        ...pred.markets.result1X2.selections,
      ];
      candidates.forEach((c) => {
        if (c.probability >= 0.65) {
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
  }, [fixtures, predictionsMap]);

  // Value picks
  const valuePicks = useMemo(() => {
    const list: any[] = [];
    fixtures.forEach((f) => {
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
  }, [fixtures, predictionsMap]);

  // Accumulator calculations
  const combinedProb = slip.length > 0 ? slip.reduce((acc, l) => acc * l.probability, 1.0) : 1.0;
  const combinedOdds = combinedProb > 0.001 ? (1 / combinedProb).toFixed(2) : '999.00';

  const toggleLeg = (leg: AccumulatorLeg) => {
    setSlip((prev) => {
      if (prev.some((l) => l.id === leg.id)) {
        return prev.filter((l) => l.id !== leg.id);
      }
      return [...prev, leg];
    });
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

  const dateChips = useMemo(() => {
    const list = [{ key: 'ALL', label: 'All Dates' }];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString([], { weekday: 'short' });
      list.push({ key, label });
    }
    return list;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>ME</Text>
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.brandTitle}>MATCHDAY EDGE</Text>
              <View style={styles.proTag}>
                <Text style={styles.proTagText}>SDK 58</Text>
              </View>
            </View>
            <Text style={styles.brandSubtitle}>Accra GMT+0 • Dixon-Coles Poisson</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setIsCustomModalOpen(true)}
          >
            <MaterialCommunityIcons name="tune-vertical" size={20} color="#00e676" />
          </TouchableOpacity>

          {slip.length > 0 && (
            <TouchableOpacity
              style={styles.slipPill}
              onPress={() => setIsSlipOpen(true)}
            >
              <Ionicons name="receipt-outline" size={16} color="#000" />
              <Text style={styles.slipPillCount}>{slip.length}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Navigation View Tabs */}
      <View style={styles.viewTabs}>
        <TouchableOpacity
          style={[styles.viewTab, activeTab === 'matches' && styles.viewTabActive]}
          onPress={() => setActiveTab('matches')}
        >
          <Text style={[styles.viewTabText, activeTab === 'matches' && styles.viewTabTextActive]}>
            Matches
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewTab, activeTab === 'strongest' && styles.viewTabActive]}
          onPress={() => setActiveTab('strongest')}
        >
          <Text style={[styles.viewTabText, activeTab === 'strongest' && styles.viewTabTextActive]}>
            ★ Strongest ({strongestPicks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewTab, activeTab === 'value' && styles.viewTabActive]}
          onPress={() => setActiveTab('value')}
        >
          <Text style={[styles.viewTabText, activeTab === 'value' && styles.viewTabTextActive]}>
            ⚡ Value Picks ({valuePicks.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* League Tabs */}
      <View style={styles.leagueScrollContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
          {SUPPORTED_LEAGUES.map((l) => (
            <TouchableOpacity
              key={l.id}
              style={[styles.leagueChip, selectedLeague === l.id && styles.leagueChipActive]}
              onPress={() => setSelectedLeague(l.id)}
            >
              <Text style={[styles.leagueChipText, selectedLeague === l.id && styles.leagueChipTextActive]}>
                {l.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {activeTab === 'matches' && (
        <>
          {/* Date Chips */}
          <View style={styles.dateScrollContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
              {dateChips.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.dateChip, selectedDate === c.key && styles.dateChipActive]}
                  onPress={() => setSelectedDate(c.key)}
                >
                  <Text style={[styles.dateChipText, selectedDate === c.key && styles.dateChipTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={16} color="#6b7280" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search team or fixture..."
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </>
      )}

      {/* Main Content Area */}
      <ScrollView style={styles.mainScroll} contentContainerStyle={{ paddingBottom: 100 }}>
        {activeTab === 'matches' && (
          filteredFixtures.map((f) => {
            const pred = predictionsMap[f.id];
            const isExpanded = !!expandedMatches[f.id];

            const p1 = pred ? pred.markets.result1X2.selections.find((s) => s.outcome === '1')?.probability || 0.45 : 0.45;
            const pX = pred ? pred.markets.result1X2.selections.find((s) => s.outcome === 'X')?.probability || 0.28 : 0.28;
            const p2 = pred ? pred.markets.result1X2.selections.find((s) => s.outcome === '2')?.probability || 0.27 : 0.27;

            return (
              <View key={f.id} style={styles.card}>
                {/* Match Meta */}
                <View style={styles.cardMetaRow}>
                  <Text style={styles.cardMetaText}>{f.round} • {new Date(f.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} GMT</Text>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceBadgeText}>{pred?.confidence || 'High'} Confidence</Text>
                  </View>
                </View>

                {/* Teams Row */}
                <View style={styles.teamsRow}>
                  <Text style={styles.teamNameHome}>{f.homeTeam.name}</Text>
                  <View style={styles.vsBadge}>
                    <Text style={styles.vsText}>VS</Text>
                  </View>
                  <Text style={styles.teamNameAway}>{f.awayTeam.name}</Text>
                </View>

                {/* 1X2 Prob Bar */}
                <View style={styles.probBarContainer}>
                  <View style={styles.probBarLabelRow}>
                    <Text style={{ color: '#00e676', fontSize: 11, fontWeight: '700' }}>1: {(p1 * 100).toFixed(0)}%</Text>
                    <Text style={{ color: '#fbbf24', fontSize: 11, fontWeight: '700' }}>X: {(pX * 100).toFixed(0)}%</Text>
                    <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: '700' }}>2: {(p2 * 100).toFixed(0)}%</Text>
                  </View>
                  <View style={styles.probBar}>
                    <View style={[styles.probBarSegment, { width: `${p1 * 100}%`, backgroundColor: '#00e676' }]} />
                    <View style={[styles.probBarSegment, { width: `${pX * 100}%`, backgroundColor: '#fbbf24' }]} />
                    <View style={[styles.probBarSegment, { width: `${p2 * 100}%`, backgroundColor: '#38bdf8' }]} />
                  </View>
                </View>

                {/* Top Picks Row */}
                {pred && pred.topPicks && (
                  <View style={styles.topPicksRow}>
                    {pred.topPicks.map((pick) => {
                      const legId = `${f.id}_top_${pick.outcome}`;
                      const inSlip = slip.some((l) => l.id === legId);
                      return (
                        <TouchableOpacity
                          key={pick.outcome}
                          style={[styles.pickChip, inSlip && styles.pickChipActive]}
                          onPress={() =>
                            toggleLeg({
                              id: legId,
                              matchId: f.id,
                              matchTitle: `${f.homeTeam.name} vs ${f.awayTeam.name}`,
                              marketTitle: 'Top Model Pick',
                              outcome: pick.outcome,
                              name: pick.name,
                              probability: pick.probability,
                              fairOdds: pick.fairOdds,
                            })
                          }
                        >
                          <Text style={[styles.pickChipText, inSlip && styles.pickChipTextActive]}>
                            {pick.name} {(pick.probability * 100).toFixed(0)}% @{pick.fairOdds.toFixed(2)}
                          </Text>
                          <Ionicons name={inSlip ? 'checkmark' : 'add'} size={12} color={inSlip ? '#000' : '#00e676'} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Expand Button */}
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => setExpandedMatches((p) => ({ ...p, [f.id]: !p[f.id] }))}
                >
                  <Text style={styles.expandButtonText}>
                    {isExpanded ? 'Hide All Markets' : 'Expand All Markets (Corners, Cards, Goals)'}
                  </Text>
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} color="#9ca3af" />
                </TouchableOpacity>

                {/* Expanded Markets Drawer */}
                {isExpanded && pred && (
                  <View style={styles.expandedDrawer}>
                    {/* Summary Analysis */}
                    <View style={styles.analysisBox}>
                      <Text style={styles.analysisTitle}>xG: {pred.analysis.expectedGoalsHome} - {pred.analysis.expectedGoalsAway} • Most Likely: {pred.analysis.mostLikelyScore.home}-{pred.analysis.mostLikelyScore.away}</Text>
                      <Text style={styles.analysisText}>{pred.analysis.summaryText}</Text>
                    </View>

                    {/* Featured Over 7.5 Corners */}
                    <View style={styles.featuredCornerBox}>
                      <Text style={styles.featuredCornerTitle}>🚩 Corners Over 7.5 (Featured Market)</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>
                          Prob: {(pred.markets.cornersTotal.selections.find((s) => s.outcome === 'Over 7.5')?.probability || 0.72 * 100).toFixed(1)}%
                        </Text>
                        <TouchableOpacity
                          style={styles.addSlipMiniBtn}
                          onPress={() => {
                            const cSel = pred.markets.cornersTotal.selections.find((s) => s.outcome === 'Over 7.5')!;
                            toggleLeg({
                              id: `${f.id}_corners_O75`,
                              matchId: f.id,
                              matchTitle: `${f.homeTeam.name} vs ${f.awayTeam.name}`,
                              marketTitle: 'Corners Over/Under',
                              outcome: 'Over 7.5',
                              name: 'Corners Over 7.5',
                              probability: cSel.probability,
                              fairOdds: cSel.fairOdds,
                              isEstimate: true,
                            });
                          }}
                        >
                          <Text style={styles.addSlipMiniText}>Add @{pred.markets.cornersTotal.selections.find((s) => s.outcome === 'Over 7.5')?.fairOdds.toFixed(2)}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Other Key Markets */}
                    <Text style={styles.marketGroupHeader}>Goals & BTTS Markets</Text>
                    {pred.markets.totalGoals.selections.slice(2, 6).map((sel) => (
                      <View key={sel.outcome} style={styles.marketRow}>
                        <Text style={{ color: '#e5e7eb', fontSize: 12, fontWeight: '600' }}>{sel.name}</Text>
                        <Text style={{ color: '#00e676', fontSize: 12, fontFamily: 'monospace', fontWeight: '700' }}>
                          {(sel.probability * 100).toFixed(1)}% (@{sel.fairOdds.toFixed(2)})
                        </Text>
                      </View>
                    ))}

                    <Text style={styles.marketGroupHeader}>Booking Cards (NegBinomial)</Text>
                    {pred.markets.cardsTotal.selections.slice(2, 4).map((sel) => (
                      <View key={sel.outcome} style={styles.marketRow}>
                        <Text style={{ color: '#e5e7eb', fontSize: 12, fontWeight: '600' }}>{sel.name}</Text>
                        <Text style={{ color: '#fbbf24', fontSize: 12, fontFamily: 'monospace', fontWeight: '700' }}>
                          {(sel.probability * 100).toFixed(1)}% (@{sel.fairOdds.toFixed(2)})
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* View: Strongest Picks */}
        {activeTab === 'strongest' && (
          <View style={{ paddingHorizontal: 12 }}>
            <Text style={styles.sectionHeader}>Top Recommended Picks ({selectedLeague})</Text>
            {strongestPicks.map((pick, i) => (
              <View key={pick.id} style={styles.pickCard}>
                <View>
                  <Text style={{ color: '#9ca3af', fontSize: 11 }}>#{i + 1} {pick.matchTitle}</Text>
                  <Text style={{ color: '#00e676', fontSize: 14, fontWeight: '700', marginTop: 2 }}>{pick.name}</Text>
                  <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'monospace', marginTop: 2 }}>
                    Prob: {(pick.probability * 100).toFixed(1)}% • Fair: @{pick.fairOdds.toFixed(2)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.addSlipBtn}
                  onPress={() => toggleLeg(pick)}
                >
                  <Text style={styles.addSlipBtnText}>{slip.some((l) => l.id === pick.id) ? 'In Slip' : '+ Slip'}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* View: Value Picks */}
        {activeTab === 'value' && (
          <View style={{ paddingHorizontal: 12 }}>
            <Text style={styles.sectionHeader}>Positive Expected Value (+EV Bets)</Text>
            {valuePicks.map((pick) => (
              <View key={pick.id} style={[styles.pickCard, { borderColor: '#fbbf24' }]}>
                <View>
                  <Text style={{ color: '#9ca3af', fontSize: 11 }}>{pick.matchTitle}</Text>
                  <Text style={{ color: '#fbbf24', fontSize: 14, fontWeight: '700', marginTop: 2 }}>{pick.name}</Text>
                  <Text style={{ color: '#00e676', fontSize: 12, fontFamily: 'monospace', marginTop: 2 }}>
                    +{pick.edge}% Edge • Model: {(pick.probability * 100).toFixed(0)}% • Bookie: @{pick.marketOdds}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.addSlipBtn, { backgroundColor: '#fbbf24' }]}
                  onPress={() => toggleLeg(pick)}
                >
                  <Text style={[styles.addSlipBtnText, { color: '#000' }]}>{slip.some((l) => l.id === pick.id) ? 'In Slip' : '+ Value'}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Responsible Disclaimer */}
        <View style={styles.footerDisclaimer}>
          <Text style={styles.footerDisclaimerTitle}>18+ ONLY • STATISTICAL PROBABILITIES</Text>
          <Text style={styles.footerDisclaimerText}>
            Predictions are calculated mathematical distributions (Dixon-Coles & NegBinomial), not guaranteed outcomes. Bet responsibly.
          </Text>
        </View>
      </ScrollView>

      {/* Floating Accumulator Bottom Slip */}
      {slip.length > 0 && (
        <View style={styles.floatingSlipBar}>
          <View>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
              Accumulator: {slip.length} Legs
            </Text>
            <Text style={{ color: '#00e676', fontSize: 13, fontFamily: 'monospace', fontWeight: '800' }}>
              {(combinedProb * 100).toFixed(1)}% Win Chance • @{combinedOdds} Odds
            </Text>
          </View>
          <TouchableOpacity
            style={styles.openSlipButton}
            onPress={() => setIsSlipOpen(true)}
          >
            <Text style={{ color: '#000', fontWeight: '800', fontSize: 12 }}>VIEW SLIP</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Slip Details Modal */}
      <Modal visible={isSlipOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Accumulator Slip ({slip.length} Legs)</Text>
              <TouchableOpacity onPress={() => setIsSlipOpen(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Risk Warning */}
            <View style={styles.riskWarningBox}>
              <Text style={styles.riskWarningText}>
                ⚠️ Multi-Bet Risk Warning: Independent selections multiply probabilities. 3 legs at 70% each = only 34.3% combined win probability.
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 250, marginVertical: 12 }}>
              {slip.map((leg) => (
                <View key={leg.id} style={styles.slipLegRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#9ca3af', fontSize: 10 }}>{leg.matchTitle}</Text>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{leg.name}</Text>
                  </View>
                  <Text style={{ color: '#00e676', fontFamily: 'monospace', fontSize: 12, fontWeight: '700', marginRight: 12 }}>
                    @{leg.fairOdds.toFixed(2)}
                  </Text>
                  <TouchableOpacity onPress={() => toggleLeg(leg)}>
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={styles.slipTotalRow}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Combined Fair Odds:</Text>
              <Text style={{ color: '#00e676', fontWeight: '900', fontSize: 18, fontFamily: 'monospace' }}>@{combinedOdds}</Text>
            </View>

            <TouchableOpacity style={styles.clearSlipBtn} onPress={() => setSlip([])}>
              <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 12 }}>Clear Entire Slip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Match Modal */}
      <Modal visible={isCustomModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Custom Match Simulator</Text>
              <TouchableOpacity onPress={() => setIsCustomModalOpen(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Enter any two teams and SportyBet odds to simulate:</Text>
            <View style={styles.customInputRow}>
              <TextInput style={styles.customTextInput} value={customHome} onChangeText={setCustomHome} placeholder="Home Team" placeholderTextColor="#6b7280" />
              <Text style={{ color: '#6b7280', marginHorizontal: 8 }}>vs</Text>
              <TextInput style={styles.customTextInput} value={customAway} onChangeText={setCustomAway} placeholder="Away Team" placeholderTextColor="#6b7280" />
            </View>

            <View style={styles.customOddsRow}>
              <TextInput style={styles.oddsInput} value={customOdds1} onChangeText={setCustomOdds1} keyboardType="numeric" placeholder="1 Odds" placeholderTextColor="#6b7280" />
              <TextInput style={styles.oddsInput} value={customOddsX} onChangeText={setCustomOddsX} keyboardType="numeric" placeholder="X Odds" placeholderTextColor="#6b7280" />
              <TextInput style={styles.oddsInput} value={customOdds2} onChangeText={setCustomOdds2} keyboardType="numeric" placeholder="2 Odds" placeholderTextColor="#6b7280" />
            </View>

            <TouchableOpacity style={styles.simulateBtn} onPress={handleSimulateCustom}>
              <Text style={styles.simulateBtnText}>Simulate All Markets</Text>
            </TouchableOpacity>

            {customResult && (
              <View style={styles.simulatedResultBox}>
                <Text style={{ color: '#00e676', fontWeight: '700', fontSize: 13 }}>
                  Expected: {customResult.analysis.expectedGoalsHome} - {customResult.analysis.expectedGoalsAway} Goals
                </Text>
                <Text style={{ color: '#fff', fontSize: 12, marginTop: 4 }}>
                  Most Likely Score: {customResult.analysis.mostLikelyScore.home}-{customResult.analysis.mostLikelyScore.away} ({(customResult.analysis.mostLikelyScore.probability * 100).toFixed(1)}%)
                </Text>
                <Text style={{ color: '#fbbf24', fontSize: 12, marginTop: 2 }}>
                  Corners: Over 7.5 ({(customResult.markets.cornersTotal.selections.find((s) => s.outcome === 'Over 7.5')?.probability || 0.7 * 100).toFixed(0)}%)
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#00e676',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
  },
  brandTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    color: '#9ca3af',
    fontSize: 10,
  },
  proTag: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  proTagText: {
    color: '#00e676',
    fontSize: 9,
    fontWeight: '700',
  },
  iconButton: {
    padding: 6,
    backgroundColor: '#111827',
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  slipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00e676',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },
  slipPillCount: {
    color: '#000',
    fontWeight: '900',
    fontSize: 11,
    marginLeft: 4,
  },
  viewTabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
  },
  viewTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    backgroundColor: '#111827',
  },
  viewTabActive: {
    backgroundColor: '#00e676',
  },
  viewTabText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '700',
  },
  viewTabTextActive: {
    color: '#000',
  },
  leagueScrollContainer: {
    paddingVertical: 6,
  },
  leagueChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#111827',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  leagueChipActive: {
    borderColor: '#00e676',
    backgroundColor: '#1f2937',
  },
  leagueChipText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
  },
  leagueChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  dateScrollContainer: {
    paddingVertical: 4,
  },
  dateChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#111827',
    marginRight: 6,
  },
  dateChipActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderWidth: 1,
    borderColor: '#00e676',
  },
  dateChipText: {
    color: '#9ca3af',
    fontSize: 10,
  },
  dateChipTextActive: {
    color: '#00e676',
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    marginHorizontal: 12,
    marginVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
    height: 36,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 12,
  },
  mainScroll: {
    flex: 1,
    marginTop: 6,
  },
  card: {
    backgroundColor: '#111827',
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardMetaText: {
    color: '#9ca3af',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  confidenceBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  confidenceBadgeText: {
    color: '#00e676',
    fontSize: 9,
    fontWeight: '700',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  teamNameHome: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  teamNameAway: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
    textAlign: 'right',
  },
  vsBadge: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vsText: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '800',
  },
  probBarContainer: {
    marginTop: 8,
  },
  probBarLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  probBar: {
    height: 6,
    backgroundColor: '#1f2937',
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  probBarSegment: {
    height: 6,
  },
  topPicksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6,
  },
  pickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#374151',
  },
  pickChipActive: {
    backgroundColor: '#00e676',
    borderColor: '#00e676',
  },
  pickChipText: {
    color: '#e5e7eb',
    fontSize: 10,
    fontWeight: '600',
    marginRight: 4,
  },
  pickChipTextActive: {
    color: '#000',
  },
  expandButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  expandButtonText: {
    color: '#9ca3af',
    fontSize: 11,
    marginRight: 4,
  },
  expandedDrawer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  analysisBox: {
    backgroundColor: '#0a0f1d',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  analysisTitle: {
    color: '#00e676',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  analysisText: {
    color: '#d1d5db',
    fontSize: 10,
    lineHeight: 14,
  },
  featuredCornerBox: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderWidth: 1,
    borderColor: '#00e676',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  featuredCornerTitle: {
    color: '#00e676',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  addSlipMiniBtn: {
    backgroundColor: '#00e676',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addSlipMiniText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 10,
  },
  marketGroupHeader: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '700',
    marginVertical: 4,
  },
  marketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  sectionHeader: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  pickCard: {
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  addSlipBtn: {
    backgroundColor: '#00e676',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addSlipBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 11,
  },
  footerDisclaimer: {
    padding: 16,
    alignItems: 'center',
  },
  footerDisclaimerTitle: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '800',
  },
  footerDisclaimerText: {
    color: '#6b7280',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 4,
  },
  floatingSlipBar: {
    position: 'absolute',
    bottom: 20,
    left: 12,
    right: 12,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#00e676',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  openSlipButton: {
    backgroundColor: '#00e676',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: '#9ca3af',
    fontSize: 11,
    marginBottom: 8,
  },
  riskWarningBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 8,
    padding: 8,
  },
  riskWarningText: {
    color: '#fbbf24',
    fontSize: 10,
    lineHeight: 14,
  },
  slipLegRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  slipTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  clearSlipBtn: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 6,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customTextInput: {
    flex: 1,
    backgroundColor: '#0a0f1d',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 8,
    padding: 8,
    color: '#fff',
    fontSize: 12,
  },
  customOddsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  oddsInput: {
    flex: 1,
    backgroundColor: '#0a0f1d',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 8,
    padding: 8,
    color: '#00e676',
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  simulateBtn: {
    backgroundColor: '#00e676',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  simulateBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 12,
  },
  simulatedResultBox: {
    backgroundColor: '#0a0f1d',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
});
