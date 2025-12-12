import { 
  type User, 
  type InsertUser,
  type Project,
  type InsertProject,
  type SiteItem,
  type InsertSiteItem,
  type Marker,
  type InsertMarker,
  type MarkerHistory,
  type InsertMarkerHistory,
  type FlowNode,
  type InsertFlowNode,
  type FlowEdge,
  type InsertFlowEdge,
  users,
  projects,
  siteItems,
  markers,
  markerHistory,
  flowNodes,
  flowEdges
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;
  
  getSiteItemsByProject(projectId: string): Promise<SiteItem[]>;
  getSiteItem(id: string): Promise<SiteItem | undefined>;
  createSiteItem(item: InsertSiteItem): Promise<SiteItem>;
  updateSiteItem(id: string, item: Partial<InsertSiteItem>): Promise<SiteItem | undefined>;
  deleteSiteItem(id: string): Promise<void>;
  
  getMarkersBySiteItem(siteItemId: string): Promise<Marker[]>;
  getMarker(id: string): Promise<Marker | undefined>;
  createMarker(marker: InsertMarker): Promise<Marker>;
  updateMarker(id: string, marker: Partial<InsertMarker>): Promise<Marker | undefined>;
  deleteMarker(id: string): Promise<void>;
  
  getMarkerHistory(markerId: string): Promise<MarkerHistory[]>;
  createMarkerHistory(history: InsertMarkerHistory): Promise<MarkerHistory>;
  
  getFlowNodes(flowId: string): Promise<FlowNode[]>;
  createFlowNode(node: InsertFlowNode): Promise<FlowNode>;
  deleteFlowNodesByFlow(flowId: string): Promise<void>;
  
  getFlowEdges(flowId: string): Promise<FlowEdge[]>;
  createFlowEdge(edge: InsertFlowEdge): Promise<FlowEdge>;
  deleteFlowEdgesByFlow(flowId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.updatedAt));
  }
  
  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }
  
  async updateProject(id: string, updateData: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }
  
  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }
  
  async getSiteItemsByProject(projectId: string): Promise<SiteItem[]> {
    return await db.select().from(siteItems).where(eq(siteItems.projectId, projectId));
  }
  
  async getSiteItem(id: string): Promise<SiteItem | undefined> {
    const [item] = await db.select().from(siteItems).where(eq(siteItems.id, id));
    return item || undefined;
  }
  
  async createSiteItem(insertItem: InsertSiteItem): Promise<SiteItem> {
    const [item] = await db
      .insert(siteItems)
      .values(insertItem)
      .returning();
    return item;
  }
  
  async updateSiteItem(id: string, updateData: Partial<InsertSiteItem>): Promise<SiteItem | undefined> {
    const [item] = await db
      .update(siteItems)
      .set(updateData)
      .where(eq(siteItems.id, id))
      .returning();
    return item || undefined;
  }
  
  async deleteSiteItem(id: string): Promise<void> {
    await db.delete(siteItems).where(eq(siteItems.id, id));
  }
  
  async getMarkersBySiteItem(siteItemId: string): Promise<Marker[]> {
    return await db.select().from(markers).where(eq(markers.siteItemId, siteItemId));
  }
  
  async getMarker(id: string): Promise<Marker | undefined> {
    const [marker] = await db.select().from(markers).where(eq(markers.id, id));
    return marker || undefined;
  }
  
  async createMarker(insertMarker: InsertMarker): Promise<Marker> {
    const [marker] = await db
      .insert(markers)
      .values(insertMarker)
      .returning();
    return marker;
  }
  
  async updateMarker(id: string, updateData: Partial<InsertMarker>): Promise<Marker | undefined> {
    const [marker] = await db
      .update(markers)
      .set(updateData)
      .where(eq(markers.id, id))
      .returning();
    return marker || undefined;
  }
  
  async deleteMarker(id: string): Promise<void> {
    await db.delete(markers).where(eq(markers.id, id));
  }
  
  async getMarkerHistory(markerId: string): Promise<MarkerHistory[]> {
    return await db
      .select()
      .from(markerHistory)
      .where(eq(markerHistory.markerId, markerId))
      .orderBy(desc(markerHistory.createdAt));
  }
  
  async createMarkerHistory(insertHistory: InsertMarkerHistory): Promise<MarkerHistory> {
    const [history] = await db
      .insert(markerHistory)
      .values(insertHistory)
      .returning();
    return history;
  }
  
  async getFlowNodes(flowId: string): Promise<FlowNode[]> {
    return await db.select().from(flowNodes).where(eq(flowNodes.flowId, flowId));
  }
  
  async createFlowNode(insertNode: InsertFlowNode): Promise<FlowNode> {
    const [node] = await db
      .insert(flowNodes)
      .values(insertNode)
      .returning();
    return node;
  }
  
  async deleteFlowNodesByFlow(flowId: string): Promise<void> {
    await db.delete(flowNodes).where(eq(flowNodes.flowId, flowId));
  }
  
  async getFlowEdges(flowId: string): Promise<FlowEdge[]> {
    return await db.select().from(flowEdges).where(eq(flowEdges.flowId, flowId));
  }
  
  async createFlowEdge(insertEdge: InsertFlowEdge): Promise<FlowEdge> {
    const [edge] = await db
      .insert(flowEdges)
      .values(insertEdge)
      .returning();
    return edge;
  }
  
  async deleteFlowEdgesByFlow(flowId: string): Promise<void> {
    await db.delete(flowEdges).where(eq(flowEdges.flowId, flowId));
  }
}

export const storage = new DatabaseStorage();
