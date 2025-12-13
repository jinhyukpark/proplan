import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { SlideListPanel } from './SlideListPanel';
import { PresentationToolbar } from './PresentationToolbar';
import { PresentationFlow } from './PresentationFlow';
import { LinkDialog, ReferenceDialog, MemoDialog } from './Dialogs';
import { Slide, SlideSection, SlideImage, SlideMarker, SlideLink, SlideReference, SlideMemo, SlideShape, CANVAS_WIDTH, CANVAS_HEIGHT } from './types';

interface PresentationCanvasProps {
  presentationId: string;
  slides: Slide[];
  onSlidesChange: (slides: Slide[]) => void;
  onActiveSlideChange?: (slideIndex: number) => void;
  onMarkerSelect?: (markerId: string | null) => void;
  selectedMarkerId?: string | null;
  initialSections?: SlideSection[];
}

// Re-export types for backward compatibility
export type { Slide, SlideSection, SlideImage, SlideMarker, SlideLink, SlideReference, SlideMemo, SlideShape, SlideRecording } from './types';

export function PresentationCanvas({ 
  presentationId, slides, onSlidesChange, onActiveSlideChange, onMarkerSelect, selectedMarkerId: externalSelectedMarkerId, initialSections = []
}: PresentationCanvasProps) {
  const [activeSlideIndex, setActiveSlideIndexInternal] = useState(0);
  const [sections, setSections] = useState<SlideSection[]>([]);
  const [markerToolActive, setMarkerToolActive] = useState(false);
  const [internalSelectedMarkerId, setInternalSelectedMarkerId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'marker' | 'image' | 'link' | 'note' | 'memo' | 'line' | 'shape'>('select');
  const [lineToolActive, setLineToolActive] = useState(false);
  const [shapeToolActive, setShapeToolActive] = useState(false);
  const [imageToolActive, setImageToolActive] = useState(false);
  const [imageClickPosition, setImageClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [linkToolActive, setLinkToolActive] = useState(false);
  const [noteToolActive, setNoteToolActive] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkDialogPosition, setLinkDialogPosition] = useState<{ x: number; y: number } | null>(null);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteDialogPosition, setNoteDialogPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedSlideId, setSelectedSlideId] = useState<string>("");
  const [editingReferenceId, setEditingReferenceId] = useState<string | null>(null);
  const [memoDialogOpen, setMemoDialogOpen] = useState(false);
  const [memoDialogPosition, setMemoDialogPosition] = useState<{ x: number; y: number } | null>(null);
  const [memoTitle, setMemoTitle] = useState("");
  const [memoContent, setMemoContent] = useState("");
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [memoToolActive, setMemoToolActive] = useState(false);
  const [selectedMemoStyle, setSelectedMemoStyle] = useState<'yellow' | 'pink' | 'blue' | 'green' | 'purple'>('yellow');
  const [lineColor, setLineColor] = useState('#3b82f6');
  const [shapeColor, setShapeColor] = useState('#3b82f6');
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeOverId, setActiveOverId] = useState<string | null>(null);
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [lineStart, setLineStart] = useState<{ x: number; y: number } | null>(null);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [currentLineEnd, setCurrentLineEnd] = useState<{ x: number; y: number } | null>(null);
  const [currentShapeEnd, setCurrentShapeEnd] = useState<{ x: number; y: number } | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState("");

  useEffect(() => {
    if (sections.length === 0 && initialSections.length > 0) setSections(initialSections);
  }, [presentationId, initialSections, sections.length]);

  const selectedMarkerId = externalSelectedMarkerId ?? internalSelectedMarkerId;
  const setSelectedMarkerId = (id: string | null) => { setInternalSelectedMarkerId(id); onMarkerSelect?.(id); };
  const setActiveSlideIndex = (index: number) => { setActiveSlideIndexInternal(index); onActiveSlideChange?.(index); };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeSlide = slides[activeSlideIndex];

  const handleEditLink = useCallback((linkId: string) => {
    if (!activeSlide) return;
    const link = activeSlide.links?.find(l => l.id === linkId);
    if (!link) return;
    setLinkTitle(link.label);
    setLinkUrl(link.url);
    setLinkDialogPosition({ x: link.x, y: link.y });
    setLinkDialogOpen(true);
    setEditingLinkId(linkId);
  }, [activeSlide]);

  const handleEditReference = useCallback((referenceId: string) => {
    if (!activeSlide) return;
    const reference = activeSlide.references?.find(r => r.id === referenceId);
    if (!reference) return;
    setSelectedSlideId(reference.targetSlideId);
    setNoteDialogPosition({ x: reference.x, y: reference.y });
    setNoteDialogOpen(true);
    setEditingReferenceId(referenceId);
  }, [activeSlide]);

  const handleEditMemo = useCallback((memoId: string) => {
    if (!activeSlide) return;
    const memo = activeSlide.memos?.find(m => m.id === memoId);
    if (!memo) return;
    setMemoTitle(memo.title);
    setMemoContent(memo.content);
    setSelectedMemoStyle(memo.style);
    setMemoDialogPosition({ x: memo.x, y: memo.y });
    setMemoDialogOpen(true);
    setEditingMemoId(memoId);
  }, [activeSlide]);

  // order 기반 정렬
  const orderedItems = useMemo(() => {
    type OrderedItem = { type: 'slide'; data: Slide; order: number } | { type: 'section'; data: SlideSection; order: number };
    const items: OrderedItem[] = [];
    slides.filter(s => !s.sectionId).forEach((slide, idx) => items.push({ type: 'slide', data: slide, order: slide.order ?? idx }));
    sections.forEach(section => items.push({ type: 'section', data: section, order: section.order }));
    items.sort((a, b) => a.order - b.order);
    return items;
  }, [slides, sections]);

  useEffect(() => { setActiveSlideIndex(0); }, [presentationId]);
  useEffect(() => { if (activeSlideIndex >= slides.length && slides.length > 0) setActiveSlideIndex(slides.length - 1); }, [slides.length, activeSlideIndex]);

  const handleAddSlide = useCallback(() => {
    const maxOrder = Math.max(...slides.filter(s => !s.sectionId).map(s => s.order ?? 0), ...sections.map(s => s.order), -1);
    const newSlide: Slide = {
      id: uuidv4(),
      images: [
        { id: uuidv4(), url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', x: 100, y: 100, width: 400, height: 300 },
        { id: uuidv4(), url: 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=400&h=300&fit=crop', x: 600, y: 100, width: 400, height: 300 }
      ],
      markers: [], links: [], references: [], memos: [], shapes: [], recordings: [], backgroundColor: '#ffffff', order: maxOrder + 1,
    };
    onSlidesChange([...slides, newSlide]);
    setActiveSlideIndex(slides.length);
  }, [slides, sections, onSlidesChange]);

  const handleDeleteSlide = useCallback((index: number) => {
    const newSlides = slides.filter((_, i) => i !== index);
    onSlidesChange(newSlides);
    if (newSlides.length === 0) setActiveSlideIndex(0);
    else if (activeSlideIndex >= newSlides.length) setActiveSlideIndex(Math.max(0, newSlides.length - 1));
  }, [slides, activeSlideIndex, onSlidesChange]);

  const handleDuplicateSlide = useCallback((index: number) => {
    const slideToCopy = slides[index];
    const newSlide: Slide = {
      ...slideToCopy,
      id: uuidv4(),
      images: slideToCopy.images.map(img => ({ ...img, id: uuidv4() })),
      markers: slideToCopy.markers.map(m => ({ ...m, id: uuidv4() })),
      links: slideToCopy.links.map(l => ({ ...l, id: uuidv4() })),
      references: (slideToCopy.references || []).map(r => ({ ...r, id: uuidv4() })),
      memos: (slideToCopy.memos || []).map(m => ({ ...m, id: uuidv4() })),
      shapes: (slideToCopy.shapes || []).map(s => ({ ...s, id: uuidv4() })),
      recordings: slideToCopy.recordings.map(r => ({ ...r, id: uuidv4() })),
    };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, newSlide);
    onSlidesChange(newSlides);
    setActiveSlideIndex(index + 1);
  }, [slides, onSlidesChange]);

  const handleAddMarker = useCallback((x: number, y: number) => {
    if (!activeSlide) return;
    const existingMarkers = activeSlide.markers || [];
    const newMarker: SlideMarker = {
      id: uuidv4(), number: existingMarkers.length > 0 ? Math.max(...existingMarkers.map(m => m.number)) + 1 : 1,
      x, y, label: '', status: 'pending', authorId: 'current-user', authorName: 'Current User', comments: [],
      history: [{ id: uuidv4(), userId: 'current-user', userName: 'Current User', action: '마커 생성', createdAt: new Date().toISOString() }],
      createdAt: new Date().toISOString()
    };
    const updatedSlide = { ...activeSlide, markers: [...existingMarkers, newMarker] };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
    setSelectedMarkerId(newMarker.id);
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange]);

  const handleAddLink = useCallback((startX: number, startY: number, endX: number, endY: number) => {
    if (!activeSlide) return;
    // 라인 도구는 shapes에 저장 (type: 'line')
    // 시작점을 x, y로 저장하고, width/height는 끝점까지의 상대 거리 (음수 가능)
    const newLine: SlideShape = {
      id: uuidv4(),
      type: 'line',
      x: startX,
      y: startY,
      width: endX - startX,
      height: endY - startY,
      color: lineColor,
      strokeWidth: 3,
      fillColor: 'none',
      fillOpacity: 0,
    };
    const updatedSlide = { ...activeSlide, shapes: [...(activeSlide.shapes || []), newLine] };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange, lineColor]);

  const handleAddLinkWithDialog = useCallback((x: number, y: number) => {
    setLinkDialogPosition({ x, y });
    setLinkDialogOpen(true);
  }, []);

  const handleConfirmLink = useCallback(() => {
    if (!activeSlide || !linkDialogPosition || !linkTitle.trim() || !linkUrl.trim()) return;
    const newLink: SlideLink = {
      id: uuidv4(),
      url: linkUrl.trim(),
      label: linkTitle.trim(),
      x: linkDialogPosition.x,
      y: linkDialogPosition.y,
      width: 150,
      height: 32,
    };
    const updatedSlide = { ...activeSlide, links: [...(activeSlide.links || []), newLink] };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
    setLinkDialogOpen(false);
    setLinkTitle("");
    setLinkUrl("");
    setLinkDialogPosition(null);
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange, linkDialogPosition, linkTitle, linkUrl]);

  const handleAddNoteWithDialog = useCallback((x: number, y: number) => {
    setNoteDialogPosition({ x, y });
    setNoteDialogOpen(true);
  }, []);

  const handleConfirmNote = useCallback(() => {
    if (!activeSlide || !noteDialogPosition || !selectedSlideId) return;
    const targetSlide = slides.find(s => s.id === selectedSlideId);
    if (!targetSlide) return;
    
    if (editingReferenceId) {
      // 수정 모드
      const updatedReferences = (activeSlide.references || []).map(r =>
        r.id === editingReferenceId
          ? { ...r, targetSlideId: selectedSlideId, label: targetSlide.title || `슬라이드 ${slides.findIndex(s => s.id === selectedSlideId) + 1}`, x: noteDialogPosition.x, y: noteDialogPosition.y }
          : r
      );
      const updatedSlide = { ...activeSlide, references: updatedReferences };
      onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
      setEditingReferenceId(null);
    } else {
      // 추가 모드
      const newReference: SlideReference = {
        id: uuidv4(),
        x: noteDialogPosition.x,
        y: noteDialogPosition.y,
        targetSlideId: selectedSlideId,
        label: targetSlide.title || `슬라이드 ${slides.findIndex(s => s.id === selectedSlideId) + 1}`,
        width: 150,
        height: 32,
      };
      const updatedSlide = { ...activeSlide, references: [...(activeSlide.references || []), newReference] };
      onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
    }
    
    // 선택한 슬라이드로 이동
    const targetIndex = slides.findIndex(s => s.id === selectedSlideId);
    if (targetIndex !== -1) {
      setActiveSlideIndex(targetIndex);
    }
    
    setNoteDialogOpen(false);
    setSelectedSlideId("");
    setNoteDialogPosition(null);
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange, noteDialogPosition, selectedSlideId, editingReferenceId]);

  const handleDeleteReference = useCallback((referenceId: string) => {
    if (!activeSlide) return;
    const updatedReferences = (activeSlide.references || []).filter(r => r.id !== referenceId);
    const updatedSlide = { ...activeSlide, references: updatedReferences };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange]);

  const handleUpdateLinkPosition = useCallback((linkId: string, x: number, y: number) => {
    if (!activeSlide) return;
    const updatedLinks = (activeSlide.links || []).map(l => l.id === linkId ? { ...l, x, y } : l);
    const updatedSlide = { ...activeSlide, links: updatedLinks };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange]);

  const handleUpdateLinkSize = useCallback((linkId: string, width: number, height: number) => {
    if (!activeSlide) return;
    const updatedLinks = (activeSlide.links || []).map(l => l.id === linkId ? { ...l, width, height } : l);
    const updatedSlide = { ...activeSlide, links: updatedLinks };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange]);

  const handleUpdateReferencePosition = useCallback((referenceId: string, x: number, y: number) => {
    if (!activeSlide) return;
    const updatedReferences = (activeSlide.references || []).map(r => r.id === referenceId ? { ...r, x, y } : r);
    const updatedSlide = { ...activeSlide, references: updatedReferences };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange]);

  const handleUpdateReferenceSize = useCallback((referenceId: string, width: number, height: number) => {
    if (!activeSlide) return;
    const updatedReferences = (activeSlide.references || []).map(r => r.id === referenceId ? { ...r, width, height } : r);
    const updatedSlide = { ...activeSlide, references: updatedReferences };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange]);

  const handleNavigateToSlide = useCallback((slideId: string) => {
    const targetIndex = slides.findIndex(s => s.id === slideId);
    if (targetIndex !== -1) {
      setActiveSlideIndex(targetIndex);
    }
  }, [slides]);


  const handleAddMemoWithDialog = useCallback((x: number, y: number) => {
    setMemoDialogPosition({ x, y });
    setMemoDialogOpen(true);
  }, []);

  const handleConfirmMemo = useCallback(() => {
    if (!activeSlide || !memoDialogPosition || !memoTitle.trim()) return;
    const newMemo: SlideMemo = {
      id: uuidv4(),
      x: memoDialogPosition.x,
      y: memoDialogPosition.y,
      title: memoTitle.trim(),
      content: memoContent.trim(),
      style: selectedMemoStyle,
      width: 200,
      height: 150,
    };
    const updatedSlide = { ...activeSlide, memos: [...(activeSlide.memos || []), newMemo] };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
    setMemoDialogOpen(false);
    setMemoTitle("");
    setMemoContent("");
    setMemoDialogPosition(null);
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange, memoDialogPosition, memoTitle, memoContent, selectedMemoStyle]);

  const handleDeleteMemo = useCallback((memoId: string) => {
    if (!activeSlide) return;
    const updatedMemos = (activeSlide.memos || []).filter(m => m.id !== memoId);
    const updatedSlide = { ...activeSlide, memos: updatedMemos };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange]);

  const handleUpdateMemoPosition = useCallback((memoId: string, x: number, y: number) => {
    if (!activeSlide) return;
    const updatedMemos = (activeSlide.memos || []).map(m => m.id === memoId ? { ...m, x, y } : m);
    const updatedSlide = { ...activeSlide, memos: updatedMemos };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange]);

  const handleUpdateMemoSize = useCallback((memoId: string, width: number, height: number) => {
    if (!activeSlide) return;
    const updatedMemos = (activeSlide.memos || []).map(m => m.id === memoId ? { ...m, width, height } : m);
    const updatedSlide = { ...activeSlide, memos: updatedMemos };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange]);

  const handleAddShape = useCallback((startX: number, startY: number, endX: number, endY: number) => {
    if (!activeSlide) return;
    const newShape: SlideShape = {
      id: uuidv4(), type: 'rectangle', x: Math.min(startX, endX), y: Math.min(startY, endY),
      width: Math.abs(endX - startX), height: Math.abs(endY - startY), color: shapeColor, strokeWidth: 3, fillColor: shapeColor, fillOpacity: 0.1,
    };
    const updatedSlide = { ...activeSlide, shapes: [...(activeSlide.shapes || []), newShape] };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange, shapeColor]);

  const handleUpdateMarkerPosition = useCallback((markerId: string, x: number, y: number) => {
    if (!activeSlide) return;
    const updatedSlide = { ...activeSlide, markers: (activeSlide.markers || []).map(m => m.id === markerId ? { ...m, x, y } : m) };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange]);

  const handleDeleteMarker = useCallback((markerId: string) => {
    if (!activeSlide) return;
    const updatedSlide = { ...activeSlide, markers: (activeSlide.markers || []).filter(m => m.id !== markerId) };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
    if (selectedMarkerId === markerId) setSelectedMarkerId(null);
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange, selectedMarkerId]);

  const handleUpdateImagePosition = useCallback((imageId: string, x: number, y: number) => {
    if (!activeSlide) return;
    const updatedSlide = { ...activeSlide, images: activeSlide.images.map(img => img.id === imageId ? { ...img, x, y } : img) };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange]);

  const handleUpdateImageSize = useCallback((imageId: string, width: number, height: number) => {
    if (!activeSlide) return;
    const updatedSlide = { ...activeSlide, images: activeSlide.images.map(img => img.id === imageId ? { ...img, width, height } : img) };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange]);

  const handleDeleteImage = useCallback((imageId: string) => {
    if (!activeSlide) return;
    const updatedSlide = { ...activeSlide, images: activeSlide.images.filter(img => img.id !== imageId) };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange]);

  const handleAddImage = useCallback((url: string, position?: { x: number; y: number }) => {
    if (!activeSlide) return;
    const pos = position || { x: 100, y: 100 };
    const newImage: SlideImage = { id: uuidv4(), url, x: pos.x, y: pos.y, width: 400, height: 300 };
    const updatedSlide = { ...activeSlide, images: [...activeSlide.images, newImage] };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      const pos = imageClickPosition;
      reader.onload = () => { 
        if (reader.result) handleAddImage(reader.result as string, pos || undefined);
        setImageClickPosition(null);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => { if (reader.result) handleAddImage(reader.result as string); };
      reader.readAsDataURL(file);
    }
  }, [handleAddImage]);

  const handleDragStart = (event: DragStartEvent) => setActiveDragId(event.active.id as string);
  const handleDragOver = (event: DragOverEvent) => setActiveOverId(event.over?.id as string | null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    setActiveOverId(null);
    if (!over || active.id === over.id) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    const isActiveSlide = !activeId.startsWith('section-');
    const isActiveSection = activeId.startsWith('section-');
    const isOverDropzone = overId.startsWith('dz-');
    const isOverSectionDropzone = overId.startsWith('sdz_');
    
    // 외부 드롭존에 드롭
    if (isOverDropzone) {
      const dropIndex = parseInt(overId.replace('dz-', ''));
      let newOrder: number;
      if (dropIndex === 0) {
        newOrder = orderedItems[0] ? orderedItems[0].order - 1 : 0;
      } else if (dropIndex >= orderedItems.length) {
        newOrder = orderedItems[orderedItems.length - 1] ? orderedItems[orderedItems.length - 1].order + 1 : 0;
      } else {
        newOrder = (orderedItems[dropIndex - 1].order + orderedItems[dropIndex].order) / 2;
      }
      
      if (isActiveSlide) {
        // 슬라이드를 외부로 이동 (섹션에서 제거)
        const updatedSlides = slides.map(s => s.id === activeId ? { ...s, sectionId: undefined, order: newOrder } : s);
        onSlidesChange(updatedSlides);
        const newIndex = updatedSlides.findIndex(s => s.id === activeId);
        if (newIndex !== -1) setActiveSlideIndex(newIndex);
      } else if (isActiveSection) {
        const sectionId = activeId.replace('section-', '');
        setSections(sections.map(s => s.id === sectionId ? { ...s, order: newOrder } : s));
      }
      return;
    }
    
    // 섹션 내부 드롭존에 드롭
    if (isOverSectionDropzone && isActiveSlide) {
      // sdz_{sectionId}_{index} 형태 파싱 (sectionId에 _가 없으므로 안전)
      const withoutPrefix = overId.substring(4); // 'sdz_' 제거
      const lastUnderscoreIndex = withoutPrefix.lastIndexOf('_');
      const targetSectionId = withoutPrefix.substring(0, lastUnderscoreIndex);
      const dropPosition = parseInt(withoutPrefix.substring(lastUnderscoreIndex + 1));
      
      // 해당 섹션의 슬라이드들
      const sectionSlides = slides.filter(s => s.sectionId === targetSectionId);
      
      // 새로운 inSectionOrder 계산
      let newInSectionOrder: number;
      if (sectionSlides.length === 0) {
        newInSectionOrder = 0;
      } else if (dropPosition === 0) {
        // 첫 번째 위치
        const firstSlide = sectionSlides[0];
        newInSectionOrder = (firstSlide.order ?? 0) - 1;
      } else if (dropPosition >= sectionSlides.length) {
        // 마지막 위치
        const lastSlide = sectionSlides[sectionSlides.length - 1];
        newInSectionOrder = (lastSlide.order ?? 0) + 1;
      } else {
        // 중간 위치
        const prevSlide = sectionSlides[dropPosition - 1];
        const nextSlide = sectionSlides[dropPosition];
        newInSectionOrder = ((prevSlide.order ?? 0) + (nextSlide.order ?? 0)) / 2;
      }
      
      const updatedSlides = slides.map(s => 
        s.id === activeId 
          ? { ...s, sectionId: targetSectionId, order: newInSectionOrder } 
          : s
      );
      onSlidesChange(updatedSlides);
      const newIndex = updatedSlides.findIndex(s => s.id === activeId);
      if (newIndex !== -1) setActiveSlideIndex(newIndex);
      return;
    }
  };

  const handleSetBackgroundColor = useCallback((color: string) => {
    if (!activeSlide) return;
    const updatedSlide = { ...activeSlide, backgroundColor: color };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [activeSlide, activeSlideIndex, slides, onSlidesChange]);

  const handleAddSection = useCallback(() => {
    const maxOrder = Math.max(...slides.filter(s => !s.sectionId).map(s => s.order ?? 0), ...sections.map(s => s.order), -1);
    setSections([...sections, { id: uuidv4(), name: "이름없음", isOpen: true, order: maxOrder + 1 }]);
  }, [sections, slides]);

  const handleSectionNameChange = useCallback((sectionId: string) => {
    if (editingSectionName.trim()) setSections(sections.map(s => s.id === sectionId ? { ...s, name: editingSectionName.trim() } : s));
    setEditingSectionId(null);
    setEditingSectionName("");
  }, [editingSectionName, sections]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    const sectionSlides = slides.filter(s => s.sectionId === sectionId);
    if (window.confirm(sectionSlides.length > 0 ? `"${section.name}" 섹션과 ${sectionSlides.length}개 슬라이드를 삭제하시겠습니까?` : `"${section.name}" 섹션을 삭제하시겠습니까?`)) {
      setSections(sections.filter(s => s.id !== sectionId));
      const newSlides = slides.filter(s => s.sectionId !== sectionId);
      onSlidesChange(newSlides);
      if (activeSlideIndex >= newSlides.length && newSlides.length > 0) setActiveSlideIndex(newSlides.length - 1);
      else if (newSlides.length === 0) setActiveSlideIndex(0);
    }
  }, [sections, slides, onSlidesChange, activeSlideIndex]);

  const handleToggleSection = useCallback((sectionId: string) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, isOpen: !s.isOpen } : s));
  }, [sections]);

  return (
    <div className="flex h-full w-full bg-neutral-100 dark:bg-neutral-900">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

      <SlideListPanel
        slides={slides}
        sections={sections}
        activeSlideIndex={activeSlideIndex}
        activeDragId={activeDragId}
        activeOverId={activeOverId}
        editingSectionId={editingSectionId}
        editingSectionName={editingSectionName}
        orderedItems={orderedItems}
        onSelectSlide={setActiveSlideIndex}
        onDeleteSlide={handleDeleteSlide}
        onDuplicateSlide={handleDuplicateSlide}
        onAddSlide={handleAddSlide}
        onAddSection={handleAddSection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onToggleSection={handleToggleSection}
        onSectionDoubleClick={(sectionId, sectionName) => {
          setEditingSectionId(sectionId);
          setEditingSectionName(sectionName);
        }}
        onSectionNameChange={setEditingSectionName}
        onSectionNameSubmit={handleSectionNameChange}
        onSectionEditCancel={() => {
          setEditingSectionId(null);
          setEditingSectionName("");
        }}
        onDeleteSection={handleDeleteSection}
      />
      
      <div className="flex-1 flex flex-col">
        <PresentationToolbar
          activeTool={activeTool}
          markerToolActive={markerToolActive}
          imageToolActive={imageToolActive}
          linkToolActive={linkToolActive}
          noteToolActive={noteToolActive}
          memoToolActive={memoToolActive}
          lineToolActive={lineToolActive}
          shapeToolActive={shapeToolActive}
          lineColor={lineColor}
          shapeColor={shapeColor}
          activeSlide={activeSlide}
          activeSlideIndex={activeSlideIndex}
          slidesLength={slides.length}
          onToolChange={(tool) => {
            // 모든 툴 비활성화
            setMarkerToolActive(false);
            setImageToolActive(false);
            setLinkToolActive(false);
            setNoteToolActive(false);
            setMemoToolActive(false);
            setLineToolActive(false);
            setShapeToolActive(false);
            
            // 선택한 툴만 활성화
            setActiveTool(tool);
            if (tool === 'memo') {
              setMemoToolActive(true);
            } else if (tool === 'marker') {
              setMarkerToolActive(true);
            } else if (tool === 'image') {
              setImageToolActive(true);
            } else if (tool === 'link') {
              setLinkToolActive(true);
            } else if (tool === 'note') {
              setNoteToolActive(true);
            } else if (tool === 'line') {
              setLineToolActive(true);
            } else if (tool === 'shape') {
              setShapeToolActive(true);
            }
          }}
          onLineColorChange={setLineColor}
          onShapeColorChange={setShapeColor}
          onBackgroundColorChange={handleSetBackgroundColor}
        />

        <div className="flex-1 relative">
          <ReactFlowProvider>
            <PresentationFlow activeSlide={activeSlide} slides={slides} activeSlideIndex={activeSlideIndex} markerToolActive={markerToolActive} imageToolActive={imageToolActive} linkToolActive={linkToolActive} noteToolActive={noteToolActive} memoToolActive={memoToolActive} lineToolActive={lineToolActive} shapeToolActive={shapeToolActive} isDrawingLine={isDrawingLine} isDrawingShape={isDrawingShape} lineStart={lineStart} shapeStart={shapeStart} currentLineEnd={currentLineEnd} currentShapeEnd={currentShapeEnd} lineColor={lineColor} shapeColor={shapeColor} selectedMarkerId={selectedMarkerId} onAddMarker={handleAddMarker} onAddLink={handleAddLink} onAddShape={handleAddShape} onUpdateMarkerPosition={handleUpdateMarkerPosition} onDeleteMarker={handleDeleteMarker} onSelectMarker={setSelectedMarkerId} onUpdateImagePosition={handleUpdateImagePosition} onUpdateImageSize={handleUpdateImageSize} onDeleteImage={handleDeleteImage} onSlidesChange={onSlidesChange} onDrop={handleDrop} setIsDrawingLine={setIsDrawingLine} setIsDrawingShape={setIsDrawingShape} setLineStart={setLineStart} setShapeStart={setShapeStart} setCurrentLineEnd={setCurrentLineEnd} setCurrentShapeEnd={setCurrentShapeEnd} onImageClick={(x, y) => { setImageClickPosition({ x, y }); fileInputRef.current?.click(); }} onAddLinkWithDialog={handleAddLinkWithDialog} onAddNoteWithDialog={handleAddNoteWithDialog} onAddMemoWithDialog={handleAddMemoWithDialog} onDeleteReference={handleDeleteReference} onUpdateLinkPosition={handleUpdateLinkPosition} onUpdateLinkSize={handleUpdateLinkSize} onEditLink={handleEditLink} onUpdateReferencePosition={handleUpdateReferencePosition} onUpdateReferenceSize={handleUpdateReferenceSize} onEditReference={handleEditReference} onDeleteMemo={handleDeleteMemo} onUpdateMemoPosition={handleUpdateMemoPosition} onUpdateMemoSize={handleUpdateMemoSize} onEditMemo={handleEditMemo} onNavigateToSlide={handleNavigateToSlide} />
          </ReactFlowProvider>
        </div>
      </div>

      {/* 다이얼로그들 */}
      <LinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        linkTitle={linkTitle}
        linkUrl={linkUrl}
        editingLinkId={editingLinkId}
        onLinkTitleChange={setLinkTitle}
        onLinkUrlChange={setLinkUrl}
        onConfirm={handleConfirmLink}
        onCancel={() => {
          setLinkDialogOpen(false);
          setLinkTitle("");
          setLinkUrl("");
          setLinkDialogPosition(null);
          setEditingLinkId(null);
        }}
      />

      <ReferenceDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        selectedSlideId={selectedSlideId}
        editingReferenceId={editingReferenceId}
        slides={slides}
        onSelectedSlideIdChange={setSelectedSlideId}
        onConfirm={handleConfirmNote}
        onCancel={() => {
          setNoteDialogOpen(false);
          setSelectedSlideId("");
          setNoteDialogPosition(null);
          setEditingReferenceId(null);
        }}
      />

      <MemoDialog
        open={memoDialogOpen}
        onOpenChange={setMemoDialogOpen}
        memoTitle={memoTitle}
        memoContent={memoContent}
        selectedMemoStyle={selectedMemoStyle}
        editingMemoId={editingMemoId}
        onMemoTitleChange={setMemoTitle}
        onMemoContentChange={setMemoContent}
        onMemoStyleChange={setSelectedMemoStyle}
        onConfirm={handleConfirmMemo}
        onCancel={() => {
          setMemoDialogOpen(false);
          setMemoTitle("");
          setMemoContent("");
          setMemoDialogPosition(null);
          setEditingMemoId(null);
        }}
      />
    </div>
  );
}
