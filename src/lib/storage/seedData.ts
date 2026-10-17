/**
 * BrewFlow Initial Demonstration Seed Data
 * Specialty Coffeehouse Catalog, Customization Matrix, Initial Active Tickets & Loyalty
 */

import { MenuCategory, MenuItem, Order, LoyaltyAccount } from '../domain/types';

export const INITIAL_CATEGORIES: MenuCategory[] = [
  { id: 'cat-hot', name: 'Hot Coffee', slug: 'hot-coffee', displayOrder: 1 },
  { id: 'cat-cold', name: 'Cold Brew & Iced', slug: 'cold-brew', displayOrder: 2 },
  { id: 'cat-espresso', name: 'Espresso Classics', slug: 'espresso', displayOrder: 3 },
  { id: 'cat-signature', name: 'Signature Drinks', slug: 'signature', displayOrder: 4 },
  { id: 'cat-pastries', name: 'Artisanal Bakery', slug: 'pastries', displayOrder: 5 },
];

const STANDARD_DRINK_GROUPS = [
  {
    id: 'grp-size',
    name: 'Cup Size',
    type: 'radio' as const,
    required: true,
    options: [
      { id: 'opt-sz-sm', name: 'Small (8 oz)', priceDelta: 0.0, isDefault: false },
      { id: 'opt-sz-reg', name: 'Regular (12 oz)', priceDelta: 0.75, isDefault: true },
      { id: 'opt-sz-lg', name: 'Large (16 oz)', priceDelta: 1.5, isDefault: false },
    ],
  },
  {
    id: 'grp-milk',
    name: 'Milk Selection',
    type: 'radio' as const,
    required: true,
    options: [
      { id: 'opt-milk-whole', name: 'Whole Milk (Organic)', priceDelta: 0.0, isDefault: true },
      { id: 'opt-milk-oat', name: 'Minor Figures Oat Milk', priceDelta: 0.85, isDefault: false },
      { id: 'opt-milk-almond', name: 'Almond Milk', priceDelta: 0.85, isDefault: false },
      { id: 'opt-milk-none', name: 'No Milk (Black)', priceDelta: 0.0, isDefault: false },
    ],
  },
  {
    id: 'grp-sweetness',
    name: 'Sweetness',
    type: 'radio' as const,
    required: true,
    options: [
      { id: 'opt-sw-zero', name: 'Unsweetened (0%)', priceDelta: 0.0, isDefault: true },
      { id: 'opt-sw-half', name: 'Half Sweet (50%)', priceDelta: 0.0, isDefault: false },
      { id: 'opt-sw-full', name: 'Standard (100%)', priceDelta: 0.0, isDefault: false },
    ],
  },
  {
    id: 'grp-addons',
    name: 'Espresso & Toppings',
    type: 'checkbox' as const,
    required: false,
    options: [
      { id: 'opt-add-shot', name: 'Extra Double Shot', priceDelta: 1.5, isDefault: false },
      { id: 'opt-add-foam', name: 'Salted Sweet Cream Foam', priceDelta: 1.25, isDefault: false },
      { id: 'opt-add-vanilla', name: 'Madagascar Vanilla Bean', priceDelta: 0.75, isDefault: false },
    ],
  },
];

const COLD_BREW_GROUPS = [
  {
    id: 'grp-size-cold',
    name: 'Size',
    type: 'radio' as const,
    required: true,
    options: [
      { id: 'opt-sz-reg', name: 'Regular (16 oz)', priceDelta: 0.0, isDefault: true },
      { id: 'opt-sz-lg', name: 'Large (24 oz)', priceDelta: 1.25, isDefault: false },
    ],
  },
  {
    id: 'grp-sweetness-cold',
    name: 'Sweetness',
    type: 'radio' as const,
    required: true,
    options: [
      { id: 'opt-sw-zero', name: 'Unsweetened (0%)', priceDelta: 0.0, isDefault: true },
      { id: 'opt-sw-half', name: 'Half Sweet (50%)', priceDelta: 0.0, isDefault: false },
      { id: 'opt-sw-full', name: 'Standard (100%)', priceDelta: 0.0, isDefault: false },
    ],
  },
  {
    id: 'grp-cold-addons',
    name: 'Cold Enhancements',
    type: 'checkbox' as const,
    required: false,
    options: [
      { id: 'opt-add-foam', name: 'Salted Sweet Cream Foam', priceDelta: 1.25, isDefault: false },
      { id: 'opt-add-oat-splash', name: 'Splash of Oat Milk', priceDelta: 0.5, isDefault: false },
      { id: 'opt-add-shot', name: 'Espresso Float (+1 Shot)', priceDelta: 1.5, isDefault: false },
    ],
  },
];

