import React, { memo, useState, useRef, useCallback, useEffect } from 'react';
import { NodeProps, Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { Layout, BoxSelect, Settings, Globe, Image as ImageIcon, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NODE_COLORS, Hotspot } from '../types';

const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjM2MCIgaGVpZ2h0PSI0MCIgcng9IjQiIGZpbGw9IiNFNUU3RUIiLz4KPHJlY3QgeD0iMjAiIHk9IjgwIiB3aWR0aD0iMjQwIiBoZWlnaHQ9IjIwMCIgcng9IjQiIGZpbGw9IiNFNUU3RUIiLz4KPHJlY3QgeD0iMjgwIiB5PSI4MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI5MCIgcng9IjQiIGZpbGw9IiNFNUU3RUIiLz4KPHJlY3QgeD0iMjgwIiB5PSIxOTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iOTAiIHJ4PSI0IiBmaWxsPSIjRTVFN0VCIi8+Cjwvc3ZnPg==';

export const ImageNode = memo(({ id, data, selected }: NodeProps) => {
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
