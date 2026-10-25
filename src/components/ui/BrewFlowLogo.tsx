import React from 'react';

interface BrewFlowLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light' | 'primary';
}

export function BrewFlowLogo({
  className = '',
  iconOnly = false,
  size = 'md',
  variant = 'primary',
}: BrewFlowLogoProps) {
  const iconSizeMap = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
  };

  const textSizeMap = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const textColor =
    variant === 'light'
      ? 'text-white'
      : variant === 'dark'
      ? 'text-[#111827]'
      : 'text-[#133E2B]';

  const iconBg =
    variant === 'light'
      ? 'bg-white/10 text-white'
      : variant === 'dark'
      ? 'bg-[#111827] text-white'
      : 'bg-[#133E2B] text-white';

  return (
    <div className={`inline-flex items-center gap-2.5 font-bold tracking-tight ${textColor} ${className}`}>
      {/* BrewFlow Organic Leaf & Coffee Sprout Icon */}
      <div
        className={`flex items-center justify-center rounded-xl p-1.5 shadow-xs transition-transform ${iconSizeMap[size]} ${iconBg}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-full w-full"
        >
          {/* Stylized Coffee Leaf & Bean Centerline */}
          <path d="M12 2C6.5 2 2 6.5 2 12c0 5 3.5 9 8.5 9.8V15c-1.5 0-2.5-1-2.5-2.5s1-2.5 2.5-2.5V8c-2.5 0-4.5 1-4.5 3s1 3.5 2.5 4" />
          <path d="M12 2c5.5 0 10 4.5 10 10 0 5-3.5 9-8.5 9.8V15c1.5 0 2.5-1 2.5-2.5s-1-2.5-2.5-2.5V8c2.5 0 4.5 1 4.5 3s-1 3.5-2.5 4" />
          <path d="M12 2v20" strokeWidth="2.5" />
          <path d="M12 7l4-2" />
          <path d="M12 11l-4-2" />
          <path d="M12 15l4-2" />
        </svg>
      </div>

      {!iconOnly && (
        <span className={`font-semibold tracking-tight ${textSizeMap[size]}`}>
          BrewFlow
        </span>
      )}
    </div>
  );
}
