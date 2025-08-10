import { useState } from "react";
import { Lock, Unlock, CheckCircle, MoreHorizontal, Save, RotateCcw, Languages, ChevronDown, Trash, Package, Smartphone, Globe, FileText, Plus, Check, RefreshCw, Palette, Code, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TabContent from "./tab-content";
import type { App } from "@shared/schema";

interface MainContentProps {
  selectedApp: App | null;
  apps: App[];
  currentConfig: any;
  originalConfig: any;
  activeTab: string | null;
  editorMode: 'ui' | 'json';
  isLocked: boolean;
  isDirty: boolean;
  hasChanges: boolean;
  translateStatus: Record<string, 'pending' | 'completed'>;
  onTabChange: (tabKey: string) => void;
  onConfigUpdate: (config: any) => void;
  onTabDataUpdate: (tabKey: string, newTabData: any) => void;
  onAppUpdate: (appData: any) => void;
  onEditorModeChange: (mode: 'ui' | 'json') => void;
  onLockToggle: () => void;
  onSaveConfig: () => void;
  onResetChanges: () => void;
  onRegenerateTab: (tabKey: string) => void;
  onTranslate: (lang: string) => void;
  onDeleteApp: (appId: string) => void;
  onRefreshTab: (tabKey: string) => Promise<void>;
  getTabTitle: (tabKey: string) => string;
  isRegenerating: boolean;
  isSaving: boolean;
  isTranslating: boolean;
  configError: Error | null;
  isLoadingConfig: boolean;
  onRetryConfig: () => void;
  onCreateApp: () => void; // Added onCreateApp prop
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
];

export default function MainContent({
  selectedApp,
  apps,
  currentConfig,
  originalConfig,
  activeTab,
  editorMode,
  isLocked,
  isDirty,
  hasChanges,
  translateStatus,
  onTabChange,
  onConfigUpdate,
  onTabDataUpdate,
  onAppUpdate,
  onEditorModeChange,
  onLockToggle,
  onSaveConfig,
  onResetChanges,
  onRegenerateTab,
  onTranslate,
  onDeleteApp,
  onRefreshTab,
  getTabTitle,
  isRegenerating,
  isSaving,
  isTranslating,
  configError,
  isLoadingConfig,
  onRetryConfig,
  onCreateApp, // Added onCreateApp to function parameters
}: MainContentProps) {
  const [validateResult, setValidateResult] = useState<{ valid: boolean; error?: string } | null>(null);
  const [refreshingTabs, setRefreshingTabs] = useState<Record<string, boolean>>({});
  const [refreshSuccess, setRefreshSuccess] = useState<Record<string, boolean>>({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleValidateJson = () => {
    if (!currentConfig || !activeTab) return;

    try {
      // Get the raw JSON string from the Monaco editor if it exists
      const editorElement = document.querySelector('.monaco-editor');
      const monacoEditor = (window as any).monaco?.editor?.getEditors()?.[0];

      let jsonString: string;
      if (monacoEditor) {
        jsonString = monacoEditor.getValue();
      } else {
        jsonString = JSON.stringify(currentConfig[activeTab]);
      }

      // Try to parse the JSON
      JSON.parse(jsonString);
      setValidateResult({ valid: true });
      setTimeout(() => setValidateResult(null), 3000);
    } catch (error) {
      setValidateResult({ 
        valid: false, 
        error: error instanceof Error ? error.message : 'Invalid JSON structure' 
      });
      setTimeout(() => setValidateResult(null), 5000);
    }
  };

  const handleTabDataUpdate = (tabKey: string, newTabData: any) => {
    const updatedConfig = { ...currentConfig };
    // Ensure referral_json and en exist before updating
    if (!updatedConfig.referral_json) {
      updatedConfig.referral_json = {};
    }
    if (!updatedConfig.referral_json.en) {
      updatedConfig.referral_json.en = {};
    }

    // Handle special tabs that don't map directly to referral_json.en
    if (tabKey === 'app-details') {
      // App details are not stored in referral_json.en, so we don't update it here.
      // If you need to save app details, a different mechanism would be required.
      console.warn("App details tab is not saved via onTabDataUpdate");
    } else if (tabKey === 'image') {
      // Assuming image data might be stored differently or handled separately
      // For now, we'll just log a warning if it's not in referral_json.en
      if (!updatedConfig.referral_json.en[tabKey]) {
        updatedConfig.referral_json.en[tabKey] = {};
      }
      updatedConfig.referral_json.en[tabKey] = newTabData;
    } else {
      updatedConfig.referral_json.en[tabKey] = newTabData;
    }
    onConfigUpdate(updatedConfig);
  };

  const handleRefreshClick = async (tabKey: string) => {
    setRefreshingTabs(prev => ({ ...prev, [tabKey]: true }));

    try {
      await onRefreshTab(tabKey);
      setRefreshSuccess(prev => ({ ...prev, [tabKey]: true }));
      setTimeout(() => {
        setRefreshSuccess(prev => ({ ...prev, [tabKey]: false }));
      }, 2000);
    } finally {
      setRefreshingTabs(prev => ({ ...prev, [tabKey]: false }));
    }
  };

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    onResetChanges();
    setShowResetConfirm(false);
  };

  const handleCancelReset = () => {
    setShowResetConfirm(false);
  };

  if (!selectedApp) {
    return (
      <main className="admin-main">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-2xl">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Package className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Welcome to Referral Boost Console
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Manage your referral campaigns with ease. Create, configure, and optimize your referral system from one central dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-card border rounded-lg p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Multi-Platform</h3>
                <p className="text-sm text-muted-foreground">Configure referral flows for iOS, Android, and web platforms</p>
              </div>

              <div className="bg-card border rounded-lg p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-green-100 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Global Reach</h3>
                <p className="text-sm text-muted-foreground">Support multiple languages and localized content</p>
              </div>

              <div className="bg-card border rounded-lg p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Easy Setup</h3>
                <p className="text-sm text-muted-foreground">Visual editor and JSON editor for flexible configuration</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/5 to-accent/5 border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-3">Get Started</h3>
              <p className="text-muted-foreground mb-4">
                {apps.length === 0 
                  ? "Create your first app to begin configuring your referral program"
                  : "Select an app from the sidebar or create a new one to get started"
                }
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button 
                  onClick={onCreateApp} // Use the onCreateApp prop
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New App
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Handle error state
  if (configError && selectedApp) {
    return (
      <main className="admin-main">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Failed to Load Configuration</AlertTitle>
              <AlertDescription className="mt-2">
                <div className="mb-4">
                  <strong>Error:</strong> {configError.message}
                </div>
                <div className="mb-4 text-sm opacity-90">
                  <strong>App:</strong> {selectedApp.packageName} ({selectedApp.appName})
                </div>
                <Button 
                  onClick={onRetryConfig}
                  variant="outline"
                  size="sm"
                  className="bg-background text-foreground hover:bg-muted"
                  disabled={isLoadingConfig}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingConfig ? 'animate-spin' : ''}`} />
                  {isLoadingConfig ? 'Retrying...' : 'Try Again'}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </main>
    );
  }

  // Handle loading state
  if (isLoadingConfig || !currentConfig) {
    return (
      <main className="admin-main">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="h-4 bg-muted rounded w-48 mx-auto mb-2"></div>
            <div className="h-3 bg-muted rounded w-32 mx-auto"></div>
            <div className="text-sm text-muted-foreground mt-4">
              {selectedApp ? `Loading configuration for ${selectedApp.appName}...` : 'Loading...'}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const tabKeys = currentConfig?.referral_json?.en ? 
    Object.keys(currentConfig.referral_json.en) : [];

  // Define the desired tab order, including the special tabs
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

  // Get tabs from referral_json.en, excluding special tabs to avoid duplicates
  // Also exclude 'appDetails' as it conflicts with our special 'app-details' tab
  const excludedTabs = [...specialTabs, 'appDetails'];
  const configTabs = Object.keys(currentConfig.referral_json?.en || {}).filter(tab => !excludedTabs.includes(tab));

  // Get tabs in the desired order, including config tabs and special tabs
  const orderedTabs = tabOrder.filter(tab => {
    if (specialTabs.includes(tab)) {
      return true; // Always include special tabs
    }
    return configTabs.includes(tab);
  });

  const additionalTabs = configTabs.filter(tab => !tabOrder.includes(tab));
  const allTabs = [...orderedTabs, ...additionalTabs];

  return (
    <main className="admin-main">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="editor-mode-toggle">
          <Button
            variant={editorMode === 'ui' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onEditorModeChange('ui')}
            className="rounded-r-none"
          >
            <Palette className="w-4 h-4 mr-2" />
            UI Editor
          </Button>
          <Button
            variant={editorMode === 'json' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onEditorModeChange('json')}
            className="rounded-l-none"
          >
            <Code className="w-4 h-4 mr-2" />
            JSON Editor
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onLockToggle}
            className={isLocked ? 'bg-red-50 border-red-200 text-red-700' : ''}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </Button>

          {editorMode === 'json' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleValidateJson}
              className={
                validateResult?.valid === true 
                  ? 'border-green-500 text-green-600 bg-green-50' 
                  : validateResult?.valid === false 
                  ? 'border-red-500 text-red-600 bg-red-50'
                  : ''
              }
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Validate JSON
              {validateResult?.valid === true && <Check className="w-4 h-4 ml-2 text-green-600" />}
              {validateResult?.valid === false && <span className="ml-2 text-red-600">✗</span>}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Languages className="w-4 h-4 mr-2" />
                Translate
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={(e) => {
                    e.preventDefault();
                    onTranslate(lang.code);
                  }}
                  onSelect={(e) => e.preventDefault()}
                  disabled={translateStatus[lang.code] === 'completed'}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span>{lang.name} ({lang.code})</span>
                  <div className="flex items-center ml-4">
                    {translateStatus[lang.code] === 'pending' ? (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : translateStatus[lang.code] === 'completed' ? (
                      <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-sm"></div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Conditional Tabs or JSON Editor */}
      {editorMode === 'json' ? (
        // JSON Editor Mode - Show full JSON without tabs
        <div className="json-editor-container flex-1 flex flex-col">
          <TabContent
            tabKey="json-full"
            tabData={currentConfig}
            fullConfigData={currentConfig}
            selectedApp={selectedApp}
            editorMode={editorMode}
            isLocked={isLocked}
            onUpdate={onConfigUpdate}
            onTabDataUpdate={handleTabDataUpdate}
            onAppUpdate={onAppUpdate}
            validateResult={validateResult}
          />
        </div>
      ) : (
        // UI Editor Mode - Show tabs
        <div className="tabs-container">
          <Tabs value={activeTab || (allTabs.length > 0 ? allTabs[0] : '')} onValueChange={onTabChange} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-auto gap-1 bg-muted p-1 mb-4" style={{ gridTemplateColumns: `repeat(${allTabs.length}, minmax(0, auto))` }}>
              {allTabs.map((tabKey) => {
                const tabTitle = getTabTitle(tabKey);

                return (
                  <div key={tabKey} className="relative group flex items-center">
                    <TabsTrigger
                      value={tabKey}
                      className="flex items-center gap-2 text-sm pr-8"
                    >
                      <span>{tabTitle}</span>
                    </TabsTrigger>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRefreshClick(tabKey);
                      }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-background/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                    >
                      {refreshSuccess[tabKey] ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <RefreshCw 
                          className={`w-3 h-3 ${refreshingTabs[tabKey] ? 'animate-spin' : ''}`} 
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </TabsList>

            {/* Tab Contents */}
            {allTabs.map((tabKey) => {
              let tabData;
              const isAppDetailsTab = tabKey === 'app-details';
              const isImageTab = tabKey === 'image';

              if (isAppDetailsTab) {
                // For app details, pass the selected app data directly
                tabData = selectedApp;
              } else if (isImageTab) {
                // Assuming a structure for image tab data, adjust if needed
                tabData = currentConfig?.referral_json?.en?.[tabKey] || { imageUrl: '', alt: '' }; 
              } else {
                tabData = currentConfig?.referral_json?.en?.[tabKey] || {};
              }

              return (
                <TabsContent key={tabKey} value={tabKey} className="flex-1 flex flex-col">
                  <TabContent
                    tabKey={tabKey}
                    tabData={tabData}
                    fullConfigData={currentConfig}
                    selectedApp={selectedApp}
                    editorMode={editorMode}
                    isLocked={isLocked}
                    onUpdate={onConfigUpdate}
                    onTabDataUpdate={handleTabDataUpdate}
                    onAppUpdate={onAppUpdate}
                    validateResult={validateResult}
                  />
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      )}

      {/* Global Actions */}
      <div className="global-actions">
        <Button 
          onClick={onSaveConfig} 
          disabled={isLocked || isSaving}
          className="flex items-center gap-2 relative"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save</span>
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleResetClick}
          disabled={!hasChanges || isLocked}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Changes
        </Button>

        <Button
          variant="destructive"
          onClick={() => onDeleteApp(selectedApp.appId)}
          className="flex items-center gap-2"
        >
          <Trash className="w-4 h-4" />
          Delete App
        </Button>
      </div>

      {validateResult && !validateResult.valid && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground p-3 rounded-md shadow-lg max-w-md">
          <div className="font-medium">JSON Validation Error</div>
          <div className="text-sm mt-1">{validateResult.error}</div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all changes? This will revert the configuration back to the original state and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelReset}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Reset Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}