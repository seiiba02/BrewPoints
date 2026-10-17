'use client';

import { useState } from 'react';
import { X, Trash2, Clock, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { CartItem, Order } from '@/lib/domain/types';
import { orderService } from '@/lib/services/brewflowService';
import { computeSpecimenAxes } from '@/lib/design-tokens';

interface CartCheckoutSheetProps {
  cart: CartItem[];
  loyaltyBalance: number;
  onClose: () => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: Order) => void;
}

export function CartCheckoutSheet({
  cart,
  loyaltyBalance,
  onClose,
  onRemoveItem,
  onClearCart,
  onOrderPlaced,
}: CartCheckoutSheetProps) {
  const [customerName, setCustomerName] = useState('Jane Customer');
  const [customerPhone, setCustomerPhone] = useState('+1 (555) 492-8810');
  const [pickupSlot, setPickupSlot] = useState('Next available (10–15 min)');
  const [redeemLoyalty, setRedeemLoyalty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);

  // Loyalty calculations (50 pts = $5.00 off)
  const canRedeem = loyaltyBalance >= 50 && subtotal >= 5.0;
  const pointsToRedeem = redeemLoyalty && canRedeem ? 50 : 0;
  const discount = pointsToRedeem > 0 ? 5.0 : 0.0;
  const finalTotal = Math.max(0, Math.round((subtotal - discount) * 100) / 100);
  const pointsToEarn = Math.round(finalTotal);

  const fontAxes = computeSpecimenAxes(finalTotal, 40);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName.trim()) {
      setErrorMessage('Please enter your name for order fulfillment.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const order = await orderService.createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        pickupSlot,
        items: cart,
        redeemPoints: pointsToRedeem,
      });

      onClearCart();
      onOrderPlaced(order);
    } catch (err) {
      console.error('Order creation error', err);
      setErrorMessage('Unable to dispatch order. Please check connection and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-heading"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-md h-full flex flex-col bg-[#FFFFFF] border-l border-[#111110] text-[#111110] shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D4D0C5] bg-[#F8F6F0] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase px-2 py-0.5 border border-[#111110] bg-[#111110] text-[#F8F6F0]">
              Ticket Review
            </span>
            <span className="font-mono text-xs text-[#4A4843]">
              {cart.length} {cart.length === 1 ? 'ITEM' : 'ITEMS'}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart review"
            className="p-1 text-[#4A4843] hover:text-[#111110] hover:bg-[#EFECE3] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form
          id="checkout-form"
          onSubmit={handleSubmitOrder}
          className="flex-1 overflow-y-auto p-5 space-y-6"
        >
          {/* Line Items */}
          <div>
            <h2
              id="checkout-heading"
              className="text-xl font-bold tracking-tight text-[#111110] mb-3"
              style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
            >
              Order Items
            </h2>

            {cart.length === 0 ? (
              <div className="border border-dashed border-[#D4D0C5] p-6 text-center bg-[#F8F6F0]">
                <p className="text-xs font-mono uppercase text-[#4A4843]">
                  Your pickup tray is empty
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#D4D0C5] border-y border-[#D4D0C5]">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between">
                        <span className="font-semibold text-xs text-[#111110]">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-mono text-xs font-semibold tabular-nums text-[#111110]">
                          ${item.lineTotal.toFixed(2)}
                        </span>
                      </div>

                      {/* Customization Options */}
                      {item.selectedOptions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.selectedOptions.map((opt) => (
                            <span
                              key={opt.optionId}
                              className="inline-block text-xs font-mono px-1.5 py-0.5 bg-[#EFECE3] text-[#4A4843] border border-[#D4D0C5]"
                            >
                              {opt.optionName}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Special Instructions */}
                      {item.specialInstructions && (
                        <p className="mt-1 text-xs italic text-[#4A4843]">
                          &ldquo;{item.specialInstructions}&rdquo;
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                      className="p-1 text-[#4A4843] hover:text-[#E02E24] transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pickup Slot Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-mono uppercase font-semibold text-[#111110]">
              <Clock className="h-3.5 w-3.5 text-[#E02E24]" />
              Pickup Schedule
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                'Next available (10–15 min)',
                'In 25–30 min',
                'In 45 min',
              ].map((slot) => (
                <label
                  key={slot}
                  className={`flex items-center justify-between p-2.5 border text-xs cursor-pointer transition-colors ${
                    pickupSlot === slot
                      ? 'border-[#111110] bg-[#111110] text-[#F8F6F0]'
                      : 'border-[#D4D0C5] bg-[#FFFFFF] text-[#111110] hover:border-[#111110]'
                  }`}
                >
                  <span className="font-medium">{slot}</span>
                  <input
                    type="radio"
                    name="pickupSlot"
                    value={slot}
                    checked={pickupSlot === slot}
                    onChange={(e) => setPickupSlot(e.target.value)}
                    className="sr-only"
                  />
                  {pickupSlot === slot && <CheckCircle2 className="h-3.5 w-3.5 text-[#F8F6F0]" />}
                </label>
              ))}
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-3">
            <span className="block text-xs font-mono uppercase font-semibold text-[#111110]">
              Customer Coordinates
            </span>
            <div>
              <label htmlFor="customer-name" className="sr-only">
                Full Name
              </label>
              <input
                id="customer-name"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full Name (for counter pickup call)"
                className="w-full p-2.5 text-xs border border-[#D4D0C5] bg-[#F8F6F0] focus:border-[#111110] focus:outline-hidden"
              />
            </div>
            <div>
              <label htmlFor="customer-phone" className="sr-only">
                Phone Number
              </label>
              <input
                id="customer-phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Mobile Number (optional updates)"
                className="w-full p-2.5 text-xs border border-[#D4D0C5] bg-[#F8F6F0] focus:border-[#111110] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Loyalty Perks */}
          <div className="border border-[#111110] bg-[#F8F6F0] p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#E02E24]" />
                <span className="text-xs font-mono uppercase font-bold text-[#111110]">
                  Foundry Loyalty Perks
                </span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#FFFFFF] border border-[#111110]">
                {loyaltyBalance} PTS
              </span>
            </div>

            {canRedeem ? (
              <label className="flex items-center gap-2 text-xs cursor-pointer mt-2 pt-2 border-t border-[#D4D0C5]">
                <input
                  type="checkbox"
                  checked={redeemLoyalty}
                  onChange={(e) => setRedeemLoyalty(e.target.checked)}
                  className="rounded-none border-[#111110] text-[#E02E24] focus:ring-0 cursor-pointer"
                />
                <span className="text-[#111110] font-medium">
                  Redeem 50 pts for <strong>$5.00 discount</strong>
                </span>
              </label>
            ) : (
              <p className="text-xs text-[#4A4843] mt-1">
                {loyaltyBalance >= 50
                  ? 'Orders $5.00+ eligible for 50 pt ($5.00) redemption.'
                  : 'Earn 1 point per $1.00 spent. 50 points = $5.00 credit.'}
              </p>
            )}
          </div>

          {/* Payment Method Notice */}
          <div className="flex items-start gap-2.5 p-3 border border-[#D4D0C5] bg-[#FFFFFF] text-xs text-[#4A4843]">
            <ShieldCheck className="h-4 w-4 text-[#15803D] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#111110] block">
                Pay In-Store at Counter
              </span>
              <span>
                Zero online pre-charge required. Present your name upon pickup to pay with cash, card, or tap.
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 border border-[#E02E24] bg-[#FDF2F2] text-xs text-[#E02E24] font-medium">
              {errorMessage}
            </div>
          )}
        </form>

        {/* Sticky Order Breakdown & Submit */}
        <div className="border-t border-[#111110] bg-[#F8F6F0] p-4 space-y-3">
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-[#4A4843]">
              <span>Subtotal</span>
              <span className="tabular-nums">${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#15803D] font-bold">
                <span>Loyalty Credit (50 pts)</span>
                <span className="tabular-nums">-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#4A4843]">
              <span>Est. Loyalty Points Earned</span>
              <span className="tabular-nums text-[#15803D]">+{pointsToEarn} pts</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#111110] pt-2 border-t border-[#D4D0C5]">
              <span style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>
                Total Due at Pickup
              </span>
              <span
                className="tabular-nums text-xl"
                style={{
                  fontFamily: 'var(--font-fraunces), Georgia, serif',
                  fontVariationSettings: fontAxes.fontVariationSettings,
                }}
              >
                ${finalTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={cart.length === 0 || isSubmitting}
            className="w-full h-12 flex items-center justify-between px-5 bg-[#E02E24] hover:bg-[#B82219] disabled:opacity-50 text-[#F8F6F0] font-semibold text-sm transition-colors cursor-pointer"
          >
            <span>{isSubmitting ? 'Transmitting Ticket...' : 'Dispatch Pickup Order'}</span>
            <span className="font-mono tabular-nums font-bold">
              ${finalTotal.toFixed(2)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
