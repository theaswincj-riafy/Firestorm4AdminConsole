import { useState } from "react";
import { Lock, Unlock, CheckCircle, MoreHorizontal, Save, RotateCcw, Languages, ChevronDown, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import TabContent from "./tab-content";
import type { App } from "@shared/schema";

interface MainContentProps {
  selectedApp: App | null;
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
  { code: 'es', name: 'Spanish' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
];

export default function MainContent({
  selectedApp,
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
      JSON.parse(JSON.stringify(currentConfig[activeTab]));
      setValidateResult({ valid: true });
      setTimeout(() => setValidateResult(null), 3000);
    } catch (error) {
      setValidateResult({ 
        valid: false, 
        error: error instanceof Error ? error.message : 'Invalid JSON' 
      });
    }
  };

  if (!selectedApp) {
    return (
      <main className="admin-main">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-medium text-muted-foreground mb-2">
              Select an app to view its configuration
            </h2>
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
        <div className="editor-toggle">
          <button
            className={`toggle-btn ${editorMode === 'ui' ? 'active' : ''}`}
            onClick={() => onEditorModeChange('ui')}
          >
            UI Editor
          </button>
          <button
            className={`toggle-btn ${editorMode === 'json' ? 'active' : ''}`}
            onClick={() => onEditorModeChange('json')}
          >
            JSON Editor
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLockToggle}
            title={isLocked ? "Unlock" : "Lock"}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </Button>

          {editorMode === 'json' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleValidateJson}
              className={validateResult?.valid ? 'border-green-500 text-green-600' : ''}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Validate JSON
              {validateResult?.valid && <span className="ml-2 text-green-600">✓</span>}
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
            <DropdownMenuContent align="end">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => onTranslate(lang.code)}
                  disabled={translateStatus[lang.code] === 'completed' || isTranslating}
                  className="flex items-center justify-between"
                >
                  <span>{lang.name}</span>
                  {translateStatus[lang.code] === 'pending' && (
                    <div className="spinner ml-2"></div>
                  )}
                  {translateStatus[lang.code] === 'completed' && (
                    <CheckCircle className="w-4 h-4 ml-2 text-green-600" />
                  )}
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
            <button
              key={tabKey}
              className={`tab-item ${activeTab === tabKey ? 'active' : ''}`}
              onClick={() => onTabChange(tabKey)}
            >
              {getTabTitle(tabKey)}
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 p-1 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onRegenerateTab(tabKey);
                }}
                disabled={isLocked || isRegenerating}
                title="Regenerate Tab"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            </button>
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
