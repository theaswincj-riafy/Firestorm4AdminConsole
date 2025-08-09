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
    await this.delay(300);

    // Return data from the provided JSON structure
    const jsonData = {
      "appID": 1,
      "en": {
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
          "progress_teaser": {
            "label": "Your current progress",
            "value": "{{current_redemptions}}/{{target_redemptions}}",
            "hint": "Keep sharing—each redemption brings you closer to Premium!"
          },
          "share": {
            "section_title": "Share your invite",
            "primary_cta": "Share Invite",
            "copy_code_cta": "Copy Code: {{referral_code}}",
            "copy_link_cta": "Copy Link",
            "success_toast": "Copied! Now paste it anywhere.",
            "messages": {
              "whatsapp": "Hey! I'm using this app and it's awesome. Use my code {{referral_code}} or link {{referral_link}} to join—helps me unlock 1 month Premium 🎉",
              "sms": "Join this app with my code {{referral_code}} (link: {{referral_link}}). You'll love it—and you'll help me unlock Premium!",
              "generic": "{{referrer_name}} invited you to try this app. Redeem code {{referral_code}} via {{referral_link}}."
            }
          },
          "nudges": [
            "Best results: share with 5–10 close contacts first.",
            "Add a personal note: tell them why you like the app.",
            "Post your link in a relevant group or community."
          ],
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
            "label": "View My Referral Status",
            "action": "go_to_status"
          }
        },
        "page2_referralStatus": {
          "page_id": "referral-status",
          "personalization": {
            "referrer_name": "{{referrer_name}}",
            "referral_code": "{{referral_code}}",
            "target_redemptions": 5
          },
          "header": {
            "title": "Your Referral Progress",
            "subtitle": "Great work, {{referrer_name}}. Keep it going!"
          },
          "status": {
            "current": "{{current_redemptions}}",
            "target": "{{target_redemptions}}",
            "progress_text": "{{current_redemptions}} of {{target_redemptions}} completed"
          },
          "notifications": {
            "recent_event_banner": {
              "visible": "{{show_recent_event}}",
              "text": "Nice! Someone redeemed your code. Your progress just moved to {{current_redemptions}}/{{target_redemptions}}."
            }
          },
          "milestones": [
            {
              "level": 1,
              "threshold": 1,
              "title": "Level 1 – The Kickoff",
              "message": "Your first referral is in! You've started your Premium journey."
            },
            {
              "level": 2,
              "threshold": 2,
              "title": "Level 2 – Building Momentum",
              "message": "Two friends on board! You're warming up nicely."
            }
          ],
          "tips": [
            "Reshare your link with a quick personal note.",
            "Pin your code {{referral_code}} in your bio or group description.",
            "Remind friends it takes less than a minute to redeem."
          ],
          "actions": {
            "share_cta": "Share Again",
            "copy_link_cta": "Copy Invite Link",
            "copy_code_cta": "Copy Code: {{referral_code}}"
          },
          "faq": [
            {
              "q": "Do I see who redeemed?",
              "a": "No—only totals. We don't store redeemer identities."
            },
            {
              "q": "When do I get Premium?",
              "a": "Instantly after {{target_redemptions}} redemptions. You'll get an in-app confirmation."
            }
          ],
          "privacy_note": "We keep your contacts' identities private. Only your aggregate progress is tracked."
        },
        "page3_referralDownload": {
          "page_id": "referral-download",
          "personalization": {
            "referrer_name": "{{referrer_name}}",
            "referral_code": "{{referral_code}}"
          },
          "hero": {
            "title": "{{referrer_name}} invited you",
            "subtitle": "Download the app to claim your invite and get started."
          },
          "feature_highlights": [
            {
              "title": "Get Results Fast",
              "desc": "Smart tools that save you time from day one."
            },
            {
              "title": "Premium-grade Experience",
              "desc": "Clean design, powerful features, zero clutter."
            },
            {
              "title": "Privacy First",
              "desc": "We don't expose your identity to others."
            }
          ],
          "store_ctas": {
            "play_store_button": "Get it on Google Play",
            "app_store_button": "Download on the App Store",
            "device_hint": "Choose your store to download the app."
          },
          "how_it_works": {
            "title": "How to claim the invite",
            "steps": [
              "Install the app from your store.",
              "Open the app and go to \"Redeem Invite\".",
              "Enter code {{referral_code}} to complete."
            ]
          },
          "footer": {
            "smallprint": "By continuing you agree to our Terms and Privacy Policy.",
            "secondary_cta": {
              "label": "Already installed?",
              "action": "go_to_redeem"
            }
          }
        },
        "page4_referralRedeem": {
          "page_id": "referral-redeem",
          "personalization": {
            "referrer_name": "{{referrer_name}}",
            "prefilled_code": "{{referral_code}}"
          },
          "hero": {
            "title": "Redeem Invite Code",
            "subtitle": "Enter the invite from {{referrer_name}} to continue."
          },
          "form": {
            "label": "Enter code",
            "placeholder": "e.g., {{referral_code}}",
            "prefill": "{{prefilled_code}}",
            "primary_cta": "Redeem Offer",
            "secondary_cta": "Paste from Clipboard"
          },
          "validation": {
            "empty": "Please enter a code.",
            "invalid": "That code doesn't look right. Check and try again.",
            "expired": "This invite has expired. Ask {{referrer_name}} for a new one.",
            "success": "Success! Your invite is confirmed."
          },
          "post_redeem": {
            "title": "You're all set",
            "desc": "Enjoy the app. Your redemption also helps {{referrer_name}} progress toward a reward."
          },
          "privacy_note": "We do not store or display your identity to {{referrer_name}}. Only the total redemption count updates.",
          "help": {
            "link_text": "Need help?",
            "items": [
              "Make sure you downloaded the official app.",
              "Double-check the code format (no spaces).",
              "Still stuck? Contact support from Settings > Help."
            ]
          }
        },
        "notifications": {
          "referrer": [
            {
              "id": "referral_progress_4_left",
              "title": "🔥 First win!",
              "body": "Someone just joined using your code. 4 more and you'll unlock a month of Premium!",
              "cta": "Check your progress"
            },
            {
              "id": "referral_progress_3_left",
              "title": "🚀 You're gaining momentum",
              "body": "Another friend joined! Just 3 more redemptions to score your free Premium month.",
              "cta": "See who's next"
            }
          ],
          "redeemer": []
        }
      }
    };

    // Return the 'en' object which contains all the tab data
    return {
      ...jsonData.en,
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
        appName: "Demo Referral App",
        packageName: "com.demo.referral",
        appDescription: "A sample referral application",
        playUrl: "https://play.google.com/store/apps/details?id=com.demo.referral",
        appStoreUrl: "https://apps.apple.com/app/demo-referral-app/id123456789",
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
    // Simulate API call - replace with actual implementation later
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ lang, status: 'completed' });
      }, 2000); // 2 second delay to simulate API call
    });
  }
}

export const adminApi = new AdminApiService();