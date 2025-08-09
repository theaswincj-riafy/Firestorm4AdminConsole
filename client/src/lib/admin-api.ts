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
        const referralData = result.data[0].referral_json;

        // Transform API response to match the expected format
        return {
          ...referralData.en,
          images: {
            logo: {
              url: "https://example.com/logo.png",
              alt: "App Logo",
              dimensions: "200x200"
            },
            hero: {
              url: "https://example.com/hero.jpg",
              alt: "Hero Image",
              dimensions: "1200x600"
            },
            promotional: [
              { url: "https://example.com/promo1.jpg", alt: "Promotion 1" },
              { url: "https://example.com/promo2.jpg", alt: "Promotion 2" }
            ]
          },
          appDetails: {
            appName: app?.appName || "App Name",
            packageName: packageName,
            appDescription: app?.meta?.description || "App description",
            playUrl: app?.meta?.playUrl || "",
            appStoreUrl: app?.meta?.appStoreUrl || "",
            version: "1.0.0",
            category: "Business",
            platforms: ["iOS", "Android", "Web"],
            minVersion: {
              ios: "14.0",
              android: "8.0"
            },
            features: [
              "Real-time tracking",
              "Multiple reward types",
              "Social sharing",
              "Analytics dashboard"
            ]
          }
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

      // Fallback to mock data if API fails
      await this.delay(300);
      const jsonData = {
        "page1_referralPromote": {
          "page_id": "referral-promote",
          "personalization": {
            "referrer_name": "{{referrer_name}}",
            "referral_code": "{{referral_code}}",
            "target_redemptions": 5
          },
          "hero": {
            "title": "Share & Unlock 1 Month Premium",
            "subtitle": "{{referrer_name}}, invite friends and get 1 month of Premium when 5 people redeem your code.",
            "badge": "Only {{target_redemptions}} redemptions needed"
          },
          "benefits": [
            {
              "title": "Premium Access",
              "desc": "Ad-free experience, pro features, and priority support for 1 month."
            },
            {
              "title": "Win Together",
              "desc": "Your friends get an exclusive newcomer perk when they join via your link."
            },
            {
              "title": "Fast & Simple",
              "desc": "Share your link; they download and redeem. You progress instantly."
            }
          ],
          "share": {
            "section_title": "Share your invite",
            "primary_cta": "Share Invite",
            "copy_code_cta": "Copy Code: {{referral_code}}",
            "copy_link_cta": "Copy Link",
            "success_toast": "Copied! Now paste it anywhere."
          },
          "social_proof": {
            "title": "Why people join",
            "bullets": [
              "Top-rated features that save time",
              "Fresh content weekly",
              "Secure & private by design"
            ]
          }
        },
        "page2_referralStatus": {
          "page_id": "referral-status",
          "header": {
            "title": "Your Referral Progress",
            "subtitle": "Great work, {{referrer_name}}. Keep it going!"
          },
          "milestones": [
            {
              "level": 1,
              "threshold": 1,
              "title": "Level 1 – The Kickoff",
              "message": "Your first referral is in! You've started your Premium journey."
            }
          ],
          "faq": [
            {
              "q": "Do I see who redeemed?",
              "a": "No—only totals. We don't store redeemer identities."
            }
          ]
        },
        "page3_referralDownload": {
          "page_id": "referral-download",
          "hero": {
            "title": "{{referrer_name}} invited you",
            "subtitle": "Download the app to claim your invite and get started."
          },
          "feature_highlights": [
            {
              "title": "Get Results Fast",
              "desc": "Smart tools that save you time from day one."
            }
          ]
        },
        "page4_referralRedeem": {
          "page_id": "referral-redeem",
          "hero": {
            "title": "Redeem Invite Code",
            "subtitle": "Enter the invite from {{referrer_name}} to continue."
          },
          "form": {
            "label": "Enter code",
            "placeholder": "e.g., {{referral_code}}",
            "primary_cta": "Redeem Offer"
          }
        },
        "notifications": {
          "referrer": [],
          "redeemer": []
        }
      };

      return {
        page1_referralPromote: jsonData.page1_referralPromote,
        page2_referralStatus: jsonData.page2_referralStatus,
        page3_referralDownload: jsonData.page3_referralDownload,
        page4_referralRedeem: jsonData.page4_referralRedeem,
        notifications: jsonData.notifications,
        images: {
          logo: {
            url: "https://example.com/logo.png",
            alt: "App Logo",
            dimensions: "200x200"
          },
          hero: {
            url: "https://example.com/hero.jpg",
            alt: "Hero Image",
            dimensions: "1200x600"
          }
        },
        appDetails: {
          appName: "Demo Referral App",
          packageName: appId,
          appDescription: "A sample referral application",
          playUrl: "",
          appStoreUrl: "",
          version: "1.0.0",
          category: "Business",
          platforms: ["iOS", "Android", "Web"],
          features: [
            "Real-time tracking",
            "Multiple reward types",
            "Social sharing",
            "Analytics dashboard"
          ]
        }
      };
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

      // Extract referral_json data (exclude appDetails from the referral_json)
      const { appDetails, ...referralJsonData } = config;

      // Prepare the request body
      const requestBody = {
        app_package_name: packageName,
        referral_json: {
          en: referralJsonData
        }
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