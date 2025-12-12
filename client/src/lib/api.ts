import type { Project, SiteItem, Marker, MarkerHistory, FlowNode, FlowEdge } from "@/types";
import type { Node, Edge } from "reactflow";

const API_BASE = "/api";

async function fetchAPI(url: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  projects: {
    getAll: () => fetchAPI("/projects") as Promise<Project[]>,
    get: (id: string) => fetchAPI(`/projects/${id}`) as Promise<Project>,
    create: (data: { name: string }) => fetchAPI("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }) as Promise<Project>,
    update: (id: string, data: Partial<{ name: string }>) => fetchAPI(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }) as Promise<Project>,
    delete: (id: string) => fetchAPI(`/projects/${id}`, {
      method: "DELETE",
    }),
  },

  siteItems: {
    getByProject: (projectId: string) => fetchAPI(`/projects/${projectId}/items`) as Promise<SiteItem[]>,
    get: (id: string) => fetchAPI(`/items/${id}`) as Promise<SiteItem>,
    create: (data: Omit<SiteItem, "id" | "createdAt">) => fetchAPI("/items", {
      method: "POST",
      body: JSON.stringify(data),
    }) as Promise<SiteItem>,
    update: (id: string, data: Partial<SiteItem>) => fetchAPI(`/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }) as Promise<SiteItem>,
    delete: (id: string) => fetchAPI(`/items/${id}`, {
      method: "DELETE",
    }),
  },

  markers: {
    getBySiteItem: (itemId: string) => fetchAPI(`/items/${itemId}/markers`) as Promise<Marker[]>,
    get: (id: string) => fetchAPI(`/markers/${id}`) as Promise<Marker>,
    create: (data: Omit<Marker, "id" | "createdAt">) => fetchAPI("/markers", {
      method: "POST",
      body: JSON.stringify(data),
    }) as Promise<Marker>,
    update: (id: string, data: Partial<Marker>) => fetchAPI(`/markers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }) as Promise<Marker>,
    delete: (id: string) => fetchAPI(`/markers/${id}`, {
      method: "DELETE",
    }),
  },

  markerHistory: {
    get: (markerId: string) => fetchAPI(`/markers/${markerId}/history`) as Promise<MarkerHistory[]>,
    create: (markerId: string, data: { type: string; content: string; authorId: string }) => 
      fetchAPI(`/markers/${markerId}/history`, {
        method: "POST",
        body: JSON.stringify(data),
      }) as Promise<MarkerHistory>,
  },

  flows: {
    getNodes: (flowId: string) => fetchAPI(`/flows/${flowId}/nodes`) as Promise<FlowNode[]>,
    getEdges: (flowId: string) => fetchAPI(`/flows/${flowId}/edges`) as Promise<FlowEdge[]>,
    save: (flowId: string, nodes: Node[], edges: Edge[]) => fetchAPI(`/flows/${flowId}/save`, {
      method: "POST",
      body: JSON.stringify({ nodes, edges }),
    }) as Promise<{ nodes: FlowNode[]; edges: FlowEdge[] }>,
  },
};
