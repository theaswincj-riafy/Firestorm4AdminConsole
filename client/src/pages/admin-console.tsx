import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import Sidebar from "@/components/admin/sidebar";
import MainContent from "@/components/admin/main-content";
import AppModal from "@/components/admin/app-modal";
import { adminApi } from "@/lib/admin-api";
import type { App, AppFormData } from "@shared/schema";

export default function AdminConsole() {
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<'ui' | 'json'>('ui');
  const [isLocked, setIsLocked] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [translateStatus, setTranslateStatus] = useState<Record<string, 'pending' | 'completed'>>({});
  const [appDetailsChanges, setAppDetailsChanges] = useState<any>(null);

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

  const { data: apps = [], isLoading: appsLoading } = useQuery({
    queryKey: ['/api/apps'],
    queryFn: () => adminApi.getApps(),
  });

  const configQuery = useQuery({
    queryKey: ['/api/apps', selectedApp?.appId, 'config'],
    queryFn: () => selectedApp ? adminApi.getAppConfig(selectedApp.appId) : null,
    enabled: !!selectedApp,
  });

  // Handle config changes
  useEffect(() => {
    if (configQuery.data) {
      setCurrentConfig(configQuery.data);
      setIsDirty(false);

      // Set the first tab in the proper order
      const tabOrder = [
        'app-details',
        'image',
        'page1_referralPromote',
        'page2_referralStatus',
        'page3_referralDownload',
        'page4_referralRedeem',
        'notifications'
      ];

      // Always include special tabs that don't come from referral_json.en
      const specialTabs = ['app-details', 'image'];
      
      // Find available tabs from the referral_json.en structure
      const configTabs = configQuery.data.referral_json?.en ?
        Object.keys(configQuery.data.referral_json.en) : [];

      // Combine special tabs with config tabs in the desired order
      const orderedTabs = tabOrder.filter(tab => 
        specialTabs.includes(tab) || configTabs.includes(tab)
      );
      const additionalTabs = configTabs.filter(tab => !tabOrder.includes(tab));
      const allTabs = [...orderedTabs, ...additionalTabs];

      if (allTabs.length > 0 && !activeTab) {
        setActiveTab(allTabs[0]);
      }
    }
  }, [configQuery.data, activeTab]);

  const createAppMutation = useMutation({
    mutationFn: (data: AppFormData) => adminApi.createApp(data),
    onSuccess: async (newApp) => {
      // Invalidate apps query to refresh the sidebar
      queryClient.invalidateQueries({ queryKey: ['/api/apps'] });
      
      // Select the new app
      setSelectedApp(newApp);
      setIsAppModalOpen(false);
      
      // Reset any existing state
      setActiveTab(null);
      setCurrentConfig(null);
      
      // Trigger config loading for the new app
      queryClient.invalidateQueries({ queryKey: ['/api/config', newApp.appId] });
      
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
      // Refresh the config data after successful save
      if (selectedApp) {
        queryClient.invalidateQueries({ queryKey: ['/api/apps', selectedApp.appId, 'config'] });
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
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Error regenerating tab: ${error.message}`,
        variant: "destructive",
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
    if (isDirty) {
      if (!confirm('You have unsaved changes. Are you sure you want to switch apps?')) {
        return;
      }
    }
    setSelectedApp(app);
    setActiveTab(null); // Reset active tab when switching apps
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
    if (!currentConfig) return null;

    if (tabKey === 'app-details') {
      return {
        packageName: currentConfig.app_package_name || '',
        appName: currentConfig.app_name || '',
        meta: currentConfig.meta || {}
      };
    }

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

    let updatedConfig = { ...currentConfig };

    if (tabKey === 'app-details') {
      updatedConfig.app_package_name = newTabData.packageName;
      updatedConfig.app_name = newTabData.appName;
      updatedConfig.meta = newTabData.meta;
    } else if (tabKey === 'images') {
      updatedConfig.images = newTabData;
    } else {
      // Update the specific tab data in referral_json.en
      if (!updatedConfig.referral_json) updatedConfig.referral_json = {};
      if (!updatedConfig.referral_json.en) updatedConfig.referral_json.en = {};
      updatedConfig.referral_json.en[tabKey] = newTabData;
    }

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

  const handleResetChanges = () => {
    if (confirm('Are you sure you want to reset all changes? This will lose any unsaved modifications.')) {
      if (selectedApp) {
        queryClient.invalidateQueries({ queryKey: ['/api/apps', selectedApp.appId, 'config'] });
      }
    }
  };

  const handleRegenerateTab = (tabKey: string) => {
    if (selectedApp && currentConfig?.referral_json?.en?.[tabKey]) {
      regenerateTabMutation.mutate({
        appId: selectedApp.appId,
        tabKey,
        currentSubtree: currentConfig.referral_json.en[tabKey]
      });
    }
  };

  const handleTranslate = (lang: string) => {
    if (selectedApp && currentConfig && !translateStatus[lang]) {
      setTranslateStatus(prev => ({ ...prev, [lang]: 'pending' }));
      translateMutation.mutate({
        appId: selectedApp.appId,
        lang,
        sourceJson: currentConfig
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

    // Try to get app details from currentConfig if not available in selectedApp
    if (tabKey === 'page1_referralPromote' && (!appName || !appDescription)) {
      appName = appName || 'App Name';
      appDescription = appDescription || 'App Description';
    }

    regenerateTabMutation.mutate({
      appId: selectedApp.appId,
      tabKey,
      currentSubtree,
      appName: tabKey === 'page1_referralPromote' ? appName : undefined,
      appDescription: tabKey === 'page1_referralPromote' ? appDescription : undefined
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
        />

        <MainContent
          apps={apps}
          selectedApp={selectedApp}
          currentConfig={currentConfig}
          activeTab={activeTab}
          editorMode={editorMode}
          isLocked={isLocked}
          isDirty={isDirty}
          translateStatus={translateStatus}
          onTabChange={handleTabChange}
          onConfigUpdate={handleConfigUpdate}
          onTabDataUpdate={handleTabDataUpdate}
          onAppUpdate={handleAppUpdate}
          onEditorModeChange={handleEditorModeChange}
          onLockToggle={handleLockToggle}
          onSaveConfig={handleSaveConfig}
          onResetChanges={handleResetChanges}
          onRegenerateTab={handleRegenerateTab}
          onTranslate={handleTranslate}
          onDeleteApp={handleDeleteApp}
          onRefreshTab={handleRefreshTab}
          getTabTitle={getTabTitle}
          isRegenerating={regenerateTabMutation.isPending}
          isSaving={saveConfigMutation.isPending || editAppMutation.isPending}
          isTranslating={translateMutation.isPending}
          configError={configQuery.error}
          isLoadingConfig={configQuery.isPending}
          onRetryConfig={() => configQuery.refetch()}
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
    </div>
  );
}