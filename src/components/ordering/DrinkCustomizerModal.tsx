'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, Check } from 'lucide-react';
import { MenuItem, SelectedCustomization, CartItem } from '@/lib/domain/types';
import { BrewFlowLogo } from '@/components/ui/BrewFlowLogo';

interface DrinkCustomizerModalProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export function DrinkCustomizerModal({
  item,
  onClose,
  onAddToCart,
}: DrinkCustomizerModalProps) {
  // Initialize selections with default options
  const [selectedOptions, setSelectedOptions] = useState<SelectedCustomization[]>(
    () => {
      const defaults: SelectedCustomization[] = [];
      item.customizationGroups.forEach((group) => {
        if (group.type === 'radio') {
          const defaultOpt =
            group.options.find((o) => o.isDefault) || group.options[0];
          if (defaultOpt) {
            defaults.push({
              groupId: group.id,
              groupName: group.name,
              optionId: defaultOpt.id,
              optionName: defaultOpt.name,
              priceDelta: defaultOpt.priceDelta,
            });
          }
        }
      });
      return defaults;
    }
  );

  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Handle radio option change
  const handleRadioSelect = (
    groupId: string,
    groupName: string,
    optionId: string,
    optionName: string,
    priceDelta: number
  ) => {
    setSelectedOptions((prev) => [
      ...prev.filter((o) => o.groupId !== groupId),
      { groupId, groupName, optionId, optionName, priceDelta },
    ]);
  };

  // Handle checkbox option toggle
  const handleCheckboxToggle = (
    groupId: string,
    groupName: string,
    optionId: string,
    optionName: string,
    priceDelta: number
  ) => {
    setSelectedOptions((prev) => {
      const exists = prev.some((o) => o.optionId === optionId);
      if (exists) {
        return prev.filter((o) => o.optionId !== optionId);
      } else {
        return [...prev, { groupId, groupName, optionId, optionName, priceDelta }];
      }
    });
  };

  // Calculate live unit price & total
  const optionsDeltaTotal = selectedOptions.reduce(
    (acc, opt) => acc + opt.priceDelta,
    0
  );
  const unitPrice = Math.round(item.basePrice + optionsDeltaTotal);
  const lineTotal = Math.round(unitPrice * quantity);

  const handleCommit = () => {
    const cartItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      menuItemId: item.id,
      name: item.name,
      basePrice: item.basePrice,
      imageUrl: item.imageUrl,
      selectedOptions,
      specialInstructions: specialInstructions.trim() || undefined,
      quantity,
      unitPrice,
      lineTotal,
    };
    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customizer-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md max-h-[90vh] flex flex-col bg-[#FFFFFF] rounded-3xl shadow-2xl text-[#111827] overflow-hidden border border-[#E5E7EB]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3EFEA]">
          <BrewFlowLogo size="sm" variant="primary" />
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full text-[#6B7280] hover:text-[#111827] hover:bg-[#F3EFEA] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Top Product Summary Card */}
          <div className="flex items-start gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#F3EFEA]">
              <Image
                src={item.imageUrl || '/images/iced-latte.jpg'}
                alt={item.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2
                id="customizer-heading"
                className="text-xl font-bold tracking-tight text-[#111827]"
              >
                {item.name}
              </h2>
              <div className="text-base font-bold text-[#133E2B] mt-0.5">
                P{item.basePrice}
              </div>
              <p className="mt-1 text-xs text-[#6B7280] leading-relaxed line-clamp-2">
                {item.description}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-bold text-[#111827] tracking-tight">
              Customize Your Drink
            </h3>
          </div>

          {/* Customization Groups */}
          <div className="space-y-5">
            {item.customizationGroups.map((group) => {
              const isRadio = group.type === 'radio';

              return (
                <div key={group.id} className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#374151]">
                    <span>{group.name}</span>
                  </div>

                  {isRadio ? (
                    /* Segmented/Card buttons in a horizontal row */
                    <div className="grid grid-cols-3 gap-2">
                      {group.options.map((option) => {
                        const isSelected = selectedOptions.some(
                          (o) => o.optionId === option.id
                        );
                        const computedPrice = item.basePrice + option.priceDelta;

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() =>
                              handleRadioSelect(
                                group.id,
                                group.name,
                                option.id,
                                option.name,
                                option.priceDelta
                              )
                            }
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#133E2B] bg-[#E8F3EE] text-[#133E2B] ring-1 ring-[#133E2B]'
                                : 'border-[#E5E7EB] bg-[#FFFFFF] text-[#4B5563] hover:border-[#D1D5DB]'
                            }`}
                          >
                            <span className="text-xs font-semibold">
                              {option.name}
                            </span>
                            {group.id === 'grp-size' ? (
                              <span className="text-[11px] font-medium text-[#6B7280] mt-0.5">
                                P{computedPrice}
                              </span>
                            ) : option.priceDelta > 0 ? (
                              <span className="text-[11px] font-medium text-[#6B7280] mt-0.5">
                                +P{option.priceDelta}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Checkbox options list */
                    <div className="space-y-2">
                      {group.options.map((option) => {
                        const isSelected = selectedOptions.some(
                          (o) => o.optionId === option.id
                        );

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() =>
                              handleCheckboxToggle(
                                group.id,
                                group.name,
                                option.id,
                                option.name,
                                option.priceDelta
                              )
                            }
                            className="w-full flex items-center justify-between p-3 rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#F9F9F8] transition-colors cursor-pointer text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                                  isSelected
                                    ? 'border-[#133E2B] bg-[#133E2B] text-white'
                                    : 'border-[#D1D5DB] bg-white'
                                }`}
                              >
                                {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                              </div>
                              <span className="text-xs font-medium text-[#111827]">
                                {option.name}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-[#6B7280]">
                              {option.priceDelta > 0
                                ? `+P${option.priceDelta}`
                                : 'Free'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Special Instructions */}
            <div className="space-y-1.5 pt-1">
              <label
                htmlFor="instructions"
                className="block text-xs font-semibold text-[#374151]"
              >
                Special Instructions (Optional)
              </label>
              <textarea
                id="instructions"
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Less ice, extra hot, decaf..."
                className="w-full p-3 text-xs rounded-2xl border border-[#E5E7EB] bg-[#F8F6F0] focus:border-[#133E2B] focus:bg-white focus:outline-hidden transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="border-t border-[#F3EFEA] bg-[#FFFFFF] p-5 flex items-center gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center rounded-full border border-[#E5E7EB] bg-[#F8F6F0] h-12 px-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#111827] hover:bg-[#FFFFFF] disabled:opacity-30 transition-colors cursor-pointer"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold tabular-nums text-[#111827]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#111827] hover:bg-[#FFFFFF] transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleCommit}
            className="flex-1 h-12 flex items-center justify-center px-6 rounded-2xl bg-[#133E2B] hover:bg-[#0E2E20] text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer"
          >
            <span>Add to Cart P{lineTotal}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
