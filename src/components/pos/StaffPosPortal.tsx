'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  QrCode,
  CheckCircle2,
  UserCheck,
  RotateCcw,
  Camera,
  ClipboardPaste,
  Eye,
  Check,
  Clock,
  Layers,
  Settings,
  X,
} from 'lucide-react';
import { BrewFlowLogo } from '@/components/ui/BrewFlowLogo';
import { orderService } from '@/lib/services/brewflowService';
import { Order, OrderStatus } from '@/lib/domain/types';
import { INITIAL_ORDERS } from '@/lib/storage/seedData';
import {
  configureFoundryStatusBar,
  readTextWithCapacitor,
  triggerFoundryHaptic,
} from '@/lib/capacitor/nativeBridge';

interface ScanPreviewResult {
  mode: 'allocate' | 'redeem';
  qr_payload: string;
  expires_at?: number;
  customer: {
    id: number;
    name: string;
    email: string;
    firebase_uid: string;
    current_points: number;
  };
  reward?: {
    id: number;
    name: string;
    description: string | null;
    points_required: number;
  };
}

export function StaffPosPortal() {
  const [activeTab, setActiveTab] = useState<'orders' | 'scan' | 'menu' | 'settings'>('orders');
  const [queueFilter, setQueueFilter] = useState<'active' | 'completed' | 'all'>('active');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Scanner state
  const [qrInput, setQrInput] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState<ScanPreviewResult | null>(null);
  const [amountInput, setAmountInput] = useState('180');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    configureFoundryStatusBar('#111827', 'light');
    async function fetchOrders() {
      try {
        const liveOrders = await orderService.getOrders();
        if (liveOrders && liveOrders.length > 0) {
          setOrders(liveOrders);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchOrders();

    const unsub = orderService.subscribe((event) => {
      if (event.type === 'ORDER_STATUS_CHANGED' || event.type === 'ORDER_CREATED') {
        fetchOrders();
      }
    });
    return () => unsub();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    await triggerFoundryHaptic('medium');
    await orderService.updateOrderStatus(orderId, nextStatus, 'Jan Santos (Staff)');
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
  };

  const handleScanLookup = async (payloadOverride?: string) => {
    const payload = (payloadOverride ?? qrInput).trim();
    if (!payload) {
      setError('Enter or paste customer QR or identifier.');
      return;
    }

    setScanning(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/v1/staff/scan-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_payload: payload }),
      });
      const json = await res.json();
      if (!res.ok) {
        await triggerFoundryHaptic('error');
        setError(json.message ?? 'Invalid or expired QR token.');
        return;
      }
      await triggerFoundryHaptic('light');
      setPreview(json.data);
      setQrInput(payload);
    } catch {
      await triggerFoundryHaptic('error');
      setError('Network error verifying QR.');
    } finally {
      setScanning(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!preview) return;
    setSubmitting(true);
    setError(null);

    try {
      if (preview.mode === 'allocate') {
        const res = await fetch('/api/v1/points/allocate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            qr_payload: preview.qr_payload,
            amount: parseFloat(amountInput) || 150,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        await triggerFoundryHaptic('success');
        setSuccessMessage(`Successfully allocated points to ${preview.customer.name}!`);
      } else {
        const res = await fetch('/api/v1/staff/redemptions/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qr_payload: preview.qr_payload }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        await triggerFoundryHaptic('success');
        setSuccessMessage(`Confirmed redemption for ${preview.customer.name}!`);
      }
      setPreview(null);
      setQrInput('');
    } catch (err: any) {
      await triggerFoundryHaptic('error');
      setError(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter queue
  const filteredOrders = orders.filter((o) => {
    if (queueFilter === 'active') {
      return o.status === 'pending' || o.status === 'preparing' || o.status === 'ready';
    }
    if (queueFilter === 'completed') {
      return o.status === 'completed';
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'preparing':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEDD5] text-[#EA580C]">
            Preparing
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#D97706]">
            Pending
          </span>
        );
      case 'ready':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#15803D]">
            Ready
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F3EFEA] text-[#6B7280]">
            Completed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F3EFEA] text-[#6B7280]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[780px] rounded-3xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-md overflow-hidden">
      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (Dark Charcoal / Forest Green)           */}
      {/* ========================================================= */}
      <aside className="w-full lg:w-64 bg-[#111827] text-white p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="px-2">
            <BrewFlowLogo size="md" variant="light" />
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeTab === 'orders'
                  ? 'bg-[#133E2B] text-white'
                  : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Orders</span>
            </button>

            <button
              onClick={() => setActiveTab('scan')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeTab === 'scan'
                  ? 'bg-[#133E2B] text-white'
                  : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'
              }`}
            >
              <QrCode className="h-4 w-4" />
              <span>Scan</span>
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeTab === 'menu'
                  ? 'bg-[#133E2B] text-white'
                  : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Menu</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeTab === 'settings'
                  ? 'bg-[#133E2B] text-white'
                  : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Staff Profile Card (Jan Santos) */}
        <div className="pt-4 border-t border-white/10 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#133E2B] text-white font-bold text-xs">
            JS
          </div>
          <div>
            <div className="text-xs font-bold text-white">Jan Santos</div>
            <div className="text-[11px] text-[#9CA3AF]">Staff Barista</div>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MIDDLE AREA: ORDER QUEUE (Showcase Middle-Left)        */}
      {/* ========================================================= */}
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6 bg-[#FFFFFF]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
            Order Queue
          </h2>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#F3EFEA]">
            <button
              onClick={() => setQueueFilter('active')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                queueFilter === 'active'
                  ? 'bg-[#FFFFFF] text-[#111827] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Active ({orders.filter((o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready').length})
            </button>
            <button
              onClick={() => setQueueFilter('completed')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                queueFilter === 'completed'
                  ? 'bg-[#FFFFFF] text-[#111827] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setQueueFilter('all')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                queueFilter === 'all'
                  ? 'bg-[#FFFFFF] text-[#111827] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Orders Table Rows */}
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 text-sm text-[#9CA3AF]">
              No orders found in this queue.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
              const elapsedMins = Math.max(
                1,
                Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000)
              );

              return (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#D1D5DB] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-sm text-[#111827] w-14">
                      #{order.id}
                    </span>
                    <span className="text-xs text-[#6B7280] w-20">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                    <span className="text-xs font-bold text-[#111827] w-16">
                      P{order.total}
                    </span>
                    <span className="text-xs text-[#9CA3AF] w-24">
                      {elapsedMins} min ago
                    </span>
                  </div>

                  <div className="flex items-center gap-3 justify-end">
                    {getStatusBadge(order.status)}

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3.5 py-1.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#111827] hover:bg-[#F3EFEA] transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. RIGHT PANEL: SCAN CUSTOMER QR (Showcase Middle-Right)  */}
      {/* ========================================================= */}
      <div className="w-full lg:w-96 bg-[#F8F6F0] p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-[#E5E7EB] flex flex-col justify-between shrink-0 space-y-6">
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#111827]">
            Scan Customer QR
          </h3>

          {/* Viewfinder Target Frame */}
          <div className="relative aspect-square w-full rounded-3xl bg-[#FFFFFF] border-2 border-dashed border-[#D1D5DB] flex flex-col items-center justify-center p-6 text-center shadow-xs">
            {/* Corner Brackets Visual */}
            <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-[#133E2B] rounded-tl-lg" />
            <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-[#133E2B] rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-[#133E2B] rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-[#133E2B] rounded-br-lg" />

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F3EE] text-[#133E2B] mb-3">
              <QrCode className="h-8 w-8" />
            </div>

            <p className="text-xs text-[#6B7280] max-w-[200px] leading-relaxed">
              Scan customer&apos;s dynamic QR code to allocate points or redeem rewards.
            </p>
          </div>

          {/* Manual Input Fallback */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Or paste QR payload / UID"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#E5E7EB] bg-white text-[#111827] focus:border-[#133E2B] focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => handleScanLookup()}
                disabled={scanning}
                className="px-3.5 py-2 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-[#133E2B] transition-colors cursor-pointer"
              >
                {scanning ? '...' : 'Verify'}
              </button>
            </div>

            {error && (
              <p className="text-xs text-[#EF4444]">{error}</p>
            )}
            {successMessage && (
              <p className="text-xs text-[#15803D] font-semibold">{successMessage}</p>
            )}
          </div>
        </div>

        {/* Scan Actions & Open Camera Button */}
        <div className="space-y-3 pt-4">
          <button
            type="button"
            onClick={() => handleScanLookup('brewpoints://allocate/cst-demo')}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-[#133E2B] hover:bg-[#0E2E20] text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer"
          >
            <Camera className="h-4 w-4" />
            <span>Open Camera</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. MODAL: VIEW ORDER DETAILS & ADVANCE STATUS             */}
      {/* ========================================================= */}
      {selectedOrder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-lg bg-[#FFFFFF] rounded-3xl p-6 shadow-2xl space-y-6 border border-[#E5E7EB]">
            <div className="flex items-center justify-between pb-4 border-b border-[#F3EFEA]">
              <div>
                <h3 className="text-lg font-bold text-[#111827]">
                  Order #{selectedOrder.id}
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Customer: {selectedOrder.customerName} ({selectedOrder.customerPhone})
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3EFEA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#111827]">
                      {item.quantity}x {item.name}
                    </span>
                    {item.selectedOptions.length > 0 && (
                      <p className="text-[11px] text-[#6B7280]">
                        {item.selectedOptions.map((o) => o.optionName).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-[#111827]">
                    P{item.lineTotal}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#F3EFEA] flex justify-between items-center text-sm font-bold text-[#111827]">
              <span>Total Amount</span>
              <span>P{selectedOrder.total}</span>
            </div>

            {/* Advance Status Controls */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-[#6B7280]">
                Update Order Status:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'preparing')}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    selectedOrder.status === 'preparing'
                      ? 'border-[#EA580C] bg-[#FFEDD5] text-[#EA580C]'
                      : 'border-[#E5E7EB] hover:bg-[#F3EFEA]'
                  }`}
                >
                  Preparing
                </button>
                <button
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'ready')}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    selectedOrder.status === 'ready'
                      ? 'border-[#15803D] bg-[#DCFCE7] text-[#15803D]'
                      : 'border-[#E5E7EB] hover:bg-[#F3EFEA]'
                  }`}
                >
                  Ready
                </button>
                <button
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'completed')}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    selectedOrder.status === 'completed'
                      ? 'border-[#111827] bg-[#111827] text-white'
                      : 'border-[#E5E7EB] hover:bg-[#F3EFEA]'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
