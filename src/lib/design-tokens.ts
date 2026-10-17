/**
 * BrewPoints Shared Design System Tokens
 * Direction: Kinetic Variable-Type Espresso Foundry (variable-font-specimen)
 * Shared across Next.js 16 Web/PWA and React Native (Expo) Mobile clients.
 */

export const BREWPOINTS_TOKENS = {
  direction: {
    id: 'variable-font-specimen',
    name: 'Kinetic Variable-Type Espresso Foundry',
    mode: 'operate',
  },
  palette: {
    paperGround: '#F8F6F0',
    elevatedSheet: '#FFFFFF',
    recessedWell: '#EFECE3',
    carbonInk: '#111110',
    graphiteMuted: '#4A4843',
    hairlineRule: '#D4D0C5',
    signalCrimson: '#E02E24',
    signalCrimsonHover: '#B82219',
    verifiedEmerald: '#15803D',
    verifiedEmeraldSoft: '#DCFCE7',
    warningAmber: '#B45309',
  },
  typography: {
    displayFamily: 'Fraunces',
    sansFamily: 'Plus Jakarta Sans',
    monoFamily: 'JetBrains Mono',
    scale: {
      specimenMax: '5.25rem', // 84px (under 6rem craft floor limit)
      h1: '2.25rem', // 36px
      h2: '1.5rem', // 24px
      h3: '1.125rem', // 18px
      body: '0.9375rem', // 15px
      monoTelemetry: '0.75rem', // 12px
    },
    variableAxes: {
      wghtMin: 320,
      wghtMax: 900,
      opszMin: 24,
      opszMax: 144,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radii: {
    none: 0,
    sm: 2,
    md: 4,
    lg: 6,
  },
  loyalty: {
    currency: 'USD',
    symbol: '$',
    pointsPerDollar: 1,
    roundingMode: 'HALF_UP',
    allocationQrTtlSeconds: 600,
    redemptionQrTtlSeconds: 900,
  },
} as const;

/**
 * Computes live CSS variable-font axis coordinates ('wght' and 'opsz')
 * from a numeric value (e.g., customer point balance or USD purchase spend).
 */
export function computeSpecimenAxes(value: number, maxReference = 200) {
  const safeVal = Number.isFinite(value) ? Math.max(0, value) : 0;
  const ratio = Math.min(1, safeVal / Math.max(1, maxReference));
  const wght = Math.round(
    BREWPOINTS_TOKENS.typography.variableAxes.wghtMin +
      ratio *
        (BREWPOINTS_TOKENS.typography.variableAxes.wghtMax -
          BREWPOINTS_TOKENS.typography.variableAxes.wghtMin)
  );
  const opsz = Math.round(
    BREWPOINTS_TOKENS.typography.variableAxes.opszMin +
      ratio *
        (BREWPOINTS_TOKENS.typography.variableAxes.opszMax -
          BREWPOINTS_TOKENS.typography.variableAxes.opszMin)
  );

  return {
    wght,
    opsz,
    ratio: Math.round(ratio * 100),
    fontVariationSettings: `'wght' ${wght}, 'opsz' ${opsz}`,
  };
}
