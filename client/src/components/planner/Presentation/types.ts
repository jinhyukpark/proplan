export interface SlideImage {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SlideMarkerComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
}

export interface SlideMarkerHistory {
  id: string;
  userId: string;
  userName: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface SlideMarker {
  id: string;
  number: number;
  x: number;
  y: number;
  label?: string;
  status?: 'pending' | 'in_progress' | 'done' | 'hold';
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  comments?: SlideMarkerComment[];
  history?: SlideMarkerHistory[];
  createdAt?: string;
}

export interface SlideLink {
  id: string;
  url: string;
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface SlideReference {
  id: string;
  x: number;
  y: number;
  targetSlideId: string;
  label: string;
  width?: number;
  height?: number;
}

export type MemoStyle = 'yellow' | 'pink' | 'blue' | 'green' | 'purple';

export interface SlideMemo {
  id: string;
  x: number;
  y: number;
  title: string;
  content: string;
  style: MemoStyle;
  width?: number;
  height?: number;
}

export interface SlideRecording {
  id: string;
  audioUrl: string;
  duration: number;
  x: number;
  y: number;
}

export interface SlideShape {
  id: string;
  type: 'rectangle' | 'circle' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
  fillColor: string;
  fillOpacity: number;
  fromComponentId?: string; // 연결된 시작 컴포넌트 ID
  fromComponentType?: 'image' | 'link' | 'reference' | 'memo' | 'marker'; // 시작 컴포넌트 타입
  toComponentId?: string; // 연결된 끝 컴포넌트 ID
  toComponentType?: 'image' | 'link' | 'reference' | 'memo' | 'marker'; // 끝 컴포넌트 타입
}

export interface Slide {
  id: string;
  title?: string;
  images: SlideImage[];
  markers: SlideMarker[];
  links: SlideLink[];
  references: SlideReference[];
  memos: SlideMemo[];
  shapes: SlideShape[];
  recordings: SlideRecording[];
  backgroundColor?: string;
  sectionId?: string;
  order?: number;
}

export interface SlideSection {
  id: string;
  name: string;
  isOpen?: boolean;
  order: number;
}

export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;

