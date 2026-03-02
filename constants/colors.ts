const PRIMARY = "#C0392B";
const PRIMARY_DARK = "#96281B";
const PRIMARY_LIGHT = "#E74C3C";

const ACCENT = "#F39C12";
const ACCENT_LIGHT = "#F7DC6F";

const BG_CREAM = "#F7EDD8";
const BG_CARD = "#FFFDF7";
const BG_INPUT = "#F0E8D5";

const TEXT_PRIMARY = "#2C1810";
const TEXT_SECONDARY = "#7D6147";
const TEXT_LIGHT = "#B08A6E";

const BORDER = "#E0CDB0";
const BORDER_LIGHT = "#EDE3CC";

const SUCCESS = "#27AE60";
const WARNING = "#F39C12";
const DANGER = "#C0392B";
const INFO = "#2980B9";

export const Colors = {
  primary: PRIMARY,
  primaryDark: PRIMARY_DARK,
  primaryLight: PRIMARY_LIGHT,
  accent: ACCENT,
  accentLight: ACCENT_LIGHT,
  bgCream: BG_CREAM,
  bgCard: BG_CARD,
  bgInput: BG_INPUT,
  textPrimary: TEXT_PRIMARY,
  textSecondary: TEXT_SECONDARY,
  textLight: TEXT_LIGHT,
  border: BORDER,
  borderLight: BORDER_LIGHT,
  success: SUCCESS,
  warning: WARNING,
  danger: DANGER,
  info: INFO,
  white: "#FFFFFF",
  categories: {
    Academic: "#2980B9",
    Events: "#27AE60",
    Emergency: "#C0392B",
    General: "#8E44AD",
  } as Record<string, string>,
};

export default {
  light: {
    text: TEXT_PRIMARY,
    background: BG_CREAM,
    tint: PRIMARY,
    tabIconDefault: TEXT_LIGHT,
    tabIconSelected: PRIMARY,
  },
};
