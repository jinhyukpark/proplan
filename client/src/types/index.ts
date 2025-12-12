export type Project = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SiteItem = {
  id: string;
  projectId: string;
  type: string;
  name: string;
  url: string | null;
  parentId: string | null;
  order: number;
  isOpen: boolean | null;
  metadata: any;
  createdAt: Date;
};

export type Marker = {
  id: string;
  siteItemId: string;
  number: number;
  x: number;
  y: number;
  type: string;
  title: string | null;
  description: string | null;
  color: string;
  authorId: string;
  status: string;
  createdAt: Date;
};

export type MarkerHistory = {
  id: string;
  markerId: string;
  type: string;
  content: string;
  authorId: string;
  createdAt: Date;
};

export type FlowNode = {
  id: string;
  flowId: string;
  nodeId: string;
  type: string;
  position: any;
  data: any;
  style: any;
  createdAt: Date;
};

export type FlowEdge = {
  id: string;
  flowId: string;
  edgeId: string;
  source: string;
  target: string;
  animated: boolean | null;
  style: any;
  createdAt: Date;
};
