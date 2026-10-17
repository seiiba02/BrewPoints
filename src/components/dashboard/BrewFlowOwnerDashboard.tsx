'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  StoreMetrics,
  Order,
  MenuItem,
  OrderStatus,
  MenuCategory,
} from '@/lib/domain/types';
import {
  storeService,
  orderService,
  menuService,
} from '@/lib/services/brewflowService';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Clock,
  RotateCcw,
  Plus,
  Check,
  Search,
  Filter,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { computeSpecimenAxes } from '@/lib/design-tokens';

export function BrewFlowOwnerDashboard() {
  const [metrics, setMetrics] = useState<StoreMetrics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'menu'>('overview');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state for menu item prices
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  // Add Item Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('5.00');
  const [newItemCategory, setNewItemCategory] = useState('hot-coffee');

  const [resetFeedback, setResetFeedback] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const loadAll = async () => {
    const [m, o, items, cats] = await Promise.all([
      storeService.getMetrics(),
      orderService.getOrders(),
      menuService.getMenuItems(),
      menuService.getCategories(),
    ]);
    setMetrics(m);
    setOrders(o);
    setMenuItems(items);
    setCategories(cats);
  };

  useEffect(() => {
    loadAll();

    const unsubscribe = orderService.subscribe(() => {
      startTransition(() => {
        loadAll();
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleUpdatePrice = async (itemId: string) => {
    const parsed = parseFloat(tempPrice);
    if (isNaN(parsed) || parsed <= 0) return;

    await menuService.updateMenuItem(itemId, { basePrice: parsed });
    setEditingItemId(null);
    setTempPrice('');
    loadAll();
  };

  const handleToggleStock = async (itemId: string, current: boolean) => {
    await menuService.toggleItemAvailability(itemId, !current);
    loadAll();
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || isNaN(parseFloat(newItemPrice))) return;

    await menuService.addMenuItem({
      categoryId: `cat-${newItemCategory}`,
      categorySlug: newItemCategory,
      name: newItemName.trim(),
      description: newItemDesc.trim() || 'Artisanal roastery selection.',
      basePrice: parseFloat(newItemPrice),
      isAvailable: true,
      customizationGroups: [],
    });

    setIsAddModalOpen(false);
    setNewItemName('');
    setNewItemDesc('');
    setNewItemPrice('5.00');
    loadAll();
  };

  const handleResetStore = async () => {
    if (!confirm('Reset all demonstration orders, stock, and loyalty to default seed state?')) {
      return;
    }
    await storeService.resetDemoData();
    setResetFeedback('Store seed data successfully restored to pristine state.');
    setTimeout(() => setResetFeedback(null), 3500);
    loadAll();
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      orderStatusFilter === 'all' || order.status === orderStatusFilter;
    const matchesSearch =
      searchQuery === '' ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const revenueAxes = computeSpecimenAxes(metrics?.grossRevenue || 0, 100);

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#111110] pb-24 md:pb-16">
      {/* Subheader Navigation */}
      <section className="border-b border-[#D4D0C5] bg-[#FFFFFF] px-4 md:px-8 py-6">
        <div className="mx-auto max-w-[1440px] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 font-mono text-xs text-[#4A4843]">
              <span className="h-2 w-2 bg-[#111110] inline-block" />
              <span>EXECUTIVE LEDGER</span>
              <span aria-hidden="true">·</span>
              <span>SINGLE-TENANT STORE SUITE</span>
            </div>
            <h1
              className="text-2xl md:text-4xl font-bold tracking-tight text-[#111110]"
              style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
            >
              Owner Administration
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#4A4843]">
              Real-time sales telemetry, ticket throughput, and live catalog configuration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleResetStore}
              className="inline-flex items-center gap-1.5 border border-[#111110] bg-[#FFFFFF] px-3.5 py-2 text-xs font-mono font-semibold uppercase text-[#111110] hover:bg-[#EFECE3] transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#E02E24]" />
              <span>Reset Demo Seed</span>
            </button>
            <a
              href="/queue"
              className="inline-flex items-center gap-1.5 bg-[#111110] px-3.5 py-2 text-xs font-mono font-semibold uppercase text-[#F8F6F0] hover:bg-[#E02E24] transition-colors"
            >
              <span>Open Kitchen KDS</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {resetFeedback && (
          <div className="mx-auto max-w-[1440px] mt-4 p-3 bg-[#DCFCE7] border border-[#15803D] text-xs text-[#15803D] font-mono font-semibold flex items-center gap-2">
            <Check className="h-4 w-4" />
            {resetFeedback}
          </div>
        )}

        {/* View Switcher Tabs */}
        <div className="mx-auto max-w-[1440px] mt-6 flex border-b border-[#D4D0C5] gap-4">
          {[
            { id: 'overview', label: 'Sales Telemetry' },
            { id: 'orders', label: `Orders Log (${orders.length})` },
            { id: 'menu', label: `Catalog & Pricing (${menuItems.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-3 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#E02E24] text-[#111110]'
                  : 'border-transparent text-[#4A4843] hover:text-[#111110]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Areas */}
      <main className="mx-auto max-w-[1440px] px-4 md:px-8 py-6 space-y-8">
        {/* TAB 1: OVERVIEW & TELEMETRY */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top 4 KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-[#111110] bg-[#FFFFFF] p-5 flex flex-col justify-between">
                <span className="font-mono text-xs uppercase text-[#4A4843] flex items-center justify-between">
                  <span>Gross Sales</span>
                  <DollarSign className="h-4 w-4 text-[#15803D]" />
                </span>
                <div className="mt-3">
                  <span
                    className="text-3xl font-bold tracking-tight text-[#111110] tabular-nums"
                    style={{
                      fontFamily: 'var(--font-fraunces), Georgia, serif',
                      fontVariationSettings: revenueAxes.fontVariationSettings,
                    }}
                  >
                    ${metrics ? metrics.grossRevenue.toFixed(2) : '0.00'}
                  </span>
                  <p className="mt-1 font-mono text-xs text-[#15803D]">
                    Active settled & in-flight
                  </p>
                </div>
              </div>

              <div className="border border-[#111110] bg-[#FFFFFF] p-5 flex flex-col justify-between">
                <span className="font-mono text-xs uppercase text-[#4A4843] flex items-center justify-between">
                  <span>Total Volume</span>
                  <ShoppingBag className="h-4 w-4 text-[#111110]" />
                </span>
                <div className="mt-3">
                  <span
                    className="text-3xl font-bold tracking-tight text-[#111110] tabular-nums"
                    style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                  >
                    {metrics?.totalOrders || 0}
                  </span>
                  <p className="mt-1 font-mono text-xs text-[#4A4843]">
                    Tickets received today
                  </p>
                </div>
              </div>

              <div className="border border-[#111110] bg-[#FFFFFF] p-5 flex flex-col justify-between">
                <span className="font-mono text-xs uppercase text-[#4A4843] flex items-center justify-between">
                  <span>Average Order Value</span>
                  <TrendingUp className="h-4 w-4 text-[#E02E24]" />
                </span>
                <div className="mt-3">
                  <span
                    className="text-3xl font-bold tracking-tight text-[#111110] tabular-nums"
                    style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                  >
                    ${metrics ? metrics.averageOrderValue.toFixed(2) : '0.00'}
                  </span>
                  <p className="mt-1 font-mono text-xs text-[#4A4843]">
                    Per ticket spend
                  </p>
                </div>
              </div>

              <div className="border border-[#111110] bg-[#FFFFFF] p-5 flex flex-col justify-between">
                <span className="font-mono text-xs uppercase text-[#4A4843] flex items-center justify-between">
                  <span>In-Flight Queue</span>
                  <Clock className="h-4 w-4 text-[#B45309]" />
                </span>
                <div className="mt-3">
                  <span
                    className="text-3xl font-bold tracking-tight text-[#111110] tabular-nums"
                    style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                  >
                    {metrics?.activeOrders || 0}
                  </span>
                  <p className="mt-1 font-mono text-xs text-[#B45309]">
                    Pending, prep, or staged
                  </p>
                </div>
              </div>
            </div>

            {/* Split Section: Top Selling Items + Quick Operations Guide */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Leaderboard */}
              <div className="lg:col-span-7 border border-[#111110] bg-[#FFFFFF] p-5">
                <h2
                  className="text-xl font-bold tracking-tight text-[#111110] mb-4"
                  style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                >
                  Best-Selling Products
                </h2>
                <div className="divide-y divide-[#D4D0C5]">
                  {metrics?.topSellingItems && metrics.topSellingItems.length > 0 ? (
                    metrics.topSellingItems.map((item, idx) => (
                      <div
                        key={item.name}
                        className="py-3 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-xs text-[#4A4843] w-5">
                            0{idx + 1}
                          </span>
                          <div>
                            <span className="font-semibold text-sm text-[#111110]">
                              {item.name}
                            </span>
                            <span className="font-mono text-xs text-[#4A4843] block">
                              {item.quantity} orders fulfilled
                            </span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-sm text-[#111110] tabular-nums">
                          ${item.revenue.toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs font-mono text-[#4A4843] py-4">
                      No order data recorded yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Architecture & Multi-Tab Showcase Note */}
              <div className="lg:col-span-5 border border-[#111110] bg-[#F8F6F0] p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase font-bold text-[#E02E24]">
                    <Layers className="h-4 w-4" />
                    <span>Portfolio Architecture Spec</span>
                  </div>
                  <h3
                    className="text-lg font-bold text-[#111110]"
                    style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                  >
                    Reactive Simulation Proof
                  </h3>
                  <p className="mt-2 text-xs text-[#4A4843] leading-relaxed">
                    This platform uses a <strong>LocalStorageBroadcastAdapter</strong> adhering to formal domain service contracts (<code>IOrderService</code>, <code>IMenuService</code>, <code>ILoyaltyService</code>).
                  </p>
                  <ul className="mt-3 space-y-2 text-xs text-[#4A4843]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#15803D] font-bold">✓</span>
                      <span>
                        Open <strong>/</strong> in one tab and <strong>/queue</strong> in another. Submitting an order triggers cross-tab ingestion without page reload.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#15803D] font-bold">✓</span>
                      <span>
                        Updating a price in the <strong>Catalog</strong> tab below immediately updates prices on the customer ordering menu.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-[#D4D0C5] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#4A4843]">Storage Mode:</span>
                  <span className="font-bold text-[#15803D]">
                    BroadcastChannel (Active)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS AUDIT LOG */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border border-[#D4D0C5] bg-[#FFFFFF] p-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#4A4843]" />
                <input
                  type="text"
                  placeholder="Filter by ticket ID or customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#D4D0C5] bg-[#F8F6F0] focus:border-[#111110] focus:outline-hidden"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 overflow-x-auto text-xs font-mono">
                {[
                  'all',
                  'pending',
                  'accepted',
                  'preparing',
                  'ready',
                  'completed',
                  'cancelled',
                ].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-2.5 py-1 uppercase font-semibold border transition-colors cursor-pointer ${
                      orderStatusFilter === st
                        ? 'border-[#111110] bg-[#111110] text-[#F8F6F0]'
                        : 'border-[#D4D0C5] bg-[#FFFFFF] text-[#4A4843] hover:border-[#111110]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="border border-[#111110] bg-[#FFFFFF] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111110] text-[#F8F6F0] font-mono uppercase text-xs">
                  <tr>
                    <th className="p-3">Ticket ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Items</th>
                    <th className="p-3">Schedule</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4D0C5]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#4A4843] font-mono">
                        No orders match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#F8F6F0] transition-colors">
                        <td className="p-3 font-mono font-bold text-[#111110]">
                          {order.id}
                        </td>
                        <td className="p-3">
                          <span className="font-semibold block text-[#111110]">
                            {order.customerName}
                          </span>
                          <span className="text-xs font-mono text-[#4A4843]">
                            {order.customerPhone}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="space-y-0.5">
                            {order.items.map((i) => (
                              <div key={i.id} className="text-xs">
                                {i.quantity}x {i.name}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-xs text-[#4A4843]">
                          {order.pickupSlot}
                        </td>
                        <td className="p-3 font-mono font-bold text-sm text-[#111110] tabular-nums">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="p-3 font-mono uppercase text-xs">
                          <span
                            className={`px-2 py-0.5 font-bold ${
                              order.status === 'completed'
                                ? 'bg-[#DCFCE7] text-[#15803D]'
                                : order.status === 'ready'
                                ? 'bg-[#15803D] text-[#FFFFFF]'
                                : order.status === 'pending'
                                ? 'bg-[#FDF2F2] text-[#E02E24]'
                                : 'bg-[#EFECE3] text-[#111110]'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-xs">
                          <span
                            className={`font-semibold uppercase ${
                              order.paymentStatus === 'paid_at_pickup'
                                ? 'text-[#15803D]'
                                : 'text-[#B45309]'
                            }`}
                          >
                            {order.paymentStatus === 'paid_at_pickup' ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MENU & PRICING CRUD */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border border-[#D4D0C5] bg-[#FFFFFF] p-4">
              <div>
                <h2
                  className="text-lg font-bold text-[#111110]"
                  style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                >
                  Live Catalog &amp; Pricing Engine
                </h2>
                <p className="text-xs text-[#4A4843]">
                  Double-click or click Edit Price to test reactive price updates across tabs.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 bg-[#E02E24] hover:bg-[#B82219] text-[#F8F6F0] px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="border border-[#111110] bg-[#FFFFFF] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111110] text-[#F8F6F0] font-mono uppercase text-xs">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Base Price</th>
                    <th className="p-3">Availability</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4D0C5]">
                  {menuItems.map((item) => {
                    const isEditing = editingItemId === item.id;

                    return (
                      <tr key={item.id} className="hover:bg-[#F8F6F0] transition-colors">
                        <td className="p-3">
                          <span className="font-semibold text-sm text-[#111110] block">
                            {item.name}
                          </span>
                          <span className="text-xs text-[#4A4843] line-clamp-1">
                            {item.description}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-xs uppercase text-[#4A4843]">
                          {item.categorySlug}
                        </td>
                        <td className="p-3 font-mono text-sm font-bold text-[#111110]">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <span>$</span>
                              <input
                                type="number"
                                step="0.25"
                                value={tempPrice}
                                onChange={(e) => setTempPrice(e.target.value)}
                                className="w-20 p-1 text-xs border border-[#111110] bg-[#FFFFFF]"
                                autoFocus
                              />
                              <button
                                onClick={() => handleUpdatePrice(item.id)}
                                className="p-1 bg-[#15803D] text-[#FFFFFF] hover:bg-[#166534] transition-colors"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <span>${item.basePrice.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-xs">
                          <button
                            onClick={() => handleToggleStock(item.id, item.isAvailable)}
                            className={`px-2.5 py-1 uppercase font-bold border transition-colors cursor-pointer ${
                              item.isAvailable
                                ? 'border-[#15803D] bg-[#DCFCE7] text-[#15803D]'
                                : 'border-[#E02E24] bg-[#FDF2F2] text-[#E02E24]'
                            }`}
                          >
                            {item.isAvailable ? 'In Stock' : '86\'d (Sold Out)'}
                          </button>
                        </td>
                        <td className="p-3 text-right font-mono">
                          {isEditing ? (
                            <button
                              onClick={() => setEditingItemId(null)}
                              className="text-[#4A4843] hover:text-[#111110] underline"
                            >
                              Cancel
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingItemId(item.id);
                                setTempPrice(item.basePrice.toString());
                              }}
                              className="text-[#111110] hover:text-[#E02E24] font-semibold underline"
                            >
                              Edit Price
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#111110] text-[#111110] p-6 shadow-2xl">
            <h2
              className="text-xl font-bold tracking-tight text-[#111110] mb-4"
              style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
            >
              Add New Menu Item
            </h2>

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono uppercase font-semibold mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Kyoto Cold Drip Reserve"
                  className="w-full p-2 border border-[#D4D0C5] bg-[#F8F6F0]"
                />
              </div>

              <div>
                <label className="block font-mono uppercase font-semibold mb-1">
                  Category
                </label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full p-2 border border-[#D4D0C5] bg-[#F8F6F0]"
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono uppercase font-semibold mb-1">
                  Base Price (USD)
                </label>
                <input
                  type="number"
                  step="0.25"
                  required
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="w-full p-2 border border-[#D4D0C5] bg-[#F8F6F0]"
                />
              </div>

              <div>
                <label className="block font-mono uppercase font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="Tasting notes and origins..."
                  className="w-full p-2 border border-[#D4D0C5] bg-[#F8F6F0]"
                />
              </div>

              <div className="pt-3 border-t border-[#D4D0C5] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#D4D0C5] hover:bg-[#EFECE3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E02E24] text-[#F8F6F0] font-semibold hover:bg-[#B82219]"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
