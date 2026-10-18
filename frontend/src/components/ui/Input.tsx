import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1 sm:gap-1.5 w-full text-left">
      {label && (
        <label className="text-xs sm:text-sm font-semibold text-[#232A27]">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-[#636965] flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          disabled={disabled}
          className={`
            w-full h-12 bg-white text-[#232A27] placeholder:text-[#636965]
            rounded-[12px] border text-base transition-colors duration-150
            focus:outline-none disabled:bg-[#F5F6F4] disabled:cursor-not-allowed
            ${leftIcon ? 'pl-11' : 'pl-4'}
            ${rightIcon ? 'pr-11' : 'pr-4'}
            ${error
              ? 'border-[#B94330] focus:border-[#B94330] focus:ring-2 focus:ring-[#B94330]/20'
              : 'border-[#E4E7E5] focus:border-[#30634E] focus:ring-2 focus:ring-[#30634E]/20'
            }
            ${className}
          `}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 text-[#636965] flex items-center">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <span className="text-xs font-medium text-[#B94330] flex items-center gap-1">
          {error}
        </span>
      ) : helperText ? (
        <span className="text-xs text-[#636965]">
          {helperText}
        </span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
