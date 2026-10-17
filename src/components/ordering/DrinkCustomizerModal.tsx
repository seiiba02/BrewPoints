'use client';

import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { MenuItem, SelectedCustomization, CartItem } from '@/lib/domain/types';
import { computeSpecimenAxes } from '@/lib/design-tokens';

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
  const unitPrice = Math.round((item.basePrice + optionsDeltaTotal) * 100) / 100;
  const lineTotal = Math.round(unitPrice * quantity * 100) / 100;

  const fontAxes = computeSpecimenAxes(lineTotal, 30);

  const handleCommit = () => {
    const cartItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      menuItemId: item.id,
      name: item.name,
      basePrice: item.basePrice,
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
    >
      <div className="w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] flex flex-col bg-[#FFFFFF] border border-[#111110] shadow-2xl text-[#111110] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D4D0C5] bg-[#F8F6F0] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase px-2 py-0.5 border border-[#111110] bg-[#111110] text-[#F8F6F0]">
              Customizer
            </span>
            <span className="font-mono text-xs text-[#4A4843]">
              REF: {item.id.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close customizer"
            className="p-1 text-[#4A4843] hover:text-[#111110] hover:bg-[#EFECE3] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          <div>
            <h2
              id="customizer-heading"
              className="text-2xl font-bold tracking-tight text-[#111110]"
              style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
            >
              {item.name}
            </h2>
            <p className="mt-1 text-sm text-[#4A4843] leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Customization Groups */}
          <div className="space-y-5">
            {item.customizationGroups.map((group) => (
              <fieldset
                key={group.id}
                className="border-t border-[#D4D0C5] pt-4"
              >
                <div className="flex items-baseline justify-between mb-3">
                  <legend className="text-xs font-mono uppercase tracking-wider font-semibold text-[#111110]">
                    {group.name}
                  </legend>
                  <span className="text-xs font-mono text-[#4A4843]">
                    {group.type === 'radio' ? 'Select 1' : 'Optional Add-ons'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.options.map((option) => {
                    const isSelected = selectedOptions.some(
                      (o) => o.optionId === option.id
                    );

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          group.type === 'radio'
                            ? handleRadioSelect(
                                group.id,
                                group.name,
                                option.id,
                                option.name,
                                option.priceDelta
                              )
                            : handleCheckboxToggle(
                                group.id,
                                group.name,
                                option.id,
                                option.name,
                                option.priceDelta
                              )
                        }
                        className={`flex items-center justify-between p-3 border text-left text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-[#111110] bg-[#111110] text-[#F8F6F0]'
                            : 'border-[#D4D0C5] bg-[#FFFFFF] text-[#111110] hover:border-[#111110]'
                        }`}
                      >
                        <span className="font-medium">{option.name}</span>
                        <span
                          className={`font-mono text-xs tabular-nums ${
                            isSelected ? 'text-[#D4D0C5]' : 'text-[#4A4843]'
                          }`}
                        >
                          {option.priceDelta > 0
                            ? `+$${option.priceDelta.toFixed(2)}`
                            : 'Free'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            {/* Special Instructions */}
            <div className="border-t border-[#D4D0C5] pt-4">
              <label
                htmlFor="instructions"
                className="block text-xs font-mono uppercase tracking-wider font-semibold text-[#111110] mb-2"
              >
                Special Barista Instructions
              </label>
              <textarea
                id="instructions"
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Extra hot, light ice, room for cream..."
                className="w-full p-2.5 text-xs border border-[#D4D0C5] bg-[#F8F6F0] focus:border-[#111110] focus:outline-hidden transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#D4D0C5] bg-[#F8F6F0] p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center border border-[#111110] bg-[#FFFFFF] h-11 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="px-3.5 h-full text-[#111110] hover:bg-[#EFECE3] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-4 font-mono text-sm font-bold tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
              className="px-3.5 h-full text-[#111110] hover:bg-[#EFECE3] transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Add to Order Button */}
          <button
            type="button"
            onClick={handleCommit}
            className="flex-1 w-full h-11 flex items-center justify-between px-5 bg-[#E02E24] hover:bg-[#B82219] text-[#F8F6F0] transition-colors cursor-pointer"
          >
            <span className="font-semibold text-sm tracking-wide">
              Add to Pickup Order
            </span>
            <span
              className="text-base font-bold tabular-nums"
              style={{
                fontFamily: 'var(--font-fraunces), Georgia, serif',
                fontVariationSettings: fontAxes.fontVariationSettings,
              }}
            >
              ${lineTotal.toFixed(2)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
