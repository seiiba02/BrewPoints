'use client';

import { Order, OrderStatus } from '@/lib/domain/types';
import {
  Clock,
  Coffee,
  CheckCircle,
  PackageCheck,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface OrderLiveTrackerProps {
  order: Order;
  onDismiss: () => void;
}

const STAGES: Array<{ status: OrderStatus; label: string; icon: typeof Clock }> = [
  { status: 'pending', label: 'Ticket Received', icon: Clock },
  { status: 'accepted', label: 'Accepted by Barista', icon: CheckCircle },
  { status: 'preparing', label: 'Brewing & Crafting', icon: Coffee },
  { status: 'ready', label: 'Ready on Counter', icon: PackageCheck },
  { status: 'completed', label: 'Order Completed', icon: ShieldCheck },
];

export function OrderLiveTracker({ order, onDismiss }: OrderLiveTrackerProps) {
  const currentStageIndex = STAGES.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="rounded-3xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-sm text-[#111827] overflow-hidden">
      {/* Live Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F3EFEA] bg-[#111827] text-white px-6 py-4 gap-3">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                order.status === 'ready'
                  ? 'bg-[#15803D]'
                  : order.status === 'completed'
                  ? 'bg-[#6B7280]'
                  : 'bg-[#EA580C]'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                order.status === 'ready'
                  ? 'bg-[#15803D]'
                  : order.status === 'completed'
                  ? 'bg-[#6B7280]'
                  : 'bg-[#EA580C]'
              }`}
            />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#9CA3AF]">
                Active Pickup Ticket
              </span>
              <span className="text-sm font-bold text-white">
                #{order.id}
              </span>
            </div>
            <p className="text-xs text-[#D1D5DB] mt-0.5">
              Pickup Slot: <strong className="text-white">{order.pickupSlot}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-right">
            <span className="text-[#9CA3AF] block">Customer</span>
            <span className="font-bold text-white">{order.customerName}</span>
          </div>
          <button
            onClick={onDismiss}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            Close Tracker
          </button>
        </div>
      </div>

      {/* Multi-Stage Stepper */}
      <div className="p-6 bg-[#F8F6F0] border-b border-[#E5E7EB]">
        {isCancelled ? (
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-[#EF4444] bg-[#FEF2F2] text-[#DC2626]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <span className="font-bold text-sm block">Order Cancelled</span>
              <span className="text-xs">
                This order was cancelled by the store. Please contact staff at the counter.
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {STAGES.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const Icon = stage.icon;

              return (
                <div
                  key={stage.status}
                  className={`flex md:flex-col items-center md:items-start gap-3 p-3.5 rounded-2xl border transition-colors ${
                    isCurrent
                      ? 'border-[#133E2B] bg-[#133E2B] text-white shadow-xs'
                      : isPast
                      ? 'border-[#15803D] bg-white text-[#15803D]'
                      : 'border-[#E5E7EB] bg-white text-[#6B7280] opacity-60'
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-xl shrink-0 ${
                      isCurrent
                        ? 'bg-white/20 text-white'
                        : isPast
                        ? 'bg-[#DCFCE7] text-[#15803D]'
                        : 'border border-[#E5E7EB] text-[#6B7280]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase block tracking-wider opacity-75 font-semibold">
                      Step 0{idx + 1}
                    </span>
                    <span className="text-xs font-bold block leading-tight">
                      {stage.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Counter Ready Banner */}
        {order.status === 'ready' && (
          <div className="mt-4 p-4 rounded-2xl border border-[#15803D] bg-[#DCFCE7] text-[#15803D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5" />
              <span className="font-semibold text-xs sm:text-sm">
                Your order is freshly staged at the counter pickup shelf!
              </span>
            </div>
            <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-[#15803D] text-white">
              Ready Now
            </span>
          </div>
        )}
      </div>

      {/* Ticket Items & Payment Summary */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <span className="text-xs font-bold text-[#111827] block">
            Ticket Breakdown ({order.items.length} items)
          </span>
          <div className="divide-y divide-[#F3EFEA] border border-[#E5E7EB] rounded-2xl bg-white overflow-hidden">
            {order.items.map((item) => (
              <div key={item.id} className="p-3.5 flex justify-between items-start text-xs">
                <div>
                  <span className="font-bold text-[#111827]">
                    {item.quantity}x {item.name}
                  </span>
                  {item.selectedOptions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.selectedOptions.map((opt) => (
                        <span
                          key={opt.optionId}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-[#F3EFEA] text-[#4B5563]"
                        >
                          {opt.optionName}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.specialInstructions && (
                    <p className="mt-1 text-xs italic text-[#6B7280]">
                      &ldquo;{item.specialInstructions}&rdquo;
                    </p>
                  )}
                </div>
                <span className="font-bold tabular-nums text-[#111827]">
                  P{item.lineTotal}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment & Receipt Summary */}
        <div className="border border-[#E5E7EB] rounded-2xl bg-[#F8F6F0] p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-bold text-[#111827] block mb-3">
              Receipt & Settlement
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#6B7280]">
                <span>Subtotal</span>
                <span>P{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[#15803D] font-bold">
                  <span>Loyalty Perk</span>
                  <span>-P{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-[#111827] font-bold pt-2 border-t border-[#E5E7EB]">
                <span>Total Amount Due</span>
                <span className="text-base">P{order.total}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5E7EB] text-xs text-[#6B7280] space-y-1">
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <strong className="text-[#111827] uppercase">
                  {order.paymentStatus === 'paid_at_pickup' ? 'Settled' : 'Pay at Counter'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Loyalty Points Earned:</span>
                <strong className="text-[#15803D]">+{order.pointsEarned} pts</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
