import React from 'react';
import { PackageX } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nu sunt pungi aproape. Deocamdată.',
  description = 'Magazinele locale adaugă oferte proaspete pe parcursul zilei. Încearcă o zonă mai largă.',
  actionText = 'Extinde zona de căutare',
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center p-8 sm:p-12
        bg-white rounded-[16px] border border-[#E4E7E5] max-w-md mx-auto my-6
        ${className}
      `}
    >
      <div className="w-16 h-16 rounded-full bg-[#DAF2EC] flex items-center justify-center text-[#30634E] mb-5">
        <PackageX className="w-8 h-8 stroke-[1.75]" />
      </div>

      <h3 className="text-xl font-bold text-[#232A27] tracking-tight mb-2">
        {title}
      </h3>

      <p className="text-sm text-[#636965] leading-relaxed max-w-sm mb-6">
        {description}
      </p>

      {actionText && onAction && (
        <Button variant="outline" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
