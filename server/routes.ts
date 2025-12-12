import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProjectSchema, 
  insertSiteItemSchema, 
  insertMarkerSchema,
  insertMarkerHistorySchema,
  insertFlowNodeSchema,
  insertFlowEdgeSchema
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error getting projects:", error);
      res.status(500).json({ error: "Failed to get projects" });
    }
  });
  
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error getting project:", error);
      res.status(500).json({ error: "Failed to get project" });
    }
  });
  
  app.post("/api/projects", async (req, res) => {
    try {
      const validated = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validated);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ error: "Failed to create project" });
    }
  });
  
  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.updateProject(req.params.id, req.body);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(400).json({ error: "Failed to update project" });
    }
  });
  
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });
  
  // Site item routes
  app.get("/api/projects/:projectId/items", async (req, res) => {
    try {
      const items = await storage.getSiteItemsByProject(req.params.projectId);
      res.json(items);
    } catch (error) {
      console.error("Error getting site items:", error);
      res.status(500).json({ error: "Failed to get site items" });
    }
  });
  
  app.get("/api/items/:id", async (req, res) => {
    try {
      const item = await storage.getSiteItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Site item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error getting site item:", error);
      res.status(500).json({ error: "Failed to get site item" });
    }
  });
  
  app.post("/api/items", async (req, res) => {
    try {
      const validated = insertSiteItemSchema.parse(req.body);
      const item = await storage.createSiteItem(validated);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating site item:", error);
      res.status(400).json({ error: "Failed to create site item" });
    }
  });
  
  app.patch("/api/items/:id", async (req, res) => {
    try {
      const item = await storage.updateSiteItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ error: "Site item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating site item:", error);
      res.status(400).json({ error: "Failed to update site item" });
    }
  });
  
  app.delete("/api/items/:id", async (req, res) => {
    try {
      await storage.deleteSiteItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting site item:", error);
      res.status(500).json({ error: "Failed to delete site item" });
    }
  });
  
  // Marker routes
  app.get("/api/items/:itemId/markers", async (req, res) => {
    try {
      const markers = await storage.getMarkersBySiteItem(req.params.itemId);
      res.json(markers);
    } catch (error) {
      console.error("Error getting markers:", error);
      res.status(500).json({ error: "Failed to get markers" });
    }
  });
  
  app.get("/api/markers/:id", async (req, res) => {
    try {
      const marker = await storage.getMarker(req.params.id);
      if (!marker) {
        return res.status(404).json({ error: "Marker not found" });
      }
      res.json(marker);
    } catch (error) {
      console.error("Error getting marker:", error);
      res.status(500).json({ error: "Failed to get marker" });
    }
  });
  
  app.post("/api/markers", async (req, res) => {
    try {
      const validated = insertMarkerSchema.parse(req.body);
      const marker = await storage.createMarker(validated);
      res.status(201).json(marker);
    } catch (error) {
      console.error("Error creating marker:", error);
      res.status(400).json({ error: "Failed to create marker" });
    }
  });
  
  app.patch("/api/markers/:id", async (req, res) => {
    try {
      const marker = await storage.updateMarker(req.params.id, req.body);
      if (!marker) {
        return res.status(404).json({ error: "Marker not found" });
      }
      res.json(marker);
    } catch (error) {
      console.error("Error updating marker:", error);
      res.status(400).json({ error: "Failed to update marker" });
    }
  });
  
  app.delete("/api/markers/:id", async (req, res) => {
    try {
      await storage.deleteMarker(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting marker:", error);
      res.status(500).json({ error: "Failed to delete marker" });
    }
  });
  
  // Marker history routes
  app.get("/api/markers/:markerId/history", async (req, res) => {
    try {
      const history = await storage.getMarkerHistory(req.params.markerId);
      res.json(history);
    } catch (error) {
      console.error("Error getting marker history:", error);
      res.status(500).json({ error: "Failed to get marker history" });
    }
  });
  
  app.post("/api/markers/:markerId/history", async (req, res) => {
    try {
      const validated = insertMarkerHistorySchema.parse({
        ...req.body,
        markerId: req.params.markerId
      });
      const history = await storage.createMarkerHistory(validated);
      res.status(201).json(history);
    } catch (error) {
      console.error("Error creating marker history:", error);
      res.status(400).json({ error: "Failed to create marker history" });
    }
  });
  
  // Flow routes
  app.get("/api/flows/:flowId/nodes", async (req, res) => {
    try {
      const nodes = await storage.getFlowNodes(req.params.flowId);
      res.json(nodes);
    } catch (error) {
      console.error("Error getting flow nodes:", error);
      res.status(500).json({ error: "Failed to get flow nodes" });
    }
  });
  
  app.get("/api/flows/:flowId/edges", async (req, res) => {
    try {
      const edges = await storage.getFlowEdges(req.params.flowId);
      res.json(edges);
    } catch (error) {
      console.error("Error getting flow edges:", error);
      res.status(500).json({ error: "Failed to get flow edges" });
    }
  });
  
  app.post("/api/flows/:flowId/save", async (req, res) => {
    try {
      const { nodes, edges } = req.body;
      
      // Delete existing nodes and edges for this flow
      await storage.deleteFlowNodesByFlow(req.params.flowId);
      await storage.deleteFlowEdgesByFlow(req.params.flowId);
      
      // Create new nodes
      const createdNodes = [];
      for (const node of nodes) {
        const validated = insertFlowNodeSchema.parse({
          flowId: req.params.flowId,
          nodeId: node.id,
          type: node.type,
          position: node.position,
          data: node.data,
          style: node.style || null
        });
        const created = await storage.createFlowNode(validated);
        createdNodes.push(created);
      }
      
      // Create new edges
      const createdEdges = [];
      for (const edge of edges) {
        const validated = insertFlowEdgeSchema.parse({
          flowId: req.params.flowId,
          edgeId: edge.id,
          source: edge.source,
          target: edge.target,
          animated: edge.animated !== false,
          style: edge.style || null
        });
        const created = await storage.createFlowEdge(validated);
        createdEdges.push(created);
      }
      
      res.json({ nodes: createdNodes, edges: createdEdges });
    } catch (error) {
      console.error("Error saving flow:", error);
      res.status(400).json({ error: "Failed to save flow" });
    }
  });

  return httpServer;
}
