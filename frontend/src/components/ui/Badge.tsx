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
  const formatTime = (minutes: number) => {
    if (minutes >= 1440) {
      const days = Math.floor(minutes / 1440);
      return days === 1 ? 'valabil încă 1 zi' : `valabil încă ${days} zile`;
    }
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (mins === 0) {
        return hours === 1 ? 'expiră în 1 oră' : `expiră în ${hours} ore`;
      }
      return `expiră în ${hours}h ${mins}m`;
    }
    return `expiră în ${minutes} min`;
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