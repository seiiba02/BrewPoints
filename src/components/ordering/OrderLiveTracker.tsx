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
    <div className="border border-[#111110] bg-[#FFFFFF] shadow-sm text-[#111110] overflow-hidden">
      {/* Live Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#111110] bg-[#111110] text-[#F8F6F0] px-5 py-4 gap-3">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                order.status === 'ready'
                  ? 'bg-[#15803D]'
                  : order.status === 'completed'
                  ? 'bg-[#4A4843]'
                  : 'bg-[#E02E24]'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                order.status === 'ready'
                  ? 'bg-[#15803D]'
                  : order.status === 'completed'
                  ? 'bg-[#4A4843]'
                  : 'bg-[#E02E24]'
              }`}
            />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#D4D0C5]">
                Active Pickup Ticket
              </span>
              <span className="font-mono text-sm font-bold text-[#F8F6F0]">
                {order.id}
              </span>
            </div>
            <p className="text-xs text-[#D4D0C5] mt-0.5">
              Pickup Slot: <strong className="text-[#F8F6F0]">{order.pickupSlot}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="font-mono text-xs text-right">
            <span className="text-[#D4D0C5] block">Customer</span>
            <span className="font-bold text-[#F8F6F0]">{order.customerName}</span>
          </div>
          <button
            onClick={onDismiss}
            className="border border-[#3D3B37] bg-[#1A1918] px-3 py-1.5 text-xs font-mono font-medium text-[#F8F6F0] hover:bg-[#E02E24] hover:border-[#E02E24] transition-colors cursor-pointer"
          >
            Close Tracker
          </button>
        </div>
      </div>

      {/* Multi-Stage Stepper */}
      <div className="p-5 sm:p-6 bg-[#F8F6F0] border-b border-[#D4D0C5]">
        {isCancelled ? (
          <div className="flex items-center gap-3 p-4 border border-[#E02E24] bg-[#FDF2F2] text-[#E02E24]">
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
                  className={`flex md:flex-col items-center md:items-start gap-3 p-3 border transition-colors ${
                    isCurrent
                      ? 'border-[#111110] bg-[#111110] text-[#F8F6F0]'
                      : isPast
                      ? 'border-[#15803D] bg-[#FFFFFF] text-[#15803D]'
                      : 'border-[#D4D0C5] bg-[#FFFFFF] text-[#4A4843] opacity-60'
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-[#E02E24] text-[#F8F6F0]'
                        : isPast
                        ? 'bg-[#15803D] text-[#F8F6F0]'
                        : 'border border-[#D4D0C5] text-[#4A4843]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs uppercase block tracking-wider opacity-80">
                      Step 0{idx + 1}
                    </span>
                    <span className="text-xs font-semibold block leading-tight">
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
          <div className="mt-4 p-4 border border-[#15803D] bg-[#DCFCE7] text-[#15803D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5" />
              <span className="font-semibold text-xs sm:text-sm">
                Your order is freshly staged at the counter pickup shelf!
              </span>
            </div>
            <span className="font-mono text-xs font-bold uppercase px-2.5 py-1 bg-[#15803D] text-[#FFFFFF]">
              Ready Now
            </span>
          </div>
        )}
      </div>

      {/* Ticket Items & Payment Summary */}
      <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <span className="text-xs font-mono uppercase font-semibold text-[#111110] block">
            Ticket Breakdown ({order.items.length} items)
          </span>
          <div className="divide-y divide-[#D4D0C5] border border-[#D4D0C5] bg-[#FFFFFF]">
            {order.items.map((item) => (
              <div key={item.id} className="p-3 flex justify-between items-start text-xs">
                <div>
                  <span className="font-semibold text-[#111110]">
                    {item.quantity}x {item.name}
                  </span>
                  {item.selectedOptions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.selectedOptions.map((opt) => (
                        <span
                          key={opt.optionId}
                          className="text-xs font-mono px-1.5 py-0.5 bg-[#EFECE3] border border-[#D4D0C5] text-[#4A4843]"
                        >
                          {opt.optionName}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.specialInstructions && (
                    <p className="mt-1 text-xs italic text-[#4A4843]">
                      &ldquo;{item.specialInstructions}&rdquo;
                    </p>
                  )}
                </div>
                <span className="font-mono font-medium tabular-nums text-[#111110]">
                  ${item.lineTotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment & Receipt Summary */}
        <div className="border border-[#D4D0C5] bg-[#F8F6F0] p-4 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-mono uppercase font-semibold text-[#111110] block mb-2">
              Receipt & Settlement
            </span>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#4A4843]">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[#15803D] font-bold">
                  <span>Loyalty Perk</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#111110] font-bold pt-2 border-t border-[#D4D0C5]">
                <span>Total Amount Due</span>
                <span className="text-sm">${order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#D4D0C5] text-xs text-[#4A4843] space-y-1">
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <strong className="text-[#111110] uppercase">
                  {order.paymentStatus === 'paid_at_pickup' ? 'Settled' : 'Pay at Counter'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Loyalty Points Earned:</span>
                <strong className="text-[#15803D]">+{order.pointsEarned} pts</strong>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#D4D0C5]">
            <p className="text-xs text-[#4A4843] leading-normal">
              💡 Need to bump status for testing? Open the{' '}
              <a href="/queue" className="underline font-bold text-[#111110] hover:text-[#E02E24]">
                Kitchen Queue
              </a>{' '}
              in another tab to watch this ticket progress in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
