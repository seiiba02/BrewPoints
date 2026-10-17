'use client';

import { useState, useEffect, useTransition } from 'react';
import { Order, OrderStatus, MenuItem } from '@/lib/domain/types';
import { orderService, menuService } from '@/lib/services/brewflowService';
import {
  Clock,
  Coffee,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  X,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export function BaristaQueuePortal() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [recentBumpId, setRecentBumpId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Web Audio synthesizer for incoming order chime
  const playChime = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const now = audioCtx.currentTime;

      // Note 1 (E5 - 659.25 Hz)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Note 2 (B5 - 987.77 Hz)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.frequency.setValueAtTime(987.77, now + 0.12);
      gain2.gain.setValueAtTime(0.15, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  useEffect(() => {
    async function loadInitial() {
      const [allOrders, items] = await Promise.all([
        orderService.getOrders(),
        menuService.getMenuItems(),
      ]);
      setOrders(allOrders);
      setMenuItems(items);
    }
    loadInitial();

    // Subscribe to cross-tab updates
    const unsubscribe = orderService.subscribe((event) => {
      startTransition(async () => {
        if (event.type === 'ORDER_CREATED') {
          setOrders((prev) => [event.order, ...prev.filter((o) => o.id !== event.order.id)]);
          playChime();
        } else if (event.type === 'ORDER_STATUS_CHANGED') {
          setOrders((prev) =>
            prev.map((o) => (o.id === event.orderId ? event.order : o))
          );
        } else if (event.type === 'MENU_ITEM_TOGGLED') {
          setMenuItems((prev) =>
            prev.map((item) =>
              item.id === event.itemId
                ? { ...item, isAvailable: event.isAvailable }
                : item
            )
          );
        } else if (event.type === 'STORE_RESET') {
          const [refreshedOrders, refreshedItems] = await Promise.all([
            orderService.getOrders(),
            menuService.getMenuItems(),
          ]);
          setOrders(refreshedOrders);
          setMenuItems(refreshedItems);
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [soundEnabled]);

  const handleBumpStatus = async (
    orderId: string,
    nextStatus: OrderStatus,
    note?: string
  ) => {
    setRecentBumpId(orderId);
    setTimeout(() => setRecentBumpId(null), 1200);

    const updated = await orderService.updateOrderStatus(
      orderId,
      nextStatus,
      note || `Barista bumped to ${nextStatus}`,
      'barista'
    );
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
  };

  const handleToggleStock = async (itemId: string, current: boolean) => {
    const updated = await menuService.toggleItemAvailability(itemId, !current);
    setMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? updated : item))
    );
  };

  // Group orders into columns
  const incoming = orders.filter((o) => o.status === 'pending');
  const inPrep = orders.filter(
    (o) => o.status === 'accepted' || o.status === 'preparing'
  );
  const ready = orders.filter((o) => o.status === 'ready');
  const completed = orders.filter((o) => o.status === 'completed').slice(0, 5);

  const formatElapsed = (isoDate: string) => {
    const diffMin = Math.round((Date.now() - new Date(isoDate).getTime()) / 60000);
    if (diffMin <= 0) return 'Just now';
    if (diffMin === 1) return '1m ago';
    return `${diffMin}m ago`;
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#111110] flex flex-col">
      {/* KDS Header Bar */}
      <header className="border-b border-[#2C2B29] bg-[#111110] text-[#F8F6F0] px-4 md:px-8 py-4 sticky top-16 z-30">
        <div className="mx-auto max-w-[1720px] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center bg-[#E02E24] text-[#F8F6F0]">
              <Coffee className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className="text-lg md:text-xl font-bold tracking-tight"
                  style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                >
                  Kitchen Display System (KDS)
                </h1>
                <span className="font-mono text-xs px-2 py-0.5 border border-[#3D3B37] bg-[#1A1918] text-[#15803D] uppercase font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#15803D] animate-pulse" />
                  Live Reactive Bus
                </span>
              </div>
              <p className="text-xs text-[#D4D0C5] hidden sm:block">
                Incoming orders sync automatically via BroadcastChannel without refresh.
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSoundEnabled((v) => !v)}
              className="flex items-center gap-1.5 border border-[#3D3B37] bg-[#1A1918] px-3 py-1.5 text-xs font-mono text-[#D4D0C5] hover:text-[#F8F6F0] hover:bg-[#2C2B29] transition-colors cursor-pointer"
              title={soundEnabled ? 'Chime sound is active' : 'Chime sound is muted'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-[#15803D]" />
                  <span>Chime On</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-[#E02E24]" />
                  <span>Muted</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsStockModalOpen(true)}
              className="flex items-center gap-1.5 border border-[#3D3B37] bg-[#1A1918] px-3.5 py-1.5 text-xs font-mono font-semibold text-[#F8F6F0] hover:bg-[#E02E24] hover:border-[#E02E24] transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>86 / Stock Manager</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main KDS Board Grid */}
      <main className="flex-1 p-4 md:p-6 overflow-x-auto">
        <div className="mx-auto max-w-[1720px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 min-w-[320px]">
          {/* COLUMN 1: INCOMING TICKETS */}
          <section className="flex flex-col bg-[#EFECE3] border border-[#111110] p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4D0C5] mb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 bg-[#E02E24] inline-block" />
                <h2 className="font-mono text-xs uppercase font-bold tracking-wider text-[#111110]">
                  Incoming Tickets
                </h2>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#111110] text-[#F8F6F0]">
                {incoming.length}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[78vh] pr-1">
              {incoming.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#D4D0C5] bg-[#F8F6F0]">
                  <p className="text-xs font-mono uppercase text-[#4A4843]">
                    No pending orders
                  </p>
                </div>
              ) : (
                incoming.map((order) => (
                  <TicketCard
                    key={order.id}
                    order={order}
                    formatElapsed={formatElapsed}
                    isHighlighted={recentBumpId === order.id}
                    actions={
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#D4D0C5]">
                        <button
                          onClick={() => handleBumpStatus(order.id, 'cancelled', 'Rejected by staff')}
                          className="px-2 py-2 text-xs font-mono font-medium border border-[#D4D0C5] text-[#4A4843] hover:text-[#E02E24] hover:border-[#E02E24] bg-[#FFFFFF] transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleBumpStatus(order.id, 'accepted', 'Accepted into brew queue')}
                          className="px-3 py-2 text-xs font-semibold bg-[#E02E24] hover:bg-[#B82219] text-[#F8F6F0] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Accept Ticket</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    }
                  />
                ))
              )}
            </div>
          </section>

          {/* COLUMN 2: IN PREPARATION */}
          <section className="flex flex-col bg-[#EFECE3] border border-[#111110] p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4D0C5] mb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 bg-[#B45309] inline-block" />
                <h2 className="font-mono text-xs uppercase font-bold tracking-wider text-[#111110]">
                  In Preparation
                </h2>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#111110] text-[#F8F6F0]">
                {inPrep.length}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[78vh] pr-1">
              {inPrep.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#D4D0C5] bg-[#F8F6F0]">
                  <p className="text-xs font-mono uppercase text-[#4A4843]">
                    Espresso bar clear
                  </p>
                </div>
              ) : (
                inPrep.map((order) => (
                  <TicketCard
                    key={order.id}
                    order={order}
                    formatElapsed={formatElapsed}
                    isHighlighted={recentBumpId === order.id}
                    actions={
                      <div className="mt-3 pt-3 border-t border-[#D4D0C5]">
                        <button
                          onClick={() => handleBumpStatus(order.id, 'ready', 'Staged on pickup counter')}
                          className="w-full px-3 py-2 text-xs font-semibold bg-[#111110] hover:bg-[#15803D] text-[#F8F6F0] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <PackageCheck className="h-4 w-4" />
                          <span>Mark Ready on Counter</span>
                        </button>
                      </div>
                    }
                  />
                ))
              )}
            </div>
          </section>

          {/* COLUMN 3: READY FOR PICKUP */}
          <section className="flex flex-col bg-[#EFECE3] border border-[#111110] p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4D0C5] mb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 bg-[#15803D] inline-block" />
                <h2 className="font-mono text-xs uppercase font-bold tracking-wider text-[#111110]">
                  Ready on Counter
                </h2>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#15803D] text-[#FFFFFF]">
                {ready.length}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[78vh] pr-1">
              {ready.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#D4D0C5] bg-[#F8F6F0]">
                  <p className="text-xs font-mono uppercase text-[#4A4843]">
                    No staged drinks
                  </p>
                </div>
              ) : (
                ready.map((order) => (
                  <TicketCard
                    key={order.id}
                    order={order}
                    formatElapsed={formatElapsed}
                    isHighlighted={recentBumpId === order.id}
                    actions={
                      <div className="mt-3 pt-3 border-t border-[#D4D0C5]">
                        <button
                          onClick={() => handleBumpStatus(order.id, 'completed', 'Customer picked up & settled')}
                          className="w-full px-3 py-2 text-xs font-semibold bg-[#15803D] hover:bg-[#166534] text-[#FFFFFF] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Hand Over & Settle (${order.total.toFixed(2)})</span>
                        </button>
                      </div>
                    }
                  />
                ))
              )}
            </div>
          </section>

          {/* COLUMN 4: COMPLETED TICKETS */}
          <section className="flex flex-col bg-[#EFECE3] border border-[#D4D0C5] p-4 opacity-85">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4D0C5] mb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 bg-[#4A4843] inline-block" />
                <h2 className="font-mono text-xs uppercase font-bold tracking-wider text-[#4A4843]">
                  Completed (Last 5)
                </h2>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#FFFFFF] border border-[#D4D0C5] text-[#4A4843]">
                {completed.length}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[78vh] pr-1">
              {completed.map((order) => (
                <div
                  key={order.id}
                  className="border border-[#D4D0C5] bg-[#FFFFFF] p-3 text-xs space-y-1.5"
                >
                  <div className="flex justify-between items-baseline font-mono text-xs">
                    <span className="font-bold text-[#111110]">{order.id}</span>
                    <span className="text-[#4A4843]">{formatElapsed(order.createdAt)}</span>
                  </div>
                  <div className="font-medium text-[#111110]">{order.customerName}</div>
                  <div className="flex justify-between text-xs font-mono text-[#4A4843] pt-1 border-t border-[#EFECE3]">
                    <span>{order.items.length} items</span>
                    <span className="font-bold text-[#15803D]">${order.total.toFixed(2)} Paid</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Quick 86 / Stock Management Modal */}
      {isStockModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="stock-manager-heading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-xl max-h-[85vh] flex flex-col bg-[#FFFFFF] border border-[#111110] text-[#111110] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D4D0C5] bg-[#F8F6F0] px-5 py-4">
              <div>
                <h2
                  id="stock-manager-heading"
                  className="text-lg font-bold tracking-tight text-[#111110]"
                  style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                >
                  Quick 86 / Inventory Availability
                </h2>
                <p className="text-xs text-[#4A4843] mt-0.5">
                  Toggling an item instantly updates the customer ordering menu in real time.
                </p>
              </div>
              <button
                onClick={() => setIsStockModalOpen(false)}
                className="p-1 text-[#4A4843] hover:text-[#111110] hover:bg-[#EFECE3] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#D4D0C5]">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="font-semibold text-xs text-[#111110] block">
                      {item.name}
                    </span>
                    <span className="font-mono text-xs text-[#4A4843]">
                      ${item.basePrice.toFixed(2)} · {item.categorySlug}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleStock(item.id, item.isAvailable)}
                    className={`px-3 py-1.5 font-mono text-xs font-bold uppercase transition-colors cursor-pointer border ${
                      item.isAvailable
                        ? 'border-[#15803D] bg-[#DCFCE7] text-[#15803D] hover:bg-[#FDF2F2] hover:border-[#E02E24] hover:text-[#E02E24]'
                        : 'border-[#E02E24] bg-[#FDF2F2] text-[#E02E24] hover:bg-[#DCFCE7] hover:border-[#15803D] hover:text-[#15803D]'
                    }`}
                  >
                    {item.isAvailable ? '✓ In Stock' : '✗ 86\'d (Sold Out)'}
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-[#D4D0C5] bg-[#F8F6F0] p-4 text-right">
              <button
                onClick={() => setIsStockModalOpen(false)}
                className="px-4 py-2 bg-[#111110] text-[#F8F6F0] text-xs font-semibold hover:bg-[#E02E24] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Kitchen Ticket Card
function TicketCard({
  order,
  formatElapsed,
  isHighlighted,
  actions,
}: {
  order: Order;
  formatElapsed: (isoDate: string) => string;
  isHighlighted: boolean;
  actions: React.ReactNode;
}) {
  return (
    <article
      className={`border bg-[#FFFFFF] p-4 transition-all duration-300 ${
        isHighlighted
          ? 'border-[#E02E24] ring-2 ring-[#E02E24]'
          : 'border-[#111110] shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#D4D0C5] pb-2 mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-sm font-bold text-[#111110]">
              {order.id}
            </span>
            <span className="font-mono text-xs px-1.5 py-0.5 bg-[#111110] text-[#F8F6F0] uppercase">
              {order.status}
            </span>
          </div>
          <span className="text-xs font-bold text-[#111110] block mt-0.5">
            {order.customerName}
          </span>
        </div>

        <div className="text-right font-mono text-xs text-[#4A4843]">
          <span className="block font-medium">{formatElapsed(order.createdAt)}</span>
          <span className="text-xs text-[#E02E24] font-semibold block">
            {order.pickupSlot}
          </span>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2 py-1">
        {order.items.map((item) => (
          <div key={item.id} className="text-xs">
            <div className="flex items-baseline justify-between font-semibold text-[#111110]">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span className="font-mono tabular-nums text-xs text-[#4A4843]">
                ${item.lineTotal.toFixed(2)}
              </span>
            </div>

            {item.selectedOptions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.selectedOptions.map((opt) => (
                  <span
                    key={opt.optionId}
                    className="inline-block text-xs font-mono px-1 py-0.5 bg-[#EFECE3] border border-[#D4D0C5] text-[#4A4843]"
                  >
                    {opt.optionName}
                  </span>
                ))}
              </div>
            )}

            {item.specialInstructions && (
              <p className="mt-1 text-xs italic text-[#E02E24] font-medium">
                Note: {item.specialInstructions}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Footer Settlement & Actions */}
      <div className="mt-2 pt-2 border-t border-[#D4D0C5] flex items-center justify-between font-mono text-xs text-[#4A4843]">
        <span>Due at Counter</span>
        <span className="font-bold text-sm text-[#111110] tabular-nums">
          ${order.total.toFixed(2)}
        </span>
      </div>

      {actions}
    </article>
  );
}
