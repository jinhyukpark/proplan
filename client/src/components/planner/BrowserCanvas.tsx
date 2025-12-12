import React, { useState, useRef, useEffect } from "react";
import { Search, RotateCcw, Lock, ChevronLeft, ChevronRight, MousePointer2, Plus, Link as LinkIcon, Image as ImageIcon, Mic, Camera, Crop, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import placeholderImage from "@assets/generated_images/modern_saas_dashboard_interface_screenshot.png";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Marker {
  id: string;
  number: number;
  x: number; // percentage
  y: number; // percentage
  type: 'default' | 'link';
  title: string;
  description: string;
  linkUrl?: string; // Target URL for link markers
  color: string;
  author: User;
  status: 'pending' | 'in_progress' | 'done' | 'hold';
  history: {
    id: string;
    type: 'comment' | 'status_change';
    content: string;
    author: User;
    createdAt: string;
  }[];
}

interface BrowserCanvasProps {
  url: string;
  setUrl: (url: string) => void;
  markers: Marker[];
  onAddMarker: (x: number, y: number, type: 'default' | 'link') => void;
  activeMarkerId: string | null;
  onMarkerClick: (id: string) => void;
  onPageLoad?: () => void;
  contentType?: "url" | "image";
  onCapture?: (type: 'full' | 'area', rect?: {x: number, y: number, w: number, h: number}) => void;
}

export function BrowserCanvas({
  url,
  setUrl,
  markers,
  onAddMarker,
  activeMarkerId,
  onMarkerClick,
  onPageLoad,
  contentType = "url",
  onCapture,
}: BrowserCanvasProps) {
  const [inputUrl, setInputUrl] = useState(url);
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isIframeError, setIsIframeError] = useState(false);
  const [mode, setMode] = useState<"navigate" | "annotate" | "link" | "image">("annotate");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageInputUrl, setImageInputUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCaptured, setIsCaptured] = useState(false);
  const [isSelectingArea, setIsSelectingArea] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{x: number, y: number} | null>(null);
  const [currentSelection, setCurrentSelection] = useState<{x: number, y: number, w: number, h: number} | null>(null);

  // Sync internal input state when prop changes
  useEffect(() => {
    setInputUrl(url);
    setIsCaptured(contentType === 'image');
    // Reset selection state on URL change
    setIsSelectingArea(false);
    setSelectionStart(null);
    setCurrentSelection(null);
  }, [url, contentType]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = inputUrl;
    if (contentType === 'url' && !finalUrl.startsWith("http")) {
      finalUrl = "https://" + finalUrl;
    }
    setUrl(finalUrl);
    setIsIframeError(false); // Reset error state on new URL
    setIsCaptured(false);
    setIsSelectingArea(false);
  };

  const handleCapture = (type: 'full' | 'area') => {
    if (type === 'area') {
      setIsSelectingArea(true);
      setMode('navigate'); // Temporarily disable other modes
    } else {
      // Full capture
      setIsCaptured(true);
      setMode('annotate');
      if (onCapture) {
        onCapture('full');
      }
    }
  };

  // Area Selection Handlers
  const handleSelectionMouseDown = (e: React.MouseEvent) => {
    if (!isSelectingArea || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSelectionStart({ x, y });
    setCurrentSelection({ x, y, w: 0, h: 0 });
  };

  const handleSelectionMouseMove = (e: React.MouseEvent) => {
    if (!isSelectingArea || !selectionStart || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const x = Math.min(selectionStart.x, currentX);
    const y = Math.min(selectionStart.y, currentY);
    const w = Math.abs(currentX - selectionStart.x);
    const h = Math.abs(currentY - selectionStart.y);

    setCurrentSelection({ x, y, w, h });
  };

  const handleSelectionMouseUp = () => {
    if (!isSelectingArea || !selectionStart || !currentSelection) return;
    
    // Capture values before resetting state
    const { x, y, w, h } = currentSelection;
    
    // Finish selection
    setIsSelectingArea(false);
    setSelectionStart(null);
    setCurrentSelection(null);
    
    // Transition to captured state
    setIsCaptured(true);
    setMode('annotate');
    
    // Notify parent about capture
    if (onCapture) {
      onCapture('area', { x, y, w, h });
    }
  };


  const handleCanvasClick = (e: React.MouseEvent) => {
    if (contentType === 'image') return; // Disable all marker functionality for image mode
    if (mode === "navigate" && contentType === 'url') return; // Only allow navigation clicks for URL mode
    if (mode === 'image') return; // Don't add markers in image mode
    if (!contentRef.current) return;

    // Prevent adding marker if clicking on an existing marker
    if ((e.target as HTMLElement).closest(".marker-dot")) return;

    // Use wrapperRef for coordinate calculation to ensure relative positioning to content
    const targetRef = wrapperRef.current || contentRef.current;
    if (!targetRef) return;

    const rect = targetRef.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Add marker based on mode
    if (mode === 'link') {
      onAddMarker(x, y, 'link');
    } else {
      onAddMarker(x, y, 'default');
    }
  };

  const handleAddImage = () => {
    if (imageInputUrl.trim()) {
      setUrl(imageInputUrl);
      setShowImageDialog(false);
      setImageInputUrl("");
      setMode("annotate");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setUrl(dataUrl);
        setShowImageDialog(false);
        setImageInputUrl("");
        setMode("annotate");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-r border-border shadow-sm overflow-hidden">
      {/* Browser Chrome / Address Bar */}
      <div className="h-12 border-b border-border bg-muted/30 flex items-center px-4 gap-3 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/80" />
          <div className="w-3 h-3 rounded-full bg-amber-400/80" />
          <div className="w-3 h-3 rounded-full bg-green-400/80" />
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground mx-2">
          <ChevronLeft className="w-4 h-4 opacity-50" />
          <ChevronRight className="w-4 h-4 opacity-50" />
          <RotateCcw className="w-4 h-4 opacity-70 hover:opacity-100 cursor-pointer" />
        </div>

        <form onSubmit={handleUrlSubmit} className="flex-1 max-w-xl relative">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            {contentType === 'image' ? (
              <MousePointer2 className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
          </div>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full h-8 pl-8 pr-4 bg-background border border-border/50 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-mono text-xs"
            placeholder={contentType === 'image' ? "Image URL..." : "Enter URL to annotate..."}
          />
        </form>

        {contentType !== 'image' && (
          <div className="flex items-center gap-2 border-l border-border pl-3 ml-1">
            <ToggleGroup type="single" value={mode === 'image' ? 'annotate' : mode} onValueChange={(v) => {
              if (v === 'image') {
                setShowImageDialog(true);
              } else {
                setMode(v as any);
              }
            }} className="gap-1">
              <ToggleGroupItem value="navigate" size="sm" className="h-8 w-8 p-0" title="Navigate Mode" disabled={isCaptured || isSelectingArea}>
                <MousePointer2 className="w-4 h-4" />
              </ToggleGroupItem>
              
              {/* Capture Menu */}
              {contentType === 'url' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      disabled={isSelectingArea}
                      className={cn(
                        "h-8 w-8 p-0 flex items-center justify-center rounded border border-input hover:bg-accent hover:text-accent-foreground ml-2",
                        (isCaptured || isSelectingArea) ? "bg-accent text-accent-foreground border-accent" : "bg-primary text-primary-foreground hover:bg-primary/90 border-primary",
                        isSelectingArea && "opacity-50 cursor-not-allowed"
                      )}
                      title={isCaptured ? "Recapture / Reset" : "Capture Website"}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleCapture('full')}>
                      <Maximize className="w-4 h-4 mr-2" />
                      <span>Full Page Capture</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCapture('area')}>
                      <Crop className="w-4 h-4 mr-2" />
                      <span>Select Area</span>
                    </DropdownMenuItem>
                    {isCaptured && (
                      <>
                        <div className="h-px bg-border my-1" />
                        <DropdownMenuItem onClick={() => {
                          setIsCaptured(false);
                          setMode('navigate');
                        }}>
                          <RotateCcw className="w-4 h-4 mr-2" />
                          <span>Reset to Web Mode</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <ToggleGroupItem value="annotate" size="sm" className="h-8 w-8 p-0" title="Annotate Mode" disabled={!isCaptured && contentType === 'url'}>
                <Plus className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="link" size="sm" className="h-8 w-8 p-0" title="Add Link / Hotspot" disabled={!isCaptured && contentType === 'url'}>
                <LinkIcon className="w-4 h-4" />
              </ToggleGroupItem>
              <button
                onClick={() => setShowImageDialog(true)}
                className={cn(
                  "h-8 w-8 p-0 flex items-center justify-center rounded border border-input hover:bg-accent hover:text-accent-foreground",
                  showImageDialog && "bg-accent text-accent-foreground"
                )}
                title="Add Image Layer"
                disabled={!isCaptured && contentType === 'url'}
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                className="h-8 w-8 p-0 flex items-center justify-center rounded border border-input hover:bg-accent hover:text-accent-foreground"
                title="Voice Memo (Coming Soon)"
                disabled={!isCaptured && contentType === 'url'}
              >
                <Mic className="w-4 h-4" />
              </button>
            </ToggleGroup>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden bg-muted/10 group">
        <div 
          ref={contentRef}
          className="w-full h-full relative"
          onClick={handleCanvasClick}
        >
          {/* Content Wrapper */}
          <div ref={wrapperRef} className="relative w-full h-full">
            {/* Content Layer */}
            {url && !isIframeError ? (
              contentType === 'image' ? (
              <div className="min-h-full min-w-full flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm p-8 transition-colors duration-300">
                 <img 
                   src={url}
                   className="max-w-full max-h-[85vh] shadow-2xl select-none pointer-events-none rounded-sm ring-1 ring-white/10"
                   style={{ pointerEvents: 'none' }} // Ensure clicks go to container
                   alt="Reference"
                   onError={() => setIsIframeError(true)}
                   onLoad={onPageLoad}
                 />
              </div>
            ) : (
              <iframe
                src={url}
                className="w-full h-full border-none select-none"
                title="Annotated Page"
                onError={() => setIsIframeError(true)}
                onLoad={onPageLoad}
              />
            )
          ) : (
            <div className="w-full min-h-full flex flex-col items-center justify-start">
               {/* Use placeholder image if no URL or iframe blocked */}
               <img 
                 src={placeholderImage} 
                 alt="Placeholder" 
                 className="w-full h-auto object-cover opacity-90 shadow-lg"
               />
               {!url && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-background/50 backdrop-blur-[1px]">
                   <div className="bg-background/90 p-6 rounded-xl border border-border shadow-2xl text-center max-w-md">
                     <MousePointer2 className="w-10 h-10 mx-auto mb-4 text-primary/50" />
                     <h3 className="text-lg font-semibold mb-2">Ready to Plan</h3>
                     <p className="text-sm text-muted-foreground mb-4">
                       Enter a URL above to start.
                     </p>
                     <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                       <div className="flex items-center gap-1">
                         <MousePointer2 className="w-3 h-3" /> Navigate
                       </div>
                       <div className="w-px h-3 bg-border" />
                       <div className="flex items-center gap-1">
                         <Plus className="w-3 h-3" /> Annotate
                       </div>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          )}
          
          {/* Area Selection Overlay */}
          {isSelectingArea && (
            <div 
              className="absolute inset-0 z-50 cursor-crosshair bg-black/20"
              onMouseDown={handleSelectionMouseDown}
              onMouseMove={handleSelectionMouseMove}
              onMouseUp={handleSelectionMouseUp}
              onMouseLeave={() => {
                if (selectionStart) handleSelectionMouseUp();
              }}
            >
              {currentSelection && (
                <div 
                  className="absolute border-2 border-primary bg-primary/10 backdrop-blur-[1px]"
                  style={{
                    left: currentSelection.x,
                    top: currentSelection.y,
                    width: currentSelection.w,
                    height: currentSelection.h,
                  }}
                />
              )}
              {!selectionStart && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-full text-sm font-medium pointer-events-none">
                  Drag to select area
                </div>
              )}
            </div>
          )}

          {/* Markers & Interaction Layer */}
          <div 
            className={cn(
              "absolute inset-0 z-10",
              (!isCaptured && contentType === 'url' && mode === "navigate") ? "pointer-events-none" : "pointer-events-auto",
              mode === "annotate" && "cursor-crosshair",
              mode === "link" && "cursor-alias",
              isSelectingArea && "pointer-events-none" // Disable marker interaction during selection
            )}
          >
          {markers.map((marker) => (
            <div
              key={marker.id}
              className={cn(
                "marker-dot absolute w-7 h-7 -ml-3.5 -mt-3.5 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md cursor-pointer transition-transform hover:scale-110 z-50 border-2 border-white dark:border-zinc-900",
                activeMarkerId === marker.id ? "scale-125 ring-2 ring-primary ring-offset-2" : "",
                marker.type === 'link' ? "rounded-sm" : "" // Link markers are square-ish
              )}
              style={{ 
                left: `${marker.x}%`, 
                top: `${marker.y}%`,
                backgroundColor: marker.type === 'link' ? '#0ea5e9' : marker.color // Sky blue for links
              }}
              onClick={(e) => {
                e.stopPropagation();
                onMarkerClick(marker.id);
              }}
              title={marker.type === 'link' ? `Link to: ${marker.linkUrl || 'Not set'}` : undefined}
            >
              {marker.type === 'link' ? <LinkIcon className="w-3.5 h-3.5" /> : marker.number}
            </div>
          ))}
          </div>
        </div>
      </div>
      </div>
      
      {/* Bottom Status Bar */}
      <div className="h-6 bg-muted/30 border-t border-border flex items-center px-4 text-[10px] text-muted-foreground justify-between">
        <div className="flex gap-4">
          <span>{markers.length} Annotations</span>
          <span>Mode: {mode === 'image' ? 'Annotate' : mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
        </div>
        <span>Canvas Size: {contentRef.current?.clientWidth} x {contentRef.current?.clientHeight}</span>
      </div>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Image Layer</DialogTitle>
            <DialogDescription>
              Upload an image or enter an image URL to add to your canvas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="image-url" className="text-sm font-medium">
                Image URL
              </label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.png"
                value={imageInputUrl}
                onChange={(e) => setImageInputUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload File
              </Button>
              <Button
                className="flex-1"
                onClick={handleAddImage}
                disabled={!imageInputUrl.trim()}
              >
                Load Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}