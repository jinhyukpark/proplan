import React, { useState, useCallback, useRef, useEffect } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { BrowserCanvas, Marker, User } from "@/components/planner/BrowserCanvas";
import { SpecPanel, PageMetadata, ImageMetadata } from "@/components/planner/SpecPanel";
import { SiteMapPanel, SiteItem, SiteItemType } from "@/components/planner/SiteMapPanel";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { arrayMove } from "@dnd-kit/sortable";
import { Link } from "wouter";
import { ChevronLeft, Share2, MoreHorizontal, Columns2, Rows2, Home, LayoutDashboard, FileText, Trash2, Globe, GitBranch, Presentation, Folder, RotateCcw, Send, Pencil, Plus, X, Tag, Shield, Clock, Users, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import modernDarkModeDashboard from "@assets/generated_images/modern_dark_mode_dashboard_ui.png";
import minimalistMobileLogin from "@assets/generated_images/minimalist_mobile_login_screen.png";
import cleanEcommerceProduct from "@assets/generated_images/clean_e-commerce_product_page.png";
import avatar1 from "@assets/generated_images/professional_user_avatar_1.png";
import avatar2 from "@assets/generated_images/professional_user_avatar_2.png";
import avatar3 from "@assets/generated_images/professional_user_avatar_3.png";

import { FlowCanvas } from "@/components/planner/Flow/FlowCanvas";
import { FlowPropertiesPanel } from "@/components/planner/Flow/FlowPropertiesPanel";
import { PresentationCanvas, Slide, SlideSection } from "@/components/planner/Presentation/PresentationCanvas";
import { ProjectDashboard } from "@/components/planner/ProjectDashboard";
import type { Node, Edge } from "reactflow";

// Mock Data for Team
const CURRENT_USER: User = {
  id: "u1",
  name: "Alex Designer",
  avatar: avatar1
};

const TEAM_MEMBERS: User[] = [
  CURRENT_USER,
  { id: "u2", name: "Sarah PM", avatar: avatar2 },
  { id: "u3", name: "Mike Dev", avatar: avatar3 },
];

// Distinct modern colors for markers
const MARKER_COLORS = [
  "#2563EB", // Blue 600
  "#DC2626", // Red 600
  "#D97706", // Amber 600
  "#059669", // Emerald 600
  "#7C3AED", // Violet 600
  "#DB2777", // Pink 600
  "#0891B2", // Cyan 600
  "#EA580C", // Orange 600
];

// Helper to remove item from tree
const removeItemFromTree = (items: SiteItem[], id: string): { items: SiteItem[], removed: SiteItem | null } => {
  let removed: SiteItem | null = null;
  const newItems = items.reduce((acc, item) => {
    if (item.id === id) {
      removed = item;
      return acc;
    }
    if (item.children) {
      const { items: newChildren, removed: childRemoved } = removeItemFromTree(item.children, id);
      if (childRemoved) removed = childRemoved;
      acc.push({ ...item, children: newChildren });
    } else {
      acc.push(item);
    }
    return acc;
  }, [] as SiteItem[]);
  return { items: newItems, removed };
};

// Helper to insert item into tree (after target or inside target if folder)
const insertItemIntoTree = (items: SiteItem[], targetId: string, itemToInsert: SiteItem, position: 'after' | 'inside'): SiteItem[] => {
  return items.reduce((acc, item) => {
    if (item.id === targetId) {
      if (position === 'inside') {
        // Insert as first child
        acc.push({ ...item, children: [itemToInsert, ...(item.children || [])], isOpen: true });
      } else {
        // Insert after
        acc.push(item, itemToInsert);
      }
    } else {
      if (item.children) {
        acc.push({ ...item, children: insertItemIntoTree(item.children, targetId, itemToInsert, position) });
      } else {
        acc.push(item);
      }
    }
    return acc;
  }, [] as SiteItem[]);
};

// Helper to find item parent
const findParent = (items: SiteItem[], childId: string): SiteItem | null => {
  for (const item of items) {
    if (item.children && item.children.some(c => c.id === childId)) return item;
    if (item.children) {
      const found = findParent(item.children, childId);
      if (found) return found;
    }
  }
  return null;
};

// Helper to count items by type
const countItemsByType = (items: SiteItem[], type: string): number => {
  let count = 0;
  for (const item of items) {
    if (item.type === type) count++;
    if (item.children) count += countItemsByType(item.children, type);
  }
  return count;
};

// Helper to find first item by type
const findFirstItemByType = (items: SiteItem[], type: string): SiteItem | null => {
  for (const item of items) {
    if (item.type === type) return item;
    if (item.children) {
      const found = findFirstItemByType(item.children, type);
      if (found) return found;
    }
  }
  return null;
};

// Helper to collect all items by type
const collectItemsByType = (items: SiteItem[], type: string): SiteItem[] => {
  let result: SiteItem[] = [];
  for (const item of items) {
    if (item.type === type) result.push(item);
    if (item.children) {
      result = [...result, ...collectItemsByType(item.children, type)];
    }
  }
  return result;
};

// Helper to find item by ID
const findItemById = (items: SiteItem[], id: string): SiteItem | null => {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
};

export default function Planner() {
  const [url, setUrl] = useState("dashboard:");
  const [markersMap, setMarkersMap] = useState<Record<string, Marker[]>>({});
  const [projectFeaturedImage, setProjectFeaturedImage] = useState<string | undefined>(modernDarkModeDashboard);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  
  // Flow State
  const [flowsData, setFlowsData] = useState<Record<string, { nodes: Node[], edges: Edge[] }>>({
    "flow-1": {
      nodes: [],
      edges: []
    }
  });

  // Presentation State
  const [presentationsData, setPresentationsData] = useState<Record<string, Slide[]>>({});
  const [presentationsSectionsData, setPresentationsSectionsData] = useState<Record<string, SlideSection[]>>({});
  const [activePptSlideIndex, setActivePptSlideIndex] = useState(0);
  const [selectedPptMarkerId, setSelectedPptMarkerId] = useState<string | null>(null);
  const [selectedPptComponent, setSelectedPptComponent] = useState<any>(null);
  const [selectedPptComponentId, setSelectedPptComponentId] = useState<string | null>(null);

  // Flow Selection State
  const [selectedFlowNodes, setSelectedFlowNodes] = useState<Node[]>([]);
  const [allFlowNodes, setAllFlowNodes] = useState<Node[]>([]);
  const [selectedFlowEdges, setSelectedFlowEdges] = useState<Edge[]>([]);
  const [allFlowEdges, setAllFlowEdges] = useState<Edge[]>([]);

  // Dialog State
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [addItemData, setAddItemData] = useState<{ type: SiteItemType, parentId?: string } | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("");
  
  // Capture Dialog State
  const [isCaptureDialogOpen, setIsCaptureDialogOpen] = useState(false);
  const [captureData, setCaptureData] = useState<{ type: 'full' | 'area', rect?: any } | null>(null);
  const [captureName, setCaptureName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  
  // Panel Layout State (horizontal = side-by-side, vertical = stacked)
  const [sidePanelDirection, setSidePanelDirection] = useState<'horizontal' | 'vertical'>('vertical');
  
  // Project Overview State
  const [projectName, setProjectName] = useState("Illunex Redesign");
  const [projectDescription, setProjectDescription] = useState("Enterprise value chain platform redesign project. Modern UI/UX overhaul with responsive design and improved user experience.");
  const [projectStatus, setProjectStatus] = useState<string>("in_progress");
  const [projectTags, setProjectTags] = useState<string[]>(["UI/UX", "Redesign", "Enterprise"]);
  const [projectMembers, setProjectMembers] = useState<Array<{ user: User; access: 'owner' | 'editor' | 'viewer' }>>([
    { user: CURRENT_USER, access: 'owner' },
    { user: TEAM_MEMBERS[1], access: 'editor' },
    { user: TEAM_MEMBERS[2], access: 'viewer' },
  ]);

  // Site Map Tree State
  const [siteItems, setSiteItems] = useState<SiteItem[]>([
    {
      id: "root-assets",
      type: "folder",
      name: "Assets",
      isOpen: true,
      children: [
        {
          id: "folder-image",
          type: "folder",
          name: "Image",
          isOpen: true,
          children: [
            {
              id: "img-1",
              type: "image",
              name: "Dashboard Dark Mode",
              url: modernDarkModeDashboard,
              metadata: { title: "Dashboard Ref", description: "Dark mode inspiration", rfNumber: "REF-001", date: new Date().toISOString() }
            },
            {
              id: "img-2",
              type: "image",
              name: "Mobile Login",
              url: minimalistMobileLogin,
              metadata: { title: "Login Screen", description: "Mobile app login flow", rfNumber: "REF-002", date: new Date().toISOString() }
            },
            {
              id: "img-3",
              type: "image",
              name: "Product Page",
              url: cleanEcommerceProduct,
              metadata: { title: "Product Detail", description: "E-commerce layout reference", rfNumber: "REF-003", date: new Date().toISOString() }
            }
          ]
        },
        {
          id: "folder-audio",
          type: "folder",
          name: "Audio",
          isOpen: false,
          children: []
        },
        {
          id: "folder-file",
          type: "folder",
          name: "File",
          isOpen: false,
          children: []
        },
        {
          id: "folder-link",
          type: "folder",
          name: "Link",
          isOpen: false,
          children: [
            { 
              id: "p-1", 
              type: "page", 
              name: "Home", 
              url: "https://illunex.com",
              metadata: { title: "Home Page", description: "Main landing page", rfNumber: "SCR-001", date: new Date().toISOString() } 
            },
            { 
              id: "p-2", 
              type: "page", 
              name: "Blog", 
              url: "https://blog.illunex.com",
              metadata: { title: "Blog List", description: "Company blog posts", rfNumber: "SCR-002", date: new Date().toISOString() }
            }
          ]
        }
      ]
    },
    {
      id: "root-slide",
      type: "folder",
      name: "Slide",
      isOpen: true,
      children: [
        {
          id: "ppt-1",
          type: "ppt",
          name: "Q4 Product Roadmap",
          metadata: { title: "Roadmap", description: "Product roadmap presentation", rfNumber: "PPT-001", date: new Date().toISOString() }
        },
        {
          id: "ppt-2",
          type: "ppt",
          name: "Design System Review",
          metadata: { title: "Design Review", description: "UI/UX design system overview", rfNumber: "PPT-002", date: new Date().toISOString() }
        }
      ]
    },
    {
      id: "root-flow",
      type: "folder",
      name: "Flow",
      isOpen: true,
      children: [
        {
          id: "flow-1",
          type: "flow",
          name: "User Onboarding Flow",
          metadata: { title: "Onboarding", description: "New user registration flow", rfNumber: "FLO-001", date: new Date().toISOString() }
        },
        {
          id: "flow-2",
          type: "flow",
          name: "Checkout Process",
          metadata: { title: "Checkout", description: "Cart to payment flow", rfNumber: "FLO-002", date: new Date().toISOString() }
        }
      ]
    }
  ]);

  const isInitialLoad = useRef(true);

  // Derived state for current markers
  const markers = markersMap[url] || [];

  // Helper to find current page item
  const findItemByUrl = (items: SiteItem[], targetUrl: string): SiteItem | null => {
    for (const item of items) {
      if (item.url === targetUrl) return item;
      if (item.children) {
        const found = findItemByUrl(item.children, targetUrl);
        if (found) return found;
      }
    }
    return null;
  };

  const activePageItem = findItemByUrl(siteItems, url);

  // Helper to recursive update items
  const updateItemsRecursively = (items: SiteItem[], id: string, updater: (item: SiteItem) => SiteItem): SiteItem[] => {
    return items.map(item => {
      if (item.id === id) return updater(item);
      if (item.children) {
        return { ...item, children: updateItemsRecursively(item.children, id, updater) };
      }
      return item;
    });
  };
  
  // Update item by URL (for metadata updates)
  const updateItemByUrl = (items: SiteItem[], targetUrl: string, updater: (item: SiteItem) => SiteItem): SiteItem[] => {
    return items.map(item => {
      if (item.url === targetUrl) return updater(item);
      if (item.children) {
        return { ...item, children: updateItemByUrl(item.children, targetUrl, updater) };
      }
      return item;
    });
  };

  const deleteItemRecursively = (items: SiteItem[], id: string): SiteItem[] => {
    return items.filter(item => item.id !== id).map(item => {
      if (item.children) {
        return { ...item, children: deleteItemRecursively(item.children, id) };
      }
      return item;
    });
  };

  const addItemToFolder = (items: SiteItem[], parentId: string, newItem: SiteItem): SiteItem[] => {
    return items.map(item => {
      if (item.id === parentId) {
        return { ...item, children: [...(item.children || []), newItem], isOpen: true };
      }
      if (item.children) {
        return { ...item, children: addItemToFolder(item.children, parentId, newItem) };
      }
      return item;
    });
  };


  const handleToggleFolder = (id: string) => {
    setSiteItems(prev => updateItemsRecursively(prev, id, (item) => ({ ...item, isOpen: !item.isOpen })));
  };

  const handleAddItem = (type: SiteItemType, parentId?: string) => {
    setAddItemData({ type, parentId });
    setNewItemName(`New ${type === 'ppt' ? 'Presentation' : type}`);
    setNewItemUrl(type === 'page' ? "https://" : (type === 'image' ? "https://placeholder.com/image.png" : ""));
    
    // For flow and ppt types, set default folder selection if no parentId
    if ((type === 'flow' || type === 'ppt') && !parentId) {
      const folders = getAllFolders(siteItems);
      if (folders.length > 0) {
        setSelectedFolderId(folders[0].id);
      }
    } else if (parentId) {
      setSelectedFolderId(parentId);
    }
    
    setIsAddItemDialogOpen(true);
  };

  const confirmAddItem = () => {
    if (!addItemData || !newItemName) return;
    
    const { type, parentId } = addItemData;
    
    // Determine the target folder for flow/ppt types
    const targetFolderId = (type === 'flow' || type === 'ppt') && !parentId ? selectedFolderId : parentId;
    
    const newItem: SiteItem = {
      id: uuidv4(),
      type,
      name: newItemName,
      url: (type !== 'folder' && type !== 'flow' && type !== 'ppt' && newItemUrl) ? newItemUrl : undefined,
      children: type === 'folder' ? [] : undefined,
      isOpen: true,
      metadata: type !== 'folder' ? {
        title: newItemName,
        description: type === 'flow' ? "Feature flow and interaction design" : 
                     type === 'ppt' ? "Presentation slides" : "",
        rfNumber: "",
        date: new Date().toISOString()
      } : undefined
    };

    if (targetFolderId) {
      setSiteItems(prev => addItemToFolder(prev, targetFolderId, newItem));
    } else {
      setSiteItems(prev => [...prev, newItem]);
    }
    
    setIsAddItemDialogOpen(false);
    setAddItemData(null);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      setSiteItems(prev => deleteItemRecursively(prev, id));
    }
  };

  const getMarkerCount = (pageUrl: string) => {
    return (markersMap[pageUrl] || []).length;
  };

  // Helper to get all folders flat list for selection
  const getAllFolders = (items: SiteItem[]): SiteItem[] => {
    let folders: SiteItem[] = [];
    items.forEach(item => {
      if (item.type === 'folder') {
        folders.push(item);
        if (item.children) {
          folders = [...folders, ...getAllFolders(item.children)];
        }
      }
    });
    return folders;
  };

  const handleCapture = (type: 'full' | 'area', rect?: any) => {
    setCaptureData({ type, rect });
    setCaptureName(`Capture ${new Date().toLocaleTimeString()}`);
    
    // Find first folder to select by default if none selected
    const folders = getAllFolders(siteItems);
    if (folders.length > 0 && !selectedFolderId) {
      setSelectedFolderId(folders[0].id);
    } else if (folders.length > 0) {
       // Keep existing selection or default to first
       if (!getAllFolders(siteItems).find(f => f.id === selectedFolderId)) {
          setSelectedFolderId(folders[0].id);
       }
    }
    
    setIsCaptureDialogOpen(true);
  };

  const saveCapture = () => {
    if (!captureName || !selectedFolderId) return;

    // Create new image item
    // In a real app, we would upload the captured image blob here
    const newItem: SiteItem = {
      id: uuidv4(),
      type: 'image',
      name: captureName,
      // Use a placeholder that represents the capture
      url: "https://placehold.co/1200x800/png?text=Captured+Screen", 
      metadata: {
        title: captureName,
        description: `Captured from ${url} (${captureData?.type === 'area' ? 'Area Selection' : 'Full Page'})`,
        rfNumber: "",
        date: new Date().toISOString()
      }
    };

    setSiteItems(prev => addItemToFolder(prev, selectedFolderId, newItem));
    setIsCaptureDialogOpen(false);
    toast.success("Capture saved to project");
    
    // Switch to the newly created item if desired, or just stay on current page
  };

  // Clear markers when URL changes via address bar
  const handleSetUrl = useCallback((newUrl: string) => {
    // Check if it's a flow ID (simple check, or we could pass type)
    // For now we assume if it doesn't look like a URL and exists in our items, it might be a special type?
    // Actually, we use 'url' field for everything. For flows, we can use a special scheme or just the ID.
    setUrl(newUrl);
    // Don't clear markers here, just switch URL
    setActiveMarkerId(null);
    isInitialLoad.current = true; // Reset initial load flag on manual URL change
  }, []);

  const handleSelectItem = (item: SiteItem) => {
    if (item.id === 'dashboard' || item.url === 'dashboard:') {
      handleSetUrl('dashboard:');
    } else if (item.type === 'flow') {
      handleSetUrl(`flow:${item.id}`);
    } else if (item.type === 'ppt') {
      handleSetUrl(`ppt:${item.id}`);
    } else if (item.url) {
      handleSetUrl(item.url);
    }
  };

  // Handle iframe load events (including internal navigation)
  const handlePageLoad = useCallback(() => {
    // If it's NOT the initial load of the app/URL, it implies navigation
    if (!isInitialLoad.current) {
      // We can't know the new URL automatically due to security
      // But we can clear the active selection
      setActiveMarkerId(null);
      toast.info("페이지 이동이 감지되었습니다.", {
        description: "보안상 자동 URL 감지가 불가능합니다. (해결책: postMessage 연동 필요)",
        duration: 5000,
      });
    }
    // After first load, any subsequent load is a navigation
    isInitialLoad.current = false;
  }, []);

  // Listen for postMessage from the child window (Solution for dynamic URL detection)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // In a real app, you would validate event.origin here
      if (event.data && event.data.type === 'URL_CHANGE' && typeof event.data.url === 'string') {
        // Update URL without reloading the iframe (since it's already there)
        // We just want to update our UI state
        setUrl(event.data.url);
        
        // Reset active marker
        setActiveMarkerId(null);
        toast.success("URL이 동기화되었습니다.", { description: event.data.url });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [markersMap]);

  const addMarker = useCallback((x: number, y: number, type: 'default' | 'link' = 'default') => {
    const currentMarkers = markersMap[url] || [];
    const nextNumber = currentMarkers.length + 1;
    const color = MARKER_COLORS[(nextNumber - 1) % MARKER_COLORS.length];
    
    const newMarker: Marker = {
      id: uuidv4(),
      number: nextNumber,
      x,
      y,
      type,
      title: "",
      description: "",
      color,
      author: CURRENT_USER,
      status: 'pending',
      history: []
    };

    setMarkersMap((prev) => ({
      ...prev,
      [url]: [...(prev[url] || []), newMarker]
    }));
    setActiveMarkerId(newMarker.id);
  }, [url, markersMap]);

  // Navigate handler for link markers
  const handleNavigate = (targetUrl: string) => {
    let finalUrl = targetUrl;
    if (!finalUrl.startsWith('http')) {
      finalUrl = 'https://' + finalUrl;
    }
    handleSetUrl(finalUrl);
    toast.success("Navigating to link...", { description: finalUrl });
  };

  // Flow node operation handlers
  const handleFlowSelectionChange = useCallback((selectedNodes: Node[], allNodes: Node[], selectedEdges: Edge[], allEdges: Edge[]) => {
    setSelectedFlowNodes(selectedNodes);
    setAllFlowNodes(allNodes);
    setSelectedFlowEdges(selectedEdges);
    setAllFlowEdges(allEdges);
  }, []);

  const handleFlowNodesUpdate = useCallback((nodes: Node[]) => {
    setAllFlowNodes(nodes);
    // selectedFlowNodes도 업데이트하여 Properties 패널과 캔버스 동기화
    setSelectedFlowNodes(prev =>
      prev.map(selectedNode => {
        const updatedNode = nodes.find(n => n.id === selectedNode.id);
        return updatedNode || selectedNode;
      }).filter(selectedNode => nodes.some(node => node.id === selectedNode.id))
    );
  }, []);

  const handlePresentationSlidesChange = useCallback((presentationId: string, slides: Slide[]) => {
    setPresentationsData(prev => ({
      ...prev,
      [presentationId]: slides
    }));
  }, []);
  const handlePresentationSectionsChange = useCallback((presentationId: string, sections: SlideSection[]) => {
    setPresentationsSectionsData(prev => ({
      ...prev,
      [presentationId]: sections
    }));
  }, []);

  // 초기 슬라이드/섹션 시드: 섹션, 슬라이드, 슬라이드, 슬라이드, 섹션, 섹션, 슬라이드, 슬라이드, 섹션
  useEffect(() => {
    if (!isInitialLoad.current) return;
    if (Object.keys(presentationsData).length > 0) return;

    const baseImages = [
      {
        url: modernDarkModeDashboard,
        x: 120,
        y: 80,
        width: 360,
        height: 220,
      },
      {
        url: cleanEcommerceProduct,
        x: 540,
        y: 120,
        width: 320,
        height: 200,
      },
    ];

    const makeSlide = (): Slide => ({
      id: uuidv4(),
      title: "",
      images: baseImages.map((img) => ({
        id: uuidv4(),
        url: img.url,
        x: img.x,
        y: img.y,
        width: img.width,
        height: img.height,
      })),
      markers: [],
      links: [],
      shapes: [],
      recordings: [],
      backgroundColor: "#ffffff",
    });

    // 원하는 외부 순서:
    // 슬라이드(0), 섹션1(1), 슬라이드(2,3), 섹션2(4), 섹션3(5), 슬라이드(6,7), 섹션4(8)
    const seededSlides = [
      { ...makeSlide(), order: 0 }, // slide 1
      { ...makeSlide(), order: 2 }, // slide 2
      { ...makeSlide(), order: 3 }, // slide 3
      { ...makeSlide(), order: 6 }, // slide 4
      { ...makeSlide(), order: 7 }, // slide 5
    ];

    const seededSections: SlideSection[] = [
      { id: "seed-section-1", name: "섹션 1", isOpen: true, order: 1 },
      { id: "seed-section-2", name: "섹션 2", isOpen: true, order: 4 },
      { id: "seed-section-3", name: "섹션 3", isOpen: true, order: 5 },
      { id: "seed-section-4", name: "섹션 4", isOpen: true, order: 8 },
    ];

    setPresentationsData({
      "ppt-1": seededSlides,
    });
    setPresentationsSectionsData({
      "ppt-1": seededSections,
    });
  }, [presentationsData]);
  
  const getCurrentPresentationSlides = (presentationId: string): Slide[] => {
    return presentationsData[presentationId] || [];
  };
  const getCurrentPresentationSections = (presentationId: string): SlideSection[] => {
    return presentationsSectionsData[presentationId] || [];
  };

  const handleUpdateFlowNode = useCallback((nodeId: string, updates: Partial<Node>) => {
    window.dispatchEvent(new CustomEvent('flow-update-node', { detail: { nodeId, updates } }));
  }, []);

  const handleRemoveFromGroup = useCallback((nodeId: string) => {
    window.dispatchEvent(new CustomEvent('flow-remove-from-group', { detail: { nodeId } }));
  }, []);

  const handleAddToGroup = useCallback((nodeId: string, groupId: string) => {
    window.dispatchEvent(new CustomEvent('flow-add-to-group', { detail: { nodeId, groupId } }));
  }, []);

  const handleUpdateFlowEdge = useCallback((edgeId: string, updates: Partial<Edge>) => {
    window.dispatchEvent(new CustomEvent('flow-update-edge', { detail: { edgeId, updates } }));
  }, []);

  const updateMarker = useCallback((id: string, updates: Partial<Marker>) => {
    setMarkersMap((prev) => ({
      ...prev,
      [url]: (prev[url] || []).map((m) => {
        if (m.id === id) {
          // If status is changing, add to history
          let newHistory = m.history;
          if (updates.status && updates.status !== m.status) {
             newHistory = [
               {
                 id: uuidv4(),
                 type: 'status_change',
                 content: `Changed status from ${m.status} to ${updates.status}`,
                 author: CURRENT_USER,
                 createdAt: new Date().toISOString()
               },
               ...newHistory
             ];
          }
          return { ...m, ...updates, history: newHistory };
        }
        return m;
      })
    }));
  }, [url]);

  const addComment = useCallback((id: string, text: string) => {
    setMarkersMap((prev) => ({
      ...prev,
      [url]: (prev[url] || []).map((m) => {
        if (m.id === id) {
          const newComment = {
            id: uuidv4(),
            type: 'comment' as const,
            content: text,
            author: CURRENT_USER,
            createdAt: new Date().toISOString()
          };
          return { ...m, history: [newComment, ...m.history] };
        }
        return m;
      })
    }));
  }, [url]);

  const deleteMarker = useCallback((id: string) => {
    setMarkersMap((prev) => {
      const currentMarkers = prev[url] || [];
      const filtered = currentMarkers.filter((m) => m.id !== id);
      // Re-numbering logic
      const reordered = filtered.map((m, index) => ({
        ...m,
        number: index + 1,
        color: MARKER_COLORS[index % MARKER_COLORS.length]
      }));
      
      return {
        ...prev,
        [url]: reordered
      };
    });
    if (activeMarkerId === id) {
      setActiveMarkerId(null);
    }
  }, [url, activeMarkerId]);

  const handleUpdatePageMetadata = (updates: Partial<PageMetadata>) => {
    setSiteItems(prev => updateItemByUrl(prev, url, (item) => ({
      ...item,
      metadata: {
        title: updates.title !== undefined ? updates.title : (item.metadata?.title || ""),
        description: updates.description !== undefined ? updates.description : (item.metadata?.description || ""),
        rfNumber: updates.rfNumber !== undefined ? updates.rfNumber : (item.metadata?.rfNumber || ""),
        date: updates.date ? updates.date.toISOString() : item.metadata?.date
      }
    })));
  };

  // Convert SiteItem metadata (string date) to PageMetadata (Date object)
  const currentPageMetadata: PageMetadata = {
    title: activePageItem?.metadata?.title || activePageItem?.name || "",
    description: activePageItem?.metadata?.description || "",
    rfNumber: activePageItem?.metadata?.rfNumber || "",
    date: activePageItem?.metadata?.date ? new Date(activePageItem.metadata.date) : undefined,
    url: activePageItem?.url || url
  };

  // Image metadata for image type items
  const currentImageMetadata: ImageMetadata | undefined = activePageItem?.type === 'image' ? {
    width: activePageItem?.imageMetadata?.width,
    height: activePageItem?.imageMetadata?.height,
    fileSize: activePageItem?.imageMetadata?.fileSize,
    insertedAt: activePageItem?.imageMetadata?.insertedAt ? new Date(activePageItem.imageMetadata.insertedAt) : 
                activePageItem?.metadata?.date ? new Date(activePageItem.metadata.date) : new Date(),
    uploadedBy: activePageItem?.imageMetadata?.uploadedBy || {
      name: 'Current User',
      avatar: undefined
    }
  } : undefined;

  // Drag and Drop Handler
  const handleMoveItem = (activeId: string, overId: string) => {
    setSiteItems((items) => {
      // 1. Find and remove active item
      const { items: itemsWithoutActive, removed: activeItem } = removeItemFromTree(items, activeId);
      if (!activeItem) return items;

      // 2. Find over item (target)
      // Check if we are dropping ON a folder -> Insert INSIDE
      // Check if we are dropping ON a file -> Insert AFTER (sibling)
      
      // Simple logic: Flatten tree to find target type
      const findItem = (list: SiteItem[], id: string): SiteItem | undefined => {
        for (const i of list) {
          if (i.id === id) return i;
          if (i.children) {
            const found = findItem(i.children, id);
            if (found) return found;
          }
        }
      };
      
      const overItem = findItem(items, overId);
      
      if (!overItem) {
        // Should not happen if logic is correct, fallback push to end
        return [...itemsWithoutActive, activeItem];
      }

      if (overItem.type === 'folder') {
        // Drop into folder
        return insertItemIntoTree(itemsWithoutActive, overId, activeItem, 'inside');
      } else {
        // Reorder sibling: insert after 'overItem'
        return insertItemIntoTree(itemsWithoutActive, overId, activeItem, 'after');
      }
    });
  };

  return (
    <div className="w-full h-screen bg-background overflow-hidden flex flex-col">
      {/* Planner Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-background z-10">
        <div className="flex items-center gap-4">
          <Link href="/projects">
             <Button variant="ghost" size="icon" className="h-8 w-8">
               <ChevronLeft className="w-4 h-4" />
             </Button>
          </Link>
          <Button 
            variant={url.startsWith('dashboard:') ? "secondary" : "ghost"} 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setUrl('dashboard:')}
            title="Project Overview"
          >
            <LayoutDashboard className="w-4 h-4" />
          </Button>
          <div className="flex flex-col">
             <h1 className="text-sm font-semibold flex items-center gap-2">
               Illunex Redesign 
               <span className="text-muted-foreground font-normal">/</span>
               WebApp
             </h1>
             <span className="text-[10px] text-muted-foreground">Last edited just now</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
           {/* Team Avatars */}
           <div className="flex items-center -space-x-2 mr-2">
             {TEAM_MEMBERS.map((user) => (
               <Avatar key={user.id} className="w-8 h-8 border-2 border-background ring-1 ring-border/20">
                 <AvatarImage src={user.avatar} />
                 <AvatarFallback>{user.name.substring(0,2)}</AvatarFallback>
               </Avatar>
             ))}
             <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium text-muted-foreground ring-1 ring-border/20">
               +2
             </div>
           </div>
           
           <div className="h-4 w-px bg-border mx-1" />
           
           <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
             <Share2 className="w-3.5 h-3.5" />
             Share
           </Button>
           <Button variant="ghost" size="icon" className="h-8 w-8">
             <MoreHorizontal className="w-4 h-4" />
           </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={75} minSize={50}>
          {url.startsWith('dashboard:') ? (
            <ProjectDashboard
              projectName="Illunex Redesign"
              projectDescription="Enterprise value chain platform redesign project. Modern UI/UX overhaul with responsive design and improved user experience."
              featuredImage={projectFeaturedImage}
              teamMembers={TEAM_MEMBERS.map(m => ({ ...m, role: m.id === 'u1' ? 'Designer' : m.id === 'u2' ? 'Project Manager' : 'Developer' }))}
              stats={{
                totalPages: countItemsByType(siteItems, 'page') + countItemsByType(siteItems, 'image'),
                totalFlows: countItemsByType(siteItems, 'flow'),
                totalPresentations: countItemsByType(siteItems, 'ppt'),
                totalAssets: countItemsByType(siteItems, 'image'),
                totalIssues: Object.values(markersMap).flat().length,
                resolvedIssues: Object.values(markersMap).flat().filter(m => m.status === 'done').length
              }}
              recentActivities={[
                { id: '1', user: TEAM_MEMBERS[0], action: 'updated', target: 'Home Page', time: '2 minutes ago' },
                { id: '2', user: TEAM_MEMBERS[1], action: 'added comment on', target: 'Login Screen', time: '15 minutes ago' },
                { id: '3', user: TEAM_MEMBERS[2], action: 'created', target: 'User Flow', time: '1 hour ago' },
              ]}
              flows={collectItemsByType(siteItems, 'flow').map(item => ({
                id: item.id,
                name: item.name,
                description: item.metadata?.description
              }))}
              presentations={collectItemsByType(siteItems, 'ppt').map(item => ({
                id: item.id,
                name: item.name,
                slideCount: presentationsData[item.id]?.length || 0
              }))}
              projectStartDate="November 15, 2025"
              lastModifiedDate="Just now"
              changeLogs={[
                { id: 'c1', user: TEAM_MEMBERS[0], action: 'added new flow', target: 'User Onboarding', time: '10 minutes ago', details: 'Created initial user registration flow with 5 screens' },
                { id: 'c2', user: TEAM_MEMBERS[1], action: 'updated', target: 'Product Roadmap PPT', time: '1 hour ago', details: 'Added Q1 2026 milestones' },
                { id: 'c3', user: TEAM_MEMBERS[2], action: 'fixed issue on', target: 'Login Screen', time: '2 hours ago', details: 'Resolved mobile viewport alignment issue' },
              ]}
              onNavigateToItem={(type, id) => {
                if (id) {
                  const item = findItemById(siteItems, id);
                  if (item) handleSelectItem(item);
                } else {
                  const firstItem = findFirstItemByType(siteItems, type);
                  if (firstItem) handleSelectItem(firstItem);
                }
              }}
              onChangeFeaturedImage={setProjectFeaturedImage}
            />
          ) : url.startsWith('flow:') ? (
              <FlowCanvas 
                flowId={url.replace('flow:', '')}
                availableItems={siteItems}
                initialNodes={flowsData[url.replace('flow:', '')]?.nodes}
                initialEdges={flowsData[url.replace('flow:', '')]?.edges}
                onSelectionChange={handleFlowSelectionChange}
                onNodesUpdate={handleFlowNodesUpdate}
              />
            ) : url.startsWith('ppt:') ? (
              <PresentationCanvas
                presentationId={url.replace('ppt:', '')}
                slides={getCurrentPresentationSlides(url.replace('ppt:', ''))}
                onSlidesChange={(slides) => handlePresentationSlidesChange(url.replace('ppt:', ''), slides)}
                initialSections={getCurrentPresentationSections(url.replace('ppt:', ''))}
                onActiveSlideChange={setActivePptSlideIndex}
                onMarkerSelect={setSelectedPptMarkerId}
                selectedMarkerId={selectedPptMarkerId}
                onComponentSelect={(component) => {
                  setSelectedPptComponent(component);
                  setSelectedPptComponentId(component?.id || null);
                }}
                selectedComponentId={selectedPptComponentId}
              />
            ) : (
              <BrowserCanvas 
                url={url} 
                setUrl={handleSetUrl} 
                markers={markers}
                onAddMarker={addMarker}
                activeMarkerId={activeMarkerId}
                onMarkerClick={setActiveMarkerId}
                onPageLoad={handlePageLoad}
                contentType={activePageItem?.type === 'image' ? 'image' : 'url'}
                onCapture={handleCapture}
              />
            )}
          </ResizablePanel>
          
          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
          <ResizablePanelGroup direction={sidePanelDirection}>
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="h-full flex flex-col">
                <div className="shrink-0 flex items-center justify-end p-1 border-b bg-muted/30">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setSidePanelDirection(prev => prev === 'vertical' ? 'horizontal' : 'vertical')}
                    title={sidePanelDirection === 'vertical' ? 'Switch to side-by-side layout' : 'Switch to stacked layout'}
                  >
                    {sidePanelDirection === 'vertical' ? (
                      <Columns2 className="w-3.5 h-3.5" />
                    ) : (
                      <Rows2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <SiteMapPanel 
                    items={siteItems}
                    activeUrl={url}
                    onSelectItem={handleSelectItem}
                    onAddItem={handleAddItem}
                    onDeleteItem={handleDeleteItem}
                    onToggleFolder={handleToggleFolder}
                    getMarkerCount={getMarkerCount}
                    onMoveItem={handleMoveItem}
                  />
                </div>
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={50} minSize={20}>
              {url.startsWith('dashboard:') ? (
                (() => {
                  const PROJECT_STATUSES = [
                    { value: 'planning', label: 'Planning', color: 'bg-blue-500' },
                    { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-500' },
                    { value: 'review', label: 'Review', color: 'bg-purple-500' },
                    { value: 'completed', label: 'Completed', color: 'bg-green-500' },
                    { value: 'on_hold', label: 'On Hold', color: 'bg-gray-500' },
                  ];
                  
                  const ACCESS_LEVELS = [
                    { value: 'owner', label: 'Owner', icon: Shield },
                    { value: 'editor', label: 'Editor', icon: Pencil },
                    { value: 'viewer', label: 'Viewer', icon: Users },
                  ];
                  
                  const currentStatus = PROJECT_STATUSES.find(s => s.value === projectStatus) || PROJECT_STATUSES[0];
                  
                  return (
                    <div className="h-full flex flex-col bg-card border-l border-border">
                      <div className="shrink-0 p-4 border-b border-border space-y-3 bg-muted/10">
                        <div className="flex items-center gap-2 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          Project Overview
                        </div>
                      </div>
                      <ScrollArea className="flex-1">
                        <div className="p-4 space-y-6">
                          {/* Project Name */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase">Project Name</Label>
                            <Input
                              value={projectName}
                              onChange={(e) => setProjectName(e.target.value)}
                              className="font-semibold text-lg"
                              placeholder="Enter project name..."
                            />
                          </div>
                          
                          {/* Project Description */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase">Description</Label>
                            <textarea
                              value={projectDescription}
                              onChange={(e) => setProjectDescription(e.target.value)}
                              className="w-full min-h-[80px] p-2 text-sm bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                              placeholder="Describe your project..."
                            />
                          </div>
                          
                          {/* Project Status */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Status
                            </Label>
                            <Select value={projectStatus} onValueChange={setProjectStatus}>
                              <SelectTrigger className="w-full">
                                <SelectValue>
                                  <span className="flex items-center gap-2">
                                    <span className={cn("w-2 h-2 rounded-full", currentStatus.color)} />
                                    {currentStatus.label}
                                  </span>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {PROJECT_STATUSES.map((status) => (
                                  <SelectItem key={status.value} value={status.value}>
                                    <span className="flex items-center gap-2">
                                      <span className={cn("w-2 h-2 rounded-full", status.color)} />
                                      {status.label}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Tags */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              Tags
                            </Label>
                            <div className="flex flex-wrap gap-2">
                              {projectTags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                                >
                                  {tag}
                                  <button
                                    onClick={() => setProjectTags(projectTags.filter((_, i) => i !== index))}
                                    className="hover:text-destructive"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                              <button
                                onClick={() => {
                                  const newTag = prompt('Enter new tag:');
                                  if (newTag?.trim()) {
                                    setProjectTags([...projectTags, newTag.trim()]);
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-dashed border-muted-foreground/50 text-muted-foreground rounded-full hover:border-primary hover:text-primary transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                                Add Tag
                              </button>
                            </div>
                          </div>
                          
                          {/* Team Members */}
                          <div className="space-y-3">
                            <Label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Team Members
                            </Label>
                            <div className="space-y-2">
                              {projectMembers.map((member) => {
                                const accessLevel = ACCESS_LEVELS.find(a => a.value === member.access) || ACCESS_LEVELS[2];
                                const AccessIcon = accessLevel.icon;
                                return (
                                  <div key={member.user.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={member.user.avatar} />
                                        <AvatarFallback className="text-xs">{member.user.name.substring(0, 2)}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-sm font-medium">{member.user.name}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                          <AccessIcon className="w-3 h-3" />
                                          {accessLevel.label}
                                        </p>
                                      </div>
                                    </div>
                                    <Select 
                                      value={member.access}
                                      onValueChange={(value) => {
                                        setProjectMembers(projectMembers.map(m =>
                                          m.user.id === member.user.id ? { ...m, access: value as 'owner' | 'editor' | 'viewer' } : m
                                        ));
                                      }}
                                    >
                                      <SelectTrigger className="w-24 h-7 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {ACCESS_LEVELS.map((level) => (
                                          <SelectItem key={level.value} value={level.value}>
                                            <span className="flex items-center gap-1">
                                              <level.icon className="w-3 h-3" />
                                              {level.label}
                                            </span>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                        </div>
                      </ScrollArea>
                    </div>
                  );
                })()
              ) : url.startsWith('flow:') ? (
                <FlowPropertiesPanel
                  selectedNodes={selectedFlowNodes}
                  allNodes={allFlowNodes}
                  selectedEdges={selectedFlowEdges}
                  allEdges={allFlowEdges}
                  onUpdateNode={handleUpdateFlowNode}
                  onRemoveFromGroup={handleRemoveFromGroup}
                  onAddToGroup={handleAddToGroup}
                  onUpdateEdge={handleUpdateFlowEdge}
                />
              ) : url.startsWith('ppt:') ? (
                (() => {
                  const presentationId = url.replace('ppt:', '');
                  const slides = getCurrentPresentationSlides(presentationId);
                  const activeSlide = slides[activePptSlideIndex];
                  const slideMarkers = activeSlide?.markers || [];

                  // Convert slide markers to Marker type for SpecPanel
                  const convertedMarkers = slideMarkers.map(m => ({
                    id: m.id,
                    number: m.number,
                    x: m.x,
                    y: m.y,
                    label: m.label || '',
                    description: m.label || '',
                    color: '#3b82f6',
                    status: (m.status || 'pending') as 'pending' | 'in_progress' | 'done' | 'hold',
                    type: 'annotation' as const,
                    authorId: m.authorId,
                    authorName: m.authorName,
                    createdAt: m.createdAt,
                    comments: m.comments || [],
                    history: m.history || [],
                    author: {
                      id: m.authorId,
                      name: m.authorName,
                      avatar: m.authorAvatar
                    }
                  }));

                  const handleUpdatePptComponent = (componentId: string, updates: any) => {
                    if (!activeSlide) return;

                    let updatedSlide = { ...activeSlide };

                    // Find and update the component
                    if (selectedPptComponent?.type === 'image') {
                      updatedSlide.images = activeSlide.images.map(img =>
                        img.id === componentId ? { ...img, ...updates } : img
                      );
                    } else if (selectedPptComponent?.type === 'line' || selectedPptComponent?.type === 'shape') {
                      updatedSlide.shapes = (activeSlide.shapes || []).map(s =>
                        s.id === componentId ? { ...s, ...updates } : s
                      );
                    } else if (selectedPptComponent?.type === 'link') {
                      updatedSlide.links = (activeSlide.links || []).map(l =>
                        l.id === componentId ? { ...l, ...updates } : l
                      );
                    } else if (selectedPptComponent?.type === 'memo') {
                      updatedSlide.memos = (activeSlide.memos || []).map(m =>
                        m.id === componentId ? { ...m, ...updates } : m
                      );
                    } else if (selectedPptComponent?.type === 'reference') {
                      updatedSlide.references = (activeSlide.references || []).map(r =>
                        r.id === componentId ? { ...r, ...updates } : r
                      );
                    }

                    const newSlides = slides.map((s, i) =>
                      i === activePptSlideIndex ? updatedSlide : s
                    );
                    handlePresentationSlidesChange(presentationId, newSlides);
                    
                    // Update selected component state
                    if (selectedPptComponent) {
                      setSelectedPptComponent({ ...selectedPptComponent, ...updates });
                    }
                  };

                  const handleDeletePptComponent = (componentId: string) => {
                    if (!activeSlide || !selectedPptComponent) return;

                    let updatedSlide = { ...activeSlide };

                    if (selectedPptComponent.type === 'image') {
                      updatedSlide.images = activeSlide.images.filter(img => img.id !== componentId);
                    } else if (selectedPptComponent.type === 'line' || selectedPptComponent.type === 'shape') {
                      updatedSlide.shapes = (activeSlide.shapes || []).filter(s => s.id !== componentId);
                    } else if (selectedPptComponent.type === 'link') {
                      updatedSlide.links = (activeSlide.links || []).filter(l => l.id !== componentId);
                    } else if (selectedPptComponent.type === 'memo') {
                      updatedSlide.memos = (activeSlide.memos || []).filter(m => m.id !== componentId);
                    } else if (selectedPptComponent.type === 'reference') {
                      updatedSlide.references = (activeSlide.references || []).filter(r => r.id !== componentId);
                    }

                    const newSlides = slides.map((s, i) =>
                      i === activePptSlideIndex ? updatedSlide : s
                    );
                    handlePresentationSlidesChange(presentationId, newSlides);
                    setSelectedPptComponent(null);
                    setSelectedPptComponentId(null);
                  };

                  const handleUpdatePptMarker = (markerId: string, updates: any) => {
                    if (!activeSlide) return;
                    const updatedMarkers = slideMarkers.map(m =>
                      m.id === markerId ? { ...m, ...updates, label: updates.description || m.label } : m
                    );
                    const updatedSlide = { ...activeSlide, markers: updatedMarkers };
                    const newSlides = slides.map((s, i) =>
                      i === activePptSlideIndex ? updatedSlide : s
                    );
                    handlePresentationSlidesChange(presentationId, newSlides);
                  };

                  const handleDeletePptMarker = (markerId: string) => {
                    if (!activeSlide) return;
                    const updatedMarkers = slideMarkers.filter(m => m.id !== markerId)
                      .map((m, i) => ({ ...m, number: i + 1 }));
                    const updatedSlide = { ...activeSlide, markers: updatedMarkers };
                    const newSlides = slides.map((s, i) =>
                      i === activePptSlideIndex ? updatedSlide : s
                    );
                    handlePresentationSlidesChange(presentationId, newSlides);
                    if (selectedPptMarkerId === markerId) {
                      setSelectedPptMarkerId(null);
                    }
                  };

                  const handleAddPptComment = (markerId: string, text: string) => {
                    if (!activeSlide || !text.trim()) return;
                    const marker = slideMarkers.find(m => m.id === markerId);
                    if (!marker) return;
                    const newComment = {
                      id: uuidv4(),
                      userId: 'u1',
                      userName: 'Current User',
                      text: text.trim(),
                      createdAt: new Date().toISOString()
                    };
                    handleUpdatePptMarker(markerId, {
                      comments: [...(marker.comments || []), newComment]
                    });
                  };

                  return (
                    <SpecPanel
                      markers={convertedMarkers}
                      activeMarkerId={selectedPptMarkerId}
                      pageMetadata={{
                        title: activeSlide?.title || `Slide ${activePptSlideIndex + 1}`,
                        description: '',
                        rfNumber: `Slide ${activePptSlideIndex + 1}`,
                        date: undefined,
                      }}
                      onUpdatePageMetadata={(updates) => {
                        if (!activeSlide || !updates.title) return;
                        const updatedSlide = { ...activeSlide, title: updates.title };
                        const newSlides = slides.map((s, i) =>
                          i === activePptSlideIndex ? updatedSlide : s
                        );
                        handlePresentationSlidesChange(presentationId, newSlides);
                      }}
                      onUpdateMarker={handleUpdatePptMarker}
                      onDeleteMarker={handleDeletePptMarker}
                      onSelectMarker={setSelectedPptMarkerId}
                      onAddComment={handleAddPptComment}
                      contentType="presentation"
                      selectedComponent={selectedPptComponent}
                      onUpdateComponent={handleUpdatePptComponent}
                      onDeleteComponent={handleDeletePptComponent}
                    />
                  );
                })()
              ) : (
                <SpecPanel 
                  markers={markers}
                  activeMarkerId={activeMarkerId}
                  pageMetadata={currentPageMetadata}
                  onUpdatePageMetadata={handleUpdatePageMetadata}
                  onUpdateMarker={updateMarker}
                  onDeleteMarker={deleteMarker}
                  onSelectMarker={setActiveMarkerId}
                  onAddComment={addComment}
                  onNavigate={handleNavigate}
                  contentType={activePageItem?.type === 'image' ? 'image' : 'url'}
                  imageMetadata={currentImageMetadata}
                />
              )}
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>

      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add New {addItemData?.type === 'ppt' ? 'Presentation' : addItemData?.type}
            </DialogTitle>
            <DialogDescription>
              Enter the details for the new {addItemData?.type === 'ppt' ? 'presentation' : addItemData?.type}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`Enter ${addItemData?.type === 'ppt' ? 'presentation' : addItemData?.type} name`}
                onKeyDown={(e) => e.key === 'Enter' && confirmAddItem()}
              />
            </div>
            {(addItemData?.type === 'flow' || addItemData?.type === 'ppt') && !addItemData?.parentId && (
              <div className="grid gap-2">
                <Label htmlFor="add-folder-select">Save to Folder</Label>
                <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                  <SelectTrigger id="add-folder-select">
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllFolders(siteItems).map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {addItemData?.type !== 'folder' && addItemData?.type !== 'flow' && addItemData?.type !== 'ppt' && (
              <div className="grid gap-2">
                <Label htmlFor="url">
                  {addItemData?.type === 'image' ? 'Image URL' : 'Page URL'}
                </Label>
                <Input
                  id="url"
                  value={newItemUrl}
                  onChange={(e) => setNewItemUrl(e.target.value)}
                  placeholder={addItemData?.type === 'image' ? "https://placeholder.com/image.png" : "https://"}
                  onKeyDown={(e) => e.key === 'Enter' && confirmAddItem()}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmAddItem}>
              Add {addItemData?.type === 'ppt' ? 'Presentation' : addItemData?.type}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Capture Save Dialog */}
      <Dialog open={isCaptureDialogOpen} onOpenChange={setIsCaptureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Capture</DialogTitle>
            <DialogDescription>
              Save the captured screen to your project folders.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="capture-name">Name</Label>
              <Input
                id="capture-name"
                value={captureName}
                onChange={(e) => setCaptureName(e.target.value)}
                placeholder="Enter capture name"
                onKeyDown={(e) => e.key === 'Enter' && saveCapture()}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="folder-select">Save to Folder</Label>
              <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                <SelectTrigger id="folder-select">
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  {getAllFolders(siteItems).map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCaptureDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveCapture}>Save Capture</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}