import type {
  LoyaltyAccount,
  Prisma,
  Redemption,
  Reward,
  Transaction,
  TransactionType,
  User,
  UserRole,
} from '@prisma/client';

class DecimalValue {
  private readonly val: number;
  constructor(v: number | string | DecimalValue) {
    this.val =
      v instanceof DecimalValue
        ? v.val
        : typeof v === 'string'
        ? Number(v)
        : v;
  }
  toFixed(digits = 2): string {
    return this.val.toFixed(digits);
  }
  toNumber(): number {
    return this.val;
  }
  toString(): string {
    return this.val.toFixed(2);
  }
  valueOf(): number {
    return this.val;
  }
}

interface MemoryState {
  users: User[];
  loyaltyAccounts: LoyaltyAccount[];
  rewards: Reward[];
  redemptions: Redemption[];
  transactions: Transaction[];
  seq: {
    user: bigint;
    loyaltyAccount: bigint;
    reward: bigint;
    redemption: bigint;
    transaction: bigint;
  };
}

function createInitialState(): MemoryState {
  const now = new Date();
  const users: User[] = [
    {
      id: BigInt(1),
      name: 'Shop Owner',
      email: 'owner@brewpoints.local',
      phone: '+1-555-0101',
      firebase_uid: 'owner-dummy-uid-001',
      role: 'owner',
      created_at: now,
      updated_at: now,
      deleted_at: null,
    },
    {
      id: BigInt(2),
      name: 'Barista Staff',
      email: 'staff@brewpoints.local',
      phone: '+1-555-0102',
      firebase_uid: 'staff-dummy-uid-001',
      role: 'staff',
      created_at: now,
      updated_at: now,
      deleted_at: null,
    },
    {
      id: BigInt(3),
      name: 'Jane Customer',
      email: 'customer@brewpoints.local',
      phone: '+1-555-0103',
      firebase_uid: 'customer-dummy-uid-001',
      role: 'customer',
      created_at: now,
      updated_at: now,
      deleted_at: null,
    },
  ];

  const loyaltyAccounts: LoyaltyAccount[] = [
    {
      id: BigInt(1),
      user_id: BigInt(1),
      current_points: 0,
      total_points_earned: 0,
      total_points_redeemed: 0,
      last_earned_at: null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    },
    {
      id: BigInt(2),
      user_id: BigInt(2),
      current_points: 0,
      total_points_earned: 0,
      total_points_redeemed: 0,
      last_earned_at: null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    },
    {
      id: BigInt(3),
      user_id: BigInt(3),
      current_points: 145,
      total_points_earned: 245,
      total_points_redeemed: 100,
      last_earned_at: now,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    },
  ];

  const rewards: Reward[] = [
    {
      id: BigInt(1),
      name: 'Free Espresso',
      description: 'Single-origin house espresso shot pulled to order.',
      points_required: 100,
      active: true,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    },
    {
      id: BigInt(2),
      name: 'Free Pastry',
      description: 'Freshly baked butter croissant or seasonal morning pastry.',
      points_required: 150,
      active: true,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    },
    {
      id: BigInt(3),
      name: '10% Discount Voucher',
      description: '10% off any whole bean bag or specialty pour-over order.',
      points_required: 200,
      active: true,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    },
  ];

  const redemptions: Redemption[] = [
    {
      id: BigInt(1),
      jti: '11111111-1111-4111-8111-111111111111',
      customer_id: BigInt(3),
      reward_id: BigInt(1),
      points_cost: 100,
      confirmed_by_staff_id: BigInt(2),
      confirmed_at: now,
      created_at: now,
      updated_at: now,
    },
  ];

  const transactions: Transaction[] = [
    {
      id: BigInt(1),
      user_id: BigInt(3),
      type: 'earn',
      points: 145,
      amount: new DecimalValue(145.0) as unknown as Prisma.Decimal,
      staff_id: BigInt(2),
      redemption_id: null,
      note: 'Starter loyalty balance & specialty coffee purchases',
      created_at: now,
      updated_at: now,
    },
    {
      id: BigInt(2),
      user_id: BigInt(3),
      type: 'earn',
      points: 100,
      amount: new DecimalValue(100.0) as unknown as Prisma.Decimal,
      staff_id: BigInt(2),
      redemption_id: null,
      note: 'Whole bean Geisha reserve bag',
      created_at: now,
      updated_at: now,
    },
    {
      id: BigInt(3),
      user_id: BigInt(3),
      type: 'redeem',
      points: 100,
      amount: null,
      staff_id: BigInt(2),
      redemption_id: BigInt(1),
      note: 'Redeemed Free Espresso',
      created_at: now,
      updated_at: now,
    },
  ];

  return {
    users,
    loyaltyAccounts,
    rewards,
    redemptions,
    transactions,
    seq: {
      user: BigInt(4),
      loyaltyAccount: BigInt(4),
      reward: BigInt(4),
      redemption: BigInt(2),
      transaction: BigInt(4),
    },
  };
}

