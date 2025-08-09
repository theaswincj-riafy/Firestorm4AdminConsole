
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
            playUrl: apiApp.play_store_link || '',
            appStoreUrl: apiApp.app_store_link || ''
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
    try {
      const requestBody = {
        app_package_name: appData.packageName,
        app_name: appData.appName,
        description: appData.appDescription || '',
        app_store_link: appData.appStoreUrl || '',
        play_store_link: appData.playUrl || ''
      };

      const response = await fetch('https://referral-system-o0yw.onrender.com/api/admin/createapp', {
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

      if (result.status === 'success' && result.data) {
        // Transform API response to match our App interface
        const apiApp = result.data;
        
        const newApp: App = {
          appId: apiApp.app_package_name, // Using package name as unique ID
          appName: apiApp.app_name,
          packageName: apiApp.app_package_name,
          meta: {
            description: apiApp.description || '',
            playUrl: apiApp.play_store_link || '',
            appStoreUrl: apiApp.app_store_link || ''
          }
        };

        // Add to local apps array for immediate UI update
        this.apps.push(newApp);
        
        return newApp;
      } else {
        throw new Error(result.message || 'Failed to create app');
      }
    } catch (error) {
      console.error('Error creating app:', error);
      
      // Re-throw with more specific error information
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Unknown error occurred while creating app');
      }
    }
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

  async editApp(appId: string, playStoreLink?: string, appStoreLink?: string): Promise<{ message: string; status: string }> {
    try {
      // Find the app by appId to get the package name
      const app = this.apps.find(a => a.appId === appId);
      let packageName = appId;

      // If appId matches an existing app's package name, use it directly
      // Otherwise try to find by appId
      if (app) {
        packageName = app.packageName;
      }

      const requestBody: any = {
        app_package_name: packageName
      };

      // Only include store links if they are provided
      if (playStoreLink !== undefined) {
        requestBody.play_store_link = playStoreLink;
      }
      if (appStoreLink !== undefined) {
        requestBody.app_store_link = appStoreLink;
      }

      const response = await fetch('https://referral-system-o0yw.onrender.com/api/admin/editapp', {
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
        // Update local app data if we have the app
        if (app) {
          const updatedApp = {
            ...app,
            meta: {
              ...app.meta,
              ...(playStoreLink !== undefined && { playUrl: playStoreLink }),
              ...(appStoreLink !== undefined && { appStoreUrl: appStoreLink })
            }
          };
          
          const index = this.apps.findIndex(a => a.appId === appId);
          if (index !== -1) {
            this.apps[index] = updatedApp;
          }
        }

        return result;
      } else {
        throw new Error(result.message || 'Failed to update app');
      }
    } catch (error) {
      console.error('Error updating app:', error);
      
      // Re-throw with more specific error information
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Unknown error occurred while updating app');
      }
    }
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

  async regenerateTab(appId: string, tabKey: string, currentSubtree: any, appName?: string, appDescription?: string): Promise<{ tabKey: string; newSubtree: any }> {
    // Special handling for promote sharing tab
    if (tabKey === 'page1_referralPromote' && appName && appDescription) {
      try {
        const newSubtree = await this.getPromoteSharingData(appName, appDescription);
        return { tabKey, newSubtree };
      } catch (error) {
        console.error('Error refreshing promote sharing data:', error);
        throw new Error('Failed to refresh promote sharing data from API');
      }
    }

    // Special handling for referrer status tab
    if (tabKey === 'page2_referralStatus') {
      try {
        const newSubtree = await this.getReferrerStatusData();
        return { tabKey, newSubtree };
      } catch (error) {
        console.error('Error refreshing referrer status data:', error);
        throw new Error('Failed to refresh referrer status data from API');
      }
    }

    // Fallback to simulated regeneration for other tabs
    await this.delay(800);

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

  async getReferrerStatusData(): Promise<any> {
    try {
      const requestBody = {
        "ask-dex": "7P8RQpvm6pbSNYgiILzyG9mQ4ugPhl9MjpmMB7wC1nDilXcTQO2r1YzhhA7zHAq9kNdHqVWmVlHl0Ay6L5ktIwOKITo/u6uUSQY1odfSbd7RdpVGEaeSDe79J67ZwY3PcF3p0pcJlhDOCmG0ZbG2j2uqCYc1bVB5HGxOqMBu0YlI66QZFeAiBxAYFYV7t63xZTVl95xeKp0BLbyQb/wrN06LnCPfl9ITfmDSbOLdGmkATtHJohE9jBj3mq+lHVDSXnxx89eMJ4RJRRgzHxsPjMe3N/n7bHYPOXns4k4q6Haq21Om5+vptG1FuSXO9Ux44p+r6swsvRWTgLh3GAeRCF0KZkH9XQ4ZriT8og6KZEM9aGnE10BHLaATq3/Bs7JfEyNbtiiDwB0+lo0pKIFVh0RAVtrPp3sTXg7LYa2LhLwk9jzG3p5jOE+h+ZRGCnoSrLYUWrabGXRYWwK3M"
      };

      const response = await fetch('https://us-central1-riafy-public.cloudfunctions.net/genesis?otherFunctions=dexDirect&type=r10-apps-ftw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Failed to parse API response as JSON:', parseError);
        throw new Error('Invalid JSON response from API');
      }

      // Log the actual response for debugging
      console.log('Referrer Status API Response:', JSON.stringify(result, null, 2));

      // Check if the API response indicates success
      if (result.response === 'Done' && result.processType === 'r10-apps-ftw' && result.data) {
        return result.data;
      } else {
        throw new Error('Unexpected API response format or status');
      }
    } catch (error) {
      console.error('Error calling referrer status API:', error);
      throw new Error('Failed to fetch referrer status data from API');
    }
  }

  async translateConfig(appId: string, lang: string, sourceJson: any): Promise<{ lang: string; status: string }> {
    // Simulate API call - replace with actual implementation later
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ lang, status: 'completed' });
      }, 2000); // 2 second delay to simulate API call
    });
  }

  async getPromoteSharingData(appName: string, appDescription: string): Promise<any> {
    try {
      const requestBody = {
        "ask-dex": "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",
        "appname": "acd",
        "ogQuery": JSON.stringify({
          "app_name": appName,
          "app_description": appDescription,
          "target_language": "en"
        }),
        "reply-mode": "json"
      };

      const response = await fetch('https://us-central1-riafy-public.cloudfunctions.net/genesis?otherFunctions=dexDirect&type=r10-apps-ftw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Failed to parse API response as JSON:', parseError);
        throw new Error('Invalid JSON response from API');
      }

      // Log the actual response for debugging
      console.log('API Response:', JSON.stringify(result, null, 2));

      // Check if the API response indicates success (either "Done" or "success")
      if ((result.response === 'Done' || result.status === 'success') && result.data) {
        // Handle the new API response structure where data is an object
        const responseData = result.data;
        
        // Check if this is the new structure with direct data object
        if (responseData && (responseData.page_id === "referral-promote" || responseData.benefits || responseData.hero)) {
          // Transform the new API structure to match our expected page1_referralPromote format
          return {
            "page_id": responseData.page_id || "referral-promote",
            "personalization": {
              "referrer_name": "{{referrer_name}}",
              "referral_code": responseData.hero?.referral_code || "{{referral_code}}",
              "target_redemptions": 5
            },
            "hero": {
              "title": responseData.hero?.hero_title?.replace(/\*/g, '') || responseData.hero?.page_title?.replace(/\*/g, '') || "Share & Unlock Premium",
              "subtitle": responseData.hero?.subtitle || "Invite friends and get rewards when they join using your code.",
              "badge": responseData.progress_teaser?.title || "Only {{target_redemptions}} redemptions needed"
            },
            "benefits": responseData.benefits || [
              {
                "title": "Premium Access",
                "desc": "Unlock exclusive features and benefits."
              },
              {
                "title": "Win Together", 
                "desc": "Your friends get perks when they join via your link."
              },
              {
                "title": "Fast & Simple",
                "desc": "Share your link and track your progress instantly."
              }
            ],
            "progress_teaser": {
              "label": "Your current progress",
              "value": "{{current_redemptions}}/{{target_redemptions}}",
              "hint": responseData.progress_teaser?.subtitle || "Keep sharing—each redemption brings you closer to Premium!"
            },
            "share": {
              "section_title": "Share your invite",
              "primary_cta": responseData.share?.primary_cta?.replace(/\*/g, '') || "Share Invite",
              "copy_code_cta": "Copy Code: {{referral_code}}",
              "copy_link_cta": "Copy Link",
              "success_toast": "Copied! Now paste it anywhere.",
              "messages": {
                "whatsapp": responseData.share?.messages?.default || "Hey! I'm using this app and it's awesome. Use my code {{referral_code}} or link {{referral_link}} to join—helps me unlock 1 month Premium 🎉",
                "sms": responseData.share?.messages?.default || "Join this app with my code {{referral_code}} (link: {{referral_link}}). You'll love it—and you'll help me unlock Premium!",
                "generic": responseData.share?.messages?.default || "{{referrer_name}} invited you to try this app. Redeem code {{referral_code}} via {{referral_link}}."
              }
            },
            "nudges": responseData.nudges || [
              "Best results: share with 5–10 close contacts first.",
              "Add a personal note: tell them why you like the app.",
              "Post your link in a relevant group or community."
            ],
            "how_it_works": responseData.how_it_works || undefined,
            "social_proof": {
              "title": "Why people join",
              "bullets": [
                "Top-rated features that save time",
                "Fresh content weekly",
                "Secure & private by design"
              ]
            },
            "privacy_note": "We never reveal who redeemed your code. Only your totals are shown.",
            "footer_cta": {
              "label": responseData.hero?.quickButtonText?.replace(/\*/g, '') || "View My Referral Status",
              "action": "go_to_status"
            }
          };
        }
        
        // Handle legacy structure with referral_json.en.page1_referralPromote
        if (Array.isArray(result.data) && result.data.length > 0) {
          const responseData = result.data[0];
          
          if (responseData.referral_json && responseData.referral_json.en) {
            const promoteData = responseData.referral_json.en.page1_referralPromote;
            
            if (promoteData) {
              return promoteData;
            }
          }
        }
        
        // If we get here, return a default structure to prevent errors
        console.warn('API returned success but data structure was not recognized. Using fallback.');
        return {
          "page_id": "referral-promote",
          "personalization": {
            "referrer_name": "{{referrer_name}}",
            "referral_code": "{{referral_code}}",
            "target_redemptions": 5
          },
          "hero": {
            "title": "Share & Unlock Premium",
            "subtitle": "Invite friends and get rewards when they join using your code.",
            "badge": "Only {{target_redemptions}} redemptions needed"
          },
          "benefits": [
            {
              "title": "Premium Access",
              "desc": "Unlock exclusive features and benefits."
            },
            {
              "title": "Win Together", 
              "desc": "Your friends get perks when they join via your link."
            },
            {
              "title": "Fast & Simple",
              "desc": "Share your link and track your progress instantly."
            }
          ],
          "share": {
            "section_title": "Share your invite",
            "primary_cta": "Share Invite",
            "copy_code_cta": "Copy Code: {{referral_code}}",
            "copy_link_cta": "Copy Link"
          }
        };
      } else {
        console.error('API Error:', result);
        throw new Error(result.message || 'No promote sharing data found in response');
      }
    } catch (error) {
      console.error('Error fetching promote sharing data:', error);
      throw error;
    }
  }
}

export const adminApi = new AdminApiService();
