import React from 'react';

export interface ToggleSwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  sublabel?: string;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  checked,
  onChange,
  label,
  sublabel,
  disabled = false,
}) => {
  const switchId = id || `toggle-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="flex items-center justify-between gap-4 py-1">
      {(label || sublabel) && (
        <label htmlFor={switchId} className="cursor-pointer select-none">
          {label && <div className="text-sm font-semibold text-[#232A27]">{label}</div>}
          {sublabel && <div className="text-xs text-[#636965] mt-0.5">{sublabel}</div>}
        </label>
      )}

      {/* Touch target container (min 44px) */}
      <div className="flex items-center justify-center min-h-[44px]">
        <button
          type="button"
          id={switchId}
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => !disabled && onChange(!checked)}
          className={`
            relative inline-flex h-[28px] w-[52px] shrink-0 cursor-pointer rounded-full
            border-2 border-transparent transition-colors duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-[#30634E] focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-40
            ${checked ? 'bg-[#30634E]' : 'bg-[#D1D5DB]'}
          `}
        >
          <span
            className={`
              pointer-events-none inline-block h-[24px] w-[24px] transform rounded-full
              bg-white shadow-md ring-0 transition duration-200 ease-in-out
              ${checked ? 'translate-x-[24px]' : 'translate-x-0'}
            `}
          />
        </button>
      </div>
    </div>
  );
};