const globalStore = globalThis as unknown as {
  __brewpointsMemoryState?: MemoryState;
};

function getState(): MemoryState {
  if (!globalStore.__brewpointsMemoryState) {
    globalStore.__brewpointsMemoryState = createInitialState();
  }
  return globalStore.__brewpointsMemoryState;
}

function toBigInt(v: unknown): bigint {
  if (typeof v === 'bigint') return v;
  if (typeof v === 'number' || typeof v === 'string') return BigInt(v);
  return BigInt(0);
}

function matchDateFilter(val: Date | null, filter: unknown): boolean {
  if (filter === null) return val === null;
  if (filter === undefined) return true;
  if (filter instanceof Date) return val?.getTime() === filter.getTime();
  return true;
}

function matchUserWhere(u: User, where?: Record<string, unknown>): boolean {
  if (!where) return true;
  if (Array.isArray(where.OR)) {
    const orMatched = where.OR.some((cond) =>
      matchUserWhere(u, cond as Record<string, unknown>)
    );
    if (!orMatched) return false;
  }
  if (where.NOT && typeof where.NOT === 'object') {
    if (matchUserWhere(u, where.NOT as Record<string, unknown>)) return false;
  }
  if (where.id !== undefined && u.id !== toBigInt(where.id)) return false;
  if (where.email !== undefined && u.email !== where.email) return false;
  if (where.firebase_uid !== undefined && u.firebase_uid !== where.firebase_uid)
    return false;
  if (where.role !== undefined) {
    if (typeof where.role === 'string') {
      if (u.role !== where.role) return false;
    } else if (
      typeof where.role === 'object' &&
      where.role !== null &&
      'in' in where.role &&
      Array.isArray((where.role as { in: UserRole[] }).in)
    ) {
      if (!(where.role as { in: UserRole[] }).in.includes(u.role)) return false;
    }
  }
  if ('deleted_at' in where && !matchDateFilter(u.deleted_at, where.deleted_at))
    return false;
  return true;
}

function attachUserIncludes(
  u: User,
  include?: Record<string, unknown>
): Record<string, unknown> {
  const s = getState();
  const copy: Record<string, unknown> = { ...u };
  if (!include) return copy;
  if (include.loyaltyAccount) {
    copy.loyaltyAccount =
      s.loyaltyAccounts.find((la) => la.user_id === u.id) ?? null;
  }
  if (include.staffTransactions) {
    copy.staffTransactions = s.transactions
      .filter((t) => t.staff_id === u.id)
      .map((t) => ({ type: t.type, points: t.points }));
  }
  if (include._count) {
    copy._count = {
      staffTransactions: s.transactions.filter((t) => t.staff_id === u.id)
        .length,
      confirmedRedemptions: s.redemptions.filter(
        (r) => r.confirmed_by_staff_id === u.id
      ).length,
    };
  }
  return copy;
}

function matchRewardWhere(r: Reward, where?: Record<string, unknown>): boolean {
  if (!where) return true;
  if (where.NOT && typeof where.NOT === 'object') {
    if (matchRewardWhere(r, where.NOT as Record<string, unknown>)) return false;
  }
  if (where.id !== undefined && r.id !== toBigInt(where.id)) return false;
  if (where.name !== undefined && r.name !== where.name) return false;
  if (where.active !== undefined && r.active !== where.active) return false;
  if ('deleted_at' in where && !matchDateFilter(r.deleted_at, where.deleted_at))
    return false;
  return true;
}

