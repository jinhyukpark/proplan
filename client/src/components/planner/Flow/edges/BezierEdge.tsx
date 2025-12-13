import React, { useState, useRef } from 'react';
import {
  EdgeProps,
  getBezierPath,
  BaseEdge,
  EdgeLabelRenderer,
  useReactFlow,
} from 'reactflow';
import { edgeHandleStyle } from '../types';
import { EdgeLabelBox } from './EdgeLabelBox';

/**
 * PPT 스타일 곡선
 * - 양 끝점 (연결 포인트)
 * - 가운데 곡률 조절 포인트
 */
export const BezierEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data,
}: EdgeProps) => {
  const { setNodes, setEdges, getZoom } = useReactFlow();
  const curvature = (data?.curvature as number) ?? 0.25;
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature,
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
    const nodeId = endpoint === 'source'
      ? (data?.sourceNodeId as string)
      : (data?.targetNodeId as string);

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - startX) / zoom;
      const deltaY = (e.clientY - startY) / zoom;
      const newX = initialX + deltaX;
      const newY = initialY + deltaY;

      // 가상 노드 위치 업데이트
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              position: { x: newX, y: newY },
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
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // 곡률 조절 핸들러
  const onCurvatureMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setIsDragging(true);

    const startY = event.clientY;
    const startCurvature = curvature;
    const zoom = getZoom();

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = (moveEvent.clientY - startY) / zoom;
      const newCurvature = Math.min(Math.max(startCurvature + delta * 0.01, -1.5), 1.5);

      setEdges((edges) =>
        edges.map((e) => {
          if (e.id === id) {
            return {
              ...e,
              data: { ...e.data, curvature: newCurvature },
            };
          }
          return e;
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

  const showControls = selected || isHovered || isDragging;

  // 끝점 핸들 스타일
  const endpointStyle = {
    ...edgeHandleStyle,
    borderRadius: '50%',
    cursor: 'move',
    width: 12,
    height: 12,
  };

  // 곡률 조절 핸들 스타일
  const curvatureHandleStyle = {
    ...edgeHandleStyle,
    borderRadius: '50%',
    cursor: 'ns-resize',
    background: '#f59e0b', // 노란색으로 구분
  };

  return (
    <>
      <g
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <path
          d={edgePath}
          fill="none"
          strokeWidth={20}
          stroke="transparent"
          style={{ cursor: 'pointer' }}
        />
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

          {/* 곡률 조절 포인트 (가운데) - 항상 표시 */}
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
              style={curvatureHandleStyle}
              onMouseDown={onCurvatureMouseDown}
              title="곡률 조정 (상하 드래그)"
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
