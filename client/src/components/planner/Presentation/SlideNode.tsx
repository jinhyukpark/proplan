import React, { useState } from "react";
import { Trash2, Move, X, FileText, MoreVertical, Edit, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NodeProps } from 'reactflow';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slide, SlideImage, SlideMarker, SlideLink, SlideReference, SlideMemo, CANVAS_WIDTH, CANVAS_HEIGHT } from './types';

export interface SlideNodeData {
  slide: Slide;
  markerToolActive: boolean;
  imageToolActive: boolean;
  linkToolActive: boolean;
  noteToolActive: boolean;
  memoToolActive: boolean;
  selectedMarkerId: string | null;
  zoom: number;
  onAddMarker: (x: number, y: number) => void;
  onUpdateMarkerPosition: (markerId: string, x: number, y: number) => void;
  onDeleteMarker: (markerId: string) => void;
  onSelectMarker: (markerId: string | null) => void;
  onUpdateImagePosition: (imageId: string, x: number, y: number) => void;
  onUpdateImageSize: (imageId: string, width: number, height: number) => void;
  onDeleteImage: (imageId: string) => void;
  onDeleteLink?: (linkId: string) => void;
  onUpdateLinkPosition?: (linkId: string, x: number, y: number) => void;
  onUpdateLinkSize?: (linkId: string, width: number, height: number) => void;
  onEditLink?: (linkId: string) => void;
  onDeleteReference?: (referenceId: string) => void;
  onUpdateReferencePosition?: (referenceId: string, x: number, y: number) => void;
  onUpdateReferenceSize?: (referenceId: string, width: number, height: number) => void;
  onEditReference?: (referenceId: string) => void;
  onNavigateToSlide?: (slideId: string) => void;
  onDeleteMemo?: (memoId: string) => void;
  onUpdateMemoPosition?: (memoId: string, x: number, y: number) => void;
  onUpdateMemoSize?: (memoId: string, width: number, height: number) => void;
  onEditMemo?: (memoId: string) => void;
  onDeleteShape?: (shapeId: string) => void;
  onUpdateShapeColor?: (shapeId: string, color: string, fillColor: string, fillOpacity: number) => void;
  isDrawingLine?: boolean;
  isDrawingShape?: boolean;
  lineStart?: { x: number; y: number } | null;
  shapeStart?: { x: number; y: number } | null;
  currentLineEnd?: { x: number; y: number } | null;
  currentShapeEnd?: { x: number; y: number } | null;
  lineColor?: string;
  shapeColor?: string;
}

