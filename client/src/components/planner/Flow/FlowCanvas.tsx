import React, { useState, useCallback, useMemo, useEffect, memo, useRef } from 'react';
import ReactFlow, {
  addEdge,
  updateEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  Handle,
  Position,
  BackgroundVariant,
  Panel,
  NodeProps,
  EdgeProps,
  getBezierPath,
  getStraightPath,
  getSmoothStepPath,
  BaseEdge,
  ReactFlowProvider,
  useReactFlow,
  useUpdateNodeInternals,
  ConnectionMode,
  EdgeLabelRenderer, // HTML 렌더링을 위해 필수
} from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import '@reactflow/node-resizer/dist/style.css';
import 'reactflow/dist/style.css';
// 경로가 다르다면 본인 프로젝트에 맞게 수정해주세요
import { SiteItem } from './SiteMapPanel'; 
import { Button } from '@/components/ui/button';
import { Plus, Layout, Globe, X, Circle, Square, Diamond, FileText, Spline, Minus, CornerDownRight, AlignHorizontalSpaceAround, AlignVerticalSpaceAround, MoreHorizontal, BoxSelect, Settings, ImageIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// 이미지 경로 확인 필요
import placeholderImage from "@assets/generated_images/modern_saas_dashboard_interface_screenshot.png";

type EdgeStyleType = 'bezier' | 'straight' | 'step';
type LineStyleType = 'solid' | 'dashed';

// 엣지 컨트롤 핸들 스타일
const handleStyle: React.CSSProperties = {
  width: 14,
  height: 14,
  background: '#3b82f6',
  borderRadius: '4px',
  cursor: 'pointer',
  border: '2px solid white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  pointerEvents: 'all',
};

// 엣지 라벨 컴포넌트
const EdgeLabelBox = ({ 
  label, 
  description, 
  labelX, 
  labelY,
  selected,
  id 
}: { 
  label?: string; 
  description?: string; 
  labelX: number; 
  labelY: number;
  selected?: boolean;
  id: string;
}) => {
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

// --- [수정됨] BezierEdge (곡선) ---
// 중앙에 원형 핸들이 생기며 곡률(Curvature) 조정 가능
const BezierEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data,
}: EdgeProps) => {
  const { setEdges, getZoom } = useReactFlow();
  const curvature = data?.curvature ?? 0.25;
  const [isHovered, setIsHovered] = useState(false);
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature,
  });

  const onControlMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const startY = event.clientY;
    const startCurvature = curvature;
    const zoom = getZoom();

    const onMouseMove = (moveEvent: MouseEvent) => {
      // 줌 레벨 반영하여 델타 계산
      const delta = (moveEvent.clientY - startY) / zoom;
      const newCurvature = Math.min(Math.max(startCurvature + delta * 0.01, -1.5), 1.5);
      
      setEdges((edges) => edges.map((e) => {
        if (e.id === id) {
          return {
            ...e,
            data: { ...e.data, curvature: newCurvature },
          };
        }
        return e;
      }));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <>
      <g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <path
          d={edgePath}
          fill="none"
          strokeWidth={20}
          stroke="transparent"
          style={{ cursor: 'pointer' }}
        />
        <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: (data?.strokeWidth || 2) + (selected ? 1 : 0) }} />
      </g>
      
      {(selected || isHovered) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 1000,
            }}
            className="nopan nodrag"
          >
            <div
              style={{ ...handleStyle, borderRadius: '50%', cursor: 'ns-resize' }}
              onMouseDown={onControlMouseDown}
              title="곡률 조정"
            />
          </div>
        </EdgeLabelRenderer>
      )}

      <EdgeLabelBox label={data?.label} description={data?.description} labelX={labelX} labelY={labelY} selected={selected} id={id} />
    </>
  );
};

