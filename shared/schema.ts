import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const siteItems = pgTable("site_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  type: text("type").notNull(),
  name: text("name").notNull(),
  url: text("url"),
  parentId: varchar("parent_id"),
  order: integer("order").notNull().default(0),
  isOpen: boolean("is_open").default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const markers = pgTable("markers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  siteItemId: varchar("site_item_id").notNull().references(() => siteItems.id, { onDelete: 'cascade' }),
  number: integer("number").notNull(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  type: text("type").notNull().default('default'),
  title: text("title"),
  description: text("description"),
  color: text("color").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  status: text("status").notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const markerHistory = pgTable("marker_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  markerId: varchar("marker_id").notNull().references(() => markers.id, { onDelete: 'cascade' }),
  type: text("type").notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const flowNodes = pgTable("flow_nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  flowId: varchar("flow_id").notNull().references(() => siteItems.id, { onDelete: 'cascade' }),
  nodeId: text("node_id").notNull(),
  type: text("type").notNull(),
  position: jsonb("position").notNull(),
  data: jsonb("data").notNull(),
  style: jsonb("style"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const flowEdges = pgTable("flow_edges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  flowId: varchar("flow_id").notNull().references(() => siteItems.id, { onDelete: 'cascade' }),
  edgeId: text("edge_id").notNull(),
  source: text("source").notNull(),
  target: text("target").notNull(),
  animated: boolean("animated").default(true),
  style: jsonb("style"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  siteItems: many(siteItems),
}));

export const siteItemsRelations = relations(siteItems, ({ one, many }) => ({
  project: one(projects, {
    fields: [siteItems.projectId],
    references: [projects.id],
  }),
  markers: many(markers),
  flowNodes: many(flowNodes),
  flowEdges: many(flowEdges),
}));

export const markersRelations = relations(markers, ({ one, many }) => ({
  siteItem: one(siteItems, {
    fields: [markers.siteItemId],
    references: [siteItems.id],
  }),
  author: one(users, {
    fields: [markers.authorId],
    references: [users.id],
  }),
  history: many(markerHistory),
}));

export const markerHistoryRelations = relations(markerHistory, ({ one }) => ({
  marker: one(markers, {
    fields: [markerHistory.markerId],
    references: [markers.id],
  }),
  author: one(users, {
    fields: [markerHistory.authorId],
    references: [users.id],
  }),
}));

export const flowNodesRelations = relations(flowNodes, ({ one }) => ({
  flow: one(siteItems, {
    fields: [flowNodes.flowId],
    references: [siteItems.id],
  }),
}));

export const flowEdgesRelations = relations(flowEdges, ({ one }) => ({
  flow: one(siteItems, {
    fields: [flowEdges.flowId],
    references: [siteItems.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSiteItemSchema = createInsertSchema(siteItems).omit({
  id: true,
  createdAt: true,
});

export const insertMarkerSchema = createInsertSchema(markers).omit({
  id: true,
  createdAt: true,
});

export const insertMarkerHistorySchema = createInsertSchema(markerHistory).omit({
  id: true,
  createdAt: true,
});

export const insertFlowNodeSchema = createInsertSchema(flowNodes).omit({
  id: true,
  createdAt: true,
});

export const insertFlowEdgeSchema = createInsertSchema(flowEdges).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertSiteItem = z.infer<typeof insertSiteItemSchema>;
export type SiteItem = typeof siteItems.$inferSelect;

export type InsertMarker = z.infer<typeof insertMarkerSchema>;
export type Marker = typeof markers.$inferSelect;

export type InsertMarkerHistory = z.infer<typeof insertMarkerHistorySchema>;
export type MarkerHistory = typeof markerHistory.$inferSelect;

export type InsertFlowNode = z.infer<typeof insertFlowNodeSchema>;
export type FlowNode = typeof flowNodes.$inferSelect;

export type InsertFlowEdge = z.infer<typeof insertFlowEdgeSchema>;
export type FlowEdge = typeof flowEdges.$inferSelect;
