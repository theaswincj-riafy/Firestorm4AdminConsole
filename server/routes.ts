import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apps API endpoints
  app.get('/api/apps', async (req, res) => {
    try {
      const apps = await storage.getApps();
      res.json(apps);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get apps' });
    }
  });

  app.post('/api/apps', async (req, res) => {
    try {
      const app = await storage.createApp(req.body);
      res.json(app);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create app' });
    }
  });

  app.patch('/api/apps/:id', async (req, res) => {
    try {
      const app = await storage.updateApp(req.params.id, req.body);
      res.json(app);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update app' });
    }
  });

  app.delete('/api/apps/:id', async (req, res) => {
    try {
      await storage.deleteApp(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: 'Failed to delete app' });
    }
  });

  app.get('/api/apps/:id/config', async (req, res) => {
    try {
      const config = await storage.getAppConfig(req.params.id);
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get app config' });
    }
  });

  app.post('/api/apps/:id/config', async (req, res) => {
    try {
      const result = await storage.saveAppConfig(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: 'Failed to save app config' });
    }
  });

  // Simulation endpoints for regenerate and translate
  app.post('/api/apps/:id/regenerate', async (req, res) => {
    try {
      const { tabKey, currentSubtree } = req.body;
      // Simulate regeneration
      const regenerated = JSON.parse(JSON.stringify(currentSubtree));
      if (regenerated.title) {
        regenerated.title += ' (Regenerated)';
      }
      if (regenerated.hero?.title) {
        regenerated.hero.title += ' (Regenerated)';
      }
      if (regenerated.header?.title) {
        regenerated.header.title += ' (Regenerated)';
      }
      
      setTimeout(() => {
        res.json({ tabKey, newSubtree: regenerated });
      }, 800);
    } catch (error) {
      res.status(400).json({ message: 'Failed to regenerate tab' });
    }
  });

  app.post('/api/apps/:id/translate', async (req, res) => {
    try {
      const { lang } = req.body;
      // Simulate translation delay
      setTimeout(() => {
        res.json({ lang, status: 'done' });
      }, 2000 + Math.random() * 1000);
    } catch (error) {
      res.status(400).json({ message: 'Failed to translate config' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
