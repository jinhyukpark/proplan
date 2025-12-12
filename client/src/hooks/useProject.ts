import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Project, SiteItem } from "@/types";
import { toast } from "sonner";

export function useProject(projectId?: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [siteItems, setSiteItems] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    async function loadProject() {
      if (!projectId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const [projectData, itemsData] = await Promise.all([
          api.projects.get(projectId),
          api.siteItems.getByProject(projectId),
        ]);
        
        setProject(projectData);
        setSiteItems(itemsData);
      } catch (err) {
        console.error("Error loading project:", err);
        setError(err instanceof Error ? err.message : "Failed to load project");
        toast.error("Failed to load project");
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  const createItem = async (item: Omit<SiteItem, "id" | "createdAt">) => {
    try {
      const created = await api.siteItems.create(item);
      setSiteItems(prev => [...prev, created]);
      return created;
    } catch (err) {
      console.error("Error creating item:", err);
      toast.error("Failed to create item");
      throw err;
    }
  };

  const updateItem = async (id: string, data: Partial<SiteItem>) => {
    try {
      const updated = await api.siteItems.update(id, data);
      setSiteItems(prev => prev.map(item => item.id === id ? updated : item));
      return updated;
    } catch (err) {
      console.error("Error updating item:", err);
      toast.error("Failed to update item");
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await api.siteItems.delete(id);
      setSiteItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Error deleting item:", err);
      toast.error("Failed to delete item");
      throw err;
    }
  };

  return {
    project,
    siteItems,
    setSiteItems,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
  };
}
