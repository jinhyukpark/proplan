import React, { useState, useMemo } from "react";
import { 
  Plus, 
  Globe, 
  FileText, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  Image as ImageIcon,
  MoreHorizontal,
  FolderPlus,
  FilePlus,
  GripVertical,
  GitBranch,
  Presentation,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  defaultDropAnimationSideEffects,
  DropAnimation
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export type SiteItemType = "folder" | "page" | "image" | "flow" | "ppt";

export interface SiteItem {
  id: string;
  type: SiteItemType;
  name: string;
  url?: string;
  children?: SiteItem[];
  isOpen?: boolean;
  metadata?: {
    title: string;
    description: string;
    rfNumber: string;
    date?: string; 
  };
  imageMetadata?: {
    width?: number;
    height?: number;
    fileSize?: string;
    insertedAt?: string;
    uploadedBy?: {
      name: string;
      avatar?: string;
    };
  };
}

interface SiteMapPanelProps {
  items: SiteItem[];
  activeUrl: string;
  onSelectItem: (item: SiteItem) => void;
  onAddItem: (type: SiteItemType, parentId?: string) => void;
  onDeleteItem: (id: string) => void;
  onToggleFolder: (id: string) => void;
  getMarkerCount: (url: string) => number;
  onMoveItem: (activeId: string, overId: string) => void;
}

// Flatten the tree for SortableContext
const flattenTree = (items: SiteItem[], parentId: string | null = null, depth = 0): { item: SiteItem, parentId: string | null, depth: number }[] => {
  return items.reduce((acc, item) => {
    acc.push({ item, parentId, depth });
    if (item.children && item.isOpen) {
      acc.push(...flattenTree(item.children, item.id, depth + 1));
    }
    return acc;
  }, [] as { item: SiteItem, parentId: string | null, depth: number }[]);
};

const SortableSiteItemRow = ({ 
  item, 
  depth, 
  activeUrl, 
  onSelectItem, 
  onAddItem, 
  onDeleteItem, 
  onToggleFolder,
  getMarkerCount,
  isOverlay
}: { 
  item: SiteItem; 
  depth: number; 
  activeUrl: string;
  onSelectItem: (item: SiteItem) => void;
  onAddItem: (type: SiteItemType, parentId?: string) => void;
  onDeleteItem: (id: string) => void;
  onToggleFolder: (id: string) => void;
  getMarkerCount: (url: string) => number;
  isOverlay?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: `${depth * 16 + 12}px`, // Increased indentation for clarity
    opacity: isDragging ? 0.5 : 1,
  };

  const isActive = item.url === activeUrl || 
    (item.type === 'flow' && activeUrl === `flow:${item.id}`) ||
    (item.type === 'ppt' && activeUrl === `ppt:${item.id}`) ||
    (activeUrl === 'dashboard:' && item.id === 'dashboard');
  const markerCount = item.url ? getMarkerCount(item.url) : 0;

  const handleNativeDragStart = (e: React.DragEvent) => {
    if (item.type === 'image' && item.url) {
      e.dataTransfer.setData('text/image-url', item.url);
      e.dataTransfer.setData('text/image-name', item.name);
      e.dataTransfer.effectAllowed = 'copy';
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "group flex items-center gap-2 py-1.5 pr-2 rounded-md text-sm transition-all select-none cursor-pointer my-0.5",
        isActive 
          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 font-medium border-l-[3px] border-blue-500 shadow-sm" 
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-[3px] border-transparent",
        isOverlay && "bg-background border border-border shadow-lg z-50 opacity-100"
      )}
      draggable={item.type === 'image'}
      onDragStart={handleNativeDragStart}
      onClick={() => {
        if (item.type === 'folder') {
          onToggleFolder(item.id);
        } else {
          onSelectItem(item);
        }
      }}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-0.5 -ml-1 text-muted-foreground/50 hover:text-foreground"
      >
        <GripVertical className="w-3 h-3" />
      </div>

      {/* Toggle / Icon */}
      <div 
        className={cn(
          "w-4 h-4 flex items-center justify-center shrink-0 cursor-pointer hover:bg-black/5 rounded",
          item.type !== 'folder' && "opacity-0 pointer-events-none"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFolder(item.id);
        }}
      >
        {item.isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </div>

      {/* Type Icon */}
      {item.type === 'folder' && <Folder className="w-3.5 h-3.5 shrink-0 text-amber-500/80 fill-amber-500/20" />}
      {item.type === 'page' && <Globe className="w-3.5 h-3.5 shrink-0 text-blue-500/80" />}
      {item.type === 'image' && <ImageIcon className="w-3.5 h-3.5 shrink-0 text-purple-500/80" />}
      {item.type === 'flow' && <GitBranch className="w-3.5 h-3.5 shrink-0 text-green-500/80" />}
      {item.type === 'ppt' && <Presentation className="w-3.5 h-3.5 shrink-0 text-orange-500/80" />}

      {/* Label */}
      <div className="flex-1 truncate min-w-0 flex items-center gap-2">
        <span className="truncate">{item.name}</span>
        {item.type === 'folder' && item.children && item.children.length > 0 && (
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {item.children.length}
          </span>
        )}
      </div>

      {/* Marker Count */}
      {markerCount > 0 && (
        <Badge variant="secondary" className="h-4 px-1 min-w-[1rem] justify-center text-[9px] font-mono shrink-0">
          {markerCount}
        </Badge>
      )}
      
      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {item.type === 'folder' && (
            <>
              <DropdownMenuItem onClick={() => onAddItem('page', item.id)}>
                <Globe className="w-3 h-3 mr-2" /> Add URL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddItem('image', item.id)}>
                <ImageIcon className="w-3 h-3 mr-2" /> Add Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddItem('flow', item.id)}>
                <GitBranch className="w-3 h-3 mr-2" /> Add Flow
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddItem('ppt', item.id)}>
                <Presentation className="w-3 h-3 mr-2" /> Add Presentation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddItem('folder', item.id)}>
                <FolderPlus className="w-3 h-3 mr-2" /> Add Folder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive"
            onClick={() => onDeleteItem(item.id)}
          >
            <Trash2 className="w-3 h-3 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export function SiteMapPanel({
  items,
  activeUrl,
  onSelectItem,
  onAddItem,
  onDeleteItem,
  onToggleFolder,
  getMarkerCount,
  onMoveItem
}: SiteMapPanelProps) {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const flatItems = useMemo(() => flattenTree(items), [items]);
  const sortedIds = useMemo(() => flatItems.map(({ item }) => item.id), [flatItems]);
  const activeDragItem = useMemo(() => {
    if (!activeDragId) return null;
    return flatItems.find(({ item }) => item.id === activeDragId);
  }, [activeDragId, flatItems]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onMoveItem(active.id as string, over.id as string);
    }
    setActiveDragId(null);
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: { opacity: '0.5' },
      },
    }),
  };

  return (
    <div className="flex flex-col h-full bg-muted/20 border-r border-border">
      <div className="h-12 border-b border-border flex items-center px-4 justify-between shrink-0 bg-background/50 backdrop-blur-sm">
        <span className="font-semibold text-sm flex items-center gap-2">
          <Folder className="w-4 h-4 text-primary" />
          Project Files
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAddItem('folder')} title="New Folder">
            <FolderPlus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAddItem('page')} title="New Page">
            <FilePlus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAddItem('flow')} title="New Flow">
            <GitBranch className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAddItem('ppt')} title="New Presentation">
            <Presentation className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Dashboard Item */}
        <div 
          className={cn(
            "flex items-center gap-2 py-2 px-4 cursor-pointer transition-colors border-b border-border/50",
            activeUrl === 'dashboard:'
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
          )}
          onClick={() => onSelectItem({ id: 'dashboard', type: 'folder', name: 'Dashboard', url: 'dashboard:' } as SiteItem)}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-sm">Dashboard</span>
        </div>

        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
            <div className="py-2">
              {flatItems.length > 0 ? (
                flatItems.map(({ item, depth }) => (
                  <SortableSiteItemRow 
                    key={item.id} 
                    item={item} 
                    depth={depth}
                    activeUrl={activeUrl}
                    onSelectItem={onSelectItem}
                    onAddItem={onAddItem}
                    onDeleteItem={onDeleteItem}
                    onToggleFolder={onToggleFolder}
                    getMarkerCount={getMarkerCount}
                  />
                ))
              ) : (
                <div className="text-center py-8 px-4 text-muted-foreground text-xs">
                  No items yet.
                  <br />
                  Create a folder or add a page to start.
                </div>
              )}
            </div>
          </SortableContext>
          
          <DragOverlay dropAnimation={dropAnimation}>
            {activeDragId && activeDragItem ? (
               <SortableSiteItemRow 
                 item={activeDragItem.item} 
                 depth={0} 
                 activeUrl={activeUrl}
                 onSelectItem={() => {}}
                 onAddItem={() => {}}
                 onDeleteItem={() => {}}
                 onToggleFolder={() => {}}
                 getMarkerCount={getMarkerCount}
                 isOverlay
               />
            ) : null}
          </DragOverlay>
        </DndContext>
      </ScrollArea>
      
      <div className="p-3 border-t border-border bg-background/50 text-[10px] text-muted-foreground flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Project: Illunex Redesign</span>
      </div>
    </div>
  );
}
