// ============================================================================
// MindMesh Production Design Tokens & Presentation Mapping Layer
// ============================================================================

export const TOKENS = {
  colors: {
    brand: "#1F5D46",
    brandHover: "#184A38",
    brandTint: "#E7F1EC",
    ink: "#17201C",
    textSecondary: "#55605A",
    textTertiary: "#7C867F",
    border: "#E3E7E4",
    surface: "#FFFFFF",
    canvas: "#F6F7F5",
    subtleFill: "#EEF1EE",
    critical: "#B42318",
    criticalBg: "#FDECEA",
    warning: "#A15C07",
    warningBg: "#FEF3E2",
    success: "#1F7A4D",
    successBg: "#E6F4EC",
    info: "#1D5FA8",
    infoBg: "#E8F0FA",
    neutralChip: "#66706B",
    neutralChipBg: "#F0F2F0",
  },
  radius: {
    sm: "6px",
    md: "10px",
    full: "9999px",
  },
  typography: {
    fontSans: "'Inter Tight', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontMono: "'JetBrains Mono', monospace",
  },
} as const;

export type UrgencyTier = "High" | "Medium" | "Low";

export interface UrgencyInfo {
  tier: UrgencyTier;
  countdown: string;
  badgeVariant: "critical" | "warning" | "info";
  minutesLeft: number;
}

/**
 * Calculates human-readable urgency tier & countdown from expiry time.
 * Never exposes raw mathematical weights or formulas to the user.
 */
export function calculateUrgency(expiryTime: string | Date): UrgencyInfo {
  const expiryDate = new Date(expiryTime);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  const minutesLeft = Math.max(0, Math.round(diffMs / (60 * 1000)));

  if (minutesLeft <= 0) {
    return {
      tier: "High",
      countdown: "Expired",
      badgeVariant: "critical",
      minutesLeft: 0,
    };
  }

  let countdownText = "";
  if (minutesLeft < 60) {
    countdownText = `Expires in ${minutesLeft} min`;
  } else {
    const hours = Math.floor(minutesLeft / 60);
    const mins = minutesLeft % 60;
    countdownText = mins > 0 ? `Expires in ${hours}h ${mins}m` : `Expires in ${hours}h`;
  }

  if (minutesLeft <= 60) {
    return {
      tier: "High",
      countdown: countdownText,
      badgeVariant: "critical",
      minutesLeft,
    };
  } else if (minutesLeft <= 180) {
    return {
      tier: "Medium",
      countdown: countdownText,
      badgeVariant: "warning",
      minutesLeft,
    };
  } else {
    return {
      tier: "Low",
      countdown: countdownText,
      badgeVariant: "info",
      minutesLeft,
    };
  }
}

/**
 * Formats weights and numbers in tabular layout
 */
export function formatWeight(kg: number): string {
  return `${kg.toFixed(1)} kg`;
}

export function formatPortions(quantity: number): string {
  return `${quantity.toLocaleString()} portions`;
}

export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
