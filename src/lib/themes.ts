export interface SeasonalTheme {
  id: string;
  name: string;
  colors: {
    navy: string;
    navyLight: string;
    navyDark: string;
    gold: string;
    goldLight: string;
    goldDark: string;
    goldPale: string;
    cream: string;
    creamDark: string;
    accent?: string;
  };
  splashBg: string;
  overlay: "snow" | "stars" | "hearts" | "none";
  emoji: string;
}

const themes: Record<string, SeasonalTheme> = {
  default: {
    id: "default",
    name: "عادي",
    colors: {
      navy: "#1a2744",
      navyLight: "#243356",
      navyDark: "#111b30",
      gold: "#c9a84c",
      goldLight: "#e0c56e",
      goldDark: "#a88a2e",
      goldPale: "#f5ecd0",
      cream: "#faf6eb",
      creamDark: "#f0e8d4",
    },
    splashBg: "#1a2744",
    overlay: "none",
    emoji: "☦",
  },
  christmas: {
    id: "christmas",
    name: "الكريسماس",
    colors: {
      navy: "#1a2e1a",
      navyLight: "#2d4a2d",
      navyDark: "#0f1f0f",
      gold: "#d4a017",
      goldLight: "#ffd700",
      goldDark: "#b8860b",
      goldPale: "#fff8dc",
      cream: "#fefefa",
      creamDark: "#f0edd4",
      accent: "#c41e3a",
    },
    splashBg: "#0f1f0f",
    overlay: "snow",
    emoji: "🎄",
  },
  easter: {
    id: "easter",
    name: "القيامة",
    colors: {
      navy: "#2a1a44",
      navyLight: "#3d2b5e",
      navyDark: "#1a1030",
      gold: "#d4a017",
      goldLight: "#ffd700",
      goldDark: "#b8860b",
      goldPale: "#f8f0ff",
      cream: "#fdf8ff",
      creamDark: "#f0e8f8",
      accent: "#e8b931",
    },
    splashBg: "#1a1030",
    overlay: "stars",
    emoji: "✝️",
  },
  lent: {
    id: "lent",
    name: "الصوم الكبير",
    colors: {
      navy: "#2c1810",
      navyLight: "#3d2820",
      navyDark: "#1a0e08",
      gold: "#8b7355",
      goldLight: "#a89070",
      goldDark: "#6b5540",
      goldPale: "#f0e8dc",
      cream: "#f8f4ee",
      creamDark: "#e8e0d0",
    },
    splashBg: "#1a0e08",
    overlay: "none",
    emoji: "🕊️",
  },
};

interface DateRange {
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  themeId: string;
}

const seasonalDates: DateRange[] = [
  // Christmas: Dec 20 - Jan 20 (covers both Western & Coptic)
  { startMonth: 12, startDay: 20, endMonth: 1, endDay: 20, themeId: "christmas" },
  // Easter / Holy Week: approximate moveable dates (can be adjusted)
  // Lent: roughly Feb 25 - April 10 (Coptic Great Lent varies)
];

function isInRange(now: Date, range: DateRange): boolean {
  const m = now.getMonth() + 1;
  const d = now.getDate();

  if (range.startMonth <= range.endMonth) {
    return (
      (m > range.startMonth || (m === range.startMonth && d >= range.startDay)) &&
      (m < range.endMonth || (m === range.endMonth && d <= range.endDay))
    );
  }
  // Wraps around year (e.g., Dec → Jan)
  return (
    m > range.startMonth ||
    (m === range.startMonth && d >= range.startDay) ||
    m < range.endMonth ||
    (m === range.endMonth && d <= range.endDay)
  );
}

export function getActiveTheme(): SeasonalTheme {
  const now = new Date();
  for (const range of seasonalDates) {
    if (isInRange(now, range)) {
      return themes[range.themeId] || themes.default;
    }
  }
  return themes.default;
}

export function getThemeById(id: string): SeasonalTheme {
  return themes[id] || themes.default;
}

export function getAllThemes(): SeasonalTheme[] {
  return Object.values(themes);
}