const BAKERY_GROUPS = [
  {
    id: 'grp-preparation',
    name: 'Preparation',
    type: 'radio' as const,
    required: true,
    options: [
      { id: 'opt-prep-warm', name: 'Warm & Toasted', priceDelta: 0.0, isDefault: true },
      { id: 'opt-prep-ambient', name: 'Room Temperature', priceDelta: 0.0, isDefault: false },
    ],
  },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item-01',
    categoryId: 'cat-hot',
    categorySlug: 'hot-coffee',
    name: 'Foundry Drip Coffee',
    description: 'Direct-trade washed Colombian & Ethiopian blend. Bright clementine, brown sugar, and toasted hazelnut finish.',
    basePrice: 4.0,
    isAvailable: true,
    isPopular: true,
    customizationGroups: STANDARD_DRINK_GROUPS,
  },
  {
    id: 'item-02',
    categoryId: 'cat-hot',
    categorySlug: 'hot-coffee',
    name: 'Single Origin Yirgacheffe Pour-Over',
    description: 'Hand-poured V60 with jasmine floral aromas, bergamot citrus, and honeyed apricot clarity.',
    basePrice: 5.75,
    isAvailable: true,
    customizationGroups: STANDARD_DRINK_GROUPS,
  },
  {
    id: 'item-03',
    categoryId: 'cat-cold',
    categorySlug: 'cold-brew',
    name: 'Steeped Nitro Cold Brew',
    description: '18-hour cold steeped micro-lot infused with nitrogen for a velvety stout-like cascade and naturally sweet cacao profile.',
    basePrice: 5.5,
    isAvailable: true,
    isPopular: true,
    customizationGroups: COLD_BREW_GROUPS,
  },
  {
    id: 'item-04',
    categoryId: 'cat-cold',
    categorySlug: 'cold-brew',
    name: 'Cascara Citrus Tonic',
    description: 'Brewed coffee cherry husk extract paired with artisanal Indian tonic, blood orange wheels, and botanical bitters.',
    basePrice: 6.25,
    isAvailable: true,
    customizationGroups: COLD_BREW_GROUPS,
  },
  {
    id: 'item-05',
    categoryId: 'cat-espresso',
    categorySlug: 'espresso',
    name: 'Precision Cortado (1:1)',
    description: 'Equal parts extracted double ristretto and lightly textured whole milk served in a faceted 4.5 oz Gibraltar glass.',
    basePrice: 4.75,
    isAvailable: true,
    isPopular: true,
    customizationGroups: STANDARD_DRINK_GROUPS,
  },
  {
    id: 'item-06',
    categoryId: 'cat-espresso',
    categorySlug: 'espresso',
    name: 'Melbourne Flat White',
    description: 'Double ristretto with micro-foamed textured milk folding into silky crema with subtle caramel and cocoa notes.',
    basePrice: 5.25,
    isAvailable: true,
    customizationGroups: STANDARD_DRINK_GROUPS,
  },
  {
    id: 'item-07',
    categoryId: 'cat-signature',
    categorySlug: 'signature',
    name: 'Sea Salt Vermont Maple Latte',
    description: 'House espresso, Grade-A Vermont dark maple syrup, flaky Maldon sea salt, and velvety steamed milk.',
    basePrice: 6.5,
    isAvailable: true,
    isPopular: true,
    customizationGroups: STANDARD_DRINK_GROUPS,
  },
  {
    id: 'item-08',
    categoryId: 'cat-signature',
    categorySlug: 'signature',
    name: 'Smoked Cardamom Spanish Mocha',
    description: 'Single-origin 70% dark melted ganache, freshly crushed green cardamom, espresso, and textured milk.',
    basePrice: 6.75,
    isAvailable: true,
    customizationGroups: STANDARD_DRINK_GROUPS,
  },
  {
    id: 'item-09',
    categoryId: 'cat-pastries',
    categorySlug: 'pastries',
    name: 'Brown Butter Almond Croissant',
    description: 'Twice-baked butter croissant layered with almond frangipane cream, toasted flakes, and powdered sugar.',
    basePrice: 5.25,
    isAvailable: true,
    isPopular: true,
    customizationGroups: BAKERY_GROUPS,
  },
  {
    id: 'item-10',
    categoryId: 'cat-pastries',
    categorySlug: 'pastries',
    name: 'Cardamom Orange Morning Bun',
    description: 'Flaky laminated sourdough pastry swirled with crushed cardamom, cinnamon, and fresh orange zest sugar.',
    basePrice: 4.75,
    isAvailable: true,
    customizationGroups: BAKERY_GROUPS,
  },
  {
    id: 'item-11',
    categoryId: 'cat-pastries',
    categorySlug: 'pastries',
    name: 'Sourdough Gruyère & Herb Escargot',
    description: 'Savory spiral pastry rolled with aged Swiss Gruyère, fresh rosemary, cracked black pepper, and sea salt.',
    basePrice: 5.5,
    isAvailable: false, // 86'd intentionally for demo
    customizationGroups: BAKERY_GROUPS,
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-0104',
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 mins ago
    customerName: 'Marcus Vance',
    customerPhone: '+1 (555) 349-8102',
    pickupSlot: 'Next available (10–15 min)',
    items: [
      {
        id: 'line-1',
        menuItemId: 'item-07',
        name: 'Sea Salt Vermont Maple Latte',
        basePrice: 6.5,
        selectedOptions: [
          { groupId: 'grp-size', groupName: 'Cup Size', optionId: 'opt-sz-reg', optionName: 'Regular (12 oz)', priceDelta: 0.75 },
          { groupId: 'grp-milk', groupName: 'Milk Selection', optionId: 'opt-milk-oat', optionName: 'Minor Figures Oat Milk', priceDelta: 0.85 },
          { groupId: 'grp-sweetness', groupName: 'Sweetness', optionId: 'opt-sw-half', optionName: 'Half Sweet (50%)', priceDelta: 0.0 },
        ],
        specialInstructions: 'Extra hot please!',
        quantity: 1,
        unitPrice: 8.1,
        lineTotal: 8.1,
      },
      {
        id: 'line-2',
        menuItemId: 'item-09',
        name: 'Brown Butter Almond Croissant',
        basePrice: 5.25,
        selectedOptions: [
          { groupId: 'grp-preparation', groupName: 'Preparation', optionId: 'opt-prep-warm', optionName: 'Warm & Toasted', priceDelta: 0.0 },
        ],
        quantity: 1,
        unitPrice: 5.25,
        lineTotal: 5.25,
      },
    ],
    subtotal: 13.35,
    discount: 0.0,
    total: 13.35,
    pointsRedeemed: 0,
    pointsEarned: 13,
    paymentStatus: 'unpaid_at_pickup',
    status: 'pending',
    history: [
      {
        status: 'pending',
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        actor: 'customer',
        note: 'Order submitted online',
      },
    ],
  },
  {
    id: 'ORD-0103',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 mins ago
    customerName: 'Elena Rostova',
    customerPhone: '+1 (555) 892-1144',
    pickupSlot: 'Next available (10–15 min)',
    items: [
      {
        id: 'line-3',
        menuItemId: 'item-03',
        name: 'Steeped Nitro Cold Brew',
        basePrice: 5.5,
        selectedOptions: [
          { groupId: 'grp-size-cold', groupName: 'Size', optionId: 'opt-sz-reg', optionName: 'Regular (16 oz)', priceDelta: 0.0 },
          { groupId: 'grp-cold-addons', groupName: 'Cold Enhancements', optionId: 'opt-add-foam', optionName: 'Salted Sweet Cream Foam', priceDelta: 1.25 },
        ],
        quantity: 1,
        unitPrice: 6.75,
        lineTotal: 6.75,
      },
    ],
    subtotal: 6.75,
    discount: 2.0, // redeemed 20 points
    total: 4.75,
    pointsRedeemed: 20,
    pointsEarned: 5,
    paymentStatus: 'unpaid_at_pickup',
    status: 'preparing',
    history: [
      { status: 'pending', timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), actor: 'customer' },
      { status: 'accepted', timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(), actor: 'barista', note: 'Barista Chloe accepted' },
      { status: 'preparing', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), actor: 'barista', note: 'Nitro cold tap pulling' },
    ],
  },
  {
    id: 'ORD-0102',
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(), // 14 mins ago
    customerName: 'Devon Lee',
    customerPhone: '+1 (555) 431-7720',
    pickupSlot: '8:45 AM',
    items: [
      {
        id: 'line-4',
        menuItemId: 'item-05',
        name: 'Precision Cortado (1:1)',
        basePrice: 4.75,
        selectedOptions: [
          { groupId: 'grp-size', groupName: 'Cup Size', optionId: 'opt-sz-sm', optionName: 'Small (8 oz)', priceDelta: 0.0 },
          { groupId: 'grp-milk', groupName: 'Milk Selection', optionId: 'opt-milk-whole', optionName: 'Whole Milk (Organic)', priceDelta: 0.0 },
          { groupId: 'grp-sweetness', groupName: 'Sweetness', optionId: 'opt-sw-zero', optionName: 'Unsweetened (0%)', priceDelta: 0.0 },
        ],
        quantity: 2,
        unitPrice: 4.75,
        lineTotal: 9.5,
      },
    ],
    subtotal: 9.5,
    discount: 0.0,
    total: 9.5,
    pointsRedeemed: 0,
    pointsEarned: 10,
    paymentStatus: 'unpaid_at_pickup',
    status: 'ready',
    history: [
      { status: 'pending', timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(), actor: 'customer' },
      { status: 'accepted', timestamp: new Date(Date.now() - 13 * 60 * 1000).toISOString(), actor: 'barista' },
      { status: 'preparing', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), actor: 'barista' },
      { status: 'ready', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), actor: 'barista', note: 'Staged on pickup counter shelf #2' },
    ],
  },
  {
    id: 'ORD-0101',
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(), // 42 mins ago
    customerName: 'Sarah Jenkins',
    customerPhone: '+1 (555) 901-2299',
    pickupSlot: '8:15 AM',
    items: [
      {
        id: 'line-5',
        menuItemId: 'item-01',
        name: 'Foundry Drip Coffee',
        basePrice: 4.0,
        selectedOptions: [
          { groupId: 'grp-size', groupName: 'Cup Size', optionId: 'opt-sz-reg', optionName: 'Regular (12 oz)', priceDelta: 0.75 },
          { groupId: 'grp-milk', groupName: 'Milk Selection', optionId: 'opt-milk-oat', optionName: 'Minor Figures Oat Milk', priceDelta: 0.85 },
          { groupId: 'grp-sweetness', groupName: 'Sweetness', optionId: 'opt-sw-zero', optionName: 'Unsweetened (0%)', priceDelta: 0.0 },
        ],
        quantity: 1,
        unitPrice: 5.6,
        lineTotal: 5.6,
      },
    ],
    subtotal: 5.6,
    discount: 0.0,
    total: 5.6,
    pointsRedeemed: 0,
    pointsEarned: 6,
    paymentStatus: 'paid_at_pickup',
    status: 'completed',
    history: [
      { status: 'pending', timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(), actor: 'customer' },
      { status: 'accepted', timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(), actor: 'barista' },
      { status: 'preparing', timestamp: new Date(Date.now() - 38 * 60 * 1000).toISOString(), actor: 'barista' },
      { status: 'ready', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), actor: 'barista' },
      { status: 'completed', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), actor: 'barista', note: 'Picked up & paid in cash' },
    ],
  },
];

export const INITIAL_LOYALTY: LoyaltyAccount = {
  balance: 85,
  ledger: [
    {
      id: 'led-1',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'bonus',
      points: 50,
      balanceAfter: 50,
      note: 'Foundry Welcome Perk (First Visit)',
    },
    {
      id: 'led-2',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'earned',
      points: 21,
      orderId: 'ORD-0091',
      balanceAfter: 71,
      note: 'Earned from order #ORD-0091 ($21.25)',
    },
    {
      id: 'led-3',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'earned',
      points: 14,
      orderId: 'ORD-0097',
      balanceAfter: 85,
      note: 'Earned from order #ORD-0097 ($14.50)',
    },
  ],
};
