import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAutoDetectedTimezone } from '../utils/timezone.js';

export type SupportedLanguage = 'en' | 'fr' | 'es' | 'pt' | 'ar';
export type OddsFormat = 'decimal' | 'fractional' | 'american';

export interface Translations {
  matches: string;
  live: string;
  favourites: string;
  today: string;
  tomorrow: string;
  yesterday: string;
  allDates: string;
  predictions: string;
  summary: string;
  lineups: string;
  stats: string;
  h2h: string;
  standings: string;
  fairOdds: string;
  liveProbability: string;
  searchPlaceholder: string;
  addToSlip: string;
  slip: string;
  clearSlip: string;
  combinedOdds: string;
  combinedProb: string;
  accumulatorWarning: string;
  highRiskWarning: string;
  responsibleGambling: string;
  responsibleGamblingDisclaimer: string;
  settings: string;
  language: string;
  oddsFormat: string;
  timezone: string;
  theme: string;
  dark: string;
  light: string;
  howItWorks: string;
  highConfidence: string;
  mediumConfidence: string;
  lowConfidence: string;
}

const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    matches: 'Matches',
    live: 'Live',
    favourites: 'Favourites',
    today: 'Today',
    tomorrow: 'Tomorrow',
    yesterday: 'Yesterday',
    allDates: 'All Dates',
    predictions: 'Predictions',
    summary: 'Summary',
    lineups: 'Lineups',
    stats: 'Stats',
    h2h: 'H2H',
    standings: 'Standings',
    fairOdds: 'Fair Odds',
    liveProbability: 'Live probability',
    searchPlaceholder: 'Search team or match...',
    addToSlip: 'Add to Slip',
    slip: 'Slip',
    clearSlip: 'Clear',
    combinedOdds: 'Combined Odds',
    combinedProb: 'Combined Prob',
    accumulatorWarning: 'Accumulators multiply risk. Keep stakes small.',
    highRiskWarning: 'High Risk: Accumulators with more than 3 legs have significantly lower probability.',
    responsibleGambling: 'Responsible Gambling',
    responsibleGamblingDisclaimer: '18+ Only. Betting involves risk of financial loss. Predictions are mathematical estimations, not guarantees.',
    settings: 'Settings',
    language: 'Language',
    oddsFormat: 'Odds Format',
    timezone: 'Timezone',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    howItWorks: 'How predictions work',
    highConfidence: 'High Confidence',
    mediumConfidence: 'Medium Confidence',
    lowConfidence: 'Low Confidence',
  },
  fr: {
    matches: 'Matchs',
    live: 'En direct',
    favourites: 'Favoris',
    today: "Aujourd'hui",
    tomorrow: 'Demain',
    yesterday: 'Hier',
    allDates: 'Toutes dates',
    predictions: 'Pronostics',
    summary: 'Résumé',
    lineups: 'Compositions',
    stats: 'Stats',
    h2h: 'Confrontations',
    standings: 'Classement',
    fairOdds: 'Cotes Équitables',
    liveProbability: 'Probabilité en direct',
    searchPlaceholder: 'Chercher une équipe...',
    addToSlip: 'Ajouter au ticket',
    slip: 'Ticket',
    clearSlip: 'Effacer',
    combinedOdds: 'Cote Totale',
    combinedProb: 'Prob. Combinée',
    accumulatorWarning: 'Les combinés multiplient le risque. Misez raisonnablement.',
    highRiskWarning: 'Risque élevé : plus de 3 sélections réduit drastiquement la probabilité.',
    responsibleGambling: 'Jeu Responsable',
    responsibleGamblingDisclaimer: 'Réservé aux plus de 18 ans. Les paris comportent des risques. Jouez modérément.',
    settings: 'Paramètres',
    language: 'Langue',
    oddsFormat: 'Format des cotes',
    timezone: 'Fuseau horaire',
    theme: 'Thème',
    dark: 'Sombre',
    light: 'Clair',
    howItWorks: 'Méthodologie',
    highConfidence: 'Confiance Élevée',
    mediumConfidence: 'Confiance Moyenne',
    lowConfidence: 'Confiance Faible',
  },
  es: {
    matches: 'Partidos',
    live: 'En vivo',
    favourites: 'Favoritos',
    today: 'Hoy',
    tomorrow: 'Mañana',
    yesterday: 'Ayer',
    allDates: 'Todas las fechas',
    predictions: 'Pronósticos',
    summary: 'Resumen',
    lineups: 'Alineaciones',
    stats: 'Estadísticas',
    h2h: 'H2H',
    standings: 'Clasificación',
    fairOdds: 'Cuota Justa',
    liveProbability: 'Probabilidad en vivo',
    searchPlaceholder: 'Buscar equipo o partido...',
    addToSlip: 'Añadir al cupón',
    slip: 'Cupón',
    clearSlip: 'Vaciar',
    combinedOdds: 'Cuota Total',
    combinedProb: 'Prob. Combinada',
    accumulatorWarning: 'Las combinadas multiplican el riesgo. Apueste con moderación.',
    highRiskWarning: 'Alto riesgo: Más de 3 selecciones reduce drásticamente las probabilidades.',
    responsibleGambling: 'Juego Responsable',
    responsibleGamblingDisclaimer: '+18 Solamente. El juego conlleva riesgos. Las predicciones son estimaciones estadísticas.',
    settings: 'Configuración',
    language: 'Idioma',
    oddsFormat: 'Formato de cuotas',
    timezone: 'Zona horaria',
    theme: 'Tema',
    dark: 'Oscuro',
    light: 'Claro',
    howItWorks: 'Cómo funciona',
    highConfidence: 'Confianza Alta',
    mediumConfidence: 'Confianza Media',
    lowConfidence: 'Confianza Baja',
  },
  pt: {
    matches: 'Jogos',
    live: 'Ao vivo',
    favourites: 'Favoritos',
    today: 'Hoje',
    tomorrow: 'Amanhã',
    yesterday: 'Ontem',
    allDates: 'Todas as datas',
    predictions: 'Previsões',
    summary: 'Resumo',
    lineups: 'Escalações',
    stats: 'Estatísticas',
    h2h: 'Confrontos',
    standings: 'Classificação',
    fairOdds: 'Odds Justas',
    liveProbability: 'Probabilidade ao vivo',
    searchPlaceholder: 'Pesquisar equipe...',
    addToSlip: 'Adicionar ao boletim',
    slip: 'Boletim',
    clearSlip: 'Limpar',
    combinedOdds: 'Odds Totais',
    combinedProb: 'Prob. Combinada',
    accumulatorWarning: 'Múltiplas multiplicam o risco. Jogue com moderação.',
    highRiskWarning: 'Risco alto: mais de 3 seleções reduzem significativamente a probabilidade.',
    responsibleGambling: 'Jogo Responsável',
    responsibleGamblingDisclaimer: '+18 apenas. Apostas envolvem risco de perda financeira.',
    settings: 'Configurações',
    language: 'Idioma',
    oddsFormat: 'Formato de odds',
    timezone: 'Fuso horário',
    theme: 'Tema',
    dark: 'Escuro',
    light: 'Claro',
    howItWorks: 'Como funciona',
    highConfidence: 'Confiança Alta',
    mediumConfidence: 'Confiança Média',
    lowConfidence: 'Confiança Baixa',
  },
  ar: {
    matches: 'المباريات',
    live: 'مباشر',
    favourites: 'المفضلة',
    today: 'اليوم',
    tomorrow: 'غداً',
    yesterday: 'أمس',
    allDates: 'كل التواريخ',
    predictions: 'التوقعات',
    summary: 'ملخص',
    lineups: 'التشكيل',
    stats: 'الإحصائيات',
    h2h: 'المواجهات',
    standings: 'الترتيب',
    fairOdds: 'الاحتمال العادل',
    liveProbability: 'احتمال مباشر',
    searchPlaceholder: 'ابحث عن فريق أو مباراة...',
    addToSlip: 'إضافة للقسيمة',
    slip: 'القسيمة',
    clearSlip: 'مسح',
    combinedOdds: 'إجمالي الاحتمال',
    combinedProb: 'النسبة المجمعة',
    accumulatorWarning: 'المباريات المجمعة تضاعف المخاطرة. راهن بمسؤولية.',
    highRiskWarning: 'مخاطرة عالية: اختيار أكثر من 3 مباريات يقلل نسبة النجاح بشكل كبير.',
    responsibleGambling: 'المقامرة المسؤولة',
    responsibleGamblingDisclaimer: '18+ فقط. الرهان ينطوي على مخاطر مالية. التوقعات هي تقديرات رياضية وليست مضمونة.',
    settings: 'الإعدادات',
    language: 'اللغة',
    oddsFormat: 'صيغة الاحتمالات',
    timezone: 'المنطقة الزمنية',
    theme: 'المظهر',
    dark: 'داكن',
    light: 'فاتح',
    howItWorks: 'كيف نعمل',
    highConfidence: 'ثقة عالية',
    mediumConfidence: 'ثقة متوسطة',
    lowConfidence: 'ثقة منخفضة',
  },
};

