import React from 'react';

export type EdgeStyleType = 'bezier' | 'straight' | 'step';
export type LineStyleType = 'solid' | 'dashed';

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface NodeColorConfig {
  id: string;
  bg: string;
  border: string;
  text: string;
  bgLight: string;
}

export const NODE_COLORS: NodeColorConfig[] = [
  { id: 'blue', bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-white', bgLight: 'bg-blue-50' },
  { id: 'purple', bg: 'bg-purple-500', border: 'border-purple-400', text: 'text-white', bgLight: 'bg-purple-50' },
  { id: 'green', bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-white', bgLight: 'bg-emerald-50' },
  { id: 'orange', bg: 'bg-orange-500', border: 'border-orange-400', text: 'text-white', bgLight: 'bg-orange-50' },
  { id: 'red', bg: 'bg-red-500', border: 'border-red-400', text: 'text-white', bgLight: 'bg-red-50' },
  { id: 'pink', bg: 'bg-pink-500', border: 'border-pink-400', text: 'text-white', bgLight: 'bg-pink-50' },
  { id: 'cyan', bg: 'bg-cyan-500', border: 'border-cyan-400', text: 'text-white', bgLight: 'bg-cyan-50' },
  { id: 'gray', bg: 'bg-slate-500', border: 'border-slate-400', text: 'text-white', bgLight: 'bg-slate-50' },
];

// 엣지 컨트롤 핸들 스타일
export const edgeHandleStyle: React.CSSProperties = {
  width: 14,
  height: 14,
  background: '#3b82f6',
  borderRadius: '4px',
  cursor: 'pointer',
  border: '2px solid white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  pointerEvents: 'all',
};

// 스냅 거리 (픽셀)
export const SNAP_DISTANCE = 30;

// 노드의 Handle 위치 계산 (top, right, bottom, left)
export interface HandleInfo {
  position: 'top' | 'right' | 'bottom' | 'left';
  x: number;
  y: number;
}

export const getHandlePositions = (node: { position: { x: number; y: number }; style?: { width?: number | string; height?: number | string } }): HandleInfo[] => {
  const width = (typeof node.style?.width === 'number' ? node.style.width : 150);
  const height = (typeof node.style?.height === 'number' ? node.style.height : 80);
  const x = node.position.x;
  const y = node.position.y;

  return [
    { position: 'top', x: x + width / 2, y: y },
    { position: 'right', x: x + width, y: y + height / 2 },
    { position: 'bottom', x: x + width / 2, y: y + height },
    { position: 'left', x: x, y: y + height / 2 },
  ];
};

// 특정 Handle 위치 반환
export const getHandlePosition = (
  node: { position: { x: number; y: number }; style?: { width?: number | string; height?: number | string } },
  handlePosition: 'top' | 'right' | 'bottom' | 'left'
): { x: number; y: number } => {
  const handles = getHandlePositions(node);
  const handle = handles.find(h => h.position === handlePosition);
  return handle ? { x: handle.x, y: handle.y } : { x: node.position.x, y: node.position.y };
};

// 가장 가까운 노드와 Handle 찾기
export interface NearestNodeResult {
  node: any;
  handle: HandleInfo;
  distance: number;
}

export const findNearestNode = (
  x: number,
  y: number,
  nodes: any[],
  excludeNodeIds: string[] = []
): NearestNodeResult | null => {
  let nearest: NearestNodeResult | null = null;
  let minDistance = Infinity;

  for (const node of nodes) {
    // 가상 노드 및 제외 노드 건너뛰기
    if (node.id.startsWith('virtual_') || excludeNodeIds.includes(node.id)) {
      continue;
    }

    // 연결 가능한 노드 타입만 (shapeNode, decisionNode, imageNode 등)
    if (!['shapeNode', 'decisionNode', 'imageNode', 'default'].includes(node.type || 'default')) {
      continue;
    }

    const handles = getHandlePositions(node);
    for (const handle of handles) {
      const distance = Math.sqrt(Math.pow(handle.x - x, 2) + Math.pow(handle.y - y, 2));
      if (distance < minDistance && distance <= SNAP_DISTANCE) {
        minDistance = distance;
        nearest = { node, handle, distance };
      }
    }
  }

  return nearest;
};
