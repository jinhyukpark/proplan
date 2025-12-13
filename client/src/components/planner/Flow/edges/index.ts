import { BezierEdge } from './BezierEdge';
import { StepEdge } from './StepEdge';
import { StraightEdge } from './StraightEdge';

export { EdgeLabelBox } from './EdgeLabelBox';
export { BezierEdge } from './BezierEdge';
export { StepEdge } from './StepEdge';
export { StraightEdge } from './StraightEdge';

export const edgeTypes = {
  bezier: BezierEdge,
  straight: StraightEdge,
  step: StepEdge,
};
