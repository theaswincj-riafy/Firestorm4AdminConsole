import { useState } from "react";
import { Lock, Unlock, CheckCircle, MoreHorizontal, Save, RotateCcw, Languages, ChevronDown, Trash, Package, Smartphone, Globe, FileText, Plus, Check, RefreshCw, Palette, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import TabContent from "./tab-content";
import type { App } from "@shared/schema";

interface MainContentProps {
  selectedApp: App | null;
  apps: App[];
  currentConfig: any;
  activeTab: string | null;
  editorMode: 'ui' | 'json';
  isLocked: boolean;
  isDirty: boolean;
  translateStatus: Record<string, 'pending' | 'completed'>;
  onTabChange: (tabKey: string) => void;
  onConfigUpdate: (config: any) => void;
  onEditorModeChange: (mode: 'ui' | 'json') => void;
  onLockToggle: () => void;
  onSaveConfig: () => void;
  onResetChanges: () => void;
  onRegenerateTab: (tabKey: string) => void;
  onTranslate: (lang: string) => void;
  onDeleteApp: (appId: string) => void;
  getTabTitle: (tabKey: string) => string;
  isRegenerating: boolean;
  isSaving: boolean;
  isTranslating: boolean;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
];

export default function MainContent({
  selectedApp,
  apps,
  currentConfig,
  activeTab,
  editorMode,
  isLocked,
  isDirty,
  translateStatus,
  onTabChange,
  onConfigUpdate,
  onEditorModeChange,
  onLockToggle,
  onSaveConfig,
  onResetChanges,
  onRegenerateTab,
  onTranslate,
  onDeleteApp,
  getTabTitle,
  isRegenerating,
  isSaving,
  isTranslating
}: MainContentProps) {
  const [validateResult, setValidateResult] = useState<{ valid: boolean; error?: string } | null>(null);

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
                Manage your referral campaigns with ease. Create, configure, and optimize your app's referral system from one central dashboard.
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
                  onClick={() => window.location.href = '#create-app'}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New App
                </Button>
                {apps.length > 0 && (
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    View Documentation
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!currentConfig) {
    return (
      <main className="admin-main">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="h-4 bg-muted rounded w-48 mx-auto mb-2"></div>
            <div className="h-3 bg-muted rounded w-32 mx-auto"></div>
          </div>
        </div>
      </main>
    );
  }

  const tabs = Object.keys(currentConfig);

  return (
    <main className="admin-main">
      {/* Toolbar */}
      <div className="content-toolbar">
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

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs-list">
          {tabs.map((tabKey) => (
            <div
              key={tabKey}
              className={`tab-item ${activeTab === tabKey ? 'active' : ''}`}
            >
              <span 
                className="tab-label"
                onClick={() => onTabChange(tabKey)}
              >
                {getTabTitle(tabKey)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="work-area">
        {activeTab && (
          <TabContent
            tabKey={activeTab}
            tabData={currentConfig[activeTab]}
            editorMode={editorMode}
            isLocked={isLocked}
            onUpdate={(newData) => {
              const newConfig = { ...currentConfig };
              newConfig[activeTab] = newData;
              onConfigUpdate(newConfig);
            }}
            validateResult={validateResult}
          />
        )}

        {/* Global Actions */}
        <div className="global-actions">
          <Button 
            onClick={onSaveConfig} 
            disabled={isLocked || isSaving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>

          <Button
            variant="outline"
            onClick={onResetChanges}
            disabled={isLocked || !isDirty}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Changes
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="w-4 h-4 mr-2" />
                More Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onDeleteApp(selectedApp.appId)}
                className="text-destructive"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete App
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {validateResult && !validateResult.valid && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground p-3 rounded-md shadow-lg max-w-md">
          <div className="font-medium">JSON Validation Error</div>
          <div className="text-sm mt-1">{validateResult.error}</div>
        </div>
      )}
    </main>
  );
}