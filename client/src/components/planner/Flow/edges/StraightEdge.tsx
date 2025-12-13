import React from 'react';
import { EdgeProps, getStraightPath, BaseEdge } from 'reactflow';
import { EdgeLabelBox } from './EdgeLabelBox';

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
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{ ...style, strokeWidth: (data?.strokeWidth || 2) + (selected ? 1 : 0) }}
      />
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