export function formatOdds(decimalOdds: number, format: OddsFormat): string {
  if (isNaN(decimalOdds) || decimalOdds <= 1.0) return '1.01';
  if (format === 'decimal') return decimalOdds.toFixed(2);
  if (format === 'american') {
    if (decimalOdds >= 2.0) {
      return `+${Math.round((decimalOdds - 1) * 100)}`;
    } else {
      return `${Math.round(-100 / (decimalOdds - 1))}`;
    }
  }
  // Fractional
  const prob = decimalOdds - 1;
  const commonFractions: [number, number][] = [
    [1, 10], [1, 5], [1, 4], [1, 3], [2, 5], [1, 2], [3, 5], [2, 3], [3, 4], [4, 5],
    [1, 1], [6, 5], [5, 4], [11, 8], [6, 4], [13, 8], [7, 4], [2, 1], [9, 4], [5, 2],
    [3, 1], [7, 2], [4, 1], [9, 2], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1]
  ];
  for (const [num, den] of commonFractions) {
    if (Math.abs(prob - num / den) < 0.05) {
      return `${num}/${den}`;
    }
  }
  return `${Math.round(prob * 10)}/10`;
}

interface SettingsContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  timezone: string;
  setTimezone: (tz: string) => void;
  oddsFormat: OddsFormat;
  setOddsFormat: (fmt: OddsFormat) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  t: Translations;
  displayOdds: (decimalOdds: number) => string;
  favourites: Set<string | number>;
  toggleFavourite: (id: string | number) => void;
  isFavourite: (id: string | number) => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('edge_lang') as SupportedLanguage) || 'en';
  });

  const [timezone, setTimezone] = useState<string>(() => {
    return localStorage.getItem('edge_tz') || getAutoDetectedTimezone();
  });

  const [oddsFormat, setOddsFormat] = useState<OddsFormat>(() => {
    return (localStorage.getItem('edge_odds_format') as OddsFormat) || 'decimal';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('edge_dark_mode');
    return saved !== null ? saved === 'true' : true;
  });

  const [favourites, setFavourites] = useState<Set<string | number>>(() => {
    try {
      const saved = localStorage.getItem('edge_favourites');
      return saved ? new Set(JSON.parse(saved)) : new Set(['ucl_today_3']);
    } catch {
      return new Set();
    }
  });

  // Handle RTL for Arabic
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('edge_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('edge_tz', timezone);
  }, [timezone]);

  useEffect(() => {
    localStorage.setItem('edge_odds_format', oddsFormat);
  }, [oddsFormat]);

  useEffect(() => {
    localStorage.setItem('edge_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleFavourite = (id: string | number) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem('edge_favourites', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const isFavourite = (id: string | number) => favourites.has(id);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const displayOdds = (decimalOdds: number) => formatOdds(decimalOdds, oddsFormat);

  return (
    <SettingsContext.Provider
      value={{
        language,
        setLanguage,
        timezone,
        setTimezone,
        oddsFormat,
        setOddsFormat,
        darkMode,
        setDarkMode,
        t,
        displayOdds,
        favourites,
        toggleFavourite,
        isFavourite,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
