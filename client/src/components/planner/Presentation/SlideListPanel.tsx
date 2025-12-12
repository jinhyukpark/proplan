import React, { useState, useCallback } from "react";
import { Plus, Trash2, Copy, FolderPlus, ChevronRight, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  useDroppable,
  useDraggable,
  pointerWithin,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Slide, SlideSection } from './PresentationCanvas';

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

// 드래그 가능한 슬라이드 아이템 (useDraggable 사용 - 다른 요소 움직이지 않음)
interface DraggableSlideItemProps {
  slide: Slide;
  globalIndex: number;
  isActive: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onDelete: (index: number) => void;
  onDuplicate: (index: number) => void;
  canvasWidth: number;
  canvasHeight: number;
}

const DraggableSlideItem = ({ 
  slide, 
  globalIndex,
  isActive, 
  isDragging,
  onSelect, 
  onDelete, 
  onDuplicate,
  canvasWidth,
  canvasHeight
}: DraggableSlideItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
  } = useDraggable({ 
    id: slide.id,
    data: {
      type: 'slide',
      slide: slide,
      index: globalIndex,
    }
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative aspect-[16/9] rounded-md border-2 overflow-hidden cursor-grab active:cursor-grabbing",
        isActive
          ? "border-blue-500 ring-2 ring-blue-500/20"
          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400",
        isDragging && "opacity-30"
      )}
      onClick={onSelect}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ backgroundColor: slide.backgroundColor || '#ffffff' }}
      >
        {slide.images.length > 0 ? (
          <div className="relative w-full h-full">
            {slide.images.map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt=""
                className="absolute object-cover"
                style={{
                  left: `${(img.x / canvasWidth) * 100}%`,
                  top: `${(img.y / canvasHeight) * 100}%`,
                  width: `${(img.width / canvasWidth) * 100}%`,
                  height: `${(img.height / canvasHeight) * 100}%`
                }}
              />
            ))}
            {slide.markers?.map((marker) => (
              <div
                key={marker.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${(marker.x / canvasWidth) * 100}%`,
                  top: `${(marker.y / canvasHeight) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full border border-white shadow-sm" />
              </div>
            ))}
          </div>
        ) : (
          <span className="text-[8px] text-neutral-400">Empty Slide</span>
        )}
      </div>

      {(slide.markers?.length ?? 0) > 0 && (
        <div className="absolute top-1 right-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium shadow-sm">
          {slide.markers?.length ?? 0}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(globalIndex);
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-white hover:bg-white/20 hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(globalIndex);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// 드롭존 컴포넌트
interface DropZoneProps {
  id: string;
  isActive: boolean;
}

function DropZone({ id, isActive }: DropZoneProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef} 
      className="relative h-3 my-0.5"
    >
      {isActive && (
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-blue-500 rounded-full z-50 shadow-lg shadow-blue-500/50">
          <div className="absolute -left-1 -top-0.5 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -right-1 -top-0.5 w-2 h-2 bg-blue-500 rounded-full" />
        </div>
      )}
    </div>
  );
}

// 드래그 가능한 섹션 헤더
interface DraggableSectionHeaderProps {
  section: SlideSection;
  slideCount: number;
  isEditing: boolean;
  editingName: string;
  isDragging: boolean;
  onToggle: () => void;
  onDoubleClick: () => void;
  onNameChange: (name: string) => void;
  onNameSubmit: () => void;
  onEditCancel: () => void;
  onDelete: () => void;
}

