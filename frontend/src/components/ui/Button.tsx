import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'coral' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  // Figma spec: 48px height, 16px font-weight 600, 24px padding orizontal, 12px colțuri
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-[12px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'h-9 px-4 text-sm gap-1.5',
    md: 'h-12 px-6 text-base gap-2', // Exact Figma standard (48px)
    lg: 'h-14 px-8 text-lg gap-2.5',
  };

  const variantStyles = {
    primary: disabled
      ? 'bg-[#E4E7E5] text-[#8C938F]'
      : 'bg-[#30634E] text-white hover:bg-[#275240] active:bg-[#1E3F32] focus:ring-[#30634E] shadow-sm',
    secondary: disabled
      ? 'bg-transparent border border-[#E4E7E5] text-[#8C938F]'
      : 'bg-[#DAF2EC] text-[#30634E] hover:bg-[#c6ecdf] active:bg-[#b0e4d3] border border-transparent focus:ring-[#30634E]',
    coral: disabled
      ? 'bg-[#E4E7E5] text-[#8C938F]'
      : 'bg-[#B94330] text-white hover:bg-[#9E3827] active:bg-[#852E20] focus:ring-[#B94330] shadow-sm',
    outline: disabled
      ? 'border border-[#E4E7E5] text-[#8C938F]'
      : 'border-1.5 border-[#30634E] text-[#30634E] hover:bg-[#30634E]/5 active:bg-[#30634E]/10 focus:ring-[#30634E]',
    ghost: disabled
      ? 'text-[#8C938F]'
      : 'text-[#30634E] hover:bg-[#DAF2EC]/50 focus:ring-[#30634E]',
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
