import { REFERRAL_DATA } from './referral-data';
import type { App, AppFormData } from '@/types/app';

class AdminApiService {
  private apps: App[] = [
    {
      appId: 'demo-1',
      appName: 'Demo Referral App',
      packageName: 'com.demo.referral',
      meta: {
        description: 'A sample referral application',
        playUrl: 'https://play.google.com/store/apps/details?id=com.demo.referral',
        appStoreUrl: 'https://apps.apple.com/app/demo-referral-app/id123456789'
      }
    }
  ];

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getApps(): Promise<App[]> {
    await this.delay(300);
    return [...this.apps];
  }

  async createApp(appData: AppFormData): Promise<App> {
    await this.delay(500);
    
    const newApp: App = {
      appId: 'app-' + Date.now(),
      appName: appData.appName,
      packageName: appData.packageName,
      meta: {
        description: appData.appDescription || '',
        playUrl: appData.playUrl || '',
        appStoreUrl: appData.appStoreUrl || ''
      }
    };
    
    this.apps.push(newApp);
    return newApp;
  }

  async updateApp(appId: string, appData: Partial<AppFormData>): Promise<App> {
    await this.delay(300);
    
    const index = this.apps.findIndex(app => app.appId === appId);
    if (index === -1) {
      throw new Error('App not found');
    }
    
    const updatedApp: App = {
      ...this.apps[index],
      ...(appData.appName && { appName: appData.appName }),
      ...(appData.packageName && { packageName: appData.packageName }),
      meta: {
        ...this.apps[index].meta,
        ...(appData.appDescription !== undefined && { description: appData.appDescription }),
        ...(appData.playUrl !== undefined && { playUrl: appData.playUrl }),
        ...(appData.appStoreUrl !== undefined && { appStoreUrl: appData.appStoreUrl })
      }
    };
    
    this.apps[index] = updatedApp;
    return updatedApp;
  }

  async deleteApp(appId: string): Promise<void> {
    await this.delay(300);
    this.apps = this.apps.filter(app => app.appId !== appId);
  }

  async getAppConfig(appId: string): Promise<any> {
    await this.delay(300);
    // Always return the mock data for now
    return REFERRAL_DATA.en;
  }

  async saveAppConfig(appId: string, config: any): Promise<{ saved: boolean; revisedAt: string }> {
    await this.delay(500);
    return { saved: true, revisedAt: new Date().toISOString() };
  }

  async regenerateTab(appId: string, tabKey: string, currentSubtree: any): Promise<{ tabKey: string; newSubtree: any }> {
    await this.delay(800);
    
    // Simulate regenerated content
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
    
    return { tabKey, newSubtree: regenerated };
  }

  async translateConfig(appId: string, lang: string, sourceJson: any): Promise<{ lang: string; status: string }> {
    await this.delay(2000 + Math.random() * 1000);
    return { lang, status: 'done' };
  }
}

export const adminApi = new AdminApiService();
