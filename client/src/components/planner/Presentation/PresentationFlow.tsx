import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  useViewport,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Slide, CANVAS_WIDTH, CANVAS_HEIGHT } from './types';
import { SlideNode, SlideNodeData } from './SlideNode';

const nodeTypes = { slideNode: SlideNode };

interface PresentationFlowProps {
  activeSlide: Slide | undefined;
  slides: Slide[];
  activeSlideIndex: number;
  markerToolActive: boolean;
  imageToolActive: boolean;
  linkToolActive: boolean;
  noteToolActive: boolean;
  memoToolActive: boolean;
  lineToolActive: boolean;
  shapeToolActive: boolean;
  isDrawingLine: boolean;
  isDrawingShape: boolean;
  lineStart: { x: number; y: number } | null;
  shapeStart: { x: number; y: number } | null;
  currentLineEnd: { x: number; y: number } | null;
  currentShapeEnd: { x: number; y: number } | null;
  lineColor: string;
  shapeColor: string;
  selectedMarkerId: string | null;
  onAddMarker: (x: number, y: number) => void;
  onAddLink: (startX: number, startY: number, endX: number, endY: number) => void;
  onAddShape: (startX: number, startY: number, endX: number, endY: number) => void;
  onUpdateMarkerPosition: (markerId: string, x: number, y: number) => void;
  onDeleteMarker: (markerId: string) => void;
  onSelectMarker: (markerId: string | null) => void;
  onUpdateImagePosition: (imageId: string, x: number, y: number) => void;
  onUpdateImageSize: (imageId: string, width: number, height: number) => void;
  onDeleteImage: (imageId: string) => void;
  onSlidesChange: (slides: Slide[]) => void;
  onDrop: (e: React.DragEvent) => void;
  setIsDrawingLine: (value: boolean) => void;
  setIsDrawingShape: (value: boolean) => void;
  setLineStart: (value: { x: number; y: number } | null) => void;
  setShapeStart: (value: { x: number; y: number } | null) => void;
  setCurrentLineEnd: (value: { x: number; y: number } | null) => void;
  setCurrentShapeEnd: (value: { x: number; y: number } | null) => void;
  onImageClick: (x: number, y: number) => void;
  onAddLinkWithDialog: (x: number, y: number) => void;
  onAddNoteWithDialog: (x: number, y: number) => void;
  onAddMemoWithDialog: (x: number, y: number) => void;
  onDeleteReference: (referenceId: string) => void;
  onUpdateLinkPosition: (linkId: string, x: number, y: number) => void;
  onUpdateLinkSize: (linkId: string, width: number, height: number) => void;
  onEditLink: (linkId: string) => void;
  onUpdateReferencePosition: (referenceId: string, x: number, y: number) => void;
  onUpdateReferenceSize: (referenceId: string, width: number, height: number) => void;
  onEditReference: (referenceId: string) => void;
  onDeleteMemo: (memoId: string) => void;
  onUpdateMemoPosition: (memoId: string, x: number, y: number) => void;
  onUpdateMemoSize: (memoId: string, width: number, height: number) => void;
  onEditMemo: (memoId: string) => void;
  onNavigateToSlide: (slideId: string) => void;
  onComponentSelect?: (componentId: string, componentType: string) => void;
  selectedComponentId?: string | null;
}

