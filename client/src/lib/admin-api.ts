
import { REFERRAL_DATA } from './referral-data';
import type { App, AppFormData } from '@shared/schema';

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
    try {
      const response = await fetch('https://referral-system-o0yw.onrender.com/api/admin/listapps', {
        method: 'GET',
        headers: {
          'X-API-Key': 'HJVV4XapPZVVfPSiQThYGZdAXkRLUWvRfpNE5ITMfbC3A4Q',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        // Transform API response to match our App interface
        return result.data.map((apiApp: any) => ({
          appId: apiApp.app_package_name, // Using package name as unique ID
          appName: apiApp.app_name,
          packageName: apiApp.app_package_name,
          meta: {
            description: apiApp.description || '',
            playUrl: '',
            appStoreUrl: ''
          }
        }));
      } else {
        throw new Error('Failed to fetch apps');
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
      // Fallback to local apps if API fails
      return [...this.apps];
    }
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
    try {
      // Find the app by appId to get the package name
      const app = this.apps.find(a => a.appId === appId);
      let packageName = appId;

      // If appId matches an existing app's package name, use it directly
      // Otherwise try to find by appId
      if (app) {
        packageName = app.packageName;
      }

      const response = await fetch(`https://referral-system-o0yw.onrender.com/api/admin/getreferraldata?app_package_name=${packageName}`, {
        method: 'GET',
        headers: {
          'X-API-Key': 'HJVV4XapPZVVfPSiQThYGZdAXkRLUWvRfpNE5ITMfbC3A4Q',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage = `HTTP ${response.status}: ${errorJson.message}`;
          }
        } catch {
          // If not JSON, keep the default message
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.status === 'success' && result.data && result.data.length > 0) {
        // Return only the exact structure from the API response
        const dataContent = result.data[0];
        
        return {
          app_package_name: dataContent.app_package_name,
          referral_json: dataContent.referral_json
        };
      } else if (result.status === 'error') {
        throw new Error(result.message || 'API returned error status');
      } else {
        throw new Error('No referral data found for this app');
      }
    } catch (error) {
      console.error('Error fetching app config:', error);

      // Re-throw with more specific error information
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Unknown error occurred while fetching app config');
      }
    }
  }

  async saveAppConfig(appId: string, config: any): Promise<{ saved: boolean; revisedAt: string }> {
    try {
      // Find the app by appId to get the package name
      const app = this.apps.find(a => a.appId === appId);
      let packageName = appId;

      // If appId matches an existing app's package name, use it directly
      // Otherwise try to find by appId
      if (app) {
        packageName = app.packageName;
      }

      // Prepare the request body in the exact format expected by the API
      const requestBody = {
        app_package_name: packageName,
        referral_json: config.referral_json
      };

      const response = await fetch('https://referral-system-o0yw.onrender.com/api/admin/savereferraldata', {
        method: 'POST',
        headers: {
          'X-API-Key': 'HJVV4XapPZVVfPSiQThYGZdAXkRLUWvRfpNE5ITMfbC3A4Q',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage = `HTTP ${response.status}: ${errorJson.message}`;
          }
        } catch {
          // If not JSON, keep the default message
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.status === 'success') {
        return { saved: true, revisedAt: new Date().toISOString() };
      } else {
        throw new Error(result.message || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving app config:', error);
      
      // Re-throw with more specific error information
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Unknown error occurred while saving app config');
      }
    }
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
    // Simulate API call - replace with actual implementation later
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ lang, status: 'completed' });
      }, 2000); // 2 second delay to simulate API call
    });
  }
}

export const adminApi = new AdminApiService();