export const SlideNode = React.memo(({ data }: NodeProps<SlideNodeData>) => {
  const { slide, markerToolActive, imageToolActive, linkToolActive, noteToolActive, memoToolActive, selectedMarkerId, zoom, onAddMarker, onUpdateMarkerPosition, onDeleteMarker, onSelectMarker, onUpdateImagePosition, onUpdateImageSize, onDeleteImage, onDeleteLink, onUpdateLinkPosition, onUpdateLinkSize, onEditLink, onDeleteReference, onUpdateReferencePosition, onUpdateReferenceSize, onEditReference, onNavigateToSlide, onDeleteMemo, onUpdateMemoPosition, onUpdateMemoSize, onEditMemo, onDeleteShape, isDrawingLine, isDrawingShape, lineStart, shapeStart, currentLineEnd, currentShapeEnd, lineColor, shapeColor } = data;
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [shapePopoverOpen, setShapePopoverOpen] = useState(false);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState<string | null>(null);
  const [referencePopoverOpen, setReferencePopoverOpen] = useState<string | null>(null);
  const [memoPopoverOpen, setMemoPopoverOpen] = useState<string | null>(null);

  const handleSlideClick = (e: React.MouseEvent) => {
    if (!markerToolActive && !imageToolActive && !linkToolActive && !noteToolActive && !memoToolActive) {
      const target = e.target as HTMLElement;
      if (target.closest('.image-container') || target.closest('.marker-container')) {
        onSelectMarker(null);
        return;
      }
      onSelectMarker(null);
      return;
    }
    
    if (markerToolActive) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;
      onAddMarker(x, y);
    }
  };

  const handleImageDragStart = (e: React.MouseEvent, image: SlideImage) => {
    if (markerToolActive || imageToolActive) return;
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    setActiveId(image.id);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startImgX = image.x;
    const startImgY = image.y;
    
    const imageContainer = e.currentTarget as HTMLElement;
    const slideNode = imageContainer.parentElement as HTMLElement;
    
    const originalTransform = imageContainer.style.transform;
    let finalX = startImgX;
    let finalY = startImgY;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      
      const currentSlideRect = slideNode.getBoundingClientRect();
      const scaleX = currentSlideRect.width / CANVAS_WIDTH;
      const scaleY = currentSlideRect.height / CANVAS_HEIGHT;
      
      const deltaX = (moveEvent.clientX - startX) / scaleX;
      const deltaY = (moveEvent.clientY - startY) / scaleY;
      
      const newX = Math.max(0, Math.min(CANVAS_WIDTH - image.width, startImgX + deltaX));
      const newY = Math.max(0, Math.min(CANVAS_HEIGHT - image.height, startImgY + deltaY));
      
      finalX = newX;
      finalY = newY;
      
      const offsetX = newX - startImgX;
      const offsetY = newY - startImgY;
      imageContainer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    };
    
    const handleMouseUp = () => {
      imageContainer.style.transform = originalTransform;
      onUpdateImagePosition(image.id, finalX, finalY);
      setActiveId(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeStart = (e: React.MouseEvent, image: SlideImage) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    setActiveId(image.id);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = image.width;
    const startH = image.height;
    
    const resizeHandle = e.currentTarget as HTMLElement;
    const imageContainer = resizeHandle.parentElement as HTMLElement;
    const slideNode = imageContainer?.parentElement as HTMLElement;
    
    let finalWidth = startW;
    let finalHeight = startH;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      
      const currentSlideRect = slideNode.getBoundingClientRect();
      const scaleX = currentSlideRect.width / CANVAS_WIDTH;
      const scaleY = currentSlideRect.height / CANVAS_HEIGHT;
      
      const deltaX = (moveEvent.clientX - startX) / scaleX;
      const deltaY = (moveEvent.clientY - startY) / scaleY;
      
      const newWidth = Math.max(50, Math.min(CANVAS_WIDTH - image.x, startW + deltaX));
      const newHeight = Math.max(50, Math.min(CANVAS_HEIGHT - image.y, startH + deltaY));
      
      finalWidth = newWidth;
      finalHeight = newHeight;
      
      imageContainer.style.width = `${newWidth}px`;
      imageContainer.style.height = `${newHeight}px`;
    };
    
    const handleMouseUp = () => {
      onUpdateImageSize(image.id, finalWidth, finalHeight);
      setActiveId(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMarkerDragStart = (e: React.MouseEvent, marker: SlideMarker) => {
    if (markerToolActive || imageToolActive) return;
    e.stopPropagation();
    e.preventDefault();
    setActiveId(marker.id);
    onSelectMarker(marker.id);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startMX = marker.x;
    const startMY = marker.y;
    
    const markerContainer = e.currentTarget as HTMLElement;
    const slideNode = markerContainer.parentElement as HTMLElement;
    
    const originalTransform = markerContainer.style.transform;
    let finalX = startMX;
    let finalY = startMY;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      
      const currentSlideRect = slideNode.getBoundingClientRect();
      const scaleX = currentSlideRect.width / CANVAS_WIDTH;
      const scaleY = currentSlideRect.height / CANVAS_HEIGHT;
      
      const deltaX = (moveEvent.clientX - startX) / scaleX;
      const deltaY = (moveEvent.clientY - startY) / scaleY;
      
      const newX = Math.max(0, Math.min(CANVAS_WIDTH, startMX + deltaX));
      const newY = Math.max(0, Math.min(CANVAS_HEIGHT, startMY + deltaY));
      
      finalX = newX;
      finalY = newY;
      
      const offsetX = newX - startMX;
      const offsetY = newY - startMY;
      markerContainer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    };
    
    const handleMouseUp = () => {
      markerContainer.style.transform = originalTransform;
      onUpdateMarkerPosition(marker.id, finalX, finalY);
      setActiveId(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      className={cn(
        "bg-white shadow-2xl rounded-lg overflow-hidden ring-1 ring-black/10",
        (markerToolActive || imageToolActive) && "cursor-crosshair"
      )}
      style={{ 
        width: CANVAS_WIDTH, 
        height: CANVAS_HEIGHT,
        backgroundColor: slide.backgroundColor || '#ffffff',
        cursor: (markerToolActive || imageToolActive || linkToolActive || noteToolActive || memoToolActive) ? 'crosshair' : 'default',
        position: 'relative'
      }}
      onClick={handleSlideClick}
      onMouseDown={(e) => {
        if (markerToolActive || imageToolActive || linkToolActive || noteToolActive || memoToolActive) e.stopPropagation();
      }}
    >
      <svg 
        className="absolute inset-0 pointer-events-none" 
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, zIndex: 5 }}
      >
        {/* 드래그 중인 라인 미리보기 */}
        {isDrawingLine && lineStart && currentLineEnd && (
          <g>
            <line
              x1={lineStart.x}
              y1={lineStart.y}
              x2={currentLineEnd.x}
              y2={currentLineEnd.y}
              stroke={lineColor}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="5,5"
              opacity={0.7}
            />
            <circle cx={lineStart.x} cy={lineStart.y} r={4} fill={lineColor} opacity={0.7} />
            <circle cx={currentLineEnd.x} cy={currentLineEnd.y} r={4} fill={lineColor} opacity={0.7} />
          </g>
        )}
        
        {/* 드래그 중인 네모 미리보기 */}
        {isDrawingShape && shapeStart && currentShapeEnd && (
          <g>
            <rect
              x={Math.min(shapeStart.x, currentShapeEnd.x)}
              y={Math.min(shapeStart.y, currentShapeEnd.y)}
              width={Math.abs(currentShapeEnd.x - shapeStart.x)}
              height={Math.abs(currentShapeEnd.y - shapeStart.y)}
              stroke={shapeColor}
              strokeWidth={2}
              fill="none"
              strokeDasharray="5,5"
              opacity={0.7}
            />
          </g>
        )}
        
        {(slide.shapes || []).map((shape) => {
          if (shape.type === 'line') {
            // 라인 렌더링
            const startX = shape.x;
            const startY = shape.y;
            const endX = shape.x + shape.width;
            const endY = shape.y + shape.height;
            return (
              <g key={shape.id} className="pointer-events-auto group">
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={shape.color}
                  strokeWidth={shape.strokeWidth}
                  strokeLinecap="round"
                />
                <circle cx={startX} cy={startY} r={4} fill={shape.color} />
                <circle cx={endX} cy={endY} r={4} fill={shape.color} />
                <g
                  className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteShape?.(shape.id);
                  }}
                  style={{ pointerEvents: 'auto' }}
                >
                  <circle
                    cx={(startX + endX) / 2}
                    cy={(startY + endY) / 2}
                    r={12}
                    fill="white"
                    stroke="#ef4444"
                    strokeWidth={2}
                  />
                  <line
                    x1={(startX + endX) / 2 - 6}
                    y1={(startY + endY) / 2}
                    x2={(startX + endX) / 2 + 6}
                    y2={(startY + endY) / 2}
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </g>
              </g>
            );
          }
          // 사각형 렌더링
          return (
            <g key={shape.id} className="pointer-events-auto group">
              <rect
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                stroke={shape.color}
                strokeWidth={shape.strokeWidth}
                fill={shape.fillColor || 'none'}
                fillOpacity={shape.fillOpacity || 0}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedShapeId(shape.id);
                  setShapePopoverOpen(true);
                }}
              />
              <g
                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteShape?.(shape.id);
                }}
                style={{ pointerEvents: 'auto' }}
              >
                <circle
                  cx={shape.x + shape.width / 2}
                  cy={shape.y + shape.height / 2}
                  r={12}
                  fill="white"
                  stroke="#ef4444"
                  strokeWidth={2}
                />
                <line
                  x1={shape.x + shape.width / 2 - 6}
                  y1={shape.y + shape.height / 2}
                  x2={shape.x + shape.width / 2 + 6}
                  y2={shape.y + shape.height / 2}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </g>
            </g>
          );
        })}
      </svg>

      {slide.images.map((img) => (
        <div
          key={img.id}
          className={cn(
            "absolute group nodrag nopan image-container",
            activeId === img.id ? "z-40 ring-2 ring-blue-500 cursor-grabbing" : "hover:ring-2 hover:ring-blue-300 cursor-grab",
            (markerToolActive || imageToolActive) && "pointer-events-none"
          )}
          style={{
            left: img.x,
            top: img.y,
            width: img.width,
            height: img.height,
            pointerEvents: (markerToolActive || imageToolActive) ? 'none' : 'auto',
            zIndex: activeId === img.id ? 40 : 10
          }}
          onMouseDown={(e) => handleImageDragStart(e, img)}
          onClick={(e) => e.stopPropagation()}
        >
          <img src={img.url} alt="" className="w-full h-full object-cover pointer-events-none" draggable={false} />
          <button
            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            onClick={(e) => { e.stopPropagation(); onDeleteImage(img.id); }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <Move className="h-3 w-3 inline mr-1" />드래그하여 이동
          </div>
          {['-bottom-2 -right-2 cursor-nwse-resize', '-top-2 -right-2 cursor-nesw-resize', '-bottom-2 -left-2 cursor-nesw-resize', '-top-2 -left-2 cursor-nwse-resize'].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-5 h-5 bg-blue-500 rounded-sm shadow-lg border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity`}
              style={{ pointerEvents: 'auto', zIndex: 50 }}
              onMouseDown={(e) => handleResizeStart(e, img)}
            />
          ))}
        </div>
      ))}

      {/* 링크 렌더링 (드래그 및 리사이즈 가능) */}
      {(slide.links || []).map((link) => {
        const linkWidth = link.width || 150;
        const linkHeight = link.height || 32;
        
        const handleLinkDragStart = (e: React.MouseEvent) => {
          if (linkToolActive || noteToolActive) return;
          e.stopPropagation();
          e.preventDefault();
          setActiveId(link.id);
          
          const startX = e.clientX;
          const startY = e.clientY;
          const startLinkX = link.x;
          const startLinkY = link.y;
          
          const linkContainer = e.currentTarget as HTMLElement;
          const slideNode = linkContainer.parentElement as HTMLElement;
          
          const originalTransform = linkContainer.style.transform;
          let finalX = startLinkX;
          let finalY = startLinkY;
          
          const handleMouseMove = (moveEvent: MouseEvent) => {
            moveEvent.preventDefault();
            moveEvent.stopPropagation();
            
            const currentSlideRect = slideNode.getBoundingClientRect();
            const scaleX = currentSlideRect.width / CANVAS_WIDTH;
            const scaleY = currentSlideRect.height / CANVAS_HEIGHT;
            
            const deltaX = (moveEvent.clientX - startX) / scaleX;
            const deltaY = (moveEvent.clientY - startY) / scaleY;
            
            const newX = Math.max(0, Math.min(CANVAS_WIDTH - linkWidth, startLinkX + deltaX));
            const newY = Math.max(0, Math.min(CANVAS_HEIGHT - linkHeight, startLinkY + deltaY));
            
            finalX = newX;
            finalY = newY;
            
            const offsetX = newX - startLinkX;
            const offsetY = newY - startLinkY;
            linkContainer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
          };
          
          const handleMouseUp = () => {
            linkContainer.style.transform = originalTransform;
            onUpdateLinkPosition?.(link.id, finalX, finalY);
            setActiveId(null);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        };

        const handleLinkResizeStart = (e: React.MouseEvent) => {
          e.stopPropagation();
          e.preventDefault();
          setActiveId(link.id);
          
          const startX = e.clientX;
          const startY = e.clientY;
          const startW = linkWidth;
          const startH = linkHeight;
          
          const resizeHandle = e.currentTarget as HTMLElement;
          const linkContainer = resizeHandle.parentElement as HTMLElement;
          const slideNode = linkContainer?.parentElement as HTMLElement;
          
          let finalWidth = startW;
          let finalHeight = startH;
          
          const handleMouseMove = (moveEvent: MouseEvent) => {
            moveEvent.preventDefault();
            moveEvent.stopPropagation();
            
            const currentSlideRect = slideNode.getBoundingClientRect();
            const scaleX = currentSlideRect.width / CANVAS_WIDTH;
            const scaleY = currentSlideRect.height / CANVAS_HEIGHT;
            
            const deltaX = (moveEvent.clientX - startX) / scaleX;
            const deltaY = (moveEvent.clientY - startY) / scaleY;
            
            const newWidth = Math.max(80, Math.min(CANVAS_WIDTH - link.x, startW + deltaX));
            const newHeight = Math.max(24, Math.min(CANVAS_HEIGHT - link.y, startH + deltaY));
            
            finalWidth = newWidth;
            finalHeight = newHeight;
            
            linkContainer.style.width = `${newWidth}px`;
            linkContainer.style.height = `${newHeight}px`;
          };
          
          const handleMouseUp = () => {
            onUpdateLinkSize?.(link.id, finalWidth, finalHeight);
            setActiveId(null);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        };

        return (
          <div
            key={link.id}
            className={cn(
              "absolute group nodrag nopan",
              activeId === link.id ? "z-40 ring-2 ring-blue-500 cursor-grabbing" : "hover:ring-2 hover:ring-blue-300 cursor-grab",
              (markerToolActive || imageToolActive || linkToolActive || noteToolActive) && "pointer-events-none"
            )}
            style={{
              left: link.x,
              top: link.y,
              width: linkWidth,
              height: linkHeight,
              pointerEvents: (markerToolActive || imageToolActive || linkToolActive || noteToolActive) ? 'none' : 'auto',
              zIndex: activeId === link.id ? 40 : 20
            }}
            onMouseDown={handleLinkDragStart}
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-full bg-blue-100 border border-blue-300 rounded-md px-2 py-1 flex items-center gap-1.5 text-sm text-blue-700 cursor-pointer hover:bg-blue-200 transition-colors shadow-sm"
              onClick={(e) => {
                if (activeId === link.id) {
                  e.preventDefault();
                } else {
                  e.stopPropagation();
                }
              }}
            >
              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{link.label}</span>
            </a>
            <Popover open={linkPopoverOpen === link.id} onOpenChange={(open) => setLinkPopoverOpen(open ? link.id : null)}>
              <PopoverTrigger asChild>
                <button
                  className="absolute top-1 right-1 bg-white hover:bg-neutral-100 text-neutral-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-50 border border-neutral-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setLinkPopoverOpen(linkPopoverOpen === link.id ? null : link.id);
                  }}
                >
                  <MoreVertical className="h-3 w-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-1">
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 rounded-md flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditLink?.(link.id);
                      setLinkPopoverOpen(null);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    수정
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 rounded-md flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLink?.(link.id);
                      setLinkPopoverOpen(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-sm cursor-nwse-resize shadow-lg border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ pointerEvents: 'auto', zIndex: 50 }}
              onMouseDown={(e) => handleLinkResizeStart(e)}
            />
          </div>
        );
      })}

      {/* 참조 렌더링 (드래그 및 리사이즈 가능) */}
      {(slide.references || []).map((reference) => {
        const refWidth = reference.width || 150;
        const refHeight = reference.height || 32;
        
        const handleReferenceDragStart = (e: React.MouseEvent) => {
          if (linkToolActive || noteToolActive) return;
          e.stopPropagation();
          e.preventDefault();
          setActiveId(reference.id);
          
          const startX = e.clientX;
          const startY = e.clientY;
          const startRefX = reference.x;
          const startRefY = reference.y;
          
          const refContainer = e.currentTarget as HTMLElement;
          const slideNode = refContainer.parentElement as HTMLElement;
          
          const originalTransform = refContainer.style.transform;
          let finalX = startRefX;
          let finalY = startRefY;
          
          const handleMouseMove = (moveEvent: MouseEvent) => {
            moveEvent.preventDefault();
            moveEvent.stopPropagation();
            
            const currentSlideRect = slideNode.getBoundingClientRect();
            const scaleX = currentSlideRect.width / CANVAS_WIDTH;
            const scaleY = currentSlideRect.height / CANVAS_HEIGHT;
            
            const deltaX = (moveEvent.clientX - startX) / scaleX;
            const deltaY = (moveEvent.clientY - startY) / scaleY;
            
            const newX = Math.max(0, Math.min(CANVAS_WIDTH - refWidth, startRefX + deltaX));
            const newY = Math.max(0, Math.min(CANVAS_HEIGHT - refHeight, startRefY + deltaY));
            
            finalX = newX;
            finalY = newY;
            
            const offsetX = newX - startRefX;
            const offsetY = newY - startRefY;
            refContainer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
          };
          
          const handleMouseUp = () => {
            refContainer.style.transform = originalTransform;
            onUpdateReferencePosition?.(reference.id, finalX, finalY);
            setActiveId(null);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        };

        const handleReferenceResizeStart = (e: React.MouseEvent) => {
          e.stopPropagation();
          e.preventDefault();
          setActiveId(reference.id);
          
          const startX = e.clientX;
          const startY = e.clientY;
          const startW = refWidth;
          const startH = refHeight;
          
          const resizeHandle = e.currentTarget as HTMLElement;
          const refContainer = resizeHandle.parentElement as HTMLElement;
          const slideNode = refContainer?.parentElement as HTMLElement;
          
          let finalWidth = startW;
          let finalHeight = startH;
          
          const handleMouseMove = (moveEvent: MouseEvent) => {
            moveEvent.preventDefault();
            moveEvent.stopPropagation();
            
            const currentSlideRect = slideNode.getBoundingClientRect();
            const scaleX = currentSlideRect.width / CANVAS_WIDTH;
            const scaleY = currentSlideRect.height / CANVAS_HEIGHT;
            
            const deltaX = (moveEvent.clientX - startX) / scaleX;
            const deltaY = (moveEvent.clientY - startY) / scaleY;
            
            const newWidth = Math.max(80, Math.min(CANVAS_WIDTH - reference.x, startW + deltaX));
            const newHeight = Math.max(24, Math.min(CANVAS_HEIGHT - reference.y, startH + deltaY));
            
            finalWidth = newWidth;
            finalHeight = newHeight;
            
            refContainer.style.width = `${newWidth}px`;
            refContainer.style.height = `${newHeight}px`;
          };
          
          const handleMouseUp = () => {
            onUpdateReferenceSize?.(reference.id, finalWidth, finalHeight);
            setActiveId(null);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        };

        return (
          <div
            key={reference.id}
            className={cn(
              "absolute group nodrag nopan",
              activeId === reference.id ? "z-40 ring-2 ring-green-500 cursor-grabbing" : "hover:ring-2 hover:ring-green-300 cursor-grab",
              (markerToolActive || imageToolActive || linkToolActive || noteToolActive) && "pointer-events-none"
            )}
            style={{
              left: reference.x,
              top: reference.y,
              width: refWidth,
              height: refHeight,
              pointerEvents: (markerToolActive || imageToolActive || linkToolActive || noteToolActive) ? 'none' : 'auto',
              zIndex: activeId === reference.id ? 40 : 20
            }}
            onMouseDown={handleReferenceDragStart}
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href="#"
              className="w-full h-full bg-green-100 border border-green-300 rounded-md px-2 py-1 flex items-center gap-1.5 text-sm text-green-700 cursor-pointer hover:bg-green-200 transition-colors shadow-sm"
              onClick={(e) => {
                if (activeId === reference.id) {
                  e.preventDefault();
                } else {
                  e.stopPropagation();
                  e.preventDefault();
                  onNavigateToSlide?.(reference.targetSlideId);
                }
              }}
            >
              <FileText className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{reference.label}</span>
            </a>
            <Popover open={referencePopoverOpen === reference.id} onOpenChange={(open) => setReferencePopoverOpen(open ? reference.id : null)}>
              <PopoverTrigger asChild>
                <button
                  className="absolute top-1 right-1 bg-white hover:bg-neutral-100 text-neutral-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-50 border border-neutral-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setReferencePopoverOpen(referencePopoverOpen === reference.id ? null : reference.id);
                  }}
                >
                  <MoreVertical className="h-3 w-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-1">
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 rounded-md flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditReference?.(reference.id);
                      setReferencePopoverOpen(null);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    수정
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 rounded-md flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteReference?.(reference.id);
                      setReferencePopoverOpen(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-sm cursor-nwse-resize shadow-lg border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ pointerEvents: 'auto', zIndex: 50 }}
              onMouseDown={(e) => handleReferenceResizeStart(e)}
            />
          </div>
        );
      })}

      {/* 메모 렌더링 (드래그 및 리사이즈 가능) */}
      {(slide.memos || []).map((memo) => {
        const memoWidth = memo.width || 200;
        const memoHeight = memo.height || 150;
        
        const styleColors = {
          yellow: { bg: '#fef9c3', border: '#fde047', text: '#854d0e', resize: '#eab308' },
          pink: { bg: '#fce7f3', border: '#f9a8d4', text: '#9f1239', resize: '#ec4899' },
          blue: { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af', resize: '#3b82f6' },
          green: { bg: '#dcfce7', border: '#86efac', text: '#166534', resize: '#22c55e' },
          purple: { bg: '#f3e8ff', border: '#c084fc', text: '#6b21a8', resize: '#a855f7' },
        };
        const colors = styleColors[memo.style];
        
        const handleMemoDragStart = (e: React.MouseEvent) => {
          if (linkToolActive || noteToolActive || memoToolActive) return;
          e.stopPropagation();
          e.preventDefault();
          setActiveId(memo.id);
          
          const startX = e.clientX;
          const startY = e.clientY;
          const startMemoX = memo.x;
          const startMemoY = memo.y;
          
          const memoContainer = e.currentTarget as HTMLElement;
          const slideNode = memoContainer.parentElement as HTMLElement;
          
          const originalTransform = memoContainer.style.transform;
          let finalX = startMemoX;
          let finalY = startMemoY;
          
          const handleMouseMove = (moveEvent: MouseEvent) => {
            moveEvent.preventDefault();
            moveEvent.stopPropagation();
            
            const currentSlideRect = slideNode.getBoundingClientRect();
            const scaleX = currentSlideRect.width / CANVAS_WIDTH;
            const scaleY = currentSlideRect.height / CANVAS_HEIGHT;
            
            const deltaX = (moveEvent.clientX - startX) / scaleX;
            const deltaY = (moveEvent.clientY - startY) / scaleY;
            
            const newX = Math.max(0, Math.min(CANVAS_WIDTH - memoWidth, startMemoX + deltaX));
            const newY = Math.max(0, Math.min(CANVAS_HEIGHT - memoHeight, startMemoY + deltaY));
            
            finalX = newX;
            finalY = newY;
            
            const offsetX = newX - startMemoX;
            const offsetY = newY - startMemoY;
            memoContainer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
          };
          
          const handleMouseUp = () => {
            memoContainer.style.transform = originalTransform;
            onUpdateMemoPosition?.(memo.id, finalX, finalY);
            setActiveId(null);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        };

        const handleMemoResizeStart = (e: React.MouseEvent) => {
          e.stopPropagation();
          e.preventDefault();
          setActiveId(memo.id);
          
          const startX = e.clientX;
          const startY = e.clientY;
          const startW = memoWidth;
          const startH = memoHeight;
          
          const resizeHandle = e.currentTarget as HTMLElement;
          const memoContainer = resizeHandle.parentElement as HTMLElement;
          const slideNode = memoContainer?.parentElement as HTMLElement;
          
          let finalWidth = startW;
          let finalHeight = startH;
          
          const handleMouseMove = (moveEvent: MouseEvent) => {
            moveEvent.preventDefault();
            moveEvent.stopPropagation();
            
            const currentSlideRect = slideNode.getBoundingClientRect();
            const scaleX = currentSlideRect.width / CANVAS_WIDTH;
            const scaleY = currentSlideRect.height / CANVAS_HEIGHT;
            
            const deltaX = (moveEvent.clientX - startX) / scaleX;
            const deltaY = (moveEvent.clientY - startY) / scaleY;
            
            const newWidth = Math.max(120, Math.min(CANVAS_WIDTH - memo.x, startW + deltaX));
            const newHeight = Math.max(80, Math.min(CANVAS_HEIGHT - memo.y, startH + deltaY));
            
            finalWidth = newWidth;
            finalHeight = newHeight;
            
            memoContainer.style.width = `${newWidth}px`;
            memoContainer.style.height = `${newHeight}px`;
          };
          
          const handleMouseUp = () => {
            onUpdateMemoSize?.(memo.id, finalWidth, finalHeight);
            setActiveId(null);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        };

        return (
          <div
            key={memo.id}
            className={cn(
              "absolute group nodrag nopan",
              activeId === memo.id ? "z-40 ring-2 cursor-grabbing" : "hover:ring-2 cursor-grab",
              (markerToolActive || imageToolActive || linkToolActive || noteToolActive || memoToolActive) && "pointer-events-none"
            )}
            style={{
              left: memo.x,
              top: memo.y,
              width: memoWidth,
              height: memoHeight,
              pointerEvents: (markerToolActive || imageToolActive || linkToolActive || noteToolActive || memoToolActive) ? 'none' : 'auto',
              zIndex: activeId === memo.id ? 40 : 20,
              ...(activeId === memo.id && { boxShadow: `0 0 0 2px ${colors.resize}` }),
            }}
            onMouseDown={handleMemoDragStart}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="w-full h-full rounded-md border-2 shadow-md p-2 flex flex-col"
              style={{ backgroundColor: colors.bg, borderColor: colors.border }}
            >
              <div className="font-semibold text-sm mb-1 truncate" style={{ color: colors.text }}>{memo.title}</div>
              <div className="text-xs flex-1 overflow-auto" style={{ color: colors.text, wordBreak: 'break-word' }}>
                {memo.content || <span className="opacity-50">내용 없음</span>}
              </div>
            </div>
            <Popover open={memoPopoverOpen === memo.id} onOpenChange={(open) => setMemoPopoverOpen(open ? memo.id : null)}>
              <PopoverTrigger asChild>
                <button
                  className="absolute top-1 right-1 bg-white hover:bg-neutral-100 text-neutral-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-50 border border-neutral-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setMemoPopoverOpen(memoPopoverOpen === memo.id ? null : memo.id);
                  }}
                >
                  <MoreVertical className="h-3 w-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-1">
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 rounded-md flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditMemo?.(memo.id);
                      setMemoPopoverOpen(null);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    수정
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 rounded-md flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMemo?.(memo.id);
                      setMemoPopoverOpen(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-sm cursor-nwse-resize shadow-lg border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: colors.resize, pointerEvents: 'auto', zIndex: 50 }}
              onMouseDown={(e) => handleMemoResizeStart(e)}
            />
          </div>
        );
      })}

      {(slide.markers || []).map((marker) => (
        <div
          key={marker.id}
          className={cn(
            "absolute group nodrag nopan marker-container",
            activeId === marker.id ? "cursor-grabbing" : "cursor-grab",
            (markerToolActive || imageToolActive || linkToolActive || noteToolActive) && "pointer-events-none"
          )}
          style={{
            left: marker.x,
            top: marker.y,
            pointerEvents: (markerToolActive || imageToolActive || linkToolActive || noteToolActive) ? 'none' : 'auto',
            zIndex: 9999
          }}
          onMouseDown={(e) => handleMarkerDragStart(e, marker)}
          onClick={(e) => { e.stopPropagation(); onSelectMarker(marker.id); }}
        >
          <div 
            className={cn(
              "w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-bold shadow-lg border-2 transition-all",
              selectedMarkerId === marker.id 
                ? "bg-orange-500 border-orange-300 ring-2 ring-orange-300" 
                : "bg-blue-500 border-white hover:bg-blue-600",
              activeId === marker.id && "scale-110"
            )}
          >
            {marker.number}
          </div>
          <button
            className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            onClick={(e) => { e.stopPropagation(); onDeleteMarker(marker.id); }}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      {selectedShapeId && shapePopoverOpen && (
        <Popover open={shapePopoverOpen} onOpenChange={setShapePopoverOpen}>
          <PopoverTrigger asChild>
            <div style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0 }} />
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">도형 색상 설정</h4>
              <div>
                <label className="text-xs text-neutral-600 mb-2 block">라인 색상</label>
                <div className="flex gap-2 flex-wrap">
                  {['#000000', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border-2 border-neutral-200 hover:border-neutral-400"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        const shape = slide.shapes?.find(s => s.id === selectedShapeId);
                        if (shape && data.onUpdateShapeColor) {
                          data.onUpdateShapeColor(selectedShapeId, color, shape.fillColor, shape.fillOpacity);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-600 mb-2 block">내부 색상</label>
                <div className="flex gap-2 flex-wrap">
                  {['transparent', '#000000', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border-2 border-neutral-200 hover:border-neutral-400 relative"
                      style={{ backgroundColor: color === 'transparent' ? '#ffffff' : color }}
                      onClick={() => {
                        const shape = slide.shapes?.find(s => s.id === selectedShapeId);
                        if (shape && data.onUpdateShapeColor) {
                          data.onUpdateShapeColor(selectedShapeId, shape.color, color === 'transparent' ? 'none' : color, color === 'transparent' ? 0 : 0.3);
                        }
                      }}
                    >
                      {color === 'transparent' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-0.5 bg-red-500 rotate-45" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => setShapePopoverOpen(false)}>닫기</Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
});

SlideNode.displayName = "SlideNode";

