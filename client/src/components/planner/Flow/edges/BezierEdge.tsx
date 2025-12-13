import React, { useState } from 'react';
import {
  EdgeProps,
  getBezierPath,
  BaseEdge,
  EdgeLabelRenderer,
  useReactFlow,
} from 'reactflow';
import { edgeHandleStyle } from '../types';
import { EdgeLabelBox } from './EdgeLabelBox';

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
  const { setEdges, getZoom } = useReactFlow();
  const curvature = data?.curvature ?? 0.25;
  const [isHovered, setIsHovered] = useState(false);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature,
  });

  const onControlMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

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
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <>
      <g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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

      {(selected || isHovered) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 1000,
            }}
            className="nopan nodrag"
          >
            <div
              style={{ ...edgeHandleStyle, borderRadius: '50%', cursor: 'ns-resize' }}
              onMouseDown={onControlMouseDown}
              title="곡률 조정"
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
