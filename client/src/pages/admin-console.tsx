import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import Sidebar from "@/components/admin/sidebar";
import MainContent from "@/components/admin/main-content";
import AppModal from "@/components/admin/app-modal";
import { adminApi } from "@/lib/admin-api";
import type { App, AppFormData } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminConsole() {
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  const [originalConfig, setOriginalConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<'ui' | 'json'>('ui');
  const [isLocked, setIsLocked] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [translateStatus, setTranslateStatus] = useState<Record<string, 'pending' | 'completed'>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [appDetailsChanges, setAppDetailsChanges] = useState<any>(null);
  const [pendingAppSwitch, setPendingAppSwitch] = useState<App | null>(null);
  const [isUnsavedChangesDialogOpen, setIsUnsavedChangesDialogOpen] = useState(false);

  const { toast } = useToast();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  // Load saved preferences - always default to UI editor
  useEffect(() => {
    // Always default to UI editor
    setEditorMode('ui');
    localStorage.setItem('editorMode', 'ui');
  }, []);

  // Navigation guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const { data: apps = [], isLoading: appsLoading, error: appsError } = useQuery({
    queryKey: ['/api/apps'],
    queryFn: () => adminApi.getApps(),
    retry: 3,
    retryDelay: 1000,
  });

  const configQuery = useQuery({
    queryKey: ['/api/apps', selectedApp?.appId, 'config'],
    queryFn: () => selectedApp ? adminApi.getAppConfig(selectedApp.appId) : Promise.resolve(null),
    enabled: !!selectedApp,
  });

  // Handle config data changes using useEffect instead of deprecated onSuccess
  useEffect(() => {
    if (configQuery.data) {
      const data = configQuery.data;
      setCurrentConfig(data);
      setOriginalConfig(JSON.parse(JSON.stringify(data))); // Deep clone for original
      setIsDirty(false);

      // Set the first tab in the proper order
      const tabOrder = [
        'page1_referralPromote',
        'page2_referralStatus',
        'page3_referralDownload',
        'page4_referralRedeem',
        'notifications',
        'image',
        'app-details'
      ];

      // Always include special tabs that don't come from referral_json.en
      const specialTabs = ['app-details', 'image'];

      // Find available tabs from the referral_json.en structure, excluding special tabs
      // Also exclude 'appDetails' as it conflicts with our special 'app-details' tab
      // Also exclude 'images' as it conflicts with our special 'image' tab
      const excludedTabs = [...specialTabs, 'appDetails', 'images'];
      const configTabs = data.referral_json?.en ?
        Object.keys(data.referral_json.en).filter(tab => !excludedTabs.includes(tab)) : [];

      // Combine special tabs with config tabs in the desired order
      const orderedTabs = tabOrder.filter(tab =>
        specialTabs.includes(tab) || configTabs.includes(tab)
      );
      const additionalTabs = configTabs.filter(tab => !tabOrder.includes(tab));
      const allTabs = [...orderedTabs, ...additionalTabs];
      
      // Remove debug logs

      if (allTabs.length > 0 && !activeTab) {
        setActiveTab(allTabs[0]);
      }
    }
  }, [configQuery.data, activeTab]);

  const createAppMutation = useMutation({
    mutationFn: (data: AppFormData) => adminApi.createApp(data),
    onSuccess: async (newApp) => {
      console.log('App created successfully:', newApp);
      
      // Invalidate apps query to refresh the sidebar
      queryClient.invalidateQueries({ queryKey: ['/api/apps'] });

      // Select the new app
      setSelectedApp(newApp);
      setIsAppModalOpen(false);

      // Reset any existing state
      setActiveTab(null);
      setCurrentConfig(null);
      setOriginalConfig(null); // Reset original config as well

      // Trigger config loading for the new app
      queryClient.invalidateQueries({ queryKey: ['/api/apps', newApp.appId, 'config'] });

      toast({
        title: "Success",
        description: "App created successfully and loaded",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Error creating app: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateAppMutation = useMutation({
    mutationFn: ({ appId, data }: { appId: string; data: Partial<AppFormData> }) =>
      adminApi.updateApp(appId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/apps'] });
      setIsAppModalOpen(false);
      setEditingApp(null);
      toast({
        title: "Success",
        description: "App updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Error updating app: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteAppMutation = useMutation({
    mutationFn: (appId: string) => adminApi.deleteApp(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/apps'] });
      if (selectedApp) {
        setSelectedApp(null);
        setCurrentConfig(null);
        setOriginalConfig(null); // Reset original config
        setActiveTab(null);
      }
      toast({
        title: "Success",
        description: "App deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Error deleting app: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const saveConfigMutation = useMutation({
    mutationFn: ({ appId, config }: { appId: string; config: any }) =>
      adminApi.saveAppConfig(appId, config),
    onSuccess: () => {
      setIsDirty(false);
      // Update original config after successful save
      if (currentConfig) {
        setOriginalConfig(JSON.parse(JSON.stringify(currentConfig)));
      }
      toast({
        title: "Success",
        description: "Configuration saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Error saving configuration: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const editAppMutation = useMutation({
    mutationFn: ({ appId, playStoreLink, appStoreLink }: { appId: string; playStoreLink?: string; appStoreLink?: string }) =>
      adminApi.editApp(appId, playStoreLink, appStoreLink),
    onSuccess: () => {
      setIsDirty(false);
      // Refresh the apps list and config data after successful save
      queryClient.invalidateQueries({ queryKey: ['/api/apps'] });
      if (selectedApp) {
        queryClient.invalidateQueries({ queryKey: ['/api/apps', selectedApp.appId, 'config'] });
      }
      toast({
        title: "Success",
        description: "App details updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Error updating app details: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const regenerateTabMutation = useMutation({
    mutationFn: ({ appId, tabKey, currentSubtree, appName, appDescription }: { appId: string; tabKey: string; currentSubtree: any; appName?: string; appDescription?: string }) =>
      adminApi.regenerateTab(appId, tabKey, currentSubtree, appName, appDescription),
    onSuccess: (result) => {
      if (currentConfig && result) {
        const newConfig = {
          ...currentConfig,
          referral_json: {
            ...currentConfig.referral_json,
            en: {
              ...currentConfig.referral_json.en,
              [result.tabKey]: result.newSubtree
            }
          }
        };
        setCurrentConfig(newConfig);
        setIsDirty(true);

        const tabName = getTabTitle(result.tabKey);
        toast({
          title: "Success",
          description: `${tabName} regenerated successfully`,
        });
      }
    },
    onError: (error: Error, variables) => {
      const tabName = getTabTitle(variables.tabKey);
      toast({
        title: "Regeneration Failed",
        description: error.message,
        variant: "destructive",
        action: {
          altText: "Try Again",
          onClick: () => {
            regenerateTabMutation.mutate(variables);
          },
        },
      });
    },
  });

  const translateMutation = useMutation({
    mutationFn: ({ appId, lang, sourceJson }: { appId: string; lang: string; sourceJson: any }) =>
      adminApi.translateConfig(appId, lang, sourceJson),
    onSuccess: (result) => {
      if (result) {
        setTranslateStatus(prev => ({ ...prev, [result.lang]: 'completed' }));
        toast({
          title: "Success",
          description: `Translation to ${result.lang} completed`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Translation failed: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSelectApp = (app: App) => {
    // Check if there are unsaved changes before switching apps
    if (hasChanges && selectedApp && selectedApp.appId !== app.appId) {
      setPendingAppSwitch(app);
      setIsUnsavedChangesDialogOpen(true);
      return;
    }

    // Switch app immediately if no changes or same app
    setSelectedApp(app);
    setActiveTab(null);
    setCurrentConfig(null);
    setOriginalConfig(null);
    setAppDetailsChanges(null);
    setIsDirty(false);
    queryClient.invalidateQueries({ queryKey: ['/api/apps', app.appId, 'config'] });
  };

  const handleConfirmAppSwitch = () => {
    if (pendingAppSwitch) {
      setSelectedApp(pendingAppSwitch);
      setActiveTab(null);
      setCurrentConfig(null);
      setOriginalConfig(null);
      setAppDetailsChanges(null);
      setIsDirty(false);
      setPendingAppSwitch(null);
      queryClient.invalidateQueries({ queryKey: ['/api/apps', pendingAppSwitch.appId, 'config'] });
    }
    setIsUnsavedChangesDialogOpen(false);
  };

  const handleCancelAppSwitch = () => {
    setPendingAppSwitch(null);
    setIsUnsavedChangesDialogOpen(false);
  };

  const handleCreateApp = () => {
    setEditingApp(null);
    setIsAppModalOpen(true);
  };

  const handleEditApp = (app: App) => {
    setEditingApp(app);
    setIsAppModalOpen(true);
  };

  const handleDeleteApp = (appId: string) => {
    if (confirm('Are you sure you want to delete this app? This action cannot be undone.')) {
      deleteAppMutation.mutate(appId);
    }
  };

  const handleAppFormSubmit = (data: AppFormData) => {
    if (editingApp) {
      updateAppMutation.mutate({ appId: editingApp.appId, data });
    } else {
      createAppMutation.mutate(data);
    }
  };

  const handleConfigUpdate = (newConfig: any) => {
    if (!newConfig) {
      return;
    }

    // More robust comparison to prevent unnecessary updates
    try {
      const currentString = JSON.stringify(currentConfig);
      const newString = JSON.stringify(newConfig);

      if (currentString === newString) {
        return;
      }
    } catch (error) {
      console.error('Error comparing configs:', error);
    }

    setCurrentConfig(newConfig);
    setIsDirty(true);
  };

  const handleAppUpdate = (updatedAppData: any) => {
    // Store the app details changes for later saving
    setAppDetailsChanges(updatedAppData);
    setIsDirty(true);

    // Update the selected app data for immediate UI updates
    if (selectedApp) {
      setSelectedApp({ ...selectedApp, ...updatedAppData });
    }
  };

  const getTabData = (tabKey: string) => {
    if (tabKey === 'app-details') {
      // For app details, use selectedApp data which contains the complete app information
      if (!selectedApp) return null;
      
      return {
        packageName: selectedApp.packageName || '',
        appName: selectedApp.appName || '',
        meta: selectedApp.meta || {}
      };
    }
    
    if (!currentConfig) return null;

    if (tabKey === 'images') {
      return currentConfig.images || {};
    }

    // For other tabs, get from referral_json.en
    const tabData = currentConfig.referral_json?.en?.[tabKey];
    return tabData || {};
  };

  // This handler is specifically for updating a tab's data within the currentConfig
  const handleTabDataUpdate = (tabKey: string, newTabData: any) => {
    if (!currentConfig) return;

    console.log('handleTabDataUpdate called with:', tabKey, newTabData);
    let updatedConfig = { ...currentConfig };

    if (tabKey === 'app-details') {
      updatedConfig.app_package_name = newTabData.packageName;
      updatedConfig.app_name = newTabData.appName;
      updatedConfig.meta = newTabData.meta;
    } else {
      // Ensure the referral_json.en structure exists
      if (!updatedConfig.referral_json) updatedConfig.referral_json = {};
      if (!updatedConfig.referral_json.en) updatedConfig.referral_json.en = {};
      
      // Special handling for images to ensure it's always added to the structure
      if (tabKey === 'images') {
        // Make sure images object exists and merge with new data
        if (!updatedConfig.referral_json.en.images) {
          updatedConfig.referral_json.en.images = {};
        }
        updatedConfig.referral_json.en.images = { ...updatedConfig.referral_json.en.images, ...newTabData };
      } else {
        // Update other tab data normally
        updatedConfig.referral_json.en[tabKey] = newTabData;
      }
    }

    console.log('Updated config:', updatedConfig);
    setCurrentConfig(updatedConfig);
    setIsDirty(true);
  };

  const handleSaveConfig = () => {
    if (!selectedApp) return;

    // If we're on the app-details tab and have changes, call the editApp API
    if (activeTab === 'app-details' && appDetailsChanges) {
      const playStoreLink = appDetailsChanges.meta?.playUrl || '';
      const appStoreLink = appDetailsChanges.meta?.appStoreUrl || '';
      editAppMutation.mutate({
        appId: selectedApp.appId,
        playStoreLink,
        appStoreLink
      });
      // Clear the app details changes after saving
      setAppDetailsChanges(null);
    } else if (currentConfig) {
      // For other tabs, save the config as usual
      saveConfigMutation.mutate({ appId: selectedApp.appId, config: currentConfig });
    }
  };

  // Check if current config differs from original
  const hasChanges = useMemo(() => {
    if (!currentConfig || !originalConfig) return false;
    // Also check if there are app details changes
    const configChanged = JSON.stringify(currentConfig) !== JSON.stringify(originalConfig);
    const appDetailsChanged = appDetailsChanges !== null;
    return configChanged || appDetailsChanged || isDirty;
  }, [currentConfig, originalConfig, appDetailsChanges, isDirty]);

  const handleRegenerateConfig = async (tabKey: string, description: string) => {
    if (!selectedApp || !currentConfig) return;

    // For notifications tab, get the data from notifications field instead of referral_json.en
    let currentSubtree;
    if (tabKey === 'notifications') {
      currentSubtree = currentConfig?.referral_json?.en?.notifications || {};
    } else {
      currentSubtree = currentConfig?.referral_json?.en?.[tabKey] || {};
    }

    return new Promise<void>((resolve, reject) => {
      regenerateTabMutation.mutate({
        appId: selectedApp.appId,
        tabKey,
        currentSubtree,
        appName: selectedApp.appName,
        appDescription: description || selectedApp.meta?.description || ''
      }, {
        onSuccess: () => {
          resolve();
        },
        onError: (error) => {
          reject(error);
        }
      });
    });
  };

  const handleResetChanges = () => {
    if (originalConfig) {
      setCurrentConfig(JSON.parse(JSON.stringify(originalConfig))); // Deep clone
      setAppDetailsChanges(null); // Reset app details changes
      setIsDirty(false);
      toast({
        title: "Changes Reset",
        description: "Configuration has been reset to the original state",
      });
    }
  };

  const handleTranslate = async (lang: string) => {
    if (!selectedApp || !currentConfig || translateStatus[lang] === 'pending') return;
    
    // Set language to pending status and mark as translating
    setTranslateStatus(prev => ({ ...prev, [lang]: 'pending' as const }));
    setIsTranslating(true);
    
    try {
      // Call the new single language translation API with app details
      await adminApi.translateToLanguage(
        selectedApp.packageName, 
        lang, 
        {
          appName: selectedApp.appName,
          description: selectedApp.meta?.description || "App description",
          ...currentConfig
        }
      );
      
      // After successful translation, refresh the config data
      queryClient.invalidateQueries({ queryKey: ['/api/apps', selectedApp.appId, 'config'] });
      
      // Mark language as completed
      setTranslateStatus(prev => {
        const newStatus = { ...prev, [lang]: 'completed' as const };
        // Check if any translations are still pending after this completion
        const stillTranslating = Object.values(newStatus).some(status => status === 'pending');
        if (!stillTranslating) {
          setIsTranslating(false);
        }
        return newStatus;
      });
      
      toast({
        title: "Translation Completed",
        description: `Successfully translated to ${lang}`,
      });
      
    } catch (error) {
      console.error('Translation failed:', error);
      
      // Reset status for failed translation
      setTranslateStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[lang];
        // Check if any translations are still pending after this failure
        const stillTranslating = Object.values(newStatus).some(status => status === 'pending');
        if (!stillTranslating) {
          setIsTranslating(false);
        }
        return newStatus;
      });
      
      const errorMessage = error instanceof Error ? error.message : "An error occurred during translation";
      
      toast({
        title: "Translation Failed",
        description: errorMessage.includes('timed out') ? 
          `Translation to ${lang} timed out. The API might be slow - please try again.` : 
          errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
  };

  const handleRefreshTab = async (tabKey: string) => {
    if (!selectedApp || !currentConfig) return;

    const currentSubtree = currentConfig.referral_json?.en?.[tabKey];
    if (!currentSubtree) return;

    // For promote sharing tab, we need app details
    let appName = selectedApp.appName;
    let appDescription = selectedApp.meta?.description;

    // Ensure we have app details for all API-based tabs
    appName = appName || 'Demo App';
    appDescription = appDescription || 'Demo app description';

    // All special tabs need app name and description for API calls
    const isSpecialApiTab = ['page1_referralPromote', 'page2_referralStatus', 'page3_referralDownload', 'page4_referralRedeem', 'notifications'].includes(tabKey);

    // Return a promise that resolves when the mutation completes
    return new Promise<void>((resolve, reject) => {
      regenerateTabMutation.mutate({
        appId: selectedApp.appId,
        tabKey,
        currentSubtree,
        appName: isSpecialApiTab ? appName : undefined,
        appDescription: isSpecialApiTab ? appDescription : undefined
      }, {
        onSuccess: () => {
          resolve();
        },
        onError: (error) => {
          reject(error);
        }
      });
    });
  };

  const handleLockToggle = () => {
    setIsLocked(!isLocked);
  };

  const handleEditorModeChange = (mode: 'ui' | 'json') => {
    setEditorMode(mode);
    localStorage.setItem('editorMode', mode);
  };

  const getTabTitle = (tabKey: string): string => {
    if (!tabKey || typeof tabKey !== 'string') return 'Unknown Tab';

    const TAB_MAPPINGS: Record<string, string> = {
      'app-details': 'App Details',
      'image': 'Image',
      'page1_referralPromote': 'Promote Sharing',
      'page2_referralStatus': 'Referrer Status',
      'page3_referralDownload': 'Promote Download',
      'page4_referralRedeem': 'Redeem Code',
      'notifications': 'Notifications'
    };

    return TAB_MAPPINGS[tabKey] || humanizeKey(tabKey);
  };

  const humanizeKey = (key: string): string => {
    if (!key || typeof key !== 'string') return 'Unknown';
    return key
      .replace(/[_-]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="admin-header flex items-center justify-between px-6">
        <h1 className="text-xl font-semibold text-foreground">Referral Boost Console</h1>

        <div className="flex items-center gap-4">
          <button
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors"
            onClick={handleCreateApp}
          >
            <span className="text-sm">Create App</span>
          </button>
          <button
            className="btn btn-outline"
            onClick={async () => {
              if (confirm('Are you sure you want to logout?')) {
                await logout();
              }
            }}
          >
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="admin-layout">
        <Sidebar
          apps={apps}
          selectedApp={selectedApp}
          isLoading={appsLoading}
          onSelectApp={handleSelectApp}
          onCreateApp={handleCreateApp}
          onEditApp={handleEditApp}
          onDeleteApp={handleDeleteApp}
        />

        <MainContent
          apps={apps}
          selectedApp={selectedApp}
          currentConfig={currentConfig}
          originalConfig={originalConfig}
          activeTab={activeTab}
          editorMode={editorMode}
          isLocked={isLocked}
          isDirty={isDirty}
          hasChanges={hasChanges}
          translateStatus={translateStatus}
          onTabChange={handleTabChange}
          onConfigUpdate={handleConfigUpdate}
          onTabDataUpdate={handleTabDataUpdate}
          onAppUpdate={handleAppUpdate}
          onEditorModeChange={handleEditorModeChange}
          onLockToggle={handleLockToggle}
          onSaveConfig={handleSaveConfig}
          onResetChanges={handleResetChanges}
          onRegenerateTab={handleRegenerateConfig}
          onTranslate={handleTranslate}
          onDeleteApp={handleDeleteApp}
          onRefreshTab={handleRefreshTab}
          getTabTitle={getTabTitle}
          isRegenerating={regenerateTabMutation.isPending}
          isSaving={saveConfigMutation.isPending || editAppMutation.isPending}
          isTranslating={isTranslating}
          configError={configQuery.error as Error | null}
          isLoadingConfig={configQuery.isPending}
          onRetryConfig={() => configQuery.refetch()}
          onCreateApp={handleCreateApp}
        />
      </div>

      <AppModal
        isOpen={isAppModalOpen}
        editingApp={editingApp}
        onClose={() => {
          setIsAppModalOpen(false);
          setEditingApp(null);
        }}
        onSubmit={handleAppFormSubmit}
        isSubmitting={createAppMutation.isPending || updateAppMutation.isPending}
      />

      <AlertDialog open={isUnsavedChangesDialogOpen} onOpenChange={setIsUnsavedChangesDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              The changes will be discarded if you leave the page. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelAppSwitch}>
              Dismiss
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAppSwitch}>
              Yes, Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}