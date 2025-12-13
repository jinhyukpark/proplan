import React, { useState, useRef } from 'react';
import {
  EdgeProps,
  getSmoothStepPath,
  BaseEdge,
  EdgeLabelRenderer,
  useReactFlow,
  Position,
} from 'reactflow';
import { edgeHandleStyle, findNearestNode } from '../types';
import { EdgeLabelBox } from './EdgeLabelBox';

/**
 * PPT 스타일 직각선
 * - 양 끝점 (연결 포인트)
 * - 가운데 높낮이 조절 포인트
 */
export const StepEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  source,
  target,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data,
}: EdgeProps) => {
  const { setNodes, setEdges, getNodes, getZoom } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const predefinedCenterX = data?.centerX as number | undefined;
  const predefinedCenterY = data?.centerY as number | undefined;

  // 가상 노드의 경우 position이 undefined일 수 있으므로 기본값 설정
  const effectiveSourcePosition = sourcePosition || Position.Right;
  const effectiveTargetPosition = targetPosition || Position.Left;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition: effectiveSourcePosition,
    targetX,
    targetY,
    targetPosition: effectiveTargetPosition,
    borderRadius: 8,
    centerX: predefinedCenterX,
    centerY: predefinedCenterY,
  });

  // 끝점 드래그 핸들러
  const onEndpointMouseDown = (
    event: React.MouseEvent,
    endpoint: 'source' | 'target'
  ) => {
    event.stopPropagation();
    event.preventDefault();
    setIsDragging(true);

    const zoom = getZoom();
    const startX = event.clientX;
    const startY = event.clientY;
    const initialX = endpoint === 'source' ? sourceX : targetX;
    const initialY = endpoint === 'source' ? sourceY : targetY;

    // data에서 노드 ID 참조
    const virtualNodeId = endpoint === 'source'
      ? (data?.sourceNodeId as string)
      : (data?.targetNodeId as string);

    // 반대쪽 노드 ID (스냅 제외용)
    const otherNodeId = endpoint === 'source' ? target : source;

    let currentX = initialX;
    let currentY = initialY;

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - startX) / zoom;
      const deltaY = (e.clientY - startY) / zoom;
      currentX = initialX + deltaX;
      currentY = initialY + deltaY;

      // 가상 노드 위치 업데이트
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === virtualNodeId) {
            return {
              ...node,
              position: { x: currentX, y: currentY },
            };
          }
          return node;
        })
      );
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      // 근처 노드 Handle에 스냅
      const nodes = getNodes();
      const nearestResult = findNearestNode(currentX, currentY, nodes, [virtualNodeId, otherNodeId]);

      if (nearestResult) {
        // 스냅: Edge를 실제 노드에 연결하고 가상 노드 삭제
        const targetNodeId = nearestResult.node.id;
        const handlePosition = nearestResult.handle.position;

        setEdges((edges) =>
          edges.map((edge) => {
            if (edge.id === id) {
              if (endpoint === 'source') {
                return {
                  ...edge,
                  source: targetNodeId,
                  sourceHandle: handlePosition,
                  data: {
                    ...edge.data,
                    sourceNodeId: undefined,
                  },
                };
              } else {
                return {
                  ...edge,
                  target: targetNodeId,
                  targetHandle: handlePosition,
                  data: {
                    ...edge.data,
                    targetNodeId: undefined,
                  },
                };
              }
            }
            return edge;
          })
        );

        // 가상 노드 삭제
        setNodes((nodes) => nodes.filter((node) => node.id !== virtualNodeId));
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // 높낮이 조절 핸들러
  const onCenterMouseDown = (event: React.MouseEvent, type: 'horizontal' | 'vertical') => {
    event.stopPropagation();
    event.preventDefault();
    setIsDragging(true);

    const startX = event.clientX;
    const startY = event.clientY;
    const zoom = getZoom();

    const initialCenterX = predefinedCenterX ?? labelX;
    const initialCenterY = predefinedCenterY ?? labelY;

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - startX) / zoom;
      const deltaY = (e.clientY - startY) / zoom;

      setEdges((edges) =>
        edges.map((edge) => {
          if (edge.id === id) {
            const newData = { ...edge.data };

            if (type === 'vertical') {
              newData.centerX = initialCenterX + deltaX;
            } else {
              newData.centerY = initialCenterY + deltaY;
            }
            return { ...edge, data: newData };
          }
          return edge;
        })
      );
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // 호버 핸들러 (깜박임 방지)
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isDragging) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 100);
  };

  // 꺾인 선의 방향 판단
  // - 가로 방향으로 연결 (deltaX >= deltaY): 중간에 세로 꺾임 → 가로로 이동 (centerX)
  // - 세로 방향으로 연결 (deltaY > deltaX): 중간에 가로 꺾임 → 세로로 이동 (centerY)
  const deltaX = Math.abs(targetX - sourceX);
  const deltaY = Math.abs(targetY - sourceY);
  const isMainlyHorizontal = deltaX >= deltaY;

  // 꺾인 선이 세로 → 가로로 이동 (ew-resize, centerX)
  // 꺾인 선이 가로 → 세로로 이동 (ns-resize, centerY)
  const dragType = isMainlyHorizontal ? 'vertical' : 'horizontal';
  const cursorStyle = isMainlyHorizontal ? 'ew-resize' : 'ns-resize';

  const showControls = selected || isHovered || isDragging;

  // 끝점 핸들 스타일
  const endpointStyle = {
    ...edgeHandleStyle,
    borderRadius: '50%',
    cursor: 'move',
    width: 12,
    height: 12,
  };

  // 높낮이 조절 핸들 스타일
  const centerHandleStyle = {
    ...edgeHandleStyle,
    borderRadius: '4px',
    cursor: cursorStyle,
    background: '#10b981', // 녹색으로 구분
  };

  return (
    <>
      <g>
        {/* 투명한 넓은 히트 영역 */}
        <path
          d={edgePath}
          fill="none"
          strokeWidth={20}
          stroke="rgba(0,0,0,0.001)"
          style={{ cursor: 'pointer' }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
        {/* 실제 보이는 선 */}
        <BaseEdge
          path={edgePath}
          markerEnd={markerEnd}
          style={{ ...style, strokeWidth: (data?.strokeWidth || 2) + (selected ? 1 : 0) }}
        />
      </g>

      {showControls && (
        <EdgeLabelRenderer>
          {/* Source 끝점 - 가상 노드(드래그 생성)인 경우에만 표시 */}
          {data?.sourceNodeId && (
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${sourceX}px,${sourceY}px)`,
                pointerEvents: 'all',
                zIndex: 1000,
              }}
              className="nopan nodrag"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div
                style={endpointStyle}
                onMouseDown={(e) => onEndpointMouseDown(e, 'source')}
                title="시작점 이동"
              />
            </div>
          )}

          {/* Target 끝점 - 가상 노드(드래그 생성)인 경우에만 표시 */}
          {data?.sourceNodeId && (
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${targetX}px,${targetY}px)`,
                pointerEvents: 'all',
                zIndex: 1000,
              }}
              className="nopan nodrag"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div
                style={endpointStyle}
                onMouseDown={(e) => onEndpointMouseDown(e, 'target')}
                title="끝점 이동"
              />
            </div>
          )}

          {/* 높낮이 조절 포인트 (가운데) - 항상 표시 */}
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 1000,
            }}
            className="nopan nodrag"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              style={centerHandleStyle}
              onMouseDown={(e) => onCenterMouseDown(e, dragType)}
              title={dragType === 'horizontal' ? '상하 이동' : '좌우 이동'}
            />
          </div>
        </EdgeLabelRenderer>
      )}

      <EdgeLabelBox
        label={data?.label}
        description={data?.description}
        labelX={labelX}
        labelY={labelY}
        selected={selected}
        id={id}
      />
    </>
  );
};
