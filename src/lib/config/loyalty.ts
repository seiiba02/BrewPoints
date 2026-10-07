export interface LoyaltyConfig {
  pointsPerCurrencyUnit: number;
  minSpendAmount: number;
  maxSpendAmount: number;
  maxRewardCost: number;
  redemptionTokenTtl: number;
  allocationTokenTtl: number;
  redemptionTokenSecret: string;
  firebaseReal: boolean;
  firebaseProjectId: string;
  seedOwnerFirebaseUid: string;
  seedStaffFirebaseUid: string;
  seedCustomerFirebaseUid: string;
}

export function getLoyaltyConfig(): LoyaltyConfig {
  return {
    pointsPerCurrencyUnit: Number(process.env.LOYALTY_POINTS_PER_UNIT ?? 1),
    minSpendAmount: Number(process.env.LOYALTY_MIN_SPEND ?? 1.0),
    maxSpendAmount: Number(process.env.LOYALTY_MAX_SPEND ?? 1000.0),
    maxRewardCost: Number(process.env.LOYALTY_MAX_REWARD_COST ?? 10000),
    redemptionTokenTtl: Number(process.env.LOYALTY_REDEMPTION_TTL ?? 900),
    allocationTokenTtl: Number(process.env.LOYALTY_ALLOCATION_TTL ?? 600),
    redemptionTokenSecret:
      process.env.REDEMPTION_TOKEN_SECRET ??
      'super-secret-brewpoints-jws-key-change-in-production',
    firebaseReal: process.env.FIREBASE_REAL === 'true',
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? 'brewpoints-placeholder',
    seedOwnerFirebaseUid: process.env.SEED_OWNER_FIREBASE_UID ?? 'owner-dummy-uid-001',
    seedStaffFirebaseUid: process.env.SEED_STAFF_FIREBASE_UID ?? 'staff-dummy-uid-001',
    seedCustomerFirebaseUid:
      process.env.SEED_CUSTOMER_FIREBASE_UID ?? 'customer-dummy-uid-001',
  };
}
