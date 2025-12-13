import React, { useState } from 'react';
import {
  EdgeProps,
  getSmoothStepPath,
  BaseEdge,
  EdgeLabelRenderer,
  useReactFlow,
  Position,
} from 'reactflow';
import { edgeHandleStyle } from '../types';
import { EdgeLabelBox } from './EdgeLabelBox';

export const StepEdge = ({
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
  const [isHovered, setIsHovered] = useState(false);

  const predefinedCenterX = data?.centerX;
  const predefinedCenterY = data?.centerY;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
    centerX: predefinedCenterX,
    centerY: predefinedCenterY,
  });

  const onControlMouseDown = (event: React.MouseEvent, type: 'horizontal' | 'vertical') => {
    event.stopPropagation();
    event.preventDefault();

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
              if (!newData.centerY) newData.centerY = undefined;
            } else {
              newData.centerY = initialCenterY + deltaY;
              if (!newData.centerX) newData.centerX = undefined;
            }
            return { ...edge, data: newData };
          }
          return edge;
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

  const isSourceVertical = sourcePosition === Position.Top || sourcePosition === Position.Bottom;

  const controlX = labelX;
  const controlY = labelY;

  const dragType = isSourceVertical ? 'horizontal' : 'vertical';
  const cursorStyle = isSourceVertical ? 'ns-resize' : 'ew-resize';

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
              transform: `translate(-50%, -50%) translate(${controlX}px,${controlY}px)`,
              pointerEvents: 'all',
              zIndex: 1000,
            }}
            className="nopan nodrag"
          >
            <div
              style={{
                ...edgeHandleStyle,
                cursor: cursorStyle,
              }}
              onMouseDown={(e) => onControlMouseDown(e, dragType)}
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
