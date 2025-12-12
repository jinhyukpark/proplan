import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers, Box, Users, X, Ungroup, Minus, ArrowRight, ArrowLeftRight, CornerDownRight, Spline, Type, Palette, Image as ImageIcon, Link, Upload } from "lucide-react";
import { Node, Edge } from "reactflow";

const NODE_COLORS = [
  { id: 'blue', label: 'Blue', bg: 'bg-blue-500', border: 'border-blue-400' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-500', border: 'border-purple-400' },
  { id: 'green', label: 'Green', bg: 'bg-emerald-500', border: 'border-emerald-400' },
  { id: 'orange', label: 'Orange', bg: 'bg-orange-500', border: 'border-orange-400' },
  { id: 'red', label: 'Red', bg: 'bg-red-500', border: 'border-red-400' },
  { id: 'pink', label: 'Pink', bg: 'bg-pink-500', border: 'border-pink-400' },
  { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-500', border: 'border-cyan-400' },
  { id: 'gray', label: 'Gray', bg: 'bg-slate-500', border: 'border-slate-400' },
];

type EdgeStyleType = 'bezier' | 'straight' | 'step';
type LineStyleType = 'solid' | 'dashed';
type ArrowType = 'none' | 'arrow' | 'arrowclosed';

interface FlowPropertiesPanelProps {
  selectedNodes: Node[];
  allNodes: Node[];
  selectedEdges: Edge[];
  allEdges: Edge[];
  onUpdateNode: (nodeId: string, updates: Partial<Node>) => void;
  onRemoveFromGroup: (nodeId: string) => void;
  onAddToGroup: (nodeId: string, groupId: string) => void;
  onUpdateEdge: (edgeId: string, updates: Partial<Edge>) => void;
}

export function FlowPropertiesPanel({
  selectedNodes,
  allNodes,
  selectedEdges,
  allEdges,
  onUpdateNode,
  onRemoveFromGroup,
  onAddToGroup,
  onUpdateEdge,
}: FlowPropertiesPanelProps) {
  const groupNodes = allNodes.filter(n => n.type === 'groupNode');
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;
  const selectedEdge = selectedEdges.length === 1 ? selectedEdges[0] : null;
  
  const getNodeTypeLabel = (type: string) => {
    switch (type) {
      case 'imageNode': return 'Screen';
      case 'shapeNode': return 'Shape';
      case 'decisionNode': return 'Decision';
      case 'groupNode': return 'Group';
      default: return 'Node';
    }
  };

  const getGroupChildren = (groupId: string) => {
    return allNodes.filter(n => n.parentNode === groupId);
  };

  const getEdgeStyle = (edge: Edge): EdgeStyleType => {
    return (edge.data?.edgeStyle as EdgeStyleType) || 'step';
  };

  const getLineStyle = (edge: Edge): LineStyleType => {
    return (edge.data?.lineStyle as LineStyleType) || 'solid';
  };

  const getArrowType = (edge: Edge): ArrowType => {
    const markerEnd = edge.markerEnd;
    if (!markerEnd) return 'none';
    if (typeof markerEnd === 'string') {
      if (markerEnd.includes('arrowclosed')) return 'arrowclosed';
      if (markerEnd.includes('arrow')) return 'arrow';
    }
    return (edge.data?.arrowType as ArrowType) || 'arrow';
  };

  const updateEdgeStyle = (edgeStyle: EdgeStyleType) => {
    if (!selectedEdge) return;
    onUpdateEdge(selectedEdge.id, {
      type: edgeStyle,
      data: { ...selectedEdge.data, edgeStyle }
    });
  };

  const updateLineStyle = (lineStyle: LineStyleType) => {
    if (!selectedEdge) return;
    const strokeDasharray = lineStyle === 'dashed' ? '8 4' : undefined;
    const stroke = selectedEdge.style?.stroke || '#64748b';
    onUpdateEdge(selectedEdge.id, {
      style: { ...selectedEdge.style, stroke, strokeDasharray },
      data: { ...selectedEdge.data, lineStyle }
    });
  };

  const updateArrowType = (arrowType: ArrowType) => {
    if (!selectedEdge) return;
    const markerEnd = arrowType === 'none' ? undefined : {
      type: arrowType === 'arrowclosed' ? 'arrowclosed' : 'arrow',
      width: 20,
      height: 20,
      color: selectedEdge.style?.stroke || '#64748b'
    };
    onUpdateEdge(selectedEdge.id, {
      markerEnd: markerEnd as any,
      data: { ...selectedEdge.data, arrowType }
    });
  };

  const swapDirection = () => {
    if (!selectedEdge) return;
    onUpdateEdge(selectedEdge.id, {
      source: selectedEdge.target,
      target: selectedEdge.source,
      sourceHandle: selectedEdge.targetHandle,
      targetHandle: selectedEdge.sourceHandle,
    });
  };

  const updateEdgeLabel = (label: string) => {
    if (!selectedEdge) return;
    onUpdateEdge(selectedEdge.id, {
      data: { ...selectedEdge.data, label }
    });
  };

  const updateEdgeDescription = (description: string) => {
    if (!selectedEdge) return;
    onUpdateEdge(selectedEdge.id, {
      data: { ...selectedEdge.data, description }
    });
  };

  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      <div className="shrink-0 p-4 border-b border-border space-y-3 bg-muted/10">
        <div className="flex items-center gap-2 font-medium text-xs uppercase tracking-wider text-muted-foreground">
          <Layers className="w-3.5 h-3.5" />
          Flow Properties
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {!hasSelection ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              <Box className="w-8 h-8 mx-auto mb-3 opacity-20" />
              Select a component or connection to view properties
            </div>
          ) : selectedEdge ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Type</Label>
                <div className="text-sm font-medium">Connection</div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Type className="w-3 h-3" />
                  Title
                </Label>
                <Input
                  className="h-8 text-xs"
                  placeholder="Enter connection title..."
                  value={selectedEdge.data?.label || ''}
                  onChange={(e) => updateEdgeLabel(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Description</Label>
                <Textarea
                  className="text-xs min-h-[60px] resize-none"
                  placeholder="Enter description..."
                  value={selectedEdge.data?.description || ''}
                  onChange={(e) => updateEdgeDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Line Type</Label>
                <Select value={getEdgeStyle(selectedEdge)} onValueChange={updateEdgeStyle}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="step" className="text-xs">
                      <div className="flex items-center gap-2">
                        <CornerDownRight className="w-3.5 h-3.5" />
                        Step (Right Angle)
                      </div>
                    </SelectItem>
                    <SelectItem value="bezier" className="text-xs">
                      <div className="flex items-center gap-2">
                        <Spline className="w-3.5 h-3.5" />
                        Bezier (Curved)
                      </div>
                    </SelectItem>
                    <SelectItem value="straight" className="text-xs">
                      <div className="flex items-center gap-2">
                        <Minus className="w-3.5 h-3.5" />
                        Straight
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Line Style</Label>
                <Select value={getLineStyle(selectedEdge)} onValueChange={updateLineStyle}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid" className="text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-current" />
                        Solid
                      </div>
                    </SelectItem>
                    <SelectItem value="dashed" className="text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-0.5 border-t-2 border-dashed border-current" />
                        Dashed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Line Thickness</Label>
                <Select 
                  value={String(selectedEdge.data?.strokeWidth || 2)} 
                  onValueChange={(value) => onUpdateEdge(selectedEdge.id, { data: { ...selectedEdge.data, strokeWidth: parseInt(value) } })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1" className="text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-[1px] bg-current" />
                        Thin (1px)
                      </div>
                    </SelectItem>
                    <SelectItem value="2" className="text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-[2px] bg-current" />
                        Normal (2px)
                      </div>
                    </SelectItem>
                    <SelectItem value="3" className="text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-[3px] bg-current" />
                        Medium (3px)
                      </div>
                    </SelectItem>
                    <SelectItem value="4" className="text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-[4px] bg-current" />
                        Thick (4px)
                      </div>
                    </SelectItem>
                    <SelectItem value="5" className="text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-[5px] bg-current" />
                        Bold (5px)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Arrow</Label>
                <Select value={getArrowType(selectedEdge)} onValueChange={updateArrowType}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arrow" className="text-xs">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-3.5 h-3.5" />
                        Arrow
                      </div>
                    </SelectItem>
                    <SelectItem value="arrowclosed" className="text-xs">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-3.5 h-3.5" />
                        Filled Arrow
                      </div>
                    </SelectItem>
                    <SelectItem value="none" className="text-xs">
                      <div className="flex items-center gap-2">
                        <Minus className="w-3.5 h-3.5" />
                        None
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Direction</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs gap-2"
                  onClick={swapDirection}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  Swap Direction
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Connection Info</Label>
                <div className="text-xs text-muted-foreground space-y-1 p-2 bg-muted/30 rounded">
                  <div>From: {allNodes.find(n => n.id === selectedEdge.source)?.data?.label || selectedEdge.source}</div>
                  <div>To: {allNodes.find(n => n.id === selectedEdge.target)?.data?.label || selectedEdge.target}</div>
                </div>
              </div>
            </div>
          ) : selectedNodes.length > 1 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              <Users className="w-8 h-8 mx-auto mb-3 opacity-20" />
              {selectedNodes.length} components selected
            </div>
          ) : selectedNode && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Type</Label>
                <div className="text-sm font-medium">{getNodeTypeLabel(selectedNode.type || '')}</div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Label</Label>
                <Input
                  value={selectedNode.data?.label || ''}
                  onChange={(e) => onUpdateNode(selectedNode.id, { 
                    data: { ...selectedNode.data, label: e.target.value } 
                  })}
                  className="h-8 text-sm"
                  placeholder="Enter label..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Palette className="w-3 h-3" />
                  Color
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {NODE_COLORS.map(color => (
                    <button
                      key={color.id}
                      className={`w-full h-8 rounded-md ${color.bg} transition-all hover:scale-105 ${
                        (selectedNode.data?.color || (selectedNode.type === 'decisionNode' ? 'orange' : selectedNode.type === 'shapeNode' ? 'gray' : 'blue')) === color.id 
                          ? 'ring-2 ring-offset-2 ring-blue-500' 
                          : ''
                      }`}
                      title={color.label}
                      onClick={() => onUpdateNode(selectedNode.id, {
                        data: { ...selectedNode.data, color: color.id }
                      })}
                    />
                  ))}
                </div>
              </div>

              {selectedNode.type !== 'groupNode' && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Group Membership</Label>
                  <div className="flex gap-2 items-center">
                    <Select
                      value={selectedNode.parentNode || 'none'}
                      onValueChange={(val) => {
                        if (val === 'none') {
                          onRemoveFromGroup(selectedNode.id);
                        } else {
                          onAddToGroup(selectedNode.id, val);
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select group..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="text-xs">
                          <span className="text-muted-foreground">No Group</span>
                        </SelectItem>
                        {groupNodes.map(group => (
                          <SelectItem key={group.id} value={group.id} className="text-xs">
                            {group.data?.label || 'Unnamed Group'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedNode.parentNode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => onRemoveFromGroup(selectedNode.id)}
                        title="Remove from group"
                      >
                        <Ungroup className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {selectedNode.type === 'groupNode' && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Group Members ({getGroupChildren(selectedNode.id).length})
                  </Label>
                    <div className="space-y-1">
                      {getGroupChildren(selectedNode.id).length === 0 ? (
                        <div className="text-xs text-muted-foreground italic p-2 bg-muted/30 rounded">
                          Drag components into this group to add them
                        </div>
                    ) : (
                      getGroupChildren(selectedNode.id).map(child => (
                        <div 
                          key={child.id}
                          className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs"
                        >
                          <span>{child.data?.label || getNodeTypeLabel(child.type || '')}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onRemoveFromGroup(child.id)}
                            title="Remove from group"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {selectedNode.type === 'imageNode' && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Image
                  </Label>
                  {selectedNode.data?.image ? (
                    <div className="space-y-2">
                      <div className="relative aspect-video bg-muted rounded overflow-hidden border">
                        <img 
                          src={selectedNode.data.image} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate px-1">
                        {selectedNode.data.image.startsWith('data:') 
                          ? '로컬 파일 이미지' 
                          : selectedNode.data.image}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-7 text-xs text-destructive hover:text-destructive"
                        onClick={() => onUpdateNode(selectedNode.id, { 
                          data: { ...selectedNode.data, image: undefined } 
                        })}
                      >
                        <X className="w-3 h-3 mr-1" />
                        이미지 제거
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 border-2 border-dashed rounded-md text-center text-muted-foreground">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">이미지 없음</p>
                      <p className="text-[10px] mt-1">노드의 설정 아이콘을 통해 추가하세요</p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Size</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Width</Label>
                    <Input
                      type="number"
                      value={(selectedNode.style?.width as number) || 150}
                      onChange={(e) => onUpdateNode(selectedNode.id, { 
                        style: { ...selectedNode.style, width: parseInt(e.target.value) || 150 } 
                      })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Height</Label>
                    <Input
                      type="number"
                      value={(selectedNode.style?.height as number) || 100}
                      onChange={(e) => onUpdateNode(selectedNode.id, { 
                        style: { ...selectedNode.style, height: parseInt(e.target.value) || 100 } 
                      })}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Position</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">X</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedNode.position.x)}
                      onChange={(e) => onUpdateNode(selectedNode.id, { 
                        position: { ...selectedNode.position, x: parseInt(e.target.value) || 0 } 
                      })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Y</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedNode.position.y)}
                      onChange={(e) => onUpdateNode(selectedNode.id, { 
                        position: { ...selectedNode.position, y: parseInt(e.target.value) || 0 } 
                      })}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
