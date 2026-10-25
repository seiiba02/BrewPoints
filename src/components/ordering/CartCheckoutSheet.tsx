'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { CartItem, Order } from '@/lib/domain/types';
import { orderService } from '@/lib/services/brewflowService';

interface CartCheckoutSheetProps {
  cart: CartItem[];
  loyaltyBalance: number;
  onClose: () => void;
  onRemoveItem: (cartItemId: string) => void;
  onUpdateQuantity?: (cartItemId: string, newQuantity: number) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: Order) => void;
}

export function CartCheckoutSheet({
  cart,
  loyaltyBalance,
  onClose,
  onRemoveItem,
  onUpdateQuantity,
  onClearCart,
  onOrderPlaced,
}: CartCheckoutSheetProps) {
  const [customerName, setCustomerName] = useState('Alex Cruz');
  const [customerPhone, setCustomerPhone] = useState('+63 917 555 1024');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);
  const serviceFee = 0;
  const total = subtotal + serviceFee;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const order = await orderService.createOrder({
        customerName: customerName.trim() || 'Alex Cruz',
        customerPhone: customerPhone.trim() || '+63 917 555 1024',
        pickupSlot: 'Pickup Counter',
        items: cart,
        redeemPoints: 0,
      });

      onClearCart();
      onOrderPlaced(order);
    } catch (err) {
      console.error('Order creation error', err);
      setErrorMessage('Unable to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-heading"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md h-full flex flex-col bg-[#FFFFFF] shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F3EFEA]">
          <h2
            id="cart-heading"
            className="text-xl font-bold tracking-tight text-[#111827]"
          >
            Your Cart
          </h2>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="p-1.5 rounded-full text-[#6B7280] hover:text-[#111827] hover:bg-[#F3EFEA] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="h-16 w-16 rounded-full bg-[#F3EFEA] flex items-center justify-center text-[#9CA3AF] mb-4">
                <Trash2 className="h-8 w-8" />
              </div>
              <h3 className="text-base font-semibold text-[#111827]">
                Your cart is empty
              </h3>
              <p className="text-xs text-[#6B7280] mt-1 max-w-xs">
                Explore our menu to add freshly crafted lattes, iced coffees, and bakery treats.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 px-6 py-2.5 rounded-full bg-[#133E2B] text-white text-xs font-semibold hover:bg-[#0E2E20] transition-colors cursor-pointer"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const optionsSummary = item.selectedOptions
                .map((o) => o.optionName)
                .join(' • ');

              return (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#D1D5DB] transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F3EFEA]">
                    <Image
                      src={item.imageUrl || '/images/iced-latte.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-[#111827] truncate">
                        {item.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="text-[#9CA3AF] hover:text-[#EF4444] p-0.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {optionsSummary && (
                      <p className="text-[11px] text-[#6B7280] mt-0.5 leading-snug truncate">
                        {optionsSummary}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="text-sm font-bold text-[#133E2B]">
                        P{item.lineTotal}
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center rounded-full border border-[#E5E7EB] bg-[#F8F6F0] h-7 px-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateQuantity) {
                              if (item.quantity > 1) {
                                onUpdateQuantity(item.id, item.quantity - 1);
                              } else {
                                onRemoveItem(item.id);
                              }
                            }
                          }}
                          aria-label="Decrease quantity"
                          className="flex h-5 w-5 items-center justify-center rounded-full text-[#4B5563] hover:text-[#111827] transition-colors cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold tabular-nums text-[#111827]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateQuantity) {
                              onUpdateQuantity(item.id, item.quantity + 1);
                            }
                          }}
                          aria-label="Increase quantity"
                          className="flex h-5 w-5 items-center justify-center rounded-full text-[#4B5563] hover:text-[#111827] transition-colors cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#DC2626]">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer with Price Breakdown and Buttons */}
        {cart.length > 0 && (
          <div className="border-t border-[#F3EFEA] bg-[#FFFFFF] p-6 space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#6B7280]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#111827]">P{subtotal}</span>
              </div>
              <div className="flex justify-between text-[#6B7280]">
                <span>Service Fee</span>
                <span className="font-semibold text-[#111827]">P{serviceFee}</span>
              </div>
              <div className="pt-2 border-t border-[#F3EFEA] flex justify-between items-baseline">
                <span className="text-sm font-bold text-[#111827]">Total</span>
                <span className="text-xl font-bold text-[#111827]">
                  P{total}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {/* Proceed to Checkout Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCheckout}
                className="w-full h-12 flex items-center justify-center rounded-2xl bg-[#133E2B] hover:bg-[#0E2E20] text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Processing Order...' : 'Proceed to Checkout'}
              </button>

              {/* Continue Shopping Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full h-12 flex items-center justify-center rounded-2xl bg-[#F8F6F0] hover:bg-[#EFECE3] text-[#111827] font-semibold text-sm transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
