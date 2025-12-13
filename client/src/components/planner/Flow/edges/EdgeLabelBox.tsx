import React from 'react';
import { EdgeLabelRenderer } from 'reactflow';

interface EdgeLabelBoxProps {
  label?: string;
  description?: string;
  labelX: number;
  labelY: number;
  selected?: boolean;
  id: string;
}

export const EdgeLabelBox = ({
  label,
  description,
  labelX,
  labelY,
  selected,
  id,
}: EdgeLabelBoxProps) => {
  const hasContent = label || description;
  if (!hasContent) return null;

  return (
    <EdgeLabelRenderer>
      <div
        style={{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          pointerEvents: 'all',
          zIndex: 10,
        }}
        className="nopan nodrag"
      >
        <div
          className={`bg-white dark:bg-zinc-800 border ${selected ? 'border-blue-500 shadow-md' : 'border-slate-300 dark:border-zinc-600'} rounded-md px-2 py-1 text-center shadow-sm min-w-[80px] max-w-[140px]`}
        >
          {label && (
            <div className="text-xs font-medium text-slate-700 dark:text-zinc-200 truncate">
              {label}
            </div>
          )}
          {description && (
            <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
              {description}
            </div>
          )}
        </div>
      </div>
    </EdgeLabelRenderer>
  );
};