// --- [수정됨] StepEdge (직각선) ---
// React Flow가 계산한 실제 경로 위(labelX, labelY)에 핸들 배치
// 가로/세로 방향을 자동 감지하여 적절한 축 이동 지원
const StepEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data,
}: EdgeProps) => {
  const { setEdges, getZoom } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);

  const predefinedCenterX = data?.centerX;
  const predefinedCenterY = data?.centerY;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
    centerX: predefinedCenterX,
    centerY: predefinedCenterY,
  });

  const onControlMouseDown = (event: React.MouseEvent, type: 'horizontal' | 'vertical') => {
    event.stopPropagation();
    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const zoom = getZoom();

    // 초기값이 없으면 현재 시각적 위치(labelX, labelY)를 기준으로 시작
    const initialCenterX = predefinedCenterX ?? labelX;
    const initialCenterY = predefinedCenterY ?? labelY;

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - startX) / zoom;
      const deltaY = (e.clientY - startY) / zoom;

      setEdges((edges) =>
        edges.map((edge) => {
          if (edge.id === id) {
            const newData = { ...edge.data };
            
            if (type === 'vertical') {
               // 세로선을 좌우로 이동
               newData.centerX = initialCenterX + deltaX;
               if (!newData.centerY) newData.centerY = undefined; 
            } else {
               // 가로선을 상하로 이동
               newData.centerY = initialCenterY + deltaY;
               if (!newData.centerX) newData.centerX = undefined;
            }
            return { ...edge, data: newData };
          }
          return edge;
        })
      );
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const isSourceVertical = sourcePosition === Position.Top || sourcePosition === Position.Bottom;
  
  // labelX, labelY를 그대로 사용하여 선 위에 정확히 위치
  const controlX = labelX;
  const controlY = labelY;
  
  const dragType = isSourceVertical ? 'horizontal' : 'vertical';
  const cursorStyle = isSourceVertical ? 'ns-resize' : 'ew-resize';

  return (
    <>
      <g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <path
          d={edgePath}
          fill="none"
          strokeWidth={20}
          stroke="transparent"
          style={{ cursor: 'pointer' }}
        />
        <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: (data?.strokeWidth || 2) + (selected ? 1 : 0) }} />
      </g>

      {(selected || isHovered) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${controlX}px,${controlY}px)`,
              pointerEvents: 'all',
              zIndex: 1000,
            }}
            className="nopan nodrag"
          >
            <div
              style={{
                ...handleStyle,
                cursor: cursorStyle,
              }}
              onMouseDown={(e) => onControlMouseDown(e, dragType)}
              title={dragType === 'horizontal' ? "상하 이동" : "좌우 이동"}
            />
          </div>
        </EdgeLabelRenderer>
      )}

      <EdgeLabelBox label={data?.label} description={data?.description} labelX={labelX} labelY={labelY} selected={selected} id={id} />
    </>
  );
};

// --- StraightEdge (직선) ---
const StraightEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  selected,
  data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: (data?.strokeWidth || 2) + (selected ? 1 : 0) }} />
      <EdgeLabelBox label={data?.label} description={data?.description} labelX={labelX} labelY={labelY} selected={selected} id={id} />
    </>
  );
};

const NODE_COLORS = [
  { id: 'blue', bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-white', bgLight: 'bg-blue-50' },
  { id: 'purple', bg: 'bg-purple-500', border: 'border-purple-400', text: 'text-white', bgLight: 'bg-purple-50' },
  { id: 'green', bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-white', bgLight: 'bg-emerald-50' },
  { id: 'orange', bg: 'bg-orange-500', border: 'border-orange-400', text: 'text-white', bgLight: 'bg-orange-50' },
  { id: 'red', bg: 'bg-red-500', border: 'border-red-400', text: 'text-white', bgLight: 'bg-red-50' },
  { id: 'pink', bg: 'bg-pink-500', border: 'border-pink-400', text: 'text-white', bgLight: 'bg-pink-50' },
  { id: 'cyan', bg: 'bg-cyan-500', border: 'border-cyan-400', text: 'text-white', bgLight: 'bg-cyan-50' },
  { id: 'gray', bg: 'bg-slate-500', border: 'border-slate-400', text: 'text-white', bgLight: 'bg-slate-50' },
];

const DecisionNode = memo(({ id, data, selected }: NodeProps) => {
  const colorId = data.color || 'orange';
  const colorConfig = NODE_COLORS.find(c => c.id === colorId) || NODE_COLORS[3];
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
        <Handle id="top" type="source" position={Position.Top} className={getHandleClass('top')} style={{ top: 0, left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }} />
        <Handle id="left" type="source" position={Position.Left} className={getHandleClass('left')} style={{ left: 0, top: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }} />
        <Handle id="bottom" type="source" position={Position.Bottom} className={getHandleClass('bottom')} style={{ bottom: 0, left: '50%', transform: 'translate(-50%, 50%)', zIndex: 100 }} />
        <Handle id="right" type="source" position={Position.Right} className={getHandleClass('right')} style={{ right: 0, top: '50%', transform: 'translate(50%, -50%)', zIndex: 100 }} />
        
        <div 
          className={`w-[70%] h-[70%] ${colorConfig.bg} border-2 ${colorConfig.border} shadow-lg flex items-center justify-center`}
          style={{ transform: 'rotate(45deg)' }}
        >
          <div 
            className="text-xs font-semibold text-center p-1"
            style={{ transform: 'rotate(-45deg)', color: colorConfig.text.replace('text-', '').includes('white') ? 'white' : undefined }}
          >
            <span className={colorConfig.text}>{data.label || 'Decision'}</span>
          </div>
        </div>
      </div>
    </>
  );
});

DecisionNode.displayName = "DecisionNode";

const ShapeNode = memo(({ id, data, selected }: NodeProps) => {
  const shapeType = data.shapeType || 'process';
  const updateNodeInternals = useUpdateNodeInternals();
  const connectedHandles: string[] = data.connectedHandles || [];
  const colorId = data.color || (shapeType === 'note' ? 'yellow' : 'gray');
  const colorConfig = NODE_COLORS.find(c => c.id === colorId) || NODE_COLORS[7];

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
          
          <div className="w-full h-full bg-yellow-100 border border-yellow-300 shadow-md relative">
            <div className="absolute top-0 right-0 w-6 h-6">
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[24px] border-l-yellow-200 border-b-[24px] border-b-white" />
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[24px] border-l-transparent border-b-[24px] border-b-yellow-300/50" style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }} />
            </div>
            <div className="p-3 pr-8 text-xs text-gray-700 h-full overflow-hidden">
              {data.label || 'Note'}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NodeResizer
        color="#2563eb"
        isVisible={selected}
        minWidth={60}
        minHeight={40}
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
      <div className="w-full h-full relative group flex flex-col">
        <Handle id="top" type="source" position={Position.Top} className={getHandleClass('top')} style={{ top: 0, left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }} />
        <Handle id="left" type="source" position={Position.Left} className={getHandleClass('left')} style={{ left: 0, top: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }} />
        <Handle id="bottom" type="source" position={Position.Bottom} className={getHandleClass('bottom')} style={{ bottom: 0, left: '50%', transform: 'translate(-50%, 50%)', zIndex: 100 }} />
        <Handle id="right" type="source" position={Position.Right} className={getHandleClass('right')} style={{ right: 0, top: '50%', transform: 'translate(50%, -50%)', zIndex: 100 }} />
        
        <div className={`flex-1 flex items-center justify-center ${colorConfig.bgLight} dark:bg-zinc-800/50 border-2 border-b-0 ${colorConfig.border} rounded-t-md shadow-sm transition-all hover:shadow-md`}>
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

ShapeNode.displayName = "ShapeNode";

interface Hotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

const ImageNode = memo(({ id, data, selected }: NodeProps) => {
  const [imgError, setImgError] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isDrawingHotspot, setIsDrawingHotspot] = useState(false);
  const [drawStart, setDrawStart] = useState<{x: number, y: number} | null>(null);
  const [currentDraw, setCurrentDraw] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const isUrl = data.image && !data.image.match(/\.(jpeg|jpg|gif|png|webp)$/) && data.image.startsWith('http');
  const connectedHandles: string[] = data.connectedHandles || [];
  const hotspots: Hotspot[] = data.hotspots || [];
  const colorId = data.color || 'blue';
  const colorConfig = NODE_COLORS.find(c => c.id === colorId) || NODE_COLORS[0];

  const onResize = useCallback(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);

  useEffect(() => {
    if (hotspots.length > 0) {
      updateNodeInternals(id);
    }
  }, [hotspots.length, id, updateNodeInternals]);

  const getHandleClass = (handleId: string) => {
    const isConnected = connectedHandles.includes(handleId);
    return `!w-4 !h-4 !bg-blue-500 !border-2 !border-white !transition-opacity ${isConnected ? '!opacity-100' : '!opacity-0 group-hover:!opacity-100'}`;
  };

  const handleImageUrlSubmit = () => {
    if (imageUrl.trim()) {
      window.dispatchEvent(new CustomEvent('flow-update-node', {
        detail: { nodeId: id, updates: { data: { ...data, image: imageUrl.trim() } } }
      }));
      setImageUrl('');
      setShowImageInput(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        window.dispatchEvent(new CustomEvent('flow-update-node', {
          detail: { nodeId: id, updates: { data: { ...data, image: base64 } } }
        }));
      };
      reader.readAsDataURL(file);
    }
    setShowImageInput(false);
  };

  const handleHotspotDrawStart = (e: React.MouseEvent) => {
    if (!isDrawingHotspot || !contentRef.current) return;
    e.stopPropagation();
    const rect = contentRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDrawStart({ x, y });
    setCurrentDraw({ x, y, w: 0, h: 0 });
  };

  const handleHotspotDrawMove = (e: React.MouseEvent) => {
    if (!drawStart || !contentRef.current) return;
    e.stopPropagation();
    const rect = contentRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;
    const x = Math.min(drawStart.x, currentX);
    const y = Math.min(drawStart.y, currentY);
    const w = Math.abs(currentX - drawStart.x);
    const h = Math.abs(currentY - drawStart.y);
    setCurrentDraw({ x, y, w, h });
  };

  const handleHotspotDrawEnd = (e: React.MouseEvent) => {
    if (!currentDraw || currentDraw.w < 3 || currentDraw.h < 3) {
      setDrawStart(null);
      setCurrentDraw(null);
      return;
    }
    e.stopPropagation();
    const newHotspot: Hotspot = {
      id: `hotspot-${Date.now()}`,
      x: currentDraw.x,
      y: currentDraw.y,
      width: currentDraw.w,
      height: currentDraw.h,
    };
    const updatedHotspots = [...hotspots, newHotspot];
    window.dispatchEvent(new CustomEvent('flow-update-node', {
      detail: { nodeId: id, updates: { data: { ...data, hotspots: updatedHotspots } } }
    }));
    setDrawStart(null);
    setCurrentDraw(null);
    setIsDrawingHotspot(false);
  };

  const handleDeleteHotspot = (hotspotId: string) => {
    const updatedHotspots = hotspots.filter(h => h.id !== hotspotId);
    window.dispatchEvent(new CustomEvent('flow-update-node', {
      detail: { nodeId: id, updates: { data: { ...data, hotspots: updatedHotspots } } }
    }));
    setSelectedHotspotId(null);
  };

  return (
    <>
      <NodeResizer
        color="#2563eb"
        isVisible={selected}
        minWidth={120}
        minHeight={100}
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
        
        {hotspots.map((hotspot) => (
          <Handle
            key={hotspot.id}
            id={hotspot.id}
            type="source"
            position={Position.Right}
            className={`!w-3 !h-3 !bg-orange-500 !border-2 !border-white !opacity-100`}
            style={{
              top: `${hotspot.y + hotspot.height / 2}%`,
              left: `${hotspot.x + hotspot.width}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 100
            }}
          />
        ))}
        
        <div className={`w-full h-full shadow-xl rounded-lg overflow-hidden border-2 ${colorConfig.border} transition-all flex flex-col`}>
          <div className={`${colorConfig.bg} px-2 py-1 flex items-center gap-1.5 shrink-0`}>
            <Layout className={`w-3 h-3 ${colorConfig.text}`} />
            <span className={`text-[10px] font-semibold ${colorConfig.text} truncate flex-1`}>
              {data.label || 'Screen'}
            </span>
            <button
              className={`p-0.5 rounded transition-colors ${isDrawingHotspot ? 'bg-orange-500 text-white' : `hover:bg-white/20 ${colorConfig.text}`}`}
              onClick={(e) => { e.stopPropagation(); setIsDrawingHotspot(!isDrawingHotspot); }}
              title="핫스팟 영역 그리기"
            >
              <BoxSelect className="w-3 h-3" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className={`p-0.5 rounded hover:bg-white/20 transition-colors ${colorConfig.text}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Settings className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setShowImageInput(true)}>
                  <Globe className="w-4 h-4 mr-2" />
                  이미지 URL 입력
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  파일에서 이미지 추가
                </DropdownMenuItem>
                {data.image && (
                  <DropdownMenuItem 
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('flow-update-node', {
                        detail: { nodeId: id, updates: { data: { ...data, image: undefined } } }
                      }));
                    }}
                    className="text-destructive"
                  >
                    <X className="w-4 h-4 mr-2" />
                    이미지 제거
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
          <div 
            ref={contentRef}
            className={`flex-1 overflow-hidden bg-muted relative group-hover:shadow-inner transition-shadow ${isDrawingHotspot ? 'cursor-crosshair' : ''}`}
            onMouseDown={handleHotspotDrawStart}
            onMouseMove={handleHotspotDrawMove}
            onMouseUp={handleHotspotDrawEnd}
            onMouseLeave={() => { setDrawStart(null); setCurrentDraw(null); }}
          >
            {showImageInput && (
              <div className="absolute inset-0 z-10 bg-white dark:bg-zinc-800 p-3 flex flex-col gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="이미지 URL 입력..."
                  className="w-full px-2 py-1 text-xs border rounded"
                  onKeyDown={(e) => e.key === 'Enter' && handleImageUrlSubmit()}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleImageUrlSubmit}
                    className="flex-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    추가
                  </button>
                  <button
                    onClick={() => { setShowImageInput(false); setImageUrl(''); }}
                    className="flex-1 px-2 py-1 text-xs border rounded hover:bg-muted"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
            {data.image && !imgError ? (
              isUrl ? (
                <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-muted-foreground flex-col gap-2 p-4 text-center">
                  <Globe className="w-8 h-8 opacity-50" />
                  <span className="text-[10px] break-all opacity-70">{data.image}</span>
                  <img src={placeholderImage} alt="Website Placeholder" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                </div>
              ) : (
                <img 
                  src={data.image} 
                  alt={data.label} 
                  className="w-full h-full object-cover pointer-events-none" 
                  onError={() => setImgError(true)}
                />
              )
            ) : !showImageInput ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground flex-col gap-1 bg-zinc-100 dark:bg-zinc-800">
                <Layout className="w-6 h-6 opacity-20" />
                <span>No Preview</span>
              </div>
            ) : null}
            
            {hotspots.map((hotspot) => (
              <div
                key={hotspot.id}
                className={`absolute border-2 rounded transition-all cursor-pointer ${
                  selectedHotspotId === hotspot.id 
                    ? 'border-orange-500 bg-orange-500/30' 
                    : 'border-orange-400/70 bg-orange-400/20 hover:bg-orange-400/30'
                }`}
                style={{
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y}%`,
                  width: `${hotspot.width}%`,
                  height: `${hotspot.height}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedHotspotId(selectedHotspotId === hotspot.id ? null : hotspot.id);
                }}
              >
                {selectedHotspotId === hotspot.id && (
                  <button
                    className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteHotspot(hotspot.id);
                    }}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            ))}
            
            {currentDraw && (
              <div
                className="absolute border-2 border-dashed border-orange-500 bg-orange-500/20 pointer-events-none"
                style={{
                  left: `${currentDraw.x}%`,
                  top: `${currentDraw.y}%`,
                  width: `${currentDraw.w}%`,
                  height: `${currentDraw.h}%`,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
});

ImageNode.displayName = "ImageNode";

const GroupNode = memo(({ id, data, selected }: NodeProps) => {
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

const nodeTypes = {
  imageNode: ImageNode,
  shapeNode: ShapeNode,
  decisionNode: DecisionNode,
  groupNode: GroupNode,
};

const edgeTypes = {
  bezier: BezierEdge,
  straight: StraightEdge,
  step: StepEdge,
};

interface FlowCanvasProps {
  flowId: string;
  availableItems: SiteItem[];
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onSelectionChange?: (selectedNodes: Node[], allNodes: Node[], selectedEdges: Edge[], allEdges: Edge[]) => void;
  onNodesUpdate?: (nodes: Node[]) => void;
}

function FlowCanvasInner({ flowId, availableItems, initialNodes, initialEdges, onSave, onSelectionChange, onNodesUpdate }: FlowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges || []);
  const [edgeStyle, setEdgeStyle] = useState<EdgeStyleType>('step');
  const [lineStyle, setLineStyle] = useState<LineStyleType>('solid');
  const { screenToFlowPosition, getIntersectingNodes } = useReactFlow();

  // Track selection changes
  const onSelectionChangeHandler = useCallback((params: { nodes: Node[], edges: Edge[] }) => {
    onSelectionChange?.(params.nodes, nodes, params.edges, edges);
  }, [nodes, edges, onSelectionChange]);

  // Notify parent of nodes updates
  useEffect(() => {
    onNodesUpdate?.(nodes);
  }, [nodes, onNodesUpdate]);

  // Helper function to calculate absolute position through ancestor chain
  const getAbsolutePosition = useCallback((nodeId: string, nodes: Node[]): { x: number; y: number } => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    
    let x = node.position.x;
    let y = node.position.y;
    let currentParentId = node.parentNode;
    
    while (currentParentId) {
      const parent = nodes.find(n => n.id === currentParentId);
      if (parent) {
        x += parent.position.x;
        y += parent.position.y;
        currentParentId = parent.parentNode;
      } else {
        break;
      }
    }
    
    return { x, y };
  }, []);

  // Helper function to get group's absolute position
  const getGroupAbsolutePosition = useCallback((groupId: string, nodes: Node[]): { x: number; y: number } => {
    return getAbsolutePosition(groupId, nodes);
  }, [getAbsolutePosition]);

  // Listen for external node updates
  useEffect(() => {
    const handleUpdateNode = (e: CustomEvent<{ nodeId: string; updates: Partial<Node> }>) => {
      setNodes((nds) => nds.map(n => 
        n.id === e.detail.nodeId 
          ? { ...n, ...e.detail.updates, data: { ...n.data, ...e.detail.updates.data } }
          : n
      ));
    };

    const handleRemoveFromGroup = (e: CustomEvent<{ nodeId: string }>) => {
      setNodes((nds) => {
        const node = nds.find(n => n.id === e.detail.nodeId);
        if (!node?.parentNode) return nds;
        
        // Calculate absolute position through entire ancestor chain
        const absolutePos = getAbsolutePosition(e.detail.nodeId, nds);
        
        return nds.map(n => {
          if (n.id === e.detail.nodeId) {
            return {
              ...n,
              position: absolutePos,
              parentNode: undefined,
              extent: undefined,
              style: { ...n.style, zIndex: undefined },
            };
          }
          return n;
        });
      });
    };

    const handleAddToGroup = (e: CustomEvent<{ nodeId: string; groupId: string }>) => {
      setNodes((nds) => {
        const node = nds.find(n => n.id === e.detail.nodeId);
        const group = nds.find(n => n.id === e.detail.groupId);
        if (!node || !group) return nds;

        // Get node's absolute position (accounting for any current parent chain)
        const nodeAbsolutePos = getAbsolutePosition(e.detail.nodeId, nds);
        
        // Get target group's absolute position (accounting for any parent chain)
        const groupAbsolutePos = getGroupAbsolutePosition(e.detail.groupId, nds);

        // Calculate relative position to new group
        const relativeX = nodeAbsolutePos.x - groupAbsolutePos.x;
        const relativeY = nodeAbsolutePos.y - groupAbsolutePos.y;
        
        return nds.map(n => {
          if (n.id === e.detail.nodeId) {
            return {
              ...n,
              position: { x: relativeX, y: relativeY },
              parentNode: e.detail.groupId,
              extent: 'parent' as const,
              style: { ...n.style, zIndex: 10 },
            };
          }
          return n;
        });
      });
    };

    window.addEventListener('flow-update-node', handleUpdateNode as EventListener);
    window.addEventListener('flow-remove-from-group', handleRemoveFromGroup as EventListener);
    window.addEventListener('flow-add-to-group', handleAddToGroup as EventListener);

    return () => {
      window.removeEventListener('flow-update-node', handleUpdateNode as EventListener);
      window.removeEventListener('flow-remove-from-group', handleRemoveFromGroup as EventListener);
      window.removeEventListener('flow-add-to-group', handleAddToGroup as EventListener);
    };
  }, [setNodes, getAbsolutePosition, getGroupAbsolutePosition]);

  const getConnectionLineStyle = () => {
    switch (edgeStyle) {
      case 'straight': return 'straight';
      case 'step': return 'smoothstep';
      case 'bezier': 
      default: return 'bezier';
    }
  };

  useEffect(() => {
    if (initialNodes) setNodes(initialNodes);
    if (initialEdges) setEdges(initialEdges.map(e => ({ ...e, type: edgeStyle })));
  }, [flowId, initialNodes, initialEdges, setNodes, setEdges, edgeStyle]);

  useEffect(() => {
    const handleDeleteEdge = (e: CustomEvent) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== e.detail.id));
    };
    window.addEventListener('delete-edge', handleDeleteEdge as EventListener);
    return () => window.removeEventListener('delete-edge', handleDeleteEdge as EventListener);
  }, [setEdges]);

  useEffect(() => {
    const handleUpdateEdge = (e: CustomEvent<{ edgeId: string; updates: Partial<Edge> }>) => {
      setEdges((eds) => eds.map(edge => 
        edge.id === e.detail.edgeId 
          ? { 
              ...edge, 
              ...e.detail.updates,
              style: { ...edge.style, ...e.detail.updates.style },
              data: { ...edge.data, ...e.detail.updates.data }
            }
          : edge
      ));
    };
    window.addEventListener('flow-update-edge', handleUpdateEdge as EventListener);
    return () => window.removeEventListener('flow-update-edge', handleUpdateEdge as EventListener);
  }, [setEdges]);

  useEffect(() => {
    setEdges((eds) => eds.map(e => {
      if (e.data?.edgeStyle) {
        return e;
      }
      return { ...e, type: edgeStyle };
    }));
  }, [edgeStyle, setEdges]);

  // Track connected handles for each node
  const connectedHandles = useMemo(() => {
    const handles: Record<string, Set<string>> = {};
    edges.forEach(edge => {
      if (edge.source) {
        if (!handles[edge.source]) handles[edge.source] = new Set();
        if (edge.sourceHandle) handles[edge.source].add(edge.sourceHandle);
      }
      if (edge.target) {
        if (!handles[edge.target]) handles[edge.target] = new Set();
        if (edge.targetHandle) handles[edge.target].add(edge.targetHandle);
      }
    });
    return handles;
  }, [edges]);

  // Update nodes with connected handles info
  useEffect(() => {
    setNodes((nds) => nds.map(node => ({
      ...node,
      data: {
        ...node.data,
        connectedHandles: connectedHandles[node.id] ? Array.from(connectedHandles[node.id]) : []
      }
    })));
  }, [connectedHandles, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
      ...params, 
      type: edgeStyle, 
      animated: false, 
      style: { 
        stroke: '#64748b', 
        strokeWidth: 2,
        strokeDasharray: lineStyle === 'dashed' ? '8 4' : 'none',
      } 
    }, eds)),
    [setEdges, edgeStyle, lineStyle],
  );

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => setEdges((els) => updateEdge(oldEdge, newConnection, els)),
    [setEdges]
  );

  // Handle node drag stop to detect group containment
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      // Skip if dragging a group node itself
      if (node.type === 'groupNode') return;

      // Get the node's absolute position
      const nodeAbsolutePos = getAbsolutePosition(node.id, nodes);
      const nodeWidth = (node.style?.width as number) || 150;
      const nodeHeight = (node.style?.height as number) || 80;
      const nodeCenterX = nodeAbsolutePos.x + nodeWidth / 2;
      const nodeCenterY = nodeAbsolutePos.y + nodeHeight / 2;

      // Find all group nodes and their absolute positions
      const groupNodes = nodes.filter(n => n.type === 'groupNode' && n.id !== node.parentNode);
      
      // Check if the dragged node is inside any group (excluding current parent)
      let foundGroup: Node | null = null;
      for (const group of groupNodes) {
        const groupAbsolutePos = getAbsolutePosition(group.id, nodes);
        const groupWidth = (group.style?.width as number) || 300;
        const groupHeight = (group.style?.height as number) || 200;
        
        // Check if node center is inside group bounds (using absolute positions)
        if (
          nodeCenterX > groupAbsolutePos.x &&
          nodeCenterX < groupAbsolutePos.x + groupWidth &&
          nodeCenterY > groupAbsolutePos.y &&
          nodeCenterY < groupAbsolutePos.y + groupHeight
        ) {
          foundGroup = group;
          break;
        }
      }

      setNodes((nds) => 
        nds.map((n) => {
          if (n.id === node.id) {
            if (foundGroup) {
              // Add to group - get group's absolute position and calculate relative
              const groupAbsolutePos = getAbsolutePosition(foundGroup.id, nds);
              const relativeX = nodeAbsolutePos.x - groupAbsolutePos.x;
              const relativeY = nodeAbsolutePos.y - groupAbsolutePos.y;
              return {
                ...n,
                position: { x: relativeX, y: relativeY },
                parentNode: foundGroup.id,
                extent: 'parent' as const,
                style: { ...n.style, zIndex: 10 },
              };
            } else if (n.parentNode) {
              // Check if we're still inside current parent
              const currentParent = nds.find(pn => pn.id === n.parentNode);
              if (currentParent) {
                const parentAbsolutePos = getAbsolutePosition(currentParent.id, nds);
                const parentWidth = (currentParent.style?.width as number) || 300;
                const parentHeight = (currentParent.style?.height as number) || 200;
                
                // If node center is outside parent, remove from group
                if (
                  nodeCenterX < parentAbsolutePos.x ||
                  nodeCenterX > parentAbsolutePos.x + parentWidth ||
                  nodeCenterY < parentAbsolutePos.y ||
                  nodeCenterY > parentAbsolutePos.y + parentHeight
                ) {
                  return {
                    ...n,
                    position: nodeAbsolutePos,
                    parentNode: undefined,
                    extent: undefined,
                    style: { ...n.style, zIndex: undefined },
                  };
                }
              }
            }
          }
          return n;
        })
      );
    },
    [nodes, setNodes, getAbsolutePosition]
  );

  const handleAddNode = (item: SiteItem) => {
    const newNode: Node = {
      id: `${item.id}-${Date.now()}`,
      type: 'imageNode',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: { 
        label: item.name, 
        image: item.url 
      },
      style: { width: 240, height: 200 },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const onDragStart = (event: React.DragEvent, nodeType: string, shapeType?: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    if (shapeType) {
      event.dataTransfer.setData('application/shapeType', shapeType);
    }
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const shapeType = event.dataTransfer.getData('application/shapeType');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      let newNodeData: any = { label: 'New Node' };
      let style: React.CSSProperties = { width: 150, height: 80 };

      let nodeType = type;
      
      if (type === 'shapeNode') {
        newNodeData = { label: shapeType ? shapeType.charAt(0).toUpperCase() + shapeType.slice(1) : 'Shape', shapeType };
        if (shapeType === 'start' || shapeType === 'end') style = { width: 80, height: 80 };
        if (shapeType === 'decision') {
          style = { width: 100, height: 100 };
          nodeType = 'decisionNode';
        }
        if (shapeType === 'note') style = { width: 180, height: 120 };
        if (shapeType === 'process') style = { width: 150, height: 80 };
      }
      
      if (type === 'groupNode') {
        newNodeData = { label: 'Group' };
        style = { width: 300, height: 200, zIndex: -1 };
      }

      const newNode: Node = {
        id: `dndnode_${Date.now()}`,
        type: nodeType,
        position,
        data: newNodeData,
        style
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  const autoLayoutHorizontal = useCallback(() => {
    const GAP = 50;
    
    setNodes((nds) => {
      // Get selected nodes
      const selectedNodes = nds.filter(n => n.selected);
      if (selectedNodes.length < 2) return nds;
      
      // Find the leftmost position and average Y
      const minX = Math.min(...selectedNodes.map(n => n.position.x));
      const avgY = selectedNodes.reduce((sum, n) => sum + n.position.y, 0) / selectedNodes.length;
      
      // Sort selected by current X position
      const sorted = [...selectedNodes].sort((a, b) => a.position.x - b.position.x);
      
      let currentX = minX;
      const positionMap = new Map<string, { x: number; y: number }>();
      
      sorted.forEach(node => {
        const nodeWidth = (node.style?.width as number) || 150;
        positionMap.set(node.id, {
          x: currentX,
          y: avgY,
        });
        currentX += nodeWidth + GAP;
      });
      
      return nds.map(node => {
        const newPos = positionMap.get(node.id);
        if (newPos) {
          return { ...node, position: newPos };
        }
        return node;
      });
    });
  }, [setNodes]);

  const autoLayoutVertical = useCallback(() => {
    const GAP = 50;
    
    setNodes((nds) => {
      // Get selected nodes
      const selectedNodes = nds.filter(n => n.selected);
      if (selectedNodes.length < 2) return nds;
      
      // Find the topmost position and average X
      const minY = Math.min(...selectedNodes.map(n => n.position.y));
      const avgX = selectedNodes.reduce((sum, n) => sum + n.position.x, 0) / selectedNodes.length;
      
      // Sort selected by current Y position
      const sorted = [...selectedNodes].sort((a, b) => a.position.y - b.position.y);
      
      let currentY = minY;
      const positionMap = new Map<string, { x: number; y: number }>();
      
      sorted.forEach(node => {
        const nodeHeight = (node.style?.height as number) || 80;
        positionMap.set(node.id, {
          x: avgX,
          y: currentY,
        });
        currentY += nodeHeight + GAP;
      });
      
      return nds.map(node => {
        const newPos = positionMap.get(node.id);
        if (newPos) {
          return { ...node, position: newPos };
        }
        return node;
      });
    });
  }, [setNodes]);

  const getAddableItems = (items: SiteItem[]): SiteItem[] => {
    let result: SiteItem[] = [];
    items.forEach(item => {
      if (item.type === 'page' || item.type === 'image') {
        result.push(item);
      }
      if (item.children) {
        result = [...result, ...getAddableItems(item.children)];
      }
    });
    return result;
  };

  const addableItems = useMemo(() => getAddableItems(availableItems), [availableItems]);

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-zinc-950 relative" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeUpdate={onEdgeUpdate}
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={onSelectionChangeHandler}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-right"
        deleteKeyCode={['Backspace', 'Delete']}
        connectionMode={ConnectionMode.Loose}
        edgesUpdatable={true}
        edgesFocusable={true}
        elementsSelectable={true}
        multiSelectionKeyCode="Meta"
        selectionKeyCode="Meta"
        connectionLineType={getConnectionLineStyle() as any}
        connectionLineStyle={{ 
          stroke: '#64748b', 
          strokeWidth: 2,
          strokeDasharray: lineStyle === 'dashed' ? '8 4' : 'none',
        }}
        defaultEdgeOptions={{ animated: false }}
      >
        <Background color="#94a3b8" variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls showInteractive={false} className="!bg-white dark:!bg-zinc-900 !border-border !shadow-sm" />
        <MiniMap 
          className="!bg-white dark:!bg-zinc-900 !border-border !shadow-sm rounded-lg overflow-hidden" 
          maskColor="rgba(0,0,0,0.1)"
          nodeColor={() => '#e2e8f0'}
        />
        
        <Panel position="top-left" className="m-4 flex flex-col gap-2">
          <div className="bg-background/80 backdrop-blur-sm border border-border rounded-md flex items-center p-1 shadow-sm gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="shadow-sm gap-2 h-8" size="sm">
                  <Plus className="w-4 h-4" />
                  Screens
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-h-80 overflow-y-auto">
                {addableItems.length > 0 ? (
                  addableItems.map(item => (
                    <DropdownMenuItem key={item.id} onClick={() => handleAddNode(item)}>
                      {item.type === 'image' ? <Layout className="w-4 h-4 mr-2 text-purple-500" /> : <Layout className="w-4 h-4 mr-2 text-blue-500" />}
                      <span className="truncate">{item.name}</span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-2 text-xs text-muted-foreground text-center">No screens available</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-4 bg-border mx-1" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <div className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing" onDragStart={(event) => onDragStart(event, 'shapeNode', 'start')} draggable>
                      <Circle className="w-5 h-5 text-slate-700 fill-slate-900" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Start/End</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing" onDragStart={(event) => onDragStart(event, 'shapeNode', 'process')} draggable>
                    <Square className="w-5 h-5 text-slate-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Process</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing" onDragStart={(event) => onDragStart(event, 'shapeNode', 'decision')} draggable>
                    <Diamond className="w-5 h-5 text-amber-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Decision</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing" onDragStart={(event) => onDragStart(event, 'shapeNode', 'note')} draggable>
                    <FileText className="w-5 h-5 text-yellow-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Note</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing" onDragStart={(event) => onDragStart(event, 'groupNode', 'group')} draggable>
                    <BoxSelect className="w-5 h-5 text-slate-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Group</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-px h-4 bg-border mx-1" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={edgeStyle === 'bezier' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setEdgeStyle('bezier')}
                  >
                    <Spline className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Curved Line</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={edgeStyle === 'straight' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setEdgeStyle('straight')}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Straight Line</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={edgeStyle === 'step' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setEdgeStyle('step')}
                  >
                    <CornerDownRight className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Step Line</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-px h-4 bg-border mx-1" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={lineStyle === 'solid' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setLineStyle('solid')}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Solid Line</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={lineStyle === 'dashed' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setLineStyle('dashed')}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Dashed Line</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-px h-4 bg-border mx-1" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={autoLayoutHorizontal}
                  >
                    <AlignHorizontalSpaceAround className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Horizontal Layout</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={autoLayoutVertical}
                  >
                    <AlignVerticalSpaceAround className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Vertical Layout</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function FlowCanvas(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

export default FlowCanvas;