function buildClient() {
  const userDelegate = {
    async findUnique(args: {
      where: Record<string, unknown>;
      include?: Record<string, unknown>;
    }) {
      const s = getState();
      const found = s.users.find((u) => matchUserWhere(u, args.where)) ?? null;
      if (!found) return null;
      return attachUserIncludes(found, args.include) as unknown as User;
    },
    async findFirst(args?: {
      where?: Record<string, unknown>;
      include?: Record<string, unknown>;
    }) {
      const s = getState();
      const found = s.users.find((u) => matchUserWhere(u, args?.where)) ?? null;
      if (!found) return null;
      return attachUserIncludes(found, args?.include) as unknown as User;
    },
    async findMany(args?: {
      where?: Record<string, unknown>;
      include?: Record<string, unknown>;
      orderBy?: unknown;
    }) {
      const s = getState();
      const list = s.users.filter((u) => matchUserWhere(u, args?.where));
      list.sort((a, b) => Number(b.id - a.id));
      return list.map((u) => attachUserIncludes(u, args?.include));
    },
    async count(args?: { where?: Record<string, unknown> }) {
      const s = getState();
      return s.users.filter((u) => matchUserWhere(u, args?.where)).length;
    },
    async create(args: {
      data: Record<string, unknown>;
      include?: Record<string, unknown>;
    }) {
      const s = getState();
      const now = new Date();
      const created: User = {
        id: s.seq.user++,
        name: String(args.data.name),
        email: String(args.data.email),
        phone: (args.data.phone as string | null) ?? null,
        firebase_uid: String(args.data.firebase_uid),
        role: (args.data.role as UserRole) ?? 'customer',
        created_at: now,
        updated_at: now,
        deleted_at: (args.data.deleted_at as Date | null) ?? null,
      };
      s.users.push(created);
      return attachUserIncludes(created, args.include) as unknown as User;
    },
    async update(args: {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
      include?: Record<string, unknown>;
    }) {
      const s = getState();
      const target = s.users.find((u) => matchUserWhere(u, args.where));
      if (!target) throw new Error('User not found');
      if (args.data.name !== undefined) target.name = String(args.data.name);
      if (args.data.email !== undefined) target.email = String(args.data.email);
      if (args.data.phone !== undefined)
        target.phone = (args.data.phone as string | null) ?? null;
      if (args.data.firebase_uid !== undefined)
        target.firebase_uid = String(args.data.firebase_uid);
      if (args.data.role !== undefined)
        target.role = args.data.role as UserRole;
      if ('deleted_at' in args.data)
        target.deleted_at = (args.data.deleted_at as Date | null) ?? null;
      target.updated_at = new Date();
      return attachUserIncludes(target, args.include) as unknown as User;
    },
    async upsert(args: {
      where: Record<string, unknown>;
      update: Record<string, unknown>;
      create: Record<string, unknown>;
    }) {
      const existing = await userDelegate.findUnique({ where: args.where });
      if (existing) {
        return userDelegate.update({
          where: { id: existing.id },
          data: args.update,
        });
      }
      return userDelegate.create({ data: args.create });
    },
    async deleteMany() {
      const s = getState();
      const count = s.users.length;
      s.users = [];
      return { count };
    },
  };

  const loyaltyAccountDelegate = {
    async findUnique(args: { where: Record<string, unknown> }) {
      const s = getState();
      return (
        s.loyaltyAccounts.find((la) => {
          if (args.where.id !== undefined)
            return la.id === toBigInt(args.where.id);
          if (args.where.user_id !== undefined)
            return la.user_id === toBigInt(args.where.user_id);
          return false;
        }) ?? null
      );
    },
    async create(args: { data: Record<string, unknown> }) {
      const s = getState();
      const now = new Date();
      const created: LoyaltyAccount = {
        id: s.seq.loyaltyAccount++,
        user_id: toBigInt(args.data.user_id),
        current_points: Number(args.data.current_points ?? 0),
        total_points_earned: Number(args.data.total_points_earned ?? 0),
        total_points_redeemed: Number(args.data.total_points_redeemed ?? 0),
        last_earned_at: (args.data.last_earned_at as Date | null) ?? null,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };
      s.loyaltyAccounts.push(created);
      return created;
    },
    async update(args: {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    }) {
      const s = getState();
      const target = s.loyaltyAccounts.find((la) => {
        if (args.where.id !== undefined)
          return la.id === toBigInt(args.where.id);
        if (args.where.user_id !== undefined)
          return la.user_id === toBigInt(args.where.user_id);
        return false;
      });
      if (!target) throw new Error('LoyaltyAccount not found');
      if (args.data.current_points !== undefined)
        target.current_points = Number(args.data.current_points);
      if (args.data.total_points_earned !== undefined)
        target.total_points_earned = Number(args.data.total_points_earned);
      if (args.data.total_points_redeemed !== undefined)
        target.total_points_redeemed = Number(args.data.total_points_redeemed);
      if (args.data.last_earned_at !== undefined)
        target.last_earned_at = args.data.last_earned_at as Date | null;
      if ('deleted_at' in args.data)
        target.deleted_at = (args.data.deleted_at as Date | null) ?? null;
      target.updated_at = new Date();
      return target;
    },
    async upsert(args: {
      where: Record<string, unknown>;
      update: Record<string, unknown>;
      create: Record<string, unknown>;
    }) {
      const existing = await loyaltyAccountDelegate.findUnique({
        where: args.where,
      });
      if (existing) {
        return loyaltyAccountDelegate.update({
          where: { id: existing.id },
          data: args.update,
        });
      }
      return loyaltyAccountDelegate.create({ data: args.create });
    },
    async aggregate() {
      const s = getState();
      let earned = 0;
      let redeemed = 0;
      let current = 0;
      for (const la of s.loyaltyAccounts) {
        earned += la.total_points_earned;
        redeemed += la.total_points_redeemed;
        current += la.current_points;
      }
      return {
        _sum: {
          total_points_earned: earned,
          total_points_redeemed: redeemed,
          current_points: current,
        },
      };
    },
    async deleteMany() {
      const s = getState();
      const count = s.loyaltyAccounts.length;
      s.loyaltyAccounts = [];
      return { count };
    },
  };

  const rewardDelegate = {
    async findFirst(args?: { where?: Record<string, unknown> }) {
      const s = getState();
      return s.rewards.find((r) => matchRewardWhere(r, args?.where)) ?? null;
    },
    async findMany(args?: {
      where?: Record<string, unknown>;
      include?: Record<string, unknown>;
      orderBy?: unknown;
    }) {
      const s = getState();
      const list = s.rewards.filter((r) => matchRewardWhere(r, args?.where));
      list.sort(
        (a, b) =>
          a.points_required - b.points_required || Number(a.id - b.id)
      );
      return list.map((r) => {
        const copy: Record<string, unknown> = { ...r };
        if (args?.include?._count) {
          copy._count = {
            redemptions: s.redemptions.filter((rd) => rd.reward_id === r.id)
              .length,
          };
        }
        return copy;
      });
    },
    async create(args: { data: Record<string, unknown> }) {
      const s = getState();
      const now = new Date();
      const created: Reward = {
        id: s.seq.reward++,
        name: String(args.data.name),
        description: (args.data.description as string | null) ?? null,
        points_required: Number(args.data.points_required),
        active:
          args.data.active !== undefined ? Boolean(args.data.active) : true,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };
      s.rewards.push(created);
      return created;
    },
    async update(args: {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    }) {
      const s = getState();
      const target = s.rewards.find((r) => matchRewardWhere(r, args.where));
      if (!target) throw new Error('Reward not found');
      if (args.data.name !== undefined) target.name = String(args.data.name);
      if (args.data.description !== undefined)
        target.description = (args.data.description as string | null) ?? null;
      if (args.data.points_required !== undefined)
        target.points_required = Number(args.data.points_required);
      if (args.data.active !== undefined)
        target.active = Boolean(args.data.active);
      if ('deleted_at' in args.data)
        target.deleted_at = (args.data.deleted_at as Date | null) ?? null;
      target.updated_at = new Date();
      return target;
    },
    async deleteMany() {
      const s = getState();
      const count = s.rewards.length;
      s.rewards = [];
      return { count };
    },
  };

  const redemptionDelegate = {
    async findUnique(args: { where: Record<string, unknown> }) {
      const s = getState();
      return (
        s.redemptions.find((r) => {
          if (args.where.id !== undefined)
            return r.id === toBigInt(args.where.id);
          if (args.where.jti !== undefined) return r.jti === args.where.jti;
          return false;
        }) ?? null
      );
    },
    async count() {
      return getState().redemptions.length;
    },
    async create(args: { data: Record<string, unknown> }) {
      const s = getState();
      const now = new Date();
      const created: Redemption = {
        id: s.seq.redemption++,
        jti: String(args.data.jti),
        customer_id: toBigInt(args.data.customer_id),
        reward_id: toBigInt(args.data.reward_id),
        points_cost: Number(args.data.points_cost),
        confirmed_by_staff_id: toBigInt(args.data.confirmed_by_staff_id),
        confirmed_at: (args.data.confirmed_at as Date) ?? now,
        created_at: now,
        updated_at: now,
      };
      s.redemptions.push(created);
      return created;
    },
    async deleteMany() {
      const s = getState();
      const count = s.redemptions.length;
      s.redemptions = [];
      return { count };
    },
  };

  const transactionDelegate = {
    async count(args?: { where?: Record<string, unknown> }) {
      const s = getState();
      return s.transactions.filter((t) => {
        if (args?.where?.user_id !== undefined) {
          return t.user_id === toBigInt(args.where.user_id);
        }
        return true;
      }).length;
    },
    async findMany(args?: {
      where?: Record<string, unknown>;
      include?: Record<string, unknown>;
      orderBy?: unknown;
      skip?: number;
      take?: number;
    }) {
      const s = getState();
      let list = s.transactions.filter((t) => {
        if (args?.where?.user_id !== undefined) {
          return t.user_id === toBigInt(args.where.user_id);
        }
        return true;
      });

      const isAsc =
        args?.orderBy &&
        !Array.isArray(args.orderBy) &&
        (args.orderBy as { created_at?: string }).created_at === 'asc';

      list = [...list].sort((a, b) =>
        isAsc ? Number(a.id - b.id) : Number(b.id - a.id)
      );

      if (typeof args?.skip === 'number') {
        list = list.slice(args.skip);
      }
      if (typeof args?.take === 'number') {
        list = list.slice(0, args.take);
      }

      return list.map((t) => {
        const copy: Record<string, unknown> = { ...t };
        if (args?.include?.staff) {
          const staffUser = s.users.find((u) => u.id === t.staff_id);
          copy.staff = staffUser
            ? { id: staffUser.id, name: staffUser.name }
            : null;
        }
        if (args?.include?.redemption) {
          const red = s.redemptions.find((r) => r.id === t.redemption_id);
          const rew = red
            ? s.rewards.find((rw) => rw.id === red.reward_id)
            : null;
          copy.redemption = red
            ? {
                ...red,
                reward: rew ? { id: rew.id, name: rew.name } : null,
              }
            : null;
        }
        return copy;
      });
    },
    async create(args: { data: Record<string, unknown> }) {
      const s = getState();
      const now = new Date();
      const rawAmount = args.data.amount;
      const created: Transaction = {
        id: s.seq.transaction++,
        user_id: toBigInt(args.data.user_id),
        type: args.data.type as TransactionType,
        points: Number(args.data.points),
        amount:
          rawAmount !== undefined && rawAmount !== null
            ? (new DecimalValue(Number(rawAmount)) as unknown as Prisma.Decimal)
            : null,
        staff_id:
          args.data.staff_id !== undefined && args.data.staff_id !== null
            ? toBigInt(args.data.staff_id)
            : null,
        redemption_id:
          args.data.redemption_id !== undefined &&
          args.data.redemption_id !== null
            ? toBigInt(args.data.redemption_id)
            : null,
        note: (args.data.note as string | null) ?? null,
        created_at: now,
        updated_at: now,
      };
      s.transactions.push(created);
      return created;
    },
    async deleteMany() {
      const s = getState();
      const count = s.transactions.length;
      s.transactions = [];
      return { count };
    },
  };

  const client = {
    user: userDelegate,
    loyaltyAccount: loyaltyAccountDelegate,
    reward: rewardDelegate,
    redemption: redemptionDelegate,
    transaction: transactionDelegate,
    async $queryRaw<T = unknown>(
      _strings: TemplateStringsArray,
      ...values: unknown[]
    ): Promise<T> {
      const s = getState();
      const userId = toBigInt(values[0]);
      const rows = s.loyaltyAccounts
        .filter((la) => la.user_id === userId && la.deleted_at === null)
        .map((la) => ({
          id: la.id,
          current_points: la.current_points,
          total_points_earned: la.total_points_earned,
          total_points_redeemed: la.total_points_redeemed,
        }));
      return rows as unknown as T;
    },
    async $transaction<T>(
      fn: (tx: import('@prisma/client').Prisma.TransactionClient) => Promise<T>
    ): Promise<T> {
      return fn(
        client as unknown as import('@prisma/client').Prisma.TransactionClient
      );
    },
    async $disconnect(): Promise<void> {
      // No-op for in-memory adapter
    },
  };

  return client;
}

export const prisma = buildClient() as unknown as import('@prisma/client').PrismaClient;
