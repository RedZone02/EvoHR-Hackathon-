import React from 'react';
import { Clock } from 'lucide-react';

export interface DiscountBadgeProps {
  percentage: number;
  className?: string;
  variant?: 'subtle' | 'solid';
}

export const DiscountBadge: React.FC<DiscountBadgeProps> = ({
  percentage,
  className = '',
  variant = 'subtle',
}) => {
  // Figma spec: 12/16px semibold 600, 10px orizontal / 6px vertical, 12px colțuri
  const isSubtle = variant === 'subtle';
  return (
    <span
      className={`
        inline-flex items-center justify-center font-semibold text-xs tracking-tight
        px-2.5 py-1 rounded-[12px] select-none
        ${isSubtle
          ? 'bg-[#FDE5E0] text-[#B94330]'
          : 'bg-[#B94330] text-white shadow-xs'
        }
        ${className}
      `}
    >
      -{Math.abs(percentage)}%
    </span>
  );
};

export interface ExpireBadgeProps {
  minutesLeft: number;
  className?: string;
}

export const ExpireBadge: React.FC<ExpireBadgeProps> = ({
  minutesLeft,
  className = '',
}) => {
  // Figma spec: "Fii util, nu alarmant. Arată timpul rămas în cuvinte, împreună cu un ceas."
  // Verde #30634E pe fundal #DAF2EC
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `expiră în ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `expiră în ${hours}h ${mins}m` : `expiră în ${hours} ore`;
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-semibold text-xs
        px-2.5 py-1 rounded-[12px] bg-[#DAF2EC] text-[#30634E] select-none
        ${className}
      `}
    >
      <Clock className="w-3.5 h-3.5 stroke-[2.2]" />
      <span>{formatTime(minutesLeft)}</span>
    </span>
  );
};

export interface CategoryBadgeProps {
  label: string;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  label,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center text-xs font-semibold text-[#636965]
        bg-[#F5F6F4] px-2.5 py-1 rounded-[8px]
        ${className}
      `}
    >
      {label}
    </span>
  );
};
