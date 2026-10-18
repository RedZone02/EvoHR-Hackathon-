import React from 'react';
import { CheckCircle2, WifiOff, X, AlertCircle } from 'lucide-react';

export interface ToastProps {
  id?: string;
  type?: 'success' | 'offline' | 'alert' | 'info';
  title: string;
  description?: string;
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'success',
  title,
  description,
  onClose,
  className = '',
}) => {
  // Figma spec: 16px spațiu interior, 12px colțuri
  const isSuccess = type === 'success';
  const isOffline = type === 'offline';

  return (
    <div
      role="alert"
      className={`
        flex items-start justify-between gap-3 p-4 rounded-[12px] shadow-sm transition-all duration-200
        ${isSuccess
          ? 'bg-[#DAF2EC] text-[#30634E] border border-[#BDEBDD]'
          : isOffline
          ? 'bg-white text-[#232A27] border border-[#E4E7E5]'
          : 'bg-[#FDE5E0] text-[#B94330] border border-[#F9C9C0]'
        }
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#30634E]" />}
          {isOffline && <WifiOff className="w-5 h-5 text-[#636965]" />}
          {!isSuccess && !isOffline && <AlertCircle className="w-5 h-5 text-[#B94330]" />}
        </div>

        <div className="flex flex-col text-left">
          <span className="font-semibold text-sm leading-tight">
            {title}
          </span>
          {description && (
            <span
              className={`text-xs mt-1 leading-normal ${
                isSuccess ? 'text-[#30634E]/90' : isOffline ? 'text-[#636965]' : 'text-[#B94330]/90'
              }`}
            >
              {description}
            </span>
          )}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Închide notificarea"
          className={`
            shrink-0 p-1 rounded-md transition-colors cursor-pointer
            ${isSuccess
              ? 'text-[#30634E] hover:bg-[#30634E]/10'
              : 'text-[#636965] hover:bg-black/5'
            }
          `}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