export function PresentationFlow(props: PresentationFlowProps) {
  const { activeSlide, slides, activeSlideIndex, markerToolActive, imageToolActive, linkToolActive, noteToolActive, memoToolActive, lineToolActive, shapeToolActive, isDrawingLine, isDrawingShape, lineStart, shapeStart, currentLineEnd, currentShapeEnd, lineColor, shapeColor, selectedMarkerId, onAddMarker, onAddLink, onAddShape, onUpdateMarkerPosition, onDeleteMarker, onSelectMarker, onUpdateImagePosition, onUpdateImageSize, onDeleteImage, onSlidesChange, onDrop, setIsDrawingLine, setIsDrawingShape, setLineStart, setShapeStart, setCurrentLineEnd, setCurrentShapeEnd, onImageClick, onAddLinkWithDialog, onAddNoteWithDialog, onAddMemoWithDialog, onDeleteReference, onUpdateLinkPosition, onUpdateLinkSize, onEditLink, onUpdateReferencePosition, onUpdateReferenceSize, onEditReference, onDeleteMemo, onUpdateMemoPosition, onUpdateMemoSize, onEditMemo, onNavigateToSlide, onComponentSelect, selectedComponentId } = props;
  const { fitView } = useReactFlow();
  const { zoom } = useViewport();

  const handleDeleteLink = useCallback((linkId: string) => {
    const slide = slides[activeSlideIndex];
    if (!slide) return;
    const updatedSlide = { ...slide, links: (slide.links || []).filter(l => l.id !== linkId) };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [slides, activeSlideIndex, onSlidesChange]);


  const handleUpdateLinkPosition = useCallback((linkId: string, x: number, y: number) => {
    const slide = slides[activeSlideIndex];
    if (!slide) return;
    const updatedLinks = (slide.links || []).map(l => l.id === linkId ? { ...l, x, y } : l);
    const updatedSlide = { ...slide, links: updatedLinks };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [slides, activeSlideIndex, onSlidesChange]);

  const handleUpdateLinkSize = useCallback((linkId: string, width: number, height: number) => {
    const slide = slides[activeSlideIndex];
    if (!slide) return;
    const updatedLinks = (slide.links || []).map(l => l.id === linkId ? { ...l, width, height } : l);
    const updatedSlide = { ...slide, links: updatedLinks };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [slides, activeSlideIndex, onSlidesChange]);

  const handleDeleteReference = useCallback((referenceId: string) => {
    const slide = slides[activeSlideIndex];
    if (!slide) return;
    const updatedReferences = (slide.references || []).filter(r => r.id !== referenceId);
    const updatedSlide = { ...slide, references: updatedReferences };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [slides, activeSlideIndex, onSlidesChange]);

  const handleUpdateReferencePosition = useCallback((referenceId: string, x: number, y: number) => {
    const slide = slides[activeSlideIndex];
    if (!slide) return;
    const updatedReferences = (slide.references || []).map(r => r.id === referenceId ? { ...r, x, y } : r);
    const updatedSlide = { ...slide, references: updatedReferences };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [slides, activeSlideIndex, onSlidesChange]);

  const handleUpdateReferenceSize = useCallback((referenceId: string, width: number, height: number) => {
    const slide = slides[activeSlideIndex];
    if (!slide) return;
    const updatedReferences = (slide.references || []).map(r => r.id === referenceId ? { ...r, width, height } : r);
    const updatedSlide = { ...slide, references: updatedReferences };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [slides, activeSlideIndex, onSlidesChange]);

  const handleDeleteShape = useCallback((shapeId: string) => {
    const slide = slides[activeSlideIndex];
    if (!slide) return;
    const updatedSlide = { ...slide, shapes: (slide.shapes || []).filter(s => s.id !== shapeId) };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [slides, activeSlideIndex, onSlidesChange]);

  const handleUpdateShapeColor = useCallback((shapeId: string, color: string, fillColor: string, fillOpacity: number) => {
    const slide = slides[activeSlideIndex];
    if (!slide) return;
    const updatedSlide = { ...slide, shapes: (slide.shapes || []).map(s => s.id === shapeId ? { ...s, color, fillColor, fillOpacity } : s) };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [slides, activeSlideIndex, onSlidesChange]);

  const handleUpdateShapePosition = useCallback((shapeId: string, x: number, y: number) => {
    const slide = slides[activeSlideIndex];
    if (!slide) return;
    const updatedSlide = { ...slide, shapes: (slide.shapes || []).map(s => s.id === shapeId ? { ...s, x, y } : s) };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [slides, activeSlideIndex, onSlidesChange]);

  const handleUpdateShapeSize = useCallback((shapeId: string, width: number, height: number) => {
    const slide = slides[activeSlideIndex];
    if (!slide) return;
    const updatedSlide = { ...slide, shapes: (slide.shapes || []).map(s => s.id === shapeId ? { ...s, width, height } : s) };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [slides, activeSlideIndex, onSlidesChange]);

  const handleUpdateLineEndpoints = useCallback((shapeId: string, startX: number, startY: number, endX: number, endY: number) => {
    const slide = slides[activeSlideIndex];
    if (!slide) return;
    // 라인의 경우 x, y는 시작점, width/height는 (끝점 - 시작점)
    const updatedSlide = {
      ...slide,
      shapes: (slide.shapes || []).map(s =>
        s.id === shapeId ? { ...s, x: startX, y: startY, width: endX - startX, height: endY - startY } : s
      )
    };
    onSlidesChange(slides.map((s, i) => i === activeSlideIndex ? updatedSlide : s));
  }, [slides, activeSlideIndex, onSlidesChange]);

  // 콜백 함수들을 ref로 안정화 - 리렌더링 시에도 동일한 참조 유지
  const callbacksRef = useRef({
    handleDeleteLink,
    handleUpdateLinkPosition,
    handleUpdateLinkSize,
    handleDeleteReference,
    handleUpdateReferencePosition,
    handleUpdateReferenceSize,
    handleDeleteShape,
    handleUpdateShapeColor,
    handleUpdateShapePosition,
    handleUpdateShapeSize,
    handleUpdateLineEndpoints,
    onAddMarker,
    onUpdateMarkerPosition,
    onDeleteMarker,
    onSelectMarker,
    onUpdateImagePosition,
    onUpdateImageSize,
    onDeleteImage,
    onNavigateToSlide,
    onDeleteMemo,
    onUpdateMemoPosition,
    onUpdateMemoSize,
    onEditLink,
    onEditReference,
    onEditMemo,
    onDeleteReference,
    onUpdateLinkPosition,
    onUpdateLinkSize,
    onUpdateReferencePosition,
    onUpdateReferenceSize,
  });

  // 콜백 ref 업데이트 (리렌더링 시 최신 함수로 갱신하되 참조는 유지)
  useEffect(() => {
    callbacksRef.current = {
      handleDeleteLink,
      handleUpdateLinkPosition,
      handleUpdateLinkSize,
      handleDeleteReference,
      handleUpdateReferencePosition,
      handleUpdateReferenceSize,
      handleDeleteShape,
      handleUpdateShapeColor,
      handleUpdateShapePosition,
      handleUpdateShapeSize,
      handleUpdateLineEndpoints,
      onAddMarker,
      onUpdateMarkerPosition,
      onDeleteMarker,
      onSelectMarker,
      onUpdateImagePosition,
      onUpdateImageSize,
      onDeleteImage,
      onNavigateToSlide,
      onDeleteMemo,
      onUpdateMemoPosition,
      onUpdateMemoSize,
      onEditLink,
      onEditReference,
      onEditMemo,
      onDeleteReference,
      onUpdateLinkPosition,
      onUpdateLinkSize,
      onUpdateReferencePosition,
      onUpdateReferenceSize,
    };
  });

  // 안정적인 콜백 래퍼 생성
  const stableCallbacks = useMemo(() => ({
    onAddMarker: (x: number, y: number) => callbacksRef.current.onAddMarker(x, y),
    onUpdateMarkerPosition: (id: string, x: number, y: number) => callbacksRef.current.onUpdateMarkerPosition(id, x, y),
    onDeleteMarker: (id: string) => callbacksRef.current.onDeleteMarker(id),
    onSelectMarker: (id: string | null) => callbacksRef.current.onSelectMarker(id),
    onUpdateImagePosition: (id: string, x: number, y: number) => callbacksRef.current.onUpdateImagePosition(id, x, y),
    onUpdateImageSize: (id: string, w: number, h: number) => callbacksRef.current.onUpdateImageSize(id, w, h),
    onDeleteImage: (id: string) => callbacksRef.current.onDeleteImage(id),
    onDeleteLink: (id: string) => callbacksRef.current.handleDeleteLink(id),
    onUpdateLinkPosition: (id: string, x: number, y: number) => callbacksRef.current.onUpdateLinkPosition(id, x, y),
    onUpdateLinkSize: (id: string, w: number, h: number) => callbacksRef.current.onUpdateLinkSize(id, w, h),
    onEditLink: (id: string) => callbacksRef.current.onEditLink(id),
    onDeleteReference: (id: string) => callbacksRef.current.onDeleteReference(id),
    onUpdateReferencePosition: (id: string, x: number, y: number) => callbacksRef.current.onUpdateReferencePosition(id, x, y),
    onUpdateReferenceSize: (id: string, w: number, h: number) => callbacksRef.current.onUpdateReferenceSize(id, w, h),
    onEditReference: (id: string) => callbacksRef.current.onEditReference(id),
    onNavigateToSlide: (id: string) => callbacksRef.current.onNavigateToSlide(id),
    onDeleteMemo: (id: string) => callbacksRef.current.onDeleteMemo(id),
    onUpdateMemoPosition: (id: string, x: number, y: number) => callbacksRef.current.onUpdateMemoPosition(id, x, y),
    onUpdateMemoSize: (id: string, w: number, h: number) => callbacksRef.current.onUpdateMemoSize(id, w, h),
    onEditMemo: (id: string) => callbacksRef.current.onEditMemo(id),
    onDeleteShape: (id: string) => callbacksRef.current.handleDeleteShape(id),
    onUpdateShapeColor: (id: string, c: string, fc: string, fo: number) => callbacksRef.current.handleUpdateShapeColor(id, c, fc, fo),
    onUpdateShapePosition: (id: string, x: number, y: number) => callbacksRef.current.handleUpdateShapePosition(id, x, y),
    onUpdateShapeSize: (id: string, w: number, h: number) => callbacksRef.current.handleUpdateShapeSize(id, w, h),
    onUpdateLineEndpoints: (id: string, sx: number, sy: number, ex: number, ey: number) => callbacksRef.current.handleUpdateLineEndpoints(id, sx, sy, ex, ey),
    onComponentSelect: onComponentSelect ? (id: string, type: string) => onComponentSelect(id, type) : undefined,
  }), [onComponentSelect]); // onComponentSelect 의존성 추가

  const nodes = useMemo(() => {
    if (!activeSlide) return [];
    return [{
      id: 'slide',
      type: 'slideNode',
      position: { x: 0, y: 0 },
      data: {
        slide: activeSlide,
        markerToolActive,
        imageToolActive,
        linkToolActive,
        noteToolActive,
        memoToolActive,
        selectedMarkerId,
        ...stableCallbacks,
      } as SlideNodeData,
      draggable: false,
      selectable: false,
    }];
  }, [activeSlide, markerToolActive, imageToolActive, linkToolActive, noteToolActive, memoToolActive, selectedMarkerId, stableCallbacks]);

  useEffect(() => {
    setTimeout(() => fitView({ padding: 0.05, duration: 200 }), 100);
  }, [activeSlide?.id, fitView]);
  
  useEffect(() => {
    const handleResize = () => fitView({ padding: 0.05, duration: 200 });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitView]);

  const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
    const slideElement = document.querySelector('[style*="1920"]') as HTMLElement;
    if (!slideElement) return null;
    const rect = slideElement.getBoundingClientRect();
    const x = (clientX - rect.left) / (rect.width / CANVAS_WIDTH);
    const y = (clientY - rect.top) / (rect.height / CANVAS_HEIGHT);
    return { x, y };
  }, []);

  // 컴포넌트의 연결 포인트 계산 (4개 모서리 + 중앙)
  const getComponentConnectionPoints = useCallback((component: { x: number; y: number; width: number; height: number }) => {
    const { x, y, width, height } = component;
    return [
      { x: x + width / 2, y: y }, // 상단 중앙
      { x: x + width, y: y + height / 2 }, // 우측 중앙
      { x: x + width / 2, y: y + height }, // 하단 중앙
      { x: x, y: y + height / 2 }, // 좌측 중앙
      { x: x, y: y }, // 좌상단
      { x: x + width, y: y }, // 우상단
      { x: x + width, y: y + height }, // 우하단
      { x: x, y: y + height }, // 좌하단
    ];
  }, []);

  // 가장 가까운 연결 포인트 찾기
  const findNearestConnectionPoint = useCallback((point: { x: number; y: number }, activeSlide: Slide | undefined) => {
    if (!activeSlide) return null;
    const SNAP_DISTANCE = 30; // 스냅 거리
    let nearestPoint: { x: number; y: number } | null = null;
    let nearestDistance = Infinity;
    let nearestComponent: { id: string; type: 'image' | 'link' | 'reference' | 'memo' | 'marker' } | null = null;

    // 모든 컴포넌트의 연결 포인트 확인
    [...(activeSlide.images || []).map(img => ({ ...img, type: 'image' as const })),
     ...(activeSlide.links || []).map(link => ({ ...link, type: 'link' as const, width: link.width || 150, height: link.height || 32 })),
     ...(activeSlide.references || []).map(ref => ({ ...ref, type: 'reference' as const, width: ref.width || 150, height: ref.height || 32 })),
     ...(activeSlide.memos || []).map(memo => ({ ...memo, type: 'memo' as const, width: memo.width || 200, height: memo.height || 150 })),
     ...(activeSlide.markers || []).map(marker => ({ ...marker, type: 'marker' as const, width: 20, height: 20 }))].forEach(component => {
      const points = getComponentConnectionPoints(component);
      points.forEach(connPoint => {
        const dx = point.x - connPoint.x;
        const dy = point.y - connPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < nearestDistance && distance < SNAP_DISTANCE) {
          nearestDistance = distance;
          nearestPoint = connPoint;
          nearestComponent = { id: component.id, type: component.type };
        }
      });
    });

    return nearestPoint ? { point: nearestPoint, component: nearestComponent } : null;
  }, [getComponentConnectionPoints]);

  const handleNodeClick = (event: React.MouseEvent, node: any) => {
    if (node.id !== 'slide') return;
    const coords = getCanvasCoordinates(event.clientX, event.clientY);
    if (!coords) return;
    const { x, y } = coords;
    
    if (markerToolActive) {
      onAddMarker(x, y);
    } else if (imageToolActive) {
      onImageClick(x, y);
    } else if (linkToolActive) {
      onAddLinkWithDialog(x, y);
    } else if (noteToolActive) {
      onAddNoteWithDialog(x, y);
    } else if (memoToolActive) {
      onAddMemoWithDialog(x, y);
    }
    // 라인과 네모는 드래그로 그리므로 클릭 이벤트에서는 처리하지 않음
  };

  const handleNodeMouseDown = (event: React.MouseEvent) => {
    if (!lineToolActive && !shapeToolActive) return;
    // 다른 컴포넌트를 클릭한 경우 무시
    const target = event.target as HTMLElement;
    if (target.closest('.image-container, .link-container, .reference-container, .memo-container, .marker-container')) return;
    
    const coords = getCanvasCoordinates(event.clientX, event.clientY);
    if (!coords) return;
    const { x, y } = coords;
    
    if (lineToolActive && !isDrawingLine) {
      event.preventDefault();
      setLineStart({ x, y });
      setCurrentLineEnd({ x, y });
      setIsDrawingLine(true);
    } else if (shapeToolActive && !isDrawingShape) {
      event.preventDefault();
      setShapeStart({ x, y });
      setCurrentShapeEnd({ x, y });
      setIsDrawingShape(true);
    }
  };

  const handleNodeMouseMove = (event: React.MouseEvent, node: any) => {
    if (node.id !== 'slide') return;
    const coords = getCanvasCoordinates(event.clientX, event.clientY);
    if (!coords) return;
    const { x, y } = coords;
    
    if (isDrawingLine && lineStart) {
      setCurrentLineEnd({ x, y });
    } else if (isDrawingShape && shapeStart) {
      setCurrentShapeEnd({ x, y });
    }
  };

  const handleNodeMouseUp = (event: React.MouseEvent) => {
    if (!isDrawingLine && !isDrawingShape) return;
    const coords = getCanvasCoordinates(event.clientX, event.clientY);
    if (!coords) return;
    const { x, y } = coords;
    
    if (isDrawingLine && lineStart) {
      // 최소 길이 체크 (너무 작은 라인은 무시)
      const dx = x - lineStart.x;
      const dy = y - lineStart.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 5) {
        onAddLink(lineStart.x, lineStart.y, x, y);
      }
      setIsDrawingLine(false);
      setLineStart(null);
      setCurrentLineEnd(null);
    } else if (isDrawingShape && shapeStart) {
      // 최소 크기 체크 (너무 작은 네모는 무시)
      const width = Math.abs(x - shapeStart.x);
      const height = Math.abs(y - shapeStart.y);
      if (width > 5 && height > 5) {
        onAddShape(shapeStart.x, shapeStart.y, x, y);
      }
      setIsDrawingShape(false);
      setShapeStart(null);
      setCurrentShapeEnd(null);
    }
  };

  // 전역 마우스 이벤트로 드래그 중 추적 (노드 밖으로 나가도 계속 추적)
  useEffect(() => {
    if (!isDrawingLine && !isDrawingShape) return;

    let animationFrameId: number | null = null;
    let lastUpdateTime = 0;
    const throttleMs = 16; // ~60fps

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastUpdateTime < throttleMs) {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(() => {
          const coords = getCanvasCoordinates(e.clientX, e.clientY);
          if (!coords) return;
          const { x, y } = coords;
          
          if (isDrawingLine && lineStart) {
            // 라인 그리기 중에는 가장 가까운 연결 포인트에 스냅
            const snapResult = findNearestConnectionPoint({ x, y }, activeSlide);
            const snapPoint = snapResult ? snapResult.point : { x, y };
            setCurrentLineEnd(snapPoint);
          } else if (isDrawingShape && shapeStart) {
            setCurrentShapeEnd({ x, y });
          }
          lastUpdateTime = performance.now();
        });
        return;
      }
      
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      if (!coords) return;
      const { x, y } = coords;
      
      if (isDrawingLine && lineStart) {
        // 라인 그리기 중에는 가장 가까운 연결 포인트에 스냅
        const snapResult = findNearestConnectionPoint({ x, y }, activeSlide);
        const snapPoint = snapResult ? snapResult.point : { x, y };
        setCurrentLineEnd(snapPoint);
      } else if (isDrawingShape && shapeStart) {
        setCurrentShapeEnd({ x, y });
      }
      lastUpdateTime = now;
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      if (!coords) return;
      const { x, y } = coords;
      
      if (isDrawingLine && lineStart) {
        const dx = x - lineStart.x;
        const dy = y - lineStart.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 5) {
          onAddLink(lineStart.x, lineStart.y, x, y);
        }
        setIsDrawingLine(false);
        setLineStart(null);
        setCurrentLineEnd(null);
      } else if (isDrawingShape && shapeStart) {
        const width = Math.abs(x - shapeStart.x);
        const height = Math.abs(y - shapeStart.y);
        if (width > 5 && height > 5) {
          onAddShape(shapeStart.x, shapeStart.y, x, y);
        }
        setIsDrawingShape(false);
        setShapeStart(null);
        setCurrentShapeEnd(null);
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDrawingLine, isDrawingShape, lineStart, shapeStart, getCanvasCoordinates, onAddLink, onAddShape, setIsDrawingLine, setIsDrawingShape, setLineStart, setShapeStart, setCurrentLineEnd, setCurrentShapeEnd, findNearestConnectionPoint, activeSlide]);

  // 드로잉 오버레이용 ref - DOM 직접 조작으로 깜박임 방지
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const lineStartCircleRef = useRef<SVGCircleElement>(null);
  const lineEndCircleRef = useRef<SVGCircleElement>(null);
  const rectShapeRef = useRef<SVGRectElement>(null);

  // 드로잉 오버레이 위치/크기 업데이트 (DOM 직접 조작)
  const updateOverlayPosition = useCallback(() => {
    const slideElement = document.querySelector('[style*="1920"]') as HTMLElement;
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!slideElement || !svg || !container) return;

    const slideRect = slideElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // 부모 컨테이너 기준 상대 위치 계산
    const left = slideRect.left - containerRect.left;
    const top = slideRect.top - containerRect.top;

    svg.style.left = `${left}px`;
    svg.style.top = `${top}px`;
    svg.style.width = `${slideRect.width}px`;
    svg.style.height = `${slideRect.height}px`;
    svg.style.display = 'block';
  }, []);

  // 드로잉 미리보기 업데이트 (DOM 직접 조작 - 리렌더링 없음)
  useEffect(() => {
    if (!isDrawingLine && !isDrawingShape) {
      if (svgRef.current) {
        svgRef.current.style.display = 'none';
      }
      return;
    }

    updateOverlayPosition();

    const slideElement = document.querySelector('[style*="1920"]') as HTMLElement;
    if (!slideElement) return;

    const slideRect = slideElement.getBoundingClientRect();
    const scaleX = slideRect.width / CANVAS_WIDTH;
    const scaleY = slideRect.height / CANVAS_HEIGHT;

    // 라인 미리보기 업데이트
    if (isDrawingLine && lineStart && currentLineEnd && lineRef.current && lineStartCircleRef.current && lineEndCircleRef.current) {
      lineRef.current.setAttribute('x1', String(lineStart.x * scaleX));
      lineRef.current.setAttribute('y1', String(lineStart.y * scaleY));
      lineRef.current.setAttribute('x2', String(currentLineEnd.x * scaleX));
      lineRef.current.setAttribute('y2', String(currentLineEnd.y * scaleY));
      lineRef.current.setAttribute('stroke', lineColor);
      lineRef.current.style.display = 'block';

      lineStartCircleRef.current.setAttribute('cx', String(lineStart.x * scaleX));
      lineStartCircleRef.current.setAttribute('cy', String(lineStart.y * scaleY));
      lineStartCircleRef.current.setAttribute('fill', lineColor);
      lineStartCircleRef.current.style.display = 'block';

      lineEndCircleRef.current.setAttribute('cx', String(currentLineEnd.x * scaleX));
      lineEndCircleRef.current.setAttribute('cy', String(currentLineEnd.y * scaleY));
      lineEndCircleRef.current.setAttribute('fill', lineColor);
      lineEndCircleRef.current.style.display = 'block';
    } else {
      if (lineRef.current) lineRef.current.style.display = 'none';
      if (lineStartCircleRef.current) lineStartCircleRef.current.style.display = 'none';
      if (lineEndCircleRef.current) lineEndCircleRef.current.style.display = 'none';
    }

    // 네모 미리보기 업데이트
    if (isDrawingShape && shapeStart && currentShapeEnd && rectShapeRef.current) {
      const x = Math.min(shapeStart.x, currentShapeEnd.x) * scaleX;
      const y = Math.min(shapeStart.y, currentShapeEnd.y) * scaleY;
      const width = Math.abs(currentShapeEnd.x - shapeStart.x) * scaleX;
      const height = Math.abs(currentShapeEnd.y - shapeStart.y) * scaleY;

      rectShapeRef.current.setAttribute('x', String(x));
      rectShapeRef.current.setAttribute('y', String(y));
      rectShapeRef.current.setAttribute('width', String(width));
      rectShapeRef.current.setAttribute('height', String(height));
      rectShapeRef.current.setAttribute('stroke', shapeColor);
      rectShapeRef.current.style.display = 'block';
    } else {
      if (rectShapeRef.current) rectShapeRef.current.style.display = 'none';
    }
  }, [isDrawingLine, isDrawingShape, lineStart, currentLineEnd, shapeStart, currentShapeEnd, lineColor, shapeColor, updateOverlayPosition]);

  return (
    <div
      ref={containerRef}
      className={cn((markerToolActive || imageToolActive) && "marker-mode-active")}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onMouseDown={handleNodeMouseDown}
      onMouseUp={handleNodeMouseUp}
    >
      <ReactFlow
        nodes={nodes}
        edges={[]}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.05, duration: 200 }}
        minZoom={0.05}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
        onDrop={onDrop}
        onNodeClick={handleNodeClick}
        onNodeMouseMove={handleNodeMouseMove}
        panOnDrag={!markerToolActive && !imageToolActive && !linkToolActive && !noteToolActive && !memoToolActive && !lineToolActive && !shapeToolActive}
        panOnScroll={!markerToolActive && !imageToolActive && !linkToolActive && !noteToolActive && !memoToolActive && !lineToolActive && !shapeToolActive}
        zoomOnScroll={!markerToolActive && !imageToolActive && !linkToolActive && !noteToolActive && !memoToolActive && !lineToolActive && !shapeToolActive}
        zoomOnPinch={!markerToolActive && !imageToolActive && !linkToolActive && !noteToolActive && !memoToolActive && !lineToolActive && !shapeToolActive}
        zoomOnDoubleClick={false}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        style={{ cursor: markerToolActive || imageToolActive || linkToolActive || noteToolActive || memoToolActive || lineToolActive || shapeToolActive ? 'crosshair' : 'grab' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={50} size={1} color="#e5e5e5" />
        <Controls showInteractive={false} />
        <MiniMap nodeStrokeWidth={3} zoomable pannable style={{ width: 120, height: 80 }} />
      </ReactFlow>

      {/* 드로잉 오버레이 - DOM 직접 조작으로 깜박임 완전 방지 */}
      <svg
        ref={svgRef}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          zIndex: 9999,
          display: 'none',
        }}
      >
        {/* 라인 미리보기 요소들 */}
        <line
          ref={lineRef}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="5,5"
          opacity={0.7}
          style={{ display: 'none' }}
        />
        <circle ref={lineStartCircleRef} r={4} opacity={0.7} style={{ display: 'none' }} />
        <circle ref={lineEndCircleRef} r={4} opacity={0.7} style={{ display: 'none' }} />

        {/* 네모 미리보기 요소 */}
        <rect
          ref={rectShapeRef}
          strokeWidth={2}
          fill="none"
          strokeDasharray="5,5"
          opacity={0.7}
          style={{ display: 'none' }}
        />
      </svg>
    </div>
  );
}

