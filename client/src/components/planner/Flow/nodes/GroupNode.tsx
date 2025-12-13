import React, { memo, useCallback } from 'react';
import { NodeProps, Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { BoxSelect } from 'lucide-react';
import { NODE_COLORS } from '../types';

export const GroupNode = memo(({ id, data, selected }: NodeProps) => {
  const updateNodeInternals = useUpdateNodeInternals();
  const connectedHandles: string[] = data.connectedHandles || [];
  const colorId = data.color || 'blue';
  const colorConfig = NODE_COLORS.find(c => c.id === colorId) || NODE_COLORS[0];

  const onResize = useCallback(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);

  const getHandleClass = (handleId: string) => {
    const isConnected = connectedHandles.includes(handleId);
    return `!w-3 !h-3 !bg-blue-500 !border-2 !border-white !transition-opacity ${isConnected ? '!opacity-100' : '!opacity-0 group-hover:!opacity-100'}`;
  };

  return (
    <>
      <NodeResizer
        color="#2563eb"
        isVisible={selected}
        minWidth={200}
        minHeight={150}
        onResize={onResize}
        onResizeEnd={onResize}
        handleStyle={{
          width: 10,
          height: 10,
          borderRadius: 2,
        }}
        lineStyle={{
          borderWidth: 1,
          borderColor: '#2563eb',
        }}
      />
      <div className="w-full h-full relative group">
        <Handle id="top" type="source" position={Position.Top} className={getHandleClass('top')} style={{ top: 0, left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }} />
        <Handle id="left" type="source" position={Position.Left} className={getHandleClass('left')} style={{ left: 0, top: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }} />
        <Handle id="bottom" type="source" position={Position.Bottom} className={getHandleClass('bottom')} style={{ bottom: 0, left: '50%', transform: 'translate(-50%, 50%)', zIndex: 100 }} />
        <Handle id="right" type="source" position={Position.Right} className={getHandleClass('right')} style={{ right: 0, top: '50%', transform: 'translate(50%, -50%)', zIndex: 100 }} />

        <div className={`w-full h-full bg-white/80 dark:bg-zinc-900/80 border-2 ${colorConfig.border} rounded-lg transition-all overflow-hidden flex flex-col`}>
          <div className={`${colorConfig.bg} px-3 py-1.5 flex items-center gap-2 shrink-0`}>
            <BoxSelect className={`w-3.5 h-3.5 ${colorConfig.text}`} />
            <span className={`text-xs font-semibold ${colorConfig.text}`}>
              {data.label || 'Group'}
            </span>
          </div>
          <div className="flex-1" />
        </div>
      </div>
    </>
  );
});

GroupNode.displayName = "GroupNode";
