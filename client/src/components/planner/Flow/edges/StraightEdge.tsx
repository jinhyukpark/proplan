import React, { useState, useRef } from 'react';
import {
  EdgeProps,
  getStraightPath,
  BaseEdge,
  EdgeLabelRenderer,
  useReactFlow,
} from 'reactflow';
import { edgeHandleStyle } from '../types';
import { EdgeLabelBox } from './EdgeLabelBox';

/**
 * PPT 스타일 직선
 * - 양 끝점 (연결 포인트) 만 표시
 * - 끝점을 드래그하여 다른 노드에 연결 가능
 */
export const StraightEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  selected,
  data,
}: EdgeProps) => {
  const { setNodes, getZoom } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
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

      // 여기서 다른 노드와의 연결을 감지할 수 있음
      // (추후 스냅 기능 추가 가능)
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

  return (
    <>
      <g
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* 투명한 넓은 히트 영역 */}
        <path
          d={edgePath}
          fill="none"
          strokeWidth={20}
          stroke="transparent"
          style={{ cursor: 'pointer' }}
        />
        {/* 실제 보이는 선 */}
        <BaseEdge
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            ...style,
            strokeWidth: (data?.strokeWidth || 2) + (selected ? 1 : 0),
          }}
        />
      </g>

      {/* 양 끝점 컨트롤 - 가상 노드(드래그 생성)인 경우에만 표시 */}
      {showControls && data?.sourceNodeId && (
        <EdgeLabelRenderer>
          {/* Source 끝점 */}
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

          {/* Target 끝점 */}
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
