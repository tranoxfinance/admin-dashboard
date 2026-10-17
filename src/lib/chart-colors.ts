export const CHART_COLORS = {
  blue: "#0d8fd2",
  navy: "#00407a",
  sky: "#5ba2ca",
  green: "#95c015",
  gold: "#e9a028",
  sand: "#f5cd6d",
  lime: "#c4e06a",
  coral: "#f08a5d",
  danger: "#d64545",
  muted: "#8a9bb0",
};

export const CATEGORICAL_LIGHT = [
  CHART_COLORS.blue,
  CHART_COLORS.green,
  CHART_COLORS.gold,
];
export const CATEGORICAL_DARK = ["#8fcbfd", "#a6d12a", "#f0b54a"];

export const KYC_TIER_RAMP = ["#8fcbfd", CHART_COLORS.blue, CHART_COLORS.navy];

export const ACTIVITY_CATEGORICAL = [
  CHART_COLORS.blue,
  CHART_COLORS.green,
  CHART_COLORS.gold,
  CHART_COLORS.danger,
  CHART_COLORS.navy,
  CHART_COLORS.muted,
];

export const WARM_RAMP = [CHART_COLORS.sand, CHART_COLORS.gold, CHART_COLORS.danger];
export const WARM_CATEGORICAL = [
  CHART_COLORS.danger,
  CHART_COLORS.gold,
  CHART_COLORS.sand,
  CHART_COLORS.coral,
];

export const STATUS_COLORS: Record<string, string> = {
  completed: CHART_COLORS.green,
  inProgress: CHART_COLORS.sky,
  held: CHART_COLORS.gold,
  failed: CHART_COLORS.danger,
  reversed: CHART_COLORS.coral,
};

export const RISK_LEVEL_COLORS: Record<"low" | "medium" | "high", string> = {
  low: CHART_COLORS.green,
  medium: CHART_COLORS.gold,
  high: CHART_COLORS.danger,
};

export const CHART_CHROME = {
  light: {
    gridline: "#e2e9f2",
    baseline: "#cbd6e4",
    mutedInk: "#6b7d92",
  },
  dark: {
    gridline: "#1b2c45",
    baseline: "#29405f",
    mutedInk: "#7e91a8",
  },
};
