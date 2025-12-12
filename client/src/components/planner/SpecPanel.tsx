import React, { useRef, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, FileText, Hash, Trash2, Clock, CheckCircle2, AlertCircle, Circle, Send, Link as LinkIcon, ExternalLink, History, Image as ImageIcon, User, Maximize2 } from "lucide-react";
import { Marker } from "./BrowserCanvas";
import { cn } from "@/lib/utils";
import TextareaAutosize from 'react-textarea-autosize';
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface PageMetadata {
  title: string;
  description: string;
  rfNumber: string;
  date: Date | undefined;
  url?: string;
}

export interface ImageMetadata {
  width?: number;
  height?: number;
  fileSize?: string;
  insertedAt?: Date;
  uploadedBy?: {
    name: string;
    avatar?: string;
  };
}

interface SpecPanelProps {
  markers: Marker[];
  activeMarkerId: string | null;
  pageMetadata: PageMetadata;
  onUpdatePageMetadata: (updates: Partial<PageMetadata>) => void;
  onUpdateMarker: (id: string, updates: Partial<Marker>) => void;
  onDeleteMarker: (id: string) => void;
  onSelectMarker: (id: string) => void;
  onAddComment: (id: string, text: string) => void;
  onNavigate?: (url: string) => void;
  contentType?: 'url' | 'image';
  imageMetadata?: ImageMetadata;
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: Circle, color: 'text-muted-foreground', bg: 'bg-muted' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  done: { label: 'Done', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
  hold: { label: 'Hold', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
};

export function SpecPanel({
  markers,
  activeMarkerId,
  pageMetadata,
  onUpdatePageMetadata,
  onUpdateMarker,
  onDeleteMarker,
  onSelectMarker,
  onAddComment,
  onNavigate,
  contentType = 'url',
  imageMetadata,
}: SpecPanelProps) {
  
  const activeMarkerRef = useRef<HTMLDivElement>(null);
  const [commentInput, setCommentInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  // Scroll to active marker
  useEffect(() => {
    if (activeMarkerId && activeMarkerRef.current) {
      activeMarkerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setShowHistory(false); // Reset history visibility when active marker changes
  }, [activeMarkerId]);

  const handlePostComment = (markerId: string) => {
    if (!commentInput.trim()) return;
    onAddComment(markerId, commentInput);
    setCommentInput("");
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Page Header (Compact) */}
      <div className="shrink-0 p-4 border-b border-border space-y-3 bg-muted/10">
        <div className="flex items-center justify-between text-muted-foreground">
           <div className="flex items-center gap-2 font-medium text-xs uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            Page Specs
           </div>
           
           {/* Compact Date Picker */}
           <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-2 text-xs font-normal hover:bg-background/80",
                    !pageMetadata.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1.5 h-3 w-3" />
                  {pageMetadata.date ? format(pageMetadata.date, "MMM d, yyyy") : <span>Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={pageMetadata.date}
                  onSelect={(date) => onUpdatePageMetadata({ date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
        </div>

        <div className="space-y-3">
           {/* Title & RF Number Row */}
          <div className="flex gap-2 items-start">
             <div className="flex-1 space-y-0.5">
               <Input 
                 value={pageMetadata.title}
                 onChange={(e) => onUpdatePageMetadata({ title: e.target.value })}
                 className="h-8 font-semibold text-sm bg-background px-2 border-transparent hover:border-input focus:border-input transition-colors"
                 placeholder="Page Title"
               />
             </div>
             <div className="w-20 space-y-0.5">
               <Input 
                 value={pageMetadata.rfNumber}
                 onChange={(e) => onUpdatePageMetadata({ rfNumber: e.target.value })}
                 className="h-8 font-mono text-xs bg-background px-2 text-center border-transparent hover:border-input focus:border-input transition-colors"
                 placeholder="RF-NO"
               />
             </div>
          </div>
          
          {/* Description */}
          <div className="px-1 space-y-2">
             {/* URL Display */}
             {pageMetadata.url && (
               <div className="flex items-center gap-2 px-2 py-1.5 bg-background rounded border border-border/50">
                 <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">URL</div>
                 <div className="text-xs text-foreground/80 truncate font-mono select-all">
                   {pageMetadata.url}
                 </div>
               </div>
             )}

            <TextareaAutosize
              value={pageMetadata.description}
              onChange={(e) => onUpdatePageMetadata({ description: e.target.value })}
              className="w-full min-h-[40px] p-2 rounded-md bg-background/50 text-xs text-muted-foreground ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none hover:bg-background transition-colors"
              placeholder="Add page description..."
            />
          </div>
        </div>
      </div>

      {/* Image Metadata - Only for image content type */}
      {contentType === 'image' && (
        <div className="flex-1 min-w-0 flex flex-col bg-muted/5">
          <div className="h-10 border-b border-border flex items-center px-6 justify-between shrink-0 bg-background/50 backdrop-blur-sm">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              이미지 정보
            </span>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {/* Image Size */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Maximize2 className="w-3.5 h-3.5" />
                  이미지 사이즈
                </div>
                <div className="bg-background rounded-lg border p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase mb-1">가로</div>
                      <div className="text-sm font-medium">{imageMetadata?.width || '-'} px</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase mb-1">세로</div>
                      <div className="text-sm font-medium">{imageMetadata?.height || '-'} px</div>
                    </div>
                  </div>
                  {imageMetadata?.fileSize && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-[10px] text-muted-foreground uppercase mb-1">파일 크기</div>
                      <div className="text-sm font-medium">{imageMetadata.fileSize}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Inserted Date */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  삽입 날짜
                </div>
                <div className="bg-background rounded-lg border p-3">
                  <div className="text-sm font-medium">
                    {imageMetadata?.insertedAt 
                      ? format(imageMetadata.insertedAt, 'yyyy년 MM월 dd일 HH:mm')
                      : pageMetadata.date 
                        ? format(pageMetadata.date, 'yyyy년 MM월 dd일 HH:mm')
                        : '-'}
                  </div>
                </div>
              </div>

              {/* Uploaded By */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <User className="w-3.5 h-3.5" />
                  첨부한 멤버
                </div>
                <div className="bg-background rounded-lg border p-3">
                  {imageMetadata?.uploadedBy ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={imageMetadata.uploadedBy.avatar} />
                        <AvatarFallback className="text-xs">
                          {imageMetadata.uploadedBy.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{imageMetadata.uploadedBy.name}</span>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">-</div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Marker List (Annotations) - Hidden for image content type */}
      {contentType !== 'image' && (
      <div className="flex-1 min-w-0 flex flex-col bg-muted/5">
        <div className="h-10 border-b border-border flex items-center px-6 justify-between shrink-0 bg-background/50 backdrop-blur-sm">
           <span className="text-xs font-semibold text-muted-foreground">Annotations ({markers.length})</span>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {markers.length === 0 ? (
               <div className="text-center py-10 text-muted-foreground text-sm">
                 <Hash className="w-8 h-8 mx-auto mb-3 opacity-20" />
                 No annotations yet. <br/> Click on the canvas to add one.
               </div>
            ) : (
              markers.map((marker) => (
                <div 
                  key={marker.id}
                  ref={activeMarkerId === marker.id ? activeMarkerRef : null}
                  className={cn(
                    "group relative flex flex-col gap-3 p-3 rounded-lg border transition-all duration-200",
                    activeMarkerId === marker.id 
                      ? "bg-background border-primary/50 shadow-md ring-1 ring-primary/20" 
                      : "bg-background/50 border-transparent hover:border-border hover:bg-background"
                  )}
                  onClick={() => onSelectMarker(marker.id)}
                >
                  <div className="flex gap-3">
                    {/* Number Badge */}
                    <div 
                      className={cn(
                        "w-6 h-6 shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm mt-0.5",
                        marker.type === 'link' ? "rounded-sm" : "rounded-full"
                      )}
                      style={{ backgroundColor: marker.type === 'link' ? '#0ea5e9' : marker.color }}
                    >
                      {marker.type === 'link' ? <LinkIcon className="w-3.5 h-3.5" /> : marker.number}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                         <span className="text-xs font-semibold text-foreground/80">
                           {marker.type === 'link' ? 'Link Hotspot' : `Annotation #${marker.number}`}
                         </span>
                         
                         <div className="flex items-center gap-2">
                            {/* Status Selector */}
                            <Select 
                              value={marker.status} 
                              onValueChange={(val: any) => onUpdateMarker(marker.id, { status: val })}
                            >
                              <SelectTrigger className="h-6 w-[100px] text-[10px] px-2 border-transparent bg-muted/50 hover:bg-muted focus:ring-0">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                  <SelectItem key={key} value={key} className="text-xs">
                                    <div className="flex items-center gap-2">
                                      <config.icon className={cn("w-3 h-3", config.color)} />
                                      {config.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                           {/* History Toggle */}
                           <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-6 w-6 text-muted-foreground hover:text-foreground transition-colors",
                                showHistory && "bg-muted text-foreground"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowHistory(!showHistory);
                              }}
                              title="View History"
                            >
                              <History className="w-3 h-3" />
                            </Button>

                           {/* Author Info */}
                           {marker.author && (
                             <div className="flex items-center gap-1.5" title={`Created by ${marker.author.name}`}>
                               <Avatar className="w-4 h-4">
                                 <AvatarImage src={marker.author.avatar} />
                                 <AvatarFallback className="text-[8px]">{marker.author.name[0]}</AvatarFallback>
                               </Avatar>
                             </div>
                           )}

                           {/* Delete Action (Moved here) */}
                           <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 transition-opacity",
                                (activeMarkerId === marker.id || "group-hover:opacity-100") 
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteMarker(marker.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                         </div>
                      </div>
                      
                      {/* Link Input (If type is link) */}
                      {marker.type === 'link' && (
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <LinkIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                            <Input
                              value={marker.linkUrl || ""}
                              onChange={(e) => onUpdateMarker(marker.id, { linkUrl: e.target.value })}
                              className="h-7 text-xs pl-7 bg-muted/30 border-transparent focus:bg-background"
                              placeholder="Enter target URL..."
                            />
                          </div>
                          {onNavigate && marker.linkUrl && (
                            <Button 
                              size="icon" 
                              variant="outline" 
                              className="h-7 w-7 shrink-0"
                              title="Go to Link"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (marker.linkUrl) onNavigate(marker.linkUrl);
                              }}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Main Description */}
                      <TextareaAutosize
                        value={marker.description}
                        onChange={(e) => onUpdateMarker(marker.id, { description: e.target.value })}
                        className="w-full bg-transparent text-sm resize-none focus:outline-none placeholder:text-muted-foreground/40 leading-relaxed font-medium"
                        placeholder={marker.type === 'link' ? "Describe where this link goes..." : "Write main requirement..."}
                        minRows={1}
                      />
                    </div>
                  </div>

                  {/* History / Comments Section (Only visible when active) */}
                  {activeMarkerId === marker.id && (
                    <div className="pl-9 space-y-3 pt-2 border-t border-border/50 animate-in fade-in slide-in-from-top-1">
                      {/* History List */}
                      {showHistory && marker.history && marker.history.length > 0 && (
                        <div className="space-y-3 mb-3 bg-muted/30 p-3 rounded-md border border-border/50">
                          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">History</div>
                          {marker.history.map((item) => (
                            <div key={item.id} className="flex gap-2 text-xs group/history">
                               <Avatar className="w-5 h-5 shrink-0 mt-0.5 border border-border/50">
                                 <AvatarImage src={item.author.avatar} />
                                 <AvatarFallback className="text-[8px]">{item.author.name[0]}</AvatarFallback>
                               </Avatar>
                               <div className="flex-1 space-y-0.5">
                                 <div className="flex items-center gap-2">
                                   <span className="font-medium text-foreground/80">{item.author.name}</span>
                                   <span className="text-[10px] text-muted-foreground">{format(new Date(item.createdAt), 'MMM d, h:mm a')}</span>
                                 </div>
                                 <div className={cn(
                                   "text-muted-foreground leading-relaxed",
                                   item.type === 'status_change' && "italic text-[10px] text-muted-foreground/70"
                                 )}>
                                   {item.content}
                                 </div>
                               </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment Input */}
                      <div className="flex gap-2 items-end">
                        <TextareaAutosize
                           value={commentInput}
                           onChange={(e) => setCommentInput(e.target.value)}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter' && !e.shiftKey) {
                               e.preventDefault();
                               handlePostComment(marker.id);
                             }
                           }}
                           placeholder="Reply or update status..."
                           className="flex-1 bg-muted/50 rounded-md p-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary/20 min-h-[32px]"
                           minRows={1}
                        />
                        <Button 
                          size="icon" 
                          className="h-8 w-8 shrink-0" 
                          disabled={!commentInput.trim()}
                          onClick={() => handlePostComment(marker.id)}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
      )}
    </div>
  );
}