function DraggableSectionHeader({
  section,
  slideCount,
  isEditing,
  editingName,
  isDragging,
  onToggle,
  onDoubleClick,
  onNameChange,
  onNameSubmit,
  onEditCancel,
  onDelete,
}: DraggableSectionHeaderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
  } = useDraggable({ 
    id: `section-${section.id}`,
    data: {
      type: 'section',
      sectionId: section.id,
    }
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center gap-1 px-2 py-1.5 rounded bg-white dark:bg-neutral-700 text-sm font-medium shadow-sm border border-neutral-200 dark:border-neutral-600 cursor-grab active:cursor-grabbing",
        isDragging && "opacity-30"
      )}
      onDoubleClick={onDoubleClick}
    >
      <GripVertical className="h-3 w-3 text-neutral-400" />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded"
      >
        <ChevronRight className={cn(
          "h-3 w-3 transition-transform",
          (section.isOpen ?? true) && "transform rotate-90"
        )} />
      </button>
      {isEditing ? (
        <input
          type="text"
          value={editingName}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={onNameSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onNameSubmit();
            if (e.key === 'Escape') onEditCancel();
          }}
          className="flex-1 px-1 py-0 bg-white dark:bg-neutral-800 border border-blue-500 rounded text-xs"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 text-xs cursor-default">{section.name}</span>
      )}
      <span className="text-[10px] text-neutral-500">{slideCount}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-0.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500 hover:text-red-600 transition-colors"
        title="섹션 삭제"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

interface SlideListPanelProps {
  slides: Slide[];
  sections: SlideSection[];
  activeSlideIndex: number;
  activeDragId: string | null;
  activeOverId: string | null;
  editingSectionId: string | null;
  editingSectionName: string;
  orderedItems: Array<{ type: 'slide'; data: Slide; order: number } | { type: 'section'; data: SlideSection; order: number }>;
  onSelectSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onDuplicateSlide: (index: number) => void;
  onAddSlide: () => void;
  onAddSection: () => void;
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onToggleSection: (sectionId: string) => void;
  onSectionDoubleClick: (sectionId: string, sectionName: string) => void;
  onSectionNameChange: (name: string) => void;
  onSectionNameSubmit: (sectionId: string) => void;
  onSectionEditCancel: () => void;
  onDeleteSection: (sectionId: string) => void;
}

