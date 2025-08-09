
import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/admin/sidebar";
import MainContent from "@/components/admin/main-content";
import AppModal from "@/components/admin/app-modal";
import type { App, AppFormData } from "@shared/schema";

export default function AdminConsole() {
  const { user, logout } = useAuthContext();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // App management state
  const [apps, setApps] = useState<App[]>([]);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  const [originalConfig, setOriginalConfig] = useState<any>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<'ui' | 'json'>('ui');
  const [isLocked, setIsLocked] = useState(false);
  const [translateStatus, setTranslateStatus] = useState<Record<string, 'pending' | 'completed'>>({});
  
  // Modal state
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  
  // Loading states
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!user) {
      setLocation('/login');
      return;
    }
    loadApps();
  }, [user, setLocation]);

  const loadApps = async () => {
    try {
      setIsLoading(true);
      const appsData = await adminApi.getApps();
      setApps(appsData);
      
      if (appsData.length > 0 && !selectedApp) {
        setSelectedApp(appsData[0]);
      }
    } catch (error) {
      console.error('Failed to load apps:', error);
      toast({
        title: "Error",
        description: "Failed to load apps",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedApp) {
      loadAppConfig();
    }
  }, [selectedApp]);

  const loadAppConfig = async () => {
    if (!selectedApp) return;

    try {
      const config = await adminApi.getAppConfig(selectedApp.appId);
      setCurrentConfig(config);
      setOriginalConfig(JSON.parse(JSON.stringify(config)));
      
      const tabs = Object.keys(config);
      if (tabs.length > 0 && !activeTab) {
        setActiveTab(tabs[0]);
      }
    } catch (error) {
      console.error('Failed to load app config:', error);
      toast({
        title: "Error",
        description: "Failed to load app configuration",
        variant: "destructive"
      });
    }
  };

  const handleCreateApp = async (appData: AppFormData) => {
    try {
      const newApp = await adminApi.createApp(appData);
      setApps(prev => [...prev, newApp]);
      setSelectedApp(newApp);
      setIsAppModalOpen(false);
      
      toast({
        title: "Success",
        description: "App created successfully"
      });
    } catch (error) {
      console.error('Failed to create app:', error);
      toast({
        title: "Error",
        description: "Failed to create app",
        variant: "destructive"
      });
    }
  };

  const handleEditApp = async (appId: string, appData: Partial<AppFormData>) => {
    try {
      const updatedApp = await adminApi.updateApp(appId, appData);
      setApps(prev => prev.map(app => app.appId === appId ? updatedApp : app));
      
      if (selectedApp?.appId === appId) {
        setSelectedApp(updatedApp);
      }
      
      setIsAppModalOpen(false);
      setEditingApp(null);
      
      toast({
        title: "Success",
        description: "App updated successfully"
      });
    } catch (error) {
      console.error('Failed to update app:', error);
      toast({
        title: "Error",
        description: "Failed to update app",
        variant: "destructive"
      });
    }
  };

  const handleDeleteApp = async (appId: string) => {
    try {
      await adminApi.deleteApp(appId);
      setApps(prev => prev.filter(app => app.appId !== appId));
      
      if (selectedApp?.appId === appId) {
        const remainingApps = apps.filter(app => app.appId !== appId);
        setSelectedApp(remainingApps.length > 0 ? remainingApps[0] : null);
      }
      
      toast({
        title: "Success",
        description: "App deleted successfully"
      });
    } catch (error) {
      console.error('Failed to delete app:', error);
      toast({
        title: "Error",
        description: "Failed to delete app",
        variant: "destructive"
      });
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedApp || !currentConfig) return;

    try {
      setIsSaving(true);
      await adminApi.saveAppConfig(selectedApp.appId, currentConfig);
      setOriginalConfig(JSON.parse(JSON.stringify(currentConfig)));
      
      toast({
        title: "Success",
        description: "Configuration saved successfully"
      });
    } catch (error) {
      console.error('Failed to save config:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateTab = async (tabKey: string) => {
    if (!selectedApp || !currentConfig) return;

    try {
      setIsRegenerating(true);
      const { newSubtree } = await adminApi.regenerateTab(selectedApp.appId, tabKey, currentConfig[tabKey]);
      
      setCurrentConfig(prev => ({
        ...prev,
        [tabKey]: newSubtree
      }));
      
      toast({
        title: "Success",
        description: "Tab content regenerated successfully"
      });
    } catch (error) {
      console.error('Failed to regenerate tab:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate tab content",
        variant: "destructive"
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleTranslate = async (lang: string) => {
    if (!selectedApp || !currentConfig) return;

    try {
      setIsTranslating(true);
      setTranslateStatus(prev => ({ ...prev, [lang]: 'pending' }));
      
      const result = await adminApi.translateConfig(selectedApp.appId, lang, currentConfig);
      
      if (result.status === 'completed') {
        setTranslateStatus(prev => ({ ...prev, [lang]: 'completed' }));
        toast({
          title: "Success",
          description: `Translation to ${lang} completed successfully`
        });
      }
    } catch (error) {
      console.error('Failed to translate config:', error);
      toast({
        title: "Error",
        description: "Failed to translate configuration",
        variant: "destructive"
      });
      setTranslateStatus(prev => ({ ...prev, [lang]: undefined }));
    } finally {
      setIsTranslating(false);
    }
  };

  const getTabTitle = (tabKey: string): string => {
    const titles: Record<string, string> = {
      'page1_referralPromote': 'Referral Promote',
      'page2_referralStatus': 'Referral Status', 
      'page3_referralDownload': 'Download Page',
      'page4_referralRedeem': 'Redeem Page',
      'notifications': 'Notifications',
      'images': 'Images',
      'appDetails': 'App Details'
    };
    return titles[tabKey] || tabKey;
  };

  const isDirty = currentConfig && originalConfig && 
    JSON.stringify(currentConfig) !== JSON.stringify(originalConfig);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="admin-layout">
      {/* Mobile Header */}
      <header className="mobile-header lg:hidden">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleMobileSidebar}
          className="p-2"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <h1 className="text-lg font-semibold">Admin Console</h1>
        <div className="w-9"></div> {/* Spacer for centering */}
      </header>

      {/* Desktop Sidebar Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSidebar}
        className={`sidebar-toggle hidden lg:flex ${isSidebarCollapsed ? 'collapsed' : ''}`}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="mobile-overlay lg:hidden" 
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar-container ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        <Sidebar
          apps={apps}
          selectedApp={selectedApp}
          isLoading={isLoading}
          onSelectApp={(app) => {
            setSelectedApp(app);
            setIsMobileSidebarOpen(false);
          }}
          onCreateApp={() => {
            setEditingApp(null);
            setIsAppModalOpen(true);
          }}
          onEditApp={(app) => {
            setEditingApp(app);
            setIsAppModalOpen(true);
          }}
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      {/* Main Content */}
      <div className={`main-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
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
          onConfigUpdate={setCurrentConfig}
          onEditorModeChange={setEditorMode}
          onLockToggle={() => setIsLocked(!isLocked)}
          onSaveConfig={handleSaveConfig}
          onResetChanges={() => setCurrentConfig(JSON.parse(JSON.stringify(originalConfig)))}
          onRegenerateTab={handleRegenerateTab}
          onTranslate={handleTranslate}
          onDeleteApp={handleDeleteApp}
          getTabTitle={getTabTitle}
          isRegenerating={isRegenerating}
          isSaving={isSaving}
          isTranslating={isTranslating}
        />
      </div>

      {/* App Modal */}
      <AppModal
        isOpen={isAppModalOpen}
        onClose={() => {
          setIsAppModalOpen(false);
          setEditingApp(null);
        }}
        onSubmit={editingApp ? 
          (data) => handleEditApp(editingApp.appId, data) : 
          handleCreateApp
        }
        initialData={editingApp}
        mode={editingApp ? 'edit' : 'create'}
      />
    </div>
  );
}
