import React, { useCallback, useEffect, useMemo } from "react";
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
}

export function PresentationFlow(props: PresentationFlowProps) {
  const { activeSlide, slides, activeSlideIndex, markerToolActive, imageToolActive, linkToolActive, noteToolActive, memoToolActive, lineToolActive, shapeToolActive, isDrawingLine, isDrawingShape, lineStart, shapeStart, currentLineEnd, currentShapeEnd, lineColor, shapeColor, selectedMarkerId, onAddMarker, onAddLink, onAddShape, onUpdateMarkerPosition, onDeleteMarker, onSelectMarker, onUpdateImagePosition, onUpdateImageSize, onDeleteImage, onSlidesChange, onDrop, setIsDrawingLine, setIsDrawingShape, setLineStart, setShapeStart, setCurrentLineEnd, setCurrentShapeEnd, onImageClick, onAddLinkWithDialog, onAddNoteWithDialog, onAddMemoWithDialog, onDeleteReference, onUpdateLinkPosition, onUpdateLinkSize, onEditLink, onUpdateReferencePosition, onUpdateReferenceSize, onEditReference, onDeleteMemo, onUpdateMemoPosition, onUpdateMemoSize, onEditMemo, onNavigateToSlide } = props;
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
        zoom,
        onAddMarker,
        onUpdateMarkerPosition,
        onDeleteMarker,
        onSelectMarker,
        onUpdateImagePosition,
        onUpdateImageSize,
        onDeleteImage,
        onDeleteLink: handleDeleteLink,
        onUpdateLinkPosition,
        onUpdateLinkSize,
        onEditLink,
        onDeleteReference,
        onUpdateReferencePosition,
        onUpdateReferenceSize,
        onEditReference,
        onNavigateToSlide,
        onDeleteMemo,
        onUpdateMemoPosition,
        onUpdateMemoSize,
        onEditMemo,
        onDeleteShape: handleDeleteShape,
        onUpdateShapeColor: handleUpdateShapeColor,
        // 미리보기는 제거 - 외부 오버레이로 이동
        isDrawingLine: false,
        isDrawingShape: false,
        lineStart: null,
        shapeStart: null,
        currentLineEnd: null,
        currentShapeEnd: null,
        lineColor,
        shapeColor,
      } as SlideNodeData,
      draggable: false,
      selectable: false,
    }];
  }, [
    activeSlide,
    markerToolActive,
    imageToolActive,
    linkToolActive,
    noteToolActive,
    memoToolActive,
    selectedMarkerId,
    zoom,
    lineColor,
    shapeColor,
    onEditLink,
    onEditReference,
    onEditMemo,
    handleDeleteLink,
    handleDeleteShape,
    handleUpdateShapeColor,
    onAddMarker,
    onUpdateMarkerPosition,
    onDeleteMarker,
    onSelectMarker,
    onUpdateImagePosition,
    onUpdateImageSize,
    onDeleteImage,
    onUpdateLinkPosition,
    onUpdateLinkSize,
    onDeleteReference,
    onUpdateReferencePosition,
    onUpdateReferenceSize,
    onNavigateToSlide,
    onDeleteMemo,
    onUpdateMemoPosition,
    onUpdateMemoSize,
  ]);

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

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (animationFrameId) return; // 이미 예약된 업데이트가 있으면 스킵
      
      animationFrameId = requestAnimationFrame(() => {
        const coords = getCanvasCoordinates(e.clientX, e.clientY);
        if (coords) {
          const { x, y } = coords;
          
          if (isDrawingLine && lineStart) {
            // 라인 그리기 중에는 가장 가까운 연결 포인트에 스냅
            const snapResult = findNearestConnectionPoint({ x, y }, activeSlide);
            const snapPoint = snapResult ? snapResult.point : { x, y };
            setCurrentLineEnd(snapPoint);
          } else if (isDrawingShape && shapeStart) {
            setCurrentShapeEnd({ x, y });
          }
        }
        animationFrameId = null;
      });
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      
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

  return (
    <div 
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
      
      {/* 드래그 중인 라인/네모 미리보기 오버레이 */}
      {(isDrawingLine || isDrawingShape) && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            pointerEvents: 'none',
            zIndex: 1000,
            transform: `translate(${zoom * CANVAS_WIDTH * 0.05}px, ${zoom * CANVAS_HEIGHT * 0.05}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              overflow: 'visible',
            }}
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
          </svg>
        </div>
      )}
    </div>
  );
}