export function SlideListPanel({
  slides,
  sections,
  activeSlideIndex,
  activeDragId,
  activeOverId,
  editingSectionId,
  editingSectionName,
  orderedItems,
  onSelectSlide,
  onDeleteSlide,
  onDuplicateSlide,
  onAddSlide,
  onAddSection,
  onDragStart,
  onDragOver,
  onDragEnd,
  onToggleSection,
  onSectionDoubleClick,
  onSectionNameChange,
  onSectionNameSubmit,
  onSectionEditCancel,
  onDeleteSection,
}: SlideListPanelProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const draggedSlide = activeDragId && !activeDragId.startsWith('section-') ? slides.find(s => s.id === activeDragId) : null;
  const draggedSection = activeDragId?.startsWith('section-') ? sections.find(s => s.id === activeDragId.replace('section-', '')) : null;

  return (
    <div className="w-56 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex flex-col">
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">슬라이드</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onAddSection} title="섹션 추가">
              <FolderPlus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onAddSlide} title="슬라이드 추가">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
            <DropZone id="dz-0" isActive={activeOverId === 'dz-0'} />
            
            {orderedItems.map((item, index) => {
              if (item.type === 'slide') {
                const slide = item.data as Slide;
                const globalIndex = slides.findIndex(s => s.id === slide.id);
                return (
                  <React.Fragment key={slide.id}>
                    <DraggableSlideItem 
                      slide={slide} 
                      globalIndex={globalIndex} 
                      isActive={globalIndex === activeSlideIndex} 
                      isDragging={activeDragId === slide.id} 
                      onSelect={() => onSelectSlide(globalIndex)} 
                      onDelete={onDeleteSlide} 
                      onDuplicate={onDuplicateSlide} 
                      canvasWidth={CANVAS_WIDTH} 
                      canvasHeight={CANVAS_HEIGHT} 
                    />
                    <DropZone id={`dz-${index + 1}`} isActive={activeOverId === `dz-${index + 1}`} />
                  </React.Fragment>
                );
              } else {
                const section = item.data as SlideSection;
                const sectionSlides = slides.filter(s => s.sectionId === section.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                return (
                  <React.Fragment key={section.id}>
                    <div className={cn("space-y-1 rounded-lg p-2 border-2 border-dashed transition-colors", activeDragId === `section-${section.id}` ? "opacity-30" : "bg-neutral-50/50 dark:bg-neutral-800/30 border-neutral-300 dark:border-neutral-600")}>
                      <DraggableSectionHeader 
                        section={section} 
                        slideCount={sectionSlides.length} 
                        isEditing={editingSectionId === section.id} 
                        editingName={editingSectionName} 
                        isDragging={activeDragId === `section-${section.id}`} 
                        onToggle={() => onToggleSection(section.id)} 
                        onDoubleClick={() => onSectionDoubleClick(section.id, section.name)} 
                        onNameChange={onSectionNameChange} 
                        onNameSubmit={() => onSectionNameSubmit(section.id)} 
                        onEditCancel={onSectionEditCancel} 
                        onDelete={() => onDeleteSection(section.id)} 
                      />
                      
                      {(section.isOpen ?? true) && (
                        <div className="ml-2 space-y-1">
                          <DropZone id={`sdz_${section.id}_0`} isActive={activeOverId === `sdz_${section.id}_0`} />
                          {sectionSlides.map((slide, slideIdx) => {
                            const globalIndex = slides.findIndex(s => s.id === slide.id);
                            return (
                              <React.Fragment key={slide.id}>
                                <DraggableSlideItem 
                                  slide={slide} 
                                  globalIndex={globalIndex} 
                                  isActive={globalIndex === activeSlideIndex} 
                                  isDragging={activeDragId === slide.id} 
                                  onSelect={() => onSelectSlide(globalIndex)} 
                                  onDelete={onDeleteSlide} 
                                  onDuplicate={onDuplicateSlide} 
                                  canvasWidth={CANVAS_WIDTH} 
                                  canvasHeight={CANVAS_HEIGHT} 
                                />
                                <DropZone id={`sdz_${section.id}_${slideIdx + 1}`} isActive={activeOverId === `sdz_${section.id}_${slideIdx + 1}`} />
                              </React.Fragment>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <DropZone id={`dz-${index + 1}`} isActive={activeOverId === `dz-${index + 1}`} />
                  </React.Fragment>
                );
              }
            })}
            
            <DragOverlay dropAnimation={null}>
              {draggedSlide && (
                <div className="aspect-[16/9] w-48 rounded-md border-2 border-blue-500 bg-white shadow-2xl" style={{ backgroundColor: draggedSlide.backgroundColor || '#ffffff' }}>
                  <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                    {draggedSlide.images.length > 0 ? draggedSlide.images.map((img) => (
                      <img key={img.id} src={img.url} alt="" className="absolute object-cover" style={{ left: `${(img.x / CANVAS_WIDTH) * 100}%`, top: `${(img.y / CANVAS_HEIGHT) * 100}%`, width: `${(img.width / CANVAS_WIDTH) * 100}%`, height: `${(img.height / CANVAS_HEIGHT) * 100}%` }} />
                    )) : <span className="text-xs text-neutral-400">Empty Slide</span>}
                  </div>
                </div>
              )}
              {draggedSection && (
                <div className="rounded-lg border-2 border-dashed border-blue-500 bg-white dark:bg-neutral-700 shadow-2xl p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <GripVertical className="h-3 w-3 text-neutral-400" />
                    <ChevronRight className="h-3 w-3 text-neutral-400" />
                    <span className="text-xs font-medium">{draggedSection.name}</span>
                    <span className="text-[10px] text-neutral-500">{slides.filter(s => s.sectionId === draggedSection.id).length}</span>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </ScrollArea>
    </div>
  );
}

