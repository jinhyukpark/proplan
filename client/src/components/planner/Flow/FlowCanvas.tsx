import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  updateEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  ConnectionMode,
} from 'reactflow';
import '@reactflow/node-resizer/dist/style.css';
import 'reactflow/dist/style.css';
import { SiteItem } from '../SiteMapPanel';
import { Button } from '@/components/ui/button';
import { Plus, Circle, Square, Diamond, FileText, Spline, Minus, CornerDownRight, AlignHorizontalSpaceAround, AlignVerticalSpaceAround, BoxSelect, Layout } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Import types and constants
import { EdgeStyleType } from './types';

// Import edge components
import { edgeTypes } from './edges';

// Import node components
import { nodeTypes } from './nodes';

interface FlowCanvasProps {
  flowId: string;
  availableItems: SiteItem[];
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onSelectionChange?: (selectedNodes: Node[], allNodes: Node[], selectedEdges: Edge[], allEdges: Edge[]) => void;
  onNodesUpdate?: (nodes: Node[]) => void;
}

// 활성 도구 타입
type ActiveTool = 'select' | 'bezier' | 'straight' | 'step';

function FlowCanvasInner({ flowId, availableItems, initialNodes, initialEdges, onSave, onSelectionChange, onNodesUpdate }: FlowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges || []);
  const [activeTool, setActiveTool] = useState<ActiveTool>('select');
  const { screenToFlowPosition, getIntersectingNodes } = useReactFlow();

  // 현재 활성 도구에서 edge 스타일 추출
  const edgeStyle: EdgeStyleType = activeTool === 'select' ? 'step' : activeTool;

  // Track selection changes
  const onSelectionChangeHandler = useCallback((params: { nodes: Node[], edges: Edge[] }) => {
    onSelectionChange?.(params.nodes, nodes, params.edges, edges);
  }, [nodes, edges, onSelectionChange]);

  // Notify parent of nodes updates
  useEffect(() => {
    onNodesUpdate?.(nodes);
  }, [nodes, onNodesUpdate]);

  // Helper function to calculate absolute position through ancestor chain
  const getAbsolutePosition = useCallback((nodeId: string, nodes: Node[]): { x: number; y: number } => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    
    let x = node.position.x;
    let y = node.position.y;
    let currentParentId = node.parentNode;
    
    while (currentParentId) {
      const parent = nodes.find(n => n.id === currentParentId);
      if (parent) {
        x += parent.position.x;
        y += parent.position.y;
        currentParentId = parent.parentNode;
      } else {
        break;
      }
    }
    
    return { x, y };
  }, []);

  // Helper function to get group's absolute position
  const getGroupAbsolutePosition = useCallback((groupId: string, nodes: Node[]): { x: number; y: number } => {
    return getAbsolutePosition(groupId, nodes);
  }, [getAbsolutePosition]);

  // Listen for external node updates
  useEffect(() => {
    const handleUpdateNode = (e: CustomEvent<{ nodeId: string; updates: Partial<Node> }>) => {
      setNodes((nds) => nds.map(n => 
        n.id === e.detail.nodeId 
          ? { ...n, ...e.detail.updates, data: { ...n.data, ...e.detail.updates.data } }
          : n
      ));
    };

    const handleRemoveFromGroup = (e: CustomEvent<{ nodeId: string }>) => {
      setNodes((nds) => {
        const node = nds.find(n => n.id === e.detail.nodeId);
        if (!node?.parentNode) return nds;
        
        // Calculate absolute position through entire ancestor chain
        const absolutePos = getAbsolutePosition(e.detail.nodeId, nds);
        
        return nds.map(n => {
          if (n.id === e.detail.nodeId) {
            return {
              ...n,
              position: absolutePos,
              parentNode: undefined,
              extent: undefined,
              style: { ...n.style, zIndex: undefined },
            };
          }
          return n;
        });
      });
    };

    const handleAddToGroup = (e: CustomEvent<{ nodeId: string; groupId: string }>) => {
      setNodes((nds) => {
        const node = nds.find(n => n.id === e.detail.nodeId);
        const group = nds.find(n => n.id === e.detail.groupId);
        if (!node || !group) return nds;

        // Get node's absolute position (accounting for any current parent chain)
        const nodeAbsolutePos = getAbsolutePosition(e.detail.nodeId, nds);
        
        // Get target group's absolute position (accounting for any parent chain)
        const groupAbsolutePos = getGroupAbsolutePosition(e.detail.groupId, nds);

        // Calculate relative position to new group
        const relativeX = nodeAbsolutePos.x - groupAbsolutePos.x;
        const relativeY = nodeAbsolutePos.y - groupAbsolutePos.y;
        
        return nds.map(n => {
          if (n.id === e.detail.nodeId) {
            return {
              ...n,
              position: { x: relativeX, y: relativeY },
              parentNode: e.detail.groupId,
              extent: 'parent' as const,
              style: { ...n.style, zIndex: 10 },
            };
          }
          return n;
        });
      });
    };

    window.addEventListener('flow-update-node', handleUpdateNode as EventListener);
    window.addEventListener('flow-remove-from-group', handleRemoveFromGroup as EventListener);
    window.addEventListener('flow-add-to-group', handleAddToGroup as EventListener);

    return () => {
      window.removeEventListener('flow-update-node', handleUpdateNode as EventListener);
      window.removeEventListener('flow-remove-from-group', handleRemoveFromGroup as EventListener);
      window.removeEventListener('flow-add-to-group', handleAddToGroup as EventListener);
    };
  }, [setNodes, getAbsolutePosition, getGroupAbsolutePosition]);

  const getConnectionLineStyle = () => {
    switch (edgeStyle) {
      case 'straight': return 'straight';
      case 'step': return 'smoothstep';
      case 'bezier': 
      default: return 'bezier';
    }
  };

  useEffect(() => {
    if (initialNodes) setNodes(initialNodes);
    if (initialEdges) setEdges(initialEdges.map(e => ({ ...e, type: edgeStyle })));
  }, [flowId, initialNodes, initialEdges, setNodes, setEdges, edgeStyle]);

  useEffect(() => {
    const handleDeleteEdge = (e: CustomEvent) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== e.detail.id));
    };
    window.addEventListener('delete-edge', handleDeleteEdge as EventListener);
    return () => window.removeEventListener('delete-edge', handleDeleteEdge as EventListener);
  }, [setEdges]);

  useEffect(() => {
    const handleUpdateEdge = (e: CustomEvent<{ edgeId: string; updates: Partial<Edge> }>) => {
      setEdges((eds) => eds.map(edge => 
        edge.id === e.detail.edgeId 
          ? { 
              ...edge, 
              ...e.detail.updates,
              style: { ...edge.style, ...e.detail.updates.style },
              data: { ...edge.data, ...e.detail.updates.data }
            }
          : edge
      ));
    };
    window.addEventListener('flow-update-edge', handleUpdateEdge as EventListener);
    return () => window.removeEventListener('flow-update-edge', handleUpdateEdge as EventListener);
  }, [setEdges]);

  useEffect(() => {
    setEdges((eds) => eds.map(e => {
      if (e.data?.edgeStyle) {
        return e;
      }
      return { ...e, type: edgeStyle };
    }));
  }, [edgeStyle, setEdges]);

  // Track connected handles for each node
  const connectedHandles = useMemo(() => {
    const handles: Record<string, Set<string>> = {};
    edges.forEach(edge => {
      if (edge.source) {
        if (!handles[edge.source]) handles[edge.source] = new Set();
        if (edge.sourceHandle) handles[edge.source].add(edge.sourceHandle);
      }
      if (edge.target) {
        if (!handles[edge.target]) handles[edge.target] = new Set();
        if (edge.targetHandle) handles[edge.target].add(edge.targetHandle);
      }
    });
    return handles;
  }, [edges]);

  // Update nodes with connected handles info
  useEffect(() => {
    setNodes((nds) => nds.map(node => ({
      ...node,
      data: {
        ...node.data,
        connectedHandles: connectedHandles[node.id] ? Array.from(connectedHandles[node.id]) : []
      }
    })));
  }, [connectedHandles, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: edgeStyle,
      animated: false,
      style: {
        stroke: '#64748b',
        strokeWidth: 2,
      },
      data: {
        edgeStyle: edgeStyle,
        strokeWidth: 2,
      },
    }, eds)),
    [setEdges, edgeStyle],
  );

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => setEdges((els) => updateEdge(oldEdge, newConnection, els)),
    [setEdges]
  );

  // Handle node drag stop to detect group containment
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      // Skip if dragging a group node itself
      if (node.type === 'groupNode') return;

      // Get the node's absolute position
      const nodeAbsolutePos = getAbsolutePosition(node.id, nodes);
      const nodeWidth = (node.style?.width as number) || 150;
      const nodeHeight = (node.style?.height as number) || 80;
      const nodeCenterX = nodeAbsolutePos.x + nodeWidth / 2;
      const nodeCenterY = nodeAbsolutePos.y + nodeHeight / 2;

      // Find all group nodes and their absolute positions
      const groupNodes = nodes.filter(n => n.type === 'groupNode' && n.id !== node.parentNode);
      
      // Check if the dragged node is inside any group (excluding current parent)
      let foundGroup: Node | null = null;
      for (const group of groupNodes) {
        const groupAbsolutePos = getAbsolutePosition(group.id, nodes);
        const groupWidth = (group.style?.width as number) || 300;
        const groupHeight = (group.style?.height as number) || 200;
        
        // Check if node center is inside group bounds (using absolute positions)
        if (
          nodeCenterX > groupAbsolutePos.x &&
          nodeCenterX < groupAbsolutePos.x + groupWidth &&
          nodeCenterY > groupAbsolutePos.y &&
          nodeCenterY < groupAbsolutePos.y + groupHeight
        ) {
          foundGroup = group;
          break;
        }
      }

      setNodes((nds) => 
        nds.map((n) => {
          if (n.id === node.id) {
            if (foundGroup) {
              // Add to group - get group's absolute position and calculate relative
              const groupAbsolutePos = getAbsolutePosition(foundGroup.id, nds);
              const relativeX = nodeAbsolutePos.x - groupAbsolutePos.x;
              const relativeY = nodeAbsolutePos.y - groupAbsolutePos.y;
              return {
                ...n,
                position: { x: relativeX, y: relativeY },
                parentNode: foundGroup.id,
                extent: 'parent' as const,
                style: { ...n.style, zIndex: 10 },
              };
            } else if (n.parentNode) {
              // Check if we're still inside current parent
              const currentParent = nds.find(pn => pn.id === n.parentNode);
              if (currentParent) {
                const parentAbsolutePos = getAbsolutePosition(currentParent.id, nds);
                const parentWidth = (currentParent.style?.width as number) || 300;
                const parentHeight = (currentParent.style?.height as number) || 200;
                
                // If node center is outside parent, remove from group
                if (
                  nodeCenterX < parentAbsolutePos.x ||
                  nodeCenterX > parentAbsolutePos.x + parentWidth ||
                  nodeCenterY < parentAbsolutePos.y ||
                  nodeCenterY > parentAbsolutePos.y + parentHeight
                ) {
                  return {
                    ...n,
                    position: nodeAbsolutePos,
                    parentNode: undefined,
                    extent: undefined,
                    style: { ...n.style, zIndex: undefined },
                  };
                }
              }
            }
          }
          return n;
        })
      );
    },
    [nodes, setNodes, getAbsolutePosition]
  );

  const handleAddNode = (item: SiteItem) => {
    const newNode: Node = {
      id: `${item.id}-${Date.now()}`,
      type: 'imageNode',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: { 
        label: item.name, 
        image: item.url 
      },
      style: { width: 240, height: 200 },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const onDragStart = (event: React.DragEvent, nodeType: string, shapeType?: string, edgeType?: EdgeStyleType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    if (shapeType) {
      event.dataTransfer.setData('application/shapeType', shapeType);
    }
    if (edgeType) {
      event.dataTransfer.setData('application/edgeType', edgeType);
    }
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const shapeType = event.dataTransfer.getData('application/shapeType');
      const edgeType = event.dataTransfer.getData('application/edgeType') as EdgeStyleType;

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // 라인(Edge) 드래그 생성
      if (type === 'edge' && edgeType) {
        const lineLength = 150;
        const timestamp = Date.now();
        const sourceNodeId = `virtual_start_${timestamp}`;
        const targetNodeId = `virtual_end_${timestamp}`;

        const newEdge: Edge = {
          id: `edge_${timestamp}`,
          source: sourceNodeId,
          target: targetNodeId,
          type: edgeType,
          style: {
            stroke: '#64748b',
            strokeWidth: 2,
          },
          data: {
            edgeStyle: edgeType,
            strokeWidth: 2,
            sourceNodeId,
            targetNodeId,
          },
        };

        // 가상 시작/끝 노드 생성 (보이지 않는 노드)
        const startNode: Node = {
          id: sourceNodeId,
          type: 'default',
          position: { x: position.x, y: position.y },
          data: { label: '' },
          style: { width: 1, height: 1, opacity: 0, pointerEvents: 'none' },
          selectable: false,
          draggable: false,
        };

        const endNode: Node = {
          id: targetNodeId,
          type: 'default',
          position: { x: position.x + lineLength, y: position.y },
          data: { label: '' },
          style: { width: 1, height: 1, opacity: 0, pointerEvents: 'none' },
          selectable: false,
          draggable: false,
        };

        setNodes((nds) => [...nds, startNode, endNode]);
        setEdges((eds) => [...eds, newEdge]);
        setActiveTool('select');
        return;
      }

      let newNodeData: any = { label: 'New Node' };
      let style: React.CSSProperties = { width: 150, height: 80 };

      let nodeType = type;

      if (type === 'shapeNode') {
        newNodeData = { label: shapeType ? shapeType.charAt(0).toUpperCase() + shapeType.slice(1) : 'Shape', shapeType };
        if (shapeType === 'start' || shapeType === 'end') style = { width: 80, height: 80 };
        if (shapeType === 'decision') {
          style = { width: 100, height: 100 };
          nodeType = 'decisionNode';
        }
        if (shapeType === 'note') style = { width: 180, height: 120 };
        if (shapeType === 'process') style = { width: 150, height: 80 };
      }

      if (type === 'groupNode') {
        newNodeData = { label: 'Group' };
        style = { width: 300, height: 200, zIndex: -1 };
      }

      const newNode: Node = {
        id: `dndnode_${Date.now()}`,
        type: nodeType,
        position,
        data: newNodeData,
        style
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes, setEdges, setActiveTool],
  );

  const autoLayoutHorizontal = useCallback(() => {
    const GAP = 50;
    
    setNodes((nds) => {
      // Get selected nodes
      const selectedNodes = nds.filter(n => n.selected);
      if (selectedNodes.length < 2) return nds;
      
      // Find the leftmost position and average Y
      const minX = Math.min(...selectedNodes.map(n => n.position.x));
      const avgY = selectedNodes.reduce((sum, n) => sum + n.position.y, 0) / selectedNodes.length;
      
      // Sort selected by current X position
      const sorted = [...selectedNodes].sort((a, b) => a.position.x - b.position.x);
      
      let currentX = minX;
      const positionMap = new Map<string, { x: number; y: number }>();
      
      sorted.forEach(node => {
        const nodeWidth = (node.style?.width as number) || 150;
        positionMap.set(node.id, {
          x: currentX,
          y: avgY,
        });
        currentX += nodeWidth + GAP;
      });
      
      return nds.map(node => {
        const newPos = positionMap.get(node.id);
        if (newPos) {
          return { ...node, position: newPos };
        }
        return node;
      });
    });
  }, [setNodes]);

  const autoLayoutVertical = useCallback(() => {
    const GAP = 50;
    
    setNodes((nds) => {
      // Get selected nodes
      const selectedNodes = nds.filter(n => n.selected);
      if (selectedNodes.length < 2) return nds;
      
      // Find the topmost position and average X
      const minY = Math.min(...selectedNodes.map(n => n.position.y));
      const avgX = selectedNodes.reduce((sum, n) => sum + n.position.x, 0) / selectedNodes.length;
      
      // Sort selected by current Y position
      const sorted = [...selectedNodes].sort((a, b) => a.position.y - b.position.y);
      
      let currentY = minY;
      const positionMap = new Map<string, { x: number; y: number }>();
      
      sorted.forEach(node => {
        const nodeHeight = (node.style?.height as number) || 80;
        positionMap.set(node.id, {
          x: avgX,
          y: currentY,
        });
        currentY += nodeHeight + GAP;
      });
      
      return nds.map(node => {
        const newPos = positionMap.get(node.id);
        if (newPos) {
          return { ...node, position: newPos };
        }
        return node;
      });
    });
  }, [setNodes]);

  const getAddableItems = (items: SiteItem[]): SiteItem[] => {
    let result: SiteItem[] = [];
    items.forEach(item => {
      if (item.type === 'page' || item.type === 'image') {
        result.push(item);
      }
      if (item.children) {
        result = [...result, ...getAddableItems(item.children)];
      }
    });
    return result;
  };

  const addableItems = useMemo(() => getAddableItems(availableItems), [availableItems]);

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-zinc-950 relative" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeUpdate={onEdgeUpdate}
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={onSelectionChangeHandler}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-right"
        deleteKeyCode={['Backspace', 'Delete']}
        connectionMode={ConnectionMode.Loose}
        edgesUpdatable={true}
        edgesFocusable={true}
        elementsSelectable={true}
        multiSelectionKeyCode="Meta"
        selectionKeyCode="Meta"
        connectionLineType={getConnectionLineStyle() as any}
        connectionLineStyle={{
          stroke: '#64748b',
          strokeWidth: 2,
        }}
        defaultEdgeOptions={{ animated: false }}
      >
        <Background color="#94a3b8" variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls showInteractive={false} className="!bg-white dark:!bg-zinc-900 !border-border !shadow-sm" />
        <MiniMap 
          className="!bg-white dark:!bg-zinc-900 !border-border !shadow-sm rounded-lg overflow-hidden" 
          maskColor="rgba(0,0,0,0.1)"
          nodeColor={() => '#e2e8f0'}
        />
        
        <Panel position="top-left" className="m-4 flex flex-col gap-2">
          <div className="bg-background/80 backdrop-blur-sm border border-border rounded-md flex items-center p-1 shadow-sm gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="shadow-sm gap-2 h-8" size="sm">
                  <Plus className="w-4 h-4" />
                  Screens
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-h-80 overflow-y-auto">
                {addableItems.length > 0 ? (
                  addableItems.map(item => (
                    <DropdownMenuItem key={item.id} onClick={() => handleAddNode(item)}>
                      {item.type === 'image' ? <Layout className="w-4 h-4 mr-2 text-purple-500" /> : <Layout className="w-4 h-4 mr-2 text-blue-500" />}
                      <span className="truncate">{item.name}</span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-2 text-xs text-muted-foreground text-center">No screens available</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-4 bg-border mx-1" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <div className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing" onDragStart={(event) => onDragStart(event, 'shapeNode', 'start')} draggable>
                      <Circle className="w-5 h-5 text-slate-700 fill-slate-900" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Start/End</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing" onDragStart={(event) => onDragStart(event, 'shapeNode', 'process')} draggable>
                    <Square className="w-5 h-5 text-slate-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Process</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing" onDragStart={(event) => onDragStart(event, 'shapeNode', 'decision')} draggable>
                    <Diamond className="w-5 h-5 text-amber-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Decision</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing" onDragStart={(event) => onDragStart(event, 'shapeNode', 'note')} draggable>
                    <FileText className="w-5 h-5 text-yellow-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Note</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing" onDragStart={(event) => onDragStart(event, 'groupNode', 'group')} draggable>
                    <BoxSelect className="w-5 h-5 text-slate-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Group</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-px h-4 bg-border mx-1" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`p-1 rounded cursor-grab active:cursor-grabbing ${activeTool === 'bezier' ? 'bg-muted' : 'hover:bg-muted'}`}
                    onClick={() => setActiveTool('bezier')}
                    onDragStart={(e) => onDragStart(e, 'edge', undefined, 'bezier')}
                    draggable
                  >
                    <Spline className="w-5 h-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Curved Line (드래그하여 생성)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`p-1 rounded cursor-grab active:cursor-grabbing ${activeTool === 'straight' ? 'bg-muted' : 'hover:bg-muted'}`}
                    onClick={() => setActiveTool('straight')}
                    onDragStart={(e) => onDragStart(e, 'edge', undefined, 'straight')}
                    draggable
                  >
                    <Minus className="w-5 h-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Straight Line (드래그하여 생성)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`p-1 rounded cursor-grab active:cursor-grabbing ${activeTool === 'step' ? 'bg-muted' : 'hover:bg-muted'}`}
                    onClick={() => setActiveTool('step')}
                    onDragStart={(e) => onDragStart(e, 'edge', undefined, 'step')}
                    draggable
                  >
                    <CornerDownRight className="w-5 h-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Step Line (드래그하여 생성)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-px h-4 bg-border mx-1" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={autoLayoutHorizontal}
                  >
                    <AlignHorizontalSpaceAround className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Horizontal Layout</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={autoLayoutVertical}
                  >
                    <AlignVerticalSpaceAround className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Vertical Layout</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function FlowCanvas(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

export default FlowCanvas;