import { getLoyaltyConfig } from '@/lib/config/loyalty';

/**
 * Pure value object: calculates how many loyalty points a spend amount earns.
 * Mirrors PHP's round(amount * pointsPerUnit, 0, PHP_ROUND_HALF_UP).
 */
export class PointsCalculator {
  constructor(
    private readonly pointsPerUnit: number,
    private readonly minSpend: number,
    private readonly maxSpend: number
  ) {}

  static fromConfig(): PointsCalculator {
    const cfg = getLoyaltyConfig();
    return new PointsCalculator(
      cfg.pointsPerCurrencyUnit,
      cfg.minSpendAmount,
      cfg.maxSpendAmount
    );
  }

  /**
   * Calculate points for a given spend amount using half-up rounding.
   */
  calculate(amount: number): number {
    const raw = amount * this.pointsPerUnit;
    return Math.floor(raw + 0.5);
  }

  getMinSpend(): number {
    return this.minSpend;
  }

  getMaxSpend(): number {
    return this.maxSpend;
  }
}
