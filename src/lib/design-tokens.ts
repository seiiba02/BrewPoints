/**
 * BrewPoints / BrewFlow Shared Design System Tokens
 * Direction: Official BrewFlow Specialty Coffee Platform UI
 * Shared across Next.js 16 Web and React 19 + Capacitor (iOS & Android) Mobile clients.
 */

export const BREWPOINTS_TOKENS = {
  direction: {
    id: 'brewflow-official',
    name: 'BrewFlow Coffee Platform Design System',
    mode: 'operate',
  },
  palette: {
    paperGround: '#F8F6F0',
    elevatedSheet: '#FFFFFF',
    recessedWell: '#F3EFEA',
    carbonInk: '#111827',
    graphiteMuted: '#4B5563',
    hairlineRule: '#E5E7EB',
    forestGreen: '#133E2B',
    forestGreenDark: '#0E2E20',
    forestGreenHover: '#1A4D36',
    forestGreenSoft: '#E8F3EE',
    signalCrimson: '#EF4444',
    signalCrimsonHover: '#DC2626',
    verifiedEmerald: '#15803D',
    verifiedEmeraldSoft: '#DCFCE7',
    warningAmber: '#D97706',
    warningAmberSoft: '#FEF3C7',
    preparingOrange: '#EA580C',
    preparingOrangeSoft: '#FFEDD5',
  },
  typography: {
    displayFamily: 'var(--font-sans)',
    sansFamily: 'var(--font-sans)',
    monoFamily: 'var(--font-geist-mono)',
    scale: {
      hero: '3.5rem',
      h1: '2.25rem',
      h2: '1.5rem',
      h3: '1.125rem',
      body: '0.9375rem',
      caption: '0.75rem',
    },
  },
  radii: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    full: '9999px',
  },
  loyalty: {
    currency: 'PHP',
    symbol: 'P',
    pointsPerSpend: 1, // 1 point per 10 PHP spend
    ratioPhpToPoint: 10,
    allocationQrTtlSeconds: 600,
    redemptionQrTtlSeconds: 900,
  },
} as const;

/**
 * Computes live CSS variable-font axis coordinates ('wght' and 'opsz')
 * from a numeric value (e.g., customer point balance or spend).
 */
export function computeSpecimenAxes(value: number, maxReference = 200) {
  const safeVal = Number.isFinite(value) ? Math.max(0, value) : 0;
  const ratio = Math.min(1, safeVal / Math.max(1, maxReference));
  const wght = Math.round(400 + ratio * 400);
  const opsz = Math.round(24 + ratio * 72);

  return {
    wght,
    opsz,
    ratio: Math.round(ratio * 100),
    fontVariationSettings: `'wght' ${wght}, 'opsz' ${opsz}`,
  };
}
