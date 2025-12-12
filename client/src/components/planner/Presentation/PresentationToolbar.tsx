import React from "react";
import { MousePointer2, Hash, Image as ImageIcon, Link, FileText, StickyNote, Minus, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slide } from './PresentationCanvas';

interface PresentationToolbarProps {
  activeTool: 'select' | 'marker' | 'image' | 'link' | 'note' | 'memo' | 'line' | 'shape';
  markerToolActive: boolean;
  imageToolActive: boolean;
  linkToolActive: boolean;
  noteToolActive: boolean;
  memoToolActive: boolean;
  lineToolActive: boolean;
  shapeToolActive: boolean;
  lineColor: string;
  shapeColor: string;
  activeSlide: Slide | undefined;
  activeSlideIndex: number;
  slidesLength: number;
  onToolChange: (tool: 'select' | 'marker' | 'image' | 'link' | 'note' | 'memo' | 'line' | 'shape') => void;
  onLineColorChange: (color: string) => void;
  onShapeColorChange: (color: string) => void;
  onBackgroundColorChange: (color: string) => void;
}

export function PresentationToolbar({
  activeTool,
  markerToolActive,
  imageToolActive,
  linkToolActive,
  noteToolActive,
  memoToolActive,
  lineToolActive,
  shapeToolActive,
  lineColor,
  shapeColor,
  activeSlide,
  activeSlideIndex,
  slidesLength,
  onToolChange,
  onLineColorChange,
  onShapeColorChange,
  onBackgroundColorChange,
}: PresentationToolbarProps) {
  return (
    <div className="h-14 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center px-6 gap-1">
      {[
        { tool: 'select', icon: MousePointer2, label: '선택', active: activeTool === 'select' && !markerToolActive && !lineToolActive && !shapeToolActive && !imageToolActive },
        { tool: 'marker', icon: Hash, label: '마커', active: markerToolActive },
        { tool: 'image', icon: ImageIcon, label: '이미지', active: imageToolActive },
        { tool: 'link', icon: Link, label: '링크', active: linkToolActive },
        { tool: 'note', icon: FileText, label: '참조', active: noteToolActive },
        { tool: 'memo', icon: StickyNote, label: '메모', active: memoToolActive },
      ].map(({ tool, icon: Icon, label, active }) => (
        <Button key={tool} variant="ghost" size="sm" onClick={() => onToolChange(tool as any)} className={cn("flex flex-col items-center justify-center h-12 w-16 gap-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-700", active && "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400")}>
          <Icon className="h-5 w-5" /><span className="text-[10px] font-medium">{label}</span>
        </Button>
      ))}

      {[{ tool: 'line', icon: Minus, label: '라인', active: lineToolActive, color: lineColor, setColor: onLineColorChange, setActive: () => onToolChange('line') },
        { tool: 'shape', icon: Square, label: '네모', active: shapeToolActive, color: shapeColor, setColor: onShapeColorChange, setActive: () => onToolChange('shape') }
      ].map(({ tool, icon: Icon, label, active, color, setColor, setActive }) => (
        <div key={tool} className="relative flex flex-col items-center">
          <Button variant="ghost" size="sm" onClick={setActive} className={cn("flex flex-col items-center justify-center h-12 w-16 gap-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-700", active && "bg-neutral-100 dark:bg-neutral-700 text-blue-600 dark:text-blue-400")}>
            <Icon className="h-5 w-5" /><span className="text-[10px] font-medium">{label}</span>
          </Button>
          {active && (
            <div className="absolute top-16 flex gap-1 bg-white dark:bg-neutral-800 p-1 rounded shadow-lg border z-50">
              {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#000000'].map((c) => (
                <button key={c} className={cn("w-6 h-6 rounded border-2", color === c ? "border-neutral-900 dark:border-white" : "border-transparent")} style={{ backgroundColor: c }} onClick={() => setColor(c)} />
              ))}
            </div>
          )}
        </div>
      ))}
      
      <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-700 mx-2" />

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <div className="w-4 h-4 rounded border border-neutral-300" style={{ backgroundColor: activeSlide?.backgroundColor || '#ffffff' }} />배경색
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[['#ffffff', '흰색'], ['#f5f5f5', '밝은 회색'], ['#000000', '검정'], ['#1e3a5f', '네이비'], ['#2d5a27', '녹색'], ['#5a2727', '빨강'], ['#4a2763', '보라']].map(([color, name]) => (
              <DropdownMenuItem key={color} onClick={() => onBackgroundColorChange(color)}>
                <div className="w-4 h-4 rounded border mr-2" style={{ backgroundColor: color }} />{name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="text-sm text-neutral-500">{activeSlideIndex + 1} / {slidesLength}</span>
      </div>
    </div>
  );
}

