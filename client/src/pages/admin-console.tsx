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

  const { toast } = useToast();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  // Load saved preferences
  useEffect(() => {
    const savedEditorMode = localStorage.getItem('editorMode') as 'ui' | 'json';
    if (savedEditorMode && ['ui', 'json'].includes(savedEditorMode)) {
      setEditorMode(savedEditorMode);
    }
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

  const { data: appConfig } = useQuery({
    queryKey: ['/api/apps', selectedApp?.appId, 'config'],
    queryFn: () => selectedApp ? adminApi.getAppConfig(selectedApp.appId) : null,
    enabled: !!selectedApp,
  });

  // Handle config changes
  useEffect(() => {
    if (appConfig) {
      setCurrentConfig(appConfig);
      setIsDirty(false);
      const firstTab = Object.keys(appConfig)[0];
      if (firstTab) {
        setActiveTab(firstTab);
      }
    }
  }, [appConfig]);

  const createAppMutation = useMutation({
    mutationFn: (data: AppFormData) => adminApi.createApp(data),
    onSuccess: (newApp) => {
      queryClient.invalidateQueries({ queryKey: ['/api/apps'] });
      setSelectedApp(newApp);
      setIsAppModalOpen(false);
      toast({
        title: "Success",
        description: "App created successfully",
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

  const regenerateTabMutation = useMutation({
    mutationFn: ({ appId, tabKey, currentSubtree }: { appId: string; tabKey: string; currentSubtree: any }) => 
      adminApi.regenerateTab(appId, tabKey, currentSubtree),
    onSuccess: (result) => {
      if (currentConfig && result) {
        const newConfig = { ...currentConfig };
        newConfig[result.tabKey] = result.newSubtree;
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
    setCurrentConfig(newConfig);
    setIsDirty(true);
  };

  const handleSaveConfig = () => {
    if (selectedApp && currentConfig) {
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
    if (selectedApp && currentConfig && currentConfig[tabKey]) {
      regenerateTabMutation.mutate({
        appId: selectedApp.appId,
        tabKey,
        currentSubtree: currentConfig[tabKey]
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

  const handleEditorModeChange = (mode: 'ui' | 'json') => {
    setEditorMode(mode);
    localStorage.setItem('editorMode', mode);
  };

  const getTabTitle = (tabKey: string): string => {
    if (!tabKey || typeof tabKey !== 'string') return 'Unknown Tab';
    
    const TAB_MAPPINGS: Record<string, string> = {
      'page1_referralPromote': 'Promote Sharing',
      'page2_referralStatus': 'Referrer Status',
      'page3_referralDownload': 'Promote Download',
      'page4_referralRedeem': 'Redeem Code',
      'notifications': 'Notifications',
      'images': 'Images',
      'appDetails': 'App Details'
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
        />

        <MainContent
          selectedApp={selectedApp}
          apps={apps}
          currentConfig={currentConfig}
          activeTab={activeTab}
          editorMode={editorMode}
          isLocked={isLocked}
          isDirty={isDirty}
          translateStatus={translateStatus}
          onTabChange={setActiveTab}
          onConfigUpdate={handleConfigUpdate}
          onEditorModeChange={handleEditorModeChange}
          onLockToggle={() => setIsLocked(!isLocked)}
          onSaveConfig={handleSaveConfig}
          onResetChanges={handleResetChanges}
          onRegenerateTab={handleRegenerateTab}
          onTranslate={handleTranslate}
          onDeleteApp={handleDeleteApp}
          getTabTitle={getTabTitle}
          isRegenerating={regenerateTabMutation.isPending}
          isSaving={saveConfigMutation.isPending}
          isTranslating={translateMutation.isPending}
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