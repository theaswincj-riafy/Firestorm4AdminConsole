import { type App, type AppFormData } from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for app management
export interface IStorage {
  getApp(id: string): Promise<App | undefined>;
  getApps(): Promise<App[]>;
  createApp(appData: AppFormData): Promise<App>;
  updateApp(id: string, appData: Partial<AppFormData>): Promise<App>;
  deleteApp(id: string): Promise<void>;
  getAppConfig(id: string): Promise<any>;
  saveAppConfig(id: string, config: any): Promise<{ saved: boolean; revisedAt: string }>;
}

export class MemStorage implements IStorage {
  private apps: Map<string, App>;
  private configs: Map<string, any>;

  constructor() {
    this.apps = new Map();
    this.configs = new Map();
  }

  async getApp(id: string): Promise<App | undefined> {
    return this.apps.get(id);
  }

  async getApps(): Promise<App[]> {
    return Array.from(this.apps.values());
  }

  async createApp(appData: AppFormData): Promise<App> {
    const id = 'app-' + randomUUID();
    const app: App = {
      appId: id,
      appName: appData.appName,
      packageName: appData.packageName,
      meta: {
        description: appData.appDescription || '',
        playUrl: appData.playUrl || '',
        appStoreUrl: appData.appStoreUrl || ''
      }
    };
    this.apps.set(id, app);
    return app;
  }

  async updateApp(id: string, appData: Partial<AppFormData>): Promise<App> {
    const existingApp = this.apps.get(id);
    if (!existingApp) {
      throw new Error('App not found');
    }

    const updatedApp: App = {
      ...existingApp,
      ...(appData.appName && { appName: appData.appName }),
      ...(appData.packageName && { packageName: appData.packageName }),
      meta: {
        ...existingApp.meta,
        ...(appData.appDescription !== undefined && { description: appData.appDescription }),
        ...(appData.playUrl !== undefined && { playUrl: appData.playUrl }),
        ...(appData.appStoreUrl !== undefined && { appStoreUrl: appData.appStoreUrl })
      }
    };

    this.apps.set(id, updatedApp);
    return updatedApp;
  }

  async deleteApp(id: string): Promise<void> {
    this.apps.delete(id);
    this.configs.delete(id);
  }

  async getAppConfig(id: string): Promise<any> {
    return this.configs.get(id) || null;
  }

  async saveAppConfig(id: string, config: any): Promise<{ saved: boolean; revisedAt: string }> {
    this.configs.set(id, config);
    return { saved: true, revisedAt: new Date().toISOString() };
  }
}

export const storage = new MemStorage();
