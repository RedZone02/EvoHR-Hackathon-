import React from 'react';
import { Check } from 'lucide-react';

export interface FilterChipProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  count?: number;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected = false,
  disabled = false,
  count,
  icon,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 h-11 px-4 rounded-[12px] text-sm font-semibold
        transition-all duration-150 select-none whitespace-nowrap cursor-pointer shrink-0
        disabled:cursor-not-allowed disabled:bg-[#F5F6F4] disabled:text-[#8C938F] disabled:border-[#E4E7E5]
        ${selected
          ? 'bg-[#DAF2EC] text-[#30634E] border-1.5 border-[#30634E] shadow-xs'
          : 'bg-white text-[#636965] border border-[#E4E7E5] hover:border-[#30634E]/50 hover:text-[#232A27]'
        }
        ${className}
      `}
    >
      {selected ? (
        <Check className="w-4 h-4 text-[#30634E] stroke-[2.5]" />
      ) : (
        icon && <span className="text-[#636965]">{icon}</span>
      )}
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={`
            text-xs px-1.5 py-0.5 rounded-full font-bold
            ${selected ? 'bg-[#30634E] text-white' : 'bg-[#F5F6F4] text-[#636965]'}
          `}
        >
          {count}
        </span>
      )}
    </button>
  );
};
