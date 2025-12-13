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
