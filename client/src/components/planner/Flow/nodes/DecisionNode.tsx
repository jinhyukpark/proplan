import React, { memo, useCallback } from 'react';
import { NodeProps, Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { NODE_COLORS } from '../types';

export const DecisionNode = memo(({ id, data, selected }: NodeProps) => {
  const colorId = data.color || 'orange';
  const colorConfig = NODE_COLORS.find((c) => c.id === colorId) || NODE_COLORS[3];
  const updateNodeInternals = useUpdateNodeInternals();
  const connectedHandles: string[] = data.connectedHandles || [];

  const onResize = useCallback(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);

  const getHandleClass = (handleId: string) => {
    const isConnected = connectedHandles.includes(handleId);
    return `!w-4 !h-4 !bg-blue-500 !border-2 !border-white !transition-opacity ${isConnected ? '!opacity-100' : '!opacity-0 group-hover:!opacity-100'}`;
  };

  return (
    <>
      <NodeResizer
        color="#2563eb"
        isVisible={selected}
        minWidth={100}
        minHeight={100}
        onResize={onResize}
        onResizeEnd={onResize}
        keepAspectRatio={true}
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
      <div className="w-full h-full relative group flex items-center justify-center">
        <Handle
          id="top"
          type="source"
          position={Position.Top}
          className={getHandleClass('top')}
          style={{ top: 0, left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }}
        />
        <Handle
          id="left"
          type="source"
          position={Position.Left}
          className={getHandleClass('left')}
          style={{ left: 0, top: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }}
        />
        <Handle
          id="bottom"
          type="source"
          position={Position.Bottom}
          className={getHandleClass('bottom')}
          style={{ bottom: 0, left: '50%', transform: 'translate(-50%, 50%)', zIndex: 100 }}
        />
        <Handle
          id="right"
          type="source"
          position={Position.Right}
          className={getHandleClass('right')}
          style={{ right: 0, top: '50%', transform: 'translate(50%, -50%)', zIndex: 100 }}
        />

        <div
          className={`w-[70%] h-[70%] ${colorConfig.bg} border-2 ${colorConfig.border} shadow-lg flex items-center justify-center`}
          style={{ transform: 'rotate(45deg)' }}
        >
          <div
            className="text-xs font-semibold text-center p-1"
            style={{
              transform: 'rotate(-45deg)',
              color: colorConfig.text.replace('text-', '').includes('white') ? 'white' : undefined,
            }}
          >
            <span className={colorConfig.text}>{data.label || 'Decision'}</span>
          </div>
        </div>
      </div>
    </>
  );
});

DecisionNode.displayName = 'DecisionNode';
