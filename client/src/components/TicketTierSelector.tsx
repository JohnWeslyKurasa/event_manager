import React from 'react';
import { Check, Users, Zap, Lock, ChevronRight } from 'lucide-react';
import { TicketTier } from '../types';

interface TicketTierSelectorProps {
  tiers: TicketTier[];
  selectedTierId: string | null;
  onSelect: (tierId: string) => void;
  disabled?: boolean;
}

export const TicketTierSelector: React.FC<TicketTierSelectorProps> = ({
  tiers,
  selectedTierId,
  onSelect,
  disabled = false,
}) => {
  if (!tiers || tiers.length === 0) {
    return (
      <div className="text-center py-8 text-botanical-500">
        <Lock size={20} className="mx-auto mb-2 opacity-50 text-sage-600" />
        <p className="text-xs">No ticket tiers available for this gathering.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" id="ticket-tier-selector">
      {tiers.map((tier) => {
        const remaining = tier.capacity - tier.ticketsSold;
        const isSoldOut = remaining <= 0;
        const isSelected = selectedTierId === tier.id;
        const isLowStock = remaining > 0 && remaining <= 10;
        const fillPercent = Math.min((tier.ticketsSold / tier.capacity) * 100, 100);

        return (
          <button
            key={tier.id}
            id={`tier-${tier.id}`}
            onClick={() => !isSoldOut && !disabled && onSelect(tier.id)}
            disabled={isSoldOut || disabled}
            className={`w-full text-left p-4 rounded-natural border transition-all duration-200 ${
              isSoldOut || disabled
                ? 'opacity-60 cursor-not-allowed border-cream-200 bg-cream-200/40'
                : isSelected
                ? 'border-sage-600 bg-sage-50/70 shadow-soft-natural'
                : 'border-cream-200 bg-cream-50 hover:border-sage-300 hover:bg-cream-100/80 cursor-pointer shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  {/* Selection radio */}
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected
                        ? 'border-sage-600 bg-sage-600'
                        : 'border-cream-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check size={10} className="text-cream-50" />}
                  </div>

                  <span className="font-serif font-bold text-sm text-botanical-900">{tier.name}</span>

                  {isLowStock && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-semibold">
                      <Zap size={9} fill="currentColor" /> {remaining} left
                    </span>
                  )}

                  {isSoldOut && (
                    <span className="inline-flex items-center px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-[10px] font-semibold">
                      Sold Out
                    </span>
                  )}
                </div>

                {tier.description && (
                  <p className="text-botanical-500 text-xs mb-2.5 ml-6">{tier.description}</p>
                )}

                {/* Perks */}
                {tier.perks && tier.perks.length > 0 && (
                  <ul className="space-y-1 ml-6">
                    {tier.perks.map((perk, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-xs text-botanical-700">
                        <Check size={12} className="text-sage-600 flex-shrink-0" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Availability Bar */}
                <div className="mt-2.5 ml-6">
                  <div className="flex justify-between text-[10px] text-botanical-500 mb-1">
                    <span className="flex items-center gap-1">
                      <Users size={10} /> {tier.ticketsSold} registered
                    </span>
                    <span>{remaining > 0 ? `${remaining} remaining` : 'Sold out'}</span>
                  </div>
                  <div className="h-1.5 w-full bg-cream-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        fillPercent >= 90
                          ? 'bg-red-500'
                          : fillPercent >= 70
                          ? 'bg-amber-500'
                          : 'bg-sage-600'
                      }`}
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Right: Price */}
              <div className="text-right flex-shrink-0">
                <div className="mb-1">
                  {tier.price === 0 ? (
                    <span className="text-base font-serif font-bold text-sage-700">Free</span>
                  ) : (
                    <>
                      <span className="text-[10px] text-botanical-500 block uppercase">per pass</span>
                      <span className="text-base font-serif font-bold text-botanical-900">
                        ${Number(tier.price).toFixed(2)}
                      </span>
                    </>
                  )}
                </div>

                {isSelected && !isSoldOut && (
                  <div className="flex items-center gap-0.5 text-sage-700 text-[11px] font-semibold justify-end">
                    Selected <ChevronRight size={11} />
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default TicketTierSelector;
