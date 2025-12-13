import React, { memo, useCallback } from 'react';
import { NodeProps, Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { Square } from 'lucide-react';
import { NODE_COLORS } from '../types';

export const ShapeNode = memo(({ id, data, selected }: NodeProps) => {
  const shapeType = data.shapeType || 'process';
  const updateNodeInternals = useUpdateNodeInternals();
  const connectedHandles: string[] = data.connectedHandles || [];
  const colorId = data.color || (shapeType === 'note' ? 'yellow' : 'gray');
  const colorConfig = NODE_COLORS.find((c) => c.id === colorId) || NODE_COLORS[7];

  const onResize = useCallback(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);

  const getHandleClass = (handleId: string) => {
    const isConnected = connectedHandles.includes(handleId);
    return `!w-3 !h-3 !bg-blue-500 !border-2 !border-white !transition-opacity ${isConnected ? '!opacity-100' : '!opacity-0 group-hover:!opacity-100'}`;
  };

  if (shapeType === 'start') {
    return (
      <>
        <NodeResizer
          color="#2563eb"
          isVisible={selected}
          minWidth={60}
          minHeight={60}
          onResize={onResize}
          onResizeEnd={onResize}
          keepAspectRatio={true}
          handleStyle={{ width: 10, height: 10, borderRadius: 2 }}
          lineStyle={{ borderWidth: 1, borderColor: '#2563eb' }}
        />
        <div className="w-full h-full relative group flex items-center justify-center">
          <Handle id="top" type="source" position={Position.Top} className={getHandleClass('top')} style={{ top: 0, left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }} />
          <Handle id="left" type="source" position={Position.Left} className={getHandleClass('left')} style={{ left: 0, top: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }} />
          <Handle id="bottom" type="source" position={Position.Bottom} className={getHandleClass('bottom')} style={{ bottom: 0, left: '50%', transform: 'translate(-50%, 50%)', zIndex: 100 }} />
          <Handle id="right" type="source" position={Position.Right} className={getHandleClass('right')} style={{ right: 0, top: '50%', transform: 'translate(50%, -50%)', zIndex: 100 }} />

          <div className="w-full h-full rounded-full bg-black border-4 border-gray-700 shadow-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">{data.label || 'Start'}</span>
          </div>
        </div>
      </>
    );
  }

  if (shapeType === 'end') {
    return (
      <>
        <NodeResizer
          color="#2563eb"
          isVisible={selected}
          minWidth={60}
          minHeight={60}
          onResize={onResize}
          onResizeEnd={onResize}
          keepAspectRatio={true}
          handleStyle={{ width: 10, height: 10, borderRadius: 2 }}
          lineStyle={{ borderWidth: 1, borderColor: '#2563eb' }}
        />
        <div className="w-full h-full relative group flex items-center justify-center">
          <Handle id="top" type="source" position={Position.Top} className={getHandleClass('top')} style={{ top: 0, left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }} />
          <Handle id="left" type="source" position={Position.Left} className={getHandleClass('left')} style={{ left: 0, top: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }} />
          <Handle id="bottom" type="source" position={Position.Bottom} className={getHandleClass('bottom')} style={{ bottom: 0, left: '50%', transform: 'translate(-50%, 50%)', zIndex: 100 }} />
          <Handle id="right" type="source" position={Position.Right} className={getHandleClass('right')} style={{ right: 0, top: '50%', transform: 'translate(50%, -50%)', zIndex: 100 }} />

          <div className="w-full h-full rounded-full bg-black border-4 border-gray-700 shadow-lg flex items-center justify-center">
            <div className="w-[60%] h-[60%] rounded-full bg-white" />
          </div>
        </div>
      </>
    );
  }

  if (shapeType === 'note') {
    return (
      <>
        <NodeResizer
          color="#2563eb"
          isVisible={selected}
          minWidth={120}
          minHeight={80}
          onResize={onResize}
          onResizeEnd={onResize}
          handleStyle={{ width: 10, height: 10, borderRadius: 2 }}
          lineStyle={{ borderWidth: 1, borderColor: '#2563eb' }}
        />
        <div className="w-full h-full relative group">
          <Handle id="top" type="source" position={Position.Top} className={getHandleClass('top')} style={{ top: 0, left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }} />
          <Handle id="left" type="source" position={Position.Left} className={getHandleClass('left')} style={{ left: 0, top: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }} />
          <Handle id="bottom" type="source" position={Position.Bottom} className={getHandleClass('bottom')} style={{ bottom: 0, left: '50%', transform: 'translate(-50%, 50%)', zIndex: 100 }} />
          <Handle id="right" type="source" position={Position.Right} className={getHandleClass('right')} style={{ right: 0, top: '50%', transform: 'translate(50%, -50%)', zIndex: 100 }} />

          <div className="w-full h-full bg-yellow-100 border border-yellow-300 shadow-md relative">
            <div className="absolute top-0 right-0 w-6 h-6">
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[24px] border-l-yellow-200 border-b-[24px] border-b-white" />
              <div
                className="absolute top-0 right-0 w-0 h-0 border-l-[24px] border-l-transparent border-b-[24px] border-b-yellow-300/50"
                style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
              />
            </div>
            <div className="p-3 pr-8 text-xs text-gray-700 h-full overflow-hidden">
              {data.label || 'Note'}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Process (default)
  return (
    <>
      <NodeResizer
        color="#2563eb"
        isVisible={selected}
        minWidth={60}
        minHeight={40}
        onResize={onResize}
        onResizeEnd={onResize}
        handleStyle={{ width: 10, height: 10, borderRadius: 2 }}
        lineStyle={{ borderWidth: 1, borderColor: '#2563eb' }}
      />
      <div className="w-full h-full relative group flex flex-col">
        <Handle id="top" type="source" position={Position.Top} className={getHandleClass('top')} style={{ top: 0, left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }} />
        <Handle id="left" type="source" position={Position.Left} className={getHandleClass('left')} style={{ left: 0, top: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }} />
        <Handle id="bottom" type="source" position={Position.Bottom} className={getHandleClass('bottom')} style={{ bottom: 0, left: '50%', transform: 'translate(-50%, 50%)', zIndex: 100 }} />
        <Handle id="right" type="source" position={Position.Right} className={getHandleClass('right')} style={{ right: 0, top: '50%', transform: 'translate(50%, -50%)', zIndex: 100 }} />

        <div
          className={`flex-1 flex items-center justify-center ${colorConfig.bgLight} dark:bg-zinc-800/50 border-2 border-b-0 ${colorConfig.border} rounded-t-md shadow-sm transition-all hover:shadow-md`}
        >
          <div className="text-xs font-medium text-center p-2 break-words w-full h-full flex items-center justify-center">
            {data.label}
          </div>
        </div>
        <div className={`${colorConfig.bg} px-2 py-1 flex items-center gap-1.5 shrink-0 rounded-b-md`}>
          <Square className={`w-3 h-3 ${colorConfig.text}`} />
          <span className={`text-[10px] font-semibold ${colorConfig.text} truncate`}>
            {shapeType === 'start' ? 'Start' : shapeType === 'end' ? 'End' : 'Process'}
          </span>
        </div>
      </div>
    </>
  );
});

ShapeNode.displayName = 'ShapeNode